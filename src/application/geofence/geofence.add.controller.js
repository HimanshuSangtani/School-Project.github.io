/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

app.controller('geofenceAddController', function ($scope, $location, HttpService, $rootScope, $sessionStorage, constantService, UtilService, geofenceService, FlashService) {
    $scope.geofenceList = [];
    $scope.configGeofence = {
        name: '',
        type: 'Circle',
        geopoints: []
    };
    UtilService.setSidebar();
    $scope.isShapeProper = false;
    FlashService.Error('');

    var profileInfo = angular.fromJson($sessionStorage.profileInfo);
    var  map = new google.maps.Map(document.getElementById("map2"), {
        center: { lat: Number(profileInfo.loc.lat), lng: Number(profileInfo.loc.lon) },
        zoom: 10,
        mapTypeId: 'satellite'
      });

  

    
const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.CIRCLE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        // google.maps.drawing.OverlayType.POLYLINE,
        // google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      icon:
        "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 1,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
  var radius = circle.getRadius();
});

google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
$scope.configGeofence.geopoints = [];
$scope.isShapeProper = true;
  if (event.type == 'circle') {
    var radius = event.overlay.getRadius();
    var center = event.overlay.getCenter();
    $scope.configGeofence.type = 'circle';
    $scope.configGeofence.geopoints.push({
        "radius" : radius,
        "center": {
            "longitude": center.lng(),
            "latitude": center.lat()
        }
    })
  } else if (event.type == 'polygon') {

    var vertices  = event.overlay.getPath();
    for (var i = 0; i < vertices.getLength(); i++) {
        const xy = vertices.getAt(i);
        console.log(xy.lat()+ ' ' + xy.lng())
        var geofencePoint = {
            "longitude": xy.lng(),
            "latitude": xy.lat()
        };
        $scope.configGeofence.geopoints.push(geofencePoint);
    }
    $scope.configGeofence.type = 'polygon';
  } else if (event.type == 'marker') {
    $scope.configGeofence.type = 'marker';
    const xy = event.overlay.getPosition();
    var geofencePoint = {
        "longitude": xy.lng(),
        "latitude": xy.lat()
    };
    $scope.configGeofence.geopoints.push(geofencePoint);
  }
});

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
        target: 'routeViewMap1',
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


    var draw; // global so we can remove it later
    function addInteraction() {
        var value = $scope.configGeofence.type;
//        var value = 'Polygon';

        if (value !== 'None') {
            draw = new ol.interaction.Draw({
                source: vectorSource,
                type: /** @type {ol.geom.GeometryType} */ (value)
            });

            draw.on('drawstart', function (evt) {
                vectorSource.clear();
                $scope.isShapeProper = false;
                $scope.$apply();

            });

            draw.on('drawend', function (evt) {
                var geometry = evt.feature.getGeometry();
                if (geometry.getType() == 'Polygon')
                {
                    var geofencePoints = geometry.getCoordinates();
                    $scope.configGeofence.geopoints = [];
                    for (var index = 0; index < geofencePoints[0].length; index++)
                    {
                        var lonlat = ol.proj.transform(geofencePoints[0][index], 'EPSG:3857', 'EPSG:4326');
                        var lon = lonlat[0];
                        var lat = lonlat[1];
                        var geofencePoint = {
                            "longitude": lon,
                            "latitude": lat
                        };
                        $scope.configGeofence.geopoints.push(geofencePoint);
                    }
                } else if (geometry.getType() == 'Circle')
                {
                    var radius = geometry.getRadius();
                    var center = geometry.getCenter();
                    var lonlat = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
                    var lon = lonlat[0];
                    var lat = lonlat[1];
                    var geofencePoint = {
                        "radius": radius,
                        "center": {
                            "longitude": lon,
                            "latitude": lat
                        }
                    };
                    $scope.configGeofence.geopoints = [geofencePoint];

                }
                $scope.isShapeProper = true;
                $scope.$apply();
            });
            map.addInteraction(draw);
        }
    }

    /**
     * Handle change event.
     */
    $scope.shapeChange = function () {
        map.removeInteraction(draw);
        addInteraction();
        vectorSource.clear();
        $scope.isShapeProper = false;
    };

    addInteraction();

    $scope.saveGeofence = function () {
         $rootScope.mypageloading = true;
        for (var index = 0; index < geofenceService.geofenceList.length; index++)
        {
            if (geofenceService.geofenceList[index].name == $scope.configGeofence.name)
            {
                FlashService.Error('Geofence name ' + $scope.configGeofence.name + ' already exist, please enter unique name.');
                return;
            }
        }

        var addGeofenceObj = {
            "type": $scope.configGeofence.type.toLowerCase(),
            "name": $scope.configGeofence.name,
            "geopoints": $scope.configGeofence.geopoints,
            "fleet_list": [
                "2343242342342",
                "3242342343242"
            ],
            "common": 1
        };

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/geofence/', addGeofenceObj);
        requestHandle.then(function (result) {
             $rootScope.mypageloading = false;
            if (result.success)
            {
                geofenceService.geofenceList.push(result.data);
                $location.path('/geofence/:' + result.data._id);
                FlashService.Error('');
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/geofence');
    };



});


