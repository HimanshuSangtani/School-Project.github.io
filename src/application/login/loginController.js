app.controller('LoginController', function ($rootScope, $q, $location, $http, FlashService, $log, InitService, HandShakeService, mapService, socket, $timeout, Auth) {




    $rootScope.toolbar.visible = false;
    $rootScope.global.showModal = false;

    var credentials = this;
    $log.debug("login Controller - reporting for duty.");
    credentials.login = login;
    credentials.resetpass = resetpass;
    
   
    (function initController() {
        Auth.$signOut().then(function (data) {
            $log.debug('Auth signout success = ' + data);
            localStorage.removeItem("currentUserDetail");
            $rootScope.stopRefresh();

        }, function (error) {
            $log.debug('Auth signout error = ' + error);
        });
        HandShakeService.clearIndexedDB().then(function () {
            $log.debug('IndexDB Cleared successfully');
        });
        $timeout(function () {
            if (socket.isConnect())
            {
                socket.disconnect();
            }
        }, 1000);
        mapService.resetAllVar();
        InitService.isInitialized = false;
        var modalFadeElement = angular.element(".modal-backdrop");
        $log.debug('document.getElementsByClassName: ', modalFadeElement);

        if (modalFadeElement[0] != undefined)
        {
            modalFadeElement[0].style.display = 'none';
        }
    })();
    
    function login() {
        $log.debug('login called');
        credentials.dataLoading = true;
        Auth.$signInWithEmailAndPassword(credentials.eMailid, credentials.password).then(function (result) {
            function IntiateZuwagonService(fbuser) {
                var defer = $q.defer();
                InitService.handshakeInit(fbuser, defer);
                return defer.promise;
            }
            ;

            IntiateZuwagonService(result).then(function () {
                $location.path('/');
            }, function (error) {
                FlashService.Error(error);
                credentials.dataLoading = false;
            });

        }, function (error) {
            $log.debug('sign in error');
            $log.debug('error = ' + error.code);
            if (error.code == 'auth/wrong-password')
            {
                $log.debug('error = ' + error.code);
                error = 'Wrong password. Try again.';
            }
            FlashService.Error(error);
            credentials.dataLoading = false;
        });
    }
    ;
    $rootScope.showBackStrech = true;
    function resetpass() {
        $log.debug('resetpass login called');
        credentials.dataLoading = true;
        Auth.$sendPasswordResetEmail(credentials.eMailid).then(function() {
            credentials.dataLoading = false;
          // Email sent.
        }).catch(function(error) {
            credentials.dataLoading = false;
          // An error happened.
        });
        // Auth.resetpass(credentials.resetemail);
    }
    ;
});




