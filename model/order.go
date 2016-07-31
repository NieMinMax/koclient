package model

import (
	"bytes"
	"encoding/gob"
	"encoding/json"
	"io"
	// "io/ioutil"
	// "fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/syndtr/goleveldb/leveldb/util"
	"gopkg.in/mgo.v2/bson"

	"koclient/db"
	"koclient/tool"
)

const (
	layout = "20060102150405"
)

var (
	orderPrefix = "order-"
)

const (
	// 订单状态
	StateConfirm = "confirm"
	StateTodo    = "todo"
	StateCancel  = "cancel"

	// 订单类型
	TypeIn    = "in"
	TypeOut   = "out"
	TypeWaste = "waste"
	TypeRenew = "renew"
	TypeInOut = "in_out"
	TypeMyeat = "myeat"
	TypeOther = "other"
)

var OrderType = []tool.Status{
	{"堂食", "in"},
	{"外卖", "out"},
	{"丢弃", "waste"},
	{"补单", "renew"}, // 补单，方便结账
	{"外带", "in_out"},
	{"自用", "myeat"}, // myeat其实也是支付方式
	{"其它", "other"},
}

var OrderStates = []tool.Status{
	{"微信待付款单", "pre_tenpay"},
	{"顾客自助下单", "todo"},
	{"已审核", "confirm"},
	{"已取消", "cancel"},   // 未付款自助订单，审核不通过
	{"已退单", "returned"}, // 吃完不满意，退钱
}

type AddressInfo struct {
	Tel     string `json:"tel"`
	Address string `json:"address"`
	Name    string `json:"name"`
	Note    string `json:"note"`
}

type OrderLine struct {
	LineId      bson.ObjectId `json:"line_id,omitempty"`
	ProductName string        `json:"name"`
	ProductId   bson.ObjectId `json:"id,omitempty"`
	Price       float32       `json:"price"`
	Qty         float32       `json:"qty"`
	Discount    float32       `json:"discount"`
	Treat       []string      `json:"treat"`
	Note        string        `json:"note"`
	CancelQty   float32       `json:"cancel_qty"`
	ReturnQty   float32       `json:"return_qty"`
	PrepareQty  float32       `json:"prepare_qty"`
	DoneQty     float32       `json:"done_qty"`     // 出品数量
	CreateDate  time.Time     `json:"create_date"`  // 明细行创建时间
	ConfirmDate time.Time     `json:"confirm_date"` // 订单确认时间
	OrderId     bson.ObjectId `json:"order_id,omitempty"`
	TableId     bson.ObjectId `json:"table_id,omitempty"`
	MarkNo      string        `json:"mark_no"`
	IsGroup     bool          `json:"is_group" bson:"is_group"` // 是否组合品
	IsSub       bool          `json:"is_sub" bson:"is_sub"`     // 是否组合品
}

// 付款记录
type OrderPay struct {
	Id         bson.ObjectId `json:"id,omitempty"`
	PayType    string        `json:"pay_type"`
	IsReturn   bool          `json:"is_return"`
	Name       string        `json:"name"`
	Qty        float32       `json:"qty"`
	VQty       float32       `json:"v_qty"`
	Note       string        `json:"note"`
	CreateDate time.Time     `json:"create_date"`
	CreateId   bson.ObjectId `json:"create_id,omitempty"`
	OrderName  string        `json:"order_name"`
}

type Order struct {
	Id          bson.ObjectId `json:"id,omitempty"`
	PreorderId  bson.ObjectId `json:"preorder_id,omitempty"` // 前置订单，用于补单的源头!
	Name        string        `json:"name"`                  // 订单编号
	OfflineName string        `json:"offline_name"`          // 纯离线环境使用的订单标识
	CreateDate  time.Time     `json:"create_date"`
	ConfirmDate time.Time     `json:"confirm_date"` // 订单确认时间
	MarkNo      string        `json:"mark_no"`      // 牌号
	TableId     bson.ObjectId `json:"table_id,omitempty"`
	Lines       []OrderLine   `json:"lines"`
	State       string        `json:"state"`            // 订单状态
	OrderType   string        `json:"order_type" `      // 订单类型，堂食，外卖，补单
	Ref         string        `json:"ref"`              // 引用其它关联订单号
	HasPay      bool          `json:"has_pay"`          // 付款状态
	PlusFee     float32       `json:"plus_fee"`         // 服务费加收
	MoneyPay    float32       `json:"money_pay"`        //实收总金额，不含券，该字段的存在是由于因史原因
	PersonQty   int           `json:"person_qty"`       // 用餐人数
	Pays        []OrderPay    `json:"pays"`             // 付款记录
	Note        string        `json:"note"`             // 原因，备注
	Address     AddressInfo   `json:"address" db:"-"`   // 外卖收货信息 ==> 1对1
	PosId       bson.ObjectId `json:"pos_id,omitempty"` // 哪一个POS任务发起
	HasReturn   bool          `json:"has_return"`       // 已退单
	IsSelf      bool          `json:"is_self"`          // 自助订单
	// ToId        bson.ObjectId `json:"to_id"`          // 解析打印指定订单行所需
	HasShift bool `json:"has_shift"` // 是否已交班
	HasDone  bool `json:"has_done"`  // 已收桌
}

