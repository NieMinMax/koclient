package upload

import (
	"log"
	"net/rpc"

	"koclient/model"
	"koclient/tool"
)

const (
	ServerAddress = "127.0.0.1:6666"
)

// 取的参数
type UploadArgs struct {
	Company  string
	User     string
	Password string
	Pos      model.Pos
}

// 上传
func Do(company, user, password string, pos model.Pos) (result tool.Result, err error){
	log.Println("开始上传...")
	client, err := rpc.DialHTTP("tcp", ServerAddress)
	defer client.Close()
	if err != nil {
		log.Println(err)
		result.State = false
		result.Error = "上传失败，服务器未响应"
	} else {
		args := UploadArgs{company, user, password, pos}
		var answer int
		err = client.Call("Api.OrderUpload", args, &answer)
		if err != nil {
			log.Println(err)
		}
		if answer == 1 {
			log.Println("上传完成...")
			hasDelPos, err := model.DelPos(pos.Id)
			if err != nil {
				log.Println(err)
			}
			hasDelOrder, err := model.DelPosOrder(pos.Id)
			if err != nil {
				log.Println(err)
			}
			if hasDelPos && hasDelOrder {
				result.State = true
				result.Value = "上传成功"
			} else {
				result.State = true
				result.Value = "上传成功，但数据删除失败"
			}
		} else {
			result.State = false
			result.Value = "上传失败"
		}
	}
	log.Println("end upload...")
	return
}
