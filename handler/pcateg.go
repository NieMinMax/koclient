package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SavePCateg(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i = []model.PCateg{}
	hasParse, err := model.ParseReqPCateg(req, &i)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = model.SaveAllPCateg(i)
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetPCateg(w http.ResponseWriter, req *http.Request) {
	result, err := model.GetAllPCateg()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
