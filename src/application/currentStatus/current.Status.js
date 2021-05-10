app.controller('statusController', function ($scope, $rootScope, $indexedDB, mapService, $q, $log, UtilService, $location) {

    $rootScope.showBackStrech = false;

//    $scope.currentList = mapService.currentList;
//    $scope.historyList = mapService.historyList;
    $scope.studentList = [];
    $scope.alertdetailspopup = false;
    $scope.studentDetailsPopup = false;
    UtilService.setSidebar();
    var studentHash = [];
    var tripStuHash = [];
    var tripInView = '';
    var studentListHash = [];
    $scope.set2Digits = set2Digits;

    Chart.defaults.global.legend.display = false;
//    Chart.defaults.global.tooltips.enabled = false;
    var getStudentHash = getStudentHash;
    $scope.busList = mapService.busList;
    $scope.tripHash = mapService.tripHash;

    function updateCurrentAndHistoryList(updateChart) {
        $scope.tripHash = mapService.tripHash;
        $scope.busRunningList = [];
        $scope.busStoppedList = [];
        $scope.busNotRespondingList = [];
        $scope.busIdleList = [];
        $scope.currentList = [];
        $scope.historyList = [];
        angular.forEach(mapService.busList, function (busObject) {
            if (busObject.status == 0)
            {
                $scope.busStoppedList.push(busObject);
            } else if (busObject.status == 1)
            {
                $scope.busRunningList.push(busObject);
            } else if (busObject.status == 2)
            {
                $scope.busIdleList.push(busObject);
            } else
            {
                $scope.busNotRespondingList.push(busObject);
            }
        });
        if (updateChart)
        {
            createChart($scope.busRunningList, 'serverstatus01', '#34af23', 1);
            createChart($scope.busStoppedList, 'serverstatus02', '#696969', 0);
            createChart($scope.busNotRespondingList, 'serverstatus03', '#FF0000', 3);
            createChart($scope.busIdleList, 'serverstatus04', '#F0AD4E', 2);
        }


//        angular.forEach($scope.busStoppedList, function (stoppedBusObject) {
//            if (stoppedBusObject.c_loc)
//            {
//                var latlng = {lat: Number(stoppedBusObject.c_loc.lat), lng: Number(stoppedBusObject.c_loc.lon)};
//                if (!stoppedBusObject.address || stoppedBusObject.address == "-")
//                {
//                    UtilService.getAddressForCoordinates(latlng).then(function (address) {
//                        stoppedBusObject.address = address;
//                    });
//                }
//            } else
//            {
//                stoppedBusObject.address = "-";
//            }
//        });

        if ($scope.studentDetailsPopup)
        {
            angular.forEach(mapService.tripHash[tripInView].stud_activity, function (tripStuObject) {
//                studentListHash[tripStuObject._id] = tripStuObject;
                if (mapService.tripHash[tripInView].trip_type == 'PICKUP')
                {
                    if (studentListHash[tripStuObject._id] != undefined)
                    {
                        studentListHash[tripStuObject._id].boardpick = 'Boarded';
                        if (tripStuObject.loc.stop)
                            studentListHash[tripStuObject._id].stop = tripStuObject.loc.stop;
                    } else
                    {
                        studentListHash[tripStuObject._id].boardpick = '';
                    }
                } else
                {
                    if (studentListHash[tripStuObject._id] != undefined)
                    {
                        studentListHash[tripStuObject._id].boardpick = 'Dropped';
                        if (tripStuObject.loc.stop)
                            studentListHash[tripStuObject._id].stop = tripStuObject.loc.stop;
                    } else
                    {
                        studentListHash[tripStuObject._id].boardpick = '';

                    }
                }
            });
        }

//        $scope.showStuList(tripInView);
    }
    ;
    var chartHash = {};

    function createChart(list, id, color, status)
    {
        var viewableStatus = '';
        var remainingStatus = ';'
        switch (status) {
            case 0:
                viewableStatus = 'Stopped';
                remainingStatus = 'Not Stopped';
                break;
            case 1:
                viewableStatus = 'Moving';
                remainingStatus = 'Not Moving';
                break;
            case 2:
                viewableStatus = 'Idle';
                remainingStatus = 'Not Idle';
                break;
            case 3:
                viewableStatus = 'Not Responding';
                remainingStatus = 'Responding';
                break;
        }
        ;
        if (chartHash[id])
        {
            chartHash[id].data = {
                labels: [viewableStatus, remainingStatus],

                datasets: [
                    {
                        label: "Vehicles",
                        backgroundColor: [color, "#fdfdfd"],
                        borderColor: ["#797979", "#797979"],
                        borderWidth: 2,
                        data: [$scope.set2Digits((list.length / $scope.busList.length) * 100), $scope.set2Digits((($scope.busList.length - list.length) / $scope.busList.length) * 100)]
                    }
                ]
            };
            chartHash[id].update();
        } else
        {
            var donutEl = new Chart(document.getElementById(id), {
                type: 'doughnut',
                data: {
                    labels: [viewableStatus, remainingStatus],

                    datasets: [
                        {
                            label: "Vehicles",
                            backgroundColor: [color, "#fdfdfd"],
                            borderColor: ["#797979", "#797979"],
                            borderWidth: 2,
                            data: [$scope.set2Digits((list.length / $scope.busList.length) * 100), $scope.set2Digits((($scope.busList.length - list.length)/ $scope.busList.length) * 100)]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutoutPercentage: 70
                }
            });

            chartHash[id] = donutEl;
        }




    }
    updateCurrentAndHistoryList(true);
    $rootScope.$on('socketUpdate', function () {
        updateCurrentAndHistoryList(false);
    });
    $rootScope.$on('socketUpdateWithChart', function (event, updateChart) {
        updateCurrentAndHistoryList(true);
    });
    getStudentHash();

    $scope.showStuList = function (tripId) {
        $log.debug('showStuList called with tripId = ' + tripId);
        if ($rootScope.category == $rootScope.categoryLabel.general || !$rootScope.rfidModule)
            return;

        if (!$scope.studentDetailsPopup)
            $scope.studentDetailsPopup = true;
        $scope.studentList = [];
        tripStuHash = [];
        tripInView = tripId;
        var dropTripStuList = [];
        $log.debug('mapService.tripHash[tripId] = ' + mapService.tripHash[tripId]);
        if (mapService.tripHash[tripId] !== undefined)
        {
            var tripStuList = mapService.tripHash[tripId].stud_activity;

            $log.debug('tripStuList length = ' + tripStuList.length);
            $log.debug('showlist called tripId = ' + tripId);
            $log.debug('got studentHash, tripStuList.length  = ' + tripStuList.length);

            angular.forEach(tripStuList, function (tripStuObject) {
                tripStuHash[tripStuObject._id] = tripStuObject;
            });

            if (mapService.tripHash[tripId].trip_type != 'PICKUP')
            {
                angular.forEach(mapService.tripHash[tripId].stud_list, function (stuObject) {
                    var studentIdObj = stuObject.split("_");
                    dropTripStuList[studentIdObj[0]] = {card: studentIdObj[1]};
                    dropTripStuList[stuObject._id] = {card: stuObject.card};
                });
            }

            $indexedDB.openStore('student', function (studentStore) {
                $log.debug('get student list for route = ' + mapService.tripHash[tripId].route);
                var find = studentStore.query();
                find = find.$eq(mapService.tripHash[tripId].route);
                find = find.$index("route_id");
                studentStore.eachWhere(find).then(function (stuList) {
//                    stuRouteHash[stuList._id].stucount = stuList.length;
                    angular.forEach(stuList, function (stuObject) {
                        if (mapService.tripHash[tripId].trip_type == 'PICKUP')
                        {
                            if (tripStuHash[stuObject._id] != undefined)
                            {
                                stuObject.boardpick = 'Boarded';
                                if (tripStuHash[stuObject._id].loc.stop)
                                    stuObject.stop = tripStuHash[stuObject._id].loc.stop;
                                if (tripStuHash[stuObject._id].card == undefined || tripStuHash[stuObject._id].card)
                                    stuObject.card = true;
                                else
                                    stuObject.card = false;
                            } else
                            {
                                stuObject.boardpick = '';
                            }
                            stuObject.trip_type = 'PICKUP';
                            $scope.studentList.push(stuObject);
                            studentListHash[stuObject._id] = stuObject;
                        } else
                        {
                            if (dropTripStuList[stuObject._id])
                            {
                                if (tripStuHash[stuObject._id] != undefined)
                                {
                                    stuObject.boardpick = 'Dropped';
                                    if (tripStuHash[stuObject._id].loc.stop)
                                        stuObject.stop = tripStuHash[stuObject._id].loc.stop;

                                } else
                                {
                                    stuObject.boardpick = '';
                                }
                                if (dropTripStuList[stuObject._id].card == undefined || dropTripStuList[stuObject._id].card == "1")
                                    stuObject.card = true;
                                else
                                    stuObject.card = false;
                                stuObject.trip_type = 'DROP';
                                $scope.studentList.push(stuObject);
                                studentListHash[stuObject._id] = stuObject;
                            }

                        }

                    });
                });
            });
            $log.debug('$scope.studentList.length = ' + $scope.studentList.length);
        }
    };

    $scope.showAlerts = function (tripId) {
        $scope.alertdetailspopup = true;
        if (mapService.tripHash[tripId] !== undefined)
        {
            $scope.idleAlertList = mapService.tripHash[tripId].idle_alert;
            $scope.speedAlertList = mapService.tripHash[tripId].speed_alert;
        }
    };

    $scope.attendance = function (stuObject) {
        if (stuObject.trip_type == 'PICKUP' && stuObject.boardpick == '')
        {
            return '';
        }
        if (stuObject.card == undefined || stuObject.card)
        {
            return 'Card';
        } else
        {
            return 'Manual';
        }
    };
    //getStudentHash Start
    function getStudentHash() {
        $log.debug('getStudentHash called');
        var defer = $q.defer();
        $indexedDB.openStore('student', function (studentStore) {
            studentStore.getAll().then(function (studentList) {
                angular.forEach(studentList, function (stuObject) {
                    studentHash[stuObject._id] = stuObject;
                });
                $log.debug('getStudentHash return');
                return defer.resolve();
            });
        });
        return defer.promise;


    }
    ;
    //getStudentHash Ends

    $scope.getAddress = function (c_loc) {
        if (c_loc)
            return UtilService.getAddressForCoordinates(c_loc);
        else
            "-";
    };
    
    function set2Digits(x)
    {
        return x.toFixed(0);
    };
    
    $scope.filterVehicle = function(status)
    {
        $scope.searchvehicle = status;
    }
    
    $scope.viewOnMap = function(id)
    {
        $location.path('/maps/:' + id);
    }

    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "CurrentStatus.pdf");
          });
        
    }


});

