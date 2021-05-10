app.controller('routeInfoController', function ($rootScope, $scope, $q, $sessionStorage, $routeParams, $log, UtilService,  HttpService, FlashService, $indexedDB, HandShakeService/*, $location, $http */) {

    UtilService.setSidebar();
    $log.debug("routeInfoController reporting for duty.");
    $rootScope.showBackStrech = false;

    
    $scope.showAddNewStudentModal = false;
    $scope.showEditStudentModal = false;

    $scope.newStudentList = [];
    $scope.existingStudentList = [];
    var existingStopId = '';
    //$scope.routeList = angular.fromJson($sessionStorage.routeList);

    $scope.routeID = ($routeParams.routeID).toString();
    if ($scope.routeID.substring(0, 1) === ':') {
        $scope.routeID = $scope.routeID.substring(1);

    }
    var stopListHash = [];
    $scope.stopList = [];

    var routeInfoInit = function() {
        var defer = $q.defer();
        $indexedDB.openStore('route', function (routeStore) {
            routeStore.find($scope.routeID).then(function (routeInfo) {
                $scope.routeName = routeInfo.route_name;
                //$scope.stopList = routeInfo.stop_list;
                angular.forEach(routeInfo.stop_list, function (stopObject) {
                    if (stopObject.name !== undefined && stopObject.name !== null && stopObject.name !== '')
                    {
                        stopListHash[stopObject._id] = stopObject;
                        $scope.stopList.push(stopObject);
                    }
                    defer.resolve();
                });
            });
        });
        return defer.promise;
    };

    routeInfoInit().then(function () {
        getStudentDetails();
    });
            


    //$scope.stopList = ['raju', 'kaju', 'baju'];
    function getStudentDetails() {
        $log.debug('getStudentDetails $scope.routeID ' + $scope.routeID);

        $indexedDB.openStore('student', function (studentStore) {
            $log.debug('studentStore opened');
            var find = studentStore.query();
            find = find.$eq($scope.routeID);
            find = find.$index("route_id");

            studentStore.eachWhere(find).then(function (stuList) {
                $log.debug('studentStore eachwhere queried');
                $scope.existingStudentList = stuList;
                $log.debug('$scope.existingStudentList len = ' + $scope.existingStudentList.length);
                angular.forEach($scope.existingStudentList, function (studentObject) {
                    $log.debug('studentObject.stop_id = ' + studentObject.stop_id);
                    studentObject.stop_name = stopListHash[studentObject.stop_id].name;
                });
                // var temp = angular.fromJson($scope.existingStudentList[0].stop);
                //$log.debug('temp = ' + temp.name);
            });
        });
    }


    $scope.allStudentList = [];
    $scope.allUnassignedStudentList = [];

    $scope.addNewStudent = function () {

        $scope.allStudentList.length = 0;
        $scope.allUnassignedStudentList.length = 0;
        $scope.allStudentList = [];
        $scope.allUnassignedStudentList = [];
        $scope.query = '';

        $indexedDB.openStore('student', function (studentStore) {
            $log.debug('opened studentStore');

            studentStore.getAll().then(function (allStuList) {
                // Update scope
                $scope.allStudentList = allStuList;
                $log.debug('$scope.allStudentList = ' + $scope.allStudentList.length);
                angular.forEach($scope.allStudentList, function (stuInfo) {
                    if (stuInfo.stop_id == '' || stuInfo.stop_id == undefined)
                    {
                        $scope.allUnassignedStudentList.push(stuInfo);

                    }
                })
                $log.debug('$scope.allUnassignedStudentList = ' + $scope.allUnassignedStudentList.length);
            });

        });
        $scope.showAddNewStudentModal = !$scope.showAddNewStudentModal;
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];
        $scope.editing = false;
//        var studentInfo = {
//            name: '',
//            rollno: '',
//            gender: '',
//            rfid: ''         
//        };
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
        //$scope.newStudentList.push(studentInfo);
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
    };


    $scope.addStudent = function (stu) {
        //$log.debug('addStudent called $index ' + $index);
        var studentInfo = {
            name: '',
            rollno: '',
            gender: '',
            rfid: '',
            stop_id: '',
            stop_name: '',
            route_id: $scope.routeID,
            grade_id: ''
        };
//        $scope.editing = false;
        ////$scope.allUnassignedStudentList[$index];
        //angular.copy($scope.allUnassignedStudentList[$index],studentInfo);
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
        if ($scope.newStudentList.indexOf(stu) == -1) {
            $scope.newStudentList.push(stu);
        } else
        {
            alert('Student has already been added in the list.');
        }

        $log.debug('$scope.allUnassignedStudentList.length ' + $scope.allUnassignedStudentList.length);
        $scope.allUnassignedStudentList.splice($scope.allUnassignedStudentList.indexOf(stu), 1);
        $log.debug('$scope.allUnassignedStudentList.length ' + $scope.allUnassignedStudentList.length);
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
        $scope.query = '';
    };
    $scope.cancelAddStudent = function () {
        $log.debug('cancelAddStudent called');
        angular.forEach($scope.newClassList, function (newStuInfo) {
            newStuInfo.stop_id = '';
            newStuInfo.stop_name = '';
        });
        $scope.allUnassignedStudentList.concat($scope.newClassList);
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];
        $scope.showAddNewStudentModal = false;
        $scope.showEditStudentModal = false;
        FlashService.Error('');
    };

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];
        $scope.showAddNewStudentModal = false;
        $scope.showEditStudentModal = false;
        FlashService.Error('');
    };


    var indexInEditing = 0;
    var newStuListInServerFormat = [];
    $scope.saveStudent = function () {
        $log.debug('saveStudent called');
        $log.debug('stop_name = ' + $scope.newStudentList[0].stop_name);
        $log.debug('$scope.newStudentList.length' + $scope.newStudentList.length);
        //$scope.unassignedDeviceList[newStudentInfo.unassignedListIndex].bus_number = newStudentInfo.bus_number;

        //$scope.newStudentList contains many extra info which server doesn't need, so converting it into newStuListInServerFormat
        newListToServerFormat();
        var addStudObject = {
            route_name: $scope.routeName,
            stud_list: newStuListInServerFormat

        };
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/addstud/' + $scope.routeID, addStudObject);
        requestHandle.then(function (result) {
            if (result.success == true)
            {
//                angular.forEach($scope.newStudentList, function (stuInfo) {
//                    stuInfo.route_id = $scope.routeID;
//                });HandShakeService.routewarningcheck();
                $scope.existingStudentList = $scope.existingStudentList.concat($scope.newStudentList);

                $log.debug('scope.existingStudentList.length = ' + $scope.existingStudentList.length);
                $log.debug('$scope.existingStudentList[0]' + $scope.existingStudentList[0].stop_name);
                $sessionStorage.tempexitstulist = $scope.existingStudentList;
                $scope.newStudentList.length = 0;
                $scope.newStudentList = [];
                $scope.showAddNewStudentModal = false;
                $indexedDB.openStore('student', function (studentStore) {
                    $log.debug('opened studentStore');
                    studentStore.upsert($scope.existingStudentList).then(function (e) {
                        $log.debug('upserted successfully in studentStore');
                        updateStuCountInRoute($scope.existingStudentList.length);
                    },
                            function (error) {
                                $log.debug('Error in upserting in studentStore = ' + error);
                            });
                });
            } else
            {
                if (result.data == null || result.data == '' || result.data == undefined)
                {
                    FlashService.Error('Oops, something went wrong! Please login again.');
                } else
                {
                    FlashService.Error(result.data);
                }
            }
        });




    }
    ;


    $scope.editStudentInfo = function ($index) {

        editStuInfoUtil($index);

//        if ($scope.allUnassignedStudentList.length == 0)
//        {
//            $indexedDB.openStore('student', function (studentStore) {
//                studentStore.getAll().then(function (allStuList) {
//                    // Update scope
//                    $scope.allStudentList = allStuList;
//                    $log.debug('$scope.allStudentList = ' + $scope.allStudentList.length);
//                    angular.forEach($scope.allStudentList, function (stuInfo) {
//                        if (stuInfo.stop == '' || stuInfo.stop == undefined)
//                        {
//                            $scope.allUnassignedStudentList.push(stuInfo);
//                            editStuInfoUtil($index);
//                        }
//                    })
//                    $log.debug('$scope.allUnassignedStudentList = ' + $scope.allUnassignedStudentList.length);
//                });
//            });
//
//
//
//        }
//        else
//        {
//            editStuInfoUtil($index);
//        }
        $log.debug('Editing Student info');

    };

    $scope.reSendOtp = function ($index) {

        

        var confirmit = confirm('Do you want to resend the OTP for ' + $scope.existingStudentList[$index].name +
                ' on ' + $scope.existingStudentList[$index].emer_1);

        if (confirmit)
        {

            

            // var studentList = [$scope.existingStudentList[$index]._id];
            // var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/student/resend/otp', studentList);
            // requestHandle.then(function (result) {
            //     if (result.success == true)
            //     {
            //         alert('OTP Sent success');
            //         $log.debug('OTP Sent successfully');
            //     }
            // })

        }
    }



    function editStuInfoUtil($index) {
        $scope.editing = true;
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];
        var studentInfo = {
            name: '',
            rollno: '',
            gender: '',
            rfid: '',
            stop_id: '',
            stop_name: '',
            route_id: $scope.routeID,
            grade_id: ''

        };
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
        $scope.newStudentList.push(studentInfo);
        angular.copy($scope.existingStudentList[$index], $scope.newStudentList[0]);
        $log.debug('$scope.newStudentList[0].stop_id = ' + $scope.newStudentList[0].stop_id);
        existingStopId = $scope.newStudentList[0].stop_id;
        $scope.showEditStudentModal = true;
        indexInEditing = $index;
        FlashService.Error('');
    }
    ;

    $scope.deleteNewStudent = function ($index) {
        $log.debug('deleteNewStudent new called');
        $scope.newStudentList[$index].stop_id = '';
        $scope.newStudentList[$index].stop_name = '';
        $scope.allUnassignedStudentList.push($scope.newStudentList[$index]);
        $scope.newStudentList.splice($index, 1);
    };




    $scope.updateStudentInfo = function () {
        $log.debug('inside updateStudentInfo');


        var duplicateCheck = checkDuplicateEntriesWhileUpdate();
        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);

        if (duplicateCheck == 1)
        {
            $scope.newStudentList[0].stop_name = stopListHash[$scope.newStudentList[0].stop_id].name;
            $scope.newStudentList[0].lon = stopListHash[$scope.newStudentList[0].stop_id].lon;
            $scope.newStudentList[0].lat = stopListHash[$scope.newStudentList[0].stop_id].lat;
            $log.debug('$scope.newStudentList[0].stop_name._id = ' + $scope.newStudentList[0]._id + ' $scope.newStudentList[0].stop_name = ' + $scope.newStudentList[0].stop_name);
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/updstud/' + $scope.routeID
                    , $scope.newStudentList[0]);
            requestHandle.then(function (result) {
                if (result.success == true)
                {

                    $log.debug();
                    $scope.newStudentList[0].stop_id;
                    $scope.existingStudentList[indexInEditing] = $scope.newStudentList[0];
                    $scope.showEditStudentModal = false;
                    $scope.editing = false;
                    $indexedDB.openStore('student', function (studentStore) {
                        $log.debug('opened studentStore');
                        studentStore.upsert($scope.existingStudentList).then(function (e) {
                            $log.debug('upserted successfully in studentStore');
                        },
                                function (error) {
                                    $log.debug('Error in upserting in studentStore = ' + error);
                                });
                    });
                } else
                {
                    if (result.data == null || result.data == '' || result.data == undefined)
                    {
                        FlashService.Error('Oops, something went wrong! Please login again.');
                    } else
                    {
                        FlashService.Error(result.data);
                    }
                }
            });
        } else if (duplicateCheck == 0)
        {
            $scope.showEditStudentModal = false;
            $scope.editing = false;
        } else
        {
            FlashService.Error('Student Roll No and RFID should be unique.');
        }

    };

    $scope.deleteStudent = function ($index) {
        $log.debug('Deleting student info, index $scope.existingStudentList[$index]._id' + ' ' + $index + ' ' + $scope.existingStudentList[$index]._id);
        var stuToDel = {
            _id: $scope.existingStudentList[$index]._id
        };
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/delstud/' + $scope.routeID,
                stuToDel);
        requestHandle.then(function (result) {
            if (result.success == true)
            {

                $indexedDB.openStore('student', function (studentStore) {
                    $scope.existingStudentList[$index].stop_id = '';
                    $scope.existingStudentList[$index].stop_name = '';
                    $scope.existingStudentList[$index].route_id = '';
                    studentStore.upsert($scope.existingStudentList[$index]).then(function (e) {
                        $log.debug('upsert successfully in routeStore');



                        $scope.allUnassignedStudentList.push($scope.existingStudentList[$index]);
                        $scope.existingStudentList.splice($index, 1);
                        updateStuCountInRoute($scope.existingStudentList.length);
                    },
                            function (error) {
                                $log.debug('Error in deletion in routeStore = ' + error);
                            });
                });
            } else
            {
                if (result.data == null || result.data == '' || result.data == undefined)
                {
                    FlashService.Error('Oops, something went wrong! Please login again.');
                } else
                {
                    FlashService.Error(result.data);
                }
            }
        });

    }

