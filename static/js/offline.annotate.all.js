var offline = angular.module('offline', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'smart-table']);

// 将分钟数转成时间
offline.filter('toTimeFilter', function() {
    return function(input) {
        var result
        if (input) {
            var hourStr
            var minStr
            var hour

            hour = parseInt(input / 60)
            if (hour < 10) {
                hourStr = "0" + hour.toString()
            } else {
                hourStr = hour.toString()
            }
            if (input % 60 == 30) {
                minStr = ":30"
            } else {
                minStr = ":00"
            }
            result = hourStr + minStr
        }
        return result
    }
});

// 适用于多对多不确定的Filter
offline.filter('M2MFilter', function() {
    return function(input, groups) {
        var result = ""


        if (input) {
            for (var i = 0; i < input.length; i++) {
                for (var j = 0; j < groups.length; j++) {
                    if (input[i] == groups[j].id) {
                        result = result + groups[j].name + " "
                    }
                }
            }
        }
        return result
    }
});

// 适用于一对一的Filter
offline.filter('groupFilter', function() {
    return function(input, groups) {
        var result = ""


        if (input) {
            for (var j = 0; j < groups.length; j++) {
                if (input == groups[j].id) {
                    result = groups[j].name
                    break
                }
            }
        }
        return result
    }
});

offline.filter('true_false', function() {
    return function(input) {
        if (input) {
            return "√"
        } else {
            return "×"
        }
    }
});

// 适用于一对一不确定的Filter
offline.filter('oneFilter', function() {
    return function(input, groups) {
        var result = ""


        if (input && groups) {
            for (var j = 0; j < groups.length; j++) {
                if (groups[j].id == input) {
                    result = groups[j].name
                    break
                }
            }
        }
        return result
    }
});

offline.filter('company_take', function() {
    var takeStates = {
        "t": "启用",
        "f": "禁用"
    }


    return function(input) {
        if (input)
            return takeStates[input]
    }
});

offline.filter('pay_type', function() {
    var allType = {
        "cash": "现金",
        "card": "刷卡",
        "mypay": "会员卡",
        "own": "签单",
        "tenpay": "微信",
        "tenpay_back": "微信退款",
        "alipay": "支付宝",
        "coupon": "优惠券",
        "tenpay_coupon": "电子券",
        "gift": "赠送",
        "omit": "抹零",
        "others": "其它"
    }


    return function(input) {
        if (input)
            return allType[input]
    }
});

offline.filter('gender_state', function() {
    var genderStates = {
        "m": "男",
        "f": "女"
    }


    return function(input) {
        if (input)
            return genderStates[input]
    }
});


offline.filter('table_state', function() {
    var tableStates = {
        "t": "正常",
        "f": "停用"
    }


    return function(input) {
        if (input)
            return tableStates[input]
    }
});

offline.filter('product_state', function() {
    var productStates = {
        "t": "上架",
        "f": "下架"
    }


    return function(input) {
        if (input)
            return productStates[input]
    }
});

offline.filter('product_limit', function() {
    var productLimits = {
        "in": "堂食",
        "out": "外卖",
        "all": "不限"
    }


    return function(input) {
        if (input)
            return productLimits[input]
    }
});

offline.filter('product_tstate', function() {
    var tableTempStates = {
        "t": "是",
        "f": "否"
    }


    return function(input) {
        if (input)
            return tableTempStates[input]
    }
});

offline.filter('product_tstate_s', function() {
    var tableTempStates = {
        "t": "Х",
        "f": ""
    }


    return function(input) {
        if (input)
            return tableTempStates[input]
    }
});

offline.filter('product_nstate', function() {
    var productNewStates = {
        "t": "是",
        "f": "否"
    }


    return function(input) {
        if (input)
            return productNewStates[input]
    }
});

offline.filter('product_pstate', function() {
    var tablePromotionStates = {
        "t": "是",
        "f": "否"
    }


    return function(input) {
        if (input)
            return tablePromotionStates[input]
    }
});

offline.filter('product_pstate_s', function() {
    var tablePromotionStates = {
        "t": "√",
        "f": ""
    }


    return function(input) {
        if (input)
            return tablePromotionStates[input]
    }
});

offline.filter('order_state', function() {
    var orderStates = {
        "pre_tenpay": "微信待支付订单",
        "todo": "客户自助下单",
        "confirm": "已审核",
        "cancel": "已取消"
    }


    return function(input) {
        if (input)
            return orderStates[input]
    }
});

// 订单类型
offline.filter('order_type', function() {
    var orderTypes = {
        "in": "堂食",
        "out": "外卖",
        "in_out": "外带",
        "waste": "丢弃",
        "myeat": "自用",
        "renew": "补单",
    }


    return function(input) {
        if (input)
            return orderTypes[input]
    }
});

offline.filter('orderline_state', function() {
    var orderlineStates = {
        "draft": "待处理",
        "printed": "备菜中",
        "sent": "已上菜",
        "cancel": "已取消"
    }


    return function(input) {
        if (input)
            return orderlineStates[input]
    }
});


offline.filter('linecancel_state', function() {
    var lineCancelStates = {
        "normal": "正常",
        "cancelled": "已退"
    }


    return function(input) {
        if (input)
            return lineCancelStates[input]
    }
});

offline.filter('ordermoney_state', function() {
    var ordermoneyStates = {
        "t": "已付",
        "f": "待付"
    }


    return function(input) {
        if (input)
            return ordermoneyStates[input]
    }
});


// 将数据重新组织成几个一组的
offline.filter('ko_groupbyFilter', function() {
    return function(input, count) {
        var results = []


        if (!count) {
            count = 3
        }
        if (input) {
            // 重新构建
            for (var i = 0; i < input.length; i++) {
                var flag = true


                for (var j = 0; j < results.length; j++) {
                    if (input[i].id == results[j].id && results[j].lines.length < count) {
                        results[j].lines.push(input[i])
                        flag = false
                        break
                    }
                }
                if (flag) {
                    results.push({
                        'id': input[i].id,
                        'name': input[i].name,
                        'lines': [input[i]]
                    })
                }
            }
        }
        return results
    }
});


// 菜品按类别选择
offline.filter('ko_pcategFilter', function() {
    return function(input, categId) {
        var results = []
        if (input) {
            if (categId) {
                results = []
                for (var i = 0; i < input.length; i++) {
                    if (input[i].categ_id) {
                        if (categId == input[i].categ_id) {
                            results.push(input[i])
                        }
                    }
                }
                return results
            } else {
                return input
            }
        }
    }
});

// offline.filter('ko_pcategFilter', function() {
//     return function(input, categId) {
// 	results = []
// 	if (input) {
// 	    if (categId) {
// 		results = []
// 		for (i=0; i<input.length; i++) {
// 		    if (input[i].categ_ids) {
// 			for (j=0; j< input[i].categ_ids.length; j++) {
// 			    if (categId == input[i].categ_ids[j]) {
// 				results.push(input[i])
// 			    }
// 			}
// 		    }
// 		}
// 		return results
// 	    } else {
// 		return input
// 	    }

// 	}
//     }});


// 按编号选择餐桌
offline.filter('ko_tableFilter', function() {
    return function(input, tableCode) {
        if (input && tableCode) {
            var results = []


            for (var i = 0; i < input.length; i++) {
                if (input[i].code) {
                    var tempStr = input[i].code.toString()


                    if (tempStr.match(tableCode)) {
                        results.push(input[i])
                    }
                }
            }
            return results
        }
        return input
    }
});

// 按商品编号输入商品
offline.filter('ko_productFilter', function() {
    return function(input, productCode) {
        if (input && productCode) {
            var results = []


            for (var i = 0; i < input.length; i++) {
                if (input[i].code) {
                    var tempStr = input[i].code.toString()


                    if (tempStr.match(productCode)) {
                        results.push(input[i])
                    }
                }
            }
            return results
        }
        return input
    }
});



// 移除数量为0的产品
offline.filter('ko_zeroQtyFilter', function() {
    return function(input) {
        if (input) {
            var results = []


            for (var i = 0; i < input.length; i++) {
                if (input[i].qty > 0) {
                    results.push(input[i])
                }
            }
            return results
        }
        return input
    }
});


