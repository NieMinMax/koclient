package model

import (
	"bytes"
	"log"
	"math"
	"strconv"
	"syscall"
	"time"
	"unicode/utf8"
	"unsafe"

	"github.com/lxn/win"

	"koprinter"
)

// 获取打印机
func GetOrderTablePrinter(o Order) (p Printer) {
	if o.TableId != "" {
		tablePrinters := GetTablePrinter()
		tableCode := GetTableCode(o.TableId)
		for _, onePrinter := range tablePrinters {
			if onePrinter.StartCode <= tableCode && onePrinter.EndCode >= tableCode {
				p = onePrinter
			}
		}
	} else {
		// 没有桌号，取第一台进行打印
		tablePrinters := GetTablePrinter()
		p = tablePrinters[0]
	}
	return
}

// 打印餐桌总单
func (o Order) PrintTable() {
	receiptPrinter := GetOrderTablePrinter(o)
	if receiptPrinter.Type == "driver" {
		DriverPrintTable(receiptPrinter, o)
		time.Sleep(1 * time.Second)
	} else {
		data := o.FormatTable()
		DoTable(receiptPrinter, *data)
	}
	return
}

// 餐桌总单
func DoTable(onePrinter Printer, data bytes.Buffer) {
	if onePrinter.Type == NetworkPrinter {
		koprinter.NetworkPrint(data, onePrinter.Port, onePrinter.IP)
	} else if onePrinter.Type == SerialPrinter {
		koprinter.SerialPrint(data, onePrinter.Port)
	} else if onePrinter.Type == ParallelPrinter {
		koprinter.ParallelPrint(data, onePrinter.Port)
	}
	return
}

