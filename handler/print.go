package handler

import (
	"log"
	"net/http"

	"koclient/model"
	"koclient/tool"
	"koprinter"
)

func GetLocalPrinter(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	allPrinters, err := koprinter.GetDriverPrinters()
	if err != nil {
		result.State = false
		result.Error = "未知错误"
	} else {
		result.State = true
		result.Value = allPrinters
	}
	tool.WriteFinal(w, result)
	return
}

// 开钱箱
func OpenCashier(w http.ResponseWriter, req *http.Request) {
	model.OpenCashier()
	var result tool.Result
	result.State = true
	result.Value = "Success"
	tool.WriteFinal(w, result)
	return
}

// 订单确认，打印餐桌总单与出品单
func OrderPrintFirst(w http.ResponseWriter, req *http.Request) {
	var o model.Order
	_, err := o.ParseReq(req) // 一次性创建完成
	if err != nil {
		log.Println(err)
	}
	o.PrintFirst()
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}

// 补打餐桌总单
func OrderPrintTable(w http.ResponseWriter, req *http.Request) {
	var o model.Order
	_, err := o.ParseReq(req) // 一次性创建完成
	if err != nil {
		log.Println(err)
	}
	o.PrintTable()
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}

// PreintPrepare
// func OrderPrintLinePrepare(w http.ResponseWriter, req *http.Request) {
// 	var l model.OrderLine
// 	_, err := o.ParseReq(req) // 一次性创建完成
// 	if err != nil {
// 		log.Println(err)
// 	}
// 	l.PrintPrepare()
// 	var result tool.Result
// 	result.State = true
// 	result.Value = "打印成功"
// 	tool.WriteFinal(w, result)
// 	return
// }

func OrderPrintLineDone(w http.ResponseWriter, req *http.Request) {
	var l model.OrderLine
	_, err := l.ParseReq(req) // 一次性创建完成
	if err != nil {
		log.Println(err)
	}
	l.PrintLineDone()
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}

// 打印单据
func OrderPrintReceipt(w http.ResponseWriter, req *http.Request) {
	var orders []model.Order
	_, err := model.ParseReqReceipt(req, &orders) // 一次性创建完成
	if err != nil {
		log.Println(err)
	}
	model.PrintReceipt(orders)
	var success bool
	for _, o := range orders {
		for _, onePay := range o.Pays {
			if onePay.PayType == "cash" || onePay.PayType == "coupon" {
				model.OpenCashier()
				success = true
				break
			}
		}
		if success {
			break
		}
	}
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}


// 退单
func OrderPrintReturnOrder(w http.ResponseWriter, req *http.Request) {
	var o model.Order
	_, err := o.ParseReq(req) 
	if err != nil {
		log.Println(err)
	}
	model.PrintReturnOrder(o)
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}


// 退品
func OrderPrintReturnOne(w http.ResponseWriter, req *http.Request) {
	var line model.OrderLine
	_, err := line.ParseReq(req) 
	if err != nil {
		log.Println(err)
	}
	model.PrintReturnOne(line)
	var result tool.Result
	result.State = true
	result.Value = "打印成功"
	tool.WriteFinal(w, result)
	return
}