// 打印
offline.directive('ngPrint', function() {
    //用法: <button class="btn btn-primary" ng-print print-element-id="hello">打印</button>
    var printSection = document.getElementById('printSection');
    // if there is no printing section, create one
    if (!printSection) {
        printSection = document.createElement('div');
        printSection.id = 'printSection';
        document.body.appendChild(printSection);
    }
    function link(scope, element, attrs) {
        element.on('click', function() {
            var elemToPrint = document.getElementById(attrs.printElementId);
            if (elemToPrint) {
                // clones the element you want to print
                var domClone = elemToPrint.cloneNode(true);
                printSection.appendChild(domClone);
                window.print();
                printSection.innerHTML = '';
            }
        });
    }
    return {
        link: link,
        restrict: 'A'
    };
})

offline.directive('csSelect', function() {
    return {
        require: '^stTable',
        template: '<input type="checkbox" style="width:1.5rem;height:1.5rem;"/>',
        scope: {
            row: '=csSelect'
        },
        link: function(scope, element, attr, ctrl) {
            element.bind('change', function() {
                scope.$apply(function() {
                    ctrl.select(scope.row, 'multiple');
                });
            });
            scope.$watch('row.isSelected', function(newValue) {
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                } else {
                    element.parent().removeClass('st-selected');
                }
            });
        }
    };
});

offline.directive('koBuy', ['$timeout', function($timeout) {
    return {
        restrict: 'CA',
        link: function(scope, element) {
            element.bind('click', function() {
                element.addClass('animated bounce');
                $timeout(function() {
                    element.removeClass('animated bounce');
                }, 1000);
            });
        }
    };
}]);


// 用法
// <label ng-repeat="role in roles">
//   <input type="checkbox" checklist-model="user.roles" checklist-value="role"> {{role}}
// </label>

offline.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
    // contains
    function contains(arr, item) {
        if (angular.isArray(arr)) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], item)) {
                    return true;
                }
            }
        }
        return false;
    }
    // add
    function add(arr, item) {
        arr = angular.isArray(arr) ? arr : [];
        for (var i = 0; i < arr.length; i++) {
            if (angular.equals(arr[i], item)) {
                return arr;
            }
        }
        arr.push(item);
        return arr;
    }
    // remove
    function remove(arr, item) {
        if (angular.isArray(arr)) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], item)) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
        return arr;
    }

    // http://stackoverflow.com/a/19228302/1458162
    function postLinkFn(scope, elem, attrs) {
        // compile with `ng-model` pointing to `checked`
        $compile(elem)(scope);
        // getter / setter for original model
        var getter = $parse(attrs.checklistModel);
        var setter = getter.assign;
        // value added to list
        var value = $parse(attrs.checklistValue)(scope.$parent);
        // watch UI checked change
        scope.$watch('checked', function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            var current = getter(scope.$parent);
            if (newValue === true) {
                setter(scope.$parent, add(current, value));
            } else {
                setter(scope.$parent, remove(current, value));
            }
        });
        // watch original model change
        scope.$parent.$watch(attrs.checklistModel, function(newArr) {
            scope.checked = contains(newArr, value);
        }, true);
    }

    return {
        restrict: 'A',
        priority: 1000,
        terminal: true,
        scope: true,
        compile: function(tElement, tAttrs) {
            if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
                throw 'checklist-model should be applied to `input[type="checkbox"]`.';
            }

            if (!tAttrs.checklistValue) {
                throw 'You should provide `checklist-value`.';
            }
            // exclude recursion
            tElement.removeAttr('checklist-model');
            // local scope var storing individual checkbox model
            tElement.attr('ng-model', 'checked');
            return postLinkFn;
        }
    };
}]);



// 数字键盘
offline.directive('koKey', function() {
    return {
        scope: {
            inputData: '=koInput'
        },
        link: function(scope, element, attr) {
            element.bind('click', function() {
                var before


                if (scope.inputData == "0" || scope.inputData == "00") {
                    before = ""
                } else {
                    before = scope.inputData
                }
                var tempKey = attr.koKey


                if (tempKey == "-") {
                    if (before[0] == "-") {
                        scope.inputData = before.substring(1)
                    } else {
                        scope.inputData = "-" + before
                    }
                } else if (tempKey == "del") {
                    var tempLen = before.length


                    scope.inputData = before.substring(0, tempLen - 1)
                } else if (tempKey == "clr") {
                    // 关闭清除功能
                    // scope.inputData = "0" 
                } else if (tempKey == "do") {
                    // 确认的功能是什么?
                } else {
                    scope.inputData = before + tempKey
                }
            });
        }
    };
});

// 键盘事件跟噻
// offline.directive('ngEnter', function () {
//     return function(scope, element, attrs) {
// 	element.bind("keydown keypress", function(event){
// 	    // console.log(event.which)
// 	    // event.preventDefault()
// 	})
//     }
// })

offline.directive('koneed', function() {
    return {
        link: function(scope, element, attrs) {
            var tag = '<span style="color:red;">*</span>';
            element.append(tag);
        }
    };
});


// indexeddb服务
offline.factory('dbService', ['$q', '$window', function($q, $window) {
    var thisDb;
    var hasLoad = false;
    var version = 2


    var db = null


    function init() {
        var deferred = $q.defer();
        if (hasLoad) {
            deferred.resolve(true);
            return deferred.promise;
        }
        var openRequest = $window.indexedDB.open("offline", version);
        openRequest.onerror = function(e) {
            console.log("Error opening db");
            deferred.reject(e.toString());
        };
        openRequest.onupgradeneeded = function(e) {
            db = e.target.result;
            if (!db.objectStoreNames.contains("order")) {
                db.createObjectStore("order", {
                    keyPath: "id",
                });
            }
        };
        openRequest.onsuccess = function(e) {
            db = e.target.result;
            db.onerror = function(event) {
                deferred.reject("Database error: " + event.target.errorCode);
            };
            hasLoad = true;
            deferred.resolve(true);
        };
        return deferred.promise;
    }

    var saveOrder = function(orderId) {
        var deferred = $q.defer();
        init().then(function() {
            var order = {
                id: orderId,
                saveDate: (new Date()).getTime()
            }


            var thisTransaction = db.transaction(["order"], "readwrite");
            var thisStore = thisTransaction.objectStore("order")


            var thisRequest = thisStore.add(order);
            thisRequest.onsuccess = function(event) {
                deferred.resolve(true);
            };
        })
        return deferred.promise;
    }



    // var checkOrder = function(orderId) {
    //     var deferred = $q.defer();
    //     init().then(function(orderId) {
    // 	    var orderTransaction = db.transaction(["order"], "read");
    // 	    var orderRequest = orderTransaction.objectStore("order").get(orderId)
    // 	    orderRequest.onsuccess = function(event) {
    // 		var order = event.target.result
    // 		console.log(order)
    // 		if (order) {
    // 		    deferred.resolve(true)
    // 		} else {
    // 		    deferred.resolve(false)
    // 		}
    // 	    }
    //     });
    //     return deferred.promise;
    // }

    // 获取全部订单
    var getAllOrders = function() {
        var deferred = $q.defer();
        init().then(function() {
            var result = {};
            var handleResult = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var thisId = cursor.value.id


                    if (!result.hasOwnProperty(thisId)) {
                        result[thisId] = true
                    }
                    cursor.continue();
                }
            };
            var transaction = db.transaction(["order"], "readonly");
            var objectStore = transaction.objectStore("order");
            objectStore.openCursor().onsuccess = handleResult;
            transaction.oncomplete = function(event) {
                deferred.resolve(result);
            };
        });
        return deferred.promise;
    }



    // 移除一天前的数据
    var deleteOldOrders = function() {
        var deferred = $q.defer();
        init().then(function() {
            var thisTime = (new Date()).getTime()


            var deleteTime = thisTime - (24 * 60 * 60 * 1000)


            var result = [];
            var orderTransaction = db.transaction(["order"], "readonly");
            var orderStore = orderTransaction.objectStore("order")


            var toDelete = []


            orderStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.saveDate < deleteTime) {
                        toDelete.push(cursor.value.id);
                    }
                    cursor.continue();
                }
            }
            var deleteTransaction = db.transaction(["order"], "readwrite");
            var deleteStore = deleteTransaction.objectStore("order")


            for (var jj = 0; jj < toDelete.length; jj++) {
                deleteStore.delete(toDelete[jj])
            }
            deleteTransaction.oncomplete = function() {
                deferred.resolve()
            }
        });
        return deferred.promise;
    }




    return {
        saveOrder: saveOrder,
        getAllOrders: getAllOrders,
        deleteOldOrders: deleteOldOrders
    };
}]);



