package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SavePay(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var i model.AvailPay
	hasParse, err := model.ParseReqPay(req, &i)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = model.SaveAvailPay(i)
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetPay(w http.ResponseWriter, req *http.Request) {
	result, err := model.GetAvailPay()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
