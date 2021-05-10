/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




app.controller('ReportsController', function ($rootScope, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {
    $log.debug("ReportsController reporting for duty.");
    $rootScope.showBackStrech = false;

    UtilService.setSidebar();

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
    $scope.totalFuel = 0;
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
    var fromUTCG, toUTCG;
    filteredTripObject = {};
    var screenWidth = window.innerWidth;

    if (screenWidth < 760) {
        $scope.includeMobileTemplate = true;
    } else {
        $scope.includeDesktopTemplate = false;
    }


    var
            start, end, generator, line, linestring,
            coords = [], coords3857 = [], feature, index_mid,
            geom, dx, dy, rotation, arc_style, vectorSource, map, center, strokeFeature = '', profileInfo, gmap, schoolPosition;


//    $scope.exportToExcel = function (tableId) { // ex: '#my-table'
//        $scope.exportHref = Excel.tableToExcel(tableId, 'sheet name');
//        $timeout(function () {
////            var link = document.createElement('a');
////            link.download = "export.xlsx";
////            link.href = $scope.exportHref;
////            link.click();
//            location.href = $scope.exportHref;
//        }, 100); // trigger download
//    };

    
    
    $scope.allSeen = function(){
        $scope.calender = true;
    }

    profileInfo = angular.fromJson($sessionStorage.profileInfo);

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

    $scope.getHistoryReport = function (fromDate, toDate) {

        $scope.isDetail;
        $scope.fromDate = fromDate;
        $scope.toDate = toDate;
        $scope.totalTime = 0;
        $scope.totalDistance = 0;
        $scope.totalFuel = 0;
        $log.debug('getHistoryReport');
        $scope.replayView = false;
        $scope.moving = false;
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

            $scope.calender = false;
            fromUTCG = fromUTC;
            toUTCG = toUTC;

            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/trip?st=' + fromUTC + '&et=' + toUTC);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                $scope.calender = false;
                if (result.success == true)
                {
                    $scope.tripList = result.data;
                    summaryHash = [];
                    angular.forEach($scope.tripList, function (tripObj) {

                        if (mapService.busHash[tripObj.device_id] != undefined)
                        {
                            tripObj.bus_number = mapService.busHash[tripObj.device_id].bus_number;
                            v_type = mapService.busHash[tripObj.device_id].v_type;
                        } else
                        {
                            tripObj.bus_number = '-';
                        }

                        var startObj = new Date(tripObj.start_time);
                        tripObj.dateoftrip = startObj.toDateString();
                        var startObjms = startObj.getTime();
                        startObj = startObj.toLocaleTimeString();
                        if (tripObj.end_time)
                        {
                            var endObj = new Date(tripObj.end_time);
                            var endObjms = endObj.getTime();
                            if (endObjms < startObjms)
                            {
                                endObjms = -1;
                                endObj = '-';
                            } else
                            {
                                endObj = endObj.toLocaleTimeString();
                            }
                        } else
                        {
                            if (tripObj.last_known_time)
                            {
                                var endObj = new Date(tripObj.last_known_time);
                                var endObjms = endObj.getTime();
                                if (endObjms < startObjms)
                                {
                                    endObjms = -1;
                                    endObj = '-';
                                } else
                                {
                                    endObj = endObj.toLocaleTimeString();
                                }
                            } else
                            {
                                endObjms = -1;
                                endObj = '-';
                            }

                        }

                        if(tripObj.fuel) {
                            tripObj.fuel = Math.abs(Number(tripObj.fuel).toFixed(2))
                        }

                        var total_time = '';
                        var difference = endObjms - startObjms;

                        if (Number(difference) < 0)
                        {
                            total_time = '-';
                            tripObj.timems = 0;
                        } else
                        {
                            total_time = secondsToHms(difference / 1000);
                            tripObj.timems = difference;
                            $scope.totalTime += difference;
                        }
                        tripObj.withCard = 0;
                        angular.forEach(tripObj.stud_activity, function (stuObj) {
                            if (stuObj.card == undefined || stuObj.card)
                            {
                                tripObj.withCard++;
                            }
                        });



                        tripObj.total_time = total_time;
                        tripObj.start_time = startObj;
                        tripObj.end_time = endObj;
                        tripObj.distance = (tripObj.distance).toFixed(1);
                        $scope.totalDistance += Number(tripObj.distance);

                        if(tripObj.fuel)
                            $scope.totalFuel += Number(tripObj.fuel.toFixed(2));
                        if (summaryHash[tripObj.bus_number])
                        {
                            summaryHash[tripObj.bus_number].trip_count++;
                            summaryHash[tripObj.bus_number].total_distance += Number(tripObj.distance);
                            if(tripObj.fuel) {
                                if(summaryHash[tripObj.bus_number].total_fuel)
                                    summaryHash[tripObj.bus_number].total_fuel += Number(tripObj.fuel.toFixed(2));
                                else {
                                    summaryHash[tripObj.bus_number].total_fuel = Number(tripObj.fuel.toFixed(2));
                                }
                                console.log(Number(tripObj.fuel.toFixed(2)))
                                console.log(summaryHash[tripObj.bus_number].total_fuel)
                            }
                            if (difference > 0)
                                summaryHash[tripObj.bus_number].total_time += difference;

                        } else
                        {
                            var summaryObject = {
                                bus_number: tripObj.bus_number,
                                v_reg_no: tripObj.v_reg_no,
                                trip_count: 1,
                                total_distance: Number(tripObj.distance),
                                total_time: 0
                            };

                            if (difference > 0)
                                summaryObject.total_time = difference;
                            summaryHash[tripObj.bus_number] = summaryObject;
                            if(tripObj.fuel)
                                summaryHash[tripObj.bus_number].total_fuel = Number(tripObj.fuel.toFixed(2));
                        }

                    });
                    $scope.totalTime = secondsToHms($scope.totalTime / 1000);
                    $scope.totalDistance = $scope.totalDistance.toFixed(1);
                    
                    $scope.summary_list = [];
                    Object.keys(summaryHash).forEach(function (key) {
                        var summaryObj = summaryHash[key];
                        summaryObj.total_distance = Number(summaryObj.total_distance).toFixed(1);
                        if(summaryObj.total_fuel)
                            summaryObj.total_fuel = Number(summaryObj.total_fuel).toFixed(1);
                        if (summaryObj.total_time == 0)
                            summaryObj.total_time = '-';
                        else
                            summaryObj.total_time = secondsToHms(summaryObj.total_time / 1000);
                        $scope.summary_list.push(summaryObj);
                    });

                    if($routeParams.historybusno) {
                        $scope.historybusno = ($routeParams.historybusno).toString();
                        if ($scope.historybusno.substring(0, 1) === ':') {
                            $scope.showDetails($scope.historybusno.substring(1));
                        }
                    }
                                } else
                {
                    //Notify Error
                }
            });
        }
    };

    var tripStuHash = [];
    $scope.showStuList = function ($index) {
        if (!$rootScope.rfidModule || $rootScope.category == $rootScope.categoryLabel.general)
            return;
        var tripObj = $scope.tripList[$index];
        var tripId = tripObj._id;
        $log.debug('showStuList called with tripId = ' + tripId);
        $scope.studentDetailsPopup = !$scope.studentDetailsPopup;
        $scope.studentList = [];
        tripStuHash = [];
        //if (mapService.tripHash[tripId] !== undefined)
        {
            var tripStuList = tripObj.stud_activity;

            $log.debug('tripStuList length = ' + tripStuList.length);
            $log.debug('showlist called tripId = ' + tripId);
            $log.debug('got studentHash, tripStuList.length  = ' + tripStuList.length);

            angular.forEach(tripStuList, function (tripStuObject) {
                tripStuHash[tripStuObject._id] = tripStuObject;
            });

            $indexedDB.openStore('student', function (studentStore) {
                $log.debug('get student list for route = ' + tripObj.route);
                var find = studentStore.query();
                find = find.$eq(tripObj.route);
                find = find.$index("route_id");
                studentStore.eachWhere(find).then(function (stuList) {
//                    stuRouteHash[stuList._id].stucount = stuList.length;
                    angular.forEach(stuList, function (stuObject) {
                        if (tripObj.trip_type == 'PICKUP')
                        {
                            if (tripStuHash[stuObject._id] != undefined)
                            {
                                stuObject.boardpick = 'Boarded';
                                if (tripStuHash[stuObject._id].loc.stop)
                                    stuObject.stop = tripStuHash[stuObject._id].loc.stop;
                            } else
                            {
                                stuObject.boardpick = '';
                            }

                            $scope.studentList.push(stuObject);
                        } else
                        {
                            $log.debug('tripStuHash[stuObject._id] = ' + tripStuHash[stuObject._id]);
                            if (tripStuHash[stuObject._id] != undefined)
                            {
                                stuObject.boardpick = 'Dropped';
                                if (tripStuHash[stuObject._id].loc.stop)
                                    stuObject.stop = tripStuHash[stuObject._id].loc.stop;
                            } else
                            {
                                stuObject.boardpick = '';

                            }
                            $scope.studentList.push(stuObject);
                        }



                    });
                });
            });
            $log.debug('$scope.studentList.length = ' + $scope.studentList.length);
        }
    };


    $scope.showAlerts = function ($index) {
        $scope.alertdetailspopup = true;
        if ($scope.tripList[$index] !== undefined)
        {
            $log.debug('tripId = ' + $scope.tripList[$index]._id);
            $scope.idleAlertList = $scope.tripList[$index].idle_alert;
            $log.debug('$scope.idleAlertList = ' + JSON.stringify($scope.idleAlertList));
            $scope.speedAlertList = $scope.tripList[$index].speed_alert;
            $log.debug('$scope.speedAlertList = ' + JSON.stringify($scope.speedAlertList));
        }
    };

    function initiateGMap() {
        if (!isMapInitialised)
        {
            var mapObject = UtilService.initiateMap('routeMap', 13);
            gmap = mapObject.map;
            schoolMarker = mapObject.schoolMarker;
            var coordLen = $scope.tripCoords.length
            var busStartPosition = {lat: $scope.tripCoords[0].lat, lng: $scope.tripCoords[0].lon};
            var busEndPosition = {lat: $scope.tripCoords[coordLen-1].lat, lng: $scope.tripCoords[coordLen-1].lon};
            $scope.busMarker = new google.maps.Marker({
                position: busStartPosition,
                map: gmap,
                optimized: false,
                draggable: true,
            });

            var flag = {
                url: constantService.beachFlagIcon,
                size: new google.maps.Size(20, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 32)
            };

            var pinIcon = {
                url: constantService.stop32Icon,
                size: new google.maps.Size(20, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 32)
            };

            var pickup = new google.maps.Marker({
                position: busStartPosition,
                map: gmap,
                optimized: false,
                icon: flag
            });
            var drop = new google.maps.Marker({
                position: busEndPosition,
                map: gmap,
                optimized: false,
                icon: flag
            });

            
            var busPopText = '<div class="map-popup" >' + '<b>' + 'Vehicle: ' + mapService.busHash[$scope.replay_deviceId].reg_no + '</b><br>' + '</div>';

            UtilService.getAddressForCoordinates(busStartPosition).then(function (address) {
                var startPopText = '<div class="map-popup" style="max-width: 180px">' + '<b>' + address + '</b><br>' + '</div>';
                var startInfoWindow = new google.maps.InfoWindow({
                    content: startPopText
                });
                startInfoWindow.open(gmap, pickup);
            });

            UtilService.getAddressForCoordinates(busEndPosition).then(function (address) {
                var destPopText = '<div class="map-popup" style="max-width: 180px">' + '<b>' + address + '</b><br>' + '</div>';
                var destInfoWindow = new google.maps.InfoWindow({
                    content: destPopText
                });
                destInfoWindow.open(gmap, drop);
            });


            var infowindow = new google.maps.InfoWindow({
                content: busPopText
            });
            // infowindow.open(gmap, $scope.busMarker);

            $scope.busMarker.addListener('click', function () {
                infowindow.open(gmap, $scope.busMarker);
            });

            $scope.busMarker.infowindow = infowindow;

//            $scope.busMarker.addListener('mouseout', function () {
//                infowindow.close(map, schoolMarker);
//            });
            $scope.busMarker.setIcon({
                url: UtilService.getVehicleIcon(mapService.busHash[$scope.replay_deviceId].v_type, 1),
                anchor: new google.maps.Point(25, 25),

            });

            google.maps.event.addListener(gmap, "click", function (event) {
                infowindow.close(map, schoolMarker);
            });
            isMapInitialised = true;

            angular.forEach($scope.pin_delivery, function (pin) {
                 var pinPoint = new google.maps.Marker({
                    position:  {lat: pin.lat, lng: pin.lon},
                    map: gmap,
                    optimized: false,
                    icon: pinIcon
                });
                var infowindow = new google.maps.InfoWindow({
                    content: '<div class="map-popup" >'
                    + '<b>' + 'Order Id: ' + pin.order_id + '</b><br>' 
                    + '<b>' + 'Type: ' + pin.type + '</b><br>' 
                    + '<b>' + 'Time: ' + UtilService.timeInMin(new Date(pin.pin_time)) + '</b><br>' 
                    + '<b>' + 'Distance: ' + $scope.showDistanceInKm(pin.distance) + '</b><br>' 
                    + '</div>'
                });
                infowindow.open(gmap, pinPoint);
            });
           

            
        }
    }
    ;
    function initiateMap() {
        if (!isMapInitialised)
        {
            $log.debug('initiateMap called');

            vectorSource = new ol.source.Vector({});
            
            var schoolCoord = profileInfo.loc;
            
            var lat = Number(schoolCoord.lat);
            var lon = Number(schoolCoord.lon);
            schoolPosition = {lat: 34.366, lng: -89.519}
            center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
            initMap();
            map = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    new ol.layer.Vector({
                        source: vectorSource
                    })
                ],
                target: 'routeMa1p',
                view: new ol.View({
                    center: center,
                    zoom: 13,
                    maxZoom: 18,
                    minZoom: 4
                }),
                loadTilesWhileAnimating: true,
                loadTilesWhileInteracting: true,
                renderer: 'canvas',
            });
            isMapInitialised = true;
        }
    }
    ;
    $scope.marker = {};
    function initMap() {
        var center = {lat: -25.363, lng: 131.044};
        var zoom = 4;
    }


    function initiateBus() {
        markSchool();
        var vehicleImage = UtilService.getVehicleIcon(v_type, constantService.stoppedStatus);
        if ($scope.tripCoords.length === 0)
        {
            return;
        }
        var point = new ol.geom.Point(
                ol.proj.transform([$scope.tripCoords[0].lon, $scope.tripCoords[0].lat], 'EPSG:4326', 'EPSG:3857')
                );
        $scope.feature = new ol.Feature({
            type: 'click',
            geometry: point
        });
        var allCoordinates = [];
        var iconStyle;
        if ($scope.tripCoords.length == 1)
        {
            iconStyle = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: vehicleImage,
                    rotateWithView: false
                }))
            });
            $scope.feature.setStyle(iconStyle);
            vectorSource.addFeature($scope.feature);
            $scope.feature.set('geometry', new ol.geom.Point(ol.proj.transform([$scope.tripCoords[0].lon, $scope.tripCoords[0].lat], 'EPSG:4326', 'EPSG:3857')));

            return;
        }
        for (var i = 0; i < $scope.tripCoords.length; i++)
        {
            allCoordinates.push(ol.proj.transform([$scope.tripCoords[i].lon, $scope.tripCoords[i].lat], 'EPSG:4326', 'EPSG:3857'));
        }
        //var temp = allCoordinates.getCoordinates();
        var ext = ol.extent.boundingExtent(allCoordinates);
        map.getView().fit(ext, map.getSize());

        dx = $scope.tripCoords[1].lat - $scope.tripCoords[0].lat;
        dy = $scope.tripCoords[1].lon - $scope.tripCoords[0].lon;
        rotation = Math.atan2(dy, dx);

        iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: vehicleImage,
                rotateWithView: false,
                rotation: 90 * Math.PI / 180
            }))
        });

        $scope.feature.setStyle(iconStyle);
        vectorSource.addFeature($scope.feature);
        //setZoomAccToVector();
        var time = new Date($scope.tripCoords[0].time);
        $scope.replaytime = time.toLocaleTimeString();
        $log.debug('$scope.replaytime = ' + $scope.replaytime);
    }
    ;


    $scope.replayTripIndex = -1;
    $scope.replay = function ($index, isAll) {
        if (!$scope.replayView)
        {
            $scope.replayTripIndex = $index;
            $scope.busMarker.stopped = false;
            $scope.busPosIndex = 0;
            $scope.coords_interval = [];
            $scope.busAnimIndex = 0;
            $scope.moving = false;
            $scope.getTripDetails($index, isAll).then(function (result) {
                $scope.replayView = true;
//                setZoomAccToVector();
            });
        }


    };

    $scope.play = function () {
        $scope.isPaused = false;
        $scope.busMarker.stopped = false;
        $scope.moving = true;
        $scope.busPosIndex = 0;
        $scope.busAnimIndex = 0;
        $scope.busMarker.id = $scope.replay_deviceId;
        $scope.busMarker.v_type = mapService.busHash[$scope.replay_deviceId].v_type;
        //moveGBus($scope.busPosIndex);
        $scope.movebus($scope.busPosIndex);

    };

    $scope.pause = function () {
        if (!$scope.isPaused)
        {
            $scope.moving = false;
            $scope.keepPasued = {
                busPosIndex: $scope.busPosIndex,
                busAnimIndex: $scope.busAnimIndex,
            };
            $scope.busPosIndex = $scope.tripCoords.length;
            $scope.busAnimIndex = $scope.coords_interval.length;
            $scope.isPaused = true;
        }


    };

    $scope.resume = function () {
        $scope.isPaused = false;
        $scope.moving = true;
        $scope.busPosIndex = $scope.keepPasued.busPosIndex;
        $scope.busAnimIndex = $scope.keepPasued.busAnimIndex;
        $scope.movebus($scope.busPosIndex);
    };

    $scope.stop = function () {

        $scope.busPosIndex = $scope.tripCoords.length;
        $scope.busAnimIndex = $scope.coords_interval.length;
        $scope.moving = false;
        $scope.isPaused = false;
        $scope.busMarker.stopped = true;
        if ($scope.tripCoords.length > 0)
            $scope.busMarker.setPosition({lat: Number($scope.tripCoords[0].lat), lng: Number($scope.tripCoords[0].lon)});
//            $scope.feature.set('geometry', new ol.geom.Point(ol.proj.transform([$scope.tripCoords[0].lon, $scope.tripCoords[0].lat], 'EPSG:4326', 'EPSG:3857')));
//        vectorSource.clear();
        strokeFeature = '';
        if (UtilService.replayLines.length)
        {
            for (var i = 0; i < UtilService.replayLines.length; i++)
            {
                UtilService.replayLines[i].setMap(null); //or line[i].setVisible(false);
            }
        }
        UtilService.replayLines = [];
//        initiateBus();
    };

    $scope.close = function () {
        isMapInitialised = false;
        $scope.busMarker.v_type = '';
        $scope.busPosIndex = $scope.tripCoords.length;
        $scope.busAnimIndex = $scope.coords_interval.length;
        $scope.replayView = false;
        $scope.moving = false;
        $scope.isPaused = false;
        start = '';
        end = ''
        generator = '';
        line = '';
        linestring = '';
        coords = [];
        coords3857 = [];

        index_mid = '';
        geom = '';
        dx = '';
        dy = '';
        rotation = '';
        if (vectorSource && $scope.feature)
            vectorSource.removeFeature($scope.feature);
        if (strokeFeature)
            vectorSource.removeFeature(strokeFeature);
//        vectorSource.clear();
        strokeFeature = '';
        $scope.feature = '';
        arc_style = '';
        $scope.replay_deviceId = '';
        if (UtilService.replayLines.length)
        {
            for (var i = 0; i < UtilService.replayLines.length; i++)
            {
                UtilService.replayLines[i].setMap(null); //or line[i].setVisible(false);
            }
        }
        UtilService.replayLines = [];
    };

    $scope.getTripDetails = function ($index, isAll) {
        var defer = $q.defer();
        $rootScope.mypageloading = true;
        var url;
        if(isAll) {
            url = $rootScope.serverURL + '/customer/trip/detailall?st=' + fromUTCG + '&et=' + toUTCG;
        } else {
            url = $rootScope.serverURL + '/customer/trip/history/' + $scope.detailedTripList[$index]._id;
        }
        var requestHandle = HttpService.HttpGetData(url);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true)
            {
                $scope.tripCoords = result.data.location;
                $scope.pin_delivery =  result.data.pin_delivery;
                $scope.tripCoords.sort(function (a, b) {
                    return a.time - b.time;
                });
                if(isAll) $scope.replay_deviceId = filteredTripObject.device_id;
                else $scope.replay_deviceId = $scope.detailedTripList[$index].device_id;
                //-------ETA-------
                // var coordLen = $scope.tripCoords.length
                // var busStartPosition = {lat: $scope.tripCoords[0].lat, lng: $scope.tripCoords[0].lon};
                // var busEndPosition = {lat: $scope.tripCoords[coordLen-1].lat, lng: $scope.tripCoords[coordLen-1].lon};
                // var d = new Date($scope.tripCoords[0].time);
                // var h = d.getHours();
                // var m = d.getMinutes();

                // var td = new Date(Date.now());
                // var th = td.getHours();
                // var tm = td.getMinutes();

                // var service = new google.maps.DistanceMatrixService;
                // service.getDistanceMatrix({
                //   origins: [busStartPosition],
                //   destinations: [busEndPosition],
                //   travelMode: 'DRIVING',
                //   drivingOptions: {
                //       departureTime: new Date(Date.now() + (h+24-th)*3600000 + (m-tm)*60000),  // for the time N milliseconds from now.
                //       trafficModel: 'bestguess'
                //     },
                //   unitSystem: google.maps.UnitSystem.METRIC,
                //   // avoidHighways: false,
                //   // avoidTolls: false
                // }, function(response, status) {
                //   if (status !== 'OK') {
                //     alert('Error was: ' + status);
                //   } else {
                //     var originList = response.originAddresses;
                //     var destinationList = response.destinationAddresses;
                //     // var outputDiv = document.getElementById('output');
                //     // deleteMarkers(markersArray);
                //     for (var i = 0; i < response.rows.length; i++) {
                //     }
                //   }
                // });

                //-------ETA-------

                $scope.replayView = true;
                $timeout(function () {
                    initiateGMap();
                    setZoomAccToVector();
                });


                defer.resolve();
            } else
            {
                //Notify Error
                defer.reject();
            }
        });
        return defer.promise;
    };


    moveGBus = function (busPosIndex) {

        rotation = Math.atan2($scope.tripCoords[busPosIndex + 1].lat - $scope.tripCoords[busPosIndex].lat, $scope.tripCoords[busPosIndex + 1].lon - $scope.tripCoords[busPosIndex].lon);
        start = {x: $scope.tripCoords[busPosIndex].lon, y: $scope.tripCoords[busPosIndex].lat};
        end = {x: $scope.tripCoords[busPosIndex + 1].lon, y: $scope.tripCoords[busPosIndex + 1].lat};

        generator = new arc.GreatCircle(start, end);
        line = generator.Arc(20, {offset: 0});// 99 to 50
        line = line.json();

        coords = line.geometry.coordinates;
        linestring = new ol.geom.LineString(coords);

        index_mid = Math.round(coords.length / 2 - 1);
        coords3857 = linestring.getCoordinates();
    };
    $scope.movebus = function () {
        var disto = 0;
        var markerMoveSpeed = $scope.tripCoords.length * 50 > 100 ? $scope.tripCoords.length * 100 : 100;
        if ($scope.busPosIndex < $scope.tripCoords.length)
        {
            var time = new Date($scope.tripCoords[$scope.busPosIndex].time);
            var busPopText = '<div class="map-popup" >' +
                    '<b>Vehicle: </b> ' + mapService.busHash[$scope.replay_deviceId].reg_no + '<br>' +
                    '<b>Speed:</b> ' + $scope.tripCoords[$scope.busPosIndex].speed + '<br>' +
                    '<b>Time:</b> ' + time.toLocaleTimeString() + '<br>' +
                    '</div>';

            $scope.busMarker.infowindow.setContent(busPopText);

            if($scope.busPosIndex >= 1) {
                var d = getDistanceFromLatLonInKm($scope.tripCoords[$scope.busPosIndex-1].lat, $scope.tripCoords[$scope.busPosIndex-1].lon, $scope.tripCoords[$scope.busPosIndex].lat, $scope.tripCoords[$scope.busPosIndex].lon);
                var t = $scope.tripCoords[$scope.busPosIndex].time - $scope.tripCoords[$scope.busPosIndex-1].time;
                var s = d*1000*3600/t
            }
            UtilService.moveMarker($scope.busMarker, $scope.tripCoords[$scope.busPosIndex], markerMoveSpeed).then(function () {
                //setZoomAccToVector();
                $scope.busPosIndex++;
                $scope.movebus();
            });
        }
        return;
        for (var pp = 0; pp < $scope.tripCoords.length - 1; pp++)
        {
            var currentCoord = $scope.busMarker.getPosition();
            //var lonlat = ol.proj.transform(currentCoord, 'EPSG:3857', 'EPSG:4326');
//            var start = {
//                lat: currentCoord.lon(),
//                lng: currentCoord.lng()
//            };

            var start = {
                lat: $scope.tripCoords[pp].lat,
                lng: $scope.tripCoords[pp].lon
            };
            var end = {lat: $scope.tripCoords[pp + 1].lat, lng: $scope.tripCoords[pp + 1].lon};
            disto += getDistanceFromLatLonInKm(end.lat, end.lng, start.lat, start.lng);
            $scope.busMarker.setPosition({lat: $scope.tripCoords[pp].lat, lng: $scope.tripCoords[pp].lon});
        }
        return;

        if (busPosIndex < $scope.tripCoords.length - 1)
        {

            if ($scope.tripCoords[busPosIndex + 1].lat == $scope.tripCoords[busPosIndex].lat || $scope.tripCoords[busPosIndex + 1].lon == $scope.tripCoords[busPosIndex].lon)
            {
                $scope.busPosIndex++;
                $scope.movebus($scope.busPosIndex);
                return;
            }
            rotation = Math.atan2($scope.tripCoords[busPosIndex + 1].lat - $scope.tripCoords[busPosIndex].lat, $scope.tripCoords[busPosIndex + 1].lon - $scope.tripCoords[busPosIndex].lon);
            var vehicleImage = UtilService.getVehicleIcon(v_type, constantService.runningBusIcon);
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1,
                    src: vehicleImage,
//                    rotateWithView: false,
                    rotation: 90 * Math.PI / 180 - rotation
                }))
            });
