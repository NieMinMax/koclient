kolocal.config(['$httpProvider', '$routeProvider', function($httpProvider, $routeProvider) {
    // 处理IE缓存
    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    // 首页
    $routeProvider.when('/', {
        controller: "BaseCtrl",
        templateUrl: '../static/templates/base.html'
    });

    // 打印机
    $routeProvider.when('/printer', {
        controller: "PrinterCtrl",
        templateUrl: '../static/templates/printer.html'
    });

    $routeProvider.when('/data', {
        controller: "DataCtrl",
        templateUrl: '../static/templates/data.html'
    });

    // Offlie POS
    $routeProvider.when('/offline/pos', {
        controller: "ServiceSessionCtrl",
        templateUrl: '/static/templates/offline_pos_session.html'
    });

    $routeProvider.when('/offline/pos/:posId', {
        controller: "ServicePosCtrl",
        templateUrl: '/static/templates/offline_pos_order.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });
}])
