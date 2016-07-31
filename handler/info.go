package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SaveInfo(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i model.Info
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

func GetInfo(w http.ResponseWriter, req *http.Request) {
	result, err := model.Info{}.GetAll()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
