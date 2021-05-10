app.controller('studentAttendanceController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;

    $scope.totalPresentCount = 0;
    $scope.totalAbsentCount = 0;
    $scope.totalMissingClassCount = 0;

    $scope.showDefaultAttendance = [];
   
    $scope.showModal = false;
    $scope.testModal = false;
    $rootScope.mypageloading = true;
    $scope.classSelect = "";
    $scope.monthSelect = "";
    $scope.searchstudent = '';
    $scope.monthDay = [];
    $scope.studentList = [];
    $scope.studentNameList = [];
    $scope.timeStampValue = "";
    $scope.studentAttendance = [];
    $scope.currentCalendarSession = '';


    $scope.monthList = [
        {
            monthId: "1",
            name: "Jan",
        },
        {
            monthId: "2",
            name: "Feb",
        },
        {
            monthId: "3",
            name: "March",
        },
        {
            monthId: "4",
            name: "April",
        },
        {
            monthId: "5",
            name: "May",
        },
        {
            monthId: "6",
            name: "June",
        },
        {
            monthId: "7",
            name: "July",
        },
        {
            monthId: "8",
            name: "August",
        },
        {
            monthId: "9",
            name: "Sep",
        },
        {
            monthId: "10",
            name: "Oct",
        },

        {
            monthId: "11",
            name: "Nov",
        },
        {
            monthId: "12",
            name: "Dec",
        },
    ];
    var currentDate = new Date();
    $scope.currentYear = currentDate.getFullYear();

    var getTodaysAttendance = function () {

        $scope.totalPresentCount = 0;
        $scope.totalAbsentCount = 0;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher/todayattendance');
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true) {

                $scope.todaysattendance = result.data;

                $scope.totalMissingClassCount = parseInt($scope.classList.length - $scope.todaysattendance.length);

                for (var i = 0; i < $scope.todaysattendance.length; i++) {

                    $scope.todaysattendance[i].presentCount = 0;
                    $scope.todaysattendance[i].absentCount = 0;

                    $scope.todaysattendance[i].time = UtilService.timeInMin(new Date(Number($scope.todaysattendance[i].time)));
                    angular.forEach($scope.classList, function (classObj) {
                        if (classObj._id === $scope.todaysattendance[i].class_id) {
                            $scope.todaysattendance[i].class_name = classObj.name;
                            var classTobeRemovedIndex = $scope.showDefaultAttendance.indexOf(classObj.name);
                            if (classTobeRemovedIndex !== -1) $scope.showDefaultAttendance.splice(classTobeRemovedIndex, 1);
                        }

                    });
                    angular.forEach($scope.teachersList, function (teacherObj) {
                        if (teacherObj.teacher_id === $scope.todaysattendance[i].teacher_id) {
                            $scope.todaysattendance[i].teacher_name = teacherObj.name;
                        }
                    });
                    angular.forEach($scope.teachersList, function (teacherObj) {
                        if (teacherObj.teacher_id === $scope.todaysattendance[i].teacher_id) {
                            $scope.todaysattendance[i].teacher_name = teacherObj.name;
                        }
                    });
                    for (var stu in $scope.todaysattendance[i].students) {
                        if ($scope.todaysattendance[i].students.hasOwnProperty(stu)) {
                            var val = $scope.todaysattendance[i].students[stu];
                            if (val)
                                $scope.todaysattendance[i].presentCount++;

                            else
                                $scope.todaysattendance[i].absentCount++;

                        }
                    }

                    $scope.totalPresentCount = $scope.totalPresentCount + $scope.todaysattendance[i].presentCount;
                    $scope.totalAbsentCount = $scope.totalAbsentCount + $scope.todaysattendance[i].absentCount;
                }
            } else {
                //Notify Error
            }
        });
    }


    $scope.getClasses = function () {
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;

            for (var i = 0; i < $scope.classList.length; i++) {
                $scope.showDefaultAttendance.push($scope.classList[i].name)
            }

            getTeachers();
        });
    }
    $scope.getClasses();

    var getTeachers = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher');
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true) {
                $scope.teachersList = result.data;
                getTodaysAttendance();
            } else {

            }
        });
    };

    $scope.selectClass = function (classId) {
        $scope.classSelect = classId;
        HandShakeService.getStudentInfo(classId).then(function (result) {
            $scope.studentList = result;
            $scope.monthSelect = "";
        });

    }

    $scope.getDaysInMonth = function (month, year) {
        return ((new Date(year, month)).getTime() - (new Date(year, month - 1)).getTime()) / (1000 * 60 * 60 * 24);
    }


    $scope.getMonthList = function (totalDays) {
        for (var i = 1; i <= totalDays; i++) {
            $scope.monthDay.push(i)
        }
    }

    // $scope.selectMonth = function (month) {
    //     if (month) {
    //         var newdate = new Date();
    //         var newtimeStamp = new Date(month + "-" + newdate.getDate() + "-" + newdate.getFullYear());
    //         $scope.timeStampValue = newtimeStamp.getTime();
    //         console.log($scope.timeStampValue)
    //         var TotalMonth = $scope.getDaysInMonth(month, $scope.currentYear);
    //         $scope.monthDay = [];
    //         $scope.getMonthList(TotalMonth);
    //         $scope.getAttendance();
    //     }

    // }

    $scope.changeSchoolCalendarSession = function () {
        if ($scope.currentCalendarSession) {
            $scope.timeStampValue = $scope.currentCalendarSession.getTime() +(15*24*60*60*1000);
            var newdate = new Date($scope.timeStampValue);
            var currentMonth = newdate.getMonth() + 1;
            $scope.monthSelect = currentMonth;
            var currentYear = newdate.getFullYear();
            var TotalMonth = $scope.getDaysInMonth(currentMonth, currentYear);
            $scope.monthDay = [];
            $scope.getMonthList(TotalMonth);
            $scope.getAttendance();
        }

    }

    $scope.getAttendance = function () {

        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher/attendance?class_id=' + $scope.classSelect + '&&time=' + $scope.timeStampValue);
        requestHandle.then(function (result) {

            if (result.success) {
                $scope.array = [];
                $scope.studentAttendance = [];
                $scope.allData = []
                var getReponse = result.data;

                console.log(result.data)

                if (getReponse) {
                    for (var i = 1; i <= $scope.monthDay.length; i++) {

                        if (getReponse[i]) {
                            $scope.allData[i] = getReponse[i]

                        } else {
                            $scope.allData[i] = "";
                        }

                    }
                    $scope.studentAttendance = [];
                    angular.forEach($scope.studentList, function (studentObject) {

                        var dayAttendance = [];
                        for (var i = 1; i <= $scope.monthDay.length; i++) {

                            if (getReponse[i]) {
                                if (getReponse[i][studentObject._id] != undefined) {
                                    dayAttendance.push(getReponse[i][studentObject._id]);
                                } else {
                                    dayAttendance.push("-");
                                }

                            } else {
                                dayAttendance.push("-");
                            }

                        }

                        var totalPresent = 0;
                        var totalAbsent = 0;
                        var totalholiday = 0;

                        if (dayAttendance) {
                            for (var j = 0; j < dayAttendance.length; j++) {
                                if (dayAttendance[j] == "-") {
                                    totalholiday = totalholiday + 1
                                }
                                if (dayAttendance[j] == 1) {
                                    totalPresent = totalPresent + 1
                                }
                                if (dayAttendance[j] == 0) {
                                    totalAbsent = totalAbsent + 1
                                }

                            }

                        }

                        $scope.studentAttendance.push({ studentInfo: studentObject, attendance: dayAttendance, totalPresent: totalPresent, totalAbsent: totalAbsent, totalholiday: totalholiday });
                    })

                }
            }
            $rootScope.mypageloading = false;

        })
    }



    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };

    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "StudentAttendance.pdf");
        });

    }


});