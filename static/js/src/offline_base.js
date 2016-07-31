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
			  var modalInstance = $modal.open({
			      templateUrl: 'action_exit.html',
			      controller: ExitInstanceCtrl,
			      size: 'lg',
			  });
		      };
		      
		  }])


