offline.controller('OrderlineListPrepareCtrl', 
		  ['$scope', '$timeout', '$location', '$route', '$http', '$filter', '$routeParams', '$modal', 'localStorageService', '$q', 'baseService', function($scope, $timeout, $location, $route, $http, $filter, $routeParams, $modal, localStorageService, $q, baseService) {
		      "use strict"
		      $scope.$parent.bc = "备菜"
		      $scope.$parent.showBc = true
		      $scope.orderLines = []
		      $scope.tempOrderlines = []
		      $scope.newLen = 0
		      var allProducts
		      var newLines = []
		      var lastConfirm
		      var thisPlaceProducts = {} // 本地显示的商品
		      var placeKey = 'prepare'
		      var alarmKey = 'alarm'
		      $scope.search = {
			  place : localStorageService.get(placeKey),
			  alarm : localStorageService.get(alarmKey),
			  markNo:"",
			  tableCode:"",
			  productCode:"",
		      }

		      var alarmNanoSec // 超时毫秒数
		      var alarmMin = parseInt($scope.search.alarm)
		      if (alarmMin > 0) {
			  alarmNanoSec = alarmMin * 60 * 1000
		      }
		      // 按出品位进行过滤
		      var filterLines = function(lines) {
			  var results = []
			  for (var k=0; k<lines.length; k++){
			      var thisPID = lines[k].id
			      if (thisPlaceProducts.hasOwnProperty(thisPID)) {
				  results.push(lines[k])
			      }
			  }
			  return results
		      }
		      // 统计各品总数量
		      var countProduct = function(lines) {
			  var count = {}
			  for (var k=0; k<lines.length; k++) {
			      // 不再统计已备好的菜
			      var pid = lines[k].id
			      var todoQty = lines[k].qty - lines[k].prepare_qty
			      if (count.hasOwnProperty(pid)){
				  count[pid] += todoQty
			      } else {
				  count[pid] = todoQty
			      }
			  }
			  return count
		      }

		      // 加入超时提醒
		      var alarmOrder = function(allLines){
			  if (alarmNanoSec > 0){
			      var now = (new Date()).getTime()
			      for (var j=0; j<allLines.length; j++) {
				  var orderTimeStamp = new Date(allLines[j].create_date).getTime()
				  if (orderTimeStamp + alarmNanoSec < now) {
				      allLines[j].t = true
				  } else {
				      allLines[j].t = false
				  }
			      }
			  }
			  return allLines
		      }

		      // 自动超时提醒
		      var doAlarmOrder = function(){
			  if ($scope.tempOrderlines){
			      alarmOrder($scope.tempOrderlines)
			      alarmOrder($scope.orderLines)
			  }
			  $timeout(doAlarmOrder, 60000);
		      }
		      doAlarmOrder()

		      // 移除已经完成的
		      var removeHas = function(lines) {
			  var finalLines = []
			  for (var j=0; j<lines.length; j++) {
			      if (lines[j].qty-lines[j].prepare_qty>0) {
				  finalLines.push(lines[j])
			      }
			  }
			  return finalLines
		      }
		      
		      // 获取明细
		      var getOrderline = function(last_confirm_time) {
			  var deferred = $q.defer()
			  var params 
			  if (last_confirm_time){
			      params = {last_time:last_confirm_time}
			  }
			  $http.get('/orderlines/getall', {params:params})
			      .success(function(data, status) {
				  if (data.error) {
				      deferred.reject(data.error)
				  } else {
				      deferred.resolve(data.value)
				  }
			      })
			      .error(function(data, status, headers, config) {
				  deferred.reject("网络错误")
			      })
			  return deferred.promise
		      }
		      
		      var productPromise = baseService.getProducts()
		      var tablePromise = baseService.getTables()
		      var orderPromise = getOrderline()
		      $q.all([productPromise, tablePromise, orderPromise])
			  .then(function(result){
			      allProducts = result[0]
			      $scope.tables = result[1]
			      var orderLines = result[2] || []
			      // 出品位处理
			      if ($scope.search.place && $scope.search.place !== "") {
				  for (var i = 0; i < allProducts.length; i++) {
				      var thisId = allProducts[i].id
				      if (allProducts[i].place == $scope.search.place) {
				  	  if (!thisPlaceProducts.hasOwnProperty(thisId)){
				  	      thisPlaceProducts[thisId] = true
				  	  }
				      }
				  }
			      } else {
				  for (var j = 0; j < allProducts.length; j++) {
				      var thisId2 = allProducts[j].id
				      if (!thisPlaceProducts.hasOwnProperty(thisId2)){
				  	  thisPlaceProducts[thisId2] = true
				      }
				  }
			      }
			      // 1. 确认时间
			      orderLines = $filter('orderBy')(orderLines, '-confirm_date')
			      if (orderLines.length>0) {
				  lastConfirm = orderLines[0].confirm_date
			      }
			      // 2. 出品位进行过滤
			      orderLines = filterLines(orderLines)
			      // 3. 过滤已经完成的
			      orderLines = removeHas(orderLines)
			      // 4. 统计数量
			      orderLines = alarmOrder(orderLines)
			      $scope.pcount = countProduct(orderLines)
			      $scope.tempOrderlines = [].concat(orderLines)
			      $scope.orderLines = orderLines
			      reGet()
			  })
		      
		      var reGet = function(){
			  getOrderline(lastConfirm).then(
			      function(result){
				  if (!result) {
				      result = []
				  }
				  result = $filter('orderBy')(result, '-confirm_date')
				  if (result.length>0){
				      lastConfirm = result[0].confirm_date
				  }
				  result = filterLines(result)
				  newLines = [].concat(newLines, result)
				  $scope.newLen = newLines.length
				  $timeout(reGet, 5000);
			      }
			  )
		      }

		      $scope.actionRefresh = function() {
			  // 合并两个lines
			  var allLines = [].concat($scope.orderLines, newLines)
			  newLines = []
			  $scope.newLen = 0
			  allLines = removeHas(allLines)
			  allLines = alarmOrder(allLines)
			  $scope.pcount = countProduct(allLines)
			  $scope.orderLines = allLines
		      	  $scope.tempOrderlines = [].concat(allLines)
			  // 将以下查询条件清空
			  $scope.search.markNo = ""
			  $scope.search.tableCode = ""
			  $scope.search.productCode = ""
		      }

		      // 按餐台编号查找
		      $scope.$watch('search.tableCode', function() {
			  var actionTable = function(tableCode) {
			      // 获取TableId, 匹配
			      if (tableCode) {
				  var tableId = ""
				  for (var i=0; i<$scope.tables.length; i++) {
				      if ($scope.tables[i].code == tableCode) {
					  tableId = $scope.tables[i].id
					  break
				      }
				  }
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].table_id == tableId){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
				  $scope.search.productCode = ""
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionTable($scope.search.tableCode)
		      });

		      // 快速过滤商品
		      $scope.$watch('search.productCode', function() {
			  var actionProduct = function(productCode) {
			      if (productCode) {
				  var productId = ""
				  for (var i=0; i<allProducts.length; i++) {
				      if (allProducts[i].code == productCode) {
					  productId = allProducts[i].id
					  break
				      }
				  }
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].id == productId){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
				  $scope.search.tableCode = ""
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionProduct($scope.search.productCode)
		      });

		      // 快速过滤牌号
		      $scope.$watch('search.markNo', function() {
			  var actionMarkno = function(markNo) {
			      if (markNo) {
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].mark_no == markNo){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionMarkno($scope.search.markNo)
		      });
		      
		      $scope.actionClear = function () {
			  $scope.search.markNo = ""
			  $scope.search.tableCode = ""
			  $scope.search.productCode = ""
		      }

		      $scope.actionNewPlace = function(){
			  if ($scope.search.place > 0 || $scope.search.place<10){
			      localStorageService.set(placeKey, $scope.search.place)
			      $route.reload()
			  } else {
			      $scope.$parent.err = "您的出品位应该在0-10之间，填入其它数字无效!"
			  }
		      }

		      $scope.actionNewAlarm = function(){
			  if ($scope.search.alarm > 0){
			      localStorageService.set(alarmKey, $scope.search.alarm)
			      $route.reload()
			  } else {
			      $scope.$parent.err = "时间请设置为正整数，其它数字无效!"
			  }
		      }

		      // 备菜
		      $scope.actionPrepare = function (line) {
			  $http.get('/order/' + line.order_id + '/orderline/' + line.line_id + '/prepare')
			      .success(function(data, status) {
				  if (data.error ) {
				      $scope.$parent.err = data.error
				  } else {
				      // 移除该行!
				      for (var j=0; j<$scope.orderLines.length; j++) {
					  if ($scope.orderLines[j].line_id === line.line_id){
					      $scope.orderLines[j].prepare_qty = $scope.orderLines[j].qty
					  }
				      }
				      $scope.orderLines = removeHas($scope.orderLines)
				      $scope.tempOrderlines = [].concat($scope.orderLines)
				      $scope.pcount = countProduct($scope.orderLines)
				  }
			      })
			      .error(function(data, status) {
				  $scope.$parent.err = "网络错误"
			      })
		      };

		      // 显示全部备完
		      $scope.actionPrepareAll = function (orderLines) {
			  var PrepareAllInstanceCtrl = function ($scope, $modalInstance, lines) {
			      $scope.ok = function () {
			      	  for (var j=0; j<lines.length; j++) {
			      	      $http.get('/order/' + lines[j].order_id + '/orderline/' + lines[j].line_id + '/prepare')
			      	  }
				  $modalInstance.close();
			      	  $route.reload();
			      };
			      $scope.cancel = function () {
				  $modalInstance.dismiss();
			      };
			  };
			  var modalInstance = $modal.open({
			      templateUrl: 'action_prepare_all.html',
			      controller: PrepareAllInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  lines: function () {
			      	      return orderLines;
				  },
			      }
			  })}

		      // 显示该商品
		      $scope.actionPrepareProduct = function (orderLines, productId) {
		      	  var PrepareProductInstanceCtrl = function ($scope, $modalInstance, lines, productId, tables, pcount) {
			      $scope.tables = tables
			      $scope.pcount = pcount
			      var toLines = []
			      for (var i=0; i<lines.length; i++) {
				  if (lines[i].id == productId) {
				      toLines.push(lines[i])
				  }
			      }
			      $scope.productLines = toLines
			      
		      	      $scope.ok = function () {
		      	      	  for (var j=0; j<$scope.productLines.length; j++) {
		      	      	      $http.get('/order/' + $scope.productLines[j].order_id + '/orderline/' + $scope.productLines[j].line_id + '/prepare')
		      	      	  }
				  $modalInstance.close();
		      	      	  $route.reload();
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
			  
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_prepare_product.html',
		      	      controller: PrepareProductInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  lines: function () {
		      	      	      return orderLines;
		      		  },
				  productId: function () {
		      	      	      return productId;
		      		  },
		      		  tables:function() {
		      		      return $scope.tables
		      		  },
				  pcount:function(){
				      return $scope.pcount[productId]
				  },
		      	      }
		      	  })}

		  }]);


offline.controller('OrderlineListDoneCtrl', 
		  ['$scope', '$timeout', '$location', '$route', '$http', '$filter', '$routeParams', '$modal', 'localStorageService', '$q', 'baseService', function($scope, $timeout, $location, $route, $http, $filter, $routeParams, $modal, localStorageService, $q, baseService) {
		      "use strict"
		      $scope.$parent.bc = "出品传菜"
		      $scope.$parent.showBc = true
		      $scope.orderLines = []
		      $scope.tempOrderlines = []
		      $scope.newLen = 0
		      var allProducts
		      var newLines = []
		      var lastConfirm
		      var thisPlaceProducts = {} // 本地显示的商品
		      var placeKey = 'done'
		      var alarmKey = 'alarm'
		      $scope.search = {
			  place : localStorageService.get(placeKey),
			  alarm : localStorageService.get(alarmKey),
			  markNo:"",
			  tableCode:"",
			  productCode:"",
		      }

		      var alarmNanoSec // 超时毫秒数
		      var alarmMin = parseInt($scope.search.alarm)
		      if (alarmMin > 0) {
			  alarmNanoSec = alarmMin * 60 * 1000
		      }
		      // 按出品位进行过滤
		      var filterLines = function(lines) {
			  var results = []
			  for (var k=0; k<lines.length; k++){
			      var thisPID = lines[k].id
			      if (thisPlaceProducts.hasOwnProperty(thisPID)) {
				  results.push(lines[k])
			      }
			  }
			  return results
		      }
		      // 统计各品总数量
		      var countProduct = function(lines) {
			  var count = {}
			  for (var k=0; k<lines.length; k++) {
			      // 不再统计已备好的菜
			      var pid = lines[k].id
			      var todoQty = lines[k].qty - lines[k].done_qty
			      if (count.hasOwnProperty(pid)){
				  count[pid] += todoQty
			      } else {
				  count[pid] = todoQty
			      }
			  }
			  return count
		      }

		      // 加入超时提醒
		      var alarmOrder = function(allLines){
			  if (alarmNanoSec > 0){
			      var now = (new Date()).getTime()
			      for (var j=0; j<allLines.length; j++) {
				  var orderTimeStamp = new Date(allLines[j].create_date).getTime()
				  if (orderTimeStamp + alarmNanoSec < now) {
				      allLines[j].t = true
				  } else {
				      allLines[j].t = false
				  }
			      }
			  }
			  return allLines
		      }

		      // 自动超时提醒
		      var doAlarmOrder = function(){
			  if ($scope.tempOrderlines) {
			      alarmOrder($scope.tempOrderlines)
			      alarmOrder($scope.orderLines)
			  }
			  $timeout(doAlarmOrder, 60000);
		      }
		      doAlarmOrder()

		      // 移除已经完成的
		      var removeHas = function(lines) {
			  var finalLines = []
			  for (var j=0; j<lines.length; j++) {
			      if (lines[j].qty>0) {
				  finalLines.push(lines[j])
			      }
			  }
			  return finalLines
		      }
		      
		      // 获取明细
		      var getOrderline = function(last_confirm_time) {
			  var deferred = $q.defer()
			  var params 
			  if (last_confirm_time){
			      params = {last_time:last_confirm_time}
			  }
			  $http.get('/orderlines/getall', {params:params})
			      .success(function(data, status) {
				  if (data.error) {
				      deferred.reject(data.error)
				  } else {
				      deferred.resolve(data.value)
				  }
			      })
			      .error(function(data, status, headers, config) {
				  deferred.reject("网络错误")
			      })
			  return deferred.promise
		      }
		      
		      var productPromise = baseService.getProducts()
		      var tablePromise = baseService.getTables()
		      var orderPromise = getOrderline()
		      $q.all([productPromise, tablePromise, orderPromise])
			  .then(function(result){
			      allProducts = result[0]
			      $scope.tables = result[1]
			      var orderLines = result[2] || []
			      // 出品位处理
			      if ($scope.search.place && $scope.search.place !== "") {
				  for (var i = 0; i < allProducts.length; i++) {
				      var thisId = allProducts[i].id
				      if (allProducts[i].place == $scope.search.place) {
				  	  if (!thisPlaceProducts.hasOwnProperty(thisId)){
				  	      thisPlaceProducts[thisId] = true
				  	  }
				      }
				  }
			      } else {
				  for (var j = 0; j < allProducts.length; j++) {
				      var thisId2 = allProducts[j].id
				      if (!thisPlaceProducts.hasOwnProperty(thisId2)){
				  	  thisPlaceProducts[thisId2] = true
				      }
				  }
			      }
			      // 1. 确认时间
			      orderLines = $filter('orderBy')(orderLines, '-confirm_date')
			      if (orderLines.length>0) {
				  lastConfirm = orderLines[0].confirm_date
			      }
			      // 2. 出品位进行过滤
			      orderLines = filterLines(orderLines)
			      // 3. 过滤已经完成的
			      orderLines = removeHas(orderLines)
			      // 4. 统计数量
			      orderLines = alarmOrder(orderLines)
			      $scope.pcount = countProduct(orderLines)
			      $scope.tempOrderlines = [].concat(orderLines)
			      $scope.orderLines = orderLines
			      reGet()
			  })
		      
		      var reGet = function(){
			  getOrderline(lastConfirm).then(
			      function(result){
				  if (!result) {
				      result = []
				  }
				  result = $filter('orderBy')(result, '-confirm_date')
				  if (result.length>0){
				      lastConfirm = result[0].confirm_date
				  }
				  result = filterLines(result)
				  newLines = [].concat(newLines, result)
				  $scope.newLen = newLines.length
				  $timeout(reGet, 5000);
			      }
			  )
		      }

		      $scope.actionRefresh = function() {
			  // 合并两个lines
			  var allLines = [].concat($scope.orderLines, newLines)
			  newLines = []
			  $scope.newLen = 0
			  allLines = removeHas(allLines)
			  allLines = alarmOrder(allLines)
			  $scope.pcount = countProduct(allLines)
			  $scope.orderLines = allLines
		      	  $scope.tempOrderlines = [].concat(allLines)
			  // 将以下查询条件清空
			  $scope.search.markNo = ""
			  $scope.search.tableCode = ""
			  $scope.search.productCode = ""
		      }

		      // 按餐台编号查找
		      $scope.$watch('search.tableCode', function() {
			  var actionTable = function(tableCode) {
			      // 获取TableId, 匹配
			      if (tableCode) {
				  var tableId = ""
				  for (var i=0; i<$scope.tables.length; i++) {
				      if ($scope.tables[i].code == tableCode) {
					  tableId = $scope.tables[i].id
					  break
				      }
				  }
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].table_id == tableId){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
				  $scope.search.productCode = ""
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionTable($scope.search.tableCode)
		      });

		      // 快速过滤商品
		      $scope.$watch('search.productCode', function() {
			  var actionProduct = function(productCode) {
			      if (productCode) {
				  var productId = ""
				  for (var i=0; i<allProducts.length; i++) {
				      if (allProducts[i].code == productCode) {
					  productId = allProducts[i].id
					  break
				      }
				  }
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].id == productId){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
				  $scope.search.tableCode = ""
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionProduct($scope.search.productCode)
		      });

		      // 快速过滤牌号
		      $scope.$watch('search.markNo', function() {
			  var actionMarkno = function(markNo) {
			      if (markNo) {
				  var thisOrderlines = []
				  for (var j=0; j<$scope.orderLines.length; j++) {
				      if ($scope.orderLines[j].mark_no == markNo){
					  thisOrderlines.push($scope.orderLines[j])
				      }
				  }
				  $scope.tempOrderlines = thisOrderlines
			      } else {
				  $scope.tempOrderlines = $scope.orderLines
			      }
			  }
			  actionMarkno($scope.search.markNo)
		      });
		      
		      $scope.actionClear = function () {
			  $scope.search.markNo = ""
			  $scope.search.tableCode = ""
			  $scope.search.productCode = ""
		      }

		      $scope.actionNewPlace = function(){
			  if ($scope.search.place > 0 || $scope.search.place<10){
			      localStorageService.set(placeKey, $scope.search.place)
			      $route.reload()
			  } else {
			      $scope.$parent.err = "您的出品位应该在0-10之间，填入其它数字无效!"
			  }
		      }

		      $scope.actionNewAlarm = function(){
			  if ($scope.search.alarm > 0){
			      localStorageService.set(alarmKey, $scope.search.alarm)
			      $route.reload()
			  } else {
			      $scope.$parent.err = "时间请设置为正整数，其它数字无效!"
			  }
		      }

		      // 备菜
		      $scope.actionDone = function (line) {
			  $http.get('/order/' + line.order_id + '/orderline/' + line.line_id + '/done')
			      .success(function(data, status) {
				  if (data.error ) {
				      $scope.$parent.err = data.error
				  } else {
				      // 移除该行!
				      for (var j=0; j<$scope.orderLines.length; j++) {
					  if ($scope.orderLines[j].line_id === line.line_id){
					      $scope.orderLines[j].qty = 0
					  }
				      }
				      $scope.orderLines = removeHas($scope.orderLines)
				      $scope.tempOrderlines = [].concat($scope.orderLines)
				      $scope.pcount = countProduct($scope.orderLines)
				  }
			      })
			      .error(function(data, status) {
				  $scope.$parent.err = "网络错误"
			      })
		      };

		      // 显示全部备完
		      $scope.actionDoneAll = function (orderLines) {
			  var DoneAllInstanceCtrl = function ($scope, $modalInstance, lines) {
			      $scope.ok = function () {
			      	  for (var j=0; j<lines.length; j++) {
			      	      $http.get('/order/' + lines[j].order_id + '/orderline/' + lines[j].line_id + '/done')
			      	  }
				  $modalInstance.close();
			      	  $route.reload();
			      };
			      $scope.cancel = function () {
				  $modalInstance.dismiss();
			      };
			  };
			  var modalInstance = $modal.open({
			      templateUrl: 'action_done_all.html',
			      controller: DoneAllInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  lines: function () {
			      	      return orderLines;
				  },
			      }
			  })}


		      // 打印商品
		      // $scope.actionPrintA = function () {
		      // 	  var PrintAInstanceCtrl = function ($scope, $modalInstance, lines, tables) {
		      // 	      $scope.tables = tables
		      // 	      $scope.printLines = []
		      // 	      for (var i = 0; i < lines.length; i++) { 
		      // 		  if (lines[i].isSelected) {
		      // 		      $scope.printLines.push(lines[i])
		      // 		  }
		      // 	      }
		      // 	      $scope.cancel = function () {
		      // 		  $modalInstance.dismiss('cancel');
		      // 	      };
		      // 	  };
		      // 	  var modalInstance = $modal.open({
		      // 	      templateUrl: 'action_print_lines.html',
		      // 	      controller: PrintAInstanceCtrl,
		      // 	      size: 'lg',
		      // 	      resolve: {
		      // 	      	  lines: function () {
		      // 	      	      return $scope.tempOrderlines;
		      // 	      	  },
		      // 		  tables:function() {
		      // 		      return $scope.tables
		      // 		  }
		      // 	      }
		      // 	  });
		      // }


		      // 产品全部上好
		      $scope.actionDoneProduct = function (orderLines, productId) {
		      	  var DoneProductInstanceCtrl = function ($scope, $modalInstance, lines, productId, tables, pcount) {
			      $scope.tables = tables
			      $scope.pcount = pcount
			      var toLines = []
			      for (var i=0; i<lines.length; i++) {
				  if (lines[i].id == productId) {
				      toLines.push(lines[i])
				  }
			      }
			      $scope.productLines = toLines
			      
		      	      $scope.ok = function () {
		      	      	  for (var j=0; j<$scope.productLines.length; j++) {
		      	      	      $http.get('/order/' + $scope.productLines[j].order_id + '/orderline/' + $scope.productLines[j].line_id + '/done')
		      	      	  }
				  $modalInstance.close();
		      	      	  $route.reload();
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
			  
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_done_product.html',
		      	      controller: DoneProductInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  lines: function () {
		      	      	      return orderLines;
		      		  },
				  productId: function () {
		      	      	      return productId;
		      		  },
		      		  tables:function() {
		      		      return $scope.tables
		      		  },
				  pcount:function() {
				      return $scope.pcount[productId]
				  },
		      	      }
		      	  })}


		      // 显示该订单
		      $scope.actionDoneOrder = function (lines, orderId) {
		      	  var DoneOrderInstanceCtrl = function ($scope, $modalInstance, lines, orderId, tables) {
			      $scope.tables = tables
			      var toLines = []
			      for (var i=0; i<lines.length; i++) {
				  if (lines[i].order_id == orderId) {
				      toLines.push(lines[i])
				  }
			      }
			      $scope.productLines = toLines
			      
		      	      $scope.ok = function () {
		      	      	  for (var j=0; j<$scope.productLines.length; j++) {
		      	      	      $http.get('/order/' + $scope.productLines[j].order_id + '/orderline/' + $scope.productLines[j].line_id + '/done')
		      	      	  }
				  $modalInstance.close();
		      	      	  $route.reload();
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
			  
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_done_order.html',
		      	      controller: DoneOrderInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  lines: function () {
		      	      	      return $scope.tempOrderlines;
		      		  },
				  orderId: function () {
		      	      	      return orderId;
		      		  },
		      		  tables:function() {
		      		      return $scope.tables
		      		  },
		      	      }
		      	  })}

		  }]);


