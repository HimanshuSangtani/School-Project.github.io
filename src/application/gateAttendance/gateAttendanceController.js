/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




app.controller('GateAttendanceController', function ($rootScope, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {
    $log.debug("ReportsController reporting for duty.");
    $rootScope.showBackStrech = false;

    UtilService.setSidebar();

    $scope.onDate = (new Date()).toDateString();
    $scope.calenderVisibility = false;
    var v_type = '';
    $scope.studentDetailsPopup = false;
    $scope.alertdetailspopup = false;
    $scope.fromMaxDate = Date();
    $scope.toMaxDate = Date();
    $scope.toMinDate = '';
    $scope.fromDate = '';
    $scope.toDate = '';
    $scope.tripList = [];
    $scope.replayView = false;
    $scope.moving = false;
    $scope.isPaused = false;
    $scope.replaytime = '';
    $scope.totalTime = 0;
    $scope.totalDistance = 0;
    $scope.custom_date = false;
    var isMapInitialised = false;
    $scope.includeMobileTemplate = false;
    $scope.duration = "Time";
    $scope.nextPressed = false;
    var summaryHash = [];
    $scope.summary_list = [];
    $scope.isDetail = false;
    var schoolMarker = {};
    $scope.busMarker = {};
    UtilService.replayLines = [];
    $scope.calender = false;
    ////////////////////////////////////////////


    $scope.exportFileType = 'pdf';

    function sortByTime(arr) {
        arr.sort(function(a, b){
            var keyA = new Date(a.time),
                keyB = new Date(b.time);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });
    };

    $scope.student_list = [];
    $scope.attendance_data = [];
    var student_hash = {};
    var class_hash = {};
    var student_att_hash = {};
    $scope.showSingleStudentAttendance = false;


    HandShakeService.getGradeInfo().then(function (result) {
        angular.forEach(result,function(classObj){
            class_hash[classObj._id] = classObj;
        });
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService existingStudentList received');
            $scope.student_list = result;
            angular.forEach($scope.student_list,function(studentObj){
                student_hash[studentObj._id] = studentObj;
            });
            $scope.getAttendanceByDate();
        });
    });
    



    $scope.getAttendanceByDate = function () {
        $scope.attendance_data = [];
        student_att_hash = {};
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/door/getdoorAttendence/date/' + $scope.onDate);
        requestHandle.then(function (result) {

            if (result.success == true) {
                $scope.getAttendanceDetails = result.data;
                if ($scope.getAttendanceDetails && $scope.getAttendanceDetails.length && $scope.student_list && $scope.student_list.length) {
                    var timeHash = {};
                    angular.forEach($scope.getAttendanceDetails,function(attendanceObj) {
                        if(!timeHash[attendanceObj.time+attendanceObj.id]) {
                            timeHash[attendanceObj.time+attendanceObj.id] = 1;
                            if(student_att_hash[attendanceObj.id]) {
                                student_att_hash[attendanceObj.id].push(attendanceObj);
                            } else {
                                student_att_hash[attendanceObj.id] = [attendanceObj];
                            }
                            
                        } else {
                            // console.log('fff')
                        }
                    });
                    for (var stuId in student_att_hash) {
                      if (student_att_hash.hasOwnProperty(stuId)) {
                        sortByTime(student_att_hash[stuId]);
                        $scope.attendance_data.push({
                            name: student_hash[stuId].name,
                            punches: student_att_hash[stuId],
                            class: class_hash[student_hash[stuId].grade_id].name
                        })
                      }
                    }
                    
                    // $scope.getListOfStudentAttendance();
                }
                else {
                    // console.log('else');
                }
            } else {
                // console.log('Something went wrong in getAttendance details');
            }
        });
    }


    $scope.getListOfStudentAttendance = function () {
       
        $scope.getListOfStudentAttendanceArray = [];
        $scope.showDefaultDetailsOfAttendance = [];
        $scope.StudentId = [];
        $scope.studentInData = [];
        $scope.studentOutDataArray = [];
        firstDataIsOut = false;
        inDataisInserted = false;
        var studentOutData = '';

        if ($scope.getAttendanceDetails.length != undefined) {
            for (var i = 0; i < $scope.getAttendanceDetails.length; i++) {
                var count = 0;
                if ($scope.student_list && $scope.student_list.length > 0) {
                    for (var j = 0; j < $scope.student_list.length; j++) {
                        var flag = 0;
                        if ($scope.getAttendanceDetails[i].id == $scope.student_list[j]._id) {

                            if ($scope.getListOfStudentAttendanceArray.length != 0) {

                                for (var k = 0; k < $scope.getListOfStudentAttendanceArray.length; k++) {

                                    if ($scope.student_list[j].name == $scope.getListOfStudentAttendanceArray[k]) {
                                        flag = flag + 1;

                                        if ($scope.getAttendanceDetails[i].punch == 'in' && firstDataIsOut == true && inDataisInserted != true) {
                                            $scope.studentInData.push($scope.getAttendanceDetails[i].time);
                                            inDataisInserted = true;
                                        }

                                        if ($scope.getAttendanceDetails[i].punch == 'out') {
                                            studentOutData = $scope.getAttendanceDetails[i].time;
                                        }

                                    }
                                }
                                if (flag != 1) {
                                    $scope.getListOfStudentAttendanceArray.push($scope.student_list[j].name);
                                    $scope.StudentId.push($scope.student_list[j]._id);
                                    $scope.studentOutDataArray.push(studentOutData);
                                    if ($scope.getAttendanceDetails[i].punch == 'out') {
                                        firstDataIsOut = true;
                                    }
                                    if ($scope.getAttendanceDetails[i].punch == 'in' && count == 0) {
                                        $scope.studentInData.push($scope.getAttendanceDetails[i].time);
                                        count = count + 1;
                                        firstDataIsOut = false;
                                        inDataisInserted = false;
                                    }
                                }
                            }
                            else {
                                $scope.getListOfStudentAttendanceArray.push($scope.student_list[j].name);
                                $scope.StudentId.push($scope.student_list[j]._id);
                                if ($scope.getAttendanceDetails[i].punch == 'out') {
                                    studentOutData = $scope.getAttendanceDetails[i].time;
                                    firstDataIsOut = true;
                                }
                                if ($scope.getAttendanceDetails[i].punch == 'in') {
                                    $scope.studentInData.push($scope.getAttendanceDetails[i].time);
                                    count = count + 1;
                                    firstDataIsOut = false;
                                    inDataisInserted = false;
                                }
                            }
                        }
                    }
                }

            }
           
            $scope.studentOutDataArray.push(studentOutData);

            for (var g = 0; g < $scope.getListOfStudentAttendanceArray.length; g++) {

                $scope.showDefaultDetailsOfAttendance.push({
                    name: $scope.getListOfStudentAttendanceArray[g],
                    firstIn: $scope.studentInData[g],
                    lastOut: $scope.studentOutDataArray[g],
                    id: $scope.StudentId[g]
                })
            }
            console.log($scope.showDefaultDetailsOfAttendance);

        }
        else {
            $scope.getListOfStudentAttendance();
        }

    }

    $scope.showStudentAttendance = function (details) {

        $scope.modealStudentDetails = details;
        $scope.studentName = [];
        $scope.firstIn = [];
        $scope.lastOut = [];
        $scope.showInformationOfStudent = [];

        if ($scope.getAttendanceDetails.length != undefined) {
            for (var i = 0; i < $scope.getAttendanceDetails.length; i++) {

                if (details.id == $scope.getAttendanceDetails[i].id) {

                    $scope.nameOfStudent = details.name;
                    $scope.studentName.push(details.name);

                    if ($scope.getAttendanceDetails[i].punch == 'in') {
                        $scope.firstIn.push($scope.getAttendanceDetails[i].time);
                    }
                    if ($scope.getAttendanceDetails[i].punch == 'out') {
                        $scope.lastOut.push($scope.getAttendanceDetails[i].time);
                    }

                }

                if ($scope.student_list.length != undefined) {
                    for (var j = 0; j < $scope.student_list.length; j++) {

                        if (details.id == $scope.student_list[j]._id) {

                                $scope.rollNo = $scope.student_list[j].rollno;
                                $scope.gender = $scope.student_list[j].gender;
                                $scope.contactNo = $scope.student_list[j].emer_1;
                                $scope.rfid = $scope.student_list[j].rfid;
                               
                        }

                    }
                }
            }
        }

        for (var g = 0; g < $scope.studentName.length; g++) {

            $scope.showInformationOfStudent.push({
                name: $scope.studentName[g],
                firstIn: $scope.firstIn[g],
                lastOut: $scope.lastOut[g]
            })
        }

        $scope.showSingleStudentAttendance = true;
    }

    $scope.export = function(){
        if($scope.onDate && $scope.attendance_data.length) {
            kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
                kendo.drawing.pdf.saveAs(group, "GateAttendance"+"-"+$scope.onDate+".pdf");
              });
        } else {

        }
        
    };

    $scope.exportAction = function () {
        switch ($scope.exportFileType) {
            case 'pdf':
                kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
                kendo.drawing.pdf.saveAs(group, "GateAttendance"+"-"+$scope.onDate+".pdf");
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
    };

});

