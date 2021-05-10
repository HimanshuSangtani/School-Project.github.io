app.controller('studentsAllController', function ($rootScope, $location, $scope, HandShakeService, UtilService, $sessionStorage, $routeParams, HttpService, FlashService, $indexedDB, $log) {

    UtilService.setSidebar();
    $log.debug("studentsController reporting for duty.");
    $rootScope.showBackStrech = false;

    FlashService.Error('')
    FlashService.Success('')

   
    $scope.showSearchedStudentList = [];
    $scope.showViewStudentModal = false;

    $rootScope.mypageloading = true;



    getDisabledStudentList();

    var classHash = {}
    function getDisabledStudentList(){
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            //$scope.existingClassList = result;
            $scope.allClassListArray = result;
            angular.forEach($scope.allClassListArray ,function(classObj){
                classHash[classObj._id] = classObj.name;
            })
           
        });
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/student/get-disabled-students');
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true)
            {
                $scope.studentList = result.data;
                angular.forEach($scope.studentList ,function(student){
                    student.class_name = classHash[student.grade_id];
                })
                $rootScope.mypageloading = false;

            } else {

            }
        });
    };

    $scope.enableStudent = function(student) {
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/student/enable-students/'+student._id);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true)
            {
                // $scope.studentList = result.data;
                $scope.studentList = [];
                getDisabledStudentList();
                $rootScope.mypageloading = false;

            } else {

            }
        });
    }






});