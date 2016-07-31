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

