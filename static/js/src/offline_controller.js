offline.config(['$httpProvider', '$routeProvider', function($httpProvider, $routeProvider) {
    // 处理IE缓存
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    // $routeProvider.when('/', {
    // 	controller:"DashboardCtrl",
    // 	templateUrl:'/static/templates/offline_dashboard.html'
    // });
    
    $routeProvider.when('/', {
        controller: "ServiceChinesePosCtrl",
        templateUrl: '../static/templates/offline_pos_chinese.html'
    });

    $routeProvider.when('/pos/chinese', {
        controller: "ServiceChinesePosCtrl",
        templateUrl: '../static/templates/offline_pos_chinese.html'
    });

    $routeProvider.when('/pos/kproduct', {
        controller: "KProductListCtrl",
        templateUrl: '../static/templates/offline_product_list.html'
    });

    $routeProvider.when('/pos/today', {
        controller: "OrderTodayCtrl",
        templateUrl: '../static/templates/offline_order_today.html'
    });

    $routeProvider.when('/pos/done', {
        controller: "OrderlineListDoneCtrl",
        templateUrl: '../static/templates/offline_orderline_list_done.html'
    });

    $routeProvider.when('/pos/prepare', {
        controller: "OrderlineListPrepareCtrl",
        templateUrl: '../static/templates/offline_orderline_list_prepare.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])
