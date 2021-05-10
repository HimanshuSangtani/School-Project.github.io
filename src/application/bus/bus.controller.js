app.controller('busDBController', function ($rootScope, $scope, busService, HandShakeService, mapService, UtilService, HttpService, FlashService, $indexedDB, $log) {
    $log.debug("busDBController reporting for duty.");
    $rootScope.showBackStrech = false;
    var busInfo = this;

    $rootScope.toolbar.visible = true;
    $scope.showAddNewBusModal = false;

    UtilService.setSidebar();
    $scope.routeHash = [];
    $scope.busHash = [];
    $scope.busList = busService.busList;
    $log.debug('$scope.busList ' + $scope.busList);
    $scope.v_typeList = ['BIKE', 'CAR', 'BUS', 'TRUCK'];
    busInfo.selectedBus = {};

    $scope.unassignedDeviceList = busService.unassignedDeviceList;
    if ($scope.unassignedDeviceList.length == 0 && $scope.busList.length > 0)
    {
        $rootScope.global.buswarning = false;
    }

    HandShakeService.getRouteInfo().then(function (result) {
        busInfo.route_list = result;
        angular.forEach(busInfo.route_list, function (routeObj) {
            $scope.routeHash[routeObj._id] = routeObj;
        });
        angular.forEach($scope.unassignedDeviceList, function (busObj) {
            $scope.busHash[busObj._id] = busObj;
        });

        angular.forEach($scope.busList, function (busObj) {
            //if (busObj.route_id && $scope.routeHash[busObj.route_id])
            {
                //busObj.route_name = $scope.routeHash[busObj.route_id].route_name;
                $scope.busHash[busObj._id] = busObj;
            }

        });
    });





    $scope.addNewBus = function () {

        $log.debug('addnew bus called');

        $scope.showAddNewBusModal = !$scope.showAddNewBusModal;

        busInfo.editBusRoute = {};
        busInfo.selectedBus = {};

        busInfo.bus_number = '';
        busInfo.reg_no = '';
        busInfo.d_name = '';
        busInfo.d_contact = '';
        busInfo.d_license = '';
        busInfo.route_id = '';
        busInfo.v_type = '';

        busInfo.unassignedListIndex = '';
        FlashService.Error('');

        $scope.objects = [];


        $scope.busInfo.editableBusList = [];
        if ($scope.unassignedDeviceList.length)
            angular.copy($scope.unassignedDeviceList, $scope.busInfo.editableBusList);

    };

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.showAddNewBusModal = false;
        FlashService.Error('');
    };

    $scope.addBus = addBus;
    $scope.deleteBus = deleteBus;



    function addBus() {
        $log.debug('addBus called');
        $log.debug('busInfo._id  ' + busInfo.unassignedListIndex + ' busInfo.bus_number ' + busInfo.bus_number);


        var busInfoToSend = {
            reg_no: busInfo.reg_no,
            bus_number: busInfo.bus_number,
            d_name: busInfo.d_name,
            d_contact: busInfo.d_contact,
            route_id: busInfo.editBusRoute._id,
            d_license: busInfo.d_license,
            v_type: busInfo.v_type
        };
        busInfo.selectedBus._id;
        var duplicateCheck;
        if (!$scope.editing)
        {
            duplicateCheck = checkDuplicateEntries();
        } else
        {
            duplicateCheck = checkDuplicateEntriesWhileUpdate();
        }

        if (duplicateCheck == 1)
        {
//            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/bus/' +
//                    $scope.busInfo.editableBusList[$scope.busInfo.editableBusList.length - 1]._id,
//                    busInfoToSend);
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/bus/' +
                    busInfo.selectedBus._id,
                    busInfoToSend);
            requestHandle.then(function (result) {
                if (result.success == true)
                {
                    $scope.showAddNewBusModal = false;
                    if (!$scope.editing)
                    {
                        busInfoToSend._id = busInfo.selectedBus._id;
                        busInfoToSend.device_type = $scope.busHash[busInfo.selectedBus._id].device_type;
                        //busInfoToSend.device_type = busInfo.selectedBus.device_type;
                        if (busInfo.editBusRoute._id && $scope.routeHash[busInfo.editBusRoute._id])
                            busInfoToSend.route_name = $scope.routeHash[busInfo.editBusRoute._id].route_name;
                        busInfoToSend.number = $scope.busHash[busInfo.selectedBus._id].number;
                        $scope.busList.push(busInfoToSend);
                        for (var iter = 0; iter < $scope.unassignedDeviceList.length; iter++)
                        {
                            if ($scope.unassignedDeviceList[iter]._id == busInfo.selectedBus._id)
                            {
                                $scope.unassignedDeviceList.splice(iter, 1);
                                break;
                            }
                        }


                        mapService.busList = $scope.busList;

                        if ($scope.unassignedDeviceList.length == 0 && $scope.busList.length > 0)
                        {
                            $log.debug('buswarning 2');
                            $rootScope.global.buswarning = false;
                        }
                    } else
                    {
                        $scope.busHash[$scope.busIdInEditing].reg_no = busInfoToSend.reg_no;
                        $scope.busHash[$scope.busIdInEditing].bus_number = busInfoToSend.bus_number;
                        $scope.busHash[$scope.busIdInEditing].d_name = busInfoToSend.d_name;
                        $scope.busHash[$scope.busIdInEditing].d_contact = busInfoToSend.d_contact;
                        $scope.busHash[$scope.busIdInEditing].route_id = busInfoToSend.route_id;
                        $scope.busHash[$scope.busIdInEditing].d_license = busInfoToSend.d_license;
                        $scope.busHash[$scope.busIdInEditing].d_license = busInfoToSend.d_license;
                        $scope.busHash[$scope.busIdInEditing].d_license = busInfoToSend.d_license;
                        $scope.busHash[$scope.busIdInEditing].v_type = busInfoToSend.v_type;

                        if (busInfo.editBusRoute._id && $scope.routeHash[busInfo.editBusRoute._id])
                            $scope.busHash[$scope.busIdInEditing].route_name = $scope.routeHash[busInfo.editBusRoute._id].route_name;
                    }
                    $scope.editing = false;
                    busService.busList = $scope.busList;

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
        } else if (duplicateCheck == 0)
        {
            FlashService.Error('Bus Number should be unqiue.');
        } else
        {
            $scope.showAddNewBusModal = false;
            $scope.editing = false;
        }

    }
    ;

    //var indexinediting = 0;
    $scope.editBusInfo = function (id) {
        $log.debug('Editing bus info');
        $scope.busIdInEditing = id;
        $scope.busInfo.editableBusList = [];
        $scope.busInfo.editBusRoute = {};

        var editBusInfo = {
            bus_number: $scope.busHash[id].bus_number,
            reg_no: $scope.busHash[id].reg_no,
            d_name: $scope.busHash[id].d_name,
            d_contact: $scope.busHash[id].d_contact,
            d_license: $scope.busHash[id].d_license,
            route_id: $scope.busHash[id].route_id,
            _id: $scope.busHash[id]._id,
            v_type: $scope.busHash[id].v_type
        };

        $scope.busInfo.bus_number = editBusInfo.bus_number;
        $scope.busInfo.reg_no = editBusInfo.reg_no;
        $scope.busInfo.d_name = editBusInfo.d_name;
        $scope.busInfo.d_contact = editBusInfo.d_contact;
        $scope.busInfo.d_license = editBusInfo.d_license;
        $scope.busInfo.route_id = editBusInfo.route_id;
        $scope.busInfo._id = editBusInfo._id;
        $scope.busInfo.v_type = editBusInfo.v_type;

        angular.forEach($scope.busInfo.route_list, function (routeObj) {
            if (routeObj._id == editBusInfo.route_id)
            {
                angular.copy(routeObj, $scope.busInfo.editBusRoute);
                //$scope.busInfo.editBusRoute = routeObj;
            }
        });




        if ($scope.unassignedDeviceList.length)
            angular.copy($scope.unassignedDeviceList, $scope.busInfo.editableBusList);
        $scope.busInfo.editableBusList.push($scope.busHash[id]);
        $scope.busInfo.deviceId = $scope.busHash[id].number;


        busInfo.selectedBus._id = $scope.busHash[id]._id;
        busInfo.selectedBus.device_type = $scope.busHash[id].device_type;
        //$scope.unassignedDeviceList.push(editBusInfo);
        //$scope.busInfo.unassignedListIndex = $scope.unassignedDeviceList - 1 ;
        //$scope.busList.splice($index, 1);
        //$log.debug($scope.unassignedDeviceList.length);
        // busInfo.unassignedListIndex = ($scope.unassignedDeviceList.length - 1).toString();
        $scope.showAddNewBusModal = true;
        FlashService.Error('');
        $scope.editing = true;

        //indexinediting = $index;
    };

    $scope.cancelEdit = function ($index) {

        //$scope.busInfo.unassignedListIndex = $scope.unassignedDeviceList - 1 ;
        // $scope.busList.push($scope.unassignedDeviceList[$scope.unassignedDeviceList.length-1]);
        //$scope.unassignedDeviceList.splice($scope.unassignedDeviceList.length - 1, 1);
        $scope.showAddNewBusModal = false;
        $scope.editing = false;
        FlashService.Error('');
        $scope.busList;
        //busInfo.selectedBus = $scope.busList[$scope.busIndexInEditing ];
    };


    function deleteBus(id) {
        $log.debug('Deleting bus info, busno' + ' ' + $scope.busHash[id].bus_number);
        var confirmit = confirm('Routes associated with this bus will be not be effective on deletion of the bus.');

        if (confirmit)
        {
            var busId = $scope.busHash[id]._id;
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/bus/' + $scope.busHash[id]._id);
            requestHandle.then(function (result) {
                if (result.success == true)
                {
                    $scope.busHash[id].bus_number = '';
                    $scope.unassignedDeviceList.push($scope.busHash[id]);
                    
                    for(var i=0; i<  $scope.busList.length; i++)
                    {
                        if($scope.busList[i]._id == id)
                        {
                            $scope.busList.splice(i, 1);
                            break;
                        }
                    }
                    

                    busService.busList = $scope.busList;
                    //$sessionStorage.unassignedDeviceList =JSON.stringify($scope.unassignedDeviceList);
                    mapService.busList = $scope.busList;
                    for (var iter = 0; iter < mapService.mapBusList.length; iter++)
                    {
                        if (mapService.mapBusList[iter]._id == busId)
                        {
                            mapService.mapBusList.splice(iter, 1);
                            break;
                        }
                    }
                    if ($scope.unassignedDeviceList.length != 0 || $scope.busList.length == 0)
                    {
                        $rootScope.global.buswarning = true;
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
                }
            });
        }


    }


    function checkDuplicateEntries() {
        $log.debug('Inside check duplicate entries');
        for (var iter = 0; iter < $scope.busList.length; iter++)
        {
            if (busInfo.bus_number == $scope.busList[iter].bus_number)
            {
                return 0;
            }
        }
        return 1;
    }

    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "VehicleList.pdf");
          });
        
    }

    function checkDuplicateEntriesWhileUpdate() {
        $log.debug('Inside check duplicate entries');
        for (var iter = 0; iter < $scope.busInfo.editableBusList.length; iter++)
        {
            if ($scope.busInfo.editableBusList.length - 1 == iter)
            {
//                if (busInfo.bus_number == $scope.busInfo.editableBusList[iter].bus_number &&
//                        busInfo._id == $scope.busInfo.editableBusList[iter]._id && )
//                {
//                    return -1;
//                }
                return 1;
            } else if (busInfo.bus_number == $scope.busInfo.editableBusList[iter].bus_number)
            {
                return 0;
            }
        }
        return 1;
    }

    $scope.theftModeChange = function (bus) {
        // console.log('theft_mode = ' + bus.theft_mode)
        var theftObj = {
            _id: bus._id,
            theftmode: bus.theft_mode
        }
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/bus/antitheft/update/', theftObj);
        requestHandle.then(function (result) {
            if (result.success == true)
            {

            } else
            {
                bus.theft_mode = !bus.theft_mode;
            }
        });
    };

    var directAddVehicle = function(deviceList){
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/bus/fleet/', deviceList);
            requestHandle.then(function (result) {
                if (result.success == true) {
                    console.log('deviceList added')
                } else {
                    console.log('deviceList add fail')
                }
            });
    };


    var fileInput = document.getElementById("csv"),

    readFile = function () {
        Papa.parse(fileInput.files[0],  {
          header: true,
          dynamicTyping: true,
          complete: function(results) {
            data = results.data;
            var classNameCsvRow ;
            var deviceList = [];
            for(var i=0; i<data.length; i++) {
                if(data[i]['Student Image Path']) {
                    var name = data[i]['Student Image Path'].substring(data[i]['Student Image Path'].lastIndexOf('/')+1);
                    if(name.substring(name.lastIndexOf('.')+1).toLowerCase() !=  'jpg')
                        name = name +'.jpg';
                    deviceList.push(name);
                    data[i]['photo'] = name;
                } else {
                    console.log('Image path not available ' + i);
                }
            }
            // directAddVehicle(deviceList);
            var csv = Papa.unparse(data)
          }
        });
    };

    fileInput.addEventListener('change', readFile);