//    function checkDuplicateEntries() {
//        $log.debug('Inside check duplicate entries');
//
//        for (var iterNew = 0; iterNew < $scope.newStudentList.length; iterNew++)
//        {
//            $log.debug($scope.newStudentList[iterNew].rollno);
//            $log.debug($scope.newStudentList[iterNew].rfid);
//            for (var iterInNew = iterNew + 1; iterInNew < $scope.newStudentList.length; iterInNew++)
//            {
//                if ($scope.newStudentList[iterInNew].rollno == $scope.newStudentList[iterNew].rollno &&
//                        $scope.newStudentList[iterInNew].rfid == $scope.newStudentList[iterNew].rfid)
//                {
//                    return false;
//                }
//            }
//
//            $indexedDB.openStore('student', function (store) {
//
//                store.find($scope.newStudentList[iter].rollno).then(function (e) {
//                    $log.debug('$scope.newStudentList[iter].rollno ' + $scope.newStudentList[iter].rollno + 'alredy exist');
//                    return false;
//                },
//                        function (error) {
//                            $log.debug('$scope.newStudentList[iter].rollno ' + $scope.newStudentList[iter].rollno + 'does not exist');
//                        });
//
//                var find = store.query();
//                find = find.$eq($scope.newStudentList[iter].rfid);
//                find = find.$index("rfid");
//
//                // update scope
//                store.eachWhere(find).then(function (e) {
//                    $log.debug('$scope.newStudentList[iter].rfid ' + $scope.newStudentList[iter].rfid + 'does not exist');
//                    if (e.length == 0) {
//                        return true;
//                    }
//                    else {
//                        return false;
//                    }
//                },
//                        function (error) {
//                            $log.debug('$scope.newStudentList[iter].rfid ' + $scope.newStudentList[iter].rfid + 'does not exist');
//
//                        });
//            });
//
//
////            $log.debug('$scope.existingStudentList.length ' + $scope.existingStudentList.length);
////            for (var iterExist = 0; iterExist < $scope.existingStudentList.length; iterExist++)
////            {
////                $log.debug($scope.existingStudentList[iterExist].rollno);
////                $log.debug($scope.existingStudentList[iterExist].rfid);
////                if ($scope.existingStudentList[iterExist].rollno == $scope.newStudentList[iterNew].rollno &&
////                        $scope.existingStudentList[iterExist].rfid == $scope.newStudentList[iterNew].rfid)
////                {
////                    return false;
////                }
////            }
//        }
//        return true;
//    }


    function checkDuplicateEntriesWhileUpdate($index) {
        $log.debug('Inside checkDuplicateEntriesWhileUpdate');
        $log.debug($scope.newStudentList[0].rollno);
        $log.debug($scope.newStudentList[0].rfid);
        $log.debug('$scope.newStudentList[0].stop_Id = ' + $scope.newStudentList[0].stop_id + 'existingStopId = ' + existingStopId);
        if ($scope.newStudentList[0].stop_id == existingStopId)
        {
            $log.debug('Stop Name not changed');
            return 0;
        }

        for (var iterExist = 0; iterExist < $scope.allStudentList.length; iterExist++)
        {
            if ($scope.allStudentList[iterExist]._id == $scope.newStudentList[0]._id)
            {
                if ($scope.allStudentList[iterExist].stop_id == $scope.newStudentList[0].stop_id)
                {
                    return 0;
                }

            } else
            {
                if ($scope.allStudentList[iterExist].stop_id == $scope.newStudentList[0].stop_id)
                {
                    return -1;
                }
            }
            return 1;

//            $log.debug($scope.allStudentList[iterExist].rollno);
//            $log.debug($scope.allStudentList[iterExist].rfid);
//            $log.debug($scope.allStudentList[iterExist]._id + ' ' + $scope.$scope.newStudentList[0]._id);
//            if ($scope.allStudentList[iterExist].rollno == $scope.newStudentList[0].rollno ||
//                    $scope.allStudentList[iterExist].rfid == $scope.newStudentList[0].rfid)
//            {
//                if ($scope.allStudentList[iterExist]._id != $scope.newStudentList[0]._id)
//                {
//                    return false;
//                }
//            }
        }

        return true;
    }

