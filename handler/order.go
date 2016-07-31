package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"

	"koclient/model"
	"koclient/tool"
	"koclient/upload"
)

// OrderCreateHandler点餐台点餐创建订单
func OrderCreate(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	routeVars := mux.Vars(req)
	var posId bson.ObjectId
	posIdHex := routeVars["posId"]
	if bson.IsObjectIdHex(posIdHex) {
		posId = bson.ObjectIdHex(posIdHex)
	}
	var o model.Order
	o.PosId = posId
	canDo, err := o.ParseReq(req)
	if err != nil {
		log.Println(err)
	}
	if canDo {
		o.PreparePosOrderData()
		result, err = o.Create()
		if err != nil {
			log.Println(err)
		}
	} else {
		result.State = false
		result.Error = "数据错误，请刷新后重试！"
	}
	tool.WriteFinal(w, result)
	return
}

func OrderGet(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var posId bson.ObjectId
	posIdHex := routeVars["posId"]
	if bson.IsObjectIdHex(posIdHex) {
		posId = bson.ObjectIdHex(posIdHex)
	}
	result, err = model.GetPosOrder(posId)
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// ReturnOrderHandler 订单已确认，但顾客不满意，进行退单
func ReturnOrder(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var orderId bson.ObjectId
	orderIdHex := routeVars["orderId"]
	if bson.IsObjectIdHex(orderIdHex) {
		orderId = bson.ObjectIdHex(orderIdHex)
	}
	o := model.Order{}
	o.Id = orderId
	result, err = o.ReturnOrder()
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// LineCancelHandler 取消该菜，退品，接受退钱方式参数
func LineCancel(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	routeVars := mux.Vars(req)
	var orderId, lineId bson.ObjectId
	orderIdHex := routeVars["orderId"]
	if bson.IsObjectIdHex(orderIdHex) {
		orderId = bson.ObjectIdHex(orderIdHex)
	}
	lineIdHex := routeVars["lineId"]
	if bson.IsObjectIdHex(lineIdHex) {
		lineId = bson.ObjectIdHex(lineIdHex)
	}
	var payType, payName string
	var payQty, productQty float64
	if req.FormValue("money_type") != "" {
		payType = req.FormValue("money_type")
	}
	if req.FormValue("money_name") != "" {
		payName = req.FormValue("money_name")
	}
	if req.FormValue("product_qty") != "" {
		productQty, err = strconv.ParseFloat(req.FormValue("product_qty"), 32)
		if err != nil || productQty <= 0 {
			result.State = false
			result.Error = "产品数量错误，无法进行处理"
			tool.WriteFinal(w, result)
			return
		}
	}
	if req.FormValue("money_qty") != "" {
		payQty, err = strconv.ParseFloat(req.FormValue("money_qty"), 32)
		if err != nil {
			result.State = false
			result.Error = "退款金额错误，无法进行处理"
			tool.WriteFinal(w, result)
			return
		}
	}
	// 处理订单
	order := &model.Order{}
	result, err = order.LineCancel(orderId, lineId, payType, payName, float32(payQty), float32(productQty))
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// 离线订单上传
func UploadOrder(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	// 1. 把参数解析出来
	if req.FormValue("company") == "" || req.FormValue("user") == "" || req.FormValue("password") == "" || req.FormValue("session_id") == "" {
		result.State = false
		result.Error = "数据解析错误！"
		tool.WriteFinal(w, result)
		return
	}
	// 2. 获取 pos信息
	var posId bson.ObjectId
	posIdHex := req.FormValue("session_id")
	if bson.IsObjectIdHex(posIdHex) {
		posId = bson.ObjectIdHex(posIdHex)
	}
	posInfo, err := model.GetPos(posId)
	if err != nil {
		log.Println(err)
	}
	// 3. 获取订单信息
	orderResult, err := model.GetPosOrder(posId)
	if err != nil {
		log.Println(err)
	}
	var allOrders []model.Order
	if orderResult.State {
		allOrders = orderResult.Value.([]model.Order)
	}
	posInfo.Orders = allOrders
	company := req.FormValue("company")
	user := req.FormValue("user")
	password := req.FormValue("password")
	result, err = upload.Do(company, user, password, posInfo)
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

// GetAllHandler
func GetTodo(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var err error
	var timeStartStr string
	if req.FormValue("last_time") != "" {
		timeStartStr = req.FormValue("last_time")
	}
	result, err = model.GetTodo(timeStartStr)
	if err != nil {
		log.Println(err)
	}
	tool.WriteFinal(w, result)
	return
}

func TableOrderCreate(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	var o model.Order
	canDo, err := o.ParseReq(req)
	if err != nil {
		log.Println(err)
	}
	if canDo {
		o.PreparePosOrderData()
		result, err = o.Create()
		if err != nil {
			log.Println(err)
		}
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}

// CheckAllHandler 订单中心交班
// func OrderCheckAll(w http.ResponseWriter, req *http.Request) {
// 	var result tool.Result
// 	result, err = CheckAll()
// 	if err != nil {
// 		log.Println(err)
// 	}
// 	tool.WriteFinal(w, result)
// 	return
// }

// // ShiftAllHandler交班
// func OrderShiftAll(w http.ResponseWriter, req *http.Request) {
// 	var result tool.Result
// 	var uid bson.ObjectId
// 	var timeEndStr string
// 	if req.FormValue("shift_end") != "" {
// 		timeEndStr = req.FormValue("shift_end")
// 	}
// 	managerName := req.FormValue("manager_name")
// 	managerPwd := req.FormValue("manager_password")
// 	result, err = ShiftAll(timeEndStr, managerName, managerPwd)
// 	if err != nil {
// 		log.Println(err)
// 	}
// 	tool.WriteFinal(w, result)
// 	return
// }

// TableMoney 收款
func TableMoney(w http.ResponseWriter, req *http.Request) {
	var result tool.Result
	routeVars := mux.Vars(req)
	tableIdHex := routeVars["tableId"]
	if bson.IsObjectIdHex(tableIdHex) {
		tableId := bson.ObjectIdHex(tableIdHex)
		// 收款金额
		cashStr := req.FormValue("cash")
		couponStr := req.FormValue("coupon")
		tenpaycouponStr := req.FormValue("tenpay_coupon")
		plusStr := req.FormValue("plus")
		discountStr := req.FormValue("discount")
		var cash, coupon, tenpaycoupon, plus, discount float64
		if cashStr != "" {
			cash, _ = strconv.ParseFloat(cashStr, 32)
		}
		if couponStr != "" {
			coupon, _ = strconv.ParseFloat(couponStr, 32)
		}
		if tenpaycouponStr != "" {
			tenpaycoupon, _ = strconv.ParseFloat(tenpaycouponStr, 32)
		}
		// 服务费
		if plusStr != "" {
			plus, _ = strconv.ParseFloat(plusStr, 32)
		}
		// 折扣
		if discountStr != "" {
			discount, _ = strconv.ParseFloat(discountStr, 32)
		}
		log.Println("plus", plus)
		log.Println("discount", discount)
		log.Println("cash", cash)
		log.Println("coupon", coupon)
		log.Println("tenpayCoupon", tenpaycoupon)
		log.Println("========================")

		var p model.Order
		// 获取该餐台未付款订单
		result, _ = p.TableMoney(tableId, float32(cash), float32(coupon), float32(tenpaycoupon), float32(plus), float32(discount))
	} else {
		result.State = false
		result.Error = "数据解析错误！"
	}
	tool.WriteFinal(w, result)
	return
}
