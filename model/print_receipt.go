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

const (
	printLayout = "2006-01-02 15:04:05"
)

// 利用小票打印机进行打印
func DoReceipt(data bytes.Buffer) {
	onePrinter := GetReceiptPrinter()
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
func FormatReceipt(orders []Order) (printData *bytes.Buffer) {
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
	// 餐桌
	koprinter.AddText(printData, GetTableName(orders[0].TableId))
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	// 订单
	koprinter.Left(printData)
	koprinter.DefaultFont(printData)
	koprinter.LineFeed(printData)
	// 打印商品
	koprinter.LineFeed(printData)
	var moneyTotal = float32(0)
	for _, o := range orders {
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
	}
	koprinter.LineFeed(printData)
	koprinter.AddText(printData, "合计:")
	koprinter.AddText(printData, strconv.FormatFloat(float64(moneyTotal), 'f', 2, 32))
	// koprinter.AddText(printData, ".00")
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

// 驱动打印小票
func DriverPrintReceipt(p Printer, orders []Order) {
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
	docInfo.LpszDocName = syscall.StringToUTF16Ptr("Receipt")

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

	// 3) 结账单
	if orders[0].HasPay {
		toPrintStr = "结 账 单"
	} else {
		toPrintStr = "预 结 单"
	}
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	r.Top += lineHeight
	r.Bottom += lineHeight
	r.Left = koprinter.GetRecLeft(p.Width)
	// 4) 桌号
	tableName := GetTableName(orders[0].TableId)
	toPrintStr = tableName
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += lineHeight
	r.Bottom += lineHeight

	// 5) 正常字体
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetNormalFont(p.Width)))

	// 6) 单号与时间
	toPrintStr = "单号: " + orders[0].Name
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	if orders[0].ConfirmDate.IsZero() {
		toPrintStr = "时间: " + time.Now().Format(printLayout)
	} else {
		toPrintStr = "时间: " + orders[0].CreateDate.Format(printLayout)
	}
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 7)
	toPrintStr = "-------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 8) 品名  数量 单价
	var productNameX = int32(printerPointWidth * float32(1) / float32(21))
	var productQtyX = int32(printerPointWidth * float32(10) / float32(21))
	var productPriceX = int32(printerPointWidth * float32(12) / float32(21))
	var productSubX = int32(printerPointWidth * float32(17) / float32(21))

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

	toPrintStr = "小计"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productSubX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 9) 循环产品行
	var totalMoney float32
	for _, o := range orders {
		for _, oneLine := range o.Lines {
			r.Left = koprinter.GetRecLeft(p.Width)
			r.Top += (lineHeight * 150 / 100)
			r.Bottom += (lineHeight * 150 / 100)

			if oneLine.IsSub {
				toPrintStr = ">>> " + oneLine.ProductName
			} else {
				toPrintStr = oneLine.ProductName
			}
			if oneLine.Discount < 100 && oneLine.Discount > 0 {
				toPrintStr += (" (" + strconv.FormatFloat(float64(oneLine.Discount), 'f', 1, 32) + "%)")
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

			thisLineMoney := oneLine.Price * (oneLine.Qty - oneLine.CancelQty - oneLine.ReturnQty) * oneLine.Discount / 100
			totalMoney += thisLineMoney
			toPrintStr = strconv.FormatFloat(float64(thisLineMoney), 'f', 2, 32)
			//  + ".00"
			toPrintLen = utf8.RuneCountInString(toPrintStr)
			r.Left = productSubX
			lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
		}
	}

	// 10) 服务费加收

	if orders[0].PlusFee > 0 {
		plusMoney := orders[0].PlusFee
		totalMoney += plusMoney
		toPrintStr = "其它:" + strconv.FormatFloat(float64(plusMoney), 'f', 2, 32)
		// + ".00"
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = koprinter.GetRecLeft(p.Width)
		r.Top += (lineHeight * 150 / 100)
		r.Bottom += (lineHeight * 150 / 100)
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	}

	r.Left = koprinter.GetRecLeft(p.Width)
	r.Top += (lineHeight * 250 / 100)
	r.Bottom += (lineHeight * 250 / 100)

	toPrintStr = "总金额:" + strconv.FormatFloat(math.Floor(float64(totalMoney+0.5)), 'f', 2, 32)
	// + ".00"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	toPrintStr = "--------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)

	// 收款信息!
	var payFlag bool
	for _, o := range orders {
		for _, onePay := range o.Pays {
			if onePay.PayType != "kocoupon" {
				payFlag = true
				break
			}
		}
		if payFlag {
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
		for _, o := range orders {
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
	}
	// 。。。

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
	toPrintStr = "- "
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

// 打印小票
func PrintReceipt(orders []Order) {
	receiptPrinter := GetReceiptPrinter()
	if receiptPrinter.Type == "driver" {
		DriverPrintReceipt(receiptPrinter, orders)
	} else {
		data := FormatReceipt(orders)
		DoReceipt(*data)
	}
	return
}
