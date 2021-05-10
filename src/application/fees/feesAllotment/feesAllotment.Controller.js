app.controller('feesAllotmentController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = true;
    $scope.viewAllotment = false;
    $scope.allotmentList = [];
    $scope.Category = []
    $scope.subCategory = []
    $scope.classList = [];
    $scope.existingRouteList =[];
    $scope.selectedId = [];
    $scope.MultiselectedLIsting = [];
    $scope.studentList =[];
    $scope.SelectedAmount = '';
    $scope.selectedClassId =[];
    $scope.SaveValues = {
        "feeType":"",
        "catSelect":"",
        "subcatSelect":"",
        "description":  '',

    };
   
    $scope.ShowSubCatError = false;
    

    




    $scope.allAllotment=function(){
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feeallotment');
            requestHandle.then(function (result) {
                
            if (result.success){

                $scope.allotmentList = result.data;
                var ArrayIndex = 0;
                angular.forEach( $scope.allotmentList, function (item) {
                    item.Datestatus = UtilService.checkDate(item);
                    
                    if(item.allotto == "CLASS"){
                        var Classes = [];
                        angular.forEach( item.allottoidlist, function (Subitem) {
                            for(var i=0;i<=$scope.classList.length-1;i++){
                                if(Subitem == $scope.classList[i]._id){
                                    Classes.push({"name":$scope.classList[i].name}) 
                                }
                        
                            }    
                            item.name =  Classes; 
                        })

                    }
                    if(item.allotto == "ROUTE"){
                        var routeName = [];
                        angular.forEach( item.allottoidlist, function (Subitem) {
                            for(var i=0;i<=$scope.existingRouteList.length-1;i++){
                                if(Subitem == $scope.existingRouteList[i]._id){
                                    routeName.push({"name":$scope.existingRouteList[i].route_name}) 
                                }
                            }
                            item.name =  routeName;
                        })
                    }
                    if(item.allotto == "STUDENT"){
                        var studentName = [];
                        angular.forEach( item.allottoidlist, function (Subitem) {
                             for(var i=0;i<=$scope.studentList.length-1;i++){
                                 if(Subitem == $scope.studentList[i]._id){
                                    studentName.push({"name":$scope.studentList[i].name}) 
                                 }
                             }
                             item.name =  studentName;  
                         })
                     }
                })
                $scope.allotmentList.sort(function(a,b){
                    return new Date(b.time) - new Date(a.time);
                });
                

                $rootScope.mypageloading = false;
                
                
            }
            else {
                FlashService.Error(result.message);
            }
        });
        
    }
    


    $scope.getRoute = function () {
        
        if($scope.existingRouteList.length != 0){
            return false;
        }
        HandShakeService.getRouteInfo().then(function (result) {
            $scope.existingRouteList = result;
            $scope.getStudent();
        });
    }

    $scope.getStudent = function () {
        $rootScope.mypageloading = true;
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.studentList = result;
            $scope.allAllotment();

        });
        
    }

    $scope.getClass = function () {
        if($scope.classList.length != 0){
            return false;
        }
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;
            $scope.getRoute();

        });
    }
    $scope.getClass();

    $scope.openFeeAllotment = function () {
        FlashService.Error('');
        $scope.SaveValues = {
            "feeType":"",
            "catSelect":"",
            "subcatSelect":""

        }
        $scope.ShowSubCatError = false;
        
        $scope.cat();
        $scope.showModel = 'Add';
        $scope.catSelect = '';
        $scope.selectedId = [];
        $scope.subcatSelect = '';
        $scope.SelectedAmount = '';
        $scope.SaveValues ={
            "description":  '',
        }
        $scope.showAddAllotment = true;
    }

    $scope.cat=function(){
        if($scope.Category.length != 0){
            return false;
        }
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat');
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                $scope.Category = result.data
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }
   

    $scope.selectedCat=function(id){
        
        FlashService.Error('');
        $scope.SaveValues.catSelect = id;
        $scope.ShowSubCatError = false;
        $scope.SaveValues.subcatSelect = '';
        $scope.SelectedAmount = 0;
        $scope.Subcat();
    }

    $scope.Subcat=function(){
        $rootScope.mypageloading = true;
         //var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat/'+$scope.catSelect);
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feesubcat?feecatid='+$scope.SaveValues.catSelect);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                $scope.subCategory = result.data
                if($scope.subCategory.length == 0){
                    $scope.ShowSubCatError = true;
                }
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }

    $scope.selectedSubCat=function(id){
       
        $scope.SaveValues.subcatSelect = id;
        $scope.PaidAmount();
    }

    $scope.PaidAmount=function(){
        FlashService.Error('');
        $rootScope.mypageloading = true;
        // var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat/'+$scope.catSelect);
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feesubcat/'+$scope.SaveValues.subcatSelect);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                $scope.SelectedAmount = result.data.amount;
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }

    var vm = this;
    $rootScope.mypageloading = false;
    $scope.save = function (){
        var Add = {
            "allotto": $scope.SaveValues.feeType,
            "allottoidlist": $scope.selectedId,
            "feecatid": $scope.SaveValues.catSelect,
            "feesubcatid": $scope.SaveValues.subcatSelect,
            "description": $scope.SaveValues.description
        }
        
        if(Add.allotto == '' || Add.allotto == undefined){
            FlashService.Error('Please Select Fee Type');
            return false;
        }
        if(Add.allottoidlist.length == 0){
            FlashService.Error(' Please select a '+ Add.allotto);
            return false;
        }
        if(Add.feecatid == '' || Add.feecatid == undefined){
            FlashService.Error('Please Select Category for '+ Add.allotto);
            return false;
        }
        if(Add.feesubcatid == '' || Add.feesubcatid == undefined){
            FlashService.Error('Please select a fee sub category for '+ Add.allotto);
            return false;
        }
        var to = [];
        var class_list = [];
        $scope.classHash = [];
        angular.forEach(Add.allottoidlist, function (classId) {
            to.push($scope.classHash[classId._id]);
            class_list.push(classId._id);
        });
        vm.to = to.toString();
        vm.from = angular.fromJson($sessionStorage.profileInfo).name;
        vm.class_list = class_list;
        Add.allottoidlist = class_list;
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feeallotment', Add);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    $scope.showAddAllotment = false;
                }else{
                    FlashService.Error(result.data.message);
                    $scope.allAllotment();
                    $scope.showAddAllotment = false;
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
        
    }
    $scope.selectedFeeFor=function(value){
        FlashService.Error('');
        $scope.SaveValues.feeType = value;
        $scope.MultiselectedLIsting = [];
        $scope.selectedId = [];
        
        if(value == "CLASS"){
            $scope.MultiselectedLIsting = $scope.classList;
        }
        if(value == "ROUTE"){
            $scope.MultiselectedLIsting = $scope.existingRouteList;
            var index = 0;
            angular.forEach( $scope.existingRouteList, function (item) {
                $scope.existingRouteList[index].name = item.route_name;
                index++;

            })

        }
        if(value == "STUDENT"){
            $scope.MultiselectedLIsting =$scope.studentList;
        }
        $scope.SaveValues.feeType = value;

    }
    $scope.change=function(){
        FlashService.Error('');
    }

    $scope.view=function(Data){
        $scope.showDataFromName = Data.allotto;
        $scope.showDataFrom = Data.name;
    $scope.viewAllotment = true;

    }
   
    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        
    };
    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "FeeAllotment.pdf");
          });
    }

    // var fileInput = document.getElementById("csv"),

    // readFile = function () {
    //     Papa.parse(fileInput.files[0],  {
    //       header: true,
    //       dynamicTyping: true,
    //       complete: function(results) {
    //         data = results.data;
    //         var feesubHash = {};
    //         var feeSubCatList = [];
    //         angular.forEach(feeSubCatList, function(feeSubCat){
    //             feesubHash[feeSubCat.name.toUpperCase()] = feeSubCat;
    //         });

    //         var routeHash = {};
    //         var i=0;
    //         console.log('$scope.existingRouteList count = ' + $scope.existingRouteList.length)
    //         angular.forEach($scope.existingRouteList, function(route) {

    //             if(feesubHash[route.route_name.toUpperCase()]) {
    //                 var feeAllotObj = {
    //                   "allotto": "ROUTE",
    //                   "allottoidlist": [route._id],
    //                   "feecatid": "5d29b026204ad67595bc1493",
    //                   "feesubcatid": feesubHash[route.route_name.toUpperCase()]._id,
    //                   "description": ""
    //                 };
    //                 var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feeallotment', feeAllotObj);
    //                 requestHandle.then(function (result) {
    //                     $rootScope.mypageloading = false;
    //                     if (result.success) {
    //                         i++;
    //                         console.log('i='+i);
    //                         FlashService.Error(result.data.message);
    //                         if(result.data.result == ''){
    //                             $scope.showAddAllotment = false;
    //                         }else{
    //                             FlashService.Error(result.data.message);
    //                             $scope.allAllotment();
    //                             $scope.showAddAllotment = false;
    //                         }
    //                     }
    //                     else
    //                     {
    //                         FlashService.Error(result.data.message);
    //                     }
    //                 });
    //             }
    //         });
    //       }
    //     });
    // };

    // fileInput.addEventListener('change', readFile);
});