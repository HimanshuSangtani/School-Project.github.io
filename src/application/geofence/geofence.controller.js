/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

app.controller('geofenceController', function ($scope, $location, $rootScope, constantService, $sessionStorage, HttpService, $log, FlashService, $routeParams, UtilService, geofenceService) {
    $scope.geofenceList = [];
    $scope.configGeofence = {
        name: '',
        type: 'Circle',
        geopoints: []
    };
    
    UtilService.setSidebar();
    var postGeofenceList = postGeofenceList;
    var showGeofenceOnGoogleMap = showGeofenceOnGoogleMap;

    if (geofenceService.geofenceList.length)
    {
        $scope.geofenceList = geofenceService.geofenceList;
        postGeofenceList();
    } else
    {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/geofence');
        requestHandle.then(function (result) {
            if (result.success)
            {
                $rootScope.mypageloading = false;
                angular.forEach($scope.geofenceList, function (geofence) {
                    if (geofence.type == 'circle') {
                        geofence.type = 'Circle';
                    } else if(geofence.type == 'polygon') {
                        geofence.type = 'Polygon';
                    } 
                })
                $scope.geofenceList = result.data;
                geofenceService.geofenceList = $scope.geofenceList;
                $log.debug('$scope.geofenceList = ' + JSON.stringify($scope.geofenceList));
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
            postGeofenceList();
        });
    }

    function postGeofenceList() {
        if ($routeParams.geofenceId)
        {
            if ($scope.geofenceList == [])
                $location.path('/geofence')
            else
            {
                $scope.geofenceId = ($routeParams.geofenceId).toString();
                if ($scope.geofenceId.substring(0, 1) === ':') {
                    $scope.geofenceId = $scope.geofenceId.substring(1);
                }
                angular.forEach($scope.geofenceList, function (geofenceObj) {
                    if (geofenceObj._id == $scope.geofenceId)
                    {
                        $scope.configGeofence = geofenceObj;
                    }
                });
                showGeofenceOnGoogleMap();
            }

        }
    }
    ;

    function showGeofenceOnGoogleMap() {
        var profileInfo = angular.fromJson($sessionStorage.profileInfo);
        var  map = new google.maps.Map(document.getElementById("geofenceViewMap"), {
            center: { lat: Number(profileInfo.loc.lat), lng: Number(profileInfo.loc.lon) },
            zoom: 12,
          });

        if ($scope.configGeofence.type == 'circle') { 
            const cityCircle = new google.maps.Circle({
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              map: map,
              center: { lat: $scope.configGeofence.geopoints[0].center.latitude,
               lng: $scope.configGeofence.geopoints[0].center.longitude },
              radius: $scope.configGeofence.geopoints[0].radius,
            });
        } else if($scope.configGeofence.type == 'polygon') {
            var polyCoordinates = [];
            for(var i=0; i< $scope.configGeofence.geopoints.length; i++) {
                polyCoordinates.push({ lat: $scope.configGeofence.geopoints[i].latitude, 
                    lng: $scope.configGeofence.geopoints[i].longitude })
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

        } else if($scope.configGeofence.type == 'marker') {
            new google.maps.Marker({
                position: { lat: $scope.configGeofence.geopoints[0].latitude, 
                        lng: $scope.configGeofence.geopoints[0].longitude },
                label: $scope.configGeofence.name,
                map: map,
            });
        }
    }


    function showGeofenceOnMap() {
        var vectorSource = new ol.source.Vector({wrapX: false});
        var profileInfo = angular.fromJson($sessionStorage.profileInfo);
        var center = ol.proj.transform([Number(profileInfo.loc.lon), Number(profileInfo.loc.lat)], 'EPSG:4326', 'EPSG:3857');
        var map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                new ol.layer.Vector({
                    source: vectorSource
                })
            ],
            target: 'geofenceViewMap',
            view: new ol.View({
                center: center,
                zoom: 13,
                maxZoom: 18,
                minZoom: 4
            })
        });

        var feature = new ol.Feature({
            type: constantService.showPopuponClickorHover,
            geometry: new ol.geom.Point(center)
        });
        var iconStyle = UtilService.getMarkerIconStyle(constantService.schoolIcon,
                constantService.defaultIconScale,
                constantService.defaultIconRotation);
        var schoolPopText = '<div class="map-popup" >' + '<b>' + profileInfo.name + '</b><br>' + '</div>';
        feature.setStyle(iconStyle);
        feature.set('name', schoolPopText);
        vectorSource.addFeature(feature);

        var thing = {};
        if ($scope.configGeofence.type == 'circle')
        {
            thing = new ol.geom.Circle(ol.proj.transform([$scope.configGeofence.geopoints[0].center.longitude, $scope.configGeofence.geopoints[0].center.latitude], 'EPSG:4326', 'EPSG:3857'),
                    $scope.configGeofence.geopoints[0].radius);

//            var CircleFeature = new ol.Feature(thing);
        } else
        {
            var geopoints = []
            angular.forEach($scope.configGeofence.geopoints, function (geopoint) {
                geopoints.push(ol.proj.transform([Number(geopoint.longitude), Number(geopoint.latitude)], 'EPSG:4326', 'EPSG:3857'));
            });

            thing = new ol.geom.Polygon([geopoints]);
        }

        var featurething = new ol.Feature({
            geometry: thing
        });
        vectorSource.addFeature(featurething);

        map.on('click', function (evt) {
            var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            var lon = lonlat[0];
            var lat = lonlat[1];
            var c = {
                lon: lon,
                lat: lat,
                speed: 13,
                time: 1499105097000
            }

        });
    }
    ;

    $scope.openAddGeofencePanel = function () {
        $location.path('/geofenceadd');
    };

    $scope.openGeofenceView = function (geofenceId)
    {
        $location.path('/geofence/:' + geofenceId);
    }

    $scope.closeView = function () {
        $location.path('/geofence');
    };
    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "GeofenceList.pdf");
          });
        
    }

//    $scope.$on('$destroy', function () {
//        alert("In destroy of:");
//    });




//    http://localhost:5000/customer/geofence/

    $scope.deleteGeofence = function ($index) {
        $log.debug('deleteGeofence' + ' ' + $index);
        var confirmit = confirm('Are you sure you want to delete Geofence ' + $scope.geofenceList[$index].name);

        if (confirmit)
        {
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/geofence/' + $scope.geofenceList[$index]._id);
            requestHandle.then(function (result) {
                if (result.success == true)
                {
                    $scope.geofenceList.splice($index, 1);
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


    }
});


