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
