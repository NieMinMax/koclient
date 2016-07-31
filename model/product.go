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
	productPrefix = "product-"
)

type Product struct {
	Id      bson.ObjectId `json:"id"`
	Name    string        `json:"name"`
	Code    string        `json:"code"`
	Seq     int           `json:"seq"`
	Desc    string        `json:"desc"`
	Place   int           `json:"place"`
	Price   float32       `json:"price"`
	CategId bson.ObjectId `json:"categ_id,omitempty"`
}

// 获取产品出品位
func GetProductPlace(id bson.ObjectId) (place int) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var p Product
	value, _ := thisDb.Get([]byte(productPrefix+id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	place = p.Place
	return
}

func ParseReqProduct(req *http.Request, c *[]Product) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func GetAllProduct() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allProduct []Product
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	iter := thisDb.NewIterator(util.BytesPrefix([]byte(productPrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var p Product
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
		if err == nil && err != io.EOF {
			allProduct = append(allProduct, p)
		}
	}
	if err != nil {
		log.Println(err)
		result.Error = ""
		result.State = false
	} else {
		result.State = true
		result.Value = allProduct
	}
	return
}

func SaveAllProduct(allProduct []Product) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	// 先删除!
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(productPrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var product Product
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&product)
		if err == nil {
			thisDb.Delete(key, nil)
		}
	}
	// 更新
	for _, oneProduct := range allProduct {
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(oneProduct)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(productPrefix+oneProduct.Id.Hex()), data.Bytes(), nil)
	}
	if err != nil {
		log.Println(err)
		result.State = false
		result.Error = "创建失败"
	} else {
		result.State = true
		result.Value = "创建成功"
	}
	log.Println("Update Product...")
	return
}
