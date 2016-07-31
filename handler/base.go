package handler

import (
	"log"
	"net/http"
	"html/template"
)

func Main(w http.ResponseWriter, req *http.Request) {
	t := template.New("main.html").Delims("<<<", ">>>")
	t, err := t.ParseFiles("static/templates/main.html")
	if err != nil {
		log.Println(err)
	}
	err = t.Execute(w, nil)
	if err != nil {
		log.Println(err)
	}
	return
}


func Exchange(w http.ResponseWriter, req *http.Request) {
	t := template.New("exchange.html").Delims("<<<", ">>>")
	t, err := t.ParseFiles("static/templates/exchange.html")
	if err != nil {
		log.Println(err)
	}
	err = t.Execute(w, nil)
	if err != nil {
		log.Println(err)
	}
	return
}
