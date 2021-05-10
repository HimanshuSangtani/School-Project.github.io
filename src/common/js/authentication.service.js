

//angular
//        .module('TrackWebApp')
app.factory('AuthenticationService',
        function ($http, $cookies, $rootScope, $log, HttpService, jwtHelper) {
            var service = {};

            service.Login = Login;
            service.SetCredentials = SetCredentials;
            service.ClearCredentials = ClearCredentials;

            return service;

            function Login(eMailid, password, callback) {
                $http.defaults.headers.common.Authorization.delete;

                $log.debug('Auth login called');
                var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/auth/admin', {email: eMailid, password: password, client_id: 'customerapp'});
                requestHandle.then(function (result) {

                    if (result.success == true)
                    {
                        //alert('result ' + result);
                        $log.debug('result.data ' + result.data.token);
                        //alert('result.data ' + result.data.token);

                    }
                    callback(result);
                });
            }

            function SetCredentials(eMailid, authdata) {
                //var authdata = Base64.encode(eMailid + ':' + password);
                $rootScope.customerData = {
                    currentUser: {
                        eMailid: eMailid,
                        authdata: authdata
                    }
                };
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + authdata; // jshint ignore:line

                var tokenPayload = jwtHelper.decodeToken(authdata);
                var date = jwtHelper.getTokenExpirationDate(authdata);
                $log.debug('tokenPayload ' + tokenPayload);
                $log.debug('tokenPayload ' + date);

                $cookies.put('customerData', JSON.stringify($rootScope.customerData), {'expires': date});
                $log.debug('cookie expiry date : ' + date);
            }

            function ClearCredentials() {
                $log.debug('clear cred call');

                $rootScope.customerData = {};
                $cookies.remove('customerData');
                $http.defaults.headers.common.Authorization = 'Bearer';
            }
        }
);


app.factory("Auth", ["$firebaseAuth", "firebase",
    function ($firebaseAuth, firebase) {
       
        return $firebaseAuth();
    }
]);


