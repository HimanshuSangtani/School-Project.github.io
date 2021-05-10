app.controller('smsReportsController', function ($rootScope, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

    $log.debug("ReportsController reporting for duty.");
    $rootScope.showBackStrech = false;
    UtilService.setSidebar();

    $scope.example14settings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.filterObject = {
        studentNames: [],
        classNames: []
    }

    $scope.fromDate = '';
    $scope.toDate = '';

    $scope.onDate = (new Date()).toDateString();
    $rootScope.mypageloading = true;
    $scope.exportFileType = 'pdf';
    $scope.getSmsReportsData = [];
    $scope.filterStudentIdArray = [];
    $scope.filterStudentDateArray = [];
    $scope.filterClassIdArray = [];

    var smsReports_hash = {};
    var studentHash = {};
    var classDetails_hash = {};
    var forFilterSMSReportDataHash = {};

    $scope.getSmsReports = function () {
        $scope.getSmsReportsData = [];
        $scope.showSmsReportsData = [];
        $scope.viewFilteredSmsReportsData = [];
        $scope.getStudentNamesAndIdForFiter = [];
        $scope.filterObject = {
            studentNames: [],
            classNames: []
        }

        smsReports_hash = {};
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/getSmsReport');
        requestHandle.then(function (result) {

            if (result.success == true) {
                $scope.getSmsReportsData = result.data;

                angular.forEach($scope.getSmsReportsData, function (smsObj, key) {
                    smsReports_hash[smsObj._id] = smsObj;
                    var splitDateTime = smsObj.date.split(" ");
                    var l_date = splitDateTime[0];
                    var l_time = splitDateTime[1];

                    $scope.showSmsReportsData.push({
                        "_id": smsObj.student_id,
                        "grade_id": smsObj.student_id ? studentHash[smsObj.student_id].grade_id : "",
                        "senderId": smsObj.senderId,
                        "number": smsObj.number,
                        "status": smsObj.status,
                        "desc": smsObj.desc,
                        "date": l_date,
                        "time": smsObj.date,
                        "userId": smsObj.userId,
                        "message": smsObj.message ? smsObj.message : "",
                        "class": smsObj.student_id ? classDetails_hash[studentHash[smsObj.student_id].grade_id].name : "",
                        "studname": smsObj.student_id ? studentHash[smsObj.student_id].name : "",
                        "rollno": smsObj.student_id ? studentHash[smsObj.student_id].rollno : ""
                    })

                    $scope.viewFilteredSmsReportsData.push({
                        "number": smsObj.number,
                        "desc": smsObj.desc,
                        "date": l_date,
                        "time": smsObj.date,
                        "message": smsObj.message ? smsObj.message : "",
                        "class": smsObj.student_id ? classDetails_hash[studentHash[smsObj.student_id].grade_id].name : "",
                        "studname": smsObj.student_id ? studentHash[smsObj.student_id].name : "",
                        "rollno": smsObj.student_id ? studentHash[smsObj.student_id].rollno : ""
                    })
                    if (smsObj.student_id) {

                        if ($scope.getStudentNamesAndIdForFiter.length == 0) {
                            $scope.getStudentNamesAndIdForFiter.push({
                                name: studentHash[smsObj.student_id].name,
                                _id: smsObj.student_id
                            })
                        }
                        else {

                            var isPresent = $scope.getStudentNamesAndIdForFiter.some(function (element) {
                                return element._id == smsObj.student_id
                            });

                            if (!isPresent) {
                                $scope.getStudentNamesAndIdForFiter.push({
                                    name: studentHash[smsObj.student_id].name,
                                    _id: smsObj.student_id
                                })
                            }
                        }
                    }
                });

                angular.forEach($scope.showSmsReportsData, function (obj) {
                    forFilterSMSReportDataHash[obj._id] = obj;
                });

                $rootScope.mypageloading = false;
            } else {
                console.log('something went wrong in sms reports');
            }
        });
    }

    function checkClassNameFilter(studentObj) {
        if ($scope.filterObject.classNames.length != 0) {

            if ($scope.filterClassIdArray.indexOf(studentObj.grade_id) != -1) {
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


    function checkStudentNameFilter(studentObj) {
        if ($scope.filterObject.studentNames.length != 0) {
            if ($scope.filterStudentIdArray.indexOf(studentObj._id) != -1) {
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

    function checkStudentDateFilter(selectedDdate) {
        if (selectedDdate != '' && selectedDdate != null && selectedDdate != undefined) {
            if ($scope.filterStudentDateArray.indexOf(selectedDdate) != -1) {
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

    $scope.applyFilterFunction = function () {
        $scope.filterStudentIdArray = [];
        $scope.filterStudentDateArray = [];
        $scope.filterClassIdArray = [];
        $scope.viewFilteredSmsReportsData = [];

        for (var i = 0; i < $scope.filterObject.studentNames.length; i++) {
            $scope.filterStudentIdArray.push($scope.filterObject.studentNames[i]._id)
        }

        for (var i = 0; i < $scope.showSmsReportsData.length; i++) {
            $scope.filterStudentDateArray.push($scope.showSmsReportsData[i].date)
        }

        for (var i = 0; i < $scope.filterObject.classNames.length; i++) {
            $scope.filterClassIdArray.push($scope.filterObject.classNames[i]._id)
        }

        angular.forEach($scope.showSmsReportsData, function (studentObj) {
            var isFiltered = true;
            var isDateFilter = false;

            if (checkStudentNameFilter(studentObj)) {
                if (checkClassNameFilter(studentObj)) {

                    if (checkStudentDateFilter($scope.fromDate)) {
                        if ($scope.fromDate != '' && $scope.fromDate != null && $scope.fromDate != undefined) {
                            isDateFilter = true;
                        }
                    }
                    else {
                        isFiltered = false;
                        isDateFilter = false;
                    }

                }
                else {
                    isFiltered = false;
                }
            }
            else {
                isFiltered = false;
                isDateFilter = false;
            }

            if (isFiltered) {
                if (isDateFilter) {
                    if ($scope.fromDate == studentObj.date) {
                        $scope.viewFilteredSmsReportsData.push({
                            "number": studentObj.number,
                            "desc": studentObj.desc,
                            "time": studentObj.time,
                            "class": studentObj.class,
                            "message": studentObj.message,
                            "studname": studentObj.studname,
                            "rollno": studentObj.rollno
                        })
                    }
                }
                else {
                    $scope.viewFilteredSmsReportsData.push({
                        "number": studentObj.number,
                        "desc": studentObj.desc,
                        "time": studentObj.time,
                        "class": studentObj.class,
                        "message": studentObj.message,
                        "studname": studentObj.studname,
                        "rollno": studentObj.rollno
                    })
                }
            }
        });
    }


    $scope.getStudentsDetails = function () {

        HandShakeService.getAllStudentInfo().then(function (allStudentList) {
            $log.debug('HandShakeService existingStudentList received');
            angular.forEach(allStudentList, function (studentObj) {
                studentHash[studentObj._id] = studentObj;
            });

            $scope.getSmsReports();
        });
    }


    $scope.getClassDetails = function () {
        $rootScope.mypageloading = true;
        HandShakeService.getGradeInfo().then(function (result) {
            $scope.classDetails = result;
            angular.forEach(result, function (classObj) {
                classDetails_hash[classObj._id] = classObj;
            });

            $scope.getStudentsDetails();

        }, function (error) {
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    }

    $scope.getClassDetails();

    $scope.export = function () {
        if ($scope.getSmsReportsData.length) {
            kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
                kendo.drawing.pdf.saveAs(group, "SmsReports" + "-" + $scope.onDate + ".pdf");
            });
        } else {

        }
    }

    $scope.exportAction = function () {
        switch ($scope.exportFileType) {
            case 'pdf':
                kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
                    kendo.drawing.pdf.saveAs(group, "SmsReports" + "-" + $scope.onDate + ".pdf");
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
});