/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


app.factory('busService', function (HttpService, FlashService, $sessionStorage, $rootScope, $q, $log) {


    var busService = {};
    busService.busDeviceList = [];
    busService.busList = [];
    busService.unassignedDeviceList = [];
    busService.getBusDeviceList = getBusDeviceList;
    return busService;
    function getBusDeviceList() {

        var defer = $q.defer();

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/handshake');
        requestHandle.then(function (result) {
            if (result.success == true)
            {

                $log.debug('getBusDeviceList = ' + result.data.fleet + 'length' + result.data.fleet.length);
                busService.busDeviceList = result.data.fleet;
                //$sessionStorage.tripDetails = JSON.stringify(result.data.trip);
                var busList = [];
                var unassignedDeviceList = [];
                angular.forEach(result.data.fleet, function (busDeviceObject) {
                    if (busDeviceObject.bus_number == null || busDeviceObject.bus_number == '' || busDeviceObject.bus_number == undefined)
                    {
                        unassignedDeviceList.push(busDeviceObject);
                    } else
                    {
                        busList.push(busDeviceObject);
                    }
                });
                busService.busList = busList;
                //$sessionStorage.busList = JSON.stringify(busList);
                busService.unassignedDeviceList = unassignedDeviceList;
                //$sessionStorage.unassignedDeviceList =JSON.stringify(unassignedDeviceList);
                if (result.data.info.alert_idle == undefined)
                {
                    result.data.info.alert_idle = 5;
                }
                if (result.data.info.alert_speed == undefined)
                {
                    result.data.info.alert_speed = 60;
                }
                $sessionStorage.profileInfo = JSON.stringify(result.data.info);
                defer.resolve();
            } else
            {
                if (result.data == null || result.data == '' || result.data == undefined)
                {
                    FlashService.Error('Oops, something went wrong! Please login again.');
                } else
                {
                    FlashService.Error(result.data);
                }

                defer.reject();
            }
        }
        );
        return defer.promise;
    }
}
);