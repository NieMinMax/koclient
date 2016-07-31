package koprinter

import (
	"bytes"
	"log"
	"net"
)

// 是否连接
func IsNetworkOnLine(port, ip string) (online bool, err error) {
	allAddr := ip + ":" + port
	tcpAddr, err := net.ResolveTCPAddr("tcp4", allAddr)
	if err != nil {
		log.Println(err)
		return
	}
	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		return
	}
	conn.Close()
	online = true
	return
}

// 打印成功
func NetworkPrint(data bytes.Buffer, port, ip string) (success bool, err error) {
	allAddr := ip + ":" + port
	tcpAddr, err := net.ResolveTCPAddr("tcp4", allAddr)
	if err != nil {
		log.Println(err)
		return
	}
	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		return
	}
	defer conn.Close()
	_, err = conn.Write(data.Bytes())
	if err != nil {
		return
	}
	success = true
	return
}