// 格式化小票
func (o Order) FormatTable() (printData *bytes.Buffer) {
	companyInfo, err := GetCompanyInfo()
	if err != nil {
		log.Println(err)
	}
	printData = koprinter.StartData()
	koprinter.Center(printData)
	koprinter.LargeFont(printData)
	// 餐厅名称
	koprinter.AddText(printData, companyInfo.CompanyName)
	koprinter.LineFeed(printData)
	// 堂食等类别
	koprinter.LargeFont(printData)
	koprinter.AddText(printData, GetOrderType(o.OrderType))
	koprinter.AddText(printData, "  ")
	koprinter.LineFeed(printData)
	if o.PersonQty > 0 {
		koprinter.AddText(printData, "人数：")
		koprinter.AddText(printData, strconv.Itoa(o.PersonQty))
		koprinter.LineFeed(printData)
	}
	// 牌号
	if o.MarkNo != "" {
		koprinter.AddText(printData, "牌号: ")
		koprinter.AddText(printData, o.MarkNo)
		koprinter.LineFeed(printData)
	}
	// 餐桌
	if o.TableId != "" {
		koprinter.AddText(printData, GetTableName(o.TableId))
		koprinter.LineFeed(printData)
	}
	if o.Address.Address != "" {
		koprinter.AddText(printData, "地址:")
		koprinter.AddText(printData, o.Address.Address)
		koprinter.LineFeed(printData)
	}
	if o.Address.Tel != "" {
		koprinter.AddText(printData, "电话:")
		koprinter.AddText(printData, o.Address.Tel)
		koprinter.LineFeed(printData)
	}
	if o.Address.Name != "" {
		koprinter.AddText(printData, "联系人:")
		koprinter.AddText(printData, o.Address.Name)
		koprinter.LineFeed(printData)
	}
	koprinter.LineFeed(printData)
	if o.IsSelf {
		koprinter.AddText(printData, "自助")
	}
	koprinter.LineFeed(printData)
	// 订单
	koprinter.Left(printData)
	koprinter.DefaultFont(printData)
	koprinter.AddText(printData, "订单: ")
	koprinter.AddText(printData, o.Name)
	koprinter.LineFeed(printData)
	// 结账
	koprinter.AddText(printData, "时间: ")
	if !o.ConfirmDate.IsZero() {
		koprinter.AddText(printData, o.CreateDate.Format(printLayout))
	} else if !o.CreateDate.IsZero() {
		koprinter.AddText(printData, o.ConfirmDate.Format(printLayout))
	} else {
		koprinter.AddText(printData, time.Now().Format(printLayout))
	}

	koprinter.LineFeed(printData)
	// 打印商品
	koprinter.LineFeed(printData)
	var moneyTotal = float32(0)
	for _, oneLine := range o.Lines {
		thisPrice := oneLine.Price
		thisQty := oneLine.Qty
		thisDiscount := oneLine.Discount
		thisMoney := thisPrice * thisQty * thisDiscount / 100
		thisName := oneLine.ProductName
		// 处理做法
		if len(oneLine.Treat) > 0 {
			var allTreatString string
			for _, oneTreat := range oneLine.Treat {
				allTreatString += oneTreat
			}
			thisName += "(" + allTreatString + ")"
		}
		// 数量补白宽度
		var qtyWhiteWidth = 0
		if thisQty < 10 {
			qtyWhiteWidth = 3
		} else if thisQty < 100 {
			qtyWhiteWidth = 2
		} else {
			qtyWhiteWidth = 1
		}
		// 名称补白宽度
		nameWhiteWidth := 25
		for _, i := range []rune(thisName) {
			if koprinter.IsChinese(i) {
				nameWhiteWidth -= 2
			} else {
				nameWhiteWidth -= 1
			}
		}
		// 价格补白宽度
		priceWhiteWidth := 0
		if thisPrice < 10 {
			priceWhiteWidth = 3
		} else if thisPrice < 100 {
			priceWhiteWidth = 2
		} else if thisPrice < 1000 {
			priceWhiteWidth = 1
		} else {
			priceWhiteWidth = 1
		}
		// 金额补白宽度
		moneyWhiteWidth := 0
		if thisMoney < 10 {
			moneyWhiteWidth = 3
		} else if thisMoney < 100 {
			moneyWhiteWidth = 2
		} else if thisMoney < 1000 {
			moneyWhiteWidth = 1
		} else {
			moneyWhiteWidth = 1
		}
		moneyTotal += thisMoney
		koprinter.PlusSpace(printData, 4)
		koprinter.AddText(printData, strconv.FormatFloat(float64(thisQty), 'f', 1, 32))
		koprinter.PlusSpace(printData, qtyWhiteWidth)
		koprinter.AddText(printData, thisName)
		koprinter.PlusSpace(printData, nameWhiteWidth)
		koprinter.AddText(printData, strconv.FormatFloat(float64(thisPrice), 'f', 2, 32))
		// koprinter.AddText(printData, ".00")
		koprinter.PlusSpace(printData, priceWhiteWidth)
		koprinter.AddText(printData, strconv.FormatFloat(float64(thisMoney), 'f', 2, 32))
		// koprinter.AddText(printData, ".00")
		koprinter.PlusSpace(printData, moneyWhiteWidth)
		koprinter.LineFeed(printData)
	}
	if o.Note != "" {
		koprinter.LargeFont(printData)
		koprinter.AddText(printData, "备注:")
		koprinter.AddText(printData, o.Note)
		koprinter.DefaultFont(printData)
		koprinter.LineFeed(printData)
	}
	koprinter.LineFeed(printData)
	koprinter.AddText(printData, "合计:")
	koprinter.AddText(printData, strconv.FormatFloat(float64(moneyTotal), 'f', 2, 32))
	// koprinter.AddText(printData, ".00")
	if o.HasPay {
		koprinter.AddText(printData, "(已付)")
	} else {
		koprinter.AddText(printData, "(未付)")
	}
	// 各种支付细节
	koprinter.LineFeed(printData)
	if o.Pays != nil {
		for _, onePay := range o.Pays {
			payName := onePay.PayType
			payQty := onePay.Qty
			koprinter.AddText(printData, GetPayType(payName))
			koprinter.AddText(printData, ": ")
			if payQty < 0 {
				koprinter.AddText(printData, "退")
				koprinter.AddText(printData, strconv.FormatFloat(float64(payQty), 'f', 2, 32))
				// koprinter.AddText(printData, ".00")
			} else {
				koprinter.AddText(printData, strconv.FormatFloat(float64(payQty), 'f', 2, 32))
				// koprinter.AddText(printData, ".00")
			}
			koprinter.LineFeed(printData)
		}
	}
	// 餐厅电话等信息
	if companyInfo.CompanyTel != "" {
		koprinter.LineFeed(printData)
		koprinter.DefaultFont(printData)
		koprinter.AddText(printData, "电话:")
		koprinter.AddText(printData, companyInfo.CompanyTel)
		koprinter.LineFeed(printData)
		koprinter.LargeFont(printData)
	}
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.PaperCut(printData)
	return
}

