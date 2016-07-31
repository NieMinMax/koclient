package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"gopkg.in/mgo.v2/bson"
	"github.com/syndtr/goleveldb/leveldb/util"

	"koclient/db"
	"koclient/tool"
)

var (
	ptreatPrefix = "ptreat-"
)

type PTreat struct {
	Id    bson.ObjectId `json:"id"`
	Name  string        `json:"name"`
	Lines []string      `json:"lines"`
}

func ParseReqPTreat(req *http.Request, p *[]PTreat) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(p)
	if err != nil && err != io.EOF{
		result = false
		return
	}
	result = true
	return
}

func GetAllPTreat() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allTreat []PTreat
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	iter := thisDb.NewIterator(util.BytesPrefix([]byte(ptreatPrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var treat PTreat
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&treat)
		allTreat = append(allTreat, treat)
	}
	if err != nil && err != io.EOF{
		log.Println(err)
		result.Error = ""
		result.State = false
	} else {
		result.State = true
		result.Value = allTreat
	}
	return
}

func SaveAllPTreat(allTreat []PTreat) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	// 先删除!
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(ptreatPrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var treat PTreat
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&treat)
		if err == nil && err != io.EOF{
			thisDb.Delete(key, nil)
		}
	}
	// 更新
	for _, oneTreat := range allTreat {
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(oneTreat)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(ptreatPrefix + oneTreat.Id.Hex()), data.Bytes(), nil)
	}

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
