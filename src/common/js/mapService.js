/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


app.factory('mapService', function (HttpService, constantService, busService, $sessionStorage, $rootScope, $q, Auth, socket, UtilService, $interval, $location, $log, $http, HandShakeService, $timeout) {

    var mapService = {};
    mapService.IsMapInitialized = false;
    mapService.map = '';
    mapService.mapInit = mapInit;
    mapService.markersHash = {};
    mapService.vectorSource = '';
    mapService.socketConnection = socketConnection;
    mapService.updateBusLists = updateBusLists;
    mapService.setZoomAccToVector = setZoomAccToVector;
    mapService.updateBusOnMap = updateBusOnMap;
    mapService.popupContent = popupContent;
    mapService.mapBusList = [];
    mapService.currentList = [];
    mapService.historyList = [];
    mapService.bufferList = [];
    mapService.busHash = [];
    mapService.tripHash = [];
    mapService.tripDevIdHash = [];
    mapService.tripList = [];
    mapService.busList = [];
    mapService.refreshBusStatus_10 = undefined;
    mapService.moveVehicleSmoothly = moveVehicleSmoothly;
//    mapService.moveFeature = moveFeature;
    mapService.resetAllVar = resetAllVar;
    mapService.animateBusMove = animateBusMove;
    return mapService;
    function resetAllVar() {
        mapService.IsMapInitialized = false;
        mapService.map = '';
        mapService.vectorSource = '';
        mapService.mapBusList = [];
        mapService.currentList = [];
        mapService.historyList = [];
        mapService.bufferList = [];
        mapService.busHash = [];
        mapService.markersHash = {};
        mapService.tripHash = [];
        mapService.tripDevIdHash = [];
        mapService.tripList = [];
        mapService.busList = [];
        socket.isConnected = false;
        if (angular.isDefined(mapService.refreshBusStatus_10)) {
            $interval.cancel(mapService.refreshBusStatus_10);
            mapService.refreshBusStatus_10 = undefined;
        }
    }
    ;

    function mapInit() {

        var mapObject = UtilService.initiateMap('dashboardMap', constantService.defaultZoom);
        mapService.map = mapObject.map;
        mapService.markersHash['school'] = mapObject.schoolMarker;
        mapService.IsMapInitialized = true;
        google.maps.event.trigger(mapService.map, "resize");
        // Create a div to hold the control.

        var controlDiv = document.createElement('div');

        // Set CSS for the control border
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Geofence';
        controlUI.appendChild(controlText);

       

        controlUI.addEventListener("click", function() {
            // map.setCenter(chicago);
            showGeofence(mapObject.map);
          });

        mapObject.map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);
        // HandShakeService.getRouteInfo().then(function (result) {
        //     $log.debug('mapInit: HandShakeService getRouteInfo received result.length = ' + result.length);
        //     var route_list = result;
        //     angular.forEach(route_list, function (routeObj) {
        //         angular.forEach(routeObj.stop_list, function (stopObj) {
        //             if (stopObj.name && stopObj.number && stopObj.d_number)
        //             {
        //                 var stopPopText = '<div class="map-popup" >' +
        //                         '<div>Route Name: ' + routeObj.route_name + '<br>Pick up Stop No: ' + stopObj.number + '<br>Drop Stop No: ' + stopObj.d_number + '<br>Stop Name: ' + stopObj.name + '</div>' +
        //                         '</div>';
        //                 var infoWindow = new google.maps.InfoWindow({
        //                     content: stopPopText
        //                 });

        //                 var stopMarker = new google.maps.Marker({
        //                     position: {lat: Number(stopObj.lat), lng: Number(stopObj.lon)},
        //                     map: mapService.map,
        //                     icon: constantService.stopIcon,
        //                 });
        //                 stopMarker.addListener(constantService.showPopuponClickorHoverGMap, function () {
        //                     infoWindow.open(mapService.map, stopMarker);
        //                 });
        //                 stopMarker.addListener('mouseout', function () {
        //                     infoWindow.close(mapService.map, stopMarker);
        //                 });
        //             }
        //         });
        //     });
        // });
    }
    ;

    function showGeofence(map){
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/geofence');
        requestHandle.then(function (result) {
            if (result.success)
            {
                $rootScope.mypageloading = false;
                angular.forEach(result.data, function (geofence) {
                    console.log('geofence.type'+JSON.stringify(geofence))
                    if (geofence.type == 'circle' &&  geofence.geopoints[0].radius) { 
                        const cityCircle = new google.maps.Circle({
                          strokeColor: "#FF0000",
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: "#FF0000",
                          fillOpacity: 0.35,
                          title:geofence.name,
                          map: map,
                          center: { lat: geofence.geopoints[0].center.latitude,
                           lng: geofence.geopoints[0].center.longitude },
                          radius: geofence.geopoints[0].radius,
                        });
                        //circle is the google.maps.Circle-instance
                        google.maps.event.addListener(cityCircle,'mouseover',function(){
                             this.getMap().getDiv().setAttribute('title',this.get('title'));});

                        google.maps.event.addListener(cityCircle,'mouseout',function(){
                             this.getMap().getDiv().removeAttribute('title');});


                    } else if(geofence.type == 'polygon') {
                        var polyCoordinates = [];
                        for(var i=0; i< geofence.geopoints.length; i++) {
                            polyCoordinates.push({ lat: geofence.geopoints[i].latitude, 
                                lng: geofence.geopoints[i].longitude })
                        }
                        
                        const bermudaTriangle = new google.maps.Polygon({
                            paths: polyCoordinates,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35,
                          });
                          bermudaTriangle.setMap(map);
                    }

                })
               
            } 
        });
    }


    function mapInit1() {
        var profileInfo = angular.fromJson($sessionStorage.profileInfo);
        var centerCoord = profileInfo.loc;
        var center = ol.proj.transform([Number(centerCoord.lon), Number(centerCoord.lat)], 'EPSG:4326', 'EPSG:3857');
        //var center = ol.proj.transform([22.6908612, 75.8254355], 'EPSG:4326', 'EPSG:3857');


        mapService.vectorSource = new ol.source.Vector({});
        mapService.map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                new ol.layer.Vector({
                    source: mapService.vectorSource
                })
            ],
            target: 'dashboardMap',
            view: new ol.View({
                center: center,
                zoom: constantService.defaultZoom,
                maxZoom: constantService.maxZoom,
                minZoom: constantService.minZoom
            })
        });
        var popup = new ol.Overlay.Popup();
        mapService.map.addOverlay(popup);
        // display popup on click
        mapService.map.on(constantService.showPopuponClickorHover, function (evt) {
            var feature = mapService.map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        return feature;
                    });
            if (feature && feature.get('type') == constantService.showPopuponClickorHover) {

                var coord = feature.getGeometry().getCoordinates();
                //var props = feature.getProperties();
                var info = feature.get('name');
                // Offset the popup so it points at the middle of the marker not the tip
                popup.setOffset([0, -22]);
                popup.show(coord, info);
            } else {
                popup.hide();
            }
        });
        mapService.IsMapInitialized = true;
        var point = new ol.geom.Point(center);
        var feature = new ol.Feature({
            type: constantService.showPopuponClickorHover,
            geometry: point
        });
        var iconStyle = UtilService.getMarkerIconStyle(constantService.schoolIcon,
                constantService.defaultIconScale,
                constantService.defaultIconRotation);
        var schoolPopText = '<div class="map-popup" >' + '<b>' + profileInfo.name + '</b><br>' + '</div>';
        feature.setStyle(iconStyle);
        feature.set('name', schoolPopText);
        mapService.vectorSource.addFeature(feature);
        var stopFeature = '', stopIconStyle = '';
        HandShakeService.getRouteInfo().then(function (result) {
            $log.debug('mapInit: HandShakeService getRouteInfo received result.length = ' + result.length);
            var route_list = result;
            angular.forEach(route_list, function (routeObj) {
                angular.forEach(routeObj.stop_list, function (stopObj) {
                    if (stopObj.name && stopObj.number && stopObj.d_number)
                    {
                        var stopPoint = new ol.geom.Point(
                                ol.proj.transform([Number(stopObj.lon), Number(stopObj.lat)], 'EPSG:4326', 'EPSG:3857')
                                );
                        stopFeature = new ol.Feature({
                            type: constantService.showPopuponClickorHover,
                            geometry: stopPoint
                        });
                        stopIconStyle = UtilService.getMarkerIconStyle(constantService.stopIcon,
                                constantService.stopIconScale,
                                constantService.defaultIconRotation);
                        stopFeature.setStyle(stopIconStyle);
                        var stopPopText = '<div class="map-popup" >' +
                                '<div>Route Name: ' + routeObj.route_name + '<br>Pick up Stop No: ' + stopObj.number + '<br>Drop Stop No: ' + stopObj.d_number + '<br>Stop Name: ' + stopObj.name + '</div>' +
                                '</div>';
                        stopFeature.set('name', stopPopText);
                        mapService.vectorSource.addFeature(stopFeature);
                    }
                });
            });
        });
    }
    ;

    function socketConnection() {
        var isAuthenticated = false;
        socket.connectit();
        socket.once('connect_timeout', function () {
            $log.debug('socketConnection: connect_timeout');
        });
        socket.once('connect_error', function () {
            $log.debug('socketConnection: connect_error');
            isAuthenticated = false;
        });
        $log.debug('socket.isConnected = ' + socket.isConnected);
        if (!socket.isConnected)
        {
            $log.debug('socket.isConnected = ' + socket.isConnected);
            socket.on('connect', function () {
                $log.debug('socketConnection: on connect called');
                socket.isConnected = true;
                if (!isAuthenticated)
                {
                    Auth.$requireSignIn().then(function (fbuser) {
                        $log.debug('socketConnection: Auth.$requireSignIn() success');
                        var temp = JSON.parse(JSON.stringify(fbuser));
                        $http.defaults.headers.common['Authorization'] = 'Bearer ' + temp.stsTokenManager.accessToken;
                        socket.emit('authentication', {token: temp.stsTokenManager.accessToken});
                    }, function (error) {
                        $log.debug('Auth.$requireSignIn() error');
                    });
                }
            });
            socket.once('authenticated', function () {
                $log.debug('socketConnection: authenticated');
                isAuthenticated = true;
            });
            socket.once('unauthorized', function () {
                $log.debug('socketConnection:  unauthorized');
                isAuthenticated = false;
            });
            socket.on('trip', function (data) {
                $log.debug('socketConnection-trip: data = ' + JSON.stringify(data));
                if (mapService.busHash[data._id])
                {
                    if (data.location.time < mapService.busHash[data._id].lkt)
                    {
                        $log.debug('socketConnection-trip: socket time is older than bus last known time');
                        return;
                    }
                    if (!HandShakeService.hanshakeInProgress)
                    {
                        processtripsocketdata(data);
                    } else
                    {
                        var cleanUpFunc = $rootScope.$on('handshakefinished', function () {
                            processtripsocketdata(data);
                            cleanUpFunc();
                        });
                    }
                } else
                {
                    $log.debug('socketConnection-trip: device id not available in busHash - ' + data._id);
                }


            });
            socket.on('heartbeat', function (data) {
                $log.debug('socketConnection-heartbeat: data = ' + JSON.stringify(data));
                if (mapService.busHash[data._id])
                {
                    if (data.time < mapService.busHash[data._id].lkt)
                    {
                        $log.debug('socketConnection-heartbeat: socket time is older than bus lkt')
                        return;
                    }
                    if (!HandShakeService.hanshakeInProgress)
                    {
                        processHeartBeatsocketdata(data);
                    } else
                    {
                        var cleanUpFunc = $rootScope.$on('handshakefinished', function () {
                            processHeartBeatsocketdata(data);
                            cleanUpFunc();
                        });
                    }
                } else
                {
                    $log.debug('socketConnection-heartbeat: device id not available in busHash - ' + data._id);
                }


            });
            socket.on('v_activity', function (data) {
                $log.debug('socketConnection-v_activity: data = ' + JSON.stringify(data));
                if (mapService.busHash[data.fleet_id] != undefined)
                {
                    data.bus_number = mapService.busHash[data.fleet_id].bus_number;
                } else
                {
                    data.bus_number = '-';
                }
                //         ACTIVITY_GEOFENCE_IN    = 1,
                //         ACTIVITY_GEOFENCE_OUT   = 2,
                //         ACTIVITY_OVER_SPEED     = 3,
                //         ACTIVITY_IDLE           = 4,
                //         ACTIVITY_BATTERY        = 5,
                if(data.a_type == 1)
                {
                    data.desc = 'Vehicle ' + data.reg_no + ' entered ' + data.activity.name + ' at ' + UtilService.timeInMin(new Date(data.time))
                }
                else if(data.a_type == 2)
                {
                    data.desc = 'Vehicle ' + data.reg_no + ' exited ' + data.activity.name + ' at ' + UtilService.timeInMin(new Date(data.time))
                }
                else if(data.a_type == 3)
                {
                    data.desc = 'SPEED ALERT! Vehicle ' + data.reg_no + ' exceeded speed limit ' + ' at ' + UtilService.timeInMin(new Date(data.time))
                }
                else if(data.a_type == 4)
                {
                    data.desc = 'IDLE ALERT! Vehicle ' + data.reg_no + ' is idle ' + ' since ' + UtilService.timeInMin(new Date(data.time))
                }
                else if(data.a_type == 5)
                {
                    data.desc = 'BATTERY REMOVAL ALERT! Vehicle ' + data.reg_no + ' at ' + UtilService.timeInMin(new Date(data.time))
                }
                UtilService.createNotification(data);
            });
            socket.on('delay', function (data) {
                if (mapService.busHash[data._id] != undefined)
                {
                    data.bus_number = mapService.busHash[data._id].bus_number;
                } else
                {
                    data.bus_number = '-';
                }
                data.desc = 'Due to ' + data.reason + ', vehicle no ' + data.bus_number + ' will be late by ' + data.delay + ' minutes.';
                UtilService.createNotification(data);
            });
            socket.on('stop_exit', function (data) {
                $log.debug('socketConnection: stop_exit = ' + JSON.stringify(data));
                updateStopExitSocketData(data);
            });
            socket.on('end_trip', function (data) {
                $log.debug('socketConnection: end_trip ' + JSON.stringify(data));
                processEndTripSocketData(data);
            });
            socket.once('disconnect', function () {
                $log.debug('socketConnection: disconnect');
                socket.isConnected = false;
                isAuthenticated = false;
            });
            socket.on('idle_alert', function (data) {
                $log.debug('socketConnection: idle_alert = ' + JSON.stringify(data));
                processIdleAlertSocket(data);
            });
            socket.on('speed_alert', function (data) {
                $log.debug('socketConnection: speed_alert = ' + JSON.stringify(data));
                processSpeedAlertSocket(data);
            });
        }
    }
    ;
    function processIdleAlertSocket(data) {
        $log.debug('Inside processIdleAlertSocket');
        if (mapService.tripHash[data.trip_id])
        {
            data.bus_number = mapService.tripHash[data.trip_id].bus_number;
            var dateObject = new Date(data.stime);
            data.start_time = UtilService.timeInMin(dateObject);
            dateObject = new Date(data.etime);
            data.end_time = UtilService.timeInMin(dateObject);
            if (mapService.tripHash[data.trip_id].currstatus == 'Idle')
            {
                angular.forEach(mapService.tripHash[data.trip_id].idle_alert, function (currIdleObj) {
                    if (currIdleObj.end_time == 'Still idle')
                    {
                        currIdleObj.end_time = UtilService.timeInMin(new Date(data.etime));
                    }
                });
                var diff = data.etime - data.stime;
                data.desc = 'Vehicle No. ' + data.bus_number + ' started moving after' + UtilService.secondsToHm(diff / 1000);
                UtilService.createNotification(data);
            } else
            {

                var latlng = {lat: Number(data.lat), lng: Number(data.lon)};
                UtilService.getAddressForCoordinates(latlng).then(function (address) {
                    data.address = address;
                    mapService.tripHash[data.trip_id].idle_alert.push(data);
                    data.desc = 'Vehicle No. ' + data.bus_number + ' detected idle at ' + data.address;
                    UtilService.createNotification(data);
                    //$rootScope.$broadcast('socketUpdate');
                });
            }
        } else
        {
            console.log('processIdleAlertSocket trip_id = ' + data.trip_id)
            getTripDetails(data.trip_id);
        }

    }

    function getTripDetails(tripId)
    {
        var defer = $q.defer();
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/trip/detail/' + tripId);
        requestHandle.then(function (result) {
            if (result.success == true)
            {
                if (result.data != undefined && result.data != null && result.data != '')
                {
                    var tripObject = result.data;
                    beautifyTripObject(tripObject);
                    mapService.tripList.push(tripObject);
                    mapService.tripDevIdHash[tripObject.device_id] = tripObject;
                    mapService.tripHash[tripId] = tripObject;
                    updateTripDetailsInBus(mapService.busHash[tripObject.device_id], tripObject);
                    $rootScope.$broadcast('socketUpdate');
                    defer.resolve();
                }
            } else
            {
                defer.reject();
            }
        });
        return defer.promise;
    }

    function processSpeedAlertSocket(data) {
        $log.debug('Inside processSpeedAlertSocket');
        if (mapService.tripHash[data.trip_id])
        {
            if (mapService.busHash[data._id] != undefined)
            {
                data.bus_number = mapService.busHash[data._id].bus_number;
            } else
            {
                data.bus_number = '-';
                data.bus_number = mapService.tripHash[data.trip_id].bus_number;
            }
            var latlng = {lat: Number(data.lat), lng: Number(data.lon)};
            UtilService.getAddressForCoordinates(latlng).then(function (address) {
                data.address = address;
                var dataTime = new Date(data.time);
                data.time = UtilService.timeInMin(dataTime);
                mapService.tripHash[data.trip_id].speed_alert.push(data);
                data.desc = 'Overspeed! Vehicle No. ' + data.bus_number + ' is riding at ' + data.speed + ' Kmph' + ' near ' + data.address;
                UtilService.createNotification(data);
                $rootScope.$broadcast('socketUpdate');
            });
        } else
        {
            console.log('processSpeedAlertSocket trip_id = ' + data.trip_id)

            getTripDetails(data.trip_id);
        }

    }
    ;
    function updateStopExitSocketData(data) {
        if (mapService.tripHash[data.trip_id])
        {
            var iter = 0;
            var stuHash = [];
            for (iter = 0; iter < mapService.tripHash[data.trip_id].stud_list.length; iter++)
            {
                stuHash[mapService.tripHash[data.trip_id].stud_list[iter]] = mapService.tripHash[data.trip_id].stud_list[iter];
            }

            if (data.sStud_list != undefined && data.sStud_list.length > 0)
            {
                var iter = 0;
                for (iter = 0; iter < data.sStud_list.length; iter++)
                {
                    if (stuHash[data.sStud_list[iter]._id] != undefined)
                    {
                        if (mapService.tripHash[data.trip_id].trip_type == 'DROP')
                        {
                        } else
                        {
                            mapService.tripHash[data.trip_id].onBoard++;
                            if (data.sStud_list[iter].card == undefined || data.sStud_list[iter].card)
                                mapService.tripHash[data.trip_id].withCard++;
                        }
                        if (!mapService.tripHash[data.trip_id].stud_activity)
                        {
                            mapService.tripHash[data.trip_id].stud_activity = [];
                        }

                        mapService.tripHash[data.trip_id].stud_activity.push(data.sStud_list[iter]);
                    } else
                    {

                        if (mapService.tripHash[data.trip_id].trip_type == 'DROP')
                        {
                            mapService.tripHash[data.trip_id].onBoard--;
                            if (!mapService.tripHash[data.trip_id].stud_activity)
                            {
                                mapService.tripHash[data.trip_id].stud_activity = [];
                            }
                            mapService.tripHash[data.trip_id].stud_activity.push(data.sStud_list[iter]);
                        } else
                        {
                            $log.debug('updateStopExitSocketData: Stu ID doesnt exist');
                        }
                    }
                }
                $rootScope.$broadcast('socketUpdate');
            }
        } else
        {
            console.log('updateStopExitSocketData trip_id = ' + data.trip_id)

            getTripDetails(data.trip_id);
        }

    }
    ;
    function updateStudentInTripList(tripObject, socketTripData) {
        var iter = 0;
        var stuHash = [];
        for (iter = 0; iter < tripObject.stud_list.length; iter++)
        {
            stuHash[tripObject.stud_list[iter]._id] = tripObject.stud_list[iter];
        }

        if (socketTripData.sStud_list != undefined && socketTripData.sStud_list.length > 0)
        {
            var iter = 0;
            for (iter = 0; iter < socketTripData.sStud_list.length; iter++)
            {
                if (stuHash[socketTripData.sStud_list[iter]] != undefined)
                {
                    if (tripObject.trip_type == 'DROP')
                    {
                        stuHash[socketTripData.sStud_list[iter]].status = 1;
                        tripObject.onBoard--;
                    } else
                    {
                        stuHash[socketTripData.sStud_list[iter]].status = 1;
                        tripObject.onBoard++;
                        if (socketTripData.sStud_list[iter].card)
                        {
                            tripObject.withCard++;
                        }
                    }

                } else
                {
                    $log.debug('updateStudentInTripList: Stu ID doesnt exist');
                }
            }
            //$sessionStorage.tripDetails = JSON.stringify(mapService.tripList);
            $rootScope.$broadcast('socketUpdate');
        }
    }
    ;
    function processtripsocketdata(data) {
        $log.debug('Inside processtripsocketdata');


        mapService.busHash[data._id].lkt = data.location.time;
        mapService.busHash[data._id].c_loc = data.location;
        //mapService.busHash[data._id].last_updated_time = UtilService.timeInMin(new Date(data.location.time));
        if (!data.status)
        {
            if (mapService.busHash[data._id].status == constantService.notRespondingStatus)
            {
                resumeVehicle(data._id);
            } else
            {
                beautifyBus(mapService.busHash[data._id]);
            }
            updatesocketdata(data, false);
            return;
        }
        if (mapService.tripHash[data.trip_id])
        {
            if (mapService.busHash[data._id].status != data.status)
            {
                if (data.status == constantService.idleStatus)
                {
                    var latlng = {lat: data.location.lat, lng: data.location.lon};
                    UtilService.getAddressForCoordinates(latlng).then(function (address) {
                        data.address = address;
                        data.desc = 'Vehicle idle! Vehicle No. ' + mapService.tripHash[data.trip_id].bus_number + ' is idle at ' + address;
                        mapService.tripHash[data.trip_id].idle_alert.push(data);
                        data.bus_number = mapService.tripHash[data.trip_id].bus_number;
                        UtilService.createNotification(data);
                        $rootScope.$broadcast('socketUpdateWithChart');
                    });
                    
                }
            }
            mapService.busHash[data._id].status = data.status;
            beautifyBus(mapService.busHash[data._id]);
            updatesocketdata(data, false);
        } else if (data.trip_id)
        {

            {
            console.log('processtripsocketdata trip_id = ' + data.trip_id)

                getTripDetails(data.trip_id).then(function () {
                    processtripsocketdata(data);
                });
            }

        } else
        {
            mapService.busHash[data._id].status = data.status;
            beautifyBus(mapService.busHash[data._id]);
//            updatesocketdata(data, false);
        }

    }
    ;


    function startVehicleTrip(id)
    {

        mapService.busHash[id].status = constantService.movingStatus;
        mapService.busHash[id].start_time = UtilService.timeInMin(new Date());

        beautifyBus(mapService.busHash[id]);
        var vehicleMarker = mapService.markersHash[id];
        if (vehicleMarker)
        {
            var popUpContent = popupContent(mapService.busHash[id]);

            vehicleMarker.setIcon({
                url: UtilService.getVehicleIcon(mapService.busHash[id].v_type, 1) + "#" + id,
                anchor: new google.maps.Point(25, 25)
            });
            vehicleMarker.infoWindow.setContent(popUpContent);
        }
            console.log('startVehicleTrip trip_id = ' + mapService.busHash[id].trip_id +  ' ' + mapService.busHash[id]._id)


        getTripDetails(mapService.busHash[id].trip_id);
        $rootScope.$broadcast('socketUpdateWithChart');
    }

    function resumeVehicle(id)
    {

        mapService.busHash[id].status = constantService.movingStatus;
//        mapService.busHash[id].start_time = UtilService.timeInMin(new Date());

        beautifyBus(mapService.busHash[id]);
        var vehicleMarker = mapService.markersHash[id];
        if (vehicleMarker)
        {
            var popUpContent = popupContent(mapService.busHash[id]);
            vehicleMarker.setIcon({
                url: UtilService.getVehicleIcon(mapService.busHash[id].v_type, 1) + "#" + id,
                anchor: new google.maps.Point(25, 25)
            });
            vehicleMarker.infoWindow.setContent(popUpContent);
        }
//        getTripDetails(mapService.busHash[id].trip_id);
        $rootScope.$broadcast('socketUpdateWithChart');
    }

    function endVehicleTrip(id)
    {

        mapService.busHash[id].status = constantService.stoppedStatus;

        beautifyBus(mapService.busHash[id]);
        mapService.busHash[id].end_time = UtilService.timeInMin(new Date(mapService.busHash[id].lkt));
        mapService.busHash[id].start_time = '';
        mapService.busHash[id].route = '';
        mapService.busHash[id].trip_type = '';
        mapService.busHash[id].speed = '';

        var vehicleMarker = mapService.markersHash[id];
        if (vehicleMarker)
        {
            var popUpContent = popupContent(mapService.busHash[id]);
            vehicleMarker.setIcon({
                url: UtilService.getVehicleIcon(mapService.busHash[id].v_type, 0) + "#" + id,
                anchor: new google.maps.Point(25, 25)
            });
            vehicleMarker.infoWindow.setContent(popUpContent);
        }
        $rootScope.$broadcast('socketUpdateWithChart');
    }
    function processHeartBeatsocketdata(data)
    {

        $log.debug('Inside processHeartBeatsocketdata');

        var curr_time_sec = (new Date()).getTime();

        mapService.busHash[data._id].lkt = curr_time_sec;
        mapService.busHash[data._id].ac = data.ac;
        mapService.busHash[data._id].oil = data.oil;
        if (data.trip_id) {
            mapService.busHash[data._id].trip_id = data.trip_id;
        }
        
        if (mapService.busHash[data._id].status != data.status) {
            if(data.status == constantService.stoppedStatus) {
                mapService.busHash[data._id].lht = curr_time_sec;
                endVehicleTrip(data._id);
            } else if(!mapService.busHash[data._id].status && data.status == constantService.movingStatus) {
                mapService.busHash[data._id].lht = curr_time_sec;
                startVehicleTrip(data._id);
            } else {
                resumeVehicle(data._id);
            }
            mapService.busHash[data._id].status = data.status;
            $rootScope.$broadcast('socketUpdateWithChart');
        } else {
            mapService.busHash[data._id].status = data.status;
        }
        
        beautifyBus(mapService.busHash[data._id]);
        if (mapService.markersHash[data._id])
        {
            var popUpContent = popupContent(mapService.busHash[data._id]);
            mapService.markersHash[data._id].infoWindow.setContent(popUpContent);
        }
    }


    function processEndTripSocketData(data) {

        var EndTimeObject = new Date(data.end_time);
        mapService.busHash[data._id].last_updated_time = UtilService.timeInMin(EndTimeObject);
        mapService.busHash[data._id].lkt = data.end_time;
        updatesocketdata(data, true);
        return;
    }
    ;
    function updatesocketdata(data, isEnd) {
        if ($location.path() === '/' || $location.path().includes('maps'))
        {
            updateBusOnMap(data, isEnd);
        } else
        {
            if (isEnd)
            {
                mapService.busHash[data._id].status = 0;
                mapService.busHash[data._id].start_time = '';
                mapService.busHash[data._id].route = '';
                mapService.busHash[data._id].trip_type = '';
                mapService.busHash[data._id].speed = '';
            }
            $rootScope.$broadcast('socketUpdate');
        }
    }
    ;
    function beautifyTripObject(tripObject) {
        var startDateObject = '', endDateObject = '', dateObject = '', total_time = '', difference = 0;
        tripObject.distance = Number(tripObject.distance / 1000).toFixed(2);
        if (tripObject.bus_no)
            tripObject.bus_number = tripObject.bus_no;
        else
            tripObject.bus_number = 'Unknown';
        startDateObject = new Date(tripObject.start_time);
        if (tripObject.end_time)
        {
            endDateObject = new Date(tripObject.end_time);
        }

        if (startDateObject)
        {
            tripObject.start_time = UtilService.timeInMin(startDateObject);
            tripObject.start_time_org = startDateObject;
        }
        if (endDateObject)
        {
            tripObject.end_time = UtilService.timeInMin(endDateObject);
            tripObject.end_time_org = endDateObject;
            difference = endDateObject.getTime() - startDateObject.getTime();
        } else
        {
            difference = -1;
        }

        if (difference < 0)
        {
            tripObject.end_time = '-';
            total_time = '-';
        } else
        {
            total_time = UtilService.secondsToHm(difference / 1000);
            tripObject.active = false;
        }
        angular.forEach(tripObject.stud_list, function (stuObject) {
            var studentIdObj = stuObject.split("_");
            //dropTripStuList[studentIdObj[0]] = {card: studentIdObj[1]};
            if (!studentIdObj[1])
            {
                stuObject._id = studentIdObj[0];
                stuObject.card = false;
//                stuObject = {
//                    _id: studentIdObj[0],
//                    card: false
//                };
            } else
            {
                stuObject._id = studentIdObj[0];
                stuObject.card = studentIdObj[1];
            }

        });
        if (tripObject.stud_list)
        {
            tripObject.total_count = tripObject.stud_list.length;
            tripObject.total_time = total_time;
            if (tripObject.trip_type === 'PICKUP')
            {
                tripObject.onBoard = tripObject.stud_activity.length;
                tripObject.withCard = 0;
                angular.forEach(tripObject.stud_activity, function (studObj) {
                    if (studObj.card == undefined || studObj.card)
                    {
                        tripObject.withCard++;
                    }
                });
            } else
            {
                tripObject.onBoard = tripObject.total_count - tripObject.stud_activity.length;
                tripObject.withCard = 0;
                angular.forEach(tripObject.stud_activity, function (studObj) {
                    if (studObj.card == undefined || studObj.card)
                    {
                        tripObject.withCard++;
                    }
                });
            }

        }


        if (tripObject.last_known_location != undefined && tripObject.last_known_location != '' && tripObject.last_known_location != null)
        {
            tripObject.last_known_location.speed = Number(tripObject.last_known_location.speed).toFixed(0);
        }

        $log.debug('beautifyTripObject: tripObject.idle_alert.length =  ' + tripObject.idle_alert.length);
        if (tripObject.idle_alert.length > 0)
        {
            angular.forEach(tripObject.idle_alert, function (idleObject) {
                dateObject = new Date(idleObject.stime);
                //idleObject.start_time = dateObject.toLocaleTimeString();                
                idleObject.start_time = UtilService.timeInMin(dateObject);
                dateObject = new Date(idleObject.etime);
                idleObject.end_time = UtilService.timeInMin(dateObject);
                var latlng = {lat: idleObject.lat, lng: idleObject.lon};
                (function (coord) {
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({'location': coord}, function (results, status) {
                        if (status === 'OK') {
                            if (results[1]) {
                                //idleObject.desc = 'Bus idle! Bus No. ' + 'is standing at ' + results[1].formatted_address;
                                idleObject.address = results[1].formatted_address;
                            } else
                            {
                                //idleObject.desc = 'Bus idle! Bus No. ' + 'is not moving ';
                                idleObject.address = '';
                            }
                        } else
                        {
                            //idleObject.desc = 'Bus idle! Bus No. ' + 'is not moving ';
                            idleObject.address = '';
                        }
                    })
                })(latlng); //passing in variable to var here
            });
        }
        //idle_alert case handled
        if (tripObject.speed_alert.length > 0)
        {
            angular.forEach(tripObject.speed_alert, function (speedObject) {
                dateObject = new Date(speedObject.time);
                speedObject.strtime = UtilService.timeInMin(dateObject);
                speedObject.speed = Number(speedObject.speed).toFixed(0);
                var latlng = {lat: speedObject.lat, lng: speedObject.lon};
                (function (coord) {
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({'location': latlng}, function (results, status) {
                        if (status === 'OK') {
                            if (results[1]) {
                                speedObject.address = results[1].formatted_address;
                            } else
                            {
                                speedObject.address = '';
                            }
                        } else
                        {
                            speedObject.address = '';
                        }
                    });
                })(latlng);
            });
        }
        //speed_alert case handled

        mapService.tripHash[tripObject._id] = tripObject;
    }
    ;
    function beautifyBus(busObject)
    {
        if (busObject.lkt)
        {
            var lkt = new Date(busObject.lkt);
            var timeNow = new Date();
            if (busObject.status == 1 && ((timeNow.getTime() - lkt.getTime()) / 60000) > 1)
            {
                busObject.status = constantService.notRespondingStatus;
                $rootScope.$broadcast('socketUpdateWithChart');
            }
            busObject.last_updated_time = UtilService.timeInMin(lkt);
        } else if (busObject.c_loc && busObject.c_loc.time)
        {
            busObject.last_updated_time = UtilService.timeInMin(new Date(busObject.c_loc.time));
        } else
        {
            busObject.last_updated_time = 'Not Available';
        }

        if(busObject.lht && busObject.lht != '' && busObject.lht != undefined) {
            busObject.last_activity_time = UtilService.timeInMin(new Date(busObject.lht));
        }
        else if(busObject.status &&  mapService.tripHash[busObject.trip_id]) {
            busObject.last_activity_time = mapService.tripHash[busObject.trip_id].start_time;
        }
        else {
            busObject.last_activity_time = busObject.last_updated_time;
        }

        if (busObject.c_loc)
        {
            busObject.speed = Number(busObject.c_loc.speed).toFixed(0);
        }
        switch (busObject.status) {
            case 0:
                busObject.viewableStatus = 'Stopped';
                break;
            case 1:
                busObject.viewableStatus = 'Moving';
                break;
            case 2:
                busObject.viewableStatus = 'Idle';
                break;
            case 3:
                busObject.viewableStatus = 'Not Responding';
                break;
            default:
                busObject.viewableStatus = '-';
        }

    }

    function updateTripDetailsInBus(busObject, tripObject) {
        busObject.route_name = tripObject.route_name;
        busObject.trip_type = tripObject.trip_type;
        busObject.start_time = tripObject.start_time;
        if (tripObject.end_time)
            busObject.end_time = tripObject.end_time;
        else
            busObject.end_time = '-';
        busObject.trip_id = tripObject._id;
        busObject.status = 1;
        if (tripObject.last_known_location != undefined && tripObject.last_known_location != '' && tripObject.last_known_location != null)
        {
            busObject.c_loc.lon = tripObject.last_known_location.lon;
            busObject.c_loc.lat = tripObject.last_known_location.lat;
        }
        beautifyBus(busObject);
        busObject.address = "-";
        //busObject.status = 3;
    }
    ;
    function updateBusLists() {
        $log.debug('updateBusLists called');
        //mapService.tripList = angular.fromJson($sessionStorage.tripDetails);
        //mapService.busList = angular.fromJson($sessionStorage.busList);

        mapService.busList = busService.busList;
        mapService.tripList = busService.tripList;
        angular.forEach(mapService.busList, function (busObject) {
            beautifyBus(busObject);
            mapService.busHash[busObject._id] = busObject;
        });
        angular.forEach(mapService.tripList, function (tripObject) {
            mapService.tripHash[tripObject._id] = tripObject;
            mapService.tripDevIdHash[tripObject.device_id] = tripObject;
            beautifyTripObject(tripObject);
        });
        if (mapService.busList.length == 0)
        {
            $log.debug('updateBusLists: busList count 0, No bus assigned.');
        }

        if (mapService.busList.length > 0)
        {
            angular.forEach(mapService.busList, function (busObject) {
                if (busObject.status === 0)
                {
                    if (busObject.c_loc != null || busObject.c_loc != undefined)
                    {
//                        busObject.last_known_location = {lon: '', lat: ''};
//                        busObject.last_known_location.lon = busObject.c_loc.lon;
//                        busObject.last_known_location.lat = busObject.c_loc.lat;
                        busObject.start_time = '';
                        busObject.end_time = '';
                    }
                } else if (busObject.trip_id) {
                    var tripObject = mapService.tripHash[busObject.trip_id];
                    if (tripObject == undefined || tripObject == null || tripObject == '')
                    {
                        $log.debug('updateBusLists:  Vehicle number - ' + busObject.bus_number + ' device_id - ' + busObject._id +
                                ' trip id - ' + busObject.trip_id +
                                ' trip details not available, getting it from server.');
            console.log('updateBusLists trip_id = ' + busObject.trip_id)

                        getTripDetails(busObject.trip_id);
                    } else {
                        $log.debug('updateBusLists: Vehicle number - ' + busObject.bus_number + ' device_id - ' + busObject._id +
                                ' status - ' + busObject.status + 'i.e. trip is on and we have the trip details');
                        updateTripDetailsInBus(busObject, tripObject)
                    }
                }
            });
        }
        // $timeout(function () {
        //     //mapService.mapInit();
        // });

        $rootScope.$broadcast('socketUpdateWithChart');
        mapService.refreshBusStatus_10 = $interval(function () {
            angular.forEach(mapService.busList, function (busObject) {
                beautifyBus(busObject);
            });
        }, 3 * 60 * 1000);
        return;
    }
    ;

    function updateBusOnMap(data, isEnd) {
        if (!mapService.IsMapInitialized)
        {
            mapService.mapInit();
        }
        var lat, lon;
        if (isEnd)
        {
            lat = (data.loc.lat);
            lon = (data.loc.lon);
            data.time = data.end_time;
        } else
        {
            lat = (data.location.lat);
            lon = (data.location.lon);
            data.time = data.location.time;

        }

        var vehicleMarker = mapService.markersHash[data._id];
        if (vehicleMarker)
        {
            var destinationCoord = {lat: lat, lon: lon};
            var moveObj = {
                _id: data._id,
                destinationCoord: destinationCoord,
                isEnd: false
            };
            if (isEnd)
                moveObj.isEnd = true;
//            if (mapService.busHash[data._id].status != 0)

            vehicleMarker.status = mapService.busHash[data._id].status;
            var markerMoveSpeed = 10;
            UtilService.moveMarker(vehicleMarker, destinationCoord, markerMoveSpeed);
            var popUpContent = popupContent(mapService.busHash[data._id]);
            vehicleMarker.infoWindow.setContent(popUpContent);
            return;
            //mapService.moveVehicleSmoothly(moveObj);
            var trip_id = vehicleMarker.trip_id;
            var last_update_time = vehicleMarker.lkt;


            if (last_update_time != undefined && data.time < last_update_time)
            {
                return;
            }
            vehicleMarker.lkt = data.time;

            var popUpContent = UtilService.popupContent(mapService.busHash[data._id]);
            var compiled = $compile(popUpContent)($scope);
            vehicleMarker.infoWindow.setContent(popUpContent);
            if (trip_id === data.trip_id)
            {
                vehicleMarker.speed = mapService.busHash[data._id].speed;
            } else
            {
                vehicleMarker.trip_id = mapService.busHash[data._id].trip_id;
            }
        }
    }
    ;

    function updateBusOnMap1(data, isEnd) {
        if (!mapService.IsMapInitialized)
        {
            mapService.mapInit();
        }
        var lat, lon;
        if (isEnd)
        {
            lat = (data.loc.lat);
            lon = (data.loc.lon);
            data.time = data.end_time;
        } else
        {
            lat = (data.location.lat);
            lon = (data.location.lon);
            data.time = data.location.time;

        }

        var feature = mapService.vectorSource.getFeatureById(data._id);
        if (feature != null)
        {
            var moveObj = {
                feature: feature,
                destinationCoord: {lat: lat, lon: lon},
                isEnd: false
            };
            if (isEnd)
                moveObj.isEnd = true;
            if (mapService.busHash[data._id].status != 0)
                mapService.movingAnimation(moveObj);
            var trip_id = feature.get('trip_id');
            var last_update_time = feature.get('lkt');


            if (last_update_time != undefined && data.time < last_update_time)
            {
                return;
            }

            feature.set('lkt', data.time);
            var popUpContent = popupContent(mapService.busHash[data._id]);
            feature.set('name', popUpContent);
            if (trip_id === data.trip_id)
            {
                feature.set('speed', mapService.busHash[data._id].speed);
            } else
            {
                feature.set('trip_id', data.trip_id);
            }
        }
    }
    ;
    function setZoomAccToVector() {

        var bounds = new google.maps.LatLngBounds();
        angular.forEach(mapService.markersHash, function (marker) {
            bounds.extend(marker.getPosition());
        });
        bounds.extend(mapService.markersHash['school'].getPosition());
        mapService.map.fitBounds(bounds);
        return;

        if ($location.path() === '/')
        {
            var extent = mapService.vectorSource.getExtent();
            $log.debug('extent = ' + extent + 'mapService.map.getSize() = ' + mapService.map.getSize());
            if (mapService.map.getSize() !== undefined)
            {
                mapService.map.getView().fit(extent, mapService.map.getSize());
            }
        }
        mapService.map.updateSize();
    };

    function moveVehicleSmoothly(moveObj) {
        var vehicleMarker = mapService.markersHash[moveObj._id];
        var id = moveObj._id
        var endCoord = moveObj.destinationCoord;
        var currentCoord = vehicleMarker.getPosition();

        var startCoord = {
            lat: currentCoord.lat(),
            lng: currentCoord.lng()
        };
        var rotation, start, end, generator, line, coords, linestring, coords3857;
        vehicleMarker.setIcon({
            url: UtilService.getVehicleIcon(mapService.busHash[id].v_type, mapService.busHash[id].status) + "#" + id,
            anchor: new google.maps.Point(25, 25)
        });

        if (!moveObj.isEnd && (startCoord.lng == endCoord.lng || startCoord.lat == endCoord.lat))
        {
            return;
        }
        start = {x: startCoord.lng, y: startCoord.lat};
        end = {x: endCoord.lng, y: endCoord.lat};
        if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y))
        {
            $log.debug('moveVehicleSmoothly: NAn-- Number(endCoord.lon) = ' + Number(endCoord.lng) + ' Number(endCoord.lat) = ' + Number(endCoord.lat));
            feature.set('geometry', new ol.geom.Point(ol.proj.transform([Number(endCoord.lng), Number(endCoord.lat)], 'EPSG:4326', 'EPSG:3857')));
            return;
        }
        generator = new arc.GreatCircle(start, end);
        line = generator.Arc(50, {offset: 0}); // 99 to 50
        line = line.json();
        coords = line.geometry.coordinates;

        var animObj = {
            _id: moveObj._id,
            coords_interval: coords,
            anim_index: 0,
            isEnd: moveObj.isEnd
        };
        var dis = getDistanceFromLatLonInKm(startCoord.lat, startCoord.lng, endCoord.lat, endCoord.lng);
        if (!moveObj.isEnd && dis * 1000 < 2)
        {
            return;
        }
        if (!moveObj.isEnd && dis * 1000 > 150 && false)
        {
            $log.debug('moveVehicleSmoothly: Setting ');
            return;
        }
        rotation = Math.atan2(endCoord.lat - startCoord.lat, endCoord.lng - startCoord.lng);
        rotation = 90 - rotation * (180 / Math.PI)
        var iconpath = vehicleMarker.getIcon();

        var rotate = rotation;

        $('img[src="${iconpath.url}"]').css(
                {'-webkit-transform': 'rotate(' + rotate + 'deg)',
                    '-moz-transform': 'rotate(' + rotate + 'deg)',
                    '-ms-transform': 'rotate(' + rotate + 'deg)',
                    'transform': 'rotate(' + rotate + 'deg)'});

        browserAnimation.addRendererDash(mapService.animateBusMove, animObj, 10);
        mapService.setZoomAccToVector();
    }
    ;

    function movingAnimation1(moveObj) {
        var feature = moveObj.feature;
        var id = feature.getId();
        var endCoord = moveObj.destinationCoord;
        var currentCoord = feature.getGeometry().getCoordinates();
        var lonlat = ol.proj.transform(currentCoord, 'EPSG:3857', 'EPSG:4326');
        var startCoord = {
            lon: lonlat[0],
            lat: lonlat[1]
        };
        var rotation, start, end, generator, line, coords, linestring, coords3857;
        var iconStyle = UtilService.getMarkerIconStyle(UtilService.getVehicleIcon(mapService.busHash[id].v_type, 1),
                constantService.defaultIconScale,
                constantService.defaultIconRotation,
                mapService.busHash[id].bus_number.toString());
        feature.setStyle(iconStyle);
        if (!moveObj.isEnd && (startCoord.lon == endCoord.lon || startCoord.lat == endCoord.lat))
        {
            return;
        }
        start = {x: startCoord.lon, y: startCoord.lat};
        end = {x: endCoord.lon, y: endCoord.lat};
        if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y))
        {
            $log.debug('movingAnimation: NAn-- Number(endCoord.lon) = ' + Number(endCoord.lon) + ' Number(endCoord.lat) = ' + Number(endCoord.lat));
            feature.set('geometry', new ol.geom.Point(ol.proj.transform([Number(endCoord.lon), Number(endCoord.lat)], 'EPSG:4326', 'EPSG:3857')));
            return;
        }
        generator = new arc.GreatCircle(start, end);
        line = generator.Arc(50, {offset: 0}); // 99 to 50
        line = line.json();
        coords = line.geometry.coordinates;
        linestring = new ol.geom.LineString(coords);
        linestring.transform('EPSG:4326', 'EPSG:3857');
        coords3857 = linestring.getCoordinates();
