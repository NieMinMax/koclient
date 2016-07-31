package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/syndtr/goleveldb/leveldb/util"
	"gopkg.in/mgo.v2/bson"

	"koclient/db"
	"koclient/tool"
)

var (
	tablePrefix = "table-"
)

type Table struct {
	Id        bson.ObjectId `json:"id"`
	Name      string        `json:"name"`
	Code      int           `json:"code"`
	CategId   bson.ObjectId `json:"categ_id"` // 分类
	BusyStart time.Time     `json:"busy_start"`
	BusyQty   int           `json:"busy_qty"` //就餐人数
	IsBusy    bool          `json:"is_busy"`
	Desc      string        `json:"desc"`
}

func ParseReqTable(req *http.Request, c *[]Table) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(c)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func GetAllTable() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allTable []Table
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()

	iter := thisDb.NewIterator(util.BytesPrefix([]byte(tablePrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var table Table
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&table)
		if err == nil && err != io.EOF {
			allTable = append(allTable, table)
		}
	}
	if err != nil {
		log.Println(err)
		result.Error = ""
		result.State = false
	} else {
		result.State = true
		result.Value = allTable
	}
	return
}

func SaveAllTable(allTable []Table) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// 先删除!
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(tablePrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var table Table
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&table)
		if err == nil && err != io.EOF {
			thisDb.Delete(key, nil)
		}
	}
	// 更新
	for _, one := range allTable {
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(one)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(tablePrefix+one.Id.Hex()), data.Bytes(), nil)
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

func GetTableName(tableId bson.ObjectId) (tableName string) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var t Table
	var err error
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get([]byte(tablePrefix+tableId.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&t)
	tableName = t.Name
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	return
}

func GetTableCode(tableId bson.ObjectId) (tableCode int) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var t Table
	var err error
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get([]byte(tablePrefix+tableId.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&t)
	tableCode = t.Code
	if err != nil && err != io.EOF {
		log.Println(err)
	}
	return
}

// Start 开台
func (t *Table) Start(personQty int) (result tool.Result, err error) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var originTable Table
	value, _ := thisDb.Get([]byte(tablePrefix+t.Id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originTable)
	originTable.BusyStart = time.Now()
	originTable.BusyQty = personQty
	originTable.IsBusy = true
	// 更新数据
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(originTable)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put([]byte(tablePrefix+t.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		result.State = false
		result.Error = "开台失败"
	} else {
		result.State = true
		result.Value = "开台成功"
	}
	return
}

// End 收台
func (t *Table) End() (result tool.Result, err error) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var originTable Table
	value, _ := thisDb.Get([]byte(tablePrefix+t.Id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originTable)
	originTable.BusyStart = time.Now()
	originTable.BusyQty = 0
	originTable.IsBusy = false
	// 更新数据
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(originTable)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put([]byte(tablePrefix+t.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		result.State = false
		result.Error = "收台失败"
	} else {
		result.State = true
		result.Value = "收台成功"
	}
	return
}

// Person 变更人数
func (t *Table) Person(personQty int) (result tool.Result, err error) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var originTable Table
	value, _ := thisDb.Get([]byte(tablePrefix+t.Id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originTable)
	originTable.BusyQty = personQty
	// 更新数据
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(originTable)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put([]byte(tablePrefix+t.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		result.State = false
		result.Error = "更新失败"
	} else {
		result.State = true
		result.Value = "更新成功"
	}
	return
}
