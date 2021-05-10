app.factory('examServices', ['$rootScope','HttpService', function($rootScope, HttpService){
    var examServices = {};

    examServices.getSubjectList = function(cb){
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject');
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.getExamList = function(cb){
        requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/education/exam/list');
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.getExamDetail = function(examID, cb){
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/education/exam/details?exam_id=' + examID);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.addExamDetails = function(payLoad, cb){
        var requestHandle = HttpService.HttpPostData(
            $rootScope.serverURL + '/education/exam/add-exam', payLoad);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.updateExamDetails = function(payLoad, cb){
        var requestHandle = HttpService.HttpUpdateData(
            $rootScope.serverURL + '/education/exam/update-exam', payLoad);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.addQuestion = function(payLoad, cb){
        var requestHandle = HttpService.HttpPostData(
            $rootScope.serverURL + '/education/question/add', [payLoad]);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.updateQuestion = function(payLoad, cb){
        var requestHandle = HttpService.HttpUpdateData(
            $rootScope.serverURL + '/education/question/edit', payLoad);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.updateExamSession = function(payLoad, cb){
        var requestHandle = HttpService.HttpUpdateData(
            $rootScope.serverURL + "/education/user-exam/exam-session", payLoad);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    examServices.getStudentsExamAnswerSheet = function(examID, classID, cb){
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/education/user-exam/all-student-exam-anwser-sheet?exam_id=' + examID + '&grade_id=' + classID);
        requestHandle.then(function (response) {
            cb(response);
        })
    };

    return examServices;
}]);