func GenTableStartData(o Order) (printData *bytes.Buffer) {
	printData = koprinter.StartData()
	koprinter.Center(printData)
	koprinter.DefaultFont(printData)
	koprinter.AddText(printData, "###厨打###")
	koprinter.LineFeed(printData)
	koprinter.AddText(printData, "订单:")
	koprinter.AddText(printData, o.Name)
	koprinter.LineFeed(printData)
	// 堂食等类别
	koprinter.AddText(printData, GetOrderType(o.OrderType))
	koprinter.AddText(printData, "  ")
	// 餐桌
	if o.TableId != "" {
		koprinter.AddText(printData, GetTableName(o.TableId))
		koprinter.LineFeed(printData)
	}
	koprinter.LineFeed(printData)
	koprinter.AddText(printData, "------------------------------")
	koprinter.LineFeed(printData)
	koprinter.LargeFont(printData)
	return
}

func GenTableEndData(printData *bytes.Buffer, o Order) {
	if o.Note != "" {
		koprinter.LineFeed(printData)
		koprinter.LargeFont(printData)
		koprinter.AddText(printData, "备注:")
		koprinter.AddText(printData, o.Note)
		koprinter.DefaultFont(printData)
		koprinter.LineFeed(printData)
	}
	koprinter.LineFeed(printData)
	koprinter.DefaultFont(printData)
	koprinter.AddText(printData, "------------------------------")
	koprinter.LineFeed(printData)
	koprinter.AddText(printData, "时间:")
	if !o.ConfirmDate.IsZero() {
		koprinter.AddText(printData, o.CreateDate.Format(printLayout))
	} else if !o.CreateDate.IsZero() {
		koprinter.AddText(printData, o.ConfirmDate.Format(printLayout))
	} else {
		koprinter.AddText(printData, time.Now().Format(printLayout))
	}
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.PaperCut(printData)
}

