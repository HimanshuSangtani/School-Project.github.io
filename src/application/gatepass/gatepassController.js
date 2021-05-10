app.controller('gatepassController', function ($rootScope, FlashService, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

    $rootScope.showBackStrech = false;
    UtilService.setSidebar();

    var class_hash = {};

    $scope.profileInfo = angular.fromJson($sessionStorage.profileInfo);
    $scope.classList = [];
    $scope.allGatePassDetails = [];
    $scope.getAllGatePassesDetails = [];
    $scope.showAddOrUpdateModal = false;
    $scope.showGatePassReceipt = false;

    $scope.showGloble = false;
    var allStudentDetails_hash = {};
    $scope.showSearchedStudentModal = false;

    $scope.globelSearchstudent = {
        "_id": "",
        "name": "",
        "emer_1": ""
    }

    $scope.reasonList = [
        "He/She is not feeling well",
        "Urgent work",
        "Any other"
    ]

    $scope.getGatePassesDetailsFunction = function () {

        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/gatepass/getpass');
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    console.log(response.data);
                    $scope.getAllGatePassesDetails = response.data;
                    $rootScope.mypageloading = false;
                }
            } else {
                $scope.getAllGatePassesDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.showAddOrUpdateModalFunction = function () {

        FlashService.Error('');

        $scope.showAddOrUpdateModal = true;

        $scope.globelSearchstudent.name = '';
        //$scope.allGatePassDetails.studentName = '';
        $scope.allGatePassDetails.class = '';
        $scope.allGatePassDetails.reason = '';
        $scope.allGatePassDetails.receiverName = '';
        $scope.allGatePassDetails.receiverRelation = '';
        $scope.allGatePassDetails.receiverContact = '';
        $scope.allGatePassDetails.vehicleNo = '';
        // $scope.allGatePassDetails.vehicleType = '';
        $scope.allGatePassDetails.date = '';

        $scope.allGatePassDetails.otherReason = '';
    }

    $scope.addGatePassFunction = function () {

        FlashService.Error('');

        $scope.allGatePassDetails.date = new Date();

        if ($scope.globelSearchstudent.name == undefined || $scope.globelSearchstudent.name == '') {
            FlashService.Error('Please select student name');
            return false
        }

        if ($scope.allGatePassDetails.reason == undefined || $scope.allGatePassDetails.reason == '') {
            FlashService.Error('Please specify reason');
            return false
        }

        if ($scope.allGatePassDetails.receiverContact == undefined || $scope.allGatePassDetails.receiverContact == '') {
            FlashService.Error('Please enter contact number');
            return false
        }

        if ($scope.allGatePassDetails.receiverContact < 1) {
            FlashService.Error('Please  enter correct contact number');
            return false
        }

        if ($scope.allGatePassDetails.reason != 'Any other') {
            $scope.allGatePassDetails.otherReason = '';
        }
        else {
            $scope.allGatePassDetails.reason = $scope.allGatePassDetails.otherReason;
        }

        var payLoadData = {

            "student_id": $scope.globelSearchstudent._id,
            "name": $scope.globelSearchstudent.name,
            "class": $scope.allGatePassDetails.class,
            "reason": $scope.allGatePassDetails.reason,
            "receiver_name": $scope.allGatePassDetails.receiverName,
            "relation": $scope.allGatePassDetails.receiverRelation,
            "receiver_contact": $scope.allGatePassDetails.receiverContact,
            "vehicle_number": $scope.allGatePassDetails.vehicleNo
        }

        //console.log(payLoadData);

        $rootScope.mypageloading = true;

        //$scope.showGatePassReceipt = true;
        //$scope.showAddOrUpdateModal = false;

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/gatepass/addgatepass', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    //$scope.allEnquiryDetails = response.data;
                    $scope.showAddOrUpdateModal = false;
                    $scope.showGatePassReceipt = true;
                    $scope.getGatePassesDetailsFunction();
                    $rootScope.mypageloading = false;
                }
            } else {
                //$scope.allEnquiryDetails = [];
                FlashService.Error('Something went wrong in adding gate pass. Please try again.');
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.getSinglePassDetailsFunction = function (details) {

        $scope.globelSearchstudent.name = details.name;
        $scope.allGatePassDetails.class = details.class;
        $scope.allGatePassDetails.reason = details.reason;
        $scope.allGatePassDetails.receiverName = details.receiver_name;
        $scope.allGatePassDetails.receiverRelation = details.relation;
        $scope.allGatePassDetails.receiverContact = parseInt(details.receiver_contact);
        $scope.allGatePassDetails.vehicleNo = details.vehicle_number;
        // $scope.allGatePassDetails.vehicleType = '';
        $scope.allGatePassDetails.date = details.time;

        $scope.showGatePassReceipt = true;
    }

    // $scope.confirmEnquiryFunction = function (details) {
    //     details.confirm = true;
    // }

    // $scope.cancelEnquiryFunction = function (details) {
    //     details.confirm = false;
    // }


    // $scope.deleteEnquiryFunction = function (details) {

    //     details.confirm = false;
    //     console.log(details.enquiry_number);

    //     var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/enquiry/delete?number=' + details.enquiry_number);
    //     requestHandle.then(function (response) {
    //         if (response.success == true) {
    //             if (response.data != undefined && response.data != null && response.data != '') {

    //                 $scope.getEnquiryFunction();
    //                 //$rootScope.mypageloading = false;
    //             }
    //         } else {
    //             $rootScope.mypageloading = false;
    //         }
    //     });
    // }

    $scope.selectStudentSearch = function (data) {

        console.log(data);

        angular.forEach($scope.classList, function (obj) {
            if (obj._id == data.grade_id) {
                $scope.allGatePassDetails.class = obj.name;
            }
        })

        $scope.globelSearchstudent = {
            "_id": data._id,
            "name": data.name,
            "emer_1": data.emer_1
        }

        $scope.showSearchedStudentModal = true;
        $scope.showGloble = false;

    }

    $scope.ClickSearch = function () {

        if ($scope.globelSearchstudent.name == '') {
            $scope.showGloble = false;
            $scope.showSearchedStudentModal = false;
            return false;
        }
        $scope.showGloble = true;
    }

    $scope.getAllStudent = function () {

        $rootScope.mypageloading = true;

        $log.debug('HandShakeService.allStudentList call');
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService existingStudentList received');
            $scope.studentList = result;

            angular.forEach(result, function (obj) {
                allStudentDetails_hash[obj.rollno] = obj;
            });

            $scope.getClasses();
            $rootScope.mypageloading = false;

        });
        $log.debug('HandShakeService.existingStudentList passed');

    }

    $scope.getClasses = function () {
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;

            angular.forEach($scope.classList, function (obj) {
                class_hash[obj.grade_id] = obj;
            })

            $scope.getGatePassesDetailsFunction();
        });
    }

    $scope.printToCart1 = function (studentName) {

        kendo.drawing.drawDOM($("#printSectionId")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "Gate_Pass_To_" + studentName + ".pdf");
            $scope.showGatePassReceipt = false;
        });

    }


    $scope.getAllStudent();
});