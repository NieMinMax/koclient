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
	plusKey = []byte("plus-info")
)

type Plus struct {
	PlusState         int           `json:"plus_state"`                   // 收服务费的方式
	PlusCalc          int           `json:"plus_calc"`                     // 收服务费的方式
}

func (i *Plus) ParseReq(req *http.Request) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(i)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func (p Plus) GetAll() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get(plusKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	if err != nil && err != io.EOF {
		log.Println(err)
		result.Error = "失败"
		result.State = false
		return
	}
	result.State = true
	result.Value = p
	log.Println("Get Plus...")
	return
}

func (p Plus) Save() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(p)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put(plusKey, data.Bytes(), nil)
	if err != nil {
		log.Println(err)
		result.State = false
		result.Error = "数据更新失败"
		return
	}
	result.State = true
	result.Value = "更新成功"
	return
}

func GetCompanyPlus() (p Plus, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get(plusKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	return
}
