

app.controller('RouteViewController', function ($rootScope, $scope, $indexedDB, HttpService, UtilService, $routeParams, FlashService, $compile, $sessionStorage, HandShakeService, $log) {
    $log.debug("RouteViewController reporting for duty.");
    UtilService.setSidebar();
    $rootScope.showBackStrech = false;


    var IsDuplicateEntry = IsDuplicateEntry;
    var IsDuplicateUpdate = IsDuplicateUpdate;

    var featureInEdit_id = '';
    var featureOn = '';

    var vectorSource = new ol.source.Vector({});
    var center = ol.proj.transform([80.0686541, 12.8538429], 'EPSG:4326', 'EPSG:3857');
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: vectorSource
            })
        ],
        target: 'routeViewMap',
        view: new ol.View({
            center: center,
            zoom: 13,
            maxZoom: 19,
            minZoom: 4
        })
    });


    var popup = new ol.Overlay.Popup();
    map.addOverlay(popup);

// display popup on click
    map.on('click', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    return feature;
                });
        if (feature && feature.get('type') == 'click') {

            $scope.name = '';
            $scope.number = '';
            $scope.d_number = '';
            featureOn = feature;
            featureInEdit_id = feature.getId();
            var coord = feature.getGeometry().getCoordinates();
            var props = feature.getProperties();
            var info = feature.get('name');
            // Offset the popup so it points at the middle of the marker not the tip
            popup.setOffset([0, -22]);
            popup.show(coord, info);
            var pp = angular.element(document.querySelector('#djainpopup'));
            $compile(pp)($scope);

        } else {
            popup.hide();
        }
    });

