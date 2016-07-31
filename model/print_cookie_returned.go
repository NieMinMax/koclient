package model

import (
	// "log"
	"strconv"
	"syscall"
	"time"
	"unicode/utf8"
	"unsafe"

	"github.com/lxn/win"

	"koprinter"
)

// 打印退品到出品位
func (o Order) PrintReturnCookie() {
	allPrinter := GetCookiePrinter()
	placeLine := SplitToPrinter(o, allPrinter)
	for place, lines := range placeLine {
		printer := GetPlaceCookiePrinter(place)
		if printer.Type == "driver" {
			DriverPrintReturnCookie(printer, o, lines)
			time.Sleep(1 * time.Second)
		} 
	}
	return
}


// 退货打印到厨房
func DriverPrintReturnCookie(p Printer, o Order, lines []OrderLine) {
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
	docInfo.LpszDocName = syscall.StringToUTF16Ptr("ReturnReceipt")

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
	// companyInfo, _ := GetCompanyInfo()
	// companyName := companyInfo.CompanyName

	var r win.RECT = win.RECT{0, koprinter.RecTop, recWidth, 1000}

	// toPrintStr = companyName
	// toPrintLen = utf8.RuneCountInString(toPrintStr)
	// lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	// r.Top += (lineHeight * 150 / 100)
	// r.Bottom += (lineHeight * 150 / 100)

	// 3) 餐桌总单
	toPrintStr = "退单"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	r.Top += (lineHeight * 1)
	r.Bottom += (lineHeight * 1)
	r.Left = koprinter.GetRecLeft(p.Width)

	// 4) 桌号
	tableName := GetTableName(o.TableId)
	toPrintStr = tableName
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	r.Top += (lineHeight * 1)
	r.Bottom += (lineHeight * 1)

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
	toPrintStr = "-------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	// 8) 品名  数量 单价
	var productQtyX = int32(printerPointWidth * float32(1) / float32(21))
	var productNameX = int32(printerPointWidth * float32(3) / float32(21))

	toPrintStr = "数量"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productQtyX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = "品名"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productNameX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)


	// 9) 循环产品行
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetLargeFont(p.Width)))
	for _, oneLine := range lines {
		r.Left = koprinter.GetRecLeft(p.Width)
		r.Top += (lineHeight * 150 / 100)
		r.Bottom += (lineHeight * 150 / 100)

		toPrintStr = "-" + strconv.FormatFloat(float64(oneLine.Qty-oneLine.CancelQty-oneLine.ReturnQty), 'f', 1, 32)
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productQtyX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		toPrintStr = oneLine.ProductName
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productNameX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
	}

	// 10)
	r.Left = koprinter.GetRecLeft(p.Width)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	toPrintStr = "--------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)

	// 空白行
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



// 打印退品到出品位
func PrintReturnOneCookie(l OrderLine) {
	productPlace := GetProductPlace(l.ProductId)
	printer := GetPlaceCookiePrinter(productPlace)
	if printer.Type == "driver" {
		DriverPrintReturnOneCookie(printer, l)
		time.Sleep(1 * time.Second)
	} 
	return
}

// 打印退品到出品位
func DriverPrintReturnOneCookie(p Printer, l OrderLine) {
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
	docInfo.LpszDocName = syscall.StringToUTF16Ptr("ReturnOne")
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
	toPrintStr = "退 品"
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

	toPrintStr = "-" + strconv.FormatFloat(float64(l.Qty-l.CancelQty-l.DoneQty), 'f', 1, 32)
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


