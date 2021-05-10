app.factory('UtilService',
    function UtilService(HttpService, $filter, $rootScope, constantService, $q, $sessionStorage, $log, $http) {
        var service = {};
        service.createNotification = createNotification;
        service.getAddressForCoordinates = getAddressForCoordinates;
        service.to5Decimals = to5Decimals;
        service.onOffConverter = onOffConverter;
        service.timeInMin = timeInMin;
        service.secondsToHm = secondsToHm;
        service.getVehicleIcon = getVehicleIcon;
        service.getMarkerIconStyle = getMarkerIconStyle;
        service.setSidebar = setSidebar;
        service.alertList = [];
        service.initiateMap = initiateMap;
        service.moveMarker = moveMarker;
        service.getDistanceFromLatLonInKm = getDistanceFromLatLonInKm;
        service.animateBusMove = animateBusMove;
        service.checkDate = checkDate;
        service.replayLines = [];
        service.popupContent = popupContent;
        service.uploadFilesToAmazonS3 = uploadFilesToAmazonS3;
        service.PrintDivContent = PrintDivContent;
        return service;
        $scope.notification = false;


        function PrintDivContent(divId) {
            console.log("Div Id :", divId);
            var restorepage = document.body.innerHTML;
            var printcontent = document.getElementById(divId).innerHTML;
            var popupWin = window.open('', '_blank', 'width=400,height=300,size: landscape');
            popupWin.document.open();
            popupWin.document.write('<html><head><link href="common/CSS/zuwagon.css" rel="stylesheet" /> <link href="../../assets/css/bootstrap.css" rel="stylesheet"></head><body onload="window.print()">' + printcontent + '</body></html>');
            popupWin.document.close();
        }

        function uploadToAWS(file, storeAWSUploadLink) {

            $http.defaults.headers.common = '';

            $http({
                method: "PUT",
                url: storeAWSUploadLink,
                data: file,
                headers: {
                    'Content-Type': file.type
                }
            }).then(function mySuccess(response) {

                console.log(response);
                $window.alert('Upload Successfully');

            }, function myError(error) {

                console.log(error);

            });
        }

        function checkDate(data) {
            var dateOffset = (24 * 60 * 60 * 1000) * 1; //1 days
            var currentDate = new Date();
            currentDate = $filter('date')(currentDate, 'dd-MM-yyyy');
            var PrivousDate = $filter('date')(data.time, 'dd-MM-yyyy');
            if (currentDate == PrivousDate) {
                var a = false;
                return a;
            } else {
                var a = true;
                return a;
            }
            // if(currentDateTimeStamp < data.time){
            //     var a = false;
            //     return a;
            //     // alert('Given date is greater than the current date.');
            // }else{
            //     var a = true;
            //     return a;
            //     //alert('Given date is not greater than the current date.');
            // }

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
        ;

        function deg2rad(deg) {
            return deg * (Math.PI / 180)
        }
        ;

        function moveMarker(vehicleMarker, dest_point, markerMoveSpeed) {

            var defer = $q.defer();
            movingMarker(vehicleMarker, dest_point, markerMoveSpeed, defer);
            return defer.promise;

        }
        ;
        function movingMarker(vehicleMarker, dest_point, markerMoveSpeed, defer) {
            var endCoord = {
                lat: dest_point.lat,
                lng: dest_point.lon
            };

            var currentCoord = vehicleMarker.getPosition();

            var startCoord = {
                lat: currentCoord.lat(),
                lng: currentCoord.lng()
            };

            var rotation, start, end, generator, line, coords, linestring, coords3857;
            vehicleMarker.setIcon({
                url: getVehicleIcon(vehicleMarker.v_type, vehicleMarker.status) + "#" + vehicleMarker.id,
                anchor: new google.maps.Point(25, 25)
            });


            if ((startCoord.lng == endCoord.lng || startCoord.lat == endCoord.lat)) {
                return defer.resolve();
            }
            start = { x: startCoord.lng, y: startCoord.lat };
            end = { x: endCoord.lng, y: endCoord.lat };
            if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y)) {
                $log.debug('moveVehicleSmoothly: NAn-- Number(endCoord.lon) = ' + Number(endCoord.lng) + ' Number(endCoord.lat) = ' + Number(endCoord.lat));
                return defer.resolve();
            }
            generator = new arc.GreatCircle(start, end);
            line = generator.Arc(50, { offset: 0 }); // 99 to 50
            line = line.json();
            coords = line.geometry.coordinates;
            var coordLatLng = [];
            angular.forEach(coords, function (coord) {
                coordLatLng.push({ lat: coord[1], lng: coord[0] });
            });

            var animObj = {
                marker: vehicleMarker,
                coords_interval: coords,
                anim_index: 0,
                markerMoveSpeed: markerMoveSpeed,
                defer: defer
            };
            var dis = getDistanceFromLatLonInKm(startCoord.lat, startCoord.lng, endCoord.lat, endCoord.lng);
            if (dis * 1000 < 2) {
                if (markerMoveSpeed > 80) {
                    var line = new google.maps.Polyline({
                        path: [startCoord, endCoord],
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 3,
                        map: vehicleMarker.getMap()
                    });
                    service.replayLines.push(line);

                }
                vehicleMarker.setPosition(endCoord);
                return defer.resolve();
            }
            if (dis * 1000 > 150 && false) {
                if (markerMoveSpeed > 80) {
                    var line = new google.maps.Polyline({
                        path: [startCoord, endCoord],
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 3,
                        map: vehicleMarker.getMap()
                    });
                    service.replayLines.push(line);
                }
                vehicleMarker.setPosition(endCoord);
                return defer.resolve();
            }
            rotation = Math.atan2(endCoord.lat - startCoord.lat, endCoord.lng - startCoord.lng);
            rotation = 90 - rotation * (180 / Math.PI)
            var iconpath = vehicleMarker.getIcon();

            var rotate = rotation;
            $('img[src="' + iconpath.url + '"]').css(
                {
                    '-webkit-transform': 'rotate(' + rotate + 'deg)',
                    '-moz-transform': 'rotate(' + rotate + 'deg)',
                    '-ms-transform': 'rotate(' + rotate + 'deg)',
                    'transform': 'rotate(' + rotate + 'deg)'
                });

            browserAnimation.addRendererDash(animateBusMove, animObj, markerMoveSpeed);


            //mapService.setZoomAccToVector();
        }
        ;

        function animateBusMove(animObj) {

            if (!service.replayLines)
                service.replayLines = [];
            if (animObj.marker.stopped) {
                browserAnimation.removeRenderer(animateBusMove);
                animObj.anim_index = 0;
                for (var i = 0; i < service.replayLines.length; i++) {
                    service.replayLines[i].setMap(null); //or 
                    service.replayLines[i].setVisible(false);
                }
                animObj.defer.resolve();
                return;
            }
            var nextPoint = animObj.coords_interval[animObj.anim_index];
            if (nextPoint) {

                if (animObj.markerMoveSpeed > 80 && animObj.anim_index < animObj.coords_interval.length - 1) {
                    var line = new google.maps.Polyline({
                        path: [{ lat: animObj.coords_interval[animObj.anim_index][1], lng: animObj.coords_interval[animObj.anim_index][0] },
                        { lat: animObj.coords_interval[animObj.anim_index + 1][1], lng: animObj.coords_interval[animObj.anim_index + 1][0] }],
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 3,
                        map: animObj.marker.getMap()
                    });
                    service.replayLines.push(line);

                }
                animObj.marker.setPosition({ lat: Number(nextPoint[1]), lng: Number(nextPoint[0]) });
            }

            animObj.anim_index++;
            if (animObj.anim_index >= animObj.coords_interval.length) {
                browserAnimation.removeRenderer(animateBusMove);
                animObj.anim_index = 0;
                animObj.defer.resolve();
            }
        }
        ;


        function initiateMap(mapId, zoom) {

            var profileInfo = angular.fromJson($sessionStorage.profileInfo);
            var center = { lat: Number(profileInfo.loc.lat), lng: Number(profileInfo.loc.lon) }
            var map = new google.maps.Map(document.getElementById(mapId), {
                zoom: zoom,
                center: center
            });
            var schoolPopText = '<div class="map-popup" >' + '<b>' + profileInfo.name + '</b><br>' + '</div>';


            var infowindow = new google.maps.InfoWindow({
                content: schoolPopText
            });

            var schoolMarker = new google.maps.Marker({
                position: center,
                map: map,
                icon: constantService.schoolIcon
            });

            schoolMarker.addListener(constantService.showPopuponClickorHoverGMap, function () {
                infowindow.open(map, schoolMarker);
            });

            schoolMarker.addListener('mouseout', function () {
                infowindow.close(map, schoolMarker);
            });

            return { map: map, schoolMarker: schoolMarker };
        }
        ;

        function getMarkerIconStyle(iconPath, iconScale, iconRotation, text) {
            var iconStyle;
            var icon = new ol.style.Icon(({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 1,
                src: iconPath,
                scale: iconScale,
                rotation: iconRotation
            }));
            if (text) {
                iconStyle = new ol.style.Style({
                    image: icon,
                    text: new ol.style.Text({
                        textAlign: "center",
                        textBaseline: "bottom",
                        text: text,
                        scale: 1.3,
                        font: 'bold 9px Arial, Verdana, Helvetica, sans-serif',
                        rotateWithView: false,
                        rotation: iconRotation,
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                });
            } else {
                iconStyle = new ol.style.Style({
                    image: icon
                });
            }

            return iconStyle;
        }
        ;

        function to5Decimals(num) {
            return Number(num.toString().match(/^-?\d+(?:\.\d{0,6})?/)[0]);
        }
        ;

        function setSidebar() {
            if ($(window).width() <= 768 || (!$rootScope.showSideMenu && !$("#sidebar").hasClass("hide"))) {
                $('#sidebar').addClass('hide');
            }

        }
        ;
        function secondsToHm(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            //        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
            return ((h > 0 ? h + " hr " + (m < 10 ? "0" : "") : "") + m + " min");
        }

        function getVehicleIcon(v_type, v_status) {
            if (v_type == 'CAR')
                if (v_status == 0)
                    return constantService.stoppedCarIcon;
                else if (v_status == 3 || v_status == 2)
                    return constantService.notRespondingCarIcon;
                else
                    return constantService.carIcon;
            else if (v_type == 'BIKE')
                if (v_status == 0)
                    return constantService.stoppedBikeIcon;
                else if (v_status == 3 || v_status == 2)
                    return constantService.notRespondingBikeIcon;
                else
                    return constantService.bikeIcon;
            else if (v_type == 'TRUCK')
                if (v_status == 0)
                    return constantService.stoppedTruckIcon;
                //                        return constantService.new_truck;
                else if (v_status == 3 || v_status == 2)
                    return constantService.notRespondingTruckIcon;
                else
                    return constantService.truckIcon;
            else
                if (v_status == 0)
                    return constantService.stoppedBusIcon;
                else if (v_status == 3 || v_status == 2)
                    return constantService.notRespondingBusIcon;
                else
                    return constantService.runningBusIcon;
        }

        function timeInMin(d) {
            var today = new Date();
            var d = new Date(d);
            var hr = d.getHours();
            var min = d.getMinutes();
            var Meridian = ' AM';
            if (hr > 12) {
                hr -= 12;
                Meridian = ' PM';
            }
            else if (hr == 12) {
                Meridian = ' PM';
            }
            if (min < 10) {
                min = '0' + min;
            }
            if (today.getDate() != d.getDate()) {
                var dt = d.getDate();
                var mn = d.getMonth() + 1;
                var yr = d.getFullYear();
                return dt + '/' + mn + '/' + yr + ' ' + hr + ':' + min + Meridian;
                //return d.toLocaleString();
            }

            return hr + ':' + min + Meridian;
        }
        ;



        function createNotification(data) {
            data.seen = 0;
            data.shown = 0;
            var dateObject = new Date();
            data.time = dateObject.toLocaleTimeString();
            this.alertList.push(data);
            $rootScope.$broadcast('delayNotify');
        }
        ;

        function onOffConverter(data) {
            if (data == 0)
                return 'OFF';
            else
                return 'ON';
        }
        ;

        function getAddressForCoordinates(latlng) {
            var defer = $q.defer();
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({ 'location': latlng }, function (results, status) {
                var address = '';
                if (status === 'OK' && results[1]) {
                    address = results[1].formatted_address;
                }
                if (!address || address == "") {
                    //                      http://nominatim.openstreetmap.org/reverse?format=json&lat=12.8537533&lon=80.0687494&zoom=18&addressdetails=1';
                    var osmNominatimUrl = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latlng.lat + '&lon=' + latlng.lng + '&zoom=18&addressdetails=1'
                    var requestHandle = HttpService.HttpGetData(osmNominatimUrl);
                    // var requestHandle = HttpService.HttpGetData('http://nominatim.openstreetmap.org/reverse?format=json&lat=10.750113&lon=-29.537987&zoom=18&addressdetails=1');
                    requestHandle.then(function (result) {
                        if (result.success == true) {
                            defer.resolve(result.data.display_name);
                        }
                    });
                } else {
                    defer.resolve(address);
                }
            });
            return defer.promise;
        }
        ;

        function popupContent(object) {
            var content = '<div class="map-popup" >';
            if (object.bus_number) {
                content += '<b>Vehicle: </b> ' + object.reg_no + '<br>';
            }
            if (object.route_name && object.status) {
                content += '<b>Route: </b> ' + object.route_name + '<br>';
            }
            if (object.trip_type && object.status && $rootScope.category == $rootScope.categoryLabel.schoolWithRFID) {
                content += '<b>Trip: </b> ' + object.trip_type + '<br>';
            }
            if (object.start_time && object.status) {
                content += '<b>Start time: </b> ' + object.start_time + '<br>';
            }
            if (object.speed && object.status) {
                content += '<b>Speed: </b> ' + object.speed + '<br>';
            }
            if (object.last_updated_time) {
                content += '<b>Last updated: </b> ' + object.last_updated_time + '<br>';
            }
            content += '<a ng-click="address(' + object._id + ')"><b>Address</b></a> ';

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

        /*
         * argument : array of fileDetail
         * action   : upload the files to amazon s3
         * response : url of each files where it's uploaded,
         *          : count of file upload failed,
         *          : count of file upload succeeded,
         *          : progress of the file upload when it's being uploaded
         * 
         * fileDetail object format should be as below
         * {
         *    fileKey: 'with the fileKey you will get uploaded file URL',
         *    file: 'javascript file object'
         *    basePath: 'base path for managing files on the amazon s3 server'
         * }
         */
        function uploadFilesToAmazonS3(filesDetail) {
            
            var deferred = $q.defer();
            var totalFiles = filesDetail.length;
            var uploadProcessed = 0;
            var fileUploadProgress = [];
            var fileUploadRes = {
                'data': {
                    // data for each file will added dynamically when file upload processed.
                },
                'uploadSuccess': 0,
                'uploadFailed': 0
            }
            var index = 0;
            function makeNextUploadRequest() {
                if(index < filesDetail.length) {
                    var fileDetail = filesDetail[index];
                    deferred.notify({
                        'uploadProcessing': index +1,
                        'uploadProcessed': uploadProcessed,
                        'totalFiles': totalFiles,
                        'progress': 1
                    });
                    processFileUploadToAmazonS3(fileDetail, index).then(
                        function(res) {
                            uploadProcessed += 1;
                            fileUploadRes.uploadSuccess += 1;
                            fileUploadRes.data[res.fileKey] = {
                                'isSuccess': true,
                                'uploadUrl': res.url,
                                'error': null
                            }
                            if(uploadProcessed == totalFiles) {
                                // all files upload processed
                                if(fileUploadRes.uploadSuccess == totalFiles) {
                                    deferred.resolve(fileUploadRes);
                                } else {
                                    deferred.reject(fileUploadRes);
                                }
                            } else {
                                index++;
                                makeNextUploadRequest();
                            }
                        },
                        function(err) {
                            $log.error(err);
                            uploadProcessed += 1;
                            fileUploadRes.uploadFailed += 1;
                            fileUploadRes.data[err.fileKey] = {
                                'isSuccess': false,
                                'uploadUrl': "",
                                'error': err.error
                            }
                            if(uploadProcessed == totalFiles) {
                                // all files upload processed
                                deferred.reject(fileUploadRes);
                            } else {
                                index++;
                                makeNextUploadRequest();
                            }
                        },
                        function(progress) {
                            deferred.notify({
                                'uploadProcessing': index + 1,
                                'uploadProcessed': uploadProcessed,
                                'totalFiles': totalFiles,
                                'progress': progress.progress 
                            });
                        }
                    );
                }           
            }
            makeNextUploadRequest();
            return deferred.promise;
        }

        /*
         * Step 1 : get presigned url from API
         * Step 2 : upload file to amazon S3 via presigned URL
         * Step 3 : parse the file URL and return as response via promise function
         */
        function processFileUploadToAmazonS3(fileDetail, index) {
            var deferred = $q.defer();
            var apiUrl = $rootScope.serverURL +
                '/customer/getdoclink?' +
                'path=' + fileDetail.basePath + '&' +
                'filetype=' + fileDetail.file.name.split('.').pop();
            HttpService.HttpGetData(apiUrl).then(function(res) {
                if(res?res.data?res.data.url:false:false) {
                    var urlParts = res.data.url.split("?");
                    var fileUrl = (urlParts && urlParts.length) ? urlParts[0] : "";
                    if(fileUrl) {
                        // upload file to amazon S3
                        const xhr = new XMLHttpRequest();
                        xhr.upload.addEventListener('progress', function(e){
                            deferred.notify({
                                'index': index,
                                'progress': ((e.total != 0) ? Math.round(e.loaded / e.total * 100) : 0)
                            });
                        }, false)
                        xhr.addEventListener('loadend', function(){
                            if(xhr.status == 200) {
                                deferred.resolve({
                                    'index': index,
                                    'fileKey': fileDetail.fileKey,
                                    'url': fileUrl
                                });
                            } else {
                                $log.error("there was an error while uploading a file");
                                deferred.reject({
                                    'index': index,
                                    'fileKey': fileDetail.fileKey,
                                    'error': "there was an error while uploading a file"
                                });
                            }
                        });
                        xhr.open('PUT', res.data.url, true);
                        xhr.setRequestHeader("Content-type", fileDetail.file.type);
                        xhr.send(fileDetail.file);
                    } else {
                        $log.error("didn't get valid presigned URL to upload a file");
                        deferred.reject({
                            'index': index,
                            'fileKey': fileDetail.fileKey,
                            'error': "didn't get valid presigned URL to upload a file"
                        });
                    }
                } else {
                    $log.error("unable to fetch presigned URL for file upload");
                    deferred.reject({
                        'index': index,
                        'fileKey': fileDetail.fileKey,
                        'error': "unable to fetch presigned URL for file upload"
                    });
                }
            }).catch(function(error) {
                $log.error("unexpected error occurred while fetching presigned URL for file upload");
                deferred.reject({
                    'index': index,
                    'fileKey': fileDetail.fileKey,
                    'error': "unexpected error occurred while fetching presigned URL for file upload"
                });
            });
            return deferred.promise;
        }
    });




app.directive('modal', function () {
    return {
        template: '<div class="modal fade" data-backdrop="static" data-keyboard="false">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="uncheckAllStudents()">&times;</button>' +
            '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;
            scope.$watch(attrs.visible, function (value) {
                if (value === true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });
            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });
            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

app.factory('sidebarService', function ($log) {
    return {
        showSideNav: true,
        update: function (showSideNavStatus) {
            this.showSideNav = showSideNavStatus;
        }
    };
});

app.controller('headercontroller', function ($scope, $location, UtilService, sidebarService, $rootScope, busService, $sessionStorage, $log, HandShakeService) {

    var playSound = playSound;
    $rootScope.$on('callHeaderController', function () {
        $log.debug('callHeaderController called in headercontroller');
        $rootScope.showVer = true;
        $scope.state = false;
        $scope.showSideNav = true;
        $scope.unSeen = 0;
        $scope.toggleState = function () {
            $rootScope.showVer = false;
            $scope.showSideNav = !$scope.showSideNav;
            $scope.state = !$scope.state;
            sidebarService.update($scope.showSideNav);
        };
        $scope.isActive = function (route) {
            return route === $location.path();
        };

        $scope.showSubMenuFunc = function () {
            $rootScope.global.showSettingSubMenu = !$rootScope.global.showSettingSubMenu;
        };
        $scope.schoolName = angular.fromJson($sessionStorage.profileInfo).name;
        ;
        $scope.alertList = [];
        $rootScope.$on('delayNotify', function () {

            //            $scope.alertList = angular.fromJson($sessionStorage.alertList);
            $scope.alertList = UtilService.alertList;
            $scope.unSeen = 0;
            angular.forEach($scope.alertList, function (alerts) {
                if (alerts.shown === 0) {
                    $scope.unSeen++;
                }
            });
            playSound('notify');
        });
        function playSound(filename) {
            document.getElementById("sound").innerHTML = '<audio autoplay="autoplay"><source src="../../assets/img/' + filename + '.mp3" type="audio/mpeg" /><source src="../../assets/img/' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="../../assets/img/' + filename + '.mp3" /></audio>';
        }
        ;
        $scope.allSeen = function () {
            // alert("util.js");
            // $scope.notification = true;
            // console.log($scope.alertList);
            // $scope.unSeen = 0;
            //    $scope.alertList = [];
            //    $scope.alertList = UtilService.alertList;
            if ($scope.alertList != undefined) {
                $scope.unSeen = 0;
                angular.forEach($scope.alertList, function (alerts) {
                    if (alerts.shown === 1) {
                        alerts.seen = 1;
                    }


                    alerts.shown = 1;
                    $scope.unSeen = 0;
                });
                UtilService.alertList = $scope.alertList;
            }

        };


        // HandShakeService.stuwarningcheck();
        if (busService.unassignedDeviceList.length == 0 && busService.busList.length > 0) {
            $rootScope.global.buswarning = false;
        }
        // HandShakeService.routewarningcheck();

    });
});
app.directive('dropdownMultiselect', function ($log) {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            options: '=',
            //pre_selected: '=preSelected',
            dropdownTitle: '@'
        },
        template: "<div class='col-sm-10' data-ng-class='{open: open}'>" +
            // "<button class='btn btn-small'>{{dropdownTitle}}</button>" +
            // "<a href='#'><span class='form-control'>Select</span><p class='multiSel'></p> </a>" +
            "<input class='form-control' ng-click='open=!open;openDropDown()' name='comment' placeholder='{{pamp}}' ></input>" +
            //"<button class='btn btn-small dropdown-toggle form-control' data-ng-click='open=!open;openDropDown()'><span class='caret'></span></button>" +
            "<ul style='margin-left:13px;max-height:300px;overflow: auto;' class='col-sm-10 dropdown-menu scrollable-menu' aria-labelledby='dropdownMenu'>" +
            "<li><input style='margin-left:10px;margin-right:4px;' type='checkbox' data-ng-change='checkAllClicked()' data-ng-model=checkAll> Check All</li>" +
            "<li class='divider'></li>" +
            "<li data-ng-repeat='option in options'> <input style='margin-left:10px;margin-right:4px;' type='checkbox' data-ng-change='setSelectedItem(option.id)' ng-model='selectedItems[option.id]'>{{option.name}}</li>" +
            "</ul>" +
            "</div>",
        controller: function ($scope) {
            $scope.selectedItems = {};
            $scope.checkAll = false;
            init();
            function init() {
                $scope.pamp = "Select Classes to Announce";
            }

            $scope.openDropDown = function () {
            }

            $scope.checkAllClicked = function () {
                if ($scope.checkAll) {
                    selectAll();
                } else {
                    deselectAll();
                }
            }

            function selectAll() {
                $scope.model = [];
                $scope.selectedItems = {};
                angular.forEach($scope.options, function (option) {
                    $scope.model.push(option.id);
                });
                angular.forEach($scope.model, function (id) {
                    $scope.selectedItems[id] = true;
                });
                $scope.pamp = "All Classes";
            }
            ;
            function deselectAll() {
                $scope.model = [];
                $scope.selectedItems = {};
                $log.debug($scope.model);
                $scope.pamp = "Select Class to Announce";
            }
            ;
            $scope.setSelectedItem = function (id) {
                var filteredArray = [];
                if ($scope.selectedItems[id] == true) {
                    $scope.model.push(id);
                } else {
                    filteredArray = $scope.model.filter(function (value) {
                        return value != id;
                    });
                    $scope.model = filteredArray;
                    $scope.checkAll = false;
                    $scope.pamp = filteredArray;
                }
                $log.debug(filteredArray);
                modelToDisplay();
                return false;
            };
            function modelToDisplay() {
                $scope.pamp = "";
                $log.debug('Init modelToDisplay ' + $scope.pamp);
                angular.forEach($scope.model, function (id) {
                    angular.forEach($scope.options, function (option) {
                        if (option.id == id) {
                            $scope.pamp += option.name;
                            $scope.pamp += ", ";
                        }
                    });
                });
                $log.debug('End modelToDisplay ' + $scope.pamp);
            }
        }
    }
});
app.directive('myPageLoader', function ($rootScope) {
    return {
        template: '<div class="modal-backdrop fade in"><img id="loadingif"  src="../../assets/img/LoadingPage.gif" /></div>'
    };
});

app.directive('file', function () {
    return {
        restrict: 'AE',
        scope: {
            file: '@'
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                var file = files[0];
                scope.file = file;
                scope.$parent.file = file;
                scope.$apply();
            });
        }
    };
});

