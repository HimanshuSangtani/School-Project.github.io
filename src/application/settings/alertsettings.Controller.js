app.controller('alertSettingsController', function ($rootScope, $scope, $sessionStorage, HttpService, FlashService, UtilService, $log, Auth) {
    $log.debug("alertSettingsController reporting for duty.");
    
    UtilService.setSidebar();
    $rootScope.global.showSettingSubMenu = true;
    $rootScope.showBackStrech = false;
    var vm = this;
    
    $scope.showAddNewBusModal = false;
    $scope.showModalPW = true;
    vm.speededit = false;
    vm.package = false;
    var profileInfo = angular.fromJson($sessionStorage.profileInfo);
    vm.alert_idle = profileInfo.alert_idle;
    vm.alert_speed = profileInfo.alert_speed;
    vm.package_name = profileInfo.package_name;
    vm.edit = function (editentity) {
        if (editentity == 'speed')
        {
            vm.speededit = true;
        }
        else if(editentity =="package"){
            vm.package = true;
        }
        else
        {
            vm.idleedit = true;
        }
    };

    vm.save = function () {
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/settings/alert', {alert_speed: vm.alert_speed, alert_idle: vm.alert_idle});
        requestHandle.then(function (result) {
            if (result.success == true)
            {
                $log.debug('result.data ' + result.data.token);
                vm.speededit = false;
                vm.idleedit = false;
                vm.package = false;
                profileInfo.alert_idle = vm.alert_idle;
                profileInfo.alert_speed = vm.alert_speed;
                $sessionStorage.profileInfo = JSON.stringify(profileInfo);
            }
            else
            {
                FlashService.Error(result.data);
            }
        });
    };
    vm.savePackage = function () {
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/settings/package',{package_name: vm.package_name});
        requestHandle.then(function (result) {
            if (result.success == true)
            {
                $log.debug('result.data ' + result.data.token);
                vm.speededit = false;
                vm.idleedit = false;
                vm.package = false;
                profileInfo.alert_idle = vm.alert_idle;
                profileInfo.alert_speed = vm.alert_speed;
                profileInfo.package_name = vm.package_name;
                $sessionStorage.profileInfo = JSON.stringify(profileInfo);
            }
            else
            {
                FlashService.Error(result.data);
            }
        });
    };

    vm.cancel = function () {
        FlashService.Error('');
        vm.speededit = false;
        vm.idleedit = false;
        vm.package = false;
        vm.alert_idle = profileInfo.alert_idle;
        vm.alert_speed = profileInfo.alert_speed;
    };

//    vm.modalheader = 'tt';
//    vm.devmodal = true;
//    var expiryDate = new Date($scope.profileInfo.license_expire);
//    var tempDate = new Date();
//    //tempDate = Date(expiryDate);
//    $log.debug('tempDate = ' + tempDate.toDateString());
//    vm.license_expire = expiryDate.toDateString();
//
//    vm.address = $scope.profileInfo.address;
//    $log.debug('$scope.profileInfo.dev_email = ' + $scope.profileInfo.dev_email);
//    vm.dev_email = $scope.profileInfo.dev_email;
//    $log.debug('vm.dev_email = ' + vm.dev_email);
//
//    $scope.requestPwChange = function () {
//        vm.modalheader = 'Change Zuwagon account Password';
////        var pwObject = {
////            old_pass: vm.old_pass,
////            new_pass: vm.new_pass
////        };
////        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/auth/passwordchange', pwObject);
////        requestHandle.then(function (result) {
////            if (result.success)
////            {
////                angular.element('#myModal').modal('hide');
////
////            }
////            else
////            {
////                if (result.data == null || result.data == '' || result.data == undefined)
////                {
////                    FlashService.Error('Oops, something went wrong! Please login again.');
////                }
////                else
////                {
////                    FlashService.Error(result.data);
////                }
////            }
////        });
//
//
//    };
//
//
//    vm.cancel = function () {
//        vm.accpass = false;
//        vm.devpass = false;
//        FlashService.Error('');
//    };

});
