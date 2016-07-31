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
	pcategPrefix = "pcateg-"
)

type PCateg struct {
	Id       bson.ObjectId `json:"id"`
	Name     string        `json:"name"`
	Seq      int           `json:"seq"`
	PtreatId bson.ObjectId `json:"ptreat_id,omitempty"`
}

func ParseReqPCateg(req *http.Request, c *[]PCateg) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF{
		result = false
		return
	}
	result = true
	return
}

func GetAllPCateg() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allCateg []PCateg
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(pcategPrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var categ PCateg
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&categ)
		if err == nil && err != io.EOF{
			allCateg = append(allCateg, categ)
		}
	}
	if err != nil {
		log.Println(err)
		result.Error = ""
		result.State = false
	} else {
		result.State = true
		result.Value = allCateg
	}
	return
}

func SaveAllPCateg(allCateg []PCateg) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	// 先删除!
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(pcategPrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var categ PCateg
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&categ)
		if err == nil && err != io.EOF{
			thisDb.Delete(key, nil)
		}
	}
	// 再插入
	for _, oneCateg := range allCateg {
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(oneCateg)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(pcategPrefix + oneCateg.Id.Hex()), data.Bytes(), nil)
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
