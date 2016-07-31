package model

import (
	"bytes"
	"encoding/gob"
	"io"
	"log"
	"time"

	"gopkg.in/mgo.v2/bson"
	"github.com/syndtr/goleveldb/leveldb/util"

	"koclient/db"
	"koclient/tool"
)

const (
	weekDays = 7
)

var (
	posPrefix = "pos-"
)

type Pos struct {
	Id        bson.ObjectId `json:"id"` // 纯离线环境使用的标识
	HasFinish bool          `json:"has_finish"`
	StartDate time.Time     `json:"start_date"`
	EndDate   time.Time     `json:"end_date"`   // 结束时间
	CashStart int           `json:"cash_start"` // 开始现金数量
	CashEnd   int           `json:"cash_end"`   // 结束现金数量
	Note      string        `json:"note"`       // 备注
	Orders    []Order       `json:"orders"`     // 限解析绝对离线数据上传时使用
}

// Create，创建PoS任务
func (p *Pos) Create() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	p.Id = bson.NewObjectId()
	p.StartDate = time.Now()
	p.HasFinish = false
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
	err = thisDb.Put([]byte(posPrefix + p.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		result.State = false
		result.Error = "启动失败"
		return
	}
	result.State = true
	result.Value = p.Id
	return
}

// Write 更新数据
func (pos *Pos) Write() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// 取出原有数据
	var originPos Pos
	value, _ := thisDb.Get([]byte(posPrefix + pos.Id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originPos)
	// 进行数据转换
	if pos.HasFinish {
		originPos.HasFinish = pos.HasFinish
	}
	if &(pos.EndDate) != nil {
		originPos.EndDate = pos.EndDate
	}
	if pos.CashEnd > 0 {
		originPos.CashEnd = pos.CashEnd
	}
	if pos.Note != "" {
		originPos.Note = pos.Note
	}
	// 更新数据
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(originPos)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put([]byte(posPrefix + pos.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		result.State = false
		result.Error = "更新失败"
	} else {
		result.State = true
	}
	return
}

// Get获取全部的Session
func (pos Pos) GetAll() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allPos []Pos
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(posPrefix)), nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var pos Pos
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&pos)
		if err == nil && err != io.EOF{
			allPos = append(allPos, pos)
		}
	}
	if err != nil {
		result.Error = "未找到数据"
		result.State = true
	} else {
		result.State = true
		result.Value = allPos
	}
	return
}

// CheckMoney用于结款时显示数据，交易次数，平均金额，退款次数，退款金额，本次销售金额，现金累计，差异金额
func CheckPosMoney(posId bson.ObjectId) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	// 1. 获取公司打印信息
	companyInfo, err := GetCompanyInfo()
	// 2. 获取pos信息
	var pos Pos
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get([]byte(posPrefix + posId.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&pos)
	if err != nil && err != io.EOF{
		log.Println(err)
	}
	// 3. 获取相应订单信息
	var allOrder []Order
	iter := thisDb.NewIterator(nil, nil)
	for iter.Next() {
		// key := iter.Key()
		value := iter.Value()
		var oneOrder Order
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&oneOrder)
		if err == nil && err != io.EOF{
			if oneOrder.PosId == posId {
				allOrder = append(allOrder, oneOrder)
			}
		}
	}
	// 4. 让客户端用js处理
	result.State = true
	result.Value = map[string]interface{}{
		"company_info": companyInfo,
		"pos_info":     pos,
		"order_count":  len(allOrder),
		"orders":       allOrder,
	}
	return
}

// GetPos 获取POS信息
func GetPos(posId bson.ObjectId) (p Pos, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	value, _ := thisDb.Get([]byte(posPrefix + posId.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&p)
	return
}

// 删除Pos
func DelPos(posId bson.ObjectId) (result bool, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Delete([]byte(posPrefix + posId.Hex()), nil)
	if err == nil {
		result = true
	}
	return
}
