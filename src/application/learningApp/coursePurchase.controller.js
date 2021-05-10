app.controller('coursePurchaseController', function($rootScope, $routeParams, $location,$scope, $log, 
    UtilService, HandShakeService,  HttpService, FlashService) {

    UtilService.setSidebar();
    FlashService.Error('');
    FlashService.Success('');
    $rootScope.mypageloading = true;
    $scope.isCoursePurchaseModelOpen = false;
    $scope.courseList = [];
    $scope.studentList = [];
    $scope.existStudentList = [];
    $scope.globelSearchstudent = {
        'name': '',
        'is_student_search': true
    }
    $scope.isSearchResult = false;
    $scope.studentName = '';
    $scope.currentCoursePackage = [];
    $scope.coursePurchaseObj = {
        'course_id': '',
        'student_id': '',
        'type': 'PAID',
        'price': '',
        'mode' : 'OFFLINE',
        'channel': '',
        'remark': ''
    }

    $scope.$watch("globelSearchstudent.is_student_search", function() {
        $scope.globelSearchstudent['name'] = '';
        $scope.studentList = [];
        $scope.coursePurchaseObj['student_id'] = '';
        if($scope.globelSearchstudent.is_student_search == true){
            $rootScope.mypageloading = false;
            $scope.isSearchResult = false;
        }
        else{
            $rootScope.mypageloading = true;
        }
    });

    $scope.getCourseList = function () {
        HandShakeService.getGradeInfo().then(function (result) {
            if(result && result.length > 0){
                angular.forEach(result, function (obj) {
                    if(obj['type'] == 'COURSE'){
                        $scope.courseList.push(obj);
                    }
                })
            }
        });
    }
    $scope.getCourseList();

    $scope.getCoursePackages = function(){
        if( $scope.coursePurchaseObj['course_id']){
            for(var i=0;i<$scope.courseList.length;i++){
                if($scope.coursePurchaseObj.course_id === $scope.courseList[i]['_id']){
                    $scope.currentCoursePackage = $scope.courseList[i]['price']
                    console.log($scope.currentCoursePackage)
                    break;
                }
            }
        }
        else{
            $scope.currentCoursePackage = [];
            $scope.coursePurchaseObj['price'] = '';
            $scope.coursePurchaseObj['course_id'] = '';
        }
    }

    $scope.getStudentList = function(isSearch){
        var requestHandle = ''
        $scope.isSearchResult = false;
        if($scope.globelSearchstudent['name'] && $scope.globelSearchstudent['is_student_search'] == true){
            var requestHandle = HttpService.HttpGetData(
                $rootScope.serverURL + "/education/learnUserListByCustomerId?page=''&perPage=''&serchByname=" 
                + $scope.globelSearchstudent['name']);
            $rootScope.mypageloading = false;
        }
        else{
            var requestHandle = HttpService.HttpGetData(
                $rootScope.serverURL + "/education/learnUserListByCustomerId?page=''&perPage=5000&serchByname=");
            $rootScope.mypageloading = true;

        }
        requestHandle.then(function(response) {
            if(response.success == true && response.data.learnUserList){
                $scope.studentList = response.data['learnUserList']
                if(isSearch == false){
                    $scope.existStudentList = response.data['learnUserList'];
                }
                $rootScope.mypageloading = false;
                if($scope.studentList && $scope.studentList.length > 0){
                    $scope.isSearchResult = true;
                }
                console.log($scope.studentList);
            }
            else{
                $scope.existStudentList = [];
                $scope.studentList = [];
                $scope.isSearchResult = false;
            }
        })       
        
    }
    $scope.getStudentList(false);

    $scope.openCoursePurchaseModel = function(){
        $rootScope.mypageloading = false;
        FlashService.Error('');
        FlashService.Success('');
        $scope.globelSearchstudent = {
            'name': '',
            'is_student_search': true
        }
        $scope.currentCoursePackage = [];
        $scope.studentList = [];
        $scope.studentName = '';
        $scope.isSearchResult = false;
        $scope.coursePurchaseObj = {
            'course_id': '',
            'student_id': '',
            'type': 'PAID',
            'price': '',
            'mode' : 'OFFLINE',
            'channel': '',
            'remark': ''
        }
        $scope.isCoursePurchaseModelOpen = true;
    };

    $scope.selectedStudent = function(data){
        $rootScope.mypageloading = false;
        if(data){
            $scope.coursePurchaseObj['student_id'] = data['_id']
            $scope.globelSearchstudent['name'] = data['name'];
            $scope.isSearchResult = false;
        }
    };

    $scope.saveCoursePurchaseDetail = function(){
        if ($scope.coursePurchaseObj.student_id == '' || $scope.coursePurchaseObj.student_id == undefined) {
            FlashService.Error('Please select student');
            return false;
        }
        if ($scope.coursePurchaseObj.course_id == '' || $scope.coursePurchaseObj.course_id == undefined) {
            FlashService.Error('Please select course');
            return false;
        }

        if ($scope.coursePurchaseObj.price == '' || $scope.coursePurchaseObj.price == undefined) {
            FlashService.Error('Please select course package');
            return false;
        }
        if ($scope.coursePurchaseObj.channel == '' || $scope.coursePurchaseObj.channel == undefined) {
            FlashService.Error('Please enter channel ');
            return false;
        }
        $rootScope.mypageloading = true;
        $scope.coursePurchaseObj['price'] = parseFloat($scope.coursePurchaseObj['price']);
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/education/purchase-course', 
            $scope.coursePurchaseObj);
        requestHandle.then(function (response) {
            console.log(response)
            if (response.success == true) {
                $scope.isCoursePurchaseModelOpen = false;
                $scope.globelSearchstudent = {
                    'name': '',
                    'is_student_search': true
                }
                $scope.currentCoursePackage = [];
                $scope.studentList = [];
                $scope.studentName = '';
                $scope.isSearchResult = false;
                $scope.coursePurchaseObj = {
                    'course_id': '',
                    'student_id': '',
                    'type': 'PAID',
                    'price': '',
                    'mode' : 'OFFLINE',
                    'channel': '',
                    'remark': ''
                }
                $rootScope.mypageloading = false;

            } else {
                console.log(response)
                $rootScope.mypageloading = false;
            }
        })
    };

});
