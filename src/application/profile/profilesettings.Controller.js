app.controller('profileSettingsController', function ($rootScope, $scope, $sessionStorage, UtilService, busService, FlashService, $http, $log, Auth) {
    $log.debug("profileSettingsController reporting for duty.");
    UtilService.setSidebar();

    $rootScope.showBackStrech = false;
    var vm = this;
    
    $scope.showAddNewBusModal = false;
    $scope.showModalPW = true;

    $scope.profileInfo = angular.fromJson($sessionStorage.profileInfo);
    $scope.busList = busService.busList;
    $rootScope.global.showSettingSubMenu = true;
    vm.deviceCount = $scope.busList.length;
    vm.name = $scope.profileInfo.name;
    vm.email = $scope.profileInfo.email;
    vm.changeaccpswd = changeaccpswd;
    vm.resetdevpswd = resetdevpswd;
    vm.resetpopacc = resetpopacc;
    vm.resetpopdev = resetpopdev;
    vm.modalheader = 'tt';
    vm.devmodal = true;
    var expiryDate = new Date($scope.profileInfo.license_expire);
    var tempDate = new Date();
    //tempDate = Date(expiryDate);
    $log.debug('tempDate = ' + tempDate.toDateString());
    vm.license_expire = expiryDate.toDateString();

    vm.address = $scope.profileInfo.address;
    $log.debug('$scope.profileInfo.dev_email = ' + $scope.profileInfo.dev_email);
    vm.dev_email = $scope.profileInfo.dev_email;
    $log.debug('vm.dev_email = ' + vm.dev_email);

    $scope.requestPwChange = function () {
        vm.modalheader = 'Change Zuwagon account Password';
//        var pwObject = {
//            old_pass: vm.old_pass,
//            new_pass: vm.new_pass
//        };
//        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/auth/passwordchange', pwObject);
//        requestHandle.then(function (result) {
//            if (result.success)
//            {
//                angular.element('#myModal').modal('hide');
//
//            }
//            else
//            {
//                if (result.data == null || result.data == '' || result.data == undefined)
//                {
//                    FlashService.Error('Oops, something went wrong! Please login again.');
//                }
//                else
//                {
//                    FlashService.Error(result.data);
//                }
//            }
//        });


    };


    vm.cancel = function () {
        vm.accpass = false;
        vm.devpass = false;
        FlashService.Error('');
    };


    vm.accpass = false;
    vm.devpass = false;
    vm.resetdone = false;
    vm.pswdconfirmmsg = 'Do you want to reset Zuwagon device password?';

    function resetpopacc() {
        $log.debug('resetpopacc called');
        FlashService.Error('');

//        vm.devmodal = false;
//        vm.modalheader = 'Change Zuwagon account Password';
        vm.old_pass = '';
        vm.new_pass = '';
        vm.accpass = true;
        vm.devpass = false;
        vm.mailsent = '';
        //$rootScope.$broadcast('devmodal', 0);
//        var pp = angular.element(document.querySelector('#myModal'));
//        $compile(pp)($scope);

    }

    function resetpopdev() {
        $log.debug('resetpopdev');
        vm.devpass = true;
        vm.accpass = false;
        vm.modalheader = 'Reset Zuwagon Driver App apssword';
        FlashService.Error('');
//        vm.devmodal = true;
//        $rootScope.$broadcast('devmodal', 1);
//        var pp = angular.element(document.querySelector('#myModal'));
//        $compile(pp)($scope);
    }
    function resetdevpswd() {
        $rootScope.mypageloading = true;
        $log.debug('resetdevpswd  called');
        //var firebaseuser = Auth.$currentUser;
//        $rootScope.firebaseUser.reauthenticate(Auth.credential)
        Auth.$requireSignIn()
                .then(function (fbuser) {
                    var temp = JSON.parse(JSON.stringify(fbuser));
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + temp.stsTokenManager.accessToken;
                    Auth.$sendPasswordResetEmail(vm.dev_email).then(function () {
                        $log.debug('Email sent to ' + vm.dev_emai);
                        vm.resetdone = true;
                        vm.mailsent = 'Reset Email sent to ' + vm.dev_email;
                    }, function (error) {
                        $log.debug('Issue in sending email');
                    });
                    $rootScope.mypageloading = false;
                    vm.devpass = false;
                }, function (error) {
                    FlashService.Error(error);
                    $rootScope.mypageloading = false;
                    angular.element('#myModal').modal('hide');
                });
        //Auth.resetpass(vm.dev_email)
    }
    ;

    function changeaccpswd() {
        $log.debug('changeaccpswd  called');
        FlashService.Error('');
        Auth.$signInWithEmailAndPassword(vm.email, vm.old_pass).then(function (fbuser) {
            var temp = JSON.parse(JSON.stringify(fbuser));
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + temp.stsTokenManager.accessToken;

            fbuser.updatePassword(vm.new_pass).then(function (data) {
                $log.debug('updatepass success');
                vm.accpass = false;

            }, function (error) {
                $log.debug('updatepass fail');
                FlashService.Error(error);
            });

//            $log.debug('login failed, incorrect password = ' + result.data);
//            FlashService.Error(result.data);
        }, function (error) {
            $log.debug('login failed, incorrect password = ' + error);
            FlashService.Error(error);
        });
        //Auth.resetpass(vm.dev_email);
    }
    ;
});

//app.controller('profilepopupcontroller', function ($scope,$log) {
//    $log.debug('profilepopupcontroller called');
//    $scope.$on('devmodal', function (event, arg) {
//        $scope.devmodal = arg;
//        if ($scope.devmodal)
//        {
//
//            $scope.modalheader = 'Reset Zuwagon Driver App apssword';
//            $scope.pswdconfirmmsg = 'Do you want to reset Zuwagon device password?';
//        }
//        else
//        {
//            $scope.modalheader = 'Change Zuwagon account Password';
//        }
//        $log.debug('$scope.devmodal = ' + $scope.devmodal);
//    });
//
//
//
//});

//app.factory('profilepopupservice', function ($log) {
//    return{
//        devmodal: true,
//        updaccmodal: function () {
//            $log.debug('updaccmodal called');
//            this.devmodal = false;
//        },
//        upddevmodal: function () {
//            $log.debug('upddevmodal called');
//
//            this.devmodal = true;
//        }
//    };
//});