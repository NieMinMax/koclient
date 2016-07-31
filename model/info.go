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
	infoKey = []byte("basic-info")
)

type Info struct {
	CompanyName    string `json:"short_name"`
	CompanyTel     string `json:"tel"`
	CompanyAddress string `json:"address"`
}

func (i *Info) ParseReq(req *http.Request) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(i)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func (i Info) GetAll() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	var info Info
	value, _ := thisDb.Get(infoKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&info)
	if err != nil && err != io.EOF {
		log.Println(err)
		result.Error = "失败"
		result.State = false
		return
	}
	result.State = true
	result.Value = i
	return
}

func (i Info) Save() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(i)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put(infoKey, data.Bytes(), nil)
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

func GetCompanyInfo() (info Info, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get(infoKey, nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&info)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	return
}