func (o *Order) ParseReq(req *http.Request) (result bool, err error) {
	// body,_ := ioutil.ReadAll(req.Body)
	// fmt.Println(string(body))
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(o)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func ParseReqReceipt(req *http.Request, o *[]Order) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(o)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

func (l *OrderLine) ParseReq(req *http.Request) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(l)
	if err != nil && err != io.EOF {
		result = false
		return
	}
	result = true
	return
}

// 订单编号生成方式，待优化
func GenName() string {
	// 以时间为种子生成随机数
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	randStr := ""
	for i := 0; i < 5; i++ {
		randStr += strconv.Itoa(r.Intn(10))
	}
	return time.Now().Format(layout) + randStr
}

// PreparePosOrderData准备由pos session提交的订单数据
func (o *Order) PreparePosOrderData() {
	o.Id = bson.NewObjectId()
	o.Name = GenName()
	o.CreateDate = time.Now()
	o.State = StateConfirm
	o.ConfirmDate = time.Now()
	return
}

// OrderLineRemove去掉订单中数量<=0的订单行
func (p *Order) OrderLineRemove() {
	newLine := []OrderLine{}
	for _, line := range p.Lines {
		if line.Qty > 0 {
			newLine = append(newLine, line)
		}
	}
	p.Lines = newLine
	return
}

// Create，校验数据并创建新的订单
func (o *Order) Create() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	// 需要提前准备好订单状态
	if o.State == "" {
		result.State = false
		result.Error = "订单状态未知，无法提交订单"
		return
	}
	// 订单类型不允许为空
	if o.OrderType == "" {
		result.State = false
		result.Error = "订单类型未知，无法提交订单"
		return
	}
	o.OrderLineRemove()
	if len(o.Lines) == 0 {
		result.State = false
		result.Error = "对不起，不能提交没有明细的订单"
		return
	}
	// 订单基础数据准备
	o.Id = bson.NewObjectId()
	o.Name = GenName()
	o.CreateDate = time.Now()
	// 计算整单金额
	var orderMoney float32
	for i, _ := range o.Lines {
		o.Lines[i].LineId = bson.NewObjectId()
		o.Lines[i].CreateDate = time.Now()
		// 如果折扣没有设值，将设为100
		if o.Lines[i].Discount == 0 {
			o.Lines[i].Discount = 100
		}
		thisLineMoney := o.Lines[i].Qty * o.Lines[i].Price * o.Lines[i].Discount / 100
		orderMoney += thisLineMoney
	}
	// 支付信息验证
	availPays, _ := GetAvailPayData()
	if o.Pays == nil {
		// 外卖订单可以允许后支付
		if o.OrderType != TypeOut {
			if !availPays.AllowPayLast {
				result.State = false
				result.Error = "未设置允许先用餐后支付"
				return
			}
		}
	} else {
		o.HasPay = true
	}
	o.MoneyPay = 0
	var allPay float32
	for j, _ := range o.Pays {
		o.Pays[j].Id = bson.NewObjectId()
		o.Pays[j].CreateDate = time.Now()
		allPay += o.Pays[j].Qty
		if o.Pays[j].PayType == "cash" {
			if !availPays.AllowCash {
				result.State = false
				result.Error = "未设置允许现金支付"
				return
			}
			o.MoneyPay += o.Pays[j].Qty
		}
		if o.Pays[j].PayType == "own" {
			if !availPays.AllowOwn {
				result.State = false
				result.Error = "未设置允许签单支付"
				return
			}
		}
		if o.Pays[j].PayType == "coupon" {
			if !availPays.AllowCoupon {
				result.State = false
				result.Error = "未设置允许抵用券支付"
				return
			}
		}
		if o.Pays[j].PayType == "tenpay_coupon" {
			if !availPays.AllowTenpayCoupon {
				result.State = false
				result.Error = "未设置允许电子抵用券支付"
				return
			}
		}
	}
	if o.HasPay && (orderMoney > allPay) {
		result.State = false
		result.Error = "付款不足，无法提交订单"
		return
	}
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	// defer thisDb.Close()
	var data bytes.Buffer
	err = gob.NewEncoder(&data).Encode(o)
	if err != nil {
		log.Println(err)
	}
	err = thisDb.Put([]byte(orderPrefix+o.Id.Hex()), data.Bytes(), nil)
	if err != nil {
		log.Println(err)
	}
	result.State = true
	result.Value = o.Name
	return
}

