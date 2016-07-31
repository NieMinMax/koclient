package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SavePlus(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i model.Plus

	log.Println("Save Plus")
	hasParse, err := i.ParseReq(req)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = i.Save()
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetPlus(w http.ResponseWriter, req *http.Request) {
	result, err := model.Plus{}.GetAll()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
