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