// change mouse cursor when over marker
    map.on('pointermove', function (e) {
        if (e.dragging) {
            popup.hide();
            return;
        }
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        //map.getTarget().style.cursor = hit ? 'pointer' : '';
    });

    function markSchool() {

        var profileInfo = angular.fromJson($sessionStorage.profileInfo);
        var schoolCoord = profileInfo.loc;
        var lat = Number(schoolCoord.lat);
        var lon = Number(schoolCoord.lon);
        $log.debug('schoolCoord = ' + lon + ' ' + lat);
        var point = new ol.geom.Point(
                ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')
                );
        var feature = new ol.Feature({
            type: 'click',
            geometry: point
        });
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '../assets/img/School-48.png'
            }))
        });

        var popUpContent = '<div class="map-popup" >' + profileInfo.name;
        +'<br>' + '</div>';
        feature.setStyle(iconStyle);
        feature.set('name', popUpContent);
        vectorSource.addFeature(feature);
    }
    ;

    $scope.routeID = ($routeParams.routeID).toString();
    if ($scope.routeID.substring(0, 1) === ':') {
        $scope.routeID = $scope.routeID.substring(1);

    }
    var routeInfo;
    $log.debug('HandShakeService.getRouteStopInfo call');
    HandShakeService.getRouteStopInfo($scope.routeID).then(function (result) {
        $log.debug('HandShakeService getRouteStopInfo received result.length = ' + result.stop_list.length);
        routeInfo = result;
        $scope.route_name = result.route_name;
        $scope.markers = result.stop_list;
        var index = 0;

        var tempStopList = [];
        angular.forEach($scope.markers, function (markerObject) {
            addMarkerInMap(markerObject, index);
            index++;
            // var stopObject = {
            //     name: $scope.route_name+'_'+index,
            //     number: index+1,
            //     d_number: $scope.markers.length-index+1
            // };
            // $rootScope.mypageloading = true;
            // if(tempStopList.length == 0) {
            //     tempStopList = [markerObject]
            // } else {
            //     var d = UtilService.getDistanceFromLatLonInKm(markerObject.lat, markerObject.lon, tempStopList[tempStopList.length-1].lat, tempStopList[tempStopList.length-1].lon);
            //     if(d*1000 > 50) {
            //         tempStopList.push(markerObject);
            //         if(!markerObject.name) {
            //             var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + markerObject._id, stopObject);
            //             requestHandle.then(function (result) {
            //                 $rootScope.mypageloading = false;
            //                 if (result.success == true) {
            //                     console.log('stop marked successfully')
            //                 } else {
            //                     console.log('error in marking stop');
            //                 }
            //             });
            //         }
                    
            //     } else {
            //         var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + markerObject._id);
            //         requestHandle.then(function (result) {
            //             $rootScope.mypageloading = false;
            //             if (result.success == true) {
            //                 console.log('stop deleted successfully')
            //             } else {
            //                 console.log('delete stop failed')
            //             }
            //         });
            //     }
            // }
            // var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + markerObject._id, stopObject);
            // requestHandle.then(function (result) {
            //     $rootScope.mypageloading = false;
            //     if (result.success == true) {
            //         console.log('stop marked successfully')
            //     } else {
            //         console.log('error in marking stop');
            //     }
            // });
            //map.zoomToExtent(vectorLayer.getDataExtent());
        });
        markSchool();
        var extent = vectorSource.getExtent();
        $log.debug('extent = ' + map.getSize() + ' zoom = ' + map.getView().getZoom());
        if (map.getSize() !== undefined)
        {
            map.getView().fit(extent, map.getSize());
        }
        $log.debug('extent = ' + map.getSize() + ' zoom = ' + map.getView().getZoom());
    });
    $log.debug('HandShakeService.getRouteStopInfo passed');

    //$scope.markers = [{"timetaken": 1459917524148, "lat": 12.8537533, "lon": 80.0687494, "speed": 0, "time": 1459917525762, "number": 1, "name": 'Rajwad'}, {"timetaken": 1459917884770, "lat": 12.855543, "lon": 80.0689086, "speed": 0, "time": 1459917884804}, {"timetaken": 1459917957541, "lat": 12.85408, "lon": 80.06792, "speed": 0.14824000000953674, "time": 1459917957575}, {"timetaken": 1459918167537, "lat": 12.852515, "lon": 80.0666, "speed": 14.885766983032227, "time": 1459918167556}, {"timetaken": 1459918182577, "lat": 12.8508716, "lon": 80.0654433, "speed": 14.387001037597656, "time": 1459918182640}, {"timetaken": 1459918197543, "lat": 12.849465, "lon": 80.064425, "speed": 13.641168594360352, "time": 1459918197564}, {"timetaken": 1459918212530, "lat": 12.8479466, "lon": 80.0632566, "speed": 15.172981262207031, "time": 1459918212534}, {"timetaken": 1459918227524, "lat": 12.846385, "lon": 80.0621866, "speed": 10.240398406982422, "time": 1459918227531}, {"timetaken": 1459918257540, "lat": 12.8449449, "lon": 80.0608133, "speed": 11.780447959899902, "time": 1459918257550}, {"timetaken": 1459918272525, "lat": 12.8442083, "lon": 80.0600483, "speed": 1.915796160697937, "time": 1459918272529}, {"timetaken": 1459918317527, "lat": 12.8429399, "lon": 80.0587199, "speed": 9.603687286376953, "time": 1459918317544}, {"timetaken": 1459918332524, "lat": 12.8418433, "lon": 80.0575483, "speed": 12.01567554473877, "time": 1459918332526}, {"timetaken": 1459918347524, "lat": 12.8406666, "lon": 80.0562883, "speed": 13.483148574829102, "time": 1459918347526}, {"timetaken": 1459918362524, "lat": 12.839365, "lon": 80.0549483, "speed": 13.612858772277832, "time": 1459918362526}, {"timetaken": 1459918377560, "lat": 12.8380199, "lon": 80.0535483, "speed": 14.345308303833008, "time": 1459918377583}, {"timetaken": 1459918392526, "lat": 12.8366383, "lon": 80.052065, "speed": 14.702011108398438, "time": 1459918392536}, {"timetaken": 1459918407537, "lat": 12.835115, "lon": 80.050465, "speed": 17.542247772216797, "time": 1459918407553}, {"timetaken": 1459918422541, "lat": 12.8336483, "lon": 80.0489549, "speed": 13.423955917358398, "time": 1459918422553}, {"timetaken": 1459918437524, "lat": 12.8326633, "lon": 80.0479033, "speed": 6.7830095291137695, "time": 1459918437528}, {"timetaken": 1459918482535, "lat": 12.8317733, "lon": 80.048155, "speed": 7.547886848449707, "time": 1459918482568}, {"timetaken": 1459918512538, "lat": 12.8311716, "lon": 80.0491283, "speed": 2.544271945953369, "time": 1459918512553}];

    function addMarkerInMap(markerObject, index) {

        var lat = Number(markerObject.lat);
        var lon = Number(markerObject.lon);
        $log.debug('lat lon  markerObject._id' + lat + ' ' + lon + ' ' + markerObject._id);
        var point = new ol.geom.Point(
            ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')
        );

        var popupContent;

        //create style for your feature...
        var iconStyle;
        if (markerObject.number == undefined || markerObject.name == undefined || markerObject.d_number == undefined)
        {
            $log.debug('Busunmarked');
            popupContent = '<div class="map-popup" >' +
                    '<form class="form style-form"  >' +
                    '<div class="form-group">' +
                    '<label >Pick up Stop No.</label>&nbsp;' +
                    ' <input  type="number" ng-model="number" string-to-number required/>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label >Drop Stop No.</label>&nbsp;' +
                    ' <input  type="number" ng-model="d_number" string-to-number required/>' +
                    '</div>' +
                    ' <div class="form-group" >' +
                    '<label >Stop Name</label>&nbsp;' +
                    ' <input  type="text" ng-model="name" required/>' +
                    '</div>' +
                    '<div class="form-action" >' +
                    '<span ng-if="flash" ng-bind="flash.message" class="help-block text-danger"></span>' +
                    ' <button type="submit"  style="width: 10em;  height: 2em;"  ng-click="addStop();">Add</button>' +
                    ' <button type="button" style="width: 10em;  height: 2em;"  ng-hide ="false" ng-click="delete()">Delete </button>' +
                    '<my-page-Loader ng-if="mypageloading"></my-page-Loader>' +
                    '</div>' +
                    ' </form>' +
                    '</div>';
            var feature = new ol.Feature({
                type: 'click',
                name: popupContent,
                geometry: point,
                iter: index
            });

            iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: '../assets/img/stop-unass.png'
                }))
            });
            //style.externalGraphic = '../assets/img/stopUnmarked.png';
        } else
        {
            $log.debug('Busmarked markerObject.number = ' + markerObject.number + 'markerObject.name = ' + ' ' + markerObject.name);
            var popupContent = '<div class="map-popup" >' +
                    '<div>Pick up Stop No: ' + markerObject.number + '<br>Drop Stop No: ' + markerObject.d_number + '<br>Stop Name: ' + markerObject.name + '</div><br>' +
                    '<span ng-if="flash" ng-bind="flash.message" class="help-block text-danger"></span>' +
                    ' <button type="submit"  ng-click="edit(); ">Edit</button>' +
                    ' <button type="button"  ng-click="delete()">Delete</button>' +
                    '<my-page-Loader ng-if="mypageloading"></my-page-Loader>' +
                    '</div>';
            var feature = new ol.Feature({
                type: 'click',
                name: popupContent,
                geometry: point,
                iter: index
            });

            iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: '../assets/img/stop.png'
                }))
            });
        }

        feature.setStyle(iconStyle);
        feature.setId(markerObject._id);
        vectorSource.addFeature(feature);

    }
    ;


    var featureInEdit_index = 0;
    $scope.addStop = function () {
        $log.debug('addStop called');
        var iter = featureOn.get('iter');
        featureInEdit_index = iter;

        if ($scope.name === undefined || $scope.name == '' || $scope.name == null
                || $scope.number === undefined || $scope.number == '' || $scope.number == null
                || $scope.d_number === undefined || $scope.d_number == '' || $scope.d_number == null)
        {
            //alert('Stop Name and Number should not be empty');
            FlashService.Error('Stop Name and Number should not be empty');
            return;
        }

        var duplicateCheck = IsDuplicateEntry();
        if (duplicateCheck === 0)
        {
            $log.debug('Its not duplicate');
            var stopObject = {
                name: $scope.name,
                number: $scope.number,
                d_number: $scope.d_number
            };
            var iter = featureOn.get('iter');
            $scope.markers[iter].name = $scope.name;
            $scope.markers[iter].number = $scope.number;
            $scope.markers[iter].d_number = $scope.d_number;
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + featureInEdit_id, stopObject);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    FlashService.Error('');
                    $log.debug('Stop updated successfully');
                    var content = '<div class="map-popup" >' +
                            '<div>Pick Up Stop No: ' + $scope.number + '<br>Drop Stop No: ' + $scope.d_number + '<br>Stop Name: ' + $scope.name + '</div><br>' +
                            '<span ng-if="flash" ng-bind="flash.message" class="help-block text-danger"></span>' +
                            ' <button type="submit" style="width: 10em;  height: 2em;" ng-click="edit(); ">Edit</button>' +
                            ' <button type="button" style="width: 10em;  height: 2em;" ng-click="delete()">Delete</button>' +
                            '<my-page-Loader ng-if="mypageloading"></my-page-Loader>' +
                            '</div>';
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: '../assets/img/stop.png'
                        }))
                    });
                    featureOn.set('name', content);
                    featureOn.setStyle(iconStyle);

                    popup.hide();
                    var coord = featureOn.getGeometry().getCoordinates();
