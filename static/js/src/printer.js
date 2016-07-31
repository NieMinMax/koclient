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

