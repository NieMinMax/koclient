package router

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"koclient/handler"
)

const (
	servePort = ":34301"
)

func Run(staticDir string) {
	r := mux.NewRouter()

	r.HandleFunc("/", handler.Main)
	r.HandleFunc("/exchange", handler.Exchange) // 隐藏的Handler!!!
	r.HandleFunc("/conf/get", handler.ReadConf)
	r.HandleFunc("/conf/save", handler.WriteConf)
	r.HandleFunc("/info/save", handler.SaveInfo)
	// 服务加收信息
	r.HandleFunc("/company/getplus", handler.GetPlus)
	r.HandleFunc("/company/saveplus", handler.SavePlus)

	r.HandleFunc("/pcateg/save", handler.SavePCateg)
	r.HandleFunc("/ptreat/save", handler.SavePTreat)
	r.HandleFunc("/product/save", handler.SaveProduct)
	r.HandleFunc("/table/save", handler.SaveTable)
	r.HandleFunc("/pay/save", handler.SavePay)

	r.HandleFunc("/pos/getall", handler.GetAllPos)
	r.HandleFunc("/pos/create", handler.CreatePos)                         // 开启新的点餐任务
	r.HandleFunc("/pos/{posId:[0-9abcdef]+}/note", handler.NotePos)        // 添加备注 ?note=?
	r.HandleFunc("/pos/{posId:[0-9abcdef]+}/check", handler.CheckPosMoney) // 获取该pos的收款数据
	r.HandleFunc("/pos/{posId:[0-9abcdef]+}/finish", handler.FinishPos)    // 关闭pos
	r.HandleFunc("/pos/online", handler.UploadOrder)                       // 上传pos及订单数据

	r.HandleFunc("/pscategs/getall", handler.GetPCateg)
	r.HandleFunc("/ptreats/getall", handler.GetPTreat)
	r.HandleFunc("/products/getall", handler.GetProduct)
	// 餐桌类别
	r.HandleFunc("/tcateg/getall", handler.GetTCateg)
	r.HandleFunc("/tcateg/save", handler.SaveTCateg)

	r.HandleFunc("/table/getall", handler.GetTable)
	r.HandleFunc("/company/getavailpay", handler.GetPay)

	// 创建订单
	r.HandleFunc("/table/{tableId:[0-9abcdef]+}/order", handler.TableOrderCreate) // 新订单
	r.HandleFunc("/table/{tableId:[0-9abcdef]+}/start", handler.StartTable)       // 开台
	r.HandleFunc("/table/{tableId:[0-9abcdef]+}/end", handler.EndTable)           // 收台
	r.HandleFunc("/table/{tableId:[0-9abcdef]+}/person", handler.PersonTable)     // 餐桌人数 ，参数qty
	r.HandleFunc("/table/{tableId:[0-9abcdef]+}/money", handler.TableMoney)       // 按餐桌收款

	r.HandleFunc("/pos/{posId:[0-9abcdef]+}/order", handler.OrderCreate)                                     // 创建订单
	r.HandleFunc("/pos/{posId:[0-9abcdef]+}/getorder", handler.OrderGet)                                     // 获取订单
	r.HandleFunc("/order/{orderId:[0-9abcdef]+}/return", handler.ReturnOrder)                                //退单
	r.HandleFunc("/order/{orderId:[0-9abcdef]+}/orderline/{lineId:[0-9abcdef]+}/cancel", handler.LineCancel) // 取消菜品，退品，接受退钱方式参数 money_type money_qty

	r.HandleFunc("/orders/get_todo", handler.GetTodo)

	// r.HandleFunc("/orders/check", handler.OrderCheckAll) //交班信息统计
	// r.HandleFunc("/orders/shift", handler.OrderShiftAll) //交班, shift_start参数

	// 打印相关
	r.HandleFunc("/conf/localprinter", handler.GetLocalPrinter)        // 获取本地打印机列表
	r.HandleFunc("/cashier/open", handler.OpenCashier)                 // 开钱箱
	r.HandleFunc("/order/print/first", handler.OrderPrintFirst)        // 订单确认，首次打印（餐桌总单与出品单）
	r.HandleFunc("/order/print/table", handler.OrderPrintTable)        // 补打餐桌总单
	r.HandleFunc("/order/print/line/done", handler.OrderPrintLineDone) // 打印上菜单
	r.HandleFunc("/order/print/receipt", handler.OrderPrintReceipt)    // 预结账单，结账单!!!

	r.HandleFunc("/order/print/return_order", handler.OrderPrintReturnOrder) // 退单
	r.HandleFunc("/order/print/return_one", handler.OrderPrintReturnOne)     // 退品

	// offline离线操作
	r.HandleFunc("/offline/main", handler.Offline)

	// 静态文件
	ServeStatic(r, staticDir)

	http.Handle("/", r)

	err := http.ListenAndServe(servePort, nil)
	if err != nil {
		log.Fatal(err)
	}
}