// 退单
func (order *Order) ReturnOrder() (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var originOrder Order
	value, _ := thisDb.Get([]byte(orderPrefix+order.Id.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originOrder)
	if err != nil && err != io.EOF {
		result.State = false
		result.Error = "退单失败"
	} else {
		*order = originOrder
		if order.HasReturn {
			result.State = false
			result.Error = "该订单已作过退单处理，请不要重复操作"
			return
		}
		finalPay := order.MoneyPay
		// 已做数据处理
		for _, oneLine := range order.Lines {
			if oneLine.CancelQty > 0 || oneLine.ReturnQty > 0 {
				result.State = false
				result.Error = "该订单已作过退品处理，不再支持退单操作"
				return
			}
		}
		// 已有退款的订单，不再允许一次退单
		for _, onePay := range order.Pays {
			if onePay.IsReturn {
				result.State = false
				result.Error = "该订单已作过退品处理，不再支持退单操作"
				return
			}
		}
		// 先创建退款，再变更订单
		oldPays := order.Pays
		for _, onePay := range oldPays {
			decMoney := onePay.Qty
			if onePay.PayType == "cash" {
				finalPay -= decMoney
			}
			var thisPay = OrderPay{}
			thisPay.Id = bson.NewObjectId()
			thisPay.PayType = onePay.PayType
			thisPay.Name = onePay.Name
			thisPay.Qty = -decMoney
			thisPay.CreateDate = time.Now()
			thisPay.IsReturn = true // 退款
			order.Pays = append(order.Pays, thisPay)
		}
		// 订单状态不应该变化
		order.HasReturn = true
		order.MoneyPay = finalPay
		for i, _ := range order.Lines {
			order.Lines[i].CancelQty = order.Lines[i].Qty
		}
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(order)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(orderPrefix+order.Id.Hex()), data.Bytes(), nil)
		if err != nil {
			result.State = false
			result.Error = "退单失败"
			return
		}
		result.State = true
		result.Error = "退单成功"
	}
	return
}

// LineCancel 菜品取消
func (order *Order) LineCancel(orderId, lineId bson.ObjectId, payType, payName string, payQty, productQty float32) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	var originOrder Order
	value, _ := thisDb.Get([]byte(orderPrefix+orderId.Hex()), nil)
	err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&originOrder)
	if err != nil && err != io.EOF {
		result.State = false
		result.Error = "退品失败,未找到该订单"
	} else {
		// 产品数量处理：买两件，一次退一件
		*order = originOrder
		for i, oneLine := range order.Lines {
			if oneLine.LineId == lineId {
				hasQty := oneLine.Qty - oneLine.CancelQty - oneLine.ReturnQty
				if hasQty < productQty {
					result.State = false
					result.Error = "请求退品数量过多，无法处理"
					return
				}
				order.Lines[i].CancelQty = productQty
				break
			}
		}
		if payType != "" {
			// 向该订单添加支付行，数量为减
			decPay := float32(0)
			var thisPay = OrderPay{}
			thisPay.Id = bson.NewObjectId()
			thisPay.PayType = payType
			thisPay.Name = payName
			thisPay.IsReturn = true
			// 为保证绝对是减钱
			if payQty < 0 {
				payQty = -payQty
			}
			thisPay.Qty = -payQty
			thisPay.CreateDate = time.Now()
			if payType == "cash" {
				decPay = payQty
			}
			order.Pays = append(order.Pays, thisPay)
			order.MoneyPay -= decPay
		}
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(order)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(orderPrefix+order.Id.Hex()), data.Bytes(), nil)
		if err != nil {
			result.State = false
			result.Error = "退品失败"
			return
		}
		result.State = true
	}
	return
}

