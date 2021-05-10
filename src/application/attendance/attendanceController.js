/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


app.controller('AttendanceController', function ($rootScope, $scope, UtilService,  HttpService, HandShakeService, mapService, $sessionStorage, $timeout, $log) {
    $log.debug("AttendanceController reporting for duty.");

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    

    //for calendar
    $scope.duration = "Time";
    $scope.nextPressed = false;
    $scope.fromMaxDate = Date();
    $scope.toMaxDate = Date();
    $scope.toMinDate = '';
    $scope.fromDate = '';
    $scope.toDate = '';
    $scope.custom_date = false;

    //for attendance
    $scope.isDetail = false;
    var summaryHash = [];
    $scope.summary_list = [];
    var dayHash = [];
    var studentHash = [];
    $scope.studentDaywiseList = [];
    $scope.student_list = [];


    $scope.classView = true;
    $scope.classList = [];
    HandShakeService.getGradeInfo().then(function (result) {
        $log.debug('HandShakeService getRouteInfo received');
        //$scope.existingClassList = result;
        $rootScope.mypageloading = false;
        $scope.classList = result;
        //serverFormatToList(result);
    });

    

    $scope.showStuList = function ($index) {
        var classId = $scope.classList[$index]._id;
        $scope.className = $scope.classList[$index].name;
        $scope.classView = false;
        $rootScope.mypageloading = true;
        HandShakeService.getStudentInfo(classId).then(function (result) {
            $rootScope.mypageloading = false;
            var index = 0;
            angular.forEach(result, function (stuObject) {
                studentHash[stuObject._id] = stuObject;
            });
            $scope.existingStudentList = result;
            $scope.calendar_select(0);
        });
    };

    $scope.getHistoryReport = function (fromDate, toDate) {

        $scope.isDetail = false;
        $scope.fromDate = fromDate;
        $scope.toDate = toDate;
        $scope.totalTime = 0;
        $scope.totalDistance = 0;
        var from, fromUTC, to, toUTC;
        if ($scope.duration == 'Custom date')
        {
            $scope.duration = fromDate;
            $scope.duration += ' - ';
            $scope.duration += toDate;
        }

        if ($scope.fromDate && $scope.toDate)
        {
            $scope.custom_date = false;
            $rootScope.mypageloading = true;
            if ($scope.fromDate)
            {
                from = new Date($scope.fromDate);
                fromUTC = from.valueOf();
            }
            if ($scope.toDate)
            {
                to = new Date($scope.toDate);
                toUTC = to.valueOf();
            }

            if (fromUTC > toUTC)
            {
                $rootScope.mypageloading = false;
                return;
            }
            if (fromUTC == toUTC)
            {
                toUTC += 86399000;
            }

            $scope.student_list = [];
            dayHash = [];
            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/trip?st=' + fromUTC + '&et=' + toUTC);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    $scope.tripList = result.data;
                    if ($scope.tripList.length == 0)
                    {
                        return;
                    }
                    angular.forEach($scope.tripList, function (tripObj) {

                        if (mapService.busHash[tripObj.device_id] != undefined)
                        {
                            tripObj.bus_number = mapService.busHash[tripObj.device_id].bus_number;
                        } else
                        {
                            tripObj.bus_number = '-';
                        }

                        var date = new Date(tripObj.start_time);
                        date.setHours(0);
                        date.setMinutes(0);
                        date.setSeconds(0);
                        date.setMilliseconds(0);
                        var dayStartTime = date.getTime();
                        tripObj.withCard = 0;
                        angular.forEach(tripObj.stud_activity, function (stuObj) {
                            if (studentHash[stuObj._id])
                            {
                                studentHash[stuObj._id].dayHash = [];
                                stuObj.trip_type = tripObj.trip_type;
                                var dateObj = new Date(Number(stuObj.time));
                                stuObj.dateoftrip = dateObj.toDateString();
                                if (stuObj.trip_type == 'DROP')
                                {
                                    stuObj.checkout = dateObj.toLocaleTimeString();
                                } else
                                {
                                    stuObj.checkin = dateObj.toLocaleTimeString();
                                }
                                if (studentHash[stuObj._id])
                                {
                                    studentHash[stuObj._id].dayHash[dayStartTime] = stuObj;
                                }
                                if (stuObj.card == undefined || stuObj.card)
                                {
                                    tripObj.withCard++;
                                }
                            }

                        });
                        dayHash[dayStartTime] = tripObj;
                    });
                    $scope.workingDaysCount = Object.keys(dayHash).length;
                    $scope.student_list = [];
                    Object.keys(studentHash).forEach(function (studentId) {
                        var studentObj = studentHash[studentId];
                        if (studentHash[studentId].dayHash)
                            studentObj.daysPresent = Object.keys(studentHash[studentId].dayHash).length;
                        else
                            studentObj.daysPresent = 0;
                        $scope.student_list.push(studentObj);
                    });
                } else
                {
                    //Notify Error
                }
            });
        }
    };

    $scope.showDetailsStuList = function ($index) {
        $scope.isDetail = true;
        var student_object = $scope.student_list[$index];
        $scope.studentName = student_object.name;
        $scope.studentDaywiseList = [];
        if (dayHash)
        {
            Object.keys(dayHash).forEach(function (day) {
                var dayObject = {
                    dateoftrip: '',
                    attendance: '',
                    trip_type: '',
                    checkin: '',
                    checkout: '',
                    card: ''
                };
                if (student_object.dayHash[day])
                {
                    var dateObj = new Date(Number(student_object.dayHash[day].time));
                    dayObject.dateoftrip = dateObj.toDateString();
                    dayObject.attendance = 'Present';
                    if(student_object.dayHash[day].card == undefined || student_object.dayHash[day].card)
                        dayObject.card = 'Card';
                    else
                        dayObject.card = 'Manual';
                    dayObject.checkin = student_object.dayHash[day].checkin;
                    dayObject.checkout = student_object.dayHash[day].checkout;
                } else
                {
                    var dateObj = new Date(Number(day));
                    dayObject.dateoftrip = dateObj.toDateString();
                    dayObject.attendance = 'Absent';
                    dayObject.card = '-';
                    dayObject.checkin = '-';
                    dayObject.checkout = '-';
                }
                $scope.studentDaywiseList.push(dayObject);
                //studentObj.daysPresent = Object.keys(studentHash[studentId].dayHash).length;
            });
        } else
        {
            var dayObject = {
                dateoftrip: '',
                attendance: '',
                trip_type: '',
                checkin: '',
                checkout: '',
                card: ''
            };
            var dateObj = new Date();
            dayObject.dateoftrip = dateObj.toDateString();
            dayObject.attendance = 'Absent';
            dayObject.card = '-';
            dayObject.checkin = '-';
            dayObject.checkout = '-';
        }

    };


    //calendar
    $scope.dateValidation = function (fromDate, toDate) {
        var from, to, fromUTC, toUTC;
        $scope.fromDate = fromDate;
        $scope.toDate = toDate;
        if ($scope.fromDate)
        {
            from = new Date($scope.fromDate);
            fromUTC = from.valueOf();
            $scope.toMinDate = from.toString();
        }
        if ($scope.toDate)
        {
            to = new Date($scope.toDate);
            toUTC = to.valueOf();
            $scope.fromMaxDate = to.toString();
        }
    };
    $scope.calendar_list = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Custom'];

    $scope.calendar_select = function ($index) {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        var midNightTime = date.getTime() + 86400000;
        if ($index == 4)
        {
            $scope.duration = 'Custom date';
            $scope.visibility = true;
            $scope.custom_date = true;
            $scope.fromMaxDate = Date();
            $scope.nextPressed = false;
            return;
        }
        //Today
        if ($index == 0)
        {
            $scope.duration = 'Today';
            $scope.fromDate = midNightTime - 86400000;
            $scope.toDate = midNightTime;
        } else if ($index == 1)
        {
            $scope.duration = 'Yesterday';
            $scope.fromDate = midNightTime - 2 * 86400000;
            $scope.toDate = midNightTime - 86400000;
        } else if ($index == 2)
        {
            $scope.duration = 'Last 7 days';
            $scope.fromDate = midNightTime - 8 * 86400000;
            $scope.toDate = midNightTime;
        } else if ($index == 3)
        {
            $scope.duration = 'Last Month';
            $scope.fromDate = midNightTime - 31 * 86400000;
            $scope.toDate = midNightTime;
        }
        $scope.getHistoryReport($scope.fromDate, $scope.toDate);


    };

    $scope.cancel = function () {
        $scope.fromDate = '';
        $scope.toDate = '';
        $scope.custom_date = false;
    };

    $scope.next = function () {
        $scope.nextPressed = true;
    };

    $scope.back = function () {
        $scope.nextPressed = false;
    };
    
    
    
    $scope.exportAction = function (option) {
        switch (option) {
            case 'pdf':
                $scope.$broadcast('export-pdf', {});
                break;
            case 'excel':
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

    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "AttendanceList.pdf");
          });
       
    }


});