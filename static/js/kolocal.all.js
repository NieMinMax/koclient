var kolocal = angular.module('kolocal', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'LocalStorageModule']);

// 适用于一对一的Filter
kolocal.filter('groupFilter', function() {
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


kolocal.filter('pay_type', function() {
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


kolocal.filter('order_state', function() {
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

// 菜品按类别选择
kolocal.filter('ko_pcategFilter', function() {
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

// 订单类型
kolocal.filter('order_type', function() {
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


// 适用于一对一不确定的Filter
kolocal.filter('oneFilter', function() {
    return function(input, groups) {
	var result = ""
	if (input && groups) {
	    for (var j = 0; j<groups.length; j++){
		if (groups[j].id == input){
		    result = groups[j].name
		    break
		}
	    }
	}
	return result
    }});


// 打印
kolocal.directive('ngPrint', function () {
    //用法: <button class="btn btn-primary" ng-print print-element-id="hello">打印</button>
    var printSection = document.getElementById('printSection');
    // if there is no printing section, create one
    if (!printSection) {
        printSection = document.createElement('div');
        printSection.id = 'printSection';
        document.body.appendChild(printSection);
    }
    function link(scope, element, attrs) {
        element.on('click', function () {
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


// 数字键盘
kolocal.directive('koKey', function() {
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

kolocal.config(['$httpProvider', '$routeProvider', function($httpProvider, $routeProvider) {
    // 处理IE缓存
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    // 首页
    $routeProvider.when('/', {
        controller: "BaseCtrl",
        templateUrl: '../static/templates/base.html'
    });

    // 打印机
    $routeProvider.when('/printer', {
        controller: "PrinterCtrl",
        templateUrl: '../static/templates/printer.html'
    });

    $routeProvider.when('/data', {
        controller: "DataCtrl",
        templateUrl: '../static/templates/data.html'
    });

    // Offlie POS
    $routeProvider.when('/offline/pos', {
        controller: "ServiceSessionCtrl",
        templateUrl: '/static/templates/offline_pos_session.html'
    });

    $routeProvider.when('/offline/pos/:posId', {
        controller: "ServicePosCtrl",
        templateUrl: '/static/templates/offline_pos_order.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])

// 基础设置
kolocal.controller('BaseCtrl', 
		   ['$scope', '$window', '$location', '$http', function($scope, $window, $location, $http) {
		       "use strict"
		       // 打印机管理
		       $scope.actionPrinter = function() {
			   $location.path("/printer") 
		       }

		       // 离线模式
		       $scope.actionOffline = function() {
			   $window.location = "http://127.0.0.1:34301/offline/main"
		       }

		       // 在线收银管理
		       $scope.actionOnline = function() {
			   $window.location = "/exchange"
		       }
		       
		   }])


// 打印机设置
kolocal.controller('PrinterCtrl', 
		   ['$scope', '$window', '$location', '$http', function($scope, $window, $location, $http) {
		       "use strict"
		       // 退出
		       $scope.actionClose = function() {
			   $location.path("/") 
		       }
		       // 打印机类型
		       $scope.err = ""
		       $scope.closeError = function(){
			   $scope.err = ""
		       }
		       
		       $scope.actionClose = function() {
			   $location.path("/") 
		       }
		       
		       $scope.avail_printer_types = [
			   {"name":"本地打印机", "value":"driver"},
		     	   // {"name":"网络打印机", "value":"net"},
		       ]

		       $scope.avail_place = [1, 2, 3, 4, 5, 6, 7, 8, 9]

		       $http.get('/conf/get')
		       	   .success(function(data) {
		       	       if (data.error ) {
		       	     	   $scope.$parent.err = data.error
		       	       } else {
		       		   $scope.receiptPrinter = data.value.receipt
		       		   $scope.cookiePrinters = data.value.cookie || []
				   $scope.donePrinters = data.value.done || []
				   $scope.tablePrinters = data.value.table || []
		       		   $scope.download = data.value.download
				   $scope.returned_notify = data.value.returned_notify
		       		   $scope.company_id = data.value.company_id
				   $scope.server_key = data.value.server_key
		       	       }
		       	   })
		       	   .error(function() {
		       	       $scope.$parent.err = "网络错误"
		       	   })

		       $http.get('/conf/localprinter')
		       	   .success(function(data) {
		       	       if (data.error ) {
		       	     	   $scope.$parent.err = data.error
		       	       } else {
				   $scope.localprinters = data.value
		       	       }
		       	   })
		       	   .error(function() {
		       	       $scope.$parent.err = "网络错误"
		       	   })

		       // 出品打印机
		       $scope.addCookiePrinter = function(){
		       	   $scope.cookiePrinters.push({
		       	       width:0,
		       	       name:"",
		       	       type:"driver",
		       	       ip:"",
		       	       out:0,
		       	   })
		       }

		       $scope.removeCookiePrinter = function(index){
		       	   var tempCookiePrinters = []
		       	   for (var m=0; m<$scope.cookiePrinters.length; m++) {
		       	       if (m != index) {
		       		   tempCookiePrinters.push($scope.cookiePrinters[m])
		       	       }
		       	   }
		       	   $scope.cookiePrinters = tempCookiePrinters
		       }

		       // 传菜打印机
		       $scope.addDonePrinter = function(){
		       	   $scope.donePrinters.push({
		       	       width:0,
		       	       name:"",
		       	       type:"driver",
		       	       ip:"",
		       	       out:0,
		       	   })
		       }

		       $scope.removeDonePrinter = function(index){
		       	   var tempDonePrinters = []
		       	   for (var m=0; m<$scope.donePrinters.length; m++) {
		       	       if (m != index) {
		       		   tempDonePrinters.push($scope.donePrinters[m])
		       	       }
		       	   }
		       	   $scope.donePrinters = tempDonePrinters
		       }
		       

		       $scope.addTablePrinter = function(){
		       	   $scope.tablePrinters.push({
		       	       width:0,
		       	       name:"",
		       	       type:"driver",
		       	       ip:"",
		       	       out:0,
		       	   })
		       }

		       $scope.removeTablePrinter = function(index){
		       	   var tempTablePrinters = []
		       	   for (var m=0; m<$scope.tablePrinters.length; m++) {
		       	       if (m != index) {
		       		   tempTablePrinters.push($scope.tablePrinters[m])
		       	       }
		       	   }
		       	   $scope.tablePrinters = tempTablePrinters
		       }

		       $scope.actionSave = function(){
			   if (!$scope.direct) {
			       if (!($scope.receiptPrinter.type || $scope.receiptPrinter.width || !$scope.receiptPrinter.place)){
		       		   $scope.err = "请将小票/交班打印机内容填写完整!"
		       	       }
			   }
		       	   if ($scope.cookiePrinters.length>0){
		       	       for (var k=0; k<$scope.cookiePrinters.length; k++) {
		       		   if (!($scope.cookiePrinters[k].type || $scope.cookiePrinters[k].width || !$scope.cookiePrinters[k].place)) {
				       $scope.err = "请将出品打印机内容填写完整!"
		       		       return
		       		   }
		       	       }
		       	   }
		       	   var newData = {
			       receipt : $scope.receiptPrinter,
			       table : $scope.tablePrinters,
			       cookie : $scope.cookiePrinters,
			       done : $scope.donePrinters,
		       	       download : $scope.download,
			       company_id : $scope.company_id,
			       server_key : $scope.server_key,
			       returned_notify : $scope.returned_notify
			   }
		       	   $http.post('/conf/save', newData) 
		       	       .success(function(data) {
		       		   if (data.error ) {
		       		       alert(data.error)
		       		   } else {
				       alert("保存成功,请重启系统")
		       		   }
		       	       })
		       	       .error(function(data, status) {
		       		   $scope.$parent.err = "网络错误"
		       	       })
		       }
		   }])

