package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"koclient/db"
	"koclient/tool"
)

var (
	availpayKey        = []byte("basic-availpay")
)

type AvailPay struct {
	AllowCash         bool `json:"allow_cash"`
	AllowCoupon       bool `json:"allow_coupon"`
	AllowDiscount     bool `json:"allow_discount"`
	AllowNo           bool `json:"allow_no"`
	AllowOwn          bool `json:"allow_own"`
	AllowPayLast      bool `json:"allow_pay_last"`
	AllowTenpayCoupon bool `json:"allow_tenpay_coupon"`
	UseMark           bool `json:"use_mark"`
}

func ParseReqPay(req *http.Request, c *AvailPay) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF{
		result = false
		return
	}
	result = true
	return
}

func GetAvailPayData() (p AvailPay, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	value, _ := thisDb.Get(availpayKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	return
}

func GetAvailPay() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var p AvailPay
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	value, _ := thisDb.Get(availpayKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	if err != nil && err != io.EOF{
		log.Println(err)
		result.Error = ""
		result.State = false
	} else {
		result.State = true
		result.Value = p
	}
	return
}

func SaveAvailPay(p AvailPay) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(p)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put(availpayKey, data.Bytes(), nil)
	if err != nil {
		log.Println(err)
		result.State = false
		result.Error = "创建失败"
	} else {
		result.State = true
		result.Value = "创建成功"
	}
	return
}