//        $scope.coords_interval = coords3857;

        var animObj = {
            feature: feature,
            coords_interval: coords3857,
            anim_index: 0,
            isEnd: moveObj.isEnd
        };
        var dis = getDistanceFromLatLonInKm(startCoord.lat, startCoord.lon, endCoord.lat, endCoord.lon);
        if (!moveObj.isEnd && dis * 1000 < 2)
        {
            return;
        }
        if (!moveObj.isEnd && dis * 1000 > 150)
        {
            $log.debug('movingAnimation: Setting ');
            feature.set('geometry', new ol.geom.Point(ol.proj.transform([Number(endCoord.lon), Number(endCoord.lat)], 'EPSG:4326', 'EPSG:3857')));
            return;
        }
        rotation = Math.atan2(endCoord.lat - startCoord.lat, endCoord.lon - startCoord.lon);
        rotation = 90 * Math.PI / 180 - rotation;
        var iconStyle = UtilService.getMarkerIconStyle(UtilService.getVehicleIcon(mapService.busHash[id].v_type, 1),
                constantService.defaultIconScale,
                rotation,
                mapService.busHash[id].bus_number.toString()
                );
        feature.setStyle(iconStyle);
        browserAnimation.addRendererDash(mapService.animateBusMove, animObj, 10);
    }
    ;

    function animateBusMove(animObj) {

        var nextPoint = animObj.coords_interval[animObj.anim_index];
        if (nextPoint)
        {
            mapService.markersHash[animObj._id].setPosition({lat: Number(nextPoint[1]), lng: Number(nextPoint[0])});
//            animObj.feature.set('geometry', nextPoint);
        }

        animObj.anim_index++;
        if (animObj.anim_index >= animObj.coords_interval.length)
        {
            browserAnimation.removeRenderer(animateBusMove);
            animObj.anim_index = 0;
            if (animObj.isEnd)
                endTrip(animObj._id);
        }
    }
    ;
    function animateBusMove1(animObj) {

        var nextPoint = new ol.geom.Point(animObj.coords_interval[animObj.anim_index]);
        if (nextPoint.A)
        {
            animObj.feature.set('geometry', nextPoint);
        }

        animObj.anim_index++;
        if (animObj.anim_index >= animObj.coords_interval.length)
        {
            browserAnimation.removeRenderer(animateBusMove);
            animObj.anim_index = 0;
            if (animObj.isEnd)
                endTrip(animObj.feature);
        }
    }
    ;

    function endTrip(_id) {
        var id = _id;
        var vehicleMarker = mapService.markersHash[_id];

        var iconStyle = UtilService.getMarkerIconStyle(constantService.stoppedBusIcon,
                constantService.defaultIconScale,
                constantService.defaultIconRotation,
                mapService.busHash[id].bus_number.toString()
                );
        var start_time = vehicleMarker.start_time;
        start_time = start_time.toLocaleString();
//        vehicleMarker.setIcon();
        vehicleMarker.setIcon({
            url: constantService.stoppedBusIcon + "#" + id,
            anchor: new google.maps.Point(25, 25)
        });
//        feature.setStyle(iconStyle);
        var dateObject = new Date();
        var end_time = dateObject.toLocaleTimeString();
        vehicleMarkers.end_time = end_time

        mapService.busHash[id].status = 0;
        mapService.busHash[id].start_time = '';
        mapService.busHash[id].route = '';
        mapService.busHash[id].trip_type = '';
        mapService.busHash[id].speed = '';
        var popUpContent = popupContent(mapService.busHash[id]);
        vehicleMarkers.infoWindow.setContent(popUpContent);
        vehicleMarkers.lkt = new Date();
//        feature.set('name', popUpContent);
//        feature.set('lkt', new Date());


    }
    ;


    function endTrip1(feature) {
        var id = feature.getId();

        var iconStyle = UtilService.getMarkerIconStyle(constantService.stoppedBusIcon,
                constantService.defaultIconScale,
                constantService.defaultIconRotation,
                mapService.busHash[id].bus_number.toString()
                );
        var start_time = feature.get('start_time');
        start_time = start_time.toLocaleString();
        feature.setStyle(iconStyle);
        var dateObject = new Date();
        var end_time = dateObject.toLocaleTimeString();
        feature.set('end_time', end_time);

        mapService.busHash[id].status = 0;
        mapService.busHash[id].start_time = '';
        mapService.busHash[id].route = '';
        mapService.busHash[id].trip_type = '';
        mapService.busHash[id].speed = '';
        var popUpContent = popupContent(mapService.busHash[id]);
        feature.set('name', popUpContent);
        feature.set('lkt', new Date());


    }
    ;
    function popupContent(object)
    {
        var content = '<div class="map-popup" >';
        if (object.bus_number)
        {
            content += '<b>Vehicle: </b> ' + object.reg_no + '<br>';
        }
        if (object.route_name && object.status)
        {
            content += '<b>Route: </b> ' + object.route_name + '<br>';
        }
        if (object.trip_type && object.status && $rootScope.category == $rootScope.categoryLabel.schoolWithRFID)
        {
            content += '<b>Trip: </b> ' + object.trip_type + '<br>';
        }
        if (object.start_time && object.status)
        {
            content += '<b>Start time: </b> ' + object.start_time + '<br>';
        }
        if (object.speed && object.status)
        {
            content += '<b>Speed: </b> ' + object.speed + '<br>';
        }
        if (object.last_updated_time)
        {
            content += '<b>Last updated: </b> ' + object.last_updated_time + '<br>';
        }
        content += '<a ng-click="address('+ object._id + ')"><b>Address</b></a><br> ';
        content += '<a ng-click="history('+ object.bus_number + ')"><b>See History</b></a> ';

//        if (object.ac)
//        {
//            content += '<b>AC: </b> ' + object.ac + '<br>';
//        }
//                if (object.oil)
//                {
//                    content += '<b>Oil: </b> ' + object.oil + '<br>';
//                }
        content += '</div>';
        return content;
    }
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
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
    
    

});