//    $http.get('/admin/admin/route/testStuList.json').then(
//            function (stuList) {
//                $log.debug('stuList ' + stuList.data);
//                $scope.allUnassignedStudentList = stuList.data;
//            }
//    );

    function newListToServerFormat() {
        $log.debug('start of  newListToServerFormat');

        newStuListInServerFormat = [];
        angular.forEach($scope.newStudentList, function (stuInfo) {
            var stuInfoServer = {
                _id: '',
                stop_id: ''
            };



//            var found = $filter('filter')($scope.stopList, {_id: stuInfo.stop_id}, true);
//            if (found != undefined && found.length != 0)
//            {
//                $log.debug('stop Name ' + found[0].name);
//                stuInfo.stop_name = found[0].name;
//            }
//            else
//            {
//                $log.debug('found.length = 0');
//            }
//
//            angular.forEach($scope.newStudentList, function (stopObject) {
//                stopListHash[stopObject._id] = stopObject.name;
//            });
            stuInfo.stop_name = stopListHash[stuInfo.stop_id].name;
            //stuInfo.stop = angular.fromJson(stuInfo.stop);
            stuInfo.route_id = $scope.routeID;
            $log.debug('stuInfo._id tuInfo.stop ', stuInfo._id + ' ' + stuInfo.stop_name);
            stuInfoServer._id = stuInfo._id;
            stuInfoServer.stop_id = stuInfo.stop_id;
            stuInfoServer.stop_name = stuInfo.stop_name;
            stuInfoServer.lat = stopListHash[stuInfo.stop_id].lat;
            stuInfoServer.lon = stopListHash[stuInfo.stop_id].lon;
            newStuListInServerFormat.push(stuInfoServer);
        });


        $log.debug('length of newStuListInServerFormat ' + newStuListInServerFormat.length);
        $log.debug('End of  newListToServerFormat');
    }
    ;

    function updateStuCountInRoute(stuCount) {
        $log.debug('updateStuCountInRoute stuCount = ' + stuCount);
        $indexedDB.openStore('route', function (routeStore) {
            routeStore.find($scope.routeID).then(function (routeInfo) {
                routeInfo.stucount = stuCount;
                routeStore.upsert(routeInfo).then(function (e) {
                    $log.debug('upserted successfully in studentStore ');
                    // HandShakeService.routewarningcheck();

                },
                        function (error) {
                            $log.debug('Error in upserting in studentStore = ' + error);
                        });

            });
        });
    }
    ;

});