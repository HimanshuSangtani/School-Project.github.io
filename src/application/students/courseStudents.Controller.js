app.controller('courseStudentsController', function ($rootScope, $location, $scope, HandShakeService, UtilService, $sessionStorage, $routeParams, HttpService, FlashService, $indexedDB, $log) {

    UtilService.setSidebar();
    $log.debug("studentsController reporting for duty.");
    FlashService.Error('')
    FlashService.Success('')
    $scope.existingStudentList = [];
    $rootScope.mypageloading = true;
    $scope.courseID = '';
    $scope.courseName = '';
    if($routeParams.courseID){
        $scope.courseID = ($routeParams.courseID).toString();
        if ($scope.courseID.substring(0, 1) === ':') {
            $scope.courseID = $scope.courseID.substring(1);
        } 
    }
   
    function getAllStudentInfo(){
        $scope.existingStudentList = [];
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/education/courseStudentList/' + $scope.courseID);
        requestHandle.then(function (response) {
                if (response.success == true) {
                    console.log(response['data']['studentList'])
                    $scope.existingStudentList =  response['data']['studentList']
                    if($scope.existingStudentList && $scope.existingStudentList.length > 0){
                        $scope.courseName = $scope.existingStudentList[0]['courseInfo']['name']
                    }
                    $rootScope.mypageloading = false;
                }
                else{
                    console.log(response)
                    $rootScope.mypageloading = false;
                }
        })        
    };
    
    getAllStudentInfo();

    $scope.openClassDetails = function () {
        $location.path('/students');
    }

    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "course_student_list.pdf");
        });

    }

});