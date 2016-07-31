package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SavePTreat(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i []model.PTreat
	hasParse, err := model.ParseReqPTreat(req, &i)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = model.SaveAllPTreat(i)
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetPTreat(w http.ResponseWriter, req *http.Request) {
	result, err := model.GetAllPTreat()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
