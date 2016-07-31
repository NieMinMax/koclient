package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/syndtr/goleveldb/leveldb/util"
	"gopkg.in/mgo.v2/bson"

	"koclient/db"
	"koclient/tool"
)

var (
	tcategPrefix = "tcateg-"
)

type TableCateg struct {
	Id   bson.ObjectId `json:"id" bson:"_id"`
	Name string        `json:"name" bson:"name"`
	Seq  int           `json:"seq" bson:"seq"` //序号
}

func ParseReqTableCateg(req *http.Request, c *[]TableCateg) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func GetAllTableCateg() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allCateg []TableCateg
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(tcategPrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var categ TableCateg
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&categ)
		if err == nil && err != io.EOF {
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

func SaveAllTableCateg(allCateg []TableCateg) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// 先删除!
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(tcategPrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var categ TableCateg
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&categ)
		if err == nil && err != io.EOF {
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
		err = thisDb.Put([]byte(tcategPrefix+oneCateg.Id.Hex()), data.Bytes(), nil)
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
