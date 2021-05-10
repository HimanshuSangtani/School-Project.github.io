app.controller('feeReportsController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    $scope.showFeeReports = false;
    UtilService.setSidebar();

    $scope.showConfirmButton = false;

    $scope.currentDate = new Date();
    $scope.getStudentStatus = [];
    $scope.classDetails = [];
    $scope.feeCategory = [];
    var classDetails_hash = {};
    $scope.selectedClassId = [];
    $scope.selectedFeeId = [];
    var feesCatHash = {};
    $scope.showIndividualStudentClassName = false;

    $scope.filterObjClassIdArray = [];
    $scope.filterObjFeeCatIdList = [];
    $scope.filterObjInstallmentNameList = [];

    $scope.onDate = (new Date()).toDateString();
    $rootScope.mypageloading = true;

    $scope.exportFileType = 'pdf';

    $scope.example14settings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };
    $scope.filterObject = {
        classIdList: [],
        feestatus: '',
        installmentNameList: [],
        feeCatIdList: []
    }

    $scope.confirmNotifyParentsFunction = function () {
        $scope.showConfirmButton = true;
    }

    $scope.cancelNotifyParentsFunction = function () {
        $scope.showConfirmButton = false;
    }

    $scope.notifyParentsFunction = function () {
        $rootScope.mypageloading = true;
        $scope.showConfirmButton = false;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feespaid/remainder');
        requestHandle.then(function (result) {
            if (result.success) {
                $rootScope.mypageloading = false;
                window.alert('Successfully sent notification to all parents');
            }
            else {
                window.alert('Something went wrong on notification.');
            }
        })
    }

    function checkClassFilter(studentObj) {
        if ($scope.filterObject.classIdList.length != 0) {
            if ($scope.filterObjClassIdArray.indexOf(studentObj.grade_id) != -1) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return true
        }
    }

    function checkInstallmentFilter(installmentName) {
        if ($scope.filterObject.installmentNameList.length != 0) {
            if ($scope.filterObjInstallmentNameList.indexOf(installmentName) != -1) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return true
        }
    }

    function checkFeeCatFilter(feeCatId) {
        if ($scope.filterObject.feeCatIdList.length != 0) {
            if ($scope.filterObjFeeCatIdList.indexOf(feeCatId) != -1) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return true
        }
    }

    function checkfeestatus(status) {
        if ($scope.filterObject.feestatus) {
            if (status == $scope.filterObject.feestatus) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    $scope.filterFunction = function () {
        $scope.viewFilteredList = [];
        $scope.filterObjClassIdArray = [];
        $scope.filterObjFeeCatIdList = [];
        $scope.filterObjInstallmentNameList = [];

        for (var i = 0; i < $scope.filterObject.classIdList.length; i++) {
            $scope.filterObjClassIdArray.push($scope.filterObject.classIdList[i]._id);
        }

        for (var i = 0; i < $scope.filterObject.feeCatIdList.length; i++) {
            $scope.filterObjFeeCatIdList.push($scope.filterObject.feeCatIdList[i]._id);
        }

        for (var i = 0; i < $scope.filterObject.installmentNameList.length; i++) {
            $scope.filterObjInstallmentNameList.push($scope.filterObject.installmentNameList[i]._id);
        }

        angular.forEach($scope.installmentDetails, function (studentObj) {
            var isFiltered = true;
            var isFeeCatTrue = false;
            var isInstallentTrue = false;
            var stuFeeStatus = 'PAID';
            var totalAmount = 0;
            if (checkClassFilter(studentObj) && Object.keys(studentObj.installments).length) {
                for (var installmentName in studentObj.installments) {
                    var installmentDetailedList = studentObj.installments[installmentName];
                    if (checkInstallmentFilter(installmentName)) {
                        // if ($scope.filterObject.installmentNameList.length != 0) {
                            isInstallentTrue = true;
                        // }
                        for (var k = 0; k < installmentDetailedList.length; k++) {
                            if (checkFeeCatFilter(installmentDetailedList[k].feecatid)) {

                                if ($scope.filterObject.feeCatIdList.length != 0) {
                                    isFeeCatTrue = true;
                                }
                                // if (installmentDetailedList[k].status == 'UNPAID' && stuFeeStatus == 'PAID') {
                                if (installmentDetailedList[k].status == 'UNPAID') {
                                    stuFeeStatus = 'UNPAID'
                                    totalAmount += installmentDetailedList[k].amount; 
                                }
                            } else if (!isFeeCatTrue) {
                                // isInstallentTrue = false;
                                isFiltered = false;
                            }
                        }
                        // if (isInstallentTrue && !isFeeCatTrue) {
                        //     isFiltered = true;
                        // }
                        if (isInstallentTrue && isFeeCatTrue) {
                            isFiltered = true;
                        }
                    } else if (!isInstallentTrue) {
                        isFiltered = false;
                    }
                }
            } else {
                isFiltered = false;
            }
            studentObj.status = stuFeeStatus;
            if (!checkfeestatus(stuFeeStatus)) {
                isFiltered = false;
            }
            if (isFiltered) {
                $scope.viewFilteredList.push({
                    rollno: studentObj.rollno,
                    name: studentObj.name,
                    emer_1: studentObj.emer_1,
                    installmentData: studentObj.installments,
                    status: studentObj.status,
                    totalAmount: totalAmount,
                    balance: studentObj.balance,
                    class: classDetails_hash[studentObj.grade_id].name,
                    grade_id: studentObj.grade_id
                });
            }
        });
        $scope.showIndividualStudentClassName = true;
    }

    $scope.viewFeeReport = function (details) {
        $scope.viewInstallmentDetailsArray = [];
        for (var i = 0; i < $scope.installmentDetails.length; i++) {
            if ($scope.installmentDetails[i].rollno == details.rollno) {
                var obj = $scope.installmentDetails[i].installments;
                for (var key in obj) {
                    var attrValue = obj[key];
                    for (var k = 0; k < attrValue.length; k++) {
                        $scope.viewInstallmentDetailsArray.push({
                            feeCatID: feesCatHash[attrValue[k].feecatid],
                            feeName: attrValue[k].fees,
                            amount: attrValue[k].amount,
                            status: attrValue[k].status,
                            installmentNo: [key]
                        });
                    }
                }
                $scope.studentName = $scope.installmentDetails[i].name
                $scope.studentRollNumber = $scope.installmentDetails[i].rollno
                $scope.studentContactNumber = $scope.installmentDetails[i].emer_1
                $scope.studentGradeId = $scope.installmentDetails[i].grade_id
                $scope.studentBalance = details.balance
            }
            $scope.showFeeReports = true;
        }
        var res = details.class.split("-");
        $scope.studentClassName = res[0];
        $scope.studentSectionName = res[1];

        $scope.showFeeReports = true;
    }

    $scope.getInstallmentDetails = function () {
        $scope.filterObject = {
            classIdList: [],
            feestatus: '',
            installmentNameList: [],
            feeCatIdList: []
        }
        $rootScope.mypageloading = true;
        $scope.getStudentStatus = [];
        $scope.selectedClassId = [];
        $scope.selectedFeeId = [];
        $scope.viewFilteredList = [];
        $scope.showIndividualStudentClassName = true;
        $scope.insertInstallmentData = [];
        $scope.finalInstallmentCount = [];
        $scope.getAllInstallmentCountIteration = [];

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feesaggregate/due');
        requestHandle.then(function (result) {

            if (result.success == true) {
                $scope.installmentDetails = result.data;

                for (var i = 0; i < $scope.installmentDetails.length; i++) {
                    // var count = 0;
                    $scope.insertInstallmentData = [];
                    var feeStatusValue = 'PAID';
                    var totalAmount = 0;
                    var obj = $scope.installmentDetails[i].installments;
                    for (var key in obj) {
                        var attrValue = obj[key];
                        for (var k = 0; k < attrValue.length; k++) {
                            if (attrValue[k].status == 'UNPAID') {
                                feeStatusValue = 'UNPAID';
                                // count = count + 1;
                                totalAmount += attrValue[k].amount;
                            }
                            // break;
                        }
                        // $scope.insertInstallmentData.push(attrValue[k].status);
                        $scope.getAllInstallmentCountIteration.push({
                            name: key,
                            _id: key
                        });
                    }
                    // totalAmount = totalAmount + -1*$scope.installmentDetails[i].balance;
                    $scope.viewFilteredList.push({
                        rollno: $scope.installmentDetails[i].rollno,
                        name: $scope.installmentDetails[i].name,
                        emer_1: $scope.installmentDetails[i].emer_1,
                        installmentData: $scope.insertInstallmentData,
                        status: feeStatusValue,
                        totalAmount: totalAmount,
                        balance: $scope.installmentDetails[i].balance,
                        class: classDetails_hash[$scope.installmentDetails[i].grade_id].name,
                        grade_id: classDetails_hash[$scope.installmentDetails[i].grade_id]._id
                    });
                }
                angular.forEach($scope.getAllInstallmentCountIteration, function (val) {
                    $scope.finalInstallmentCount[val.name] = val;
                });
                $rootScope.mypageloading = false;
            }
            else {
                $log.debug('Error in feesaggregate/due ');
            }
        });
    }

    $scope.getClassDetails = function () {
        $rootScope.mypageloading = true;
        HandShakeService.getGradeInfo().then(function (result) {
            $scope.classDetails = result;
            angular.forEach(result, function (classObj) {
                classDetails_hash[classObj._id] = classObj;
            });
            getFeescat();

        }, function (error) {
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    }

    function getFeescat() {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat');
        requestHandle.then(function (result) {
            if (result.success) {
                $scope.Category = result.data;
                angular.forEach(result.data, function (feecatobj) {
                    feesCatHash[feecatobj._id] = feecatobj.name;
                });
            }
            else {
                // FlashService.Error(result.message);
            }
            $scope.getInstallmentDetails();
        });
    }

    $scope.export = function () {
        if ($scope.viewFilteredList.length) {
            kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
                kendo.drawing.pdf.saveAs(group, "FeeReports" + "-" + $scope.onDate + ".pdf");
            });
        } else {

        }
    }

    $scope.exportAction = function () {
        switch ($scope.exportFileType) {
            case 'pdf':
                kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
                    kendo.drawing.pdf.saveAs(group, "FeeReports" + "-" + $scope.onDate + ".pdf");
                });
                break;
            case 'xls':
                $scope.$broadcast('export-excel', {});
                break;
            case 'doc':
                $scope.$broadcast('export-doc', {});
                break;
            case 'csv':
                $scope.$broadcast('export-csv', {});
                break;
            default:
        }
    }

    $scope.getClassDetails();
});