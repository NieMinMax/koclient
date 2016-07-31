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

// 1. 依打印机拆分订单
func SplitToPrinter(o Order, allPrinter []Printer) (allData map[int][]OrderLine) {
	allData = make(map[int][]OrderLine)
	for _, onePrinter := range allPrinter {
		printerPlace := onePrinter.Place
		for _, oneLine := range o.Lines {
			productPlace := GetProductPlace(oneLine.ProductId)
			if printerPlace == productPlace {
				_, ok := allData[printerPlace]
				if !ok {
					allData[printerPlace] = []OrderLine{}
				}
				allData[printerPlace] = append(allData[printerPlace], oneLine)
			}
		}
	}
	return
}

// 打印出品
func (o Order) PrintCookie() {
	allPrinter := GetCookiePrinter()
	placeLine := SplitToPrinter(o, allPrinter)
	for place, lines := range placeLine {
		printer := GetPlaceCookiePrinter(place)
		if printer.Type == "driver" {
			// 是否按品切单
			if printer.IsSplit{
				for _, oneLine := range lines {
					oneLines := []OrderLine{oneLine}
					DriverPrintCookie(printer, o, oneLines)
					time.Sleep(1 * time.Second)
				}
			} else {
				DriverPrintCookie(printer, o, lines)
				time.Sleep(1 * time.Second)
			}
		} else {
			allData := FormatCookie(o, lines, place)
			DoCookie(allData, printer)
		}
	}
	return
}

// 利用也品打印机进行打印
func DoCookie(data map[int]*bytes.Buffer, onePrinter Printer) {
	if onePrinter.Type == NetworkPrinter {
		_, ok := data[onePrinter.Place]
		if ok {
			koprinter.NetworkPrint(*(data[onePrinter.Place]), onePrinter.Port, onePrinter.IP)
		}
	} else if onePrinter.Type == SerialPrinter {
		_, ok := data[onePrinter.Place]
		if ok {

			koprinter.SerialPrint(*(data[onePrinter.Place]), onePrinter.Port)
		}
	} else if onePrinter.Type == ParallelPrinter {
		_, ok := data[onePrinter.Place]
		if ok {
			koprinter.ParallelPrint(*(data[onePrinter.Place]), onePrinter.Port)
		}
	}
	return
}

func GenCookieStartData(o Order) (printData *bytes.Buffer) {
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
	// 牌号
	if o.MarkNo != "" {
		koprinter.AddText(printData, "牌号:")
		koprinter.AddText(printData, o.MarkNo)
		koprinter.LineFeed(printData)
	}
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

func GenCookieEndData(printData *bytes.Buffer, o Order) {
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

func FormatCookie(o Order, lines []OrderLine, place int) (allData map[int]*bytes.Buffer) {
	allData = make(map[int]*bytes.Buffer)
	for _, oneLine := range lines {
		_, ok := allData[place]
		if !ok {
			allData[place] = GenCookieStartData(o)
		}
		lineWidth := 0
		if oneLine.Qty < 10 {
			lineWidth = 3
		} else if oneLine.Qty < 100 {
			lineWidth = 2
		} else {
			lineWidth = 2
		}
		koprinter.AddText(allData[place], strconv.FormatFloat(float64(oneLine.Qty), 'f', 0, 32))
		koprinter.PlusSpace(allData[place], lineWidth)
		koprinter.AddText(allData[place], oneLine.ProductName)
		koprinter.AddText(allData[place], "  ")
		koprinter.DefaultFont(allData[place])
		// 处理做法
		if len(oneLine.Treat) > 0 {
			for _, oneTreat := range oneLine.Treat {
				koprinter.AddText(allData[place], oneTreat)
			}
		}
		koprinter.LargeFont(allData[place])
		koprinter.LineFeed(allData[place])
		koprinter.LineFeed(allData[place])
	}
	for key, _ := range allData {
		GenCookieEndData(allData[key], o)
	}
	return
}

// 3. 打印

// 驱动打印餐桌总单
func DriverPrintCookie(p Printer, o Order, lines []OrderLine) {
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
	// companyInfo, _ := GetCompanyInfo()
	// companyName := companyInfo.CompanyName

	var r win.RECT = win.RECT{0, koprinter.RecTop, recWidth, 1000}

	// toPrintStr = companyName
	// toPrintLen = utf8.RuneCountInString(toPrintStr)
	// lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_CENTER, nil)
	// r.Top += (lineHeight * 150 / 100)
	// r.Bottom += (lineHeight * 150 / 100)

	// 3) 餐桌总单
	toPrintStr = "厨打单"
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
	var productTreatX = int32(printerPointWidth * float32(6) / float32(21))

	toPrintStr = "数量"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productQtyX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	toPrintStr = "品名"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productNameX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	
	toPrintStr = "做法"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	r.Left = productTreatX
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

	// 9) 循环产品行
	win.SelectObject(printDC, win.HGDIOBJ(koprinter.GetLargeFont(p.Width)))
	for _, oneLine := range lines {
		r.Left = koprinter.GetRecLeft(p.Width)
		r.Top += (lineHeight * 150 / 100)
		r.Bottom += (lineHeight * 150 / 100)

		toPrintStr = strconv.FormatFloat(float64(oneLine.Qty-oneLine.CancelQty-oneLine.ReturnQty), 'f', 1, 32)
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productQtyX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		toPrintStr = oneLine.ProductName
		toPrintLen = utf8.RuneCountInString(toPrintStr)
		r.Left = productNameX
		lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

		// 作法
		var allTreatString string
		if len(oneLine.Treat) > 0 {
			for _, oneTreat := range oneLine.Treat {
				allTreatString += oneTreat
			}
			allTreatString = "(" + allTreatString + ")"
			toPrintStr = allTreatString
			toPrintLen = utf8.RuneCountInString(toPrintStr)
			r.Left = productTreatX
			r.Top += lineHeight
			r.Bottom += lineHeight
			lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)
		}
	}

	// 10)
	r.Left = koprinter.GetRecLeft(p.Width)
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)

	toPrintStr = "--------------------------------------------------------------------------------------------------------"
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_SINGLELINE, nil)

	// 11) 备注
	r.Top += (lineHeight * 150 / 100)
	r.Bottom += (lineHeight * 150 / 100)
	toPrintStr = "备注:" + o.Note
	toPrintLen = utf8.RuneCountInString(toPrintStr)
	lineHeight = win.DrawTextEx(printDC, syscall.StringToUTF16Ptr(toPrintStr), int32(toPrintLen), &r, win.DT_LEFT, nil)

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
