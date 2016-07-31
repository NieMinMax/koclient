package tool

import (
	"encoding/json"
	"math/rand"
	"net/http"
	// "strconv"
	"time"
)

const (
	PageCount = 200
)

type StringIds struct {
	Ids []string `json:"ids"`
}

func (a *StringIds) ParseReq(req *http.Request) (result bool, err error) {
	tempDec := json.NewDecoder(req.Body)
	err = tempDec.Decode(a)
	if err != nil {
		result = false
		return
	}
	result = true
	return
}

func StringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

// ValidateRepeat 校验约束重复规则
// func ValidateRepeat(collection string, data bson.M) (count int, err error) {
// 	koDb, koSession, err := db.GetDB()
// 	defer koSession.Close()
// 	if err != nil {
// 		return
// 	}
// 	koCollection := koDb.C(collection)
// 	count, _ = koCollection.Find(data).Count()
// 	return
// }

// 获取指定长度随机字符串
func GenRandStr(strLen int) (randStr string) {
	availChar := []string{
		"a", "b", "c", "d", "e", "f", "g",
		"h", "i", "j", "k", "l", "m", "n",
		"o", "p", "q", "r", "s", "t",
		"u", "v", "w", "x", "y", "z",
		"A", "B", "C", "D", "E", "F", "G",
		"H", "I", "J", "K", "L", "M", "N",
		"O", "P", "Q", "R", "S", "T",
		"U", "V", "W", "X", "Y", "Z",
		"-", "_", "@", "#", "$", "%", "^", "&", "*",
	}
	for i := 0; i < strLen; i++ {
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		index := r.Intn(len(availChar))
		randStr += availChar[index]
	}
	return
}

// 产生指定长度的随机字符串
// func GenRandstr(length int) (randStr string) {
// 	r := rand.New(rand.NewSource(time.Now().UnixNano()))
// 	for i := 0; i < length; i++ {
// 		randStr += strconv.Itoa(r.Intn(10))
// 	}
// 	return
// }
