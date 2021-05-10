app.controller('subjectController', function ($rootScope, $location, HandShakeService, busService, UtilService, FlashService, $scope, HttpService, $sessionStorage, $indexedDB, $log) {

                    
    UtilService.setSidebar();
    $scope.noStopWarning = false;
    $scope.EditSubjectName = '';
    $scope.modelType = 'Add';
    $scope.classSelect = '';
    $scope.classHash = [];
    $scope.viewClasses = false;
    $scope.showDataFromName = '';
    $scope.showDataFrom = [];

    $scope.subjectImage = {
        file: null,
        fileName: '',
        basePath: 'subject',
        fileKey: 'subjectImage'
    }

    $scope.selectedClassId = [];
    $scope.classes =[];
    
    $log.debug("routeController reporting for duty.");
    $rootScope.showBackStrech = false;
    
    // var routeInfo = this;

    $scope.newRouteList = [];
    var indexinediting = 0;
    $rootScope.mypageloading = false;
    $scope.busList = busService.busList;
    $scope.existingResultList = [];
    $scope.classList = [];
    $scope.classNameList = [];

    $scope.subjectImageChange = function(file) {
        $scope.subjectImage.file = file;
        $scope.subjectImage.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.subjectImage.imagePreview = e.target.result;
            $scope.newSubjectList['image'] = '';
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    $scope.deleteSubjectImage = function(type) {
        if(type == 'local'){
            $scope.subjectImage.file = null;
            $scope.subjectImage.fileName = '';
            $scope.subjectImage.imagePreview = '';
        }
        else{
            $scope.newSubjectList['image'] = '';
        }
       
    }
    
    $scope.getClasses = function () {
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;
            $scope.classes = result;
            $scope.getResult();

        });
    }
    $scope.getClasses();


    $log.debug('HandShakeService.existingRouteList passed');

    $scope.getResult = function () {
        
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject');
        requestHandle.then(function (result) {
            $scope.existingResultList = result.data;
            for(var i=0;i<=$scope.existingResultList.length-1;i++){
                $scope.classNameList = [];
                for(var j=0;j<=$scope.existingResultList[i].classes.length-1;j++){
                    for(var k=0;k<=$scope.classList.length-1;k++){
                        if($scope.existingResultList[i].classes[j] == $scope.classList[k]._id){
                            $scope.classNameList.push($scope.classList[k].name);
                        }

                    }
                }
                $scope.existingResultList[i].classname =  $scope.classNameList.toString();
                $scope.existingResultList[i].ClassNameArray = $scope.classNameList;
            }
        })
        

    }
   
    $scope.addNewClass = function () {
        $scope.modelType = 'Add';
        $scope.modelTitle = 'Add New Subject';
        $scope.selectedClassId = [];
        $scope.showAddNewRouteModal = !$scope.showAddNewRouteModal;
        $scope.newSubjectList = {
            "name":"",
            "classes":[]
        };
        $scope.subjectImage = {
            file: null,
            fileName: '',
            basePath: 'subject',
            fileKey: 'subjectImage'
        }
        FlashService.Error('');
    };

    var vm = this;
    $scope.saveSubject = function () {
        FlashService.Error('');
        if($scope.selectedClassId.length==0){
            FlashService.Error('Please Select Class ');
            return false;

        }
        function saveSubjectToServer(){
            var to = [];
            var class_list = [];
            angular.forEach($scope.selectedClassId, function (classId) {
                to.push($scope.classHash[classId._id]);
                class_list.push(classId._id);
            });
            vm.to = to.toString();
            vm.from = angular.fromJson($sessionStorage.profileInfo).name;
            vm.class_list = class_list;
            $scope.newSubjectList.classes =class_list
            $log.debug(' $scope.newSubjectList.length' + $scope.newSubjectList.length);
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/subject', $scope.newSubjectList);
                requestHandle.then(function (result) {
                    
                    
                if (result.success)
                {   
                    FlashService.Error(result.data.message);
                    $log.debug('upserted successfully in routeStore e= ');
                    $rootScope.mypageloading = false;
                    if(result.data.result == ''){
                        
                    }else{
                        $scope.showAddNewRouteModal = false;
                        $rootScope.global.routewarning = true;
                        $scope.existingResultList = $scope.existingResultList.concat(result.data);
                        $scope.getResult();
                    }
                    
                }
                else
                {
                    FlashService.Error(result.data);
                }
            });

        }

        if($scope.subjectImage?$scope.subjectImage.file:false) {
            $rootScope.mypageloading = true;
            UtilService.uploadFilesToAmazonS3([$scope.subjectImage]).then(
                function(fileUploadRes) {
                    if(fileUploadRes?fileUploadRes.data:false) {
                        angular.forEach(Object.keys(fileUploadRes.data),
                        function(key, index) {
                            $scope.newSubjectList.image = fileUploadRes.data[key].uploadUrl;
                            $scope.subjectImage.file = null;
                            $scope.subjectImage.fileName = '';
                            $scope.subjectImage.imagePreview = '';
                        });
                        saveSubjectToServer();
                    }
                },
                function(error) {
                    $log.error(error);
                    $rootScope.mypageloading = false;
                },
                function(progress) {
                    $rootScope.mypageloading = true;
                    $scope.uploadProgress = progress;
                }
            );
        } else {
            saveSubjectToServer();
        }
        
    };

    $scope.editRoute = function (Sub,$index) {
        $scope.subjectImage = {
            file: null,
            fileName: '',
            basePath: 'subject',
            fileKey: 'subjectImage'
        }
        $scope.selectedClassId = [];
        var class_list = [];
        angular.forEach(Sub.classes, function(item) {
        
            class_list.push({_id:item})
        })
        $scope.selectedClassId = class_list;
        $scope.modelType = 'Edit';
        $scope.EditSubjectName = Sub.name;
        $scope.EditSubjectId = Sub._id;
        $scope.newSubjectList = {
            "name":$scope.EditSubjectName,
            "image":Sub.image,
            "classes":[]
        };
        $log.debug('edit route called');
        $scope.showAddNewRouteModal = !$scope.showAddNewRouteModal;
        FlashService.Error('');
    };

    $scope.deleteRoute = function (Sub,$index) {
        $scope.selectedClassId = [];
        var class_list = [];
        angular.forEach(Sub.classes, function(item) {
        
            class_list.push({_id:item})
        })
        $scope.selectedClassId = class_list;
        $scope.EditSubjectName = Sub.name;
        $scope.EditSubjectId = Sub._id;
        $scope.newSubjectList = {
            "name":$scope.EditSubjectName,
            "classes":[$scope.selectedClassId]
        };
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/subject/' + $scope.EditSubjectId, $scope.newSubjectList);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true)
            {
                $log.debug('deleted successfully ');
                $scope.getResult();
            }else{
                $log.debug('deleted Unsuccessfully');
            }
        });
    }

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.showAddNewRouteModal = false;
        FlashService.Error('');
    };

    $scope.updateSubject = function () {
        FlashService.Error('');
        if($scope.selectedClassId.length==0){
            FlashService.Error('Please Select Class ');
            return false;

        }
        function updateSubjectToServer(){
            $scope.newSubjectList.classes =[$scope.classSelect]
            var to = [];
            var class_list = [];
            $scope.classHash = [];
            angular.forEach($scope.selectedClassId, function (classId) {
                to.push($scope.classHash[classId._id]);
                class_list.push(classId._id);
            });
            vm.to = to.toString();
            vm.from = angular.fromJson($sessionStorage.profileInfo).name;
            vm.class_list = class_list;
             $scope.newSubjectList.classes =class_list
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/subject/' + $scope.EditSubjectId, $scope.newSubjectList);
            $rootScope.mypageloading = true;
                requestHandle.then(function (result) {
                    $rootScope.mypageloading = false;
                    $scope.classSelect = "";
                    if (result.success == true)
                    {
                        FlashService.Error(result.data.message);
                        $scope.subjectImage = {}
                        if(result.data.result == ''){
                            
                        }else{
                            $scope.showAddNewRouteModal = false;
                            $scope.getResult();
                        }
                        
                    }
                    else
                    {
                        
                        FlashService.Error(result.data);
                        
                    }
            });
        }
        
        if($scope.subjectImage?$scope.subjectImage.file:false) {
            $rootScope.mypageloading = true;
            UtilService.uploadFilesToAmazonS3([$scope.subjectImage]).then(
                function(fileUploadRes) {
                    if(fileUploadRes?fileUploadRes.data:false) {
                        angular.forEach(Object.keys(fileUploadRes.data),
                        function(key, index) {
                            $scope.newSubjectList.image = fileUploadRes.data[key].uploadUrl;
                            $scope.subjectImage.file = null;
                            $scope.subjectImage.fileName = '';
                            $scope.subjectImage.imagePreview = '';
                        });
                        updateSubjectToServer();
                    }
                },
                function(error) {
                    $log.error(error);
                    $rootScope.mypageloading = false;
                },
                function(progress) {
                    $rootScope.mypageloading = true;
                    $scope.uploadProgress = progress;
                }
            );
        } else {
            updateSubjectToServer();
        }
    };

    $scope.selectedclass=function(id){
        
        $scope.classSelect = id;
        
    }


    function checkDuplicateEntries() {
        $log.debug('Inside check duplicate entries');
        for (var iterNew = 0; iterNew < $scope.existingResultList.length; iterNew++)
        {
            $log.debug($scope.existingResultList[iterNew].route_key);
            for (var iterInNew = iterNew + 1; iterInNew < $scope.existingResultList.length; iterInNew++)
            {
                if ($scope.existingResultList[iterInNew].route_key == $scope.existingResultList[iterNew].route_key ||
                        $scope.existingResultList[iterInNew].route_name == $scope.existingResultList[iterNew].route_name)
                {
                    return false;
                }
            }

            for (var iterExist = 0; iterExist < $scope.existingResultList.length; iterExist++)
            {
                if ($scope.existingResultList[iterExist].route_key == $scope.existingResultList[iterNew].route_key
                        || $scope.existingResultList[iterExist].route_name == $scope.existingResultList[iterNew].route_name)
                {
                    return false;
                }
            }
        }
        return true;
       
    }

    function checkDuplicateEntriesWhileUpdate() {
        $log.debug('Inside check duplicate entries while update');
        for (var iterExist = 0; iterExist < $scope.existingResultList.length; iterExist++)
        {
            if (iterExist == indexinediting)
            {
                if ($scope.existingResultList[iterExist] == $scope.newRouteList[0])
                {
                    return 0;
                }

            }
            else if ($scope.existingResultList[iterExist].route_key == $scope.newRouteList[0].route_key
                    || $scope.existingResultList[iterExist].route_name == $scope.newRouteList[0].route_name)
            {
                return -1;
            }
        }
        return 1;
        
    }

    $scope.viewclassList=function(Data){
        $scope.showDataFromName = '';
        $scope.showDataFrom = [];
        $scope.showDataFromName = Data.name;
        $scope.showDataFrom = Data.ClassNameArray;
        $scope.viewClasses = true;
    }
    $scope.example14settings = {
        scrollableHeight: '400px',
        scrollable: true,
        enableSearch: true
    };

    $scope.example14settings = {
        smartButtonMaxItems: 5,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };

    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "SubjectList.pdf");
        });
    }

});





