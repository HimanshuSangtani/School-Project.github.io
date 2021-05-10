app.controller('academicSessionController', function ($rootScope, FlashService, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

    $rootScope.showBackStrech = false;
    UtilService.setSidebar();

    $scope.allEnquiryDetails = [];
    $scope.allAcademicSessionDetails = [];
    $scope.getAllAcademicSessionDetails = [];
    $scope.showAddOrUpdateModal = false;
    $scope.isModalAddOrUpdate = '';

    $scope.bloodGroupList = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-', 'NA'];

    $scope.getAllAcademicSessionDetailsFunction = function () {

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/academic_session/getList');
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.getAllAcademicSessionDetails = response.data.message;
                    //console.log($scope.getAllAcademicSessionDetails);
                    $rootScope.mypageloading = false;
                }
            } else {
                $scope.getAllAcademicSessionDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.showAddOrUpdateModalFunction = function () {

        //console.log((new Date()).toDateString());
        FlashService.Error('');

        $scope.showAddOrUpdateModal = true;
        $scope.isModalAddOrUpdate = 'addAcademicSession';


        $scope.allAcademicSessionDetails.name = '';
        $scope.allAcademicSessionDetails.start_date = '';
        $scope.allAcademicSessionDetails.end_date = '';
        $scope.allAcademicSessionDetails.is_current_session = false;

    }

    $scope.addAcademicSessionFunction = function () {

        FlashService.Error('');

        if ($scope.allAcademicSessionDetails.name == undefined || $scope.allAcademicSessionDetails.name == '') {
            FlashService.Error('Please enter name');
            return false
        }

        if ($scope.allAcademicSessionDetails.start_date == undefined || $scope.allAcademicSessionDetails.start_date == '') {
            FlashService.Error('Please enter start date');
            return false
        }

        if ($scope.allAcademicSessionDetails.end_date == undefined || $scope.allAcademicSessionDetails.end_date == '') {
            FlashService.Error('Please enter end date');
            return false
        }

        var start_date = $scope.allAcademicSessionDetails.start_date.getTime();
        var end_date = $scope.allAcademicSessionDetails.end_date.getTime();

        if (start_date >= end_date) {
            FlashService.Error('Start date ahead of end date');
            return false
        }

        $rootScope.mypageloading = true;

        var payLoadData = {

            "name": $scope.allAcademicSessionDetails.name,
            "start_date": $scope.allAcademicSessionDetails.start_date.toLocaleDateString('hi-IN'),
            "end_date": $scope.allAcademicSessionDetails.end_date.toLocaleDateString('hi-IN'),
            "is_current_session": $scope.allAcademicSessionDetails.is_current_session.toString()

        }

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/academic_session/add', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    // $scope.allAcademicSessionDetails = response.data;
                    $scope.showAddOrUpdateModal = false;
                    $scope.getAllAcademicSessionDetailsFunction();
                    $rootScope.mypageloading = false;
                }
            } else {
                FlashService.Error(response.data.message);
                $scope.allAcademicSessionDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.getSingleAcademicSessionDetailsFunction = function (details) {
        $scope.showAddOrUpdateModal = true;
        $scope.isModalAddOrUpdate = 'updateAcademicSession';

        $scope.allAcademicSessionDetails.name = details.name;
        $scope.allAcademicSessionDetails.start_date = stringToDate(details.start_date);
        $scope.allAcademicSessionDetails.end_date = stringToDate(details.end_date);
        $scope.allAcademicSessionDetails.is_current_session = details.is_current_session;
        $scope.allAcademicSessionDetails._id = details._id;

        $rootScope.mypageloading = false;

    }

    function stringToDate(dateString) {
        var dateParts = dateString.split("/");
        // month is 0-based, that's why we need dataParts[1] - 1
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        return dateObject;
    }

    $scope.updateAcademicSessionFunction = function () {

        FlashService.Error('');

        if ($scope.allAcademicSessionDetails.name == undefined || $scope.allAcademicSessionDetails.name == '') {
            FlashService.Error('Please enter name');
            return false
        }

        if ($scope.allAcademicSessionDetails.start_date == undefined || $scope.allAcademicSessionDetails.start_date == '') {
            FlashService.Error('Please enter start date');
            return false
        }

        if ($scope.allAcademicSessionDetails.end_date == undefined || $scope.allAcademicSessionDetails.end_date == '') {
            FlashService.Error('Please enter end date');
            return false
        }

        console.log($scope.allAcademicSessionDetails.name);
        console.log($scope.allAcademicSessionDetails.start_date);
        console.log($scope.allAcademicSessionDetails.end_date);
        var start_date = $scope.allAcademicSessionDetails.start_date.getTime();
        var end_date = $scope.allAcademicSessionDetails.end_date.getTime();

        console.log(start_date);
        console.log(end_date);

        if (start_date >= end_date) {
            FlashService.Error('Start date ahead of end date');
            return false
        }

        $rootScope.mypageloading = true;

        var payLoadData = {

            "name": $scope.allAcademicSessionDetails.name,
            "start_date": $scope.allAcademicSessionDetails.start_date.toLocaleDateString('hi-IN'),
            "end_date": $scope.allAcademicSessionDetails.end_date.toLocaleDateString('hi-IN'),
            "academic_session_id": $scope.allAcademicSessionDetails._id
        }

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/academic_session/updateData', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.showAddOrUpdateModal = false;
                    $scope.getAllAcademicSessionDetailsFunction();
                    //$rootScope.mypageloading = false;
                }
            } else {
                FlashService.Error(response.data.message);
                //$scope.allAcademicSessionDetails = [];
                $rootScope.mypageloading = false;
            }
        });
    }

    $scope.confirmAcademicSessionFunction = function (details) {
        details.confirm = true;
    }

    $scope.cancelAcademicSessionFunction = function (details) {
        details.confirm = false;
    }


    $scope.deleteAcademicSessionFunction = function (details) {

        details.confirm = false;
        console.log(details);
        $scope.getAllAcademicSessionDetailsFunction();
        // var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/enquiry/delete?number=' + details.enquiry_number);
        // requestHandle.then(function (response) {
        //     if (response.success == true) {
        //         if (response.data != undefined && response.data != null && response.data != '') {

        //             $scope.getAllAcademicSessionDetailsFunction();
        //             //$rootScope.mypageloading = false;
        //         }
        //     } else {
        //         $rootScope.mypageloading = false;
        //     }
        // });
    }

    $scope.updateCurrentAcademicSession = function (currentSession) {
        console.log(currentSession);

        FlashService.Error('');

        $rootScope.mypageloading = true;

        var payLoadData = {
            "academic_session_id": currentSession
        }

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/academic_session/updateCurrentsession', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.showAddOrUpdateModal = false;
                    $scope.getAllAcademicSessionDetailsFunction();
                    //$rootScope.mypageloading = false;
                }
            } else {
                FlashService.Error(response.data.message);
                //$scope.allAcademicSessionDetails = [];
                $rootScope.mypageloading = false;
            }
        });
    }


    $scope.getAllAcademicSessionDetailsFunction();
});