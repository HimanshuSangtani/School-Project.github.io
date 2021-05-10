app.factory('teacherServices', ['$rootScope','HttpService', function($rootScope, HttpService){
    var teacherServices = {};

    teacherServices.getTeacherList = function(cb){
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher');
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    return teacherServices;
}]);


