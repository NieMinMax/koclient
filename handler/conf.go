package handler

import (
	"net/http"

	"koclient/model"
	"koclient/tool"
)

func ReadConf(w http.ResponseWriter, req *http.Request) {
	c := model.GetConf()
	var result = tool.Result{
		State: true,
		Value: c,
	}
	tool.WriteFinal(w, result)
	return
}

func WriteConf(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var c model.Conf
	var hasParse bool
	hasParse, _ = c.ParseReq(req)
	if hasParse {
		hasSave := model.SaveConf(c)
		if hasSave {
			result.State = true
			result.Value = "保存成功"
		} else {
			result.State = false
			result.Error = "保存失败"
		}
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

// func GetLocalPrinter(w http.ResponseWriter, req *http.Request) {
// 	var result tool.Result
// 	allPrinters := []string{"a", "b", "c", "d", "e"}
// 		result.State = true
// 		result.Value = allPrinters
// 	tool.WriteFinal(w, result)
// 	return
// }
