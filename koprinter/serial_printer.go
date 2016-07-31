package koprinter

import (
	"bytes"
	"log"

	"github.com/tarm/serial"
)

// 是否连接
func IsSerialOnLine(port string) (online bool, err error) {
	c := &serial.Config{Name: port, Baud: 9600}
	_, err = serial.OpenPort(c)
	if err != nil {
		log.Println(err)
		return
	}
	online = true
	return
}

// 打印成功
func SerialPrint(data bytes.Buffer, port string) (success bool, err error) {
	c := &serial.Config{Name: port, Baud: 115200}
	s, err := serial.OpenPort(c)
	if err != nil {
		log.Println(err)
		return
	}
	_, err = s.Write(data.Bytes())
	if err != nil {
		log.Println(err)
	}
	success = true
	return
}
