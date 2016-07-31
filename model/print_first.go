package model

import (
	"time"
)

// 打印小票
func (o Order) PrintFirst() {
	for _, onePay := range o.Pays {
		if onePay.PayType != "kocoupon" {
			PrintReceipt([]Order{o})
			break
		}
	}
	o.PrintTable()
	time.Sleep(1 * time.Second)
	o.PrintCookie()
	// o.PrintCookie()
	return
}
