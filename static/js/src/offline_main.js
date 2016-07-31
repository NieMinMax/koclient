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

