var kolocal = angular.module('kolocal', ['LocalStorageModule']);

// iframe 载入完成
kolocal.directive('iframeOnload', [function(){
    return {
	scope: {
            callBack:'&iframeOnload'
	},
	link: function(scope, element, attrs){
            element.on('load', function(){
		return scope.callBack();
            })
	}
    }}]);


kolocal.controller('ExchangeCtrl', 
		   ['$scope', '$window', '$location', '$http', '$q', '$document', function($scope, $window, $location, $http, $q, $document) {
		       "use strict"

		       var serverView = document.getElementById('client');
		       var serverOrigin = "http://www.kocrm.com"

		       $scope.bodyHeight = 818
		       $scope.iframeLoadedCallBack = function(){
			   var thisMessage
			   // 不读取download信息
			   thisMessage = JSON.stringify({"check":false})
			   serverView.contentWindow.postMessage(thisMessage, serverOrigin);
		       }

		       var treatHeight = function(height) {
			   $scope.bodyHeight = height
			   $scope.$apply()
		       }

		       var treatInfo = function(info) {
		       	   $http.post('/info/save', info)
		       }

		       var treatPlus = function(plus) {
		       	   $http.post('/company/saveplus', plus)
		       }

		       var treatPcateg = function(pcategData) {
			   for (var i=0; i<pcategData.length; i++){
			       if (pcategData[i].ptreat_id === ""){
				   delete(pcategData[i].ptreat_id)
			       }
			   }
		       	   $http.post('/pcateg/save', pcategData) 
		       }
		       
		       var treatProduct = function(productData) {
			   for (var i=0; i<productData.length; i++){
			       if (productData[i].categ_id === ""){
				   delete(productData[i].categ_id)
			       }
			   }
		       	   $http.post('/product/save', productData) 
		       }

		       var treatTreat = function(ptreatData) {
		       	   $http.post('/ptreat/save', ptreatData) 
		       }
		       
		       var treatPay = function(payData) {
		       	   $http.post('/pay/save', payData) 
		       }
		       
		       var treatTcateg = function(categData) {
		       	   $http.post('/tcateg/save', categData) 
		       }

		       var treatTable = function(tableData) {
			   for (var i=0; i<tableData.length; i++){
			       if (tableData[i].categ_id === ""){
				   delete(tableData[i].categ_id)
			       }
			   }
		       	   $http.post('/table/save', tableData) 
		       }

		       // 开钱箱
		       var openCashierDrawer = function() {
		       	   $http.post('/cashier/open', {}) 
		       }

		       // 订单确认，打印餐桌总单与出品单
		       var treatOrder = function(orderData) {
		       	   $http.post('/order/print/first', orderData) 
		       }
		       
		       var treatReprint = function(order) {
			   for (var j=0; j<order.lines.length; j++){
			       if (order.lines[j].line_id === ""){
				   delete(order.lines[j].line_id)
			       }
			       if (order.lines[j].id === ""){
				   delete(order.lines[j].id)
			       }
			       if (order.lines[j].order_id === ""){
				   delete(order.lines[j].order_id)
			       }
			       if (order.lines[j].table_id === ""){
				   delete(order.lines[j].table_id)
			       }
			   }
			   for (var k=0; j<order.pays.length; k++){
			       if (order.pays[k].id === ""){
				   delete(order.pays[k].id)
			       }
			       if (order.pays[k].create_id === ""){
				   delete(order.pays[k].create_id)
			       }
			   }
			   if (order.id === ""){
			       delete(order.id)
			   }
			   if (order.preorder_id === ""){
			       delete(order.preorder_id)
			   }
			   if (order.table_id === ""){
			       delete(order.table_id)
			   }
			   if (order.pos_id === ""){
			       delete(order.pos_id)
			   }
		       	   $http.post('/order/print/table', order) 
		       }

		       // 传菜单
		       var treatDone = function(lineData) {
		       	   $http.post('/order/print/line/done', lineData) 
		       }

		       // 退单
		       var treatReturnOrder = function(order) {
			   for (var j=0; j<order.lines.length; j++){
			       if (order.lines[j].line_id === ""){
				   delete(order.lines[j].line_id)
			       }
			       if (order.lines[j].id === ""){
				   delete(order.lines[j].id)
			       }
			       if (order.lines[j].order_id === ""){
				   delete(order.lines[j].order_id)
			       }
			       if (order.lines[j].table_id === ""){
				   delete(order.lines[j].table_id)
			       }
			   }
			   for (var k=0; j<order.pays.length; k++){
			       if (order.pays[k].id === ""){
				   delete(order.pays[k].id)
			       }
			       if (order.pays[k].create_id === ""){
				   delete(order.pays[k].create_id)
			       }
			   }
			   if (order.id === ""){
			       delete(order.id)
			   }
			   if (order.preorder_id === ""){
			       delete(order.preorder_id)
			   }
			   if (order.table_id === ""){
			       delete(order.table_id)
			   }
			   if (order.pos_id === ""){
			       delete(order.pos_id)
			   }
		       	   $http.post('/order/print/return_order', order) 
		       }

		       // 退品
		       var treatReturnOne = function(lineData) {
		       	   $http.post('/order/print/return_one', lineData) 
		       }
		       
		       // 小票
		       var treatReceipt = function(orders) {
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

		       $window.addEventListener('message', function(event) {
		       	   var origin = event.origin
		       	   if (origin == serverOrigin && event.data){
		       	       var messageData = JSON.parse(event.data);
		       	       if (messageData.info) {
		       		   treatInfo(messageData.info)
		       	       } else if (messageData.plus) {
				   treatPlus(messageData.plus)
		       	       } else if (messageData.height) {
				   treatHeight(messageData.height)
		       	       } else if (messageData.pcateg) {
		       		   treatPcateg(messageData.pcateg)
		       	       } else if (messageData.product) {
		       		   treatProduct(messageData.product)
		       	       } else if (messageData.ptreat) {
		       		   treatTreat(messageData.ptreat)
		       	       } else if (messageData.pays) {
		       		   treatPay(messageData.pays)
		       	       } else if (messageData.tcateg) {
		       		   treatTcateg(messageData.tcateg)
		       	       } else if (messageData.table) {
		       		   treatTable(messageData.table)
		       	       } else if (messageData.order) {
		       		   treatOrder(messageData.order)
		       	       } else if (messageData.reprint) {
		       		   treatReprint(messageData.reprint)
		       	       } else if (messageData.return_order) {
		       		   treatReturnOrder(messageData.return_order)
			       } else if (messageData.return_one) {
		       		   treatReturnOne(messageData.return_one)
		       	       } else if (messageData.cashbox) {
		       		   openCashierDrawer()
			       // } else if (messageData.prepare) {
		       	       // 	   treatPrepare(messageData.prepare)
			       } else if (messageData.done) {
		       		   treatDone(messageData.done)
			       } else if (messageData.receipt) {
		       		   treatReceipt(messageData.receipt)
		       	       } else {
		       		   console.log(messageData)
		       	       }
		       	   }
		       })
		       
		   }])






