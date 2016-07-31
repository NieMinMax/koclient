package router

import (
	"net/http"

	"github.com/gorilla/mux"
)

// ServeStatic 静态文件
func ServeStatic(router *mux.Router, staticDirectory string) {
	staticPaths := map[string]string{
		"static":                  staticDirectory + "/",
		"static/css":              staticDirectory + "/css/",
		"static/bower_components": staticDirectory + "/bower_components/",
		"static/images":           staticDirectory + "/images/",
		"static/js":               staticDirectory + "/js/",
		"static/templates":        staticDirectory + "/templates/",
	}
	for pathName, pathValue := range staticPaths {
		pathPrefix := "/" + pathName + "/"
		router.PathPrefix(pathPrefix).Handler(http.StripPrefix(pathPrefix,
			http.FileServer(http.Dir(pathValue))))
	}
	// 首页载入
	// router.PathPrefix("/").Handler(http.StripPrefix("/",	http.FileServer(http.Dir(staticDirectory+"/"))))
}

// Home
// func HomeHandler(w http.ResponseWriter, r *http.Request) {
// 	p, err := loadPage(title)
// 	if err != nil {
// 		http.Redirect(w, r, "/edit/"+title, http.StatusFound)
// 		return
// 	}
// 	renderTemplate(w, "view", p)
// }

// func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
// 	p, err := loadPage(title)
// 	if err != nil {
// 		http.Redirect(w, r, "/edit/"+title, http.StatusFound)
// 		return
// 	}
// 	renderTemplate(w, "view", p)
// }

// func AboutHandler(w http.ResponseWriter, r *http.Request) {
// 	p, err := loadPage(title)
// 	if err != nil {
// 		http.Redirect(w, r, "/edit/"+title, http.StatusFound)
// 		return
// 	}
// 	renderTemplate(w, "view", p)
// }
