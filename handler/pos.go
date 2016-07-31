package handler

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"
	
	"koclient/model"
	"koclient/tool"
)

func CreatePos(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	req.ParseForm()
	startMoneyStr := req.FormValue("money")
	var startMoney int
	if startMoneyStr != "" {
		startMoney, _ = strconv.Atoi(startMoneyStr)
	}
	var p model.Pos
	p.CashStart = startMoney
	p.StartDate = time.Now()
	p.HasFinish = false
	result, err = p.Create()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

func NotePos(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var posId bson.ObjectId
	posIdHex := routeVars["posId"]
	if bson.IsObjectIdHex(posIdHex){
		posId = bson.ObjectIdHex(posIdHex)
	}
	req.ParseForm()
	note := req.FormValue("note")
	p := model.Pos{}
	p.Id = posId
	p.Note = note
	result, err = p.Write()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

func GetAllPos(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	pos := &model.Pos{}
	result, err = pos.GetAll()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// CheckPosMoney 显示该Session现金，券等数量
func CheckPosMoney(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var posId bson.ObjectId
	posIdHex := routeVars["posId"]
	if bson.IsObjectIdHex(posIdHex){
		posId = bson.ObjectIdHex(posIdHex)
	}
	result, err = model.CheckPosMoney(posId)
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// FinishPos 完成交班
func FinishPos(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var posId bson.ObjectId
	posIdHex := routeVars["posId"]
	if bson.IsObjectIdHex(posIdHex){
		posId = bson.ObjectIdHex(posIdHex)
	}
	endMoneyStr := req.FormValue("money")
	var endMoney int
	if endMoneyStr != "" {
		endMoney, err = strconv.Atoi(endMoneyStr)
	}
	// 更新数据
	p := model.Pos{}
	p.Id = posId
	p.HasFinish = true
	p.EndDate = time.Now()
	p.CashEnd = endMoney
	result, err = p.Write()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
