package koprinter

import (
	"bytes"
	"encoding/binary"
	"unicode"

	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/transform"
)

const (
	PosZero        = 0
	PosOne         = 1
	PosTwo         = 2
	PosFour        = 4
	PosLF          = 10
	PosFF          = 12
	PosESC         = 27
	PosGS          = 29
	PosSPACE       = 16
	PosCOLON       = 58
	PosSEVENTEEN   = 17
	PosEXCLAMATION = 33
	PosLine        = 45
	PosAT          = 64
	PosM           = 66
	PosV           = 86
	Posa           = 97
	PosLINESPACE   = 51
)

func StartData() (b *bytes.Buffer) {
	b = bytes.NewBufferString("")
	return
}

func PaperCut(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(PosAT))
	binary.Write(b, binary.BigEndian, uint8(PosGS))
	binary.Write(b, binary.BigEndian, uint8(PosV))
	binary.Write(b, binary.BigEndian, uint8(PosM))
	binary.Write(b, binary.BigEndian, uint8(PosZero))
	return
}

func OpenCashierDrawer(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(PosAT))
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(112))
	binary.Write(b, binary.BigEndian, uint8(0))
	binary.Write(b, binary.BigEndian, uint8(64))
	binary.Write(b, binary.BigEndian, uint8(240))
	return
}

// 打印并回到标准模式(页模式)
func PrintBuffer(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosFF))
	return
}

// 打印并走纸一行
func LineFeed(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosLF))
	return
}

// 大字体
func LargeFont(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosGS))
	binary.Write(b, binary.BigEndian, uint8(PosEXCLAMATION))
	binary.Write(b, binary.BigEndian, uint8(PosSEVENTEEN))
	return
}

// 默认字体
func DefaultFont(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosGS))
	binary.Write(b, binary.BigEndian, uint8(PosEXCLAMATION))
	binary.Write(b, binary.BigEndian, uint8(PosZero))
	return
}

// 初始化打印机
func DefaultModel(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(PosAT))
	return
}

// 居中对齐
func Center(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(Posa))
	binary.Write(b, binary.BigEndian, uint8(PosOne))
	return
}

// 右对齐
func Right(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(Posa))
	binary.Write(b, binary.BigEndian, uint8(PosTwo))
	return
}

// 左对齐
func Left(b *bytes.Buffer) {
	binary.Write(b, binary.BigEndian, uint8(PosESC))
	binary.Write(b, binary.BigEndian, uint8(Posa))
	binary.Write(b, binary.BigEndian, uint8(PosZero))
	return
}

// 增加空格
func PlusSpace(b *bytes.Buffer, num int) {
	i := 0
	for i < num {
		AddText(b, " ")
		i += 1
	}
	return
}

// 增加一行
func PlusLine(b *bytes.Buffer, width int) {
	i := 0
	for i < width {
		binary.Write(b, binary.BigEndian, uint8(PosLine))
	}
	LineFeed(b)
	return
}

// 添加文本,由于绝大多数pos打印机仅支持gb10830编码,所以必须进行转换
func AddText(b *bytes.Buffer, str string) {
	buf := bytes.NewBufferString(str)
	r := transform.NewReader(buf, simplifiedchinese.GB18030.NewEncoder())
	b.ReadFrom(r)
}

// 判断是否中文
func IsChinese(w rune) bool {
	if unicode.Is(unicode.Scripts["Han"], w) {
		return true
	}
	return false
}