// 驱动打印餐桌总单
func DriverPrintTable(p Printer, o Order) {
	printerPointWidth := float32(koprinter.PointSize) * float32(p.Width) * float32(koprinter.MmRatio)

	// 1. 打印DC
	printDC := win.CreateDC(
		nil,
		syscall.StringToUTF16Ptr(p.PrinterName),
		nil,
		nil)

	// 2. 初始化DocInfo
	var docInfo win.DOCINFO
	docInfo.CbSize = int32(unsafe.Sizeof(win.DOCINFO{}))
	docInfo.LpszDocName = syscall.StringToUTF16Ptr("点菜单")

	// 3. StartDoc
	result := win.StartDoc(printDC, &docInfo)
	if result <= 0 {
		return
	}
	//4. StartPage
	result = win.StartPage(printDC)
	if result <= 0 {
		return
	}

	// 5. 打印真实内容
	var toPrintStr string
	var toPrintLen int
	var lineHeight int32
	recWidth := int32(printerPointWidth)
	// 1) 大字体
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetLargeFont(p.Width)))
	// 2) 餐厅名称
	companyInfo, _ := GetCompanyInfo()
	companyName := companyInfo.CompanyName

	var r win.RECT = win.RECT{0, koprinter.RecTop, recWidth, 100}
	toPrintStr = companyName
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	r.Top += lineHeight
	r.Bottom += lineHeight

	// // 3) 餐桌总单
	toPrintStr = "点 菜 单"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	r.Top += lineHeight
	r.Bottom += lineHeight
	r.Left = koprinter.GetRecLeft(p.Width)

	// 4) 桌号
	tableName := GetTableName(o.TableId)
	toPrintStr = tableName
	if o.IsSelf {
		toPrintStr += " (自助订单)"
	}
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 5) 正常字体
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetNormalFont(p.Width)))

	// 6) 单号与时间
	toPrintStr = "单号: " + o.Name
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	if o.ConfirmDate.IsZero() {
		toPrintStr = "时间: " + time.Now().Format(printLayout)
	} else {
		toPrintStr = "时间: " + o.CreateDate.Format(printLayout)
	}
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 7)
	r.Left = 0
	toPrintStr = "-------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 8) 品名  数量 单价
	var productNameX = int32(printerPointWidth * float32(1) / float32(21))
	var productQtyX = int32(printerPointWidth * float32(12) / float32(21))
	var productPriceX = int32(printerPointWidth * float32(15) / float32(21))
	toPrintStr = "品名"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productNameX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = "数量"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productQtyX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = "单价"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productPriceX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 9) 循环产品行
	for _, oneLine := range o.Lines {
		r.Left = koprinter.GetRecLeft(p.Width)
		r.Top += (lineHeight * 150 / 100)
		r.Bottom += (lineHeight * 150 / 100)

		if oneLine.IsSub {
			toPrintStr = ">>> " + oneLine.ProductName
		} else {
			toPrintStr = oneLine.ProductName
		}
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productNameX

		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		toPrintStr = strconv.FormatFloat(float64(oneLine.Qty-oneLine.CancelQty-oneLine.ReturnQty), 'f', 1, 32)
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productQtyX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		toPrintStr = strconv.FormatFloat(float64(oneLine.Price), 'f', 2, 32)
		// + ".00"
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productPriceX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	}

	// 10)
	r.Left = 0
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	toPrintStr = "--------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)

	// 10...) 付款信息!!!
	var payFlag bool
	for _, onePay := range o.Pays {
		if onePay.PayType != "kocoupon" {
			payFlag = true
			break
		}
	}
	if payFlag {
		toPrintStr = "付款信息:"
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = koprinter.GetRecLeft(p.Width)
		r.Top += (lineHeight * 150 / 100)
		r.Bottom += (lineHeight * 150 / 100)
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		// 付款明细
		for _, onePay := range o.Pays {
			r.Left = koprinter.GetRecLeft(p.Width)
			r.Top += (lineHeight * 150 / 100)
			r.Bottom += (lineHeight * 150 / 100)
			toPrintStr = "  " + GetPayType(onePay.PayType) + ": " + strconv.FormatFloat(math.Floor(float64(onePay.Qty)), 'f', 2, 32)
			if onePay.IsReturn {
				toPrintStr += "(退)"
			}
			toPrintLen = utf8.RuneCountInString(toPrintStr)
			lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
		}
	}
	// 。。。

	// 11) 备注
	r.Left = koprinter.GetRecLeft(p.Width)
	r.Top += (lineHeight * 200 / 100)
	r.Bottom += (lineHeight * 150 / 100)
	toPrintStr = "备注:" + o.Note
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	r.Left = 0
	r.Top += (lineHeight * 250 / 100)
	r.Bottom += (lineHeight * 250 / 100)
	toPrintStr = "感谢您的惠顾!"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)

	r.Left = 0
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)
	toPrintStr = "电话: " + companyInfo.CompanyTel
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)

	// 空白行
	toPrintStr = "-"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Top += (lineHeight * 1 / 2)
	r.Left = 0
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 6. EndPage
	result = win.EndPage(printDC)
	if result <= 0 {
		return
	}
	// 7. EndDoc
	result = win.EndDoc(printDC)
	if result <= 0 {
		return
	}

	return
}
