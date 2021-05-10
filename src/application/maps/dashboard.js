app.controller('MapController', function ($rootScope, $scope, mapService, $log, UtilService, constantService, $timeout, $routeParams, $compile, $location) {
    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $log.debug('MapController called');
    mapService.mapInit();
    var addBusOnMap = addBusOnMap;
    var busIndex = 0;
    var busBufferIndex = 0;
    $log.debug('mapService.busList length = ' + mapService.busList.length);

    angular.forEach(mapService.busList, function (busObject) {
        addBusOnMap(busObject);
    });
    function addBusOnMap(markerObject) {
        $log.debug('addBusOn Map bus_number = ' + markerObject.bus_number);
        if (markerObject.c_loc != null)
        {
            var busImage = UtilService.getVehicleIcon(markerObject.v_type, markerObject.status);
            //constantService.runningBusIcon;
            var lat = Number(markerObject.c_loc.lat);
            var lon = Number(markerObject.c_loc.lon);
            var popUpContent = '';
            var trip_id = '';
            if (markerObject.trip_id)
                trip_id = markerObject.trip_id;
            var vehicleMarker = new google.maps.Marker({
                position: {lat: Number(markerObject.c_loc.lat), lng: Number(markerObject.c_loc.lon)},
                map: mapService.map,
                icon: {
                    url: busImage + "#" + markerObject._id,
                    anchor: new google.maps.Point(25, 25)
                },
                //draggable: true,
                trip_id: trip_id,
                id: markerObject._id,
                trip_type: '',
                v_type: markerObject.v_type,
                lkt: '',
                infoWindow: {
                },
                optimized: false
            }
            );
            mapService.markersHash[markerObject._id] = vehicleMarker;
            var dateObject = new Date(markerObject.start_time);
            var start_time = '';
            var end_time = '';
            $log.debug('trip_id = ' + markerObject.trip_id + ' markerObject.start_time = ' + markerObject.start_time);
            start_time = UtilService.timeInMin(dateObject);
            if (start_time == 'Invalid Date')
            {
                start_time = markerObject.start_time;
            }

            $log.debug('start_time = ' + start_time);
            if (markerObject.status !== constantService.stoppedStatus) {
                if (markerObject.status == constantService.notRespondingStatus) {
                   busImage = constantService.notRespondingBusIcon;
                }
                popUpContent = mapService.popupContent(markerObject);
            } else {
                dateObject = new Date(markerObject.end_time);
                $log.debug('start_time = ' + start_time + 'end_time = ' + markerObject.end_time);
                popUpContent = mapService.popupContent(markerObject);
            }
            $log.debug(' bus_number = ' + markerObject.bus_number);
            var compiled = $compile(popUpContent)($scope);
            var infoWindow = new google.maps.InfoWindow({
                content: compiled[0]
            });
            vehicleMarker.addListener('click', function () {
                var popUpContent = mapService.popupContent(mapService.busHash[vehicleMarker.id]);
                //                var infoWindow = new google.maps.InfoWindow({
                //                    content: ($compile(popUpContent)($scope))[0]
                //                });
                vehicleMarker.infoWindow.setContent(($compile(popUpContent)($scope))[0]);
                infoWindow.open(mapService.map, vehicleMarker);
            });

            mapService.map.addListener('click', function () {
                infoWindow.close(mapService.map, vehicleMarker);
            });
            vehicleMarker.infoWindow = infoWindow;
        }
        busIndex++;
        if (busIndex == mapService.busList.length)
        {
            mapService.setZoomAccToVector();
            angular.forEach(mapService.busList, function (busObject) {
                busBufferIndex++;
                if (mapService.bufferList[busObject._id] != undefined && mapService.bufferList[busObject._id] != '')
                {
                    $log.debug('reading buffer data');
                    if (mapService.bufferList[busObject._id].socketTypeEnd === true)
                    {
                        mapService.endTrip(mapService.bufferList[busObject._id], 1);
                        mapService.bufferList[busObject._id] = '';
                    } else
                    {
                        mapService.updateBusOnMap(mapService.bufferList[busObject._id]);
                    }
                }
                if (busBufferIndex == mapService.busList.length)
                {
                    mapService.bufferList = [];
                }

            });
        }
    }
    ;

    $scope.address = function (id) {
        var busObject = mapService.busHash[id];
        var geoAddress = '';
        var latlng = {lat: Number(busObject.c_loc.lat), lng: Number(busObject.c_loc.lon)};
        UtilService.getAddressForCoordinates(latlng).then(function (address) {
            geoAddress = address;
            var vehicleMarker = mapService.markersHash[id];
            if (vehicleMarker)
            {
                var popUpContent = UtilService.popupContent(mapService.busHash[id]);
                popUpContent += geoAddress;
                //var compiled = $compile(popUpContent)($scope);

                vehicleMarker.infoWindow.setContent(popUpContent);
            }
        });
    };

    $scope.history = function (id) {
        $location.path('/reports/:'+id);
    };

    $timeout(function () {
        google.maps.event.trigger(mapService.map, "resize");
        mapService.setZoomAccToVector();
        if ($routeParams.deviceId)
        {
            $scope.deviceId = ($routeParams.deviceId).toString();
            if ($scope.deviceId.substring(0, 1) === ':') {
                $scope.deviceId = $scope.deviceId.substring(1);
            }
            mapService.map.setCenter(new google.maps.LatLng(mapService.busHash[$scope.deviceId].c_loc.lat, mapService.busHash[$scope.deviceId].c_loc.lon));
            mapService.map.setZoom(15);
            var vehicleMarker = mapService.markersHash[$scope.deviceId];
            if (vehicleMarker)
                vehicleMarker.infoWindow.open(mapService.map, vehicleMarker);
        }
        if(!mapService.busList.length) {
            mapService.map.setZoom(15);
        }

        // google.maps.event.addDomListener(outer, 'click', function() {
        //   map.setCenter(chicago)
        //   alert(2);
        // });
        $scope.$apply();
    });
});