//                var props = feature.getProperties();
//                var info = feature.get('name');
                    // Offset the popup so it points at the middle of the marker not the tip
                    popup.setOffset([0, -22]);
                    popup.show(coord, content);
                    var pp = angular.element(document.querySelector('#djainpopup'));
                    $compile(pp)($scope);
//                popup.show();
//                featureOn.changed();
                    // map.popups[0].setContentHTML(content);
//                var pp = angular.element(document.querySelector('#djainpopup'));
//                $compile(pp)($scope);
                    //vectorLayer.features[featureInEdit_index].attributes.number = $scope.number;
                    //vectorLayer.features[featureInEdit_index].attributes.name = $scope.name;
                    //vectorLayer.features[featureInEdit_index].style.externalGraphic = '../assets/img/stop.png';
                    $sessionStorage.markers = $scope.markers;
                    routeInfo.stop_list = $scope.markers;
                    $indexedDB.openStore('route', function (routeStore) {
                        routeStore.delete($scope.routeID).then(function () {
                            routeStore.upsert(routeInfo).then(function (e) {
                                $log.debug('upserted successfully in routeStore');
                                // HandShakeService.routewarningcheck();
//                            popup.show();
                            },
                                    function (error) {
                                        $log.debug('Error in upserting in routeStore = ' + error);
                                    });
                        });

                    });
