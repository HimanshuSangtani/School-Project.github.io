app.controller('feesTypeController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = true;
    $scope.Category = [];
    $scope.showAddCat = false;
    $scope.showModel = 'Add';
    $scope.checkCatName = "";


    $scope.AddCat = {
        "name": "",
        "prefix": "",
        "description":""
    }

    $rootScope.mypageloading = false;

    $scope.cat=function(){
        
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat');
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                console.log(result)
                $scope.Category = result.data.feecatList;
                angular.forEach($scope.Category, function (item) {
                    item.Datestatus = UtilService.checkDate(item);
                });
                $scope.Category.sort(function(a,b){
                    return new Date(b.time) - new Date(a.time);
                });
                
                
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }
    $scope.cat();

    $scope.save = function (){
        FlashService.Error('');
        if($scope.AddCat.name == ""){
            FlashService.Error("Please Enter Category Name");
            return false;
        }
        if($scope.AddCat.prefix == ""){
            FlashService.Error("Please Enter Prefix");
            return false;
        }
        
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feecat', $scope.AddCat);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    
                }else{
                    FlashService.Error(result.data.message);
                    $scope.cat();
                    $scope.showAddCat = false;
                    $scope.AddCat.name ="";
                    $scope.AddCat.description = "";
                    $scope.AddCat.prefix ="A";
                }
            }
            else
            {
                $scope.AddCat.name ="";
                $scope.AddCat.description = "";
                $scope.AddCat.prefix ="A";
                // $scope.showAddCat = false;
                FlashService.Error(result.data.message);
            }
        });
        
    }
    $scope.openAddCat = function () {
        FlashService.Error('');
        $scope.showModel = 'Add';
        $scope.AddCat = {
            "name": "",
            "prefix": "A",
            "description":""
        }
        $scope.showAddCat = true;
    }

    $scope.Update = function (){
        FlashService.Error('');
        if($scope.AddCat.name == ""){
            FlashService.Error("Please Enter Category Name");
            return false;
        }
        if($scope.AddCat.prefix == ""){
            FlashService.Error("Please Enter Prefix");
            return false;
        }
        
        if($scope.AddCat.name == $scope.checkCatName){
        }else{
         angular.forEach($scope.Category, function (item) {
                if(item.name == $scope.AddCat.name){
                    FlashService.Error("Fees Category Name "+$scope.AddCat.name+" already exists");
                    return false;
                }
                
            })
        }
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/feecat/'+$scope.UpdateCatId, $scope.AddCat);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    
                }else{
                    FlashService.Error(result.data.message);
                    $scope.cat();
                    $scope.showAddCat = false;
                    $scope.AddCat.name ="";
                    $scope.AddCat.prefix ="";
                    $scope.AddCat.description = "";
                }
            }
            else
            {
                $scope.AddCat.name ="";
                $scope.AddCat.description = "";
                $scope.AddCat.prefix ="";
                $scope.showAddCat = false;
                FlashService.Error(result.message);
            }
        });
        
    }
    $scope.UpdateCatId= "";
    $scope.editAddCat = function (cat) {
        FlashService.Error('');
        $scope.checkCatName = "";
        $scope.checkCatName = cat.name;
        $scope.AddCat.name = cat.name;
        $scope.AddCat.prefix = cat.prefix;
        $scope.AddCat.description = cat.description;
        $scope.UpdateCatId = cat._id;
        $scope.showModel = 'Edit';
        $scope.showAddCat = true;
    }
   
    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };

    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "FeeCategory.pdf");
          });
       
    }


    
});