// 基础service，通过该基础service缓存常用数据，减少请求量
offline.factory('baseService', ['$q', '$http', function($q, $http) {
    // 支付方式
    var PayType = null

    var PlusInfo = null

    // 餐台
    var TCategs = []

    var Tables = []

    var TStatus = null


    // 产品
    var Products = []


    var PPcategs = []


    var PScategs = []


    var PTreats = []


    var PStatus = null


    // 送餐员
    var Delivery = []


    // 用户
    // var Users = []
    var UGroups = []



    // 总部下面的公司
    var Companies = []


    // 餐厅组别
    var Cgroups = []


    var HProducts = []


    var HPPcategs = []


    var HPScategs = []


    var HPTreats = []


    var HPStatus = null


    var HPrice = []



    // 可用的支付方式
    var getPayType = function() {
        var deferred = $q.defer();
        if (PayType) {
            deferred.resolve(PayType);
        } else {
            $http.get('/company/getavailpay')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PayType = data.value
                        deferred.resolve(PayType)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }

    var getPlusInfo = function() {
        var deferred = $q.defer();
        if (PlusInfo) {
            deferred.resolve(PlusInfo);
        } else {
            $http.get('/company/getplus')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PlusInfo = data.value
                        deferred.resolve(PlusInfo)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getTCategs = function() {
        var deferred = $q.defer();
        if (TCategs.length > 0) {
            deferred.resolve(TCategs);
        } else {
            $http.get('/tcateg/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        TCategs = data.value
                        deferred.resolve(TCategs)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }




    var getTables = function() {
        var deferred = $q.defer();
        if (Tables.length > 0) {
            deferred.resolve(Tables);
        } else {
            $http.get('/table/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        Tables = data.value
                        deferred.resolve(Tables)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getTableStatus = function() {
        var deferred = $q.defer();
        if (TStatus) {
            deferred.resolve(TStatus);
        } else {
            $http.get('/table/getstatus')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        TStatus = data.value //使用时需用states属性
                        deferred.resolve(TStatus)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getProducts = function() {
        var deferred = $q.defer()

        if (Products.length > 0) {
            deferred.resolve(Products)
        } else {
            $http.get('/products' + '/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        var Products = data.value
                        deferred.resolve(Products)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getPpcategs = function() {
        var deferred = $q.defer()


        if (PPcategs.length > 0) {
            deferred.resolve(PPcategs)
        } else {
            $http.get('/ppcategs/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PPcategs = data.value
                        deferred.resolve(PPcategs)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getPscategs = function() {
        var deferred = $q.defer()


        if (PScategs.length > 0) {
            deferred.resolve(PScategs)
        } else {
            $http.get('/pscategs/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PScategs = data.value
                        deferred.resolve(PScategs)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getPtreats = function() {
        var deferred = $q.defer()


        if (PTreats.length > 0) {
            deferred.resolve(PTreats)
        } else {
            $http.get('/ptreats/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PTreats = data.value
                        deferred.resolve(PTreats)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getPstatus = function() {
        var deferred = $q.defer()


        if (PStatus) {
            deferred.resolve(PStatus)
        } else {
            $http.get('/product/getstatus')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        PStatus = data.value
                        deferred.resolve(PStatus)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    // 送餐员
    var getDelivery = function() {
        var deferred = $q.defer()


        if (Delivery.length > 0) {
            deferred.resolve(Delivery)
        } else {
            $http.get('/delivery/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        Delivery = data.value
                        deferred.resolve(Delivery)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getUgroups = function() {
        var deferred = $q.defer()


        if (UGroups) {
            deferred.resolve(UGroups)
        } else {
            $http.get('/groups/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        UGroups = data.value.groups
                        deferred.resolve(UGroups)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    // 公司
    var getCompanies = function() {
        var deferred = $q.defer()


        if (Companies.length > 0) {
            deferred.resolve(Companies)
        } else {
            $http.get('/head/allcompanies')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        Companies = data.value
                        deferred.resolve(Companies)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    // 公司分组
    var getCgroups = function() {
        var deferred = $q.defer()


        if (Cgroups.length > 0) {
            deferred.resolve(Cgroups)
        } else {
            $http.get('/head/cgroup/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        Cgroups = data.value
                        deferred.resolve(Cgroups)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }




    var getHProducts = function() {
        var deferred = $q.defer()


        if (HProducts.length > 0) {
            deferred.resolve(HProducts)
        } else {
            $http.get('/head/hproducts' + '/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        var HProducts = data.value


                        deferred.resolve(HProducts)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }




    // 公司产品一级分类
    var getHPpcategs = function() {
        var deferred = $q.defer()


        if (HPPcategs.length > 0) {
            deferred.resolve(HPPcategs)
        } else {
            $http.get('/head/hppcategs/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        HPPcategs = data.value
                        deferred.resolve(HPPcategs)
                    }
                })
                .error(function() {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getHPscategs = function() {
        var deferred = $q.defer()


        if (HPScategs.length > 0) {
            deferred.resolve(HPScategs)
        } else {
            $http.get('/head/hpscategs/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        HPScategs = data.value
                        deferred.resolve(HPScategs)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getHPtreats = function() {
        var deferred = $q.defer()


        if (HPTreats.length > 0) {
            deferred.resolve(HPTreats)
        } else {
            $http.get('/head/ptreats/getall')
                .success(function(data, status) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        HPTreats = data.value
                        deferred.resolve(HPTreats)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getHPstatus = function() {
        var deferred = $q.defer()


        if (HPStatus) {
            deferred.resolve(HPStatus)
        } else {
            $http.get('/head/hproduct/getstatus')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        HPStatus = data.value
                        deferred.resolve(HPStatus)
                    }
                })
                .error(function(data) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }



    var getHPrice = function() {
        var deferred = $q.defer()
        if (HPrice.length > 0) {
            deferred.resolve(HPrice)
        } else {
            $http.get('/head/hprice/getall')
                .success(function(data) {
                    if (data.error) {
                        deferred.reject(data.error)
                    } else {
                        HPrice = data.value
                        deferred.resolve(HPrice)
                    }
                })
                .error(function(data, status, headers, config) {
                    deferred.reject("网络错误")
                })
        }
        return deferred.promise
    }




    return {
	getPlusInfo:getPlusInfo,
        getPayType: getPayType,
        getTables: getTables,
        getTCategs: getTCategs,
        getTableStatus: getTableStatus,
        getProducts: getProducts,
        getPpcategs: getPpcategs,
        getPscategs: getPscategs,
        getPtreats: getPtreats,
        getPstatus: getPstatus,
        getUgroups: getUgroups,
        getDelivery: getDelivery,
        getCompanies: getCompanies,
        getCgroups: getCgroups,
        getHProducts: getHProducts,
        getHPpcategs: getHPpcategs,
        getHPscategs: getHPscategs,
        getHPtreats: getHPtreats,
        getHPstatus: getHPstatus,
        getHPrice: getHPrice,
    };
}]);


offline.config(['$httpProvider', '$routeProvider', function($httpProvider, $routeProvider) {
    // 处理IE缓存
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    // $routeProvider.when('/', {
    // 	controller:"DashboardCtrl",
    // 	templateUrl:'/static/templates/offline_dashboard.html'
    // });
    
    $routeProvider.when('/', {
        controller: "ServiceChinesePosCtrl",
        templateUrl: '../static/templates/offline_pos_chinese.html'
    });

    $routeProvider.when('/pos/chinese', {
        controller: "ServiceChinesePosCtrl",
        templateUrl: '../static/templates/offline_pos_chinese.html'
    });

    $routeProvider.when('/pos/kproduct', {
        controller: "KProductListCtrl",
        templateUrl: '../static/templates/offline_product_list.html'
    });

    $routeProvider.when('/pos/today', {
        controller: "OrderTodayCtrl",
        templateUrl: '../static/templates/offline_order_today.html'
    });

    $routeProvider.when('/pos/done', {
        controller: "OrderlineListDoneCtrl",
        templateUrl: '../static/templates/offline_orderline_list_done.html'
    });

    $routeProvider.when('/pos/prepare', {
        controller: "OrderlineListPrepareCtrl",
        templateUrl: '../static/templates/offline_orderline_list_prepare.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])

offline.controller('BaseCtrl',
		  ['$scope', '$route', '$http', '$modal', '$window', '$document', '$timeout', '$q', 'dbService', function($scope, $route, $http, $modal, $window, $document, $timeout, $q, dbService) {
		      'use strict'
		      // chromeapp通信相关
		      $scope.offline = false
		      $scope.offlineSource = null
		      $scope.offlineOrigin = null
		      $scope.hasOfflinePcateg = false
		      $scope.hasOfflineProduct = false
		      $scope.hasOfflinePtreat = false
		      $scope.hasOfflineTable = false
		      $scope.hasOfflinePay = false

		      var allPostIds = {}
		      var offlineSource, offlineOrigin
		      $window.addEventListener('message', function(event) {
			  $scope.offline = true
			  $scope.offlineSource = event.source
			  $scope.offlineOrigin = event.origin
			  offlineSource = event.source
			  offlineOrigin = event.origin

			  // 更新窗口高度
			  var newHeight = getDocHeight()
			  offlineSource.postMessage(JSON.stringify({"height":newHeight}), offlineOrigin)
			  // 发送收到消息
			  offlineSource.postMessage(JSON.stringify({"check": "ok"}), offlineOrigin);
			  if (event.data){
			      var messageData = JSON.parse(event.data);
			      // 发送公司打印的基础信息
			      $http.get('/company/info')
				  .success(function(data) {
			  	      offlineSource.postMessage(JSON.stringify({
			  		  "info": data.value
			  	      }), offlineOrigin);
				  })
			      // 处理网络订单
			      if (messageData.check) {
				  dbService.deleteOldOrders()
				  downloadOrder()
			      }
			  }
		      }, false)


		      // 将订单下到本地
		      var downloadOrder = function(){
			  var newOrderPromise = $http.get("/order/download")
			  var oldOrderPromise = dbService.getAllOrders()
			  $q.all([newOrderPromise, oldOrderPromise])
			      .then(function(results){
				  var newOrders  = results[0].data.value
				  var oldOrderIds = results[1]
				  if (newOrders.length>0){
				      var uploadIds = []
				      for (var i=0; i<newOrders.length; i++){
				          var newId = newOrders[i].id
					  uploadIds.push(newId)
					  if (!oldOrderIds.hasOwnProperty(newId) && !allPostIds.hasOwnProperty(newId)){
				  	      offlineSource.postMessage(JSON.stringify({"order":newOrders[i]}), offlineOrigin)
					      allPostIds[newId] = true
				  	      dbService.saveOrder(newId)
					  }
				      }
				      $http.post("/order/download/done", uploadIds) // 提交完成，如何不保证不下载两次
				  }
				  $timeout(downloadOrder, 30000);
			      })
		      }

		      // 获取body高度
		      var getDocHeight = function() {
			  return $document[0].body.scrollHeight
		      }
		      
		      $scope.$watch(getDocHeight, function () {
			  if ($scope.offline){
			      var newHeight = getDocHeight()
			      offlineSource.postMessage(JSON.stringify({"height":newHeight}), offlineOrigin)
			  }
		      });

		      $scope.access = [];
		      $scope.bc = ""
		      $scope.showMenu = true
		      $scope.showBc = false
		      $scope.$parent.err = ""

		      $scope.closeError = function() {
			  $scope.err = ""
		      }
		      $scope.closeMenu = function() {
			  $scope.showMenu = false
		      }
		      $scope.openMenu = function() {
			  $scope.showMenu = true
		      }
		      $scope.actionBack = function() {
			  $window.history.back();
		      }
		      // 退出
		      $scope.actionExit = function() {
			  var ExitInstanceCtrl = function($scope, $modalInstance) {
			      $scope.ok = function() {
				  $window.location = "/user/logout"
				  $route.reload();
				  $modalInstance.close();
			      };
			      $scope.cancel = function() {
				  $modalInstance.dismiss();
			      };
			  };
			  ExitInstanceCtrl.$inject = ['$scope', '$modalInstance'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_exit.html',
			      controller: ExitInstanceCtrl,
			      size: 'lg',
			  });
		      };
		      
		  }])



offline.controller('DashboardCtrl', 
	      ['$scope', '$route', '$http', function($scope, $route, $http) {
		  $scope.access = [];
		  $scope.$parent.bc = "欢迎使用客多点管理系统"
		  $scope.$parent.showBc = false
		  $scope.$parent.err = ""
	      }])



offline.controller('ServiceChinesePosCtrl', 
		  ['$q', '$timeout', '$filter', '$scope', '$location', '$route', '$http', '$routeParams', '$modal', 'baseService', function($q, $timeout, $filter, $scope, $location, $route, $http, $routeParams, $modal, baseService) {
		      "use strict"
		      var last_create_time
		      var shiftTime
		      $scope.$parent.bc = " 中餐点餐"
		      $scope.$parent.showBc = false
		      $scope.$parent.showMenu = false
		      $scope.search = {tableCode:""}
		      $scope.takeaway = {
			  orders:[],
			  color:"btn-default"
		      }
		      
		      $scope.show = {
			  table:true,
			  operate:false,
			  shift:false,
		      }

		      var offlineOrder = function(orderData) {
			  $http.post('/order/print', orderData) 
		      }
		      
		      // 重打单
		      var offlineReprint = function(orderData) {
			  $http.post('/order/print/table', orderData) 
		      }

		      // 打开钱箱
		      var offlineCashBox = function() {
			  $http.post('/cashier/open', {}) 
		      }

		      // 结算单
		      var offlineReceipt = function(orders) {
			  for (var i=0; i<orders.length; i++){
			      for (var j=0; j<orders[i].lines.length; j++){
				   if (orders[i].lines[j].line_id === ""){
				       delete(orders[i].lines[j].line_id)
				   }
				   if (orders[i].lines[j].id === ""){
				       delete(orders[i].lines[j].id)
				   }
				   if (orders[i].lines[j].order_id === ""){
				       delete(orders[i].lines[j].order_id)
				   }
				   if (orders[i].lines[j].table_id === ""){
				       delete(orders[i].lines[j].table_id)
				   }
			       }
			       for (var k=0; j<orders[k].pays.length; k++){
				   if (orders[i].pays[k].id === ""){
				       delete(orders[i].pays[k].id)
				   }
				   if (orders[i].pays[k].create_id === ""){
				       delete(orders[i].pays[k].create_id)
				   }
			       }
			       if (orders[i].id === ""){
				       delete(orders[i].id)
			       }
			       if (orders[i].preorder_id === ""){
				       delete(orders[i].preorder_id)
			       }
			       if (orders[i].table_id === ""){
				       delete(orders[i].table_id)
			       }
			       if (orders[i].pos_id === ""){
				       delete(orders[i].pos_id)
			       }
			   }
		       	   $http.post('/order/print/receipt', orders) 
		      }

		      
		      $scope.cartProducts = []
		      // 计算每单金额
		      var calcMoney = function(order) {
			  var totalMoney = 0
			  for (var j=0; j<order.lines.length; j++) {
			      var thisQty = order.lines[j].qty - order.lines[j].cancel_qty - order.lines[j].return_qty
			      var lineMoney = thisQty * order.lines[j].price * order.lines[j].discount / 100
			      totalMoney += lineMoney
			  }
			  return totalMoney
		      }

		      var openOperate = function(table){
			  $scope.show.table = false
			  $scope.show.operate = true
			  $scope.show.shift = false
			  $scope.operate_table = table
			  table.has_new = false
		      }

		      var closeOperate = function(){
			  $scope.show.table = true
			  $scope.show.operate = false
			  $scope.show.shift = false
		      }

		      var openShift = function(){
			  $scope.show.table = false
			  $scope.show.operate = false
			  $scope.show.shift = true
		      }

		      var closeShift = function(){
			  $scope.show.table = true
			  $scope.show.operate = false
			  $scope.show.shift = false
		      }

		      var insertOrder = function(tableId, order){
			  for (var i=0; i<$scope.tables.length; i++){
			      if ($scope.tables[i].id == tableId) {
				  var inFlag = false
				  for (var j=0; j<$scope.tables[i].orders.length; j++){
				      if ($scope.tables[i].orders[j].name == order.name) {
					  inFlag = true
					  break
				      }
				  }
				  if (!inFlag) {
				      $scope.tables[i].orders.push(order)
				  }
				  break
			      }
			  }
		      }
		      
		      // 获取同一系列订单
		      var getRef = function(table){
			  var ref
			  if (table.orders.length>0) {
			      for (var i=0; i<table.orders.length; i++){
				  if (table.orders[0].ref){
				      ref = table.orders[0].ref
				  } else {
				      ref = table.orders[0].name
				  }
				  break
			      }
			  }
			  return ref
		      }

		      // 打印
		      $scope.actionPrintOrder = function(order){
			  offlineReprint(order)
		      }

		      $scope.actionPrintTable = function(table){
			  for (var i=0; i<table.orders.length; i++){
			      offlineReprint(table.orders[i])
			  }
		      }

		      // 创建订单入厨
		      $scope.actionPostOrder = function(table, cartProducts){
			  var orderData = {}
			  orderData.person_qty = table.busy_qty
			  orderData.ref = getRef(table)
			  orderData.note = $scope.note
			  orderData.lines = cartProducts
			  orderData.order_type = "in"
			  orderData.table_id = table.id
			  orderData.has_pay = false
			  // 防止同时按下两次，返回数据后方可再次按钮
			  $scope.paying = true
			  $http.post('/table/' + table.id + '/order', orderData)
			      .success(function(data) {
				  if (data.error ) {
			     	      $scope.$parent.$parent.err = data.error
				      $scope.paying = false
				  } else {
				      orderData.name = data.value
				      insertOrder(table.id, orderData)
				      offlineOrder(orderData) // 传输打印
				      table.is_busy = true
				      $route.reload()
				  }
				  $scope.paying = false
			      })
			      .error(function(data, status) {
				  $scope.$parent.$parent.err ="网络错误"
				  $scope.paying = false
			      })
		      }
		      
		      // 获取加收服务费方案
		      baseService.getPlusInfo()
			  .then(function(result){
			      $scope.plusInfo = result
			  })
		      
		      // 获取餐桌分类
		      baseService.getTCategs()
			  .then(function(result){
			      $scope.tcategs = result
			  })

		      // 获取餐桌
		      baseService.getTables()
			  .then(function(result){
			      $scope.tables = [].concat(result)
			      for (var i=0; i<$scope.tables.length; i++) {
				  $scope.tables[i].color = "btn-default"
				  $scope.tables[i].orders = []
			      }
			      $scope.tempTables = $scope.tables
			      reGet()
			  })

		      // 获取商品
		      baseService.getPscategs()
			  .then(function(result) {
			      $scope.pcategs = result
			  })

		      baseService.getProducts()
			  .then(function(result) {
			      $scope.products = result
			      $scope.tempProducts = $scope.products
			  })

		      
		      // 外卖
		      $scope.actionTakeaway = function(){
			  $location.path("/orders/out/start")
		      }

		      // 开台
		      $scope.actionTable = function(table){
			  if (table.is_busy) {
			      openOperate(table)
			  } else {
			      // 开台
			      actionOpen(table)
			  }
		      }

		      // 关闭操作
		      $scope.actionClose = function() {
			  closeOperate()
		      }

		      // 餐桌类别
		      $scope.actionTCateg = function(categId){
			  $scope.tempTables = $filter('ko_pcategFilter')($scope.tables, categId)
			  return
		      }

		      // 菜类别
		      $scope.actionPCateg = function(categId){
			  $scope.tempProducts = $filter('ko_pcategFilter')($scope.products, categId)
			  return
		      }

		      // 选择商品
		      $scope.actionProduct = function(product){
			  var final_price = product.price
			  var flag = true
			  var cartLen = $scope.cartProducts && $scope.cartProducts.length || 0
			  // 向最后一行无品味的添加商品
			  if (cartLen > 0) {
			      if ($scope.cartProducts[cartLen-1].treat.length===0 && $scope.cartProducts[cartLen-1].id === product.id) {
				  flag = false
				  $scope.cartProducts[cartLen-1].qty += 1
			      }
			  }
			  if (flag) {
			      $scope.cartProducts.push({
				  "id":product.id,
				  "name":product.name,
				  "price":final_price,
				  "qty":1,
				  "treat":[],
				  "discount":100,
			      })}
			  return
		      }

		      // 移除不需要商品
		      $scope.actionDelProduct = function(index) {
			  var tempCartProducts = []
			  var cartLen = $scope.cartProducts.length
			  for (var j=0; j<cartLen; j++) {
			      var thisLine = cartLen-index-1
			      if (j==thisLine){
				  continue
			      } 
			      tempCartProducts.push($scope.cartProducts[j])
			  }
			  $scope.cartProducts = tempCartProducts
		      }

		      // 添加作法
		      $scope.actionTreat = function(treat) {
			  var cartLen = $scope.cartProducts.length
			  $scope.cartProducts[cartLen-1].treat.push(treat)
		      }
		      
		      // 移除作法
		      $scope.removeTreat = function() {
			  var cartLen = $scope.cartProducts.length
			  $scope.cartProducts[cartLen-1].treat = []
		      }

		      // 快速定位餐台
		      $scope.$watch('search.tableCode', function() {
			  $scope.tempTables = $filter('ko_tableFilter')($scope.tables, $scope.search.tableCode)
		      });
		      
		      $scope.actionClear = function() {
			  $scope.tempTables = $scope.tables
			  $scope.search.tableCode = ""
		      }

		      // 颜色调整
		      var changeColor = function(tables) {
			  // 外卖颜色变更
			  for (var k=0; k<$scope.takeaway.orders.length; k++){
			      if ($scope.takeaway.orders[k].state == "todo"){
				  $scope.takeaway.color = "btn-warning"
				  break
			      }
			  }
			  // 堂食颜色变更
			  for (var i=0; i<tables.length; i++){
			      if (tables[i].orders.length>0){
				  tables[i].color = "btn-info"
				  for (var j=0; j<tables[i].orders.length; j++) {
				      if (tables[i].orders[j].state == "todo"){
					  tables[i].color = "btn-warning"
					  break
				      }
				  }
			      }
			  }
		      }

		      // 将订单划分到餐桌
		      var orderToTable = function(orders, isFirst){
			  for (var i=0; i<orders.length; i++) {
			      if (orders[i].table_id){
				  for (var j=0; j<$scope.tables.length; j++) {
				      if (orders[i].table_id == $scope.tables[j].id) {
					  var inFlag = false
					  for (var k=0; k<$scope.tables[j].orders.length; k++){
					      if ($scope.tables[j].orders[k].name == orders[i].name) {
						  inFlag = true
						  break
					      }
					  }
					  if (!inFlag){
					      $scope.tables[j].orders.push(orders[i])
					      if (!isFirst){
						  $scope.tables[j].has_new = true
					      }
					  }
					  break
				      }
				  }
			      } else {
				  $scope.takeaway.orders.push(orders[i])
			      }
			  }
			  return 
		      }

		      // 自助订单提醒
		      var alarmOrder = function(allLines){
			  // if (alarmNanoSec > 0){
			  //     var now = (new Date()).getTime()
			  //     for (var j=0; j<allLines.length; j++) {
			  // 	  var orderTimeStamp = new Date(allLines[j].create_date).getTime()
			  // 	  if (orderTimeStamp + alarmNanoSec < now) {
			  // 	      allLines[j].t = true
			  // 	  } else {
			  // 	      allLines[j].t = false
			  // 	  }
			  //     }
			  // }
			  // return allLines
		      }

		      
		      // 移除已经完成的订单
		      var removeHas = function(orderIds) {
			  var finalOrders = []
			  return finalOrders
		      }

		      // 获取未完成订单
		      var getOrder = function(last_create_time) {
			  var deferred = $q.defer()
			  var params 
			  if (last_create_time){
			      params = {last_time:last_create_time}
			  }
			  $http.get('/orders/get_todo', {params:params})
			      .success(function(data) {
				  if (data.error) {
				      deferred.reject(data.error)
				  } else {
				      deferred.resolve(data.value)
				  }
			      })
			      .error(function(data, status, headers, config) {
				  deferred.reject("网络错误")
			      })
			  return deferred.promise
		      }

		      var reGet = function(){
			  getOrder(last_create_time).then(function(result){
			      if (!result) {
				  result = []
			      }
			      var isFirst
			      if (!last_create_time){
				  isFirst = true
			      }
			      result = $filter('orderBy')(result, '-create_date')
			      if (result.length>0){
				  last_create_time = result[0].create_date
				  orderToTable(result, isFirst)
				  changeColor($scope.tables)
			      }
			      $timeout(reGet, 5000);
			  })
		      }

		      // 开台
		      var actionOpen = function(table) {
			  var TableInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.tempPersonQty = ""
			      $scope.actionPersonQtyCancel = function () {
				  $modalInstance.dismiss('cancel');
			      };

			      $scope.actionPersonQtyOk = function(tempPersonQty){
				  var personQty = parseInt(tempPersonQty)
				  $modalInstance.close([table, personQty])
			      }
			  };
			  TableInstanceCtrl.$inject = ['$scope', '$modalInstance', 'table'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_open.html',
			      controller: TableInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  table: function () {
			      	      return table;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) {
			      // 1. 开台
			      var tableId = result[0].id
			      var personQty = result[1]
			      $http.get("/table/" + tableId + "/start", {params:{person_qty:personQty}})
				  .success(function(data, status) {
				      if (data.error) {
					  alert(data.error)
				      } else {
					  // 2. 打开
					  for (var i=0; i<$scope.tables.length; i++){
					      if ($scope.tables[i].id == tableId){
						  $scope.tables[i].busy_qty = personQty
						  $scope.tables[i].is_busy = true
						  openOperate($scope.tables[i])
					      }
					  }
				      }
				  })
			  }, function(reason){ // Dismiss时执行
			      console.log(reason)
			  });
		      }
		      
		      // 改变人数
		      $scope.actionPerson = function(table) {
			  var PersonInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.tempPersonQty = ""
			      $scope.actionPersonQtyCancel = function () {
				  $modalInstance.dismiss('cancel');
			      };

			      $scope.actionPersonQtyOk = function(tempPersonQty){
				  var personQty = parseInt(tempPersonQty)
				  $http.get('/table/' + table.id + '/person', {
				      params:{
					  qty:personQty
				      }
				  })
				      .success(function(data) {
					  if (data.error ) {
					      alert(data.error)
					  } else {
					      alert("修改成功")
					      $modalInstance.close([table, personQty])
					  }
				      })
				      .error(function(data, status) {
					  $scope.$parent.$parent.err ="网络错误"
				      })
			      }
			  };
			  PersonInstanceCtrl.$inject = ['$scope', '$modalInstance', 'table'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_person.html',
			      controller: PersonInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  table: function () {
			      	      return table;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) {
			      // 1. 人数变更
			      var tableId = result[0].id
			      var personQty = result[1]
			      for (var i=0; i<$scope.tables.length; i++){
				  if ($scope.tables[i].id == tableId){
				      $scope.tables[i].busy_qty = personQty
				  }
			      }
			  }, function(reason){ // Dismiss时执行
				  console.log(reason)
			  });
		      }
		      
		      // 换并桌
		      $scope.actionChangeTable = function(order) {
			  var ChangeTableInstanceCtrl = function ($scope, $modalInstance, baseService, order) {
			      // 获取餐桌分类
			      baseService.getTCategs()
			  	  .then(function(result){
			  	      $scope.tcategs = result
			  	  })

			      // 获取餐桌
			      baseService.getTables()
			  	  .then(function(result){
			  	      $scope.tables = [].concat(result)
			  	      $scope.tempTables = $scope.tables
			  	      reGet()
			  	  })
			      
			      $scope.actionTCateg = function(categId){
			  	  $scope.tempTables = $filter('ko_pcategFilter')($scope.tables, categId)
			  	  return
			      }
			      
			      $scope.changeTableCancel = function() {
				  $modalInstance.dismiss();
			      }
			      
			      $scope.changeTableOk = function(newTableId) {
			  	  $http.get('/order/' + order.id + '/table',
			  	  	    {params:{table:newTableId}}
			  	  	   )
			  	      .success(function(data) {
			  	  	  if (data.error) {
			  	  	      alert(data.error)
			  	  	  } else {
			  	  	      alert("操作成功")
			  	  	      $route.reload();
		      	  	  	      $modalInstance.close();
			  	  	  }
			  	      })
			  	      .error(function(data, status) {
			  	  	  console.log("网络错误")
			  	      })				  
			      }
			  };
			  ChangeTableInstanceCtrl.$inject = ['$scope', '$modalInstance', 'baseService', 'order'];
			  
			  var modalInstance = $modal.open({
			      templateUrl: 'action_change_table.html',
			      controller: ChangeTableInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  order: function () {
			      	      return order;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) { // Close时执行
			  }, function(reason){ // Dismiss时执行
			      console.log(reason)
			  });
		      };
		      
		      // 订单审核
		      $scope.actionConfirm = function (order) {
			  $http.get('/order/' + order.id + '/confirm')
			      .success(function(data) {
				  if (data.error ) {
				      alert(data.error)
				  }
				  $route.reload()
			      })
			      .error(function() {
				  $scope.$parent.err = "网络错误"
			      })
		      }

		      // 订单取消
		      $scope.actionCancel = function (order) {
		      	  var CancelInstanceCtrl = function ($scope, $modalInstance, order) {
		      	      $scope.temp = {}
		      	      $scope.ok = function () {
		      		  $http.get('/order/' + order.id + '/cancel')
		      		      .success(function(data) {
		      			  if (data.error ) {
		      			      alert(data.error)
		      			  } else {
		      			      $modalInstance.close();
					      $route.reload()
		      			  }
		      		      })
		      		      .error(function() {
		      			  console.log("网络错误")
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  CancelInstanceCtrl.$inject = ['$scope', '$modalInstance', 'order'];
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_cancel.html',
		      	      controller: CancelInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  order: function () {
		      	      	      return order;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 退单
		      $scope.actionReturnOrder = function (order) {
		      	  var ReturnOrderInstanceCtrl = function ($scope, $modalInstance, order) {
		      	      $scope.order = order
		      	      $scope.ok = function () {
		      		  $http.get('/order/' + order.id + '/return')
		      		      .success(function(data, status) {
		      			  if (data.error ) {
		      			      alert(data.error);
		      			  } else {
		      			      alert("退单成功!");
		      			  }
		      			  $modalInstance.close();
		      			  $route.reload();
		      		      })
		      		      .error(function(data, status) {
		      			  alert("网络错误");
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  ReturnOrderInstanceCtrl.$inject = ['$scope', '$modalInstance', 'order'];
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_return_order.html',
		      	      controller: ReturnOrderInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  order: function () {
		      	      	      return order;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 退品
		      $scope.actionReturnOne = function(order, line) {
		      	  var ReturnOneInstanceCtrl = function ($scope, $modalInstance, order, line) {
		      	      $scope.order = order
		      	      $scope.avail_pays = []
		      	      var money_qty = 0
		      	      if (order.has_pay){
		      		  for (var i=0; i<order.pays.length; i++) {
		      		      // 跳过退款行
		      		      if (order.pays[i].is_return) {
		      			  continue
		      		      }
		      		      var payType = order.pays[i].pay_type
		      		      if (payType === "cash"){
		      			  $scope.avail_pays.push({"id":payType, "name":"现金"})
		      		      } else if (payType === "card"){
		      			  $scope.avail_pays.push({"id":payType, "name":"银行卡"})
		      		      } else if (payType === "own"){
		      			  $scope.avail_pays.push({"id":payType, "name":"签单"})
		      		      } else if (payType === "tenpay"){
		      			  $scope.avail_pays.push({"id":payType, "name":"微信"})
		      		      } else if (payType === "alipay"){
		      			  $scope.avail_pays.push({"id":payType, "name":"支付宝"})
		      		      } else if (payType === "coupon"){
		      			  $scope.avail_pays.push({"id":payType, "name":"优惠券"})
		      		      } else if (payType === "tenpay_coupon"){
		      			  $scope.avail_pays.push({"id":payType, "name":"微信优惠券"})
		      		      } else if (payType === "mypay"){
		      			  var moneyName = order.pays[i].name
		      			  $scope.avail_pays.push({"id":payType, "name":"充值卡", "moneyName":moneyName})
		      		      }
		      		  }
		      		  money_qty = line.qty * line.price * line.discount /100
		      	      }
			      
		      	      $scope.cancelProduct = {
		      		  "id":line.id,
		      		  "name":line.name,
		      		  "qty":line.qty,
		      		  "money_qty":money_qty,
		      		  "payType":$scope.avail_pays && $scope.avail_pays[0]
		      	      }
		      	      $scope.ok = function() {
		      		  var params = {"product_qty":$scope.cancelProduct.qty}
		      		  if ($scope.cancelProduct.money_qty>0) {
		      		      params.money_type = $scope.cancelProduct.payType.id
		      		      params.money_name = $scope.cancelProduct.payType.moneyName
		      		      params.money_qty = $scope.cancelProduct.money_qty
		      		  }
		      		  $http.get('/order/' + order.id + '/orderline/' + line.line_id + '/cancel',
		      			    {params:params})
		      		      .success(function(data, status) {
		      			  if (data.error ) {
		      			      alert(data.error)
		      			  } else {
		      			      alert("退品成功")
		      			      $modalInstance.close();
		      			      $route.reload()
		      			  }
		      		      })
		      		      .error(function(data, status, headers, config) {
		      			  $scope.$parent.err = "网络错误"
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  }
		      	  ReturnOneInstanceCtrl.$inject = ['$scope', '$modalInstance', 'order', 'line'];
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_return_one.html',
		      	      controller: ReturnOneInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      		  order:function () {
		      	      	      return order;
		      	      	  },
		      		  line:function () {
		      	      	      return line;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 结账
		      $scope.actionMoney = function (table) {
		      	  var MoneyInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.orderlines = []
			      $scope.totalprice = 0
			      $scope.tempMoneyStr = ""
			      $scope.plusInfo = {}
			      $scope.discount = 0
			      $scope.plusprice = 0
			      $scope.total = $scope.totalprice + $scope.plusprice
			      
			      // 计算服务费
			      var calcPlus = function(){
				  if ($scope.plusInfo.plus_state === 0){
				      return 0
				  } else if ($scope.plusInfo.plus_state == 1){
				      return $scope.plusInfo.plus_calc
				  } else if ($scope.plusInfo.plus_state == 2){
				      return $scope.plusInfo.plus_calc * table.busy_qty
				  } else if ($scope.plusInfo.plus_state == 3){
				      return parseInt($scope.plusInfo.plus_calc * $scope.totalprice / 100)
				  } 
				  return
			      }

			      baseService.getPlusInfo()
				  .then(function(result){
				      $scope.plusInfo = result
				      $scope.plusprice = calcPlus()
				  })

			      for (var i=0; i<table.orders.length; i++){
				  $scope.totalprice += calcMoney(table.orders[i])
				  for (var j=0; j<table.orders[i].lines.length; j++){
				      $scope.orderlines.push(table.orders[i].lines[j])
				  }
				  $scope.plusprice = calcPlus()
			      }

			      $scope.use= {
				  discount:false,
				  tenpay_coupon:false,
				  coupon:false,
				  cash:true
			      }

			      $scope.money = {
				  cash:0,
				  coupon:0,
				  tenpay_coupon:0,
				  left:0
			      }
			      
			      $scope.actionReceipt = function(){
				  offlineReceipt(table.orders)
			      }
			      
			      // 计算余额
			      var getRestMoney = function() {
				  if ($scope.discount>0 && $scope.discount<100) {
				      $scope.money.left = Math.floor(($scope.totalprice + $scope.plusprice) * $scope.discount/100) - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				      $scope.total = Math.floor(($scope.totalprice + $scope.plusprice) * $scope.discount / 100)
				  } else {
				      $scope.total = $scope.totalprice + $scope.plusprice
				      $scope.money.left = $scope.totalprice + $scope.plusprice - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  }
				  return
			      }

			      $scope.$watch('tempMoneyStr', function() {
				  if ($scope.use.cash) {
				      $scope.money.cash = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.coupon) {
				      $scope.money.coupon = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.tenpay_coupon) {
				      $scope.money.tenpay_coupon = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.discount) {
				      $scope.discount = parseInt($scope.tempMoneyStr) 
				  } 
				  getRestMoney()
			      });

			      $scope.actionTenpayCoupon = function(){
				  $scope.use.tenpay_coupon = true
				  $scope.use.coupon = false
				  $scope.use.cash = false
				  $scope.use.discount = false
				  if ($scope.money.tenpay_coupon>0){
				      $scope.tempMoneyStr = $scope.money.tenpay_coupon + ""
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }

			      $scope.actionCoupon = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = true
				  $scope.use.cash = false
				  $scope.use.discount = false
				  if ($scope.money.coupon>0){
				      $scope.tempMoneyStr = $scope.money.coupon + ""
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }
			      
			      $scope.actionCash = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = false
				  $scope.use.cash = true
				  $scope.use.discount = false
				  if ($scope.money.cash>0) {
				      $scope.tempMoneyStr = $scope.money.cash + "" 
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }

			      $scope.actionLess = function(){
				  $scope.plusprice = 0
				  getRestMoney()
			      }

			      // 折扣
			      $scope.actionDiscount = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = false
				  $scope.use.cash = false
				  $scope.use.discount = true
				  $scope.tempMoneyStr = $scope.discount + ""
			      }
			      
			      // 订单总价
			      $scope.actionOk = function () {
				  var realCash, rest
				  if ($scope.discount>0 && $scope.discount<100) {
				      rest = Math.floor(($scope.totalprice + $scope.plusprice)*$scope.discount/100) - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  } else {
				      rest = $scope.totalprice + $scope.plusprice - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  }
				  if (rest<0) {
				      realCash = Math.floor(($scope.totalprice + $scope.plusprice)*$scope.discount/100) - $scope.money.coupon - $scope.money.tenpay_coupon
				  } else {
				      realCash = $scope.money.cash
				  }
				  $http.get('/table/' + table.id + '/money',
					    {params:{
						plus:$scope.plusprice,
						discount:$scope.discount,
						cash:parseInt(realCash),
						coupon:$scope.money.coupon,
						tenpay_coupon:$scope.money.tenpay_coupon,
					    }}
					   )
				      .success(function(data) {
					  if (data.error ) {
					      alert(data.error)
					  } else {
					      $modalInstance.close(table);
					      table.is_busy = false
					      table.busy_qty = 0
					      offlineReceipt(table.orders)
					      alert("结账成功!")
					      $route.reload();
					  }
				      })
				      .error(function(data, status) {
					  alert("网络错误")
				      })
			      };
		      	      $scope.actionCancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  MoneyInstanceCtrl.$inject = ['$scope', '$modalInstance', 'table'];
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_money.html',
		      	      controller: MoneyInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  table: function () {
		      	      	      return table;
		      	      	  }
		      	      }
		      	  });
		      };


		      // 交班验证
		      $scope.actionToShift = function() {
		      	  var ModalInstanceCtrl = function ($scope, $modalInstance) {
			      $scope.manager = {}
			      $scope.ok = function() {
		      		  $modalInstance.close([$scope.manager]);
			      };
			      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
			  }
			  ModalInstanceCtrl.$inject = ['$scope', '$modalInstance'];
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_to_shift.html',
		      	      controller: ModalInstanceCtrl,
		      	      size: 'lg',
			  });
			  modalInstance.result.then(function(manager) { // Close时执行
			      actionShift(manager)
			  });
		      };

		      // 交班金额
		      var actionShift = function (manager) {
			  $scope.allDatas = {}
			  $scope.cash = 0
			  shiftTime = (new Date()).getTime()
			  $http.get('/orders/check',
				    {params:{
					manager_name:manager[0].name,
					manager_password:manager[0].password,
				    }
				    })
			      .success(function(data) {
				  if (data.error ) {
				      alert(data.error)
				  } else {
			     	      var results = data.value
				      $scope.company_info = data.value.company_info
				      $scope.order_count = data.value.order_count
				      $scope.pays = data.value.pay_result || []
				      $scope.return_count = 0
				      $scope.return_amount = 0
				      $scope.amount = 0
				      $scope.cash = 0
				      $scope.returnPays = []
				      $scope.realPays = []
				      $scope.manager = manager[0]
				      for (var i=0; i<$scope.pays.length; i++){
					  var thisAmount =  $scope.pays[i].qty
					  if ($scope.pays[i]._id.is_return) {
					      $scope.returnPays.push($scope.pays[i])
					      $scope.return_count += 1
					      $scope.return_amount += thisAmount
					  } else {
					      $scope.realPays.push($scope.pays[i])
					      $scope.amount += thisAmount
					  }
				      }
				      // 计算实际金额
				      $scope.utotalPays = {}
				      for (var j=0; j<$scope.pays.length; j++) {
				      	  var p = $scope.pays[j]._id.pay_type
				      	  if (!$scope.utotalPays.hasOwnProperty(p)) {
				      	      $scope.utotalPays[p] = 0
				      	  }
				      	  $scope.utotalPays[p] += $scope.pays[j].qty
				      }
				      openShift()
				  }
			  })
			  .error(function(data, status, headers, config) {
			      $scope.$parent.err = "网络错误"
			  })
			  // 获取基础数据
		      };
		      
		      $scope.actionOkShift = function (manager) {
			  $http.get('/orders/shift',
				    {params:
				     {
					 shift_end:shiftTime,
					 manager_name:manager.name, 
					 manager_password:manager.password,
				     }
				    })
			      .success(function(data) {
				  if (data.error ) {
			     	      alert(data.error)
				  } else {
				      alert("交班完成!")
				  }
			      })
			      .error(function(data, status, headers, config) {
				  $scope.$parent.err = "网络错误"
			      })
			  closeShift()
			  $route.reload()
		      };
		      $scope.actionCancelShift = function () {
			  closeShift()
		      };
		      
		  }]);


// 今日订单列表
offline.controller('OrderTodayCtrl', 
		  ['$scope', '$location', '$route', '$http', '$filter', '$routeParams', '$modal', 'baseService', function($scope, $location, $route, $http, $filter, $routeParams, $modal, baseService) {
		      "use strict"
		      $scope.$parent.bc=" 今日订单"
		      $scope.$parent.showBc = true

		      // 全部
		      $scope.actionAll = function() {
			  $scope.tempOrders = $scope.orders
		      }
		      
		      // 堂食与外带
		      $scope.actionAllIn= function() {
			  var tempOrders = []
			  for (var i=0; i<$scope.orders.length; i++) {
			      if ($scope.orders[i].order_type == "in" || $scope.orders[i].order_type == "in_out") {
				  tempOrders.push($scope.orders[i])
			      }
			  }
			  $scope.tempOrders = tempOrders
		      }

		      // 外卖
		      $scope.actionAllOut= function() {
			  var tempOrders = []
			  for (var i=0; i<$scope.orders.length; i++) {
			      if ($scope.orders[i].order_type == "out") {
				  tempOrders.push($scope.orders[i])
			      }
			  }
			  $scope.tempOrders = tempOrders
		      }

		      baseService.getTables()
			  .then(function(result){
			      $scope.tables = result
			  })

		      $http.get('/orders/today')
			  .success(function(data, status) {
			      if (data.error ) {
			     	  $scope.$parent.err = data.error
			      } else {
			     	  $scope.orders = data.value
				  for (var i=0; i<$scope.orders.length; i++) {
				      $scope.orders[i].totalprice = 0;
				      for (var j=0; j<$scope.orders[i].lines.length; j++) {
					  $scope.orders[i].totalprice = $scope.orders[i].totalprice + $scope.orders[i].lines[j].price * $scope.orders[i].lines[j].qty
				      }
				  }
				  $scope.tempOrders = [].concat($scope.orders)
			      }
			  })
			  .error(function(data, status, headers, config) {
			      console.log("网络错误")
			  })

		      // 查看明细
		      $scope.actionDetail = function (order) {
			  var DetailInstanceCtrl = function ($scope, $modalInstance, order) {
			      $scope.order = order
			      $scope.cancel = function () {
				  $modalInstance.dismiss('cancel');
			      };
			  };
			  DetailInstanceCtrl.$inject = ['$scope', '$modalInstance', 'order'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_detail.html',
			      controller: DetailInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  order: function () {
			      	      return order;
			      	  }
			      }
			  });
		      };
		  }]);



offline.controller('KProductListCtrl', 
		  ['$scope', '$location', '$http', '$filter', '$routeParams', '$route', '$modal', function($scope, $location, $http, $filter, $routeParams, $route, $modal) {
		      "use strict"
		      $scope.$parent.bc = "商品估清"
		      $scope.$parent.showBc = true
		      var pageNo = $routeParams.pageNo 
		      $scope.$parent.err = ""
		      $scope.products = []
 		      $scope.pcategs = [];
		      $scope.selectedPcategs = [];
		      $scope.states = []
		      $scope.temp_states = []
		      $scope.new_states = []
		      // $scope.promotion_states = []
		      $scope.search = {}
		      // 获取全部商品分类
		      $http.get('/pscategs/getall')
		      	  .success(function(data, status) {
		      	      if (data.error ) {
		      	     	  $scope.$parent.err = data.error
		      	      } else {
		      	     	  $scope.pcategs = data.value
		      	      }
		      	  })
		      	  .error(function(data, status, headers, config) {
			      $scope.$parent.err ="网络错误"
		      	  })
		      // 获取全部可用商品状态
		      $http.get('/product/getstatus')
		      	  .success(function(data, status) {
		      	      if (data.error ) {
		      	     	  $scope.$parent.err = data.error
		      	      } else {
				  var value = data.value
		      	     	  $scope.states = value.states
		      	     	  $scope.temp_states = value.temp_states
		      	     	  $scope.new_states = value.new_states
		      	     	  // $scope.promotion_states = value.promotion_states
		      	      }
		      	  })
		      	  .error(function(data, status, headers, config) {
			      $scope.$parent.err ="网络错误"
		      	  })
		      // 载入初始数据
		      $http.get('/products/0/bulkread')
			  .success(function(data, status) {
			      if (data.error ) {
			     	  $scope.$parent.err = data.error
			      } else {
				  $scope.products = data.value
				  $scope.tempProducts = [].concat($scope.products);
			      }
			  })
			  .error(function(data, status, headers, config) {
			      $scope.$parent.err ="网络错误"
			  })

		      // 快速定位商品
		      $scope.$watch('search.productCode', function() {
			  $scope.tempProducts = $filter('ko_productFilter')($scope.products, $scope.search.productCode)
		      });
		      $scope.actionClearProduct = function(productCode) {
		      	  $scope.tempTables = $filter('ko_productFilter')($scope.products, productCode)
			  $scope.search.productCode = ""
		      }

		      // 已售完
		      $scope.actionPauseSell = function (productId) {
			  var PauseSellInstanceCtrl = function ($scope, $modalInstance, productId) {
			      $scope.temp = {}
			      $scope.ok = function () {
				  $http.get('/product/' + productId + '/disable')
				      .success(function(data, status) {
					  if (data.error ) {
					      alert(data.error)
					  }  else {
					      alert("停售成功!")
					  }
				      })
				      .error(function(data, status) {
					  console.log("网络错误")
				      })
				  $route.reload();
				  $modalInstance.close();
			      };
			      $scope.cancel = function () {
				  $modalInstance.dismiss('cancel');
			      };
			  };
			  PauseSellInstanceCtrl.$inject = ['$scope', '$modalInstance', 'productId'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_pause_sell.html',
			      controller: PauseSellInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  productId: function () {
			      	      return productId;
			      	  }
			      }
			  });
		      };
		      // 再次可售
		      $scope.actionReSell = function (productId) {
			  var ReSellInstanceCtrl = function ($scope, $modalInstance, productId) {
			      $scope.temp = {}
			      $scope.ok = function () {
				  $http.get('/product/' + productId + '/enable')
				      .success(function(data, status) {
					  if (data.error ) {
					      alert(data.error)
					  }  else {
					      alert("设置成功!")
					  }
				      })
				      .error(function(data, status) {
					  console.log("网络错误")
				      })
				  $route.reload();
				  $modalInstance.close();
			      };
			      $scope.cancel = function () {
				  $modalInstance.dismiss('cancel');
			      };
			  };
			  ReSellInstanceCtrl.$inject = ['$scope', '$modalInstance', 'productId'];
			  var modalInstance = $modal.open({
			      templateUrl: 'action_re_sell.html',
			      controller: ReSellInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  productId: function () {
			      	      return productId;
			      	  }
			      }
			  });
		      };
		  }]);