//                $indexedDB.openStore('route', function (routeStore) {
//                    routeStore.upsert($scope.markers).then(function (e) {
//                        $log.debug('upserted successfully in routeStore');
//                    },
//                            function (error) {
//                                $log.debug('Error in upserting in routeStore = ' + error);
//                            });
//                });
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

        } else
        {
            $log.debug('Stop Name and Number should be unique');
            FlashService.Error('Stop Name and Number should be unique');
            alert('Stop Name and Number should be unique');
        }

    };



    //map.addLayer(vectorLayer);
    // map.setCenter(lonLat, zoom);

//
//    var select = new OpenLayers.Control.SelectFeature(vectorLayer);
//    map.addControl(select);
//    select.activate();
//
//    function onPopupClose(evt) {
//        select.unselectAll();
//    }

//        <!-- crucial part is form within popup. careful with linebreaks-->  
//    vectorLayer.events.on({
//        featureselected: function (event) {
//            var feature = event.feature;
//            $log.debug('feat att ' + feature.attributes._id);
//            featureInEdit_id = feature.attributes._id;
//            var content;
//            if ((feature.attributes.name != '' && feature.attributes.name != undefined) && (feature.attributes.number != '' && feature.attributes.number != undefined))
//            {
//                content = '<div class="map-popup" >' +
//                        '<div>Stop No: ' + feature.attributes.number + '<br>Stop Name: ' + feature.attributes.name + '</div><br>' +
//                        ' <button type="submit" style="width: 10em;  height: 2em;" ng-click="edit(); ">Edit</button>' +
//                        ' <button type="button" style="width: 10em;  height: 2em;"  ng-click="delete()">Delete</button>' +
//                        '</div>';
////                content = 'Stop N0o: ' + feature.attributes.number + '<br>Stop Name: ' + feature.attributes.name + '<br>' +
////                         '<button class="btn btn-primary btn-xs" ng-click="editRoute($index)"><i class="fa fa-pencil"></i></button>' +
////                                    '<button class="btn btn-danger btn-xs" ng-click="deleteRoute($index)"><i class="fa fa-trash-o "></i></button>';
//            }
//            else
//            {
//                $scope.name = '';
//                $scope.number = '';
//                content = formTemplate;
//            }
//            //feature.id = 'djain';
//            feature.popup = new OpenLayers.Popup.FramedCloud
//                    ("pop",
//                            feature.geometry.getBounds().getCenterLonLat(),
//                            new OpenLayers.Size(500, 500),
//                            content,
//                            null,
//                            null
//                            );
//
//            map.addPopup(feature.popup);
//            var pp = angular.element(document.querySelector('#pop'));
//            $compile(pp)($scope);
//
//        },
////            <!-- destroy popup when feature is no longer selected. Prevents showing 2 Popups at the same time-->
//        featureunselected: function (event) {
//            var feature = event.feature;
//            map.removePopup(feature.popup);
//            feature.popup.destroy();
//            feature.popup = null;
//        }
//    });

    $scope.cancel = function () {
        $log.debug('cancel called');
        popup.hide();
        //select.unselectAll();
        $scope.name = '';
        $scope.number = '';
        $scope.d_number = '';
    };


    $scope.delete = function () {
        var stuCountForStop = 0;
        var confirmit = false;
        $log.debug('delete called');
        $indexedDB.openStore('student', function (studentStore) {
            studentStore.count().then(function (studentCount) {
                $log.debug('studentCount = ' + studentCount);
                if (studentCount == 0)
                {
                    deletestop(0);
                } else
                {
                    var find = studentStore.query();
                    find = find.$eq($scope.routeID);
                    find = find.$index("route_id");

                    studentStore.eachWhere(find).then(function (stuList) {
                        $log.debug('stuList length = ' + stuList.length)
                        angular.forEach(stuList, function (stuObject) {
                            if (stuObject.stop_id == featureInEdit_id)
                            {
                                stuCountForStop++;
                            }
                        });
                        if (stuCountForStop > 0)
                        {
                            confirmit = confirm(stuCountForStop + ' student associated with this stop. On deletion all the students will be unassigned from the route.');
                        } else
                        {
                            confirmit = true;
                        }
                        if (confirmit)
                        {
                            $log.debug('delete stop featureInEdit_id = ' + featureInEdit_id);
                            $rootScope.mypageloading = true;
                            deletestop(stuCountForStop);
                        }

                    });
                }
            });

        });

        function deletestop(stuCountForStop) {
            $log.debug('deletestop called');
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + featureInEdit_id);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    var iter = featureOn.get('iter');
                    $scope.markers.splice(iter, 1);
                    popup.hide();
                    vectorSource.removeFeature(featureOn);
                    routeInfo.stop_list = $scope.markers;
                    routeInfo.stucount -= stuCountForStop;
                    $indexedDB.openStore('route', function (routeStore) {
                        routeStore.delete($scope.routeID).then(function () {
                            routeStore.upsert(routeInfo).then(function (e) {
                                $log.debug('upserted successfully in routeStore');
                                $indexedDB.openStore('student', function (studentStore) {
                                    studentStore.count().then(function (studentCount) {
                                        if (studentCount == 0)
                                        {
                                            $rootScope.global.stuwarning = true;
                                        }
                                        studentStore.each().then(function (studentList) {
                                            angular.forEach(studentList, function (studentObject) {
                                                $log.debug('studentObject._id = ' + studentObject._id);
                                                if (studentObject.stop_id != undefined && studentObject.stop_id != '' && studentObject.stop_id == featureInEdit_id)
                                                {
                                                    studentObject.stop_id = '';
                                                    studentObject.stop_name = '';
                                                    studentObject.route_id = '';
                                                    studentStore.delete(studentObject._id).then(function () {
                                                        studentStore.upsert(studentObject).then(function (e) {
                                                            $log.debug('Stop id removed from student db');
                                                        })
                                                    });
                                                }
                                                $log.debug('studentObject.stop_id = ' + studentObject.stop_id);

                                            });

                                        });
                                    });
                                });
                                // HandShakeService.routewarningcheck();
                            },
                                    function (error) {
                                        $log.debug('Error in upserting in routeStore = ' + error);
                                    });
                        });

                    });
                } else
                {

                }
            });
        }

    };



    $scope.edit = function () {
        $log.debug('edit called');
        featureOn.get('name');
        var iter = featureOn.get('iter');
        featureInEdit_index = iter;
        $scope.name = $scope.markers[iter].name;
        $scope.number = $scope.markers[iter].number;
        $scope.d_number = $scope.markers[iter].d_number;
        featureInEdit_id = featureOn.getId();
//        for (var iter = 0; iter < vectorLayer.features.length; iter++)
//        {
//            if (vectorLayer.features[iter].attributes._id == featureInEdit_id)
//            {
//                $log.debug('iter ' + iter + ' ' + vectorLayer.features[featureInEdit_index].attributes.name);
//                featureInEdit_index = iter;
//                $scope.name = vectorLayer.features[featureInEdit_index].attributes.name;
//                $scope.number = vectorLayer.features[featureInEdit_index].attributes.number;
//            }
//        }
        $log.debug(' Edit iter ' + featureInEdit_index);
        var content = '<div class="map-popup" >' +
                '<form name="form" role="form" class="form style-form"  >' +
                '<div class="form-group">' +
                '<label >Stop No.</label>&nbsp;' +
                ' <input  type="number" ng-model="number" required string-to-number/>' +
                '</div>' +
                '<div class="form-group">' +
                '<label >Drop Stop No.</label>&nbsp;' +
                ' <input  type="number" ng-model="d_number" string-to-number required/>' +
                '</div>' +
                ' <div class="form-group" >' +
                '<label >Stop Name</label>&nbsp;' +
                ' <input  type="text" ng-model="name" required/>' +
                '</div>' +
                '<div class="form-group" >' +
                '<span ng-if="flash" ng-bind="flash.message" class="help-block text-danger"></span>' +
                ' <button type="submit" ng-disabled="!form.$valid" style="width: 10em;  height: 2em;" ng-click="update(); ">Ok</button>' +
                ' <button type="button" style="width: 10em;  height: 2em;" ng-hide ="false" ng-click="cancel()">Cancel</button>' +
                '</div>' +
                '<my-page-Loader ng-if="mypageloading"></my-page-Loader>' +
                ' </form>' +
                '</div>';
        //map.popups[0].setContentHTML(content);
//        featureOn.set('name', content);
        popup.hide();

        var coord = featureOn.getGeometry().getCoordinates();
        var props = featureOn.getProperties();
//        var info = content;
        // Offset the popup so it points at the middle of the marker not the tip
        popup.setOffset([0, -22]);
        popup.show(coord, content);
        var pp = angular.element(document.querySelector('#djainpopup'));
        $compile(pp)($scope);

    };


    $scope.update = function () {
        $log.debug('update called');
        if ($scope.name === undefined || $scope.name == '' || $scope.name == null
                || $scope.number === undefined || $scope.number == '' || $scope.number == null
                || $scope.d_number === undefined || $scope.d_number == '' || $scope.d_number == null)
        {
            alert('Stop Name and Number should not be empty');
            return;
        }
        var duplicateCheck = IsDuplicateUpdate();
        if (duplicateCheck === 0)
        {
            $log.debug('Its not Duplicate');
            $scope.markers[featureInEdit_index].name = $scope.name;
            $scope.markers[featureInEdit_index].number = $scope.number;
            $scope.markers[featureInEdit_index].d_number = $scope.d_number;
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/routes/stop/' + $scope.routeID + '/' + featureInEdit_id, $scope.markers[featureInEdit_index]);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true)
                {
                    FlashService.Error('');
                    var content = '<div class="map-popup" >' +
                            '<div>Pick up Stop No: ' + $scope.number +
                            '<br>Drop Stop No: ' + $scope.d_number + '</div><br>' +
                            '<br>Stop Name: ' + $scope.name + '</div><br>' +
                            '<span ng-if="flash" ng-bind="flash.message" class="help-block text-danger"></span>' +
                            ' <button type="submit" style="width: 10em;  height: 2em;" ng-click="edit(); ">Edit</button>' +
                            ' <button type="button" style="width: 10em;  height: 2em;" ng-hide ="false" ng-click="delete()">Delete</button>' +
                            '<my-page-Loader ng-if="mypageloading"></my-page-Loader>' +
                            '</div>';
                    //map.popups[0].setContentHTML(content);
                    featureOn.set('name', content);
                    var coord = featureOn.getGeometry().getCoordinates();
//        var props = featureOn.getProperties();
//        var info = content;
                    // Offset the popup so it points at the middle of the marker not the tip
                    popup.setOffset([0, -22]);
                    popup.show(coord, content);
                    var pp = angular.element(document.querySelector('#djainpopup'));
                    $compile(pp)($scope);
//                vectorLayer.features[featureInEdit_index].attributes.number = $scope.number;
//                vectorLayer.features[featureInEdit_index].attributes.name = $scope.name;
//                vectorLayer.features[featureInEdit_index].style.externalGraphic = '../assets/img/stop.png';
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 0.75,
                            src: '../assets/img/stop.png'
                        }))
                    });
                    featureOn.setStyle(iconStyle);
                    $sessionStorage.markers = $scope.markers;

                    routeInfo.stop_list = $scope.markers;
                    $indexedDB.openStore('route', function (routeStore) {
                        routeStore.delete($scope.routeID).then(function () {
                            routeStore.upsert(routeInfo).then(function (e) {
                                $log.debug('upserted successfully in routeStore');
                            },
                                    function (error) {
                                        $log.debug('Error in upserting in routeStore = ' + error);
                                    });
                        });

                    });


