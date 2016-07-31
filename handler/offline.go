package handler

import (
	"log"
	"net/http"
	"html/template"
)

func Offline(w http.ResponseWriter, req *http.Request) {
	t := template.New("offline_main.html").Delims("<<<", ">>>")
	t, err := t.ParseFiles("static/templates/offline_main.html")
	if err != nil {
		log.Println(err)
	}
	err = t.Execute(w, nil)
	if err != nil {
		log.Println(err)
	}
	return
}

