// +build windows

package koprinter

import (
	"errors"

	"syscall"
	"unsafe"

	"github.com/lxn/win"
)

const (
	CapLen  = 50
	MaxSize = 65536

	// PointSize = 200
	PointSize = 180
	MmRatio   = 0.039
	RecTop    = 0
)

func GetLargeFont(width int) (largeFont win.HFONT) {
	// 10个字
	var thisFont win.LOGFONT
	thisFont.LfWeight = 900
	if width > 65 {
		thisFont.LfHeight = 60
	} else {
		thisFont.LfHeight = 45
	}
	largeFont = win.CreateFontIndirect(&thisFont)
	return
}

func GetNormalFont(width int) (normalFont win.HFONT) {
	// 21个字
	var thisFont win.LOGFONT
	thisFont.LfWeight = 600
	if width > 65 {
		thisFont.LfHeight = 30
	} else {
		thisFont.LfHeight = 21
	}
	normalFont = win.CreateFontIndirect(&thisFont)
	return
}

func GetSmallFont(width int) (smallFont win.HFONT) {
	// 26个字
	var thisFont win.LOGFONT
	thisFont.LfWeight = 300
	if width > 65 {
		thisFont.LfHeight = 24
	} else {
		thisFont.LfHeight = 17
	}
	smallFont = win.CreateFontIndirect(&thisFont)
	return
}

// 获取左边界
func GetRecLeft(width int) (recLeft int32) {
	if width > 65 {
		recLeft = 30
	} else {
		recLeft = 21
	}
	return
}

// 是否连接
func GetDriverPrinters() (allPrinters []string, err error) {
	//1. 本地打印机
	var data [MaxSize]byte
	var neededSize, hasLen uint32
	result := win.EnumPrinters(
		win.PRINTER_ENUM_LOCAL, // 该API未能直接传[]
		nil,
		uint32(4),
		&data[0],
		uint32(MaxSize),
		&neededSize,
		&hasLen,
	)
	if result {
		mm := (*[CapLen]win.PRINTER_INFO_4)(unsafe.Pointer(&data[0]))[0:hasLen]
		for _, one := range mm {
			temp := (*[MaxSize]uint16)(unsafe.Pointer(one.PPrinterName))[:MaxSize]
			allPrinters = append(allPrinters, syscall.UTF16ToString(temp))
		}

		//2. 网络打印机
		var data2 [MaxSize]byte
		var neededSize2, hasLen2 uint32
		result2 := win.EnumPrinters(
			win.PRINTER_ENUM_NETWORK, // 该API未能直接传[]
			nil,
			uint32(4),
			&data2[0],
			uint32(MaxSize),
			&neededSize2,
			&hasLen2,
		)
		if result2 {
			mm2 := (*[CapLen]win.PRINTER_INFO_4)(unsafe.Pointer(&data2[0]))[0:hasLen2]
			for _, one := range mm2 {
				temp2 := (*[MaxSize]uint16)(unsafe.Pointer(one.PPrinterName))[:MaxSize]
				allPrinters = append(allPrinters, syscall.UTF16ToString(temp2))
			}
		}
	} else {
		err = errors.New("系统内打印机数目过多!请删除不必要的打印机再继续!")
	}
	return
}
