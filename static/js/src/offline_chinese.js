offline.controller('ServiceChinesePosCtrl', 
		  ['$q', '$timeout', '$filter', '$scope', '$location', '$route', '$http', '$routeParams', '$modal', 'baseService', function($q, $timeout, $filter, $scope, $location, $route, $http, $routeParams, $modal, baseService) {
		      "use strict"
		      var last_create_time
		      var shiftTime
		      $scope.$parent.bc = " 中餐点餐"
		      $scope.$parent.showBc = false
		      $scope.$parent.showMenu = false
		      $scope.search = {tableCode:""}
		      $scope.takeaway = {
			  orders:[],
			  color:"btn-default"
		      }
		      
		      $scope.show = {
			  table:true,
			  operate:false,
			  shift:false,
		      }

		      var offlineOrder = function(orderData) {
			  $http.post('/order/print', orderData) 
		      }
		      
		      // 重打单
		      var offlineReprint = function(orderData) {
			  $http.post('/order/print/table', orderData) 
		      }

		      // 打开钱箱
		      var offlineCashBox = function() {
			  $http.post('/cashier/open', {}) 
		      }

		      // 结算单
		      var offlineReceipt = function(orders) {
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

		      
		      $scope.cartProducts = []
		      // 计算每单金额
		      var calcMoney = function(order) {
			  var totalMoney = 0
			  for (var j=0; j<order.lines.length; j++) {
			      var thisQty = order.lines[j].qty - order.lines[j].cancel_qty - order.lines[j].return_qty
			      var lineMoney = thisQty * order.lines[j].price * order.lines[j].discount / 100
			      totalMoney += lineMoney
			  }
			  return totalMoney
		      }

		      var openOperate = function(table){
			  $scope.show.table = false
			  $scope.show.operate = true
			  $scope.show.shift = false
			  $scope.operate_table = table
			  table.has_new = false
		      }

		      var closeOperate = function(){
			  $scope.show.table = true
			  $scope.show.operate = false
			  $scope.show.shift = false
		      }

		      var openShift = function(){
			  $scope.show.table = false
			  $scope.show.operate = false
			  $scope.show.shift = true
		      }

		      var closeShift = function(){
			  $scope.show.table = true
			  $scope.show.operate = false
			  $scope.show.shift = false
		      }

		      var insertOrder = function(tableId, order){
			  for (var i=0; i<$scope.tables.length; i++){
			      if ($scope.tables[i].id == tableId) {
				  var inFlag = false
				  for (var j=0; j<$scope.tables[i].orders.length; j++){
				      if ($scope.tables[i].orders[j].name == order.name) {
					  inFlag = true
					  break
				      }
				  }
				  if (!inFlag) {
				      $scope.tables[i].orders.push(order)
				  }
				  break
			      }
			  }
		      }
		      
		      // 获取同一系列订单
		      var getRef = function(table){
			  var ref
			  if (table.orders.length>0) {
			      for (var i=0; i<table.orders.length; i++){
				  if (table.orders[0].ref){
				      ref = table.orders[0].ref
				  } else {
				      ref = table.orders[0].name
				  }
				  break
			      }
			  }
			  return ref
		      }

		      // 打印
		      $scope.actionPrintOrder = function(order){
			  offlineReprint(order)
		      }

		      $scope.actionPrintTable = function(table){
			  for (var i=0; i<table.orders.length; i++){
			      offlineReprint(table.orders[i])
			  }
		      }

		      // 创建订单入厨
		      $scope.actionPostOrder = function(table, cartProducts){
			  var orderData = {}
			  orderData.person_qty = table.busy_qty
			  orderData.ref = getRef(table)
			  orderData.note = $scope.note
			  orderData.lines = cartProducts
			  orderData.order_type = "in"
			  orderData.table_id = table.id
			  orderData.has_pay = false
			  // 防止同时按下两次，返回数据后方可再次按钮
			  $scope.paying = true
			  $http.post('/table/' + table.id + '/order', orderData)
			      .success(function(data) {
				  if (data.error ) {
			     	      $scope.$parent.$parent.err = data.error
				      $scope.paying = false
				  } else {
				      orderData.name = data.value
				      insertOrder(table.id, orderData)
				      offlineOrder(orderData) // 传输打印
				      table.is_busy = true
				      $route.reload()
				  }
				  $scope.paying = false
			      })
			      .error(function(data, status) {
				  $scope.$parent.$parent.err ="网络错误"
				  $scope.paying = false
			      })
		      }
		      
		      // 获取加收服务费方案
		      baseService.getPlusInfo()
			  .then(function(result){
			      $scope.plusInfo = result
			  })
		      
		      // 获取餐桌分类
		      baseService.getTCategs()
			  .then(function(result){
			      $scope.tcategs = result
			  })

		      // 获取餐桌
		      baseService.getTables()
			  .then(function(result){
			      $scope.tables = [].concat(result)
			      for (var i=0; i<$scope.tables.length; i++) {
				  $scope.tables[i].color = "btn-default"
				  $scope.tables[i].orders = []
			      }
			      $scope.tempTables = $scope.tables
			      reGet()
			  })

		      // 获取商品
		      baseService.getPscategs()
			  .then(function(result) {
			      $scope.pcategs = result
			  })

		      baseService.getProducts()
			  .then(function(result) {
			      $scope.products = result
			      $scope.tempProducts = $scope.products
			  })

		      
		      // 外卖
		      $scope.actionTakeaway = function(){
			  $location.path("/orders/out/start")
		      }

		      // 开台
		      $scope.actionTable = function(table){
			  if (table.is_busy) {
			      openOperate(table)
			  } else {
			      // 开台
			      actionOpen(table)
			  }
		      }

		      // 关闭操作
		      $scope.actionClose = function() {
			  closeOperate()
		      }

		      // 餐桌类别
		      $scope.actionTCateg = function(categId){
			  $scope.tempTables = $filter('ko_pcategFilter')($scope.tables, categId)
			  return
		      }

		      // 菜类别
		      $scope.actionPCateg = function(categId){
			  $scope.tempProducts = $filter('ko_pcategFilter')($scope.products, categId)
			  return
		      }

		      // 选择商品
		      $scope.actionProduct = function(product){
			  var final_price = product.price
			  var flag = true
			  var cartLen = $scope.cartProducts && $scope.cartProducts.length || 0
			  // 向最后一行无品味的添加商品
			  if (cartLen > 0) {
			      if ($scope.cartProducts[cartLen-1].treat.length===0 && $scope.cartProducts[cartLen-1].id === product.id) {
				  flag = false
				  $scope.cartProducts[cartLen-1].qty += 1
			      }
			  }
			  if (flag) {
			      $scope.cartProducts.push({
				  "id":product.id,
				  "name":product.name,
				  "price":final_price,
				  "qty":1,
				  "treat":[],
				  "discount":100,
			      })}
			  return
		      }

		      // 移除不需要商品
		      $scope.actionDelProduct = function(index) {
			  var tempCartProducts = []
			  var cartLen = $scope.cartProducts.length
			  for (var j=0; j<cartLen; j++) {
			      var thisLine = cartLen-index-1
			      if (j==thisLine){
				  continue
			      } 
			      tempCartProducts.push($scope.cartProducts[j])
			  }
			  $scope.cartProducts = tempCartProducts
		      }

		      // 添加作法
		      $scope.actionTreat = function(treat) {
			  var cartLen = $scope.cartProducts.length
			  $scope.cartProducts[cartLen-1].treat.push(treat)
		      }
		      
		      // 移除作法
		      $scope.removeTreat = function() {
			  var cartLen = $scope.cartProducts.length
			  $scope.cartProducts[cartLen-1].treat = []
		      }

		      // 快速定位餐台
		      $scope.$watch('search.tableCode', function() {
			  $scope.tempTables = $filter('ko_tableFilter')($scope.tables, $scope.search.tableCode)
		      });
		      
		      $scope.actionClear = function() {
			  $scope.tempTables = $scope.tables
			  $scope.search.tableCode = ""
		      }

		      // 颜色调整
		      var changeColor = function(tables) {
			  // 外卖颜色变更
			  for (var k=0; k<$scope.takeaway.orders.length; k++){
			      if ($scope.takeaway.orders[k].state == "todo"){
				  $scope.takeaway.color = "btn-warning"
				  break
			      }
			  }
			  // 堂食颜色变更
			  for (var i=0; i<tables.length; i++){
			      if (tables[i].orders.length>0){
				  tables[i].color = "btn-info"
				  for (var j=0; j<tables[i].orders.length; j++) {
				      if (tables[i].orders[j].state == "todo"){
					  tables[i].color = "btn-warning"
					  break
				      }
				  }
			      }
			  }
		      }

		      // 将订单划分到餐桌
		      var orderToTable = function(orders, isFirst){
			  for (var i=0; i<orders.length; i++) {
			      if (orders[i].table_id){
				  for (var j=0; j<$scope.tables.length; j++) {
				      if (orders[i].table_id == $scope.tables[j].id) {
					  var inFlag = false
					  for (var k=0; k<$scope.tables[j].orders.length; k++){
					      if ($scope.tables[j].orders[k].name == orders[i].name) {
						  inFlag = true
						  break
					      }
					  }
					  if (!inFlag){
					      $scope.tables[j].orders.push(orders[i])
					      if (!isFirst){
						  $scope.tables[j].has_new = true
					      }
					  }
					  break
				      }
				  }
			      } else {
				  $scope.takeaway.orders.push(orders[i])
			      }
			  }
			  return 
		      }

		      // 自助订单提醒
		      var alarmOrder = function(allLines){
			  // if (alarmNanoSec > 0){
			  //     var now = (new Date()).getTime()
			  //     for (var j=0; j<allLines.length; j++) {
			  // 	  var orderTimeStamp = new Date(allLines[j].create_date).getTime()
			  // 	  if (orderTimeStamp + alarmNanoSec < now) {
			  // 	      allLines[j].t = true
			  // 	  } else {
			  // 	      allLines[j].t = false
			  // 	  }
			  //     }
			  // }
			  // return allLines
		      }

		      
		      // 移除已经完成的订单
		      var removeHas = function(orderIds) {
			  var finalOrders = []
			  return finalOrders
		      }

		      // 获取未完成订单
		      var getOrder = function(last_create_time) {
			  var deferred = $q.defer()
			  var params 
			  if (last_create_time){
			      params = {last_time:last_create_time}
			  }
			  $http.get('/orders/get_todo', {params:params})
			      .success(function(data) {
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

		      var reGet = function(){
			  getOrder(last_create_time).then(function(result){
			      if (!result) {
				  result = []
			      }
			      var isFirst
			      if (!last_create_time){
				  isFirst = true
			      }
			      result = $filter('orderBy')(result, '-create_date')
			      if (result.length>0){
				  last_create_time = result[0].create_date
				  orderToTable(result, isFirst)
				  changeColor($scope.tables)
			      }
			      $timeout(reGet, 5000);
			  })
		      }

		      // 开台
		      var actionOpen = function(table) {
			  var TableInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.tempPersonQty = ""
			      $scope.actionPersonQtyCancel = function () {
				  $modalInstance.dismiss('cancel');
			      };

			      $scope.actionPersonQtyOk = function(tempPersonQty){
				  var personQty = parseInt(tempPersonQty)
				  $modalInstance.close([table, personQty])
			      }
			  };
			  var modalInstance = $modal.open({
			      templateUrl: 'action_open.html',
			      controller: TableInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  table: function () {
			      	      return table;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) {
			      // 1. 开台
			      var tableId = result[0].id
			      var personQty = result[1]
			      $http.get("/table/" + tableId + "/start", {params:{person_qty:personQty}})
				  .success(function(data, status) {
				      if (data.error) {
					  alert(data.error)
				      } else {
					  // 2. 打开
					  for (var i=0; i<$scope.tables.length; i++){
					      if ($scope.tables[i].id == tableId){
						  $scope.tables[i].busy_qty = personQty
						  $scope.tables[i].is_busy = true
						  openOperate($scope.tables[i])
					      }
					  }
				      }
				  })
			  }, function(reason){ // Dismiss时执行
			      console.log(reason)
			  });
		      }
		      
		      // 改变人数
		      $scope.actionPerson = function(table) {
			  var PersonInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.tempPersonQty = ""
			      $scope.actionPersonQtyCancel = function () {
				  $modalInstance.dismiss('cancel');
			      };

			      $scope.actionPersonQtyOk = function(tempPersonQty){
				  var personQty = parseInt(tempPersonQty)
				  $http.get('/table/' + table.id + '/person', {
				      params:{
					  qty:personQty
				      }
				  })
				      .success(function(data) {
					  if (data.error ) {
					      alert(data.error)
					  } else {
					      alert("修改成功")
					      $modalInstance.close([table, personQty])
					  }
				      })
				      .error(function(data, status) {
					  $scope.$parent.$parent.err ="网络错误"
				      })
			      }
			  };
			  var modalInstance = $modal.open({
			      templateUrl: 'action_person.html',
			      controller: PersonInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  table: function () {
			      	      return table;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) {
			      // 1. 人数变更
			      var tableId = result[0].id
			      var personQty = result[1]
			      for (var i=0; i<$scope.tables.length; i++){
				  if ($scope.tables[i].id == tableId){
				      $scope.tables[i].busy_qty = personQty
				  }
			      }
			  }, function(reason){ // Dismiss时执行
				  console.log(reason)
			  });
		      }
		      
		      // 换并桌
		      $scope.actionChangeTable = function(order) {
			  var ChangeTableInstanceCtrl = function ($scope, $modalInstance, baseService, order) {
			      // 获取餐桌分类
			      baseService.getTCategs()
			  	  .then(function(result){
			  	      $scope.tcategs = result
			  	  })

			      // 获取餐桌
			      baseService.getTables()
			  	  .then(function(result){
			  	      $scope.tables = [].concat(result)
			  	      $scope.tempTables = $scope.tables
			  	      reGet()
			  	  })
			      
			      $scope.actionTCateg = function(categId){
			  	  $scope.tempTables = $filter('ko_pcategFilter')($scope.tables, categId)
			  	  return
			      }
			      
			      $scope.changeTableCancel = function() {
				  $modalInstance.dismiss();
			      }
			      
			      $scope.changeTableOk = function(newTableId) {
			  	  $http.get('/order/' + order.id + '/table',
			  	  	    {params:{table:newTableId}}
			  	  	   )
			  	      .success(function(data) {
			  	  	  if (data.error) {
			  	  	      alert(data.error)
			  	  	  } else {
			  	  	      alert("操作成功")
			  	  	      $route.reload();
		      	  	  	      $modalInstance.close();
			  	  	  }
			  	      })
			  	      .error(function(data, status) {
			  	  	  console.log("网络错误")
			  	      })				  
			      }
			  };
			  
			  var modalInstance = $modal.open({
			      templateUrl: 'action_change_table.html',
			      controller: ChangeTableInstanceCtrl,
			      size: 'lg',
			      resolve: {
			      	  order: function () {
			      	      return order;
			      	  },
			      }
			  });
			  modalInstance.result.then(function(result) { // Close时执行
			  }, function(reason){ // Dismiss时执行
			      console.log(reason)
			  });
		      };
		      
		      // 订单审核
		      $scope.actionConfirm = function (order) {
			  $http.get('/order/' + order.id + '/confirm')
			      .success(function(data) {
				  if (data.error ) {
				      alert(data.error)
				  }
				  $route.reload()
			      })
			      .error(function() {
				  $scope.$parent.err = "网络错误"
			      })
		      }

		      // 订单取消
		      $scope.actionCancel = function (order) {
		      	  var CancelInstanceCtrl = function ($scope, $modalInstance, order) {
		      	      $scope.temp = {}
		      	      $scope.ok = function () {
		      		  $http.get('/order/' + order.id + '/cancel')
		      		      .success(function(data) {
		      			  if (data.error ) {
		      			      alert(data.error)
		      			  } else {
		      			      $modalInstance.close();
					      $route.reload()
		      			  }
		      		      })
		      		      .error(function() {
		      			  console.log("网络错误")
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_cancel.html',
		      	      controller: CancelInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  order: function () {
		      	      	      return order;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 退单
		      $scope.actionReturnOrder = function (order) {
		      	  var ReturnOrderInstanceCtrl = function ($scope, $modalInstance, order) {
		      	      $scope.order = order
		      	      $scope.ok = function () {
		      		  $http.get('/order/' + order.id + '/return')
		      		      .success(function(data, status) {
		      			  if (data.error ) {
		      			      alert(data.error);
		      			  } else {
		      			      alert("退单成功!");
		      			  }
		      			  $modalInstance.close();
		      			  $route.reload();
		      		      })
		      		      .error(function(data, status) {
		      			  alert("网络错误");
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_return_order.html',
		      	      controller: ReturnOrderInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  order: function () {
		      	      	      return order;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 退品
		      $scope.actionReturnOne = function(order, line) {
		      	  var ReturnOneInstanceCtrl = function ($scope, $modalInstance, order, line) {
		      	      $scope.order = order
		      	      $scope.avail_pays = []
		      	      var money_qty = 0
		      	      if (order.has_pay){
		      		  for (var i=0; i<order.pays.length; i++) {
		      		      // 跳过退款行
		      		      if (order.pays[i].is_return) {
		      			  continue
		      		      }
		      		      var payType = order.pays[i].pay_type
		      		      if (payType === "cash"){
		      			  $scope.avail_pays.push({"id":payType, "name":"现金"})
		      		      } else if (payType === "card"){
		      			  $scope.avail_pays.push({"id":payType, "name":"银行卡"})
		      		      } else if (payType === "own"){
		      			  $scope.avail_pays.push({"id":payType, "name":"签单"})
		      		      } else if (payType === "tenpay"){
		      			  $scope.avail_pays.push({"id":payType, "name":"微信"})
		      		      } else if (payType === "alipay"){
		      			  $scope.avail_pays.push({"id":payType, "name":"支付宝"})
		      		      } else if (payType === "coupon"){
		      			  $scope.avail_pays.push({"id":payType, "name":"优惠券"})
		      		      } else if (payType === "tenpay_coupon"){
		      			  $scope.avail_pays.push({"id":payType, "name":"微信优惠券"})
		      		      } else if (payType === "mypay"){
		      			  var moneyName = order.pays[i].name
		      			  $scope.avail_pays.push({"id":payType, "name":"充值卡", "moneyName":moneyName})
		      		      }
		      		  }
		      		  money_qty = line.qty * line.price * line.discount /100
		      	      }
			      
		      	      $scope.cancelProduct = {
		      		  "id":line.id,
		      		  "name":line.name,
		      		  "qty":line.qty,
		      		  "money_qty":money_qty,
		      		  "payType":$scope.avail_pays && $scope.avail_pays[0]
		      	      }
		      	      $scope.ok = function() {
		      		  var params = {"product_qty":$scope.cancelProduct.qty}
		      		  if ($scope.cancelProduct.money_qty>0) {
		      		      params.money_type = $scope.cancelProduct.payType.id
		      		      params.money_name = $scope.cancelProduct.payType.moneyName
		      		      params.money_qty = $scope.cancelProduct.money_qty
		      		  }
		      		  $http.get('/order/' + order.id + '/orderline/' + line.line_id + '/cancel',
		      			    {params:params})
		      		      .success(function(data, status) {
		      			  if (data.error ) {
		      			      alert(data.error)
		      			  } else {
		      			      alert("退品成功")
		      			      $modalInstance.close();
		      			      $route.reload()
		      			  }
		      		      })
		      		      .error(function(data, status, headers, config) {
		      			  $scope.$parent.err = "网络错误"
		      		      })
		      	      };
		      	      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  }
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_return_one.html',
		      	      controller: ReturnOneInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      		  order:function () {
		      	      	      return order;
		      	      	  },
		      		  line:function () {
		      	      	      return line;
		      	      	  }
		      	      }
		      	  });
		      };

		      // 结账
		      $scope.actionMoney = function (table) {
		      	  var MoneyInstanceCtrl = function ($scope, $modalInstance, table) {
			      $scope.orderlines = []
			      $scope.totalprice = 0
			      $scope.tempMoneyStr = ""
			      $scope.plusInfo = {}
			      $scope.discount = 0
			      $scope.plusprice = 0
			      $scope.total = $scope.totalprice + $scope.plusprice
			      
			      // 计算服务费
			      var calcPlus = function(){
				  if ($scope.plusInfo.plus_state === 0){
				      return 0
				  } else if ($scope.plusInfo.plus_state == 1){
				      return $scope.plusInfo.plus_calc
				  } else if ($scope.plusInfo.plus_state == 2){
				      return $scope.plusInfo.plus_calc * table.busy_qty
				  } else if ($scope.plusInfo.plus_state == 3){
				      return parseInt($scope.plusInfo.plus_calc * $scope.totalprice / 100)
				  } 
				  return
			      }

			      baseService.getPlusInfo()
				  .then(function(result){
				      $scope.plusInfo = result
				      $scope.plusprice = calcPlus()
				  })

			      for (var i=0; i<table.orders.length; i++){
				  $scope.totalprice += calcMoney(table.orders[i])
				  for (var j=0; j<table.orders[i].lines.length; j++){
				      $scope.orderlines.push(table.orders[i].lines[j])
				  }
				  $scope.plusprice = calcPlus()
			      }

			      $scope.use= {
				  discount:false,
				  tenpay_coupon:false,
				  coupon:false,
				  cash:true
			      }

			      $scope.money = {
				  cash:0,
				  coupon:0,
				  tenpay_coupon:0,
				  left:0
			      }
			      
			      $scope.actionReceipt = function(){
				  offlineReceipt(table.orders)
			      }
			      
			      // 计算余额
			      var getRestMoney = function() {
				  if ($scope.discount>0 && $scope.discount<100) {
				      $scope.money.left = Math.floor(($scope.totalprice + $scope.plusprice) * $scope.discount/100) - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				      $scope.total = Math.floor(($scope.totalprice + $scope.plusprice) * $scope.discount / 100)
				  } else {
				      $scope.total = $scope.totalprice + $scope.plusprice
				      $scope.money.left = $scope.totalprice + $scope.plusprice - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  }
				  return
			      }

			      $scope.$watch('tempMoneyStr', function() {
				  if ($scope.use.cash) {
				      $scope.money.cash = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.coupon) {
				      $scope.money.coupon = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.tenpay_coupon) {
				      $scope.money.tenpay_coupon = parseInt($scope.tempMoneyStr) 
				  } else if ($scope.use.discount) {
				      $scope.discount = parseInt($scope.tempMoneyStr) 
				  } 
				  getRestMoney()
			      });

			      $scope.actionTenpayCoupon = function(){
				  $scope.use.tenpay_coupon = true
				  $scope.use.coupon = false
				  $scope.use.cash = false
				  $scope.use.discount = false
				  if ($scope.money.tenpay_coupon>0){
				      $scope.tempMoneyStr = $scope.money.tenpay_coupon + ""
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }

			      $scope.actionCoupon = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = true
				  $scope.use.cash = false
				  $scope.use.discount = false
				  if ($scope.money.coupon>0){
				      $scope.tempMoneyStr = $scope.money.coupon + ""
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }
			      
			      $scope.actionCash = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = false
				  $scope.use.cash = true
				  $scope.use.discount = false
				  if ($scope.money.cash>0) {
				      $scope.tempMoneyStr = $scope.money.cash + "" 
				  } else {
				      $scope.tempMoneyStr = "0"
				  }
			      }

			      $scope.actionLess = function(){
				  $scope.plusprice = 0
				  getRestMoney()
			      }

			      // 折扣
			      $scope.actionDiscount = function(){
				  $scope.use.tenpay_coupon = false
				  $scope.use.coupon = false
				  $scope.use.cash = false
				  $scope.use.discount = true
				  $scope.tempMoneyStr = $scope.discount + ""
			      }
			      
			      // 订单总价
			      $scope.actionOk = function () {
				  var realCash, rest
				  if ($scope.discount>0 && $scope.discount<100) {
				      rest = Math.floor(($scope.totalprice + $scope.plusprice)*$scope.discount/100) - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  } else {
				      rest = $scope.totalprice + $scope.plusprice - $scope.money.cash - $scope.money.coupon - $scope.money.tenpay_coupon
				  }
				  if (rest<0) {
				      realCash = Math.floor(($scope.totalprice + $scope.plusprice)*$scope.discount/100) - $scope.money.coupon - $scope.money.tenpay_coupon
				  } else {
				      realCash = $scope.money.cash
				  }
				  $http.get('/table/' + table.id + '/money',
					    {params:{
						plus:$scope.plusprice,
						discount:$scope.discount,
						cash:parseInt(realCash),
						coupon:$scope.money.coupon,
						tenpay_coupon:$scope.money.tenpay_coupon,
					    }}
					   )
				      .success(function(data) {
					  if (data.error ) {
					      alert(data.error)
					  } else {
					      $modalInstance.close(table);
					      table.is_busy = false
					      table.busy_qty = 0
					      offlineReceipt(table.orders)
					      alert("结账成功!")
					      $route.reload();
					  }
				      })
				      .error(function(data, status) {
					  alert("网络错误")
				      })
			      };
		      	      $scope.actionCancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
		      	  };
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_money.html',
		      	      controller: MoneyInstanceCtrl,
		      	      size: 'lg',
		      	      resolve: {
		      	      	  table: function () {
		      	      	      return table;
		      	      	  }
		      	      }
		      	  });
		      };


		      // 交班验证
		      $scope.actionToShift = function() {
		      	  var ModalInstanceCtrl = function ($scope, $modalInstance) {
			      $scope.manager = {}
			      $scope.ok = function() {
		      		  $modalInstance.close([$scope.manager]);
			      };
			      $scope.cancel = function () {
		      		  $modalInstance.dismiss();
		      	      };
			  }
		      	  var modalInstance = $modal.open({
		      	      templateUrl: 'action_to_shift.html',
		      	      controller: ModalInstanceCtrl,
		      	      size: 'lg',
			  });
			  modalInstance.result.then(function(manager) { // Close时执行
			      actionShift(manager)
			  });
		      };

		      // 交班金额
		      var actionShift = function (manager) {
			  $scope.allDatas = {}
			  $scope.cash = 0
			  shiftTime = (new Date()).getTime()
			  $http.get('/orders/check',
				    {params:{
					manager_name:manager[0].name,
					manager_password:manager[0].password,
				    }
				    })
			      .success(function(data) {
				  if (data.error ) {
				      alert(data.error)
				  } else {
			     	      var results = data.value
				      $scope.company_info = data.value.company_info
				      $scope.order_count = data.value.order_count
				      $scope.pays = data.value.pay_result || []
				      $scope.return_count = 0
				      $scope.return_amount = 0
				      $scope.amount = 0
				      $scope.cash = 0
				      $scope.returnPays = []
				      $scope.realPays = []
				      $scope.manager = manager[0]
				      for (var i=0; i<$scope.pays.length; i++){
					  var thisAmount =  $scope.pays[i].qty
					  if ($scope.pays[i]._id.is_return) {
					      $scope.returnPays.push($scope.pays[i])
					      $scope.return_count += 1
					      $scope.return_amount += thisAmount
					  } else {
					      $scope.realPays.push($scope.pays[i])
					      $scope.amount += thisAmount
					  }
				      }
				      // 计算实际金额
				      $scope.utotalPays = {}
				      for (var j=0; j<$scope.pays.length; j++) {
				      	  var p = $scope.pays[j]._id.pay_type
				      	  if (!$scope.utotalPays.hasOwnProperty(p)) {
				      	      $scope.utotalPays[p] = 0
				      	  }
				      	  $scope.utotalPays[p] += $scope.pays[j].qty
				      }
				      openShift()
				  }
			  })
			  .error(function(data, status, headers, config) {
			      $scope.$parent.err = "网络错误"
			  })
			  // 获取基础数据
		      };
		      
		      $scope.actionOkShift = function (manager) {
			  $http.get('/orders/shift',
				    {params:
				     {
					 shift_end:shiftTime,
					 manager_name:manager.name, 
					 manager_password:manager.password,
				     }
				    })
			      .success(function(data) {
				  if (data.error ) {
			     	      alert(data.error)
				  } else {
				      alert("交班完成!")
				  }
			      })
			      .error(function(data, status, headers, config) {
				  $scope.$parent.err = "网络错误"
			      })
			  closeShift()
			  $route.reload()
		      };
		      $scope.actionCancelShift = function () {
			  closeShift()
		      };
		      
		  }]);