func GetOrderType(typeString string) (orderType string) {
	if typeString == TypeIn {
		orderType = "堂食"
	} else if typeString == TypeOut {
		orderType = "外卖"
	} else if typeString == TypeInOut {
		orderType = "外带"
	} else if typeString == TypeWaste {
		orderType = "丢弃"
	} else if typeString == TypeMyeat {
		orderType = "自用"
	} else if typeString == TypeOther {
		orderType = "其它"
	}
	return
}

func GetPayType(typeString string) (payType string) {
	if typeString == "cash" {
		payType = "现金"
	} else if typeString == "card" {
		payType = "银行卡"
	} else if typeString == "kocoupon" {
		payType = "红包"
	} else if typeString == "mypay" {
		payType = "充值卡"
	} else if typeString == "own" {
		payType = "签单"
	} else if typeString == "tenpay" {
		payType = "微信"
	} else if typeString == "alipay" {
		payType = "支付宝"
	} else if typeString == "coupon" {
		payType = "优惠券"
	} else if typeString == "tenpay_coupon" {
		payType = "电子优惠券"
	} else if typeString == "gift" {
		payType = "赠送"
	} else if typeString == "others" {
		payType = "其它"
	}
	return
}

// 获取指定pos的订单
func GetPosOrder(posId bson.ObjectId) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var allOrder []Order
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(orderPrefix)), nil)
	for iter.Next() {
		var o Order
		value := iter.Value()
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&o)
		if err != nil && err != io.EOF {
			log.Println(err)
		}
		if o.PosId == posId {
			allOrder = append(allOrder, o)
		}
	}
	if err != nil {
		log.Println(err)
		result.Error = "数据读取错误"
		result.State = false
	} else {
		result.State = true
		result.Value = allOrder
	}
	return
}

// 删除指定Pos的订单
func DelPosOrder(posId bson.ObjectId) (result bool, err error) {
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(orderPrefix)), nil)
	for iter.Next() {
		key := iter.Key()
		value := iter.Value()
		var o Order
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&o)
		if err != nil && err != io.EOF {
			log.Println(err)
		}
		if o.PosId == posId {
			thisDb.Delete(key, nil)
		}
	}
	return
}

// 读取24小时内的订单包括增量读取
func GetTodo(timeStartStr string) (result tool.Result, err error) {
	// db.Lock.Lock()
	// defer db.Lock.UnLock()
	var lastDay time.Time
	if timeStartStr != "" {
		lastDay, err = time.Parse(time.RFC3339Nano, timeStartStr)
		if err != nil {
			result.State = false
			result.Error = "请求时间格式错误"
			return
		}
	} else {
		pastHours := 24
		lastDay = time.Now().Add(time.Duration(-pastHours) * time.Hour)
	}
	var allOrder []Order
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(orderPrefix)), nil)
	for iter.Next() {
		var o Order
		// key := iter.Key()
		value := iter.Value()
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&o)
		if err != nil && err != io.EOF {
			log.Println(err)
		}
		_ = lastDay
		if !o.HasShift && o.CreateDate.Before(lastDay) && !o.HasDone && (o.State == "todo" || o.State == "confirm") {
			allOrder = append(allOrder, o)
		}
	}
	result.State = true
	result.Value = allOrder
	return
}