app.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value, 10);
            });
        }
    };
});
app.directive('partialReadonly', function () {
    return {
        restrict: 'A',
        link: function ($scope, $element, attrs, $log) {

            $element.on('keypress, keydown', function (event) {
                var readOnlyLength = attrs["partialReadonly"].length;
                if ((event.which != 37 && (event.which != 39))
                    && (($element[0].selectionStart < readOnlyLength)
                        || (($element[0].selectionStart == readOnlyLength) && (event.which == 8))
                        || (($element[0].selectionStart > readOnlyLength) && (event.which != 8)))) {
                    return false;
                }
            });
            $scope.load = function () {
                $scope.temp = attrs["partialReadonly"];
            };
        }
    };
});
app.directive('uppercased', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform", "uppercase");
        }
    };
});
app.directive('routeLoadingIndicator', function ($rootScope) {
    return {
        restrict: 'E',
        template: "<div class='routeLoad'  ng-if='isRouteLoading'><h1>Loading <i class='fa fa-cog fa-spin'></i></h1></div>",
        link: function (scope, elem, attrs) {
            scope.isRouteLoading = false;
            $rootScope.$on('$routeChangeStart', function () {
                scope.isRouteLoading = true;
            });
            $rootScope.$on('$routeChangeSuccess', function () {
                scope.isRouteLoading = false;
            });
        }
    };
});

