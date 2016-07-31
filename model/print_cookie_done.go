package model

import (
	"bytes"
	// "log"
	"strconv"
	"syscall"
	"time"
	"unicode/utf8"
	"unsafe"

	"github.com/lxn/win"

	"koprinter"
)

// 利用小票打印机进行打印
func DoDone(onePrinter Printer, data bytes.Buffer) {
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
func (l OrderLine) FormatDone() (printData *bytes.Buffer) {
	printData = koprinter.StartData()
	koprinter.Center(printData)
	koprinter.LargeFont(printData)
	// 堂食等类别
	// 牌号
	if l.MarkNo != "" {
		koprinter.AddText(printData, "牌号: ")
		koprinter.AddText(printData, l.MarkNo)
		koprinter.LineFeed(printData)
	}
	// 餐桌
	if l.TableId != "" {
		koprinter.AddText(printData, GetTableName(l.TableId))
		koprinter.LineFeed(printData)
	}
	koprinter.LineFeed(printData)
	// 订单
	koprinter.Left(printData)
	// 打印商品
	koprinter.LineFeed(printData)
	thisQty := l.Qty
	thisName := l.ProductName
	// 处理做法
	if len(l.Treat) > 0 {
		var allTreatString string
		for _, oneTreat := range l.Treat {
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
	koprinter.PlusSpace(printData, 4)
	koprinter.AddText(printData, strconv.FormatFloat(float64(thisQty), 'f', 0, 32))
	koprinter.PlusSpace(printData, qtyWhiteWidth)
	koprinter.AddText(printData, thisName)
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.LineFeed(printData)
	koprinter.PaperCut(printData)
	return
}

// 驱动打印小票
func DriverPrintDone(p Printer, l OrderLine) {
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
	docInfo.LpszDocName = syscall.StringToUTF16Ptr("Done")
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

	var r win.RECT = win.RECT{0, koprinter.RecTop, recWidth, 1000}
	
	// 2) 上菜单
	toPrintStr = "上 菜 单"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	r.Top += (lineHeight * 1)
	r.Bottom += (lineHeight * 1)
	r.Left = koprinter.GetRecLeft(p.Width)

	// 4) 桌号
	tableName := GetTableName(l.TableId)
	toPrintStr = tableName
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 5) 正常字体
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetNormalFont(p.Width)))

	// 6) 时间
	if l.ConfirmDate.IsZero() {
		toPrintStr = "时间: " + time.Now().Format(printLayout)
	} else {
		toPrintStr = "时间: " + l.CreateDate.Format(printLayout)
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

	// 8) 品名  做法 数量
	var productNameX = int32(printerPointWidth * float32(1) / float32(21))
	var productTreatX = int32(printerPointWidth * float32(10) / float32(21))
	var productQtyX = int32(printerPointWidth * float32(15) / float32(21))

	toPrintStr = "品名"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productNameX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = "数量"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productQtyX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 9) 产品行
	r.Left = koprinter.GetRecLeft(p.Width)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	toPrintStr = l.ProductName
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productNameX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 作法
	var allTreatString string
	if len(l.Treat) > 0 {
		for _, oneTreat := range l.Treat {
			allTreatString += oneTreat
		}
		allTreatString = "(" + allTreatString + ")"
	}
	toPrintStr = allTreatString
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productTreatX
	win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = strconv.FormatFloat(float64(l.Qty-l.CancelQty-l.DoneQty), 'f', 1, 32)
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productQtyX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 打印空白行
	toPrintStr = "- "
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Top += (lineHeight * 1/2)
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

// 打印传菜
func (l OrderLine) PrintLineDone() {
	place := GetProductPlace(l.ProductId)
	printer := GetPlaceDonePrinter(place)
	if printer.Type == "driver" {
		DriverPrintDone(printer, l)
	} else {
		data := l.FormatDone()
		DoDone(printer, *data)
	}
	return
}