// 获取交班信息
// func CheckAll() (result tool.Result, err error) {
// 	// 验证权限
// 	hasPass, errStr := base.VerifyRights(companyId, managerName, managerPwd, "OrderShift")
// 	if !hasPass {
// 		result.State = false
// 		result.Error = errStr
// 		return
// 	}
// 	// 2. 获取公司打印信息
// 	companyInfo, err := base.GetCompanyInfo(companyId)
// 	// 3. 销售统计
// 	koDb, koSession, err := db.GetDB()
// 	defer koSession.Close()
// 	if err != nil {
// 		result.State = false
// 		result.Error = "系统未知错误"
// 		return
// 	}
// 	// 4. 统计本次销售情况
// 	koCollection := koDb.C(Order{}.GetTableName())
// 	var lastDay time.Time
// 	pastHours := 24
// 	lastDay = time.Now().Add(time.Duration(-pastHours) * time.Hour)
// 	// 交易次数
// 	orderCount, _ := koCollection.Find(bson.M{
// 		"company_id":  companyId,
// 		"pos_id":      nil,
// 		"has_shift":   false,
// 		"create_date": bson.M{"$gt": lastDay},
// 	}).Count()
// 	// 各项销售金额累计
// 	var payResult []map[string]interface{}
// 	err = koCollection.Pipe([]bson.M{
// 		{"$match": bson.M{
// 			"company_id":  companyId,
// 			"pos_id":      nil,
// 			"has_shift":   false,
// 			"create_date": bson.M{"$gt": lastDay},
// 		}},
// 		{"$unwind": "$pays"},
// 		{"$group": bson.M{
// 			"_id": bson.M{
// 				"pay_type":  "$pays.pay_type",
// 				"is_return": "$pays.is_return",
// 			},
// 			"qty": bson.M{"$sum": "$pays.qty"},
// 		},
// 		},
// 	}).All(&payResult)
// 	if err != nil {
// 		result.Error = "未找到数据"
// 		result.State = true
// 	} else {
// 		result.State = true
// 		result.Value = map[string]interface{}{
// 			"company_info": companyInfo.Value,
// 			"order_count":  orderCount,
// 			"pay_result":   payResult,
// 		}
// 	}
// 	return
// }

// // 交班
// func ShiftAll(companyId bson.ObjectId, timeEndStr, managerName, managerPwd string) (result tool.Result, err error) {
// 	// 1. 验证权限
// 	hasPass, errStr := base.VerifyRights(companyId, managerName, managerPwd, "OrderShift")
// 	if !hasPass {
// 		result.State = false
// 		result.Error = errStr
// 		return
// 	}
// 	// 2. 执行更新操作
// 	koDb, koSession, err := db.GetDB()
// 	defer koSession.Close()
// 	if err != nil {
// 		return
// 	}
// 	koCollection := koDb.C(Order{}.GetTableName())
// 	endNanoSec, err := strconv.ParseInt(timeEndStr, 10, 64)
// 	if err != nil {
// 		result.State = false
// 		result.Error = "交班时间未知"
// 		return
// 	}
// 	endSec := endNanoSec / 1000
// 	restNanoSec := endNanoSec % 1000
// 	endTime := time.Unix(endSec, restNanoSec)
// 	orderData := bson.M{
// 		"has_shift": true,
// 	}
// 	_, err = koCollection.UpdateAll(bson.M{
// 		"has_shift":   false,
// 		"create_date": bson.M{"$lt": endTime},
// 		"company_id":  companyId,
// 	}, bson.M{"$set": orderData})
// 	if err != nil {
// 		result.Error = "交班未成功"
// 		result.State = true
// 	} else {
// 		result.State = true
// 		result.Value = "交班成功"
// 	}
// 	return
// }

