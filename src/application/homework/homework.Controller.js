var mymodal = angular.module('homework', []);
app.controller('homeworkController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;

    $scope.showModal = false;
    $scope.testModal = false;
    $rootScope.mypageloading = true;
    $scope.showHomworkList = false;
    $scope.showPhotos = false;

    $scope.homeworkList = [];
    $scope.defaultHomeworkList = [];
    $scope.showDefaultHomework = true;

    $scope.classSelect = "";
    $scope.SubjectSelect = ""
    $scope.Images = [];
    $scope.subjectList = [];



    $rootScope.mypageloading = false;

    $scope.getClasses = function () {
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;

        });
    }
    $scope.getClasses();

    $scope.getSubjects = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject/class?class_id=' + $scope.classSelect);
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.subjectList = result.data;

                $scope.getHomeWork();


            } else {
                // $scope.examList=[];
            }
        })

    }


    $scope.selectedClass = function (class_id) {
        if (class_id != '') {
            $scope.showDefaultHomework = false;
            $scope.classSelect = class_id;
            $scope.SubjectSelect = '';
            $scope.homeworkList = [];
            $scope.showHomworkList = false;
            $scope.getSubjects();

        }
        else {
            $scope.homeworkList = [];
            $scope.showDefaultHomework = true;
            $scope.getDefaultHomework();
        }

    }

    $scope.chooseSubject = function (subject) {
        $scope.SubjectSelect = subject;
        $scope.getHomeWork();
    }




    $scope.getHomeWork = function () {
        var newdate = new Date();
        $scope.timeStampValue = newdate.getTime();
        // 1558513561906
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher/homework?class_id=' + $scope.classSelect + '&time=' + $scope.timeStampValue + '&subject=' + $scope.SubjectSelect);
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.homeworkList = result.data;
                console.log($scope.homeworkList);
                if ($scope.homeworkList.length == 0) {
                    $scope.showHomworkList = true;
                } else {
                    angular.forEach($scope.allotmentList, function (item) {
                        item.Datestatus = UtilService.checkDate(item);
                    })
                }
                $scope.homeworkList.sort(function (a, b) {
                    return new Date(b.time) - new Date(a.time);
                });


            } else {
                //Notify Error
            }
        })
    }


    $scope.getDefaultHomework = function () {

        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher/todayhomework');
        requestHandle.then(function (result) {
            if (result.success == true) {

                $scope.defaultHomeworkList = result.data;
                $scope.showDefaultHomework = true;
                $scope.homeworkList = [];
                $scope.classSelect = "";
                $scope.SubjectSelect = ""
                $scope.showHomworkList = false;

                $rootScope.mypageloading = false;

            } else {
                $rootScope.mypageloading = false;
                //Notify Error
            }
        })
    }

    $scope.getDefaultHomework();

    $scope.homeWorkInfo = "";
    $scope.toggleModal = function (data) {
        $scope.homeWorkInfo = data;
        $scope.showModal = !$scope.showModal;
    };


    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };




});