// [{
// "number": "10",
// "device_type": "GPS",
// "imei": "873426",
// "reg_no": "10",
// "bus_number": "10",
// "d_name": "10",
// "d_contact": "10",
// "d_license": "10",
// "v_type": "BIKE"
// }]

    // var fileInput = document.getElementById("csv"),

    // readFile = function () {
    //     Papa.parse(fileInput.files[0],  {
    //       header: true,
    //       dynamicTyping: true,
    //       complete: function(results) {
    //         data = results.data;
    //         var classNameCsvRow ;
    //         var deviceList = [];
    //         for(var i=0; i<data.length; i++) {
    //             if(data[i]['IMEI No. 1'] && data[i]['Bus N.'] && data[i]['Reg N'] && data[i]['Drivers Name']) {
    //                 deviceList.push({
    //                     "number": data[i]['Bus N.'],
    //                     "device_type": "Mobile-with-Rfid",
    //                     "imei": data[i]['IMEI No. 1'],
    //                     "reg_no": data[i]['Reg N'],
    //                     "bus_number": data[i]['Bus N.'],
    //                     "d_name": data[i]['Drivers Name'],
    //                     "d_contact": '1',
    //                     "d_license": "1",
    //                     "v_type": "BUS"
    //                 });
    //             }
    //         }
    //         directAddVehicle(deviceList);
    //       }
    //     });
    // };

    // fileInput.addEventListener('change', readFile);
});