package model

import (
	"bytes"
	"log"
	"syscall"
	"unsafe"

	"github.com/lxn/win"

	"koprinter"
)

// 开钱箱
func OpenCashier() {
	printData := koprinter.StartData()
	koprinter.OpenCashierDrawer(printData)
	// koprinter.AddText(printData, "测试数据:")
	// koprinter.LineFeed(printData)
	// koprinter.PaperCut(printData)
	DoCashier(*printData)
	return
}

// 利用小票打印机进行打印
func DoCashier(data bytes.Buffer) {
	onePrinter := GetCashierPrinter()
	// 直接的方式，但暂未找到支持USB接口的方式，帮注释!
	// if onePrinter.Type == NetworkPrinter {
	// 	koprinter.NetworkPrint(data, onePrinter.Port, onePrinter.IP)
	// } else if onePrinter.Type == SerialPrinter {
	// 	koprinter.SerialPrint(data, onePrinter.Port)
	// } else if onePrinter.Type == ParallelPrinter {
	// 	koprinter.ParallelPrint(data, onePrinter.Port)
	// }

	// 1. 获取打印机handler
	libwinspool, err := syscall.LoadLibrary("Winspool.drv")
	if err != nil {
		log.Println(err)
	}
	defer syscall.FreeLibrary(libwinspool)
	openPrinter, err := syscall.GetProcAddress(libwinspool, "OpenPrinterW")
	if err != nil {
		log.Println(err)
	}
	var ph syscall.Handle
	pName, err := syscall.UTF16PtrFromString(onePrinter.PrinterName)
	if err != nil {
		log.Println(err)
	}
	isSuccess, _, _ := syscall.Syscall6(
		uintptr(openPrinter),
		3,
		uintptr(unsafe.Pointer(pName)),
		uintptr(unsafe.Pointer(&ph)),
		uintptr(unsafe.Pointer(nil)),
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("获取打印机失败")
	}
	// 2. 开始准备打印
	startDocPrinter, err := syscall.GetProcAddress(libwinspool, "StartDocPrinterW")
	if err != nil {
		log.Println(err)
	}
	var docInfo win.DOCINFO
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(startDocPrinter),
		3,
		uintptr(unsafe.Pointer(ph)),
		1, 
		uintptr(unsafe.Pointer(&docInfo)),
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("开启打印机失败")
	}
	// 开始准备页，无必要
	startPagePrinter, err := syscall.GetProcAddress(libwinspool, "StartPagePrinter")
	if err != nil {
		log.Println(err)
	}
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(startPagePrinter),
		1,
		uintptr(unsafe.Pointer(ph)),
		0, 
		0,
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("开启打印机失败")
	}
	// 打印
	writePrinter, err := syscall.GetProcAddress(libwinspool, "WritePrinter")
	if err != nil {
		log.Println(err)
	}
	var hasPrintLen int
	toPrintSlice := data.Bytes()
	toPrintLen := data.Len()
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(writePrinter),
		4,
		uintptr(unsafe.Pointer(ph)),
		uintptr(unsafe.Pointer(&toPrintSlice[0])),
		uintptr(toPrintLen),
		uintptr(unsafe.Pointer(&hasPrintLen)),
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("打印失败")
	}
	// 结束打印页，无必要
	endPagePrinter, err := syscall.GetProcAddress(libwinspool, "EndPagePrinter")
	if err != nil {
		log.Println(err)
	}
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(endPagePrinter),
		1,
		uintptr(unsafe.Pointer(ph)),
		0, 
		0,
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("结束打印页失败")
	}
	// 结束打印
	endDocPrinter, err := syscall.GetProcAddress(libwinspool, "EndDocPrinter")
	if err != nil {
		log.Println(err)
	}
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(endDocPrinter),
		1,
		uintptr(unsafe.Pointer(ph)),
		0, 
		0,
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("结束打印失败")
	}
	// 3. 关闭打印机
	closePrinter, err := syscall.GetProcAddress(libwinspool, "ClosePrinter")
	if err != nil {
		log.Println(err)
	}
	isSuccess, _, _ = syscall.Syscall6(
		uintptr(closePrinter),
		1,
		uintptr(unsafe.Pointer(ph)),
		0, 
		0,
		0,
		0,
		0,
	)
	if isSuccess == 0 {
		log.Println("关闭打印失败")
	}
	return
}
