app.controller('routeController', function ($rootScope, $location, HandShakeService, busService, UtilService, FlashService, $scope, HttpService, $sessionStorage, $indexedDB, $log) {

                    
    UtilService.setSidebar();
    $scope.noStopWarning = false;


    $log.debug("routeController reporting for duty.");
    $rootScope.showBackStrech = false;
    
    // var routeInfo = this;

    $scope.newRouteList = [];
    var indexinediting = 0;
    $rootScope.mypageloading = false;
    $scope.busList = busService.busList;

    $scope.existingRouteList = [];

    $log.debug('HandShakeService.existingRouteList call');
    HandShakeService.getGradeInfo().then(function () {
        $log.debug('HandShakeService getGradeInfo received  ');
        HandShakeService.getRouteInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received result.length = ' + result.length);
            $scope.existingRouteList = result;

            angular.forEach($scope.existingRouteList, function (routeObject) {
                var assignedstop = 0;
                if (routeObject.stop_list.length > 0)
                {
                    for (var stopIndex = 0; stopIndex < routeObject.stop_list.length; stopIndex++)
                    {
                        if (routeObject.stop_list[stopIndex].name != undefined && routeObject.stop_list[stopIndex].name != '' && routeObject.stop_list[stopIndex].name != null)
                        {
                            //$location.path('/routes/:' + routeID);
                            assignedstop++;
                            //break;
                        }
                    }
                }
                routeObject.assignedstop = assignedstop;
            });


        });

    });
    $log.debug('HandShakeService.existingRouteList passed');




    $scope.editing = false;
    $scope.addNewRoute = function () {
        $scope.showAddNewRouteModal = !$scope.showAddNewRouteModal;
        $scope.newRouteList.length = 0;
        $scope.newRouteList = [];
        $scope.editing = false;
        $log.debug('djain getting value from session $scope.busList = ' + $scope.busList);
        //$scope.busList = busService.busList;
        $scope.addRoute();
        FlashService.Error('');
    };
    $scope.addRoute = function () {
        $log.debug('addRoute called');
        var routeInfo = {
            route_name: '',
            bus_number: '',
            route_key: ''
        };
        $log.debug('$scope.newRouteList.length ' + $scope.newRouteList.length);
        $scope.newRouteList.push(routeInfo);
        $log.debug('$scope.newRouteList.length ' + $scope.newRouteList.length);
    };
    $scope.saveRoutes = function () {
        $log.debug(' $scope.newRouteList.length' + $scope.newRouteList.length);
        $rootScope.mypageloading = true;
        var duplicateCheck = checkDuplicateEntries();
        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);
        {
            if (duplicateCheck == true)
            {
//                $sessionStorage.newRouteList = $scope.newRouteList;
                var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/routes', $scope.newRouteList);
                requestHandle.then(function (result) {

                    if (result.success)
                    {
                        $rootScope.global.routewarning = true;
                        $scope.existingRouteList = $scope.existingRouteList.concat(result.data);
                        $scope.newRouteList.length = 0;
                        $scope.newRouteList = [];

                        angular.forEach(result.data, function (routeItem) {
                            routeItem.stucount = 0;
                            routeItem.assignedstop = 0;
                        });

                        $indexedDB.openStore('route', function (routeStore) {

                            routeStore.upsert(result.data).then(function (e) {
                                $log.debug('upserted successfully in routeStore e= ' + e);
                                $rootScope.mypageloading = false;
                                $scope.showAddNewRouteModal = false;
                            },
                                    function (error) {
                                        $log.debug('Error in upserting in routeStore = ' + error);
                                    });
                        });
                    }
                    else
                    {
                        FlashService.Error(result.data);
                    }
                });
            }
            else
            {
                $rootScope.mypageloading = false;
                FlashService.Error('Route Name and Route Short key should be unique.');
            }
        }
    };
    $scope.editRoute = function (routeInfo, $index) {
        $log.debug('edit route called');

        $scope.newRouteList.length = 0;
        $scope.newRouteList = [];
        $scope.addRoute();
        angular.copy(routeInfo, $scope.newRouteList[0]);
        $sessionStorage.newRouteList = $scope.newRouteList[0];
        $scope.showAddNewRouteModal = !$scope.showAddNewRouteModal;
        $scope.editing = true;
        for(var i=0; i < $scope.existingRouteList.length; i++ ) {
            if($scope.existingRouteList[i]._id == routeInfo._id) {
                indexinediting = i;
                break;
            }
        }
//        $indexedDB.openStore('route', function (routeStore) {
//
//            routeStore.upsert($scope.existingRouteList).then(function (e) {
//                $log.debug('Upserted successfully in routeStore');
//            },
//                    function (error) {
//                        $log.debug('Error in upserting in routeStore = ' + error);
//                    });
//        });
        FlashService.Error('');
    };
    $scope.deleteRoute = function (routeInfo, $index) {

    
        var confirmit = false;
        if (routeInfo.stop_list.length > 0)
        {
            confirmit = confirm(routeInfo.stop_list.length + ' stop associated with ' + routeInfo.route_name + ' route. On deletion of the route, all the stop details will also be deleted.');
        }
        else if (routeInfo.stucount > 0)
        {
            confirmit = confirm(routeInfo.stucount + ' student associated with ' + routeInfo.route_name + ' route. On deletion of the route, all the associated students will not belong to any group.');
        }
        else
        {
            confirmit = true;
        }
        if (confirmit == true)
        {
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/routes/' + routeInfo._id);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    $indexedDB.openStore('route', function (routeStore) {

                        routeStore.delete(routeInfo._id).then(function (e) {
                            $log.debug('deleted successfully in routeStore');

                            //***************
                            $indexedDB.openStore('student', function (studentStore) {
                                studentStore.count().then(function (stuCount) {
                                    if (stuCount > 0)
                                    {
                                        var find = studentStore.query();
                                        find = find.$eq(routeInfo._id);
                                        find = find.$index("route_id");

                                        studentStore.eachWhere(find).then(function (stuList) {
                                            angular.forEach(stuList, function (stuObject) {
                                                stuObject.stop_id = '';
                                                stuObject.stop_name = '';
                                                stuObject.route_id = '';
                                            });
                                            studentStore.upsert(stuList).then(function (e) {
                                                $log.debug('upsert successfully in studentStore');
                                                var indexToDelete = -1;
                                                for(var i=0; i < $scope.existingRouteList.length; i++ ) {
                                                    if($scope.existingRouteList[i]._id == routeInfo._id) {
                                                        indexToDelete = i;
                                                        break;
                                                    }
                                                }
                                                $scope.existingRouteList.splice(indexToDelete, 1);
                                                // HandShakeService.routewarningcheck();

                                            },
                                                    function (error) {
                                                        $log.debug('Error in deletion in routeStore = ' + error);
                                                    });
                                        });
                                    }
                                });

                            });
                            //***************
                        },
                                function (error) {
                                    $log.debug('Error in deletion in routeStore = ' + error);
                                });
                    });
                }
                else
                {
                    if (result.data == null || result.data == '' || result.data == undefined)
                    {
                        FlashService.Error('Oops, something went wrong! Please login again.');
                    }
                    else
                    {
                        FlashService.Error(reFlassult.data);
                    }
                }
            });
        }



    }
    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.newRouteList.length = 0;
        $scope.newRouteList = [];
        $scope.showAddNewRouteModal = false;
        FlashService.Error('');
    };
    $scope.busChange1 = function ($index) {
        $log.debug('buschange1 called');
        $scope.newRouteList[$index].route_key = $scope.newRouteList[$index].bus_number;
    };
    $scope.updateRoute = function () {
        $log.debug('update route called $index ');
        //duplicateCduplicateCheck 0:No change, -1:Not unique, 1:unique
        var duplicateCheck = checkDuplicateEntriesWhileUpdate();
        $log.debug('duplicatecheck = ' + duplicateCheck);
        if (duplicateCheck == 1)
        {
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/' + $scope.newRouteList[0]._id, $scope.newRouteList[0]);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    $scope.showAddNewRouteModal = false;
                    $scope.editing = false;
                    $indexedDB.openStore('route', function (routeStore) {
                        routeStore.delete($scope.existingRouteList[indexinediting]._id).then(function () {
                            routeStore.upsert($scope.newRouteList[0]).then(function (e) {
                                $log.debug('upserted successfully in routeStore');
                                $scope.existingRouteList[indexinediting] = $scope.newRouteList[0];
                            },
                                    function (error) {
                                        $log.debug('Error in upserting in routeStore = ' + error);
                                    });
                        },
                                function (error) {
                                    $log.debug('Error in upserting in routeStore = ' + error);
                                });

                    });

                }
                else
                {
                    if (result.data == null || result.data == '' || result.data == undefined)
                    {
                        FlashService.Error('Oops, something went wrong! Please login again.');
                    }
                    else
                    {
                        FlashService.Error(result.data);
                    }
                }
            });
        }
        else if (duplicateCheck == -1)
        {
            FlashService.Error('Route Name and Route Short key should be unique.');
        }
        else
        {
            $scope.cancel();
        }

    };
    function checkDuplicateEntries() {
        $log.debug('Inside check duplicate entries');
        for (var iterNew = 0; iterNew < $scope.newRouteList.length; iterNew++)
        {
            $log.debug($scope.newRouteList[iterNew].route_key);
            for (var iterInNew = iterNew + 1; iterInNew < $scope.newRouteList.length; iterInNew++)
            {
                if ($scope.newRouteList[iterInNew].route_key == $scope.newRouteList[iterNew].route_key ||
                        $scope.newRouteList[iterInNew].route_name == $scope.newRouteList[iterNew].route_name)
                {
                    return false;
                }
            }

            for (var iterExist = 0; iterExist < $scope.existingRouteList.length; iterExist++)
            {
                if ($scope.existingRouteList[iterExist].route_key == $scope.newRouteList[iterNew].route_key
                        || $scope.existingRouteList[iterExist].route_name == $scope.newRouteList[iterNew].route_name)
                {
                    return false;
                }
            }
        }
        return true;
    }

    function checkDuplicateEntriesWhileUpdate() {
        $log.debug('Inside check duplicate entries while update');
        for (var iterExist = 0; iterExist < $scope.existingRouteList.length; iterExist++)
        {
            if (iterExist == indexinediting)
            {
//                if ($scope.existingRouteList[iterExist].route_name == $scope.newRouteList[0].route_name &&
//                        $scope.existingRouteList[iterExist].route_key == $scope.newRouteList[0].route_key &&
//                        $scope.existingRouteList[iterExist].bus_number == $scope.newRouteList[0].bus_number)
                if ($scope.existingRouteList[iterExist] == $scope.newRouteList[0])
                {
                    return 0;
                }

            }
            else if ($scope.existingRouteList[iterExist].route_key == $scope.newRouteList[0].route_key
                    || $scope.existingRouteList[iterExist].route_name == $scope.newRouteList[0].route_name)
            {
                return -1;
            }
        }
        return 1;
    }

    $scope.openRouteDetails = function (routeID)
    {
        var assignedstop = 0;
        angular.forEach($scope.existingRouteList, function (routeObject) {
            if (routeObject._id == routeID)
            {
                if (routeObject.stop_list.length > 0)
                {
                    for (var stopIndex = 0; stopIndex < routeObject.stop_list.length; stopIndex++)
                    {
                        if (routeObject.stop_list[stopIndex].name != undefined && routeObject.stop_list[stopIndex].name != '' && routeObject.stop_list[stopIndex].name != null)
                        {
                            $location.path('/routes/:' + routeID);
                            assignedstop++;
                            break;
                        }
                    }
                    if (assignedstop == 0)
                    {
                        $scope.noStopWarning = true;
                    }

                }
                else
                {
                    $scope.noStopWarning = true;
                }
            }
        });
    }

    $scope.openRouteView = function (route) {
        if (route.stop_list.length == 0)
        {
            $scope.noStopWarning = true;
        }
        else
        {
            $location.path('/routes/view/:' + route._id);
        }
    }
    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "RouteList.pdf");
          });
        
    }


    // var fileInput = document.getElementById("csv"),

    // readFile = function () {
    //     Papa.parse(fileInput.files[0],  {
    //       header: true,
    //       dynamicTyping: true,
    //       complete: function(results) {
    //         data = results.data;


    //         // Add new ROute
    //         // var routeHash = {};
    //         // var routeKeyHash = {};
    //         // var sampleHash = {};
    //         // var dupRoutes = {};
    //         // $scope.newRouteList = [];
    //         // for(var i=0; i<data.length; i++) {

    //         //     // if(data[i]['Bus No']) {
    //         //     //     if(sampleHash[data[i]['Bus No'].split("-")[1]]) {
    //         //     //         if(sampleHash[data[i]['Bus No'].split("-")[1]].indexOf(data[i]['Bus No']) == -1) {
    //         //     //             // console.log(data[i]['Bus No']);
    //         //     //             sampleHash[data[i]['Bus No'].split("-")[1]].push(data[i]['Bus No'])
    //         //     //         }
    //         //     //     } else {
    //         //     //         sampleHash[data[i]['Bus No'].split("-")[1]] = [data[i]['Bus No']];
    //         //     //     }
    //         //     // }

    //         //     // console.log(JSON.stringify(sampleHash));
                
    //         //     if(data[i]['Bus No'] && !routeHash[data[i]['Bus No']]) {
    //         //         var routeKey = '';
    //         //         if(!routeKeyHash[data[i]['Bus No'].split("-")[1]]) {
    //         //             routeKey = data[i]['Bus No'].split("-")[1]+'A';
    //         //         } else if(!routeKeyHash[data[i]['Bus No'].split("-")[1]+'A']) {
    //         //             routeKey = data[i]['Bus No'].split("-")[1]+'B';
    //         //         } else if(!routeKeyHash[data[i]['Bus No'].split("-")[1]+'B']) {
    //         //             routeKey = data[i]['Bus No'].split("-")[1]+'C';
    //         //         } else if(!routeKeyHash[data[i]['Bus No'].split("-")[1]+'C']) {
    //         //             routeKey = data[i]['Bus No'].split("-")[1]+'D';
    //         //         }


    //         //         $scope.newRouteList.push({
    //         //             route_name: data[i]['Bus No'],
    //         //             bus_number: data[i]['Bus No'].split("-")[1],
    //         //             route_key: routeKey
    //         //         });
    //         //         routeHash[data[i]['Bus No']] = 1;
    //         //     }
    //         // }
    //         // $scope.saveRoutes();


    // //         //List routes
    // //         // var routeHash = {};
    // //         // var routeList = [];
    // //         // for(var i=0; i<data.length; i++) {
    // //         //     if(data[i]['Village'] &&  !routeHash[data[i]['Village']]) {
    // //         //         routeHash[data[i]['Village']] = 1;
    // //         //         routeList.push(data[i]['Village']);
    // //         //     }
    // //         // }


    //         // Add students in route
    //         var routeHash = {};
    //         var studentHash = {};
    //         var routeFeesHash = {};
    //         angular.forEach($scope.existingRouteList, function (routeObject) {
    //             routeHash[routeObject.route_name] = routeObject;
    //         });
    //         HandShakeService.getAllStudentInfo().then(function (studentList) {
    //             angular.forEach(studentList, function (stuObject) {
    //                 if(studentHash[stuObject.name+stuObject.fathername]) {
    //                     console.log('name already exist ' + stuObject.name + +stuObject.fathername)
    //                 } else
    //                     studentHash[stuObject.name+stuObject.fathername] = stuObject._id;
    //             });
    //             for(var i=0; i<data.length; i++) {
    //                 if(data[i]['Bus No'] && routeHash[data[i]['Bus No']] && studentHash[data[i]['Name Of Students']+data[i]['Father Name']]) {
    //                     var stuInfoServer = {};
                        
    //                     stuInfoServer._id = studentHash[data[i]['Name Of Students']+data[i]['Father Name']];
    //                     stuInfoServer.stop_id = routeHash[data[i]['Bus No']].stop_list[0]._id;
    //                     stuInfoServer.stop_name = routeHash[data[i]['Bus No']].stop_list[0].name;
    //                     stuInfoServer.lat = routeHash[data[i]['Bus No']].stop_list[0].lat;
    //                     stuInfoServer.lon = routeHash[data[i]['Bus No']].stop_list[0].lon;


    //                     if(routeFeesHash[routeHash[data[i]['Bus No']]._id]) {
    //                         routeFeesHash[routeHash[data[i]['Bus No']]._id].stud_list.push(stuInfoServer);
    //                     } else {
    //                         routeFeesHash[routeHash[data[i]['Bus No']]._id] = {
    //                             route_name: routeHash[data[i]['Bus No']].route_name,
    //                             stud_list: [stuInfoServer]
    //                         };
    //                     }
    //                 }
    //                 if(!studentHash[data[i]['Name Of Students']+data[i]['Father Name']]) {
    //                     console.log('student doesnt exist in the list' + data[i]['Name Of Students']);
    //                 }

    //             }

    //             for (var routeId in routeFeesHash) {
    //               if (routeFeesHash.hasOwnProperty(routeId)) {
    //                 var studObject = routeFeesHash[routeId];
    //                 var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/addstud/' + routeId, studObject);
    //                 requestHandle.then(function (result) {
    //                     if (result.success == true) {
    //                         console.log('students updated for route = '+ JSON.stringify(result));
    //                     } else {
    //                         console.log('students update failed for route');   
    //                     }
    //                 });
    //               }
    //             }
    //         });


            
    //       }
    //     });
    // };

    // fileInput.addEventListener('change', readFile);


    

});





