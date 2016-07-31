package tool

import (
	"encoding/json"
	"net/http"

	"gopkg.in/mgo.v2/bson"
)

type Name struct {
	Id   bson.ObjectId `json:"id"`
	Name string        `json:"name"`
}

type Result struct {
	State bool        `json:"state"`
	Error string      `json:"error"`
	Value interface{} `json:"value"`
}

type Status struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// WriteFinal将结果变成JSON格式并返回
func WriteFinal(w http.ResponseWriter, result Result) {
	w.Header().Set("Content-Type", "application/json")
	finalResult, finalerr := json.Marshal(result)
	if finalerr != nil {
		http.Error(w, finalerr.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(finalResult)
	return
}
