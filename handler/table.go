package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"

	"koclient/model"
	"koclient/tool"
)

func SaveTable(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i []model.Table
	hasParse, err := model.ParseReqTable(req, &i)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = model.SaveAllTable(i)
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetTable(w http.ResponseWriter, req *http.Request) {
	result, err := model.GetAllTable()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// 开台
func StartTable(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	tableIdHex := routeVars["tableId"]
	if bson.IsObjectIdHex(tableIdHex) {
		tableId := bson.ObjectIdHex(tableIdHex)
		// 人数
		personQty, _ := strconv.Atoi(req.FormValue("person_qty"))
		var t model.Table
		t.Id = tableId
		result, err = t.Start(personQty)
		if err != nil {
			log.Println(err)
		}
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

// 收台
func EndTable(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	tableIdHex := routeVars["tableId"]
	if bson.IsObjectIdHex(tableIdHex) {
		tableId := bson.ObjectIdHex(tableIdHex)
		var t model.Table
		t.Id = tableId
		result, err = t.End()
		if err != nil {
			log.Println(err)
		}
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func PersonTable(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	tableIdHex := routeVars["tableId"]
	if bson.IsObjectIdHex(tableIdHex) {
		tableId := bson.ObjectIdHex(tableIdHex)
		personQty, _ := strconv.Atoi(req.FormValue("qty"))
		var t model.Table
		t.Id = tableId
		result, err = t.Person(personQty)
		if err != nil {
			log.Println(err)
		}
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}