//            setZoomAccToVector();

            $scope.feature.setStyle(iconStyle);
            start = {x: $scope.tripCoords[busPosIndex].lon, y: $scope.tripCoords[busPosIndex].lat};
            end = {x: $scope.tripCoords[busPosIndex + 1].lon, y: $scope.tripCoords[busPosIndex + 1].lat};

            generator = new arc.GreatCircle(start, end);
            line = generator.Arc(20, {offset: 0});// 99 to 50
            line = line.json();

            coords = line.geometry.coordinates;
            linestring = new ol.geom.LineString(coords);
            linestring.transform('EPSG:4326', 'EPSG:3857');

            strokeFeature = new ol.Feature({
                geometry: linestring
            });

            index_mid = Math.round(coords.length / 2 - 1);
            coords3857 = linestring.getCoordinates();
            if (busPosIndex % 10 === 0)
            {
                geom = new ol.geom.Point(coords3857[index_mid]);
            } else
            {
                geom = '';
            }

            arc_style = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'red', width: 4
                    })
                }),
                new ol.style.Style({
                    geometry: geom,
                    image: new ol.style.Icon({
                        src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/chevron-right.png',
                        anchor: [0.75, 0.5],
                        rotateWithView: false,
                        rotation: -rotation
                    })
                })
            ];

            strokeFeature.setStyle(arc_style);
            vectorSource.addFeature(strokeFeature);

            $scope.coords_interval = coords3857;
            var dis = getDistanceFromLatLonInKm($scope.tripCoords[busPosIndex + 1].lat, $scope.tripCoords[busPosIndex + 1].lon, $scope.tripCoords[busPosIndex].lat, $scope.tripCoords[busPosIndex].lon);
            if (dis * 1000 < 2)
            {
                $log.debug('Setting ');
                $scope.feature.set('geometry', new ol.geom.Point(ol.proj.transform([$scope.tripCoords[busPosIndex + 1].lon, $scope.tripCoords[busPosIndex + 1].lat], 'EPSG:4326', 'EPSG:3857')));
                $scope.busPosIndex++;
                $scope.movebus($scope.busPosIndex);
                return;
            }
            browserAnimation.addRenderer(animateBusMove, 80);

