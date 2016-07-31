package db

import (
	"log"
	"sync"

	"github.com/syndtr/goleveldb/leveldb"
)

const (
	dbSourceName = "./kocrm.db"
)

var Lock sync.Locker

var oneDb *leveldb.DB

func GetDb() (db *leveldb.DB, err error) {
	if oneDb == nil{
		oneDb, err = leveldb.OpenFile(dbSourceName, nil)
		if err != nil {
			log.Println(err)
			return
		}
	}
	db = oneDb
	return 
}
