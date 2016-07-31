package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"koclient/db"
)

var (
	confKey = []byte("basic-conf")
)

// 打印机类别
const (
	ParallelPrinter = "parallel"
	NetworkPrinter  = "net"
	SerialPrinter   = "serial"
	DriverPrinter   = "driver"
)

type Printer struct {
	Name        string `json:"name"`
	IP          string `json:"ip"`
	Port        string `json:"port"`
	Type        string `json:"type"`         // network, parallel, serial
	Width       int    `json:"width"`        // 打印宽度
	Place       int    `json:"place"`        // 出品编号
	PrinterName string `json:"printer_name"` // 驱动打印机名称
	StartCode   int    `json:"start_code"`   // 总单出品开始编号
	EndCode     int    `json:"end_code"`     // 总单结束编号
	IsSplit     bool   `json:"is_split"`
}

type Conf struct {
	Receipt        Printer   `json:"receipt"`         // 小票打印机
	ReturnedNotify bool      `json:"returned_notify"` // 取消与退品通知厨房
	Table          []Printer `json:"table"`           // 餐桌总单
	Cookie         []Printer `json:"cookie"`          // 出品打印机
	Done           []Printer `json:"done"`            // 传菜打印机
	Download       bool      `json:"download"`        // 自动下载菜单进行打印
	ServerKey      string    `json:"server_key"`      // 下载密钥
	CompanyId      string    `json:"company_id"`
}

// 餐桌总单打印机
func GetTablePrinter() (allPrinters []Printer) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	allPrinters = c.Table
	return
}

// 获取出品打印机
func GetCookiePrinter() (allPrinters []Printer) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	allPrinters = c.Cookie
	return
}

// 获取传菜打印机
func GetDonePrinter() (allPrinters []Printer) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	allPrinters = c.Done
	return
}

// 获取指定位置的传菜打印机
func GetPlaceDonePrinter(place int) (p Printer) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	allPrinters := c.Done
	for _, onePrinter := range allPrinters {
		if onePrinter.Place == place {
			p = onePrinter
			return
		}
	}
	return
}

// 获取指定位置的出品打印机
func GetPlaceCookiePrinter(place int) (p Printer) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	allPrinters := c.Cookie
	for _, onePrinter := range allPrinters {
		if onePrinter.Place == place {
			p = onePrinter
			return
		}
	}
	return
}

// 获取小票打印机
func GetReceiptPrinter() (p Printer) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	p = c.Receipt
	return
}

// 获取钱箱打印机
func GetCashierPrinter() (p Printer) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	p = c.Receipt
	return
}

func (c *Conf) ParseReq(req *http.Request) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}


func GetReturnNotify()(isNotify bool){
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var c Conf
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil {
		log.Println(err)
	}
	isNotify = c.ReturnedNotify
	return
}

func GetConf() (c Conf) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get(confKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&c)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	return
}

func SaveConf(c Conf) bool {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(c)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put(confKey, data.Bytes(), nil)
	if err != nil {
		return false
	}
	return true
}
