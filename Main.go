//go:generate goversioninfo -icon=kocrm.ico
package main

import (
	"cef"
	"wingui"

	"log"
	"os"
	// "os/exec"
	// "runtime"
	"syscall"
	"time"

	"koclient/db"
	"koclient/download"
	"koclient/router"
)

const (
	staticDir = "./static"
)

// const (
// 	Darwin  = "darwin"
// 	Linux   = "linux"
// 	Windows = "windows"
// )

// func openBrowser() {
// 	var cmd *exec.Cmd
// 	if runtime.GOOS == Windows {
// 		cmd = exec.Command("cmd", "/c start http://127.0.0.1:34301")
// 	} else if runtime.GOOS == Linux {
// 		cmd = exec.Command("x-www-browser", "http://127.0.0.1:34301")
// 	} else if runtime.GOOS == Darwin {
// 		cmd = exec.Command("open", "http://127.0.0.1:34301")
// 	} else {
// 		log.Println("未知操作系统,请手动打开浏览器,并访问 http://127.0.0.1:34301")
// 	}
// 	err := cmd.Run()
// 	if err != nil {
// 		log.Println(err)
// 	}
// 	return
// }

func main() {
	hInstance, err := wingui.GetModuleHandle(nil)
	if err != nil {
		wingui.AbortErrNo("GetModuleHandle", err)
	}
	cef.ExecuteProcess(hInstance)
	settings := cef.Settings{}
	settings.CachePath = "webcache"                // Set to empty to disable
	settings.LogSeverity = cef.LOGSEVERITY_DEFAULT // LOGSEVERITY_VERBOSE
	cef.Initialize(settings)
	wndproc := syscall.NewCallback(WndProc)
	hwnd := wingui.CreateWindow("客多点", wndproc)
	browserSettings := cef.BrowserSettings{}
	url := "http://127.0.0.1:34301/"
	cef.CreateBrowser(hwnd, browserSettings, url)
	time.AfterFunc(time.Millisecond*100, func() {
		cef.WindowResized(hwnd)
	})
	thisDb, err := db.GetDb()
	if err != nil {
		log.Fatal(err)
	}
	defer thisDb.Close()
	
	go download.Start()
	go router.Run(staticDir)

	cef.RunMessageLoop()
	cef.Shutdown()

	os.Exit(0)
}

func WndProc(hwnd syscall.Handle, msg uint32, wparam, lparam uintptr) (rc uintptr) {
	switch msg {
	case wingui.WM_CREATE:
		rc = wingui.DefWindowProc(hwnd, msg, wparam, lparam)
	case wingui.WM_SIZE:
		cef.WindowResized(hwnd)
	case wingui.WM_CLOSE:
		wingui.DestroyWindow(hwnd)
	case wingui.WM_DESTROY:
		cef.QuitMessageLoop()
	default:
		rc = wingui.DefWindowProc(hwnd, msg, wparam, lparam)
	}
	return
}
