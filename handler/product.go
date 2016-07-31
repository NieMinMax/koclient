package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func SaveProduct(w http.ResponseWriter, req *http.Request) {
	log.Println("Update product start...")
	var result tool.Result
	var i []model.Product
	hasParse, err := model.ParseReqProduct(req, &i)
	if err != nil {
		log.Println(err)
	}
	if hasParse {
		result, err = model.SaveAllProduct(i)
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

func GetProduct(w http.ResponseWriter, req *http.Request) {
	result, err := model.GetAllProduct()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}