//                $indexedDB.openStore('route', function (routeStore) {
//                    routeStore.upsert($scope.markers).then(function (e) {
//                        $log.debug('upserted successfully in routeStore');
//                    },
//                            function (error) {
//                                $log.debug('Error in upserting in routeStore = ' + error);
//                            });
//                });
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
        } else if (duplicateCheck == -1)
        {
            $log.debug('Data not modified');
            popup.hide();
            return;
        } else
        {
            alert('Stop Number and Stop Name should be unique!');
            FlashService.Error('Stop Number and Stop Name should be unique!');
        }


    };

    function IsDuplicateEntry() {
        $log.debug('IsDuplicateEntry');
        var i = 0;
        $log.debug('$scope.name = ' + $scope.name + '$scope.number = ' + $scope.number + '$scope.d_number = ' + $scope.d_number);
        for (i = 0; i < $scope.markers.length; i++)
        {
            $log.debug('$scope.markers[i].name = ' + $scope.markers[i].name + '$scope.markers[i].number = ' + $scope.markers[i].number
                    + '$scope.markers[i].d_number = ' + $scope.markers[i].d_number);
            if (($scope.markers[i].name !== undefined && $scope.markers[i].name === $scope.name)
                    || ($scope.markers[i].number !== undefined && $scope.markers[i].number == $scope.number)
                    || ($scope.markers[i].d_number !== undefined && $scope.markers[i].d_number == $scope.d_number))
            {
                //return 1;
                $log.debug('featureInEdit_index = ' + featureInEdit_index + ' i = ' + i);
                if (featureInEdit_index === i)
                {
                    if ($scope.markers[i].name === $scope.name && $scope.markers[i].number === $scope.number &&
                            $scope.markers[i].d_number === $scope.d_number)
                    {
                        return -1;
                    } else
                    {
                        return 0;
                    }
                } else
                {
                    return 1;
                }
            }
        }
        return 0;
    }
    ;

    function IsDuplicateUpdate() {
        $log.debug('IsDuplicateUpdate');

        var i = 0;
        $log.debug('$scope.markers.length = ' + $scope.markers.length + '$scope.name = ' + $scope.name + '$scope.number = ' + $scope.number +
                '$scope.d_number = ' + $scope.d_number + 'featureInEdit_index = ' + featureInEdit_index);
        for (i = 0; i < $scope.markers.length; i++)
        {
            $log.debug('$scope.markers[i].name = ' + $scope.markers[i].name + '$scope.markers[i].number = ' + $scope.markers[i].number);
            if (($scope.markers[i].name !== undefined && $scope.markers[i].name === $scope.name)
                    || ($scope.markers[i].number !== undefined && $scope.markers[i].number == $scope.number)
                    || ($scope.markers[i].d_number !== undefined && $scope.markers[i].d_number == $scope.d_number))
            {
                $log.debug('i = ' + i);

                if (featureInEdit_index === i)
                {
                    if ($scope.markers[i].name === $scope.name && $scope.markers[i].number === $scope.number &&
                            $scope.markers[i].d_number === $scope.d_number)
                    {
                        return -1;
                    } else
                    {
                        return 0;
                    }
                } else
                {
                    return 1;
                }


            }
        }
        return 0;
    }
    ;

});



