app.controller('liveClassController', function($rootScope, $interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $scope.catSelect = '';
    $scope.cashType = "";
    $scope.Category = []
    $scope.liveClasses = [];
    $scope.gettallliveSelect = '';
    $scope.showModel = '';
    $scope.startDate = '';
    $scope.dueDate = '';
    $scope.endDate = '';
    $scope.feeTypeInstallment = [];
    $scope.InstallmentTempArray = [];
    $scope.visibility = false;
    $scope.joinClass = true;
    $scope.mddate = (new Date()).toDateString().slice(4);
    $scope.flag = false;

    var stuHash = {};

    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);


    $scope.getReport = function() {
        $rootScope.mypageloading = true;
        if (!$scope.flag) {

            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/timetable/getreport?stime=' + start.getTime());
            requestHandle.then(function(result) {
                $rootScope.mypageloading = false;
                if (result.success) {
                    $scope.liveClasses = result.data;
                    $scope.flag = true;
                    // console.log($scope.liveClasses,$scope.teachersList,$scope.classList)
                    angular.forEach($scope.liveClasses, function(item) {
                        // console.log('live',item)

                        var classIndex = $scope.classList.findIndex(function(element) {
                            //   console.log('class',element)    
                            return element._id == item.grade_id;

                        })
                        var teacherIndex = $scope.teachersList.findIndex(function(element) {
                            // console.log('teacher',element)
                            return element.teacher_id == item.teacher_id;

                        })
                        if(teacherIndex != -1)
                            item.teacher = $scope.teachersList[teacherIndex].name;
                        if(classIndex != -1)
                            item.class = $scope.classList[classIndex].name;
                        // item.start_time = UtilService.timeInMin(new Date(item.start_time))
                        // item.end_time = UtilService.timeInMin(new Date(item.end_time))


                        // console.log(classIndex);
                        // console.log(teacherIndex);
                    })
                    $scope.TotalDuration = $scope.liveClasses.end_date - $scope.liveClasses.end_date
                    // $scope.liveClasses.sort(function(a,b){
                    //     return new Date(b.time) - new Date(a.time);
                    // });

                } else {
                    FlashService.Error(result.message);
                }
            });

        } else {
            $scope.start_date = new Date($scope.mddate).setHours(0, 0, 0, 0)
            $scope.end_date = new Date($scope.mddate).setHours(23, 59, 59, 999)
            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/timetable/getreport?stime=' + $scope.start_date + "&etime=" + $scope.end_date);
            requestHandle.then(function(result) {
                $rootScope.mypageloading = false;
                if (result.success) {
                    $scope.liveClasses = result.data;
                    // console.log($scope.liveClasses,$scope.teachersList,$scope.classList)
                    angular.forEach($scope.liveClasses, function(item) {
                            // console.log('live',item)

                            var classIndex = $scope.classList.findIndex(function(element) {
                                //   console.log('class',element)    
                                return element._id == item.grade_id;

                            })
                            var teacherIndex = $scope.teachersList.findIndex(function(element) {
                                // console.log('teacher',element)
                                return element.teacher_id == item.teacher_id;

                            })
                            if(teacherIndex != -1)
                                item.teacher = $scope.teachersList[teacherIndex].name;
                            if(classIndex != -1)
                                item.class = $scope.classList[classIndex].name;
                            // item.start_time = UtilService.timeInMin(new Date(item.start_time))
                                // console.log(classIndex);
                                // console.log(teacherIndex);
                        })
                        // $scope.liveClasses.sort(function(a,b){
                        //     return new Date(b.time) - new Date(a.time);
                        // });

                } else {
                    FlashService.Error(result.message);
                }
            });

        }

    }

    $scope.getDuration = function(subCat) {
            // var ftr = end_time.split(":")
            // var ftr2 = start_time.split(":")
            // var diff = (parseInt(ftr[0] + ftr[1].slice(0, 2)) - parseInt(ftr2[0] + ftr2[1].slice(0, 2))) / 1000
            var diff;
            if(!subCat.end_time)
                diff = Date.now() - subCat.start_time;
            else
                diff = subCat.end_time -  subCat.start_time;
            
            var timeDuration = diff /= 60000;
            return Math.abs(Math.round(timeDuration));
        }
        //     function diff_minutes(dt2, dt1) 
        //  {

    //   var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    //   diff /= 60;
    //   return Math.abs(Math.round(diff));

    //  }

    $scope.joinClass = function(link) {
            window.open(link);
        }
        // function classIndex(element) {
        //     return element == grade_id;
        // }
        // var teacherIndex = (element) => element == teacher_id;
        // var classIndex = (element) => element == grade_id;

    // -----Save Sub Cat------
    $scope.delete = function(params) {
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/slot/deletelectureslot?id=' + params._id);
            requestHandle.then(function(result) {
                $rootScope.mypageloading = false;

                if (result.success) {
                    FlashService.Error(result.data.message);
                    if (result.data.result == '') {
                        $scope.getReport();
                    } else {
                        FlashService.Error(result.data.message);
                        $scope.getReport();
                        $scope.showViewStudent = false;

                    }
                } else {
                    FlashService.Error(result.data.message);
                }
            });
        }
        // -----Open Add Sub Cat------
    $scope.openViewStudent = function(item) {
            console.log("item===", item);
            FlashService.Error('');
            // $scope.cat();
            // $scope.feeTypeInstallment =[];
            $scope.showModel = 'Add';
            $scope.subCat = item;

            angular.forEach($scope.subCat.joinees, function (item){
                if(stuHash[item._id]) {
                    item.name = stuHash[item._id].name
                    item.rollno = stuHash[item._id].rollno
                }
            });

            // HandShakeService.getAllStudentInfo().then(function(result) {
            //     $log.debug('HandShakeService existingStudentList received');
            //     $scope.studentList = result;
            //     console.log("studentList====", $scope.studentList);
            //     for (var i = 0; i < $scope.studentList.length; i++) {
            //         angular.forEach($scope.subCat.joinees, (item) => {
            //             // item.start_time = UtilService.timeInMin(new Date(start_time))
            //             console.log("id===" + (item._id == $scope.studentList[i]._id));
            //             if (item._id == $scope.studentList[i]._id) {
            //                 item.name = $scope.studentList[i].name;
            //                 item.rollno = $scope.studentList[i].rollno;
            //                 // item.start_time = UtilService.timeInMin(new Date(item.start_time))
            //             }
            //         });
            //     }

            //     $rootScope.mypageloading = false;

            // });


            $scope.AddSlot = {
                "name": "",
                "startTime": "",
                "endTime": ""
            }

            $scope.showViewStudent = true;
        }
        // -----Open Add Sub Cat------



    $scope.viewgettalllive = function(getReport) {}

    $scope.export = function() {
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "Feegettallliveegory.pdf");
        });
    }

    HandShakeService.getGradeInfo().then(function(classes) {
        $scope.classList = classes;
        HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher')
            .then(function(result) {
                $rootScope.mypageloading = false;
                if (result.success == true) {
                    $scope.teachersList = result.data;
                    // $scope.timetableData.selectedTeacher=result.data[0]._id;
                    $scope.getReport();

                }
            })
    })

    HandShakeService.getAllStudentInfo().then(function(result) {
                $log.debug('HandShakeService existingStudentList received');
                $scope.studentList = result;
                angular.forEach($scope.studentList,function(studentObj){
                    stuHash[studentObj._id] = studentObj
                });
                $rootScope.mypageloading = false;

            });


    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };


    $scope.refresh = function() {
        $scope.getReport();
    }

});