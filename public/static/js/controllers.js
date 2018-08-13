'use strict';
function AjaxLoad($http, url, type, data, callback){
    $http({
        url: url,
        method: type,
        data: data
    }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            callback(response);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
    });
}

var app = angular.module('myApp', ["ngTable"],['angularUtils.directives.dirPagination']);
app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

app.controller('balance_wallet', ['$scope','$http', function($scope,$http) {
    'use strict';
   
    get_history_deposit_pending($scope,$http);
    get_history_deposit_finish($scope,$http);
    get_history_withdraw_pending($scope,$http);
    get_history_withdraw_finish($scope,$http);

    $scope.remove_order = function(id) {
        $http({
            url: "/account/balance/remove-withdraw",
            dataType: "json",
            method: "POST",
            data: {
                'id' : id
            },
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).success(function(response){
            get_history_withdraw_pending($scope,$http);
            get_history_withdraw_finish($scope,$http);
        }).error(function(error){
            $scope.error = error;
        });
    }
    
 }]);


function get_history_deposit_pending($scope,$http)
{
    $http({
        url: "/account/balance/history-deposit-pending",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){
        
        var data_history = [];

        for (var x in response.result)
        {
            data_history.push({
                'amount' : response.result[x].amount,
                'confirm' : response.result[x].confirm,
                'date' : formatDatess(response.result[x].date),
                'status' :response.result[x].status,
                'txid' : response.result[x].txid,
                'type' : response.result[x].type 
            });
        }
        $scope.history_deposit_pending = data_history.reverse();
    }).error(function(error){
        $scope.error = error;
    });
}

function get_history_withdraw_pending($scope,$http)
{

    $http({
        url: "/account/balance/history-withdraw-pending",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){
        var data_history = [];
        for (var x in response.result)
        {
            data_history.push({
                'id' : response.result[x]._id,
                'amount' : response.result[x].amount,
                'confirm' : response.result[x].confirm,
                'date' : formatDatess(response.result[x].date),
                'status' :response.result[x].status,
                'txid' : response.result[x].txid,
                'type' : response.result[x].type 
            });
        }
        $scope.history_withdraw_pending = data_history.reverse();
    }).error(function(error){
        $scope.error = error;
    });
}

function get_history_deposit_finish($scope,$http)
{
    $http({
        url: "/account/balance/history-deposit-finish",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){
        
        var data_history = [];

        for (var x in response.result)
        {
            data_history.push({
                'amount' : response.result[x].amount,
                'confirm' : response.result[x].confirm,
                'date' : formatDatess(response.result[x].date),
                'status' :response.result[x].status,
                'txid' : response.result[x].txid,
                'type' : response.result[x].type 
            });
        }
        $scope.history_deposit_finish = data_history.reverse();
    }).error(function(error){
        $scope.error = error;
    });
}

function get_history_withdraw_finish($scope,$http)
{

    $http({
        url: "/account/balance/history-withdraw-finish",
        dataType: "json",
        method: "GET",
        data: {},
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).success(function(response){
        var data_history = [];
        for (var x in response.result)
        {
            data_history.push({
                'id' : response.result[x]._id,
                'amount' : response.result[x].amount,
                'confirm' : response.result[x].confirm,
                'date' : formatDatess(response.result[x].date),
                'status' :response.result[x].status,
                'txid' : response.result[x].txid,
                'type' : response.result[x].type 
            });
        }
        $scope.history_withdraw_finish = data_history.reverse();
    }).error(function(error){
        $scope.error = error;
    });
}


function formatDatess(date) {
    var d = new Date(date);
    var    month = '' + (d.getMonth() + 1);
    var    day = '' + d.getDate();
    var    year = d.getFullYear();
    var    hour = d.getHours();
    var    min = d.getMinutes();
    var    second = d.getSeconds();
    if (parseInt(month) < 10) month = '0' + month;
    if (parseInt(day) < 10) day = '0' + day;

    if (parseInt(hour) < 10) hour = '0' + hour;
    if (parseInt(min) < 10) min = '0' + min;
    if (parseInt(second) < 10) second = '0' + second;
    return /*hour+':'+min+':'+second+' '+*/day+'/'+month+'/'+year;
}


