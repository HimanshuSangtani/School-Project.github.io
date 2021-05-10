
//angular
//        .module('TrackWebApp')
app.factory('HttpService',
        //UserService.$inject = ['$http'];
                function HttpService($http, $rootScope, $location,FlashService) {
                    var service = {};

                    service.HttpGetData = HttpGetData;
                    service.HttpPostData = HttpPostData;
                    service.HttpUpdateData = HttpUpdateData;
                    service.HttpDeleteData = HttpDeleteData;

                    return service;

                    function refreshToken(){$rootScope.firebaseUser.getToken().then(function (result) {
                        //console.log(result)
                    });}

                    function HttpGetData(url) {
                        $rootScope.mypageloading = true;
                        refreshToken();
                        return $http.get(url).then(handleSuccess, handleError);
                    }

                    function HttpPostData(url, data) {
                        $rootScope.mypageloading = true;
                        refreshToken();
                        return $http.post(url, data).then(handleSuccess, handleError);
                    }

                    function HttpUpdateData(url, data) {
                        $rootScope.mypageloading = true;
                        refreshToken();
                        return $http.put(url, data).then(handleSuccess, handleError);
                    }

                    function HttpDeleteData(url) {
                        $rootScope.mypageloading = true;
                        refreshToken();
                        return $http.delete(url).then(handleSuccess, handleError);
                    }


                    // private functions

                    function handleSuccess(response) {
                        $rootScope.mypageloading = false;
                       $rootScope.global.error = '';
                        return {success: true, data: response.data};

                    }

                    function handleError(response) {
                        $rootScope.mypageloading = false;
                        
                        if (response.status == '401')
                        {
                            if ($location.path() != '/login')
                            {
                                //alert('Your session has expired! Please login again.');
                                $rootScope.firebaseUser.getToken(true).then(function (result) {});
                                $location.path('/login');
                            }

                        }
                        else if (response.status == '500' || response.status == '-1')
                        {
                            
                            $rootScope.global.error = 'Error connecting server, please try again after sometime.';
                        }
                        else if(response.status == '400')
                        {
                            if(response.data == null || response.data == '' || response.data == undefined)
                                response.data = 'Oops something went wrong, please try again after sometime';
                        }
                        else if(response.status == '404')
                        {
                            if(response.data.message) {
                                // message is already coming from server
                            } else {
                                response.data = 'Bad request.';
                            }
                        }
                        


                        if (response == null || response == '' || response == undefined || response.data == null || response.data == '' || response.data == undefined)
                        {
                            FlashService.Error('Oops, something went wrong! Please login again.');
                        }
                        else
                        {
                            FlashService.Error(response.data);
                        }

                        return {success: false, data: response.data};
                    }
                }

        );