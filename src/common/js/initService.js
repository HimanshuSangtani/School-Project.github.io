/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


app.factory('InitService', function ($q, HandShakeService, $log, $rootScope, $http, $timeout, FlashService, $location, mapService, $interval) {
    var InitService = {};
    InitService.isInitialized = false;
    InitService.handshakeInit = handshakeInit;
    return InitService;
    function handshakeInit(fbuser, defer) {

        $log.debug('InitService - handshakeInit called');


        $rootScope.firebaseUser = fbuser;
        $rootScope.firebaseUser.getToken(true).then(function (result) {});
        var fbuserJSONParsed = JSON.parse(JSON.stringify(fbuser));
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + fbuserJSONParsed.stsTokenManager.accessToken;
        var decoded = jwt_decode(fbuserJSONParsed.stsTokenManager.accessToken);
        // var decoded;
        if(decoded){
            var userData = {
                'type': 'ADMIN',
                'user_id': decoded['user_id']
            }
            localStorage.setItem("currentUserDetail", JSON.stringify(userData));
        }
        if (InitService.isInitialized == true)
        {
            $log.debug('InitService - handshakeInit already, isInitialized true');
            $rootScope.toolbar.visible = true;
            defer.resolve();
        } else
        {
            $log.debug('InitService - handshake not done, doing handshake');
            mapService.socketConnection();
            HandShakeService.fullHandShake().then(function (result) {
                InitService.isInitialized = true;
                $rootScope.toolbar.visible = true;
                defer.resolve();
                mapService.updateBusLists();
                HandShakeService.hanshakeInProgress = false;
                $rootScope.$broadcast('handshakefinished');
            }, function (error) {
                $rootScope.firebaseUser.getToken(true).then(function (result) {
                    $location.path('/login');
                    FlashService.Error(error);
                    defer.reject(error);
                });
                
            });
        }

        if (!angular.isDefined($rootScope.refreshTokenStop))
        {
            $rootScope.firebaseUser.getToken(true).then(function (result) {});
            $rootScope.refreshTokenStop = $interval(function () {
                $rootScope.firebaseUser.getToken(true).then(function (result) {});
            }, 55 * 60 * 1000);
        }
    }
    ;
});
