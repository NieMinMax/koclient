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


