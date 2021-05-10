app.controller('feesSubCategoryController', function ($rootScope,$interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    // $rootScope.mypageloading = true;
    $scope.catSelect = '';
    $scope.cashType = "";
    $scope.Category = []
    $scope.subCategory = [];
    $scope.subcatSelect = '';
    $scope.showModel = '';
    $scope.startDate = '';
    $scope.dueDate = '';
    $scope.endDate = '';
    $scope.feeTypeInstallment =[];
    $scope.InstallmentTempArray = [];
    $scope.visibility = false;


    $scope.Subcat=function(){
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feesubcat/');
            requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success)
            {
                $scope.subCategory = result.data;
                angular.forEach($scope.subCategory, function (item) {
                    item.Datestatus = UtilService.checkDate(item);
                
                    item.catName = '';
                    for(var i=0;i<=$scope.Category.length-1;i++){
                        
                        if(item.feecatid == $scope.Category[i]._id){
                            item.catName = $scope.Category[i].name;
                        }
                
                    }
                })
                $scope.subCategory.sort(function(a,b){
                    return new Date(b.time) - new Date(a.time);
                });
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
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
                $scope.Category = result.data;
                $scope.Subcat();
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }
    $scope.cat();
    

    $scope.selectedCat=function(id){
        $scope.catSelect = id;
        $scope.subcatSelect = '';
        $scope.Subcat();
    }
    $scope.SelectCat = function(id){
        $scope.AddSubCat.feecatid = id;
        $scope.feeTypeInstallment =[];
        $scope.AddSubCat = 
        {
            "name": "",
            "amount": "",
            "feetype": "",
            "feecatid": id,
            "description": "",
            
        }
    }
    
    // -----Save Sub Cat------

    $scope.save = function (){
        
        FlashService.Error('');
        if($scope.AddSubCat.feecatid == ""){
            FlashService.Error("Please Select Category");
            return false;
        }
        if( $scope.AddSubCat.name == ""){
            FlashService.Error("Please Enter Sub Category Name");
            return false;
        }
        if($scope.AddSubCat.amount == ""){
            FlashService.Error("Please Enter Amount");
            return false;
        }
        if($scope.AddSubCat.feetype == ""){
            FlashService.Error("Please Select FeeType");
            return false;
        }
        if( $scope.feeTypeInstallment.length == 0){
            FlashService.Error("Please Select FeeType");
            $scope.AddSubCat.feetype = '';
            return false;
        }

        var checkAmount = 0;
        
        $scope.InstallmentTempArray = [];
       
        var InstallIndex = 0;
            angular.forEach($scope.feeTypeInstallment, function (item) {

            InstallIndex++;
            checkAmount = item.amount + checkAmount;
            
            if(item.start == ''){
                FlashService.Error("Installment "+InstallIndex+" Start Date Should not blank");
                return false;
            }
            if(item.due == ''){
                FlashService.Error("Installment "+InstallIndex+" Due Date Should not blank");
                return false;
            }
           
            if(item.end == ''){
                FlashService.Error("Installment "+InstallIndex+" End Date Should not blank");
                return false;
            }
            if(new Date(item.start).getTime() >new Date(item.due).getTime()){
                FlashService.Error("Installment "+InstallIndex+" start Date Should not greater then Due Date");
                return false;
            }
            if(new Date(item.start).getTime() > new Date(item.end).getTime()){
                FlashService.Error("Installment "+InstallIndex+" start Date Should not greater then end Date");
                return false;
            }
            if(new Date(item.due).getTime() > new Date(item.end).getTime()){
                FlashService.Error("Installment "+InstallIndex+" due Date Should not greater then end Date");
                return false;
            }
            
            $scope.InstallmentTempArray.push({
                "amount":item.amount,
                "start":new Date(item.start).getTime(),
                "due":new Date(item.due).getTime(),
                "end":new Date(item.end).getTime()
            })
            

        })
        
        if($scope.flash.message != ''){
            return false;
        }
        if(checkAmount != $scope.AddSubCat.amount){
            FlashService.Error("Please Fill correct Installment Amount");
            return false;
        }

        var Add = 
        {
            "name": $scope.AddSubCat.name,
            "amount": $scope.AddSubCat.amount,
            "feetype": $scope.AddSubCat.feetype,
            "feecatid": $scope.AddSubCat.feecatid,
            "description": $scope.AddSubCat.description,
            "installments":$scope.InstallmentTempArray
        }
        
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feesubcat', Add);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    
                }else{
                    FlashService.Error(result.data.message);
                    $scope.Subcat();
                    $scope.showAddCat = false;
                   
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }
    // -----Save Sub Cat------

    // -----Open Add Sub Cat------
    $scope.openAddSubCat = function () {
        FlashService.Error('');
        $scope.cat();
        $scope.feeTypeInstallment =[];
        $scope.showModel = 'Add';
        $scope.AddSubCat = 
        {
            "name": "",
            "amount": "",
            "feetype": "",
            "feecatid": "",
            "description": "",
            
        }
        
        $scope.showAddCat = true;
    }
    // -----Open Add Sub Cat------

    
    $scope.viewSubCat=function(SubCat){
    }

    $scope.addInstallment=function(value){
        $scope.feeTypeInstallment=[];
        FlashService.Error("");
        var push = 0;
        if($scope.AddSubCat.amount == ""){
            FlashService.Error("Please Enter Amount");
            return false;
        }
        if($scope.AddSubCat.amount <= 0){
            FlashService.Error("Please Enter Amount more then 0");
            return false;
        }
        if("ANNUALLY" == value){
            push = 1;
        }
        if("QUARTERLY" == value){
            push = 4;
        }
        if("HALF-YEARLY" == value){
            push = 2;
        }
        if("MONTHLY" == value){
            push = 12;
        }
        if("ONE-TIME" == value){
            push = 1;
        }
        var installmentAmount = $scope.AddSubCat.amount/push;
        var a = installmentAmount.toFixed(2);
        var b =  parseFloat(a)
        
        for(var i=0;i<push;i++){
            $scope.feeTypeInstallment.push({"amount":b,"start":'',"due":'',"end":''})
        }
        
    }
    

    $scope.remove=function($index){ 
        FlashService.Error('');
        $scope.feeTypeInstallment.splice($index,1);  
        if($scope.feeTypeInstallment.length == 0){
            $scope.AddSubCat.feetype = '';   
        }
         var installmentAmount = 0;   
         installmentAmount = $scope.AddSubCat.amount/$scope.feeTypeInstallment.length;
         angular.forEach($scope.feeTypeInstallment, function (item) {
        
            item.amount = installmentAmount;
        })  
      }
      
    $scope.export = function(){
        kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
            kendo.drawing.pdf.saveAs(group, "FeeSubCategory.pdf");
          });
    }


    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };
 
   $scope.Amountchange=function(){
       
       if($scope.AddSubCat.feetype == ""){
            $scope.AddSubCat.feetype!="";
            $scope.feeTypeInstallment=[];
        
       }else{
            $scope.addInstallment($scope.AddSubCat.feetype)
       }
        $scope.visibility = false;
        FlashService.Error('');
    
   }
   $scope.change=function(){
       
    
     $scope.visibility = false;
     FlashService.Error('');
 
}
 
    $scope.setCalender = function() {
      //toggling manually everytime
      $scope.visibility = true;
    }
    $scope.dateValidation = function (fromDate, toDate) {
        FlashService.Error('');
        
    };
    $scope.dateValidation= function(data,data2){
    }


    // var fileInput = document.getElementById("csv"),

    // readFile = function () {
    //     Papa.parse(fileInput.files[0],  {
    //       header: true,
    //       dynamicTyping: true,
    //       complete: function(results) {
    //         data = results.data;
    //         var classNameCsvRow ;
    //         var deviceList = [];
    //         for(var i=0; i<data.length; i++) {
    //             if(data[i]['Station Name'] && data[i]['Fee']) {
    //                 var feeSubObj = {
    //                   "name": data[i]['Station Name'].toUpperCase(),
    //                   "amount": data[i]['Fee'],
    //                   "feetype": "QUARTERLY",
    //                   "feecatid": "5d29b026204ad67595bc1493",
    //                   // "feecatid": "5d14583fc3db70e6f7199b19",
    //                   "description": "",
    //                   "installments": [
    //                     {
    //                       "amount": data[i]['Fee']/4,
    //                       "start": 1554057000000,
    //                       "due": 1554661800000,
    //                       "end": 1561833000000
    //                     },
    //                     {
    //                       "amount": data[i]['Fee']/4,
    //                       "start": 1561919400000,
    //                       "due": 1562524200000,
    //                       "end": 1569781800000
    //                     },
    //                     {
    //                       "amount": data[i]['Fee']/4,
    //                       "start": 1569868200000,
    //                       "due": 1570473000000,
    //                       "end": 1577730600000
    //                     },
    //                     {
    //                       "amount": data[i]['Fee']/4,
    //                       "start": 1577817000000,
    //                       "due": 1578421800000,
    //                       "end": 1585593000000
    //                     }
    //                   ]
    //                 }
    //                 var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feesubcat', feeSubObj);
    //                 requestHandle.then(function (result) {
    //                     $rootScope.mypageloading = false;
                            
    //                     if (result.success)
    //                     {
    //                         FlashService.Error(result.data.message);
    //                         // if(result.data.result == ''){
                                
    //                         // }else{
    //                         //     FlashService.Error(result.data.message);
    //                         //     $scope.Subcat();
    //                         //     $scope.showAddCat = false;
                               
    //                         // }
    //                     }
    //                     else
    //                     {
    //                         FlashService.Error(result.data.message);
    //                     }
    //                 });
    //             }
    //         }
            
    //       }
    //     });
    // };

    // fileInput.addEventListener('change', readFile);

    
});