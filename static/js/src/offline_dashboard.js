offline.controller('DashboardCtrl', 
	      ['$scope', '$route', '$http', function($scope, $route, $http) {
		  $scope.access = [];
		  $scope.$parent.bc = "欢迎使用客多点管理系统"
		  $scope.$parent.showBc = false
		  $scope.$parent.err = ""
	      }])


