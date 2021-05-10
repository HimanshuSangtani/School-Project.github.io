app.controller('announcementController', function ($scope, $rootScope, HttpService, HandShakeService, UtilService, FlashService, $sessionStorage, $log) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;

    $rootScope.mypageloading = true;
    $scope.classHash = [];
    $scope.selectedClassId = [];
    $scope.showForm = false;
    $scope.announcementList = [];
    $log.debug('HandShakeService.existingClassList call');


    var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/announcement');
    requestHandle.then(function (result) {
        if (result.success){
            var dateObject = '';
            $rootScope.mypageloading = false;
            $scope.announcementList = result.data;
            
            $log.debug('$scope.announcementLis = ' + JSON.stringify($scope.announcementList));
            angular.forEach($scope.announcementList, function (annObj) {
                dateObject = new Date(annObj.date);
                annObj.localDate = dateObject.toLocaleString();
            });
        } else {
            if (result.data == null || result.data == '' || result.data == undefined) {
                FlashService.Error('Oops, something went wrong! Please login again.');
            } else{
                FlashService.Error(result.data);
            }
        }
    });

    $log.debug('HandShakeService.existingClassList passed');
    var vm = this;
    $log.debug('in announcement conroller');
    vm.send = send;
    vm.cancel = cancel;
    vm.newMsg = newMsg;

    function send(to) {
        $log.debug('Send called!');
        $rootScope.mypageloading = true;
        var to = [];
        var class_list = [];

        angular.forEach($scope.selectedClassId, function (classId) {
            to.push($scope.classHash[classId._id]);
            class_list.push(classId._id);
        });

        if($scope.classes.length == $scope.selectedClassId.length) {
            vm.to = "All Classes";
        } else {
            vm.to = to.toString();
        }

        vm.from = angular.fromJson($sessionStorage.profileInfo).name;
        vm.class_list = class_list;
        $log.debug(vm.to);
        $log.debug(vm.sub);
        $log.debug(vm.msg);

        //vm.dataLoading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/announcement/send', vm);
        requestHandle.then(function (result) {
            if (result.success)
            {
                $log.debug('success');
                $scope.showForm = false;
                $rootScope.mypageloading = false;
                var dateObject = new Date();
                vm.localDate = dateObject.toLocaleString();
                $scope.announcementList.push(vm);
            } else
            {
                $log.debug('fail');
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

    function cancel() {
        $log.debug('cancel called');
        $scope.showForm = false;
    }


    function newMsg() {
        $scope.showForm = true;
        $scope.clearToBox = true;
        vm.to = "";
        vm.sub = "";
        vm.msg = "";
        $rootScope.mypageloading = true;
        $scope.selectedClassId = [];
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getGradeInfo received');
            //$scope.existingClassList = result;
            $rootScope.mypageloading = false;
            $scope.classes = result;
            $log.debug("classes = ", JSON.stringify(result));

            angular.forEach($scope.classes, function (classObject) {
                $scope.classHash[classObject._id] = classObject.name;
                $log.debug('classObject._id = ' + classObject._id + '$scope.classHash[classObject._id] = ' + $scope.classHash[classObject._id]);
            });
        }, function (error) {
            $rootScope.mypageloading = false;
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    }

    $scope.example14settings = {
        scrollableHeight: '400px',
        scrollable: true,
        enableSearch: true
    };


});





