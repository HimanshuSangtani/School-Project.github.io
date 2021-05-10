
app.factory('HandShakeService',
        function HandShakeService(HttpService, $indexedDB, $rootScope, busService, $q, FlashService, $log, $sessionStorage, $location) {
            var service = {};
            
            service.getGradeInfo = getGradeInfo;
            service.getRouteInfo = getRouteInfo;
            service.getStudentInfo = getAllStudentInfo;
            service.getAllStudentInfo = getAllStudentInfo;
            service.deleteAllStudentOfClass = deleteAllStudentOfClass;
            service.getRouteStopInfo = getRouteStopInfo;
            service.stuwarningcheck = stuwarningcheck;
            service.routewarningcheck = routewarningcheck;
            service.fullHandShake = fullHandShake;
            service.clearIndexedDB = clearIndexedDB;
            service.handshakeAndUpdateBus = handshakeAndUpdateBus;
            service.hanshakeInProgress = false;
            return service;

            function getAllStudentInfo(class_id) {
                $log.debug('Inside getAllStudentInfo');
                var defer = $q.defer();
                var filters = "";
                if(class_id) {
                    filters = "?grade_id="+class_id;
                }

                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/student/getStudentDataByallfilters'+filters);
                requestHandle.then(function (result) {
                    if (result.success == true) {
                        defer.resolve(result.data.data);
                    } else {
                        if (result.data == null || result.data == '' || result.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }
                        defer.reject(result.data);
                    }
                });
                $log.debug('End of getAllStudentInfo');
                return defer.promise;
            };

            function getAllStudentInfo2() {
                $log.debug('Inside getAllStudentInfo');
                var defer = $q.defer();

                $indexedDB.openStore('student', function (studentStore) {
                    studentStore.getAll().then(function (all_student_list) {

                        $log.debug('all_student_list.length = ' + all_student_list.length);
                        $rootScope.mypageloading = false;
                        defer.resolve(all_student_list);
                    },
                            function (error) {
                                $log.debug('Error in getAllStudentInfo = ' + error);
                                defer.reject(error);
                            });
                });

                $log.debug('End of getAllStudentInfo');
                return defer.promise;
            }
            ;

            // http://localhost:5000/customer/routes/5c6e0e6445fc93308f034df8

            //Gives individual route info, 
            function getRouteStopInfo(route_id) {
                $log.debug('Inside getRouteStopInfo');
                var defer = $q.defer();
                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/routes/'+route_id);
                requestHandle.then(function (result) {
                    if (result.success == true) {
                        defer.resolve(result.data[0]);
                    } else {
                        if (result.data == null || result.data == '' || result.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }
                        defer.reject(result.data);
                    }
                });
                $log.debug('End of getRouteStopInfo');
                return defer.promise;
            };

            function getRouteStopInfo2(routeID) {
                var defer = $q.defer();
                $log.debug('getRouteStopInfo routeID ' + routeID);
                if (routeID != null && routeID != '' && routeID != undefined)
                {
                    $indexedDB.openStore('route', function (routeStore) {
                        routeStore.find(routeID).then(function (result) {
                            $log.debug('stop_lis len = ' + result.stop_list.length);
                            defer.resolve(result);
                        },
                                function (error) {
                                    $log.debug('routestore find error ' + error);
                                    defer.reject(error);
                                });
                    });

                }

                $log.debug('getRouteStopInfo');
                return defer.promise;
            }
            ;

            function getStudentInfo(classID) {
                var defer = $q.defer();
                getAllStudentInfo('?grade_id='+classID);
            }
            function getStudentInfo2(classID) {
                getAllStudentInfo('?grade_id='+classID);
                return;
                var defer = $q.defer();
                $log.debug('getStudentInfo classID ' + classID);

                $indexedDB.openStore('student', function (studentStore)
                {
                    $log.debug('inside student open student');

                    var find = studentStore.query();
                    find = find.$eq(classID);
                    find = find.$index("gradeIndex");
                    $log.debug('student store open ');
                    // update scope
                    studentStore.eachWhere(find).then(function (result) {
                        $log.debug('student store result ' + result);
                        $log.debug('result.length = ' + result.length);
                        /// $scope.existingStudentList = result;
                        //$log.debug('$scope.existingStudentList ' + $scope.existingStudentList);
                        defer.resolve(result);
                    },
                            function (error) {
                                $log.debug('student store eachwhere error = ' + error);
                                defer.reject(error);
                            });

                });
                $log.debug('getStudentInfo');
                return defer.promise;

            }
            ;

            function deleteAllStudentOfClass(classID) {
                $log.debug('');
                var defer = $q.defer();
                getStudentInfo(classID).then(function (stuList) {
                    $log.debug('stuList.length = ' + stuList.length);
                    var deleteStudent = function (iter) {
                        $indexedDB.openStore('student', function (studentStore) {
                            $log.debug('going to delete stuList[iter].rollno ' + stuList[iter].rollno);
                            studentStore.delete(stuList[iter].rollno).then(function () {
                                $log.debug('delete stuList[iter].name iter' + stuList[iter]._id + stuList[iter].name + ' ' + iter);
                                if (iter < stuList.length - 1)
                                {
                                    $log.debug('dleteing another iter + 1 ' + iter + 1);
                                    deleteStudent(iter + 1);
                                } else
                                {
                                    $log.debug('resolving');
                                    defer.resolve();
                                }
                            });
                        });
                    }
                    ;
                    if (stuList.length != 0)
                    {
                        deleteStudent(0);
                    } else
                    {
                        defer.resolve();
                    }



                });
                return defer.promise;
            }
            ;


            // getGradeInfo 
            // Input - student API
            // output = student_list,grade_list
            // function - upgrades number of students in each class and store it in db

            function getGradeInfo() {
                $log.debug('Inside getGradeInfo');
                var defer = $q.defer();

                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/grades');
                requestHandle.then(function (result) {
                    if (result.success == true) {
                        defer.resolve(result.data);
                    } else {
                        if (result.data == null || result.data == '' || result.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }
                        defer.reject(result.data);
                    }
                });
                $log.debug('End of getGradeInfo');
                return defer.promise;
            };

            function getGradeInfo2() {
                $log.debug('getGradeInfo called');
                var defer = $q.defer();
                var grade_list = [];
                var student_list = [];
                $indexedDB.openStore('class', function (classStore) {

                    classStore.count().then(function (classCount) {
                        if (classCount == 0)
                        {
                            $log.debug('Class info not available in indexdb, calling server for info...');
                            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/student');
                            requestHandle.then(function (result) {
                                if (result.success == true)
                                {
                                    student_list = result.data.student_list;
                                    grade_list = result.data.grade_list;

                                    if (grade_list.length > 0)
                                    {
                                        $indexedDB.openStore('student', function (studentStore) {
                                            studentStore.clear().then(function () {

                                                studentStore.insert(student_list).then(function (e) {
                                                    $log.debug('student list inserted successfully');
                                                    var upgradeCount = function (iter) {
                                                        var find = studentStore.query();
                                                        find = find.$eq(grade_list[iter]._id);
                                                        find = find.$index("gradeIndex");

                                                        studentStore.eachWhere(find).then(function (e) {
                                                            grade_list[iter].count = e.length;
                                                            if (iter < grade_list.length - 1)
                                                            {
                                                                upgradeCount(iter + 1);
                                                            } else
                                                            {
                                                                insertinDB();
                                                            }

                                                        });

                                                    };
                                                    upgradeCount(0);

                                                    //in grade_list count of students updated for each class, nnow inserting it in DB
                                                    var insertinDB = function () {
                                                        if (grade_list.length > 0)
                                                        {
                                                            $log.debug('opening classstore');
                                                            $indexedDB.openStore('class', function (classStore) {
                                                                classStore.clear().then(function () {
                                                                    $log.debug('inserting classstore');
                                                                    classStore.insert(grade_list).then(function (e) {
                                                                        defer.resolve(grade_list);
                                                                    }, function (error) {
                                                                        defer.reject(error);
                                                                        $log.debug('insert in class objectstore failed1 , error = ' + error);
                                                                    });
                                                                }, function (error) {
                                                                    defer.reject(error);
                                                                    $log.debug('insert in class objectstore failed2 , error = ' + error);
                                                                });

                                                            });
                                                        }
                                                    };

                                                }, function (error) {
                                                    defer.reject(error);
                                                    $log.debug('insert in class objectstore failed3 , error = ' + error);
                                                });
                                            }, function (error) {
                                                defer.reject(error);
                                                $log.debug('insert in class objectstore failed4 , error = ' + error);
                                            });
                                        });
                                    } else
                                    {
                                        defer.resolve(grade_list);
                                    }


                                } else
                                {
                                    if (result.data == null || result.data == '' || result.data == undefined)
                                    {
                                        FlashService.Error('Oops, something went wrong! Please login again.');
                                    } else
                                    {
                                        FlashService.Error(result.data);
                                    }
                                    defer.reject(result.data);
                                }
                            });

                        } else
                        {
                            $log.debug('Class info  available in indexdb.');
                            classStore.getAll().then(function (grade_list) {

                                $rootScope.mypageloading = false;
                                //successCallback(grade_list);
                                defer.resolve(grade_list);
                            });
                        }

                    });
                    //classStore.count finish


                });
                //indexdb transaction done.
                return defer.promise;
            }
            ;


            // getRouteInfo 
            // Input - routes API
            // output = existingRouteList
            // function - upgrades number of students in each route and store it in db

            function getRouteInfo() {
                $log.debug('Inside getRouteInfo');
                var defer = $q.defer();

                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/routes');
                requestHandle.then(function (result) {
                    if (result.success == true) {
                        defer.resolve(result.data);
                    } else {
                        if (result.data == null || result.data == '' || result.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }
                        defer.reject(result.data);
                    }
                });
                $log.debug('End of getRouteInfo');
                return defer.promise;
            };

            function getRouteInfo2() {
                var defer = $q.defer();
                $rootScope.mypageloading = true;
                $log.debug('getRouteInfo called');
                var existingRouteList = [];
                //Checking in IndexDB whether Route Information is available or not, if not available then call server for the information
                $indexedDB.openStore('route', function (routeStore) {
                    routeStore.count().then(function (routeCount) {
                        if (routeCount == 0)
                        {
                            //Since no route info available in indexdb, calling server ...
                            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/routes');
                            //var requestHandle = HttpService.HttpGetData('/admin/admin/route/routes.json');
                            requestHandle.then(function (result) {
                                $rootScope.mypageloading = false;
                                if (result.success == true)
                                {
                                    existingRouteList = result.data;
                                    var upgradeRouteList = function (iter)
                                    {
                                        $indexedDB.openStore('student', function (studentStore) {
                                            var find = studentStore.query();
                                            find = find.$eq(existingRouteList[iter]._id);
                                            find = find.$index("route_id");

                                            studentStore.eachWhere(find).then(function (stuList) {
                                                existingRouteList[iter].stucount = stuList.length;
                                                if (iter < existingRouteList.length - 1)
                                                {
                                                    upgradeRouteList(iter + 1);
                                                } else
                                                {
                                                    upgradeInDB();
                                                }
                                            });
                                        });
                                    };
                                    if (existingRouteList.length > 0)
                                    {
                                        upgradeRouteList(0);
                                    } else
                                    {
                                        defer.resolve(existingRouteList);
                                    }

                                    var upgradeInDB = function () {
                                        if (existingRouteList.length != 0)
                                        {
                                            $indexedDB.openStore('route', function (routeStore) {

                                                routeStore.insert(existingRouteList).then(function (e) {
                                                    defer.resolve(existingRouteList);
                                                    //successCallback(existingRouteList);
                                                },
                                                        function (error) {
                                                            //errorCallback(error);
                                                            defer.reject(error);
                                                            $log.debug('Error in inserting in routeStore = ' + error);
                                                        });
                                            });
                                        }
                                    };


                                } else
                                {
                                    if (result.data == null || result.data == '' || result.data == undefined)
                                    {
                                        FlashService.Error('Oops, something went wrong! Please login again.');
                                    } else
                                    {
                                        FlashService.Error(result.data);
                                    }
                                    //errorCallback(error);
                                    defer.reject(result.data);

                                }
                            })
                        } else
                        {
                            //Get route information from indexdb

                            $log.debug('routelist available in Indexed db, so getting from there only');
                            routeStore.getAll().then(function (routeList) {
                                $rootScope.mypageloading = false;
                                //existingRouteList = routeList;
                                // successCallback(routeList);
                                defer.resolve(routeList);
                                //$sessionStorage.existingRouteList = routeList;
                            },
                                    function (error) {
                                        $log.debug('error in getall from routestore ' + error);
                                    });
                        }
                    }
                    );
                }
                );
                $log.debug('exiting getrouteinfo');
                return defer.promise;
            }
            ;


            //clearIndexedDB - Clear IndexDB before inserting new refreshed data
            function clearIndexedDB() {
                $log.debug('clearing indexxeddb');
                var defer = $q.defer();
                /////////////////////////////////
                $indexedDB.openStore('student', function (studentStore) {
                    studentStore.clear().then(function () {
                        $indexedDB.openStore('class', function (studentStore) {
                            studentStore.clear().then(function () {
                                $indexedDB.openStore('route', function (studentStore) {
                                    studentStore.clear().then(function () {
                                        defer.resolve();
                                    });
                                });
                            });
                        });
                    });
                });
                return defer.promise;

            }
            ;
            //clearIndexedDB - Indexed DB cleared

            function getBusDeviceList() {

                var defer = $q.defer();
                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/handshake');
                requestHandle.then(function (result) {
                    if (result.success == true)
                    {

                        $log.debug('getBusDeviceList = ' + result.data.fleet + 'length' + result.data.fleet.length);
                        //$sessionStorage.tripDetails = JSON.stringify(result.data.trip);
                        var busList = [];
                        var unassignedDeviceList = [];
                        angular.forEach(result.data.fleet, function (busDeviceObject) {
                            if (!busDeviceObject.bus_number)
                            {
                                unassignedDeviceList.push(busDeviceObject);
                            } else
                            {
                                busList.push(busDeviceObject);
                            }
                        });
//                        busService.busList = busList;
                        //$sessionStorage.busList = JSON.stringify(busList);
//                        busService.unassignedDeviceList = unassignedDeviceList;
                        //$sessionStorage.unassignedDeviceList =JSON.stringify(unassignedDeviceList);
                        if (!result.data.info.alert_idle)
                        {
                            result.data.info.alert_idle = 5;
                        }
                        if (!result.data.info.alert_speed)
                        {
                            result.data.info.alert_speed = 60;
                        }
                        $sessionStorage.profileInfo = JSON.stringify(result.data.info);
                        defer.resolve();
                    } else
                    {
                        if (!result.data)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }

                        defer.reject();
                    }
                }
                );
                return defer.promise;
            }
            //stuwarningcheckstarts
            function stuwarningcheck() {
                $log.debug('stuwarningcheck called');
                $rootScope.global.stuwarning = false
                $indexedDB.openStore('class', function (classStore) {
                    classStore.count().then(function (classCount) {
                        if (classCount == 0)
                        {
                            $rootScope.global.stuwarning = true;
                        }
                        classStore.each().then(function (classList) {
                            angular.forEach(classList, function (classObject) {
                                $log.debug('classObject._id = ' + classObject._id);
                                getStudentInfo(classObject._id).then(function (stuList) {
                                    $log.debug('stuList length = ' + stuList.length);
                                    if (stuList.length == 0 && $rootScope.global.stuwarning == false)
                                    {
                                        $rootScope.global.stuwarning = true;
                                    }
                                });
                            });

                        });
                    });
                });
            }
            ;
            //stuwarningcheck Ends

            //routewarningcheck starts
            function routewarningcheck() {
                $log.debug('routewarningcheck called');
                $rootScope.global.routewarning = false;
                $indexedDB.openStore('route', function (routeStore) {
                    routeStore.count().then(function (routeCount) {
                        if (routeCount == 0)
                        {
                            $rootScope.global.routewarning = true;
                        } else
                        {
                            routeStore.each().then(function (routeList) {
                                angular.forEach(routeList, function (routeObject) {
                                    if (routeObject.stop_list.length == 0 || routeObject.stucount == 0)
                                    {
                                        $rootScope.global.routewarning = true;
                                    }
                                });
                            });
                        }
                    });
                });
            }
            ;
            //routewarningcheck ends



            function handshakeAndUpdateBus() {
                var defer = $q.defer();

                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/handshake');
                requestHandle.then(function (result) {
                    if (result.success == true)
                    {
                        $log.debug('getBusDeviceList = ' + result.data.fleet + 'length' + result.data.fleet.length);
                        busService.busDeviceList = result.data.fleet;
                        busService.tripList = result.data.trip;
                        //$sessionStorage.tripDetails = JSON.stringify(result.data.trip);
                        var busList = [];
                        var unassignedDeviceList = [];
                        angular.forEach(result.data.fleet, function (busDeviceObject) {
                            if (!busDeviceObject.bus_number)
                            {
                                unassignedDeviceList.push(busDeviceObject);
                            } else
                            {
                                busList.push(busDeviceObject);
                            }
                        });
                        busService.busList = busList;
                        //$sessionStorage.busList = JSON.stringify(busList);
                        busService.unassignedDeviceList = unassignedDeviceList;
                        //$sessionStorage.unassignedDeviceList = JSON.stringify(unassignedDeviceList);
                        if (result.data.info.alert_idle == undefined)
                        {
                            result.data.info.alert_idle = 5;
                        }
                        if (result.data.info.alert_speed == undefined)
                        {
                            result.data.info.alert_speed = 60;
                        }
                        if ($rootScope.firebaseUser)
                            result.data.info.name = $rootScope.firebaseUser.displayName;
                        $sessionStorage.profileInfo = JSON.stringify(result.data.info);
                        if (result.data.info)
                        {
                            $rootScope.category = result.data.info.category;
                            if (result.data.info.category == 0)
                            {
                                $rootScope.rfidModule = true;
                                defer.resolve();
                            } else if (result.data.info.category == 2 && ($location.host().indexOf('school.zuwagon.com') !== -1))
                            {
                                FlashService.Error('You are not authorised to login');
                                defer.reject('You are not authorised to login');
                            } else
                            {
                                $rootScope.rfidModule = false;
                                defer.resolve();
                            }

                            /*
                             * Module : 
                             * 0- School with RFID, 
                             * 1- Without RFID, 
                             * 2- Module 1 for family and cab
                             */
                        }
                    } else
                    {
                        if (result.data == null || result.data == '' || result.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        } else
                        {
                            FlashService.Error(result.data);
                        }

                        defer.reject();
                    }
                }
                );
                return defer.promise;
            }
            ;


            function fullHandShake() {
                $log.debug('fullHandShake called');
                service.hanshakeInProgress = true;
                var defer = $q.defer();
                handshakeAndUpdateBus().then(function () {
                        getGradeInfo().then(function () {
                            getRouteInfo().then(function (result) {
                                $rootScope.$broadcast('callHeaderController');
                                defer.resolve();
                            });

                        }, function (error) {
                            $rootScope.mypageloading = false;
                            $log.debug('fullHandShake: insert in getGradeInfo , error = ' + error);
                            defer.reject(error);
                        });

                    }, function (error) {
                        $log.debug('Error in handshake = ' + error);
                        defer.reject(error);
                    });

                return defer.promise;
            }
            ;
            
            function fullHandShake2() {
                $log.debug('fullHandShake called');
                service.hanshakeInProgress = true;
                var defer = $q.defer();
                clearIndexedDB().then(function () {
                    //busService.getBusDeviceList().then(function (result) {
                    handshakeAndUpdateBus().then(function () {
                        getGradeInfo().then(function () {
                            getRouteInfo().then(function (result) {
                                $rootScope.$broadcast('callHeaderController');
                                defer.resolve();
                            });

                        }, function (error) {
                            $rootScope.mypageloading = false;
                            $log.debug('fullHandShake: insert in getGradeInfo , error = ' + error);
                            defer.reject(error);
                        });

                    }, function (error) {
                        $log.debug('Error in handshake = ' + error);
                        defer.reject(error);
                    });
                });

                return defer.promise;
            }
            ;
        }
       


);