package download

import (
	"crypto/md5"
	"encoding/hex"
	"log"
	"net/rpc"
	"strconv"
	"strings"
	"time"

	"gopkg.in/mgo.v2/bson"

	"koclient/model"
	"koclient/tool"
)

const (
	ServerAddress = "www.kocrm.com:6666"
	// ServerAddress = "192.168.1.101:6666"
)

// 取的参数
type BeforeArgs struct {
	ThisTime  string
	RandStr   string
	Sign      string
	CompanyId bson.ObjectId
}

// 完成的参数
type DoneArgs struct {
	ThisTime  string
	RandStr   string
	Sign      string
	CompanyId bson.ObjectId
	OrderIds  []bson.ObjectId
}

// 生成md5签名
func GetSign(str string) (sign string) {
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(str))
	cipherStr := md5Ctx.Sum(nil)
	sign = strings.ToUpper(hex.EncodeToString(cipherStr))
	return
}

func Start() {
	//1. 获取密钥
	conf := model.GetConf()
	key := conf.ServerKey
	var companyId bson.ObjectId
	companyIdHex := conf.CompanyId
	if bson.IsObjectIdHex(companyIdHex) {
		companyId = bson.ObjectIdHex(companyIdHex)
	}
	download := conf.Download
	if download {
		for {
			log.Println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
			log.Println("开始取单...")
			//2. 获取连接
			client, err := rpc.DialHTTP("tcp", ServerAddress)
			if err != nil {
				log.Println(err)
			} else {
				//3. 加密基础数据
				thisTime := strconv.FormatInt(time.Now().Unix(), 10)
				thisRand := tool.GenRandStr(10)
				thisSign := GetSign(thisRand + thisTime + key)
				args := BeforeArgs{thisTime, thisRand, thisSign, companyId}
				var allOrders []model.Order
				err = client.Call("Api.OrderDownload2", args, &allOrders)
				if err != nil {
					log.Println("Hello", err)

					log.Println(allOrders)

				}
				log.Println("已取回订单数量: ", len(allOrders))
				// 4. 处理订单
				var allOrderIds []bson.ObjectId
				for _, oneOrder := range allOrders {
					oneOrder.PrintFirst()
					allOrderIds = append(allOrderIds, oneOrder.Id)
				}
				// 5. 上传表示已处理
				var len int
				if allOrderIds != nil {
					// 再次签名
					thisTime := strconv.FormatInt(time.Now().Unix(), 10)
					thisRand := tool.GenRandStr(10)
					thisSign := GetSign(thisRand + thisTime + key)
					doneArgs := DoneArgs{thisTime, thisRand, thisSign, companyId, allOrderIds}
					err = client.Call("Api.OrderDownloadDone", doneArgs, &len)
					if err != nil {
						log.Println(err)
					}
				}
				client.Close()
			}
			log.Println("结束本次取单。")
			log.Println("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
			// 每30秒取一次
			time.Sleep(30 * time.Second)
		}
	}
}
