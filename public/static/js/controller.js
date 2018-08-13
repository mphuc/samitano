'use strict';


var app = angular.module('myApp', ['ui.bootstrap'])
.filter('sumOfValue', function () {
    return function (data, key) {        
        if (angular.isUndefined(data) || angular.isUndefined(key))
            return 0;        
        var sum = 0;        
        angular.forEach(data,function(value){

            sum = sum + parseFloat(value[key]);
        });        
        return parseFloat((sum/100000000).toFixed(8));
    }
}).filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
}).filter('addCommas', function() {
  return function (input) {
    return addCommas(input);
  };
}).filter('satoshi', function() {
  return function (input) {
    return satoshi(input);
  };
}).factory('socketio', ['$rootScope' , function ($rootScope) {
    var socket = io.connect('http://127.0.0.1:5988',{ 'forceNew': true });
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}]);

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

app.controller('CtrOrderBuy', ['$scope','$http','socketio', function($scope,$http,socketio) {
    'use strict';
    $http({
        url: "load-order-buy",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });

    $scope.ClickBuyOrder = function(data){
        
    }  
    

    socketio.on('OrderBuy:save', (data)=>{
    });
   
}]);

app.controller('CtrOrderSell', ['$scope','$http','socketio', function($scope,$http,socketio) {
    'use strict';
    $http({
        url: "load-order-sell",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });

    $scope.ClickBuyOrder = function(data){
        
    }  
    

    socketio.on('OrderBuy:save', (data)=>{
    });
}]);


app.controller('CtrBuyNow', ['$scope','$http','socketio', function($scope,$http,socketio) {
    $scope.change_buy = function() {
        'use strict';
        if ($scope.amount_buy)
        {
            $scope.loading = true;
            $scope.showorder = false;
            $http({
                url: "/load-buy-now?amount="+$scope.amount_buy,
                dataType: "json",
                method: "GET",
                data: {
                },
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }).success(function(response){  
                $scope.loading = false;
                $scope.data = response.result;
                $scope.showorder = (response.result.length > 0) ?  true : false;
                
            }).error(function(error){
                $scope.error = error;
            });
        }
        else
        {
            $scope.showorder = false;
        }

            
    };
}]);

app.controller('CtrSellNow', ['$scope','$http','socketio', function($scope,$http,socketio) {
    $scope.change_buy = function() {
        'use strict';
        if ($scope.amount_buy)
        {
            $scope.loading = true;
            $scope.showorder = false;
            $http({
                url: "/load-sell-now?amount="+$scope.amount_buy,
                dataType: "json",
                method: "GET",
                data: {
                },
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }).success(function(response){  
                $scope.loading = false;
                $scope.data = response.result;
                $scope.showorder = (response.result.length > 0) ?  true : false;
                
            }).error(function(error){
                $scope.error = error;
            });
        }
        else
        {
            $scope.showorder = false;
        }
    };
}]);

app.controller('CtrOrderOpen', ['$scope','$http','socketio', function($scope,$http,socketio) {
    var user_id = $('input[name="user_id"]').val();
    $scope.user_id = user_id;
    'use strict';
    $scope.loading = true;
    $scope.showorder = false;
    $http({
        url: "/load-order-open",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.loading = false;
        $scope.showorder =   true ;

        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });

}]);


app.controller('CtrOrderClose', ['$scope','$http','socketio', function($scope,$http,socketio) {
    var user_id = $('input[name="user_id"]').val();
    $scope.user_id = user_id;
    'use strict';
    $scope.loading = true;
    $scope.showorder = false;
    $http({
        url: "/load-order-close",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.loading = false;
        $scope.showorder =   true ;

        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });

}]);


app.controller('CtrOrderBuyUser', ['$scope','$http','socketio', function($scope,$http,socketio) {
    var user_id = $('input[name="user_id"]').val();
    $scope.user_id = user_id;
    'use strict';
    $scope.loading = true;
    $scope.showorder = false;
    $http({
        url: "/load-order-buy-user",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.loading = false;
        $scope.showorder =   true ;

        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });

}]);

app.controller('CtrOrderSellUser', ['$scope','$http','socketio', function($scope,$http,socketio) {
    var user_id = $('input[name="user_id"]').val();
    $scope.user_id = user_id;
    'use strict';
    $scope.loading = true;
    $scope.showorder = false;
    $http({
        url: "/load-order-sell-user",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.loading = false;
        $scope.showorder =   true ;

        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });
}]);

app.controller('CtrReffrallUser', ['$scope','$http','socketio', function($scope,$http,socketio) {
    var user_id = $('input[name="user_id"]').val();
    $scope.user_id = user_id;
    'use strict';
    $scope.loading = true;
    $scope.showorder = false;
    $http({
        url: "/load-reffrall",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){  
        $scope.loading = false;
        $scope.showorder =   true ;

        $scope.data = response.result;
        $scope.viewby = 5;
        $scope.totalItems = $scope.data.length;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
        
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
        };
        $scope.setItemsPerPage = function(num) {
            $scope.itemsPerPage = num;
            $scope.currentPage = 1;
        }
    }).error(function(error){
        $scope.error = error;
    });
}]);


function load_token(){
    $.ajax({
        url: "/token_crt",
        data: {},
        type: "GET",
        beforeSend: function() {},
        error: function(data) {},
        success: function(data) {
            $('.token_crt').val(data.token);
            $('.btn-submit-exchain').removeAttr('disabled' ,'disabled');
        }
    });
}

function addCommas(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function satoshi(number)
{
    return (parseFloat(number)/100000000).toFixed(8);
}