//            setZoomAccToVector();

            var time = new Date($scope.tripCoords[busPosIndex].time);
            $scope.replaytime = time.toLocaleTimeString();
            $log.debug('$scope.replaytime = ' + $scope.replaytime);
        } else if (!$scope.isPaused)
        {
            $scope.moving = false;
            var vehicleImage = UtilService.getVehicleIcon(v_type, constantService.stoppedStatus);
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1,
                    src: vehicleImage,
//                    rotateWithView: false,
                }))
            });
//            setZoomAccToVector();
            if ($scope.feature)
                $scope.feature.setStyle(iconStyle);
        }
    };

    function markStops(route_id) {
        var stopFeature = '', stopIconStyle = '';
        HandShakeService.getRouteStopInfo(route_id).then(function (routeObj) {
            angular.forEach(routeObj.stop_list, function (stopObj) {
                if (stopObj.name && stopObj.number && stopObj.d_number)
                {
                    var stopPoint = new ol.geom.Point(
                            ol.proj.transform([Number(stopObj.lon), Number(stopObj.lat)], 'EPSG:4326', 'EPSG:3857')
                            );
                    stopFeature = new ol.Feature({
                        type: 'pointermove',
                        geometry: stopPoint
                    });
                    stopIconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 1,
                            src: '../assets/img/stop.png',
                            scale: 0.4
                        }))
                    });
                    stopFeature.setStyle(stopIconStyle);
                    var popUpContent = '<div class="map-popup" >' +
                            '<div>Route Name: ' + routeObj.route_name + '<br>Pick up Stop No: ' + stopObj.number + '<br>Drop Stop No: ' + stopObj.d_number + '<br>Stop Name: ' + stopObj.name + '</div>' +
                            '</div>';
                    stopFeature.set('name', popUpContent);
                    vectorSource.addFeature(stopFeature);
                }
            });
        });
    }
    ;

    function animateBusMove() {

        var nextPoint = new ol.geom.Point($scope.coords_interval[$scope.busAnimIndex]);
        if (nextPoint.A)
        {
            $scope.feature.set('geometry', nextPoint);
        }

        $scope.busAnimIndex++;

        if ($scope.busAnimIndex >= $scope.coords_interval.length)
        {
            browserAnimation.removeRenderer(animateBusMove);
            $scope.busPosIndex++;
            $scope.busAnimIndex = 0;
            $scope.movebus($scope.busPosIndex);
        }
    }
    ;

    var setZoomAccToVector1 = function () {
        {
            ol.extent.boundingExtent;
            var extent = vectorSource.getExtent();
            $log.debug('extent = ' + extent + 'map.getSize() = ' + map.getSize());
            if (map.getSize() !== undefined)
            {
                map.getView().fit(extent, map.getSize());
            }
        }
        // map.updateSize();
    }
    ;

    function markSchool() {

        var schoolMarker = new google.maps.Marker({
            position: center,
            map: map
        });

        var point = new ol.geom.Point(
                center
                );
        var feature = new ol.Feature({
            type: 'click',
            geometry: point
        });
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: '../assets/img/School-48.png'
            }))
        });
        var popUpContent = '<div class="map-popup" >' + profileInfo.name
                + '<br>' + '</div>';
        feature.setStyle(iconStyle);
        feature.set('name', popUpContent);
        vectorSource.addFeature(feature);
    }
    ;

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
//        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        return ((h > 0 ? h + " hr " + (m < 10 ? "0" : "") : "") + m + " min");
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }


    $scope.showDistanceInKm = function (distance) {
        var disInKm = Number((distance / 1000).toFixed(2));
        if (isNaN(disInKm))
            disInKm = '0';
        return disInKm + ' Km';
    };


    $scope.calendar_list = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Custom'];

    // var x_policy = profileInfo.x_policy;
    // if(x_policy && x_policy.reports_limit_day)
    // {
    //     $scope.calendar_list = $scope.calendar_list.slice(0,3);
    // }

    $scope.calendar_select = function ($index) {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        var midNightTime = date.getTime() + 86400000;
        
        
        if ($index == 0) {
            $scope.duration = 'Today';
            $scope.fromDate = midNightTime - 86400000;
            $scope.toDate = midNightTime;
        } else if ($index == 1) {
            $scope.duration = 'Yesterday';
            $scope.fromDate = midNightTime - 2 * 86400000;
            $scope.toDate = midNightTime - 86400000;
        } else if ($index == 2) {
            $scope.duration = 'Last 7 days';
            $scope.fromDate = midNightTime - 8 * 86400000;
            $scope.toDate = midNightTime;
        } else if ($index == 3) {
            $scope.duration = 'Last Month';
            $scope.fromDate = midNightTime - 31 * 86400000;
            $scope.toDate = midNightTime;
        } else if ($index == 4) {
            $scope.duration = 'Custom date';
            $scope.visibility = true;
            $scope.calender = false;
            $scope.custom_date = true;
            $scope.fromMaxDate = Date();
            $scope.nextPressed = false;
            $scope.fromDate = (new Date()).toLocaleDateString();
            $scope.toDate = (new Date()).toLocaleDateString();
            return;
        }
        $scope.calender=false;
        $scope.getHistoryReport($scope.fromDate, $scope.toDate);
    };

    $scope.cancel = function () {
        $scope.fromDate = '';
        $scope.toDate = '';
        $scope.calender = false;
        $scope.custom_date = false;
    };

    $scope.next = function () {
        $scope.nextPressed = true;
    };

    $scope.back = function () {
        $scope.nextPressed = false;
    };

    $scope.bus_filter_text = 'All';
    $scope.filter_reports = function (bus_number) {
        $scope.bus_filter = bus_number;
        $scope.bus_filter_text = bus_number;
        $scope.totalDistance = 0;
        $scope.totalTime = 0;
        $scope.totalFuel = 0;
        $scope.detailedTripList = [];
        filteredTripObject = {};
        angular.forEach($scope.tripList, function (tripObj) {
            if (tripObj.bus_number == $scope.bus_filter)
            {
                $scope.detailedTripList.push(tripObj);
                $scope.totalTime += tripObj.timems;
                $scope.totalDistance += Number(tripObj.distance);
                if(tripObj.fuel)
                    $scope.totalFuel += Number(tripObj.fuel.toFixed(2));

                filteredTripObject = tripObj;
            }
        });
        $scope.totalTime = secondsToHms($scope.totalTime / 1000);
        $scope.totalDistance = Number($scope.totalDistance.toFixed(1));
    };

    $scope.filter_reports_all = function () {
        $scope.bus_filter = '';
        $scope.bus_filter_text = 'All';
        $scope.detailedTripList = $scope.tripList;
        $scope.totalDistance = 0;
        $scope.totalFuel = 0;
        $scope.totalTime = 0;
        angular.forEach($scope.tripList, function (tripObj) {
            if (tripObj.bus_number)
            {
                $scope.totalTime += tripObj.timems;
                $scope.totalDistance += Number(tripObj.distance);
                if(tripObj.fuel)
                    $scope.totalFuel += Number(tripObj.fuel.toFixed(2));
            }
        });
        $scope.totalTime = secondsToHms($scope.totalTime / 1000);
    };

    $scope.showDetails = function ($index) {
        $scope.filter_reports(Number($index));
        $scope.isDetail = true;
    };

    $scope.export = function () {
        html2canvas(document.getElementById('tableToExport'), {
            onrendered: function (canvas) {
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                            image: data,
                            width: 500,
                        }]
                };
                pdfMake.createPdf(docDefinition).download("Bus Report.pdf");
            }
        });
    }

    $scope.attendance = function (stuObject) {
        if (stuObject.boardpick == '')
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

    $scope.calendar_select(0);

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


    function setZoomAccToVector() {

        var bounds = new google.maps.LatLngBounds();
        angular.forEach($scope.tripCoords, function (coords) {
            bounds.extend({lat: coords.lat, lng: coords.lon});
        });
        //bounds.extend($scope.busMarker.getPosition());
        //bounds.extend(schoolMarker.getPosition());
        gmap.fitBounds(bounds);
        return;
    }

    
});