app.factory('socket', function ($rootScope, $log, constantService) {


    //    $rootScope.serverURL = 'https://api.zuwagon.com';
    //    $rootScope.serverURL = 'http://localhost:5000';
    $rootScope.serverURL = constantService.serverURL;

    //    $rootScope.serverURL = 'devapi.zuwagon.com';
    //var socket = io.connect($rootScope.serverURL, {'sync disconnect on unload': true});
    var socket = '';
    return {
        isConnected: false,
        connectit: function () {
            $log.debug('socket connectit called');
            socket = io.connect(constantService.serverURL, { 'sync disconnect on unload': true });
        },
        on: function (eventName, callback) {
            //            $log.debug('socket ' + eventName);
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        once: function (eventName, callback) {
            socket.once(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        disconnect: function () {
            socket.disconnect();
        },
        isConnect: function () {
            return socket.connected;
        },
    };
});
//replace="[^a-zA-Z]" with=""
app.directive('replace', function () {
    return {
        require: 'ngModel',
        scope: {
            regex: '@replace',
            with: '@with'
        },
        link: function (scope, element, attrs, model) {
            model.$parsers.push(function (val) {
                if (!val) {
                    return;
                }
                var regex = new RegExp(scope.regex);
                var replaced = val.replace(regex, scope.with);
                if (replaced !== val) {
                    model.$setViewValue(replaced);
                    model.$render();
                }
                return replaced;
            });
        }
    };
});

app.directive('exportTable', function () {
    var link = function ($scope, elm, attr) {
        $scope.$on('export-pdf', function (e, d) {
            elm.tableExport({ type: 'pdf', escape: false });
        });
        $scope.$on('export-excel', function (e, d) {
            elm.tableExport({ type: 'excel', escape: false });
        });
        $scope.$on('export-doc', function (e, d) {
            elm.tableExport({ type: 'doc', escape: false });
        });
        $scope.$on('export-csv', function (e, d) {
            elm.tableExport({ type: 'csv', escape: false });
        });
    }
    return {
        restrict: 'C',
        link: link
    }
});



//app.factory('Excel', function ($window) {
//    var uri = 'data:application/vnd.ms-excel;base64,',
//            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
//            base64 = function (s) {
//                return $window.btoa(unescape(encodeURIComponent(s)));
//            },
//            format = function (s, c) {
//                return s.replace(/{(\w+)}/g, function (m, p) {
//                    return c[p];
//                })
//            };
//    return {
//        tableToExcel: function (tableId, worksheetName) {
//            var table = $(tableId),
//                    ctx = {worksheet: worksheetName, table: table.html()},
//                    href = uri + base64(format(template, ctx));
//            return href;
//        }
//    };
//
//
//})



