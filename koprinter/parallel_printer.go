package koprinter

import (
	"bytes"
	"log"
	"os"
)

// 是否连接
func IsParallelOnLine(port string) (online bool, err error) {
	file, err := os.OpenFile(port, os.O_RDWR, 0777)
	if err != nil {
		log.Println(err)
		return
	}
	defer file.Close()
	online = true
	return
}

// 打印成功
func ParallelPrint(data bytes.Buffer, port string) (success bool, err error) {
	file, err := os.OpenFile(port, os.O_RDWR, 0777)
	if err != nil {
		log.Println(err)
		return
	}
	defer file.Close()
	_, err = file.Write(data.Bytes())
	if err != nil {
		log.Println(err)
	}
	success = true
	return
}

// You can't access I/O ports directly from an userspace program in modern
// Windows. Serial and parallel ports are supposed to be opened as special
// files using the Windows API (at least that's how it was done some years
// ago when I last tried something like that).

// The MSDN has more information on the subject:
// https://msdn.microsoft.com/en-us/library/windows/desktop/aa363196(v=vs.85).aspx

// Depending on how Go's file operations are implemented internally, you
// might have luck with os.OpenFile("LPT1", os.O_RDWR, 0666) and
// reading/writing the returned file.