// ArrangeMoney 分配收钱方案
func arrangeMoney(order Order, o_cash, o_coupon, o_tenpayCoupon, plus, discount float32) (m []OrderPay, cash, coupon, tenpayCoupon, realMoney float32) {
	cash = o_cash
	coupon = o_coupon
	tenpayCoupon = o_tenpayCoupon
	var orderPrice float32
	for _, oneLine := range order.Lines {
		// 计算数量，取消的与退品的不再计算
		realQty := oneLine.Qty - oneLine.CancelQty - oneLine.ReturnQty
		orderPrice += ((oneLine.Price*realQty + plus) * discount / 100)
		plus = 0
	}
	thisNow := time.Now()
	if orderPrice > 0 {
		// 1. 现金完全可以支付
		if cash >= orderPrice {
			var cashBson OrderPay
			cashBson.Id = bson.NewObjectId()
			cashBson.PayType = "cash"
			cashBson.Qty = orderPrice
			cashBson.CreateDate = thisNow
			m = append(m, cashBson)
			realMoney = orderPrice
			cash -= orderPrice
			return
		} else {
			// 2. 现金不够支付
			if cash > 0 {
				var cashBson OrderPay
				cashBson.Id = bson.NewObjectId()
				cashBson.PayType = "cash"
				cashBson.Qty = cash
				cashBson.CreateDate = thisNow
				m = append(m, cashBson)
				realMoney = cash
				orderPrice -= cash
				cash = 0
			}
		}
	}
	// 优惠券支付
	if orderPrice > 0 {
		// 1. 优惠券完全可以支付
		if coupon >= orderPrice {
			var couponBson OrderPay
			couponBson.Id = bson.NewObjectId()
			couponBson.PayType = "coupon"
			couponBson.Qty = orderPrice
			couponBson.CreateDate = thisNow
			m = append(m, couponBson)
			coupon -= orderPrice
			return
		} else {
			// 2. 优惠券不够支付
			if coupon > 0 {
				var couponBson OrderPay
				couponBson.Id = bson.NewObjectId()
				couponBson.PayType = "coupon"
				couponBson.Qty = coupon
				couponBson.CreateDate = thisNow
				m = append(m, couponBson)
				orderPrice -= coupon
				coupon = 0
			}
		}
	}
	// 电子券
	if orderPrice > 0 {
		// 1. 现金完全可以支付
		if tenpayCoupon >= orderPrice {
			var tenpayCouponBson OrderPay
			tenpayCouponBson.Id = bson.NewObjectId()
			tenpayCouponBson.PayType = "tenpay_coupon"
			tenpayCouponBson.Qty = orderPrice
			tenpayCouponBson.CreateDate = thisNow
			m = append(m, tenpayCouponBson)
			tenpayCoupon -= orderPrice
			return
		} else {
			// 2. 现金不够支付
			if tenpayCoupon > 0 {
				var tenpayCouponBson OrderPay
				tenpayCouponBson.Id = bson.NewObjectId()
				tenpayCouponBson.PayType = "tenpay_coupon"
				tenpayCouponBson.Qty = tenpayCoupon
				tenpayCouponBson.CreateDate = thisNow
				m = append(m, tenpayCouponBson)
				orderPrice -= tenpayCoupon
				tenpayCoupon = 0
			}

		}
	}
	return
}

func totalMoney(allOrders []Order) (total float32) {
	for _, oneOrder := range allOrders {
		for _, oneLine := range oneOrder.Lines {
			// 计算数量，取消的与退品的不再计算
			realQty := oneLine.Qty - oneLine.CancelQty - oneLine.ReturnQty
			total += (oneLine.Price * realQty * oneLine.Discount / 100)
		}
	}
	return
}

// TableMoney按餐桌收款
func (order *Order) TableMoney(tableId bson.ObjectId, cash, coupon, tenpayCoupon, plus, discount float32) (result tool.Result, err error) {
	var allOrder []Order
	thisDb, err := db.GetDb()
	if err != nil {
		log.Println(err)
	}
	iter := thisDb.NewIterator(util.BytesPrefix([]byte(orderPrefix)), nil)
	for iter.Next() {
		var o Order
		value := iter.Value()
		err = gob.NewDecoder(bytes.NewBuffer(value)).Decode(&o)
		if err != nil && err != io.EOF {
			log.Println(err)
		}
		if o.TableId == tableId && o.State == "confirm" {
			allOrder = append(allOrder, o)
		}
	}
	// 验证总付款金额是否足
	total := totalMoney(allOrder)
	if discount == 0 {
		discount = 100
	}
	if (total+plus)*discount/100 > (cash + coupon + tenpayCoupon) {
		result.Error = "付款不足"
		result.State = false
		return
	}
	for _, oneOrder := range allOrder {
		var realMoney float32
		var pays []OrderPay
		pays, cash, coupon, tenpayCoupon, realMoney = arrangeMoney(oneOrder, cash, coupon, tenpayCoupon, plus, discount)
		// 生成付款并插入
		oneOrder.HasPay = true
		oneOrder.PlusFee = plus
		oneOrder.MoneyPay = realMoney
		oneOrder.Pays = pays
		oneOrder.HasDone = true
		if discount != 100 && discount > 0 {
			for i, _ := range oneOrder.Lines {
				oneOrder.Lines[i].Discount = discount
			}
		}
		var data bytes.Buffer
		err = gob.NewEncoder(&data).Encode(oneOrder)
		if err != nil {
			log.Println(err)
		}
		err = thisDb.Put([]byte(orderPrefix+oneOrder.Id.Hex()), data.Bytes(), nil)
		if err != nil {
			log.Println(err)
		}
	}
	if err != nil {
		log.Println(err)
		result.Error = "数据更新错误"
		result.State = false
		return
	}
	// 收台
	var t Table
	t.Id = tableId
	_, err = t.End()
	result.State = true
	result.Value = "收款成功"
	return
}
