angular.module("plunker", ["ui.bootstrap"]);
app.controller('subCategoryController', function ($rootScope,$filter, $location, HandShakeService, FlashService, $scope, $routeParams, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {
    $scope.subCategoryList=[];
    $scope.catSelect = '';
    $scope.cashType = "";
    $scope.Category = []
    $scope.subCategory = [];
    $scope.subCategoryinstallments = [];
    $scope.subcatSelect = '';
    $scope.filterTypeStudentList = [];
    $scope.filterTypeGradeList = [];
    $scope.filterTypeRouteList = [];
    $scope.showModel = '';
    $scope.startDate = '';
    $scope.dueDate = '';
    $scope.endDate = '';
    $scope.amount1;
    $scope.addFlag=false;   
    $scope.viewFlag=false;    
    $scope.createDate = '';
    $scope.time = '';
    $scope.updatedtime = '';
    $scope.filterKeyModalFlag=false;
    $scope.subCatFlag=false;
    $scope.subCategoryName='';
    $scope.editDate = '';
    $scope.className = '';
    $scope.saveFlag = false;
    $scope.academic_session_id='';
    $scope.feeTypeInstallment =[];
    $scope.InstallmentTempArray = [];
    $scope.studentList = [];
    $scope.routeList = [];
    $scope.classList = [];
    $scope.viewData = [];
    $scope.pageData = [];
    $scope.type='';
    $scope.mode='';
    $scope.visibility = false;
    $scope.subCategoryobj={};
    $scope.submitObj={};
    $scope.currentRowno=0;

    $scope.feeTypeList=['ANNUAL','HALF-YEARLY','QUATERLY','ONE-TIME']
    $scope.statusList=['ACTIVE','INACTIVE']
    if($routeParams.feeID){
        $scope.feeID = ($routeParams.feeID).toString();
        if ($scope.feeID.substring(0, 1) === ':') {
            $scope.feeID = $scope.feeID.substring(1);
        }
    }
    $scope.getData=function(){
        $scope.addObj={
            "name":'',"amount":null,"amount1":null,"status":'',"description":'',
            "feeType":'',"filter_key":'',"filter_value":[],"start1":null,"due1":null
        }
        $scope.studentDetailsobj={
            "name":'',"enrno":'',"feename":'',"class":''
        };
        var categoryRequestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/v2/feesubcat?feecatid='+$scope.feeID);
        categoryRequestHandle.then(function (result) {
            if(result.success){
                $scope.subCategoryList=result.data
                $scope.subCategoryinstallments=result.data[0].installments
                $scope.className =$sessionStorage.className;
                $scope.academic_session_id='608bd9100f6eedf493cbee97'
                $scope.time =new Date(result.data[0].time)
                $scope.updatedtime=new Date(result.data[0].updatedtime)
                $scope.subCategoryobj={
                    "id":result.data[0]._id,
                    "createdat":result.data[0].time,
                    "academic_session_id":$scope.academic_session_id,
                    "editedat":result.data[0].updatedtime,
                    "subCategoryName":result.data[0].name,
                    "amount":result.data[0].amount,
                    "active":result.data[0].status,
                    "description":result.data[0].description,
                    "inactive":result.data[0].status,
                    "feeType":result.data[0].feetype,
                    "filter_key":result.data[0].filter_key,
                    "filter_value":result.data[0].filter_value,
                    "annual":result.data[0].feetype,
                    "halfyearly":result.data[0].feetype,
                    "quaterly":result.data[0].feetype,
                    "onetime":result.data[0].feetype,
                    "searchCat":'',
                    "startDate":result.data[0].installments[0].start ? new Date(result.data[0].installments[0].start) : "",
                    "endDate":result.data[0].installments[0].end ? new Date(result.data[0].installments[0].end) : "",
                }
                
                $scope.subCategoryName=$scope.subCategoryobj.subCategoryName
                $scope.mode=$sessionStorage.mode;
            }
            else{
                FlashService.Error(result.data.message);
                $scope.subCatFlag=true;
            }
            if(!$scope.addFlag && !$scope.viewFlag){
                $scope.viewData=[];
                $scope.viewData.push(result.data[0])
            }
            if($scope.addFlag){
                $scope.viewData=[]
                $scope.viewData.push($scope.subCategoryList[$scope.subCategoryList.length-1])
                $scope.subCategoryinstallments=$scope.subCategoryList[$scope.subCategoryList.length-1].installments
                $scope.currentRowno = $scope.subCategoryList.length-1;
            }
        console.log($scope.viewData)

        })
    }
    $scope.getData();
    $scope.filterTypeStudentList = [];
    $scope.filterTypeGradeList = [];
    $scope.filterTypeRouteList = [];
    $scope.getStudentsData=function(){
        if($scope.filterTypeStudentList.length==0){
            $scope.pageData = [];
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/student/getStudentDataByallfilters');
        requestHandle.then(function (result) {
            $scope.gradeId=result.data.data[0].grade_id;
            $scope.filterTypeStudentList = result.data.data;
            $scope.pageData = result.data.data;
            $scope.totalItems = result.data.data.length;
        })
    }
    }
    $scope.searchStudent=function(){
        let url=$rootScope.serverURL + '/customer/student/getStudentDataByallfilters?';
        $scope.studentDetailsList=[];
        $scope.studentDetailsobj={
            "name":$scope.studentDetailsobj.name,
            "enrno":$scope.studentDetailsobj.enrno,
            "feename":$scope.studentDetailsobj.feename,
            "class":$scope.studentDetailsobj.class
        };
        if($scope.studentDetailsobj.name && $scope.studentDetailsobj.name!=undefined)
        url+='&name='+$scope.studentDetailsobj.name
        if($scope.studentDetailsobj.enrno && $scope.studentDetailsobj.enrno!=undefined)
        url+='&rollno='+$scope.studentDetailsobj.enrno
       if($scope.studentDetailsobj.class && $scope.studentDetailsobj.class!=undefined)
        url+='&grade_id='+$scope.gradeId
        var requestHandle = HttpService.HttpGetData(url);
        requestHandle.then(function (result) {
            
            $scope.studentDetailsList.push(result.data.data[0]);
            
            $scope.filterTypeStudentList = result.data.data;
        })
    }
    $scope.getRoutesData=function(){
        if($scope.filterTypeRouteList.length==0){
            $scope.pageData = [];
            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/routes');
            requestHandle.then(function (result) {
                $scope.filterTypeRouteList = result.data;
                $scope.pageData = result.data;
                $scope.totalItems = result.data.length;
            })

        }
    }
    $scope.getGradesData=function(){
        if($scope.filterTypeGradeList.length==0){
            $scope.pageData = [];
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/grades');
        requestHandle.then(function (result) {
            $scope.filterTypeGradeList = result.data;
            $scope.pageData = result.data;
            $scope.totalItems = result.data.length;
        })
    }
    }

    $scope.uncheckAllStudents=function(){
    if(!$scope.saveFlag){
        $scope.filterTypeStudentList = [];
        $scope.filterTypeGradeList = [];
        $scope.filterTypeRouteList = [];
    }
    }
    

    $scope.filterKeyType='';
    $scope.filterKeyModal=function(type){
        $scope.uncheckAllStudents()
        $scope.type=type
        if(type=='_id') $scope.getStudentsData()
        if(type=='route_id') $scope.getRoutesData()
        if(type=='grade_id') $scope.getGradesData()
    $scope.filterKeyType=type;
    $scope.filterKeyModalFlag=true;
    }

    $scope.selectedRows = [];

  $scope.select = function(item) {
    item.selected ? item.selected = false : item.selected = true
  }

  $scope.resetData=function(){
    $scope.studentList = [];
    $scope.routeList = [];
    $scope.classList = [];
    $scope.filterTypeStudentList = [];
    $scope.filterTypeGradeList = [];
    $scope.filterTypeRouteList = [];
  }

  $scope.addStatus=function(value){
    $scope.addObj.status=value
    console.log($scope.addObj)
  }

  $scope.addInstallment=function(value){
    $scope.addObj.feeType=value
    $scope.feeTypeInstallment=[];
    FlashService.Error("");
    var push = 0;
    if($scope.addObj.amount == ""){
        FlashService.Error("Please Enter Amount");
        return false;
    }
    if($scope.addObj.amount <= 0){
        FlashService.Error("Please Enter Amount more then 0");
        return false;
    }
    if("ANNUAL" == value){
        push = 1;
    }
    if("QUATERLY" == value){
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
    var installmentAmount = $scope.addObj.amount/push;
    var fixedAmount = installmentAmount.toFixed(2);
    var floatAmount =  parseFloat(fixedAmount)
    
    for(var i=0;i<push;i++){
        $scope.feeTypeInstallment.push({"amount":floatAmount,"start":'',"due":''})
        $scope.feeTypeInstallment[i].start=new Date($scope.feeTypeInstallment[i].start).getTime();
        $scope.feeTypeInstallment[i].due=new Date($scope.feeTypeInstallment[i].due).getTime();
    }
    
    
}

  $scope.submitSubCat=function(){
      var result=true;
      var selectedIds=[];
      $scope.viewData=[];
      $scope.installmentsArray=[];
      var filteredIds=[];
      $scope.checkAmount=0;
        
    if($scope.type=='_id'){
        selectedIds = $scope.studentList;
    }
    if($scope.type=='route_id'){
        selectedIds = $scope.routeList;
    }
    if($scope.type=='grade_id'){
        selectedIds = $scope.classList;
    }


    FlashService.Error('');
        if($scope.addObj.feecatid == ""){
            FlashService.Error("Please Select Category");
            return false;
        }
        if( $scope.addObj.name == ""){
            FlashService.Error("Please Enter Sub Category Name");
            return false;
        }
        if($scope.addObj.amount == null){
            FlashService.Error("Please Enter Amount");
            return false;
        }
        if($scope.addObj.feetype == ""){
            FlashService.Error("Please Select FeeType");
            return false;
        }
        if( $scope.feeTypeInstallment.length == 0){
            FlashService.Error("Please Select FeeType");
            return false;
        }
        if( $scope.addObj.status == ''){
            FlashService.Error("Please Select Status");
            return false;
        }
        if($scope.studentList.length == 0 && $scope.classList.length == 0 && $scope.routeList.length == 0){
            FlashService.Error("Please Select Filter Type");
            return false;
        }
        if($scope.filterKeyType=='_id' && $scope.studentList.length == 0){
            FlashService.Error("Please Select Filter Type Value");
            return false;
        }
        if($scope.filterKeyType=='grade_id' && $scope.classList.length == 0){
            FlashService.Error("Please Select Filter Type Value");
            return false;
        }
        if($scope.filterKeyType=='route_id' && $scope.routeList.length == 0){
            FlashService.Error("Please Select Filter Type Value");
            return false;
        }

        var checkAmount = 0;
        
       
        var InstallIndex = 0;
            angular.forEach($scope.feeTypeInstallment, function (item) {

            InstallIndex++;
            checkAmount = item.amount + checkAmount;
            
            if(item.start == null){
                FlashService.Error("Installment "+InstallIndex+" Start Date Should not blank");
                return false;
            }
            if(item.due == null){
                FlashService.Error("Installment "+InstallIndex+" Due Date Should not blank");
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
            
            $scope.installmentsArray.push({
                "amount":item.amount,
                "start":new Date(item.start).getTime(),
                "due":new Date(item.due).getTime()
            })
            

        })
        
        if($scope.flash.message != ''){
            return false;
        }
        if(checkAmount != $scope.addObj.amount){
            FlashService.Error("Please Fill correct Installment Amount");
            return false;
        }
    angular.forEach(selectedIds,function(item){filteredIds.push(item._id)})
      $scope.submitObj={
          "name":$scope.addObj.name,
          "amount":$scope.addObj.amount,
          "description":$scope.addObj.description,
          "feetype":$scope.addObj.feeType,
          "academic_session_id":$scope.academic_session_id,
          "feecatid":$scope.feeID,
          "installments":$scope.installmentsArray,
          "filter_key":$scope.type,
          "filter_value":filteredIds
      }
      
      
      if($scope.addObj.amount=='' ||$scope.addObj.amount==undefined){
          result=false;
          FlashService.Error('Enter Amount');
      }
    if($scope.addObj.name=='' ||$scope.addObj.name==undefined){
        result=false;
        FlashService.Error('Enter Name');
    }
      if(result){
          var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/v2/feesubcat',$scope.submitObj);
            requestHandle.then(function (result) {
                if(result.success){
                    $scope.addFlag=true;    
                    $scope.mode='';
                    $scope.getData();
                }
                else{
                    FlashService.Error(result.data.message)
                }
            })
      }

  }

  $scope.installmentsAmount=function(){
      if($scope.addObj.feeType=='QUATERLY'){
          $scope.actualAmount=$scope.addObj.amount/4;
          $scope.addObj.amount1=$scope.actualAmount;
          $scope.addObj.amount2=$scope.actualAmount;
          $scope.addObj.amount3=$scope.actualAmount;
          $scope.addObj.amount4=$scope.actualAmount;
      }
    else if($scope.addObj.feeType=='HALF-YEARLY'){
        $scope.actualAmount=$scope.addObj.amount/2;
        $scope.addObj.amount1=$scope.actualAmount;
        $scope.addObj.amount2=$scope.actualAmount;
    }
    else{
        $scope.actualAmount=$scope.addObj.amount;
        $scope.addObj.amount1=$scope.actualAmount;
    }
  }

  $scope.getAllSelectedRows = function() {
    if($scope.type=='_id'){
        $scope.saveFlag = true;
        $scope.filterTypeRouteList=[];
        $scope.filterTypeGradeList=[];
        $scope.routeList=[];
        $scope.classList=[];
        $scope.filterKeyModalFlag=false;
        var selectedRows = $filter("filter")($scope.filterTypeStudentList, {
          selected: true
        }, true);
        $scope.studentList=selectedRows;
    }
    if($scope.type=='route_id'){
        $scope.saveFlag = true;
        $scope.filterTypeStudentList=[];
        $scope.filterTypeGradeList=[];
        $scope.studentList=[];
        $scope.classList=[];
        $scope.filterKeyModalFlag=false;
        var selectedRows = $filter("filter")($scope.filterTypeRouteList, {
          selected: true
        }, true);
        $scope.routeList=selectedRows;
    }
    if($scope.type=='grade_id'){
        $scope.saveFlag = true;
        $scope.filterTypeStudentList=[];
        $scope.filterTypeRouteList=[];
        $scope.studentList=[];
        $scope.routeList=[];
        $scope.filterKeyModalFlag=false;
        var selectedRows = $filter("filter")($scope.filterTypeGradeList, {
          selected: true
        }, true);
        $scope.classList=selectedRows;
    }
    $scope.selectedRows = selectedRows; 
  }
  $scope.cancelSubCat=function(){
    $scope.mode='';
    $scope.getData()
    $scope.subCatFlag=false;
  }
  $scope.filterData=[];
    $scope.subCategory=function(fee,index){
    $scope.viewFlag=true;    
        console.log(fee)
        $scope.currentRowno= index ? index : 0;
        $scope.cancelSubCat()
        $scope.viewData=[];
        $scope.filterData=[];
        $scope.viewData.push(fee)
            if(fee.filter_key=='_id'){
                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/student/getStudentDataByallfilters');
                requestHandle.then(function (result) {
                    if(result.success){
                        $scope.filterTypeStudentList = result.data.data;
                        if($scope.filterTypeStudentList.length>0){
                            $scope.filterData=[];
                            for(var i=0;i<$scope.filterTypeStudentList.length;i++){
                                for(var j=0;j<$scope.filterTypeStudentList.length;j++){
                                    if(fee.filter_value[i]==$scope.filterTypeStudentList[j]._id){
                                        $scope.filterData.push($scope.filterTypeStudentList[j]);
                            
                                    }
                                }
                            }
                    }
                }
            })
            }
            if(fee.filter_key=='route_id'){
                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/routes');
                requestHandle.then(function (result) {
                    if(result.success){
                        $scope.filterTypeRouteList = result.data;
                        $scope.filterData=[];
                        for(var i=0;i<$scope.filterTypeRouteList.length;i++){
                            for(var j=0;j<$scope.filterTypeRouteList.length;j++){
                                if(fee.filter_value[i]==$scope.filterTypeRouteList[j]._id){
                                    $scope.filterData.push($scope.filterTypeRouteList[j]);
                        
                                }
                            }
                        }
                    }
            })
            }
            if(fee.filter_key=='grade_id'){
                var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/grades');
                requestHandle.then(function (result) {
                    if(result.success){
                        $scope.filterTypeGradeList = result.data;
                        $scope.pageData = result.data;
                        $scope.totalItems = result.data.length;
                        if($scope.filterTypeGradeList.length>0){
                            $scope.filterData=[];
                            for(var i=0;i<$scope.filterTypeGradeList.length;i++){
                                for(var j=0;j<$scope.filterTypeGradeList.length;j++){
                                    if(fee.filter_value[i]==$scope.filterTypeGradeList[j]._id){
                                    $scope.filterData.push($scope.filterTypeGradeList[j]);
                        
                                    }
                                }
                            }
                        }
                    }
            })
            }
            $scope.resetData();
            $scope.time =new Date(fee.time)
            $scope.updatedtime=new Date(fee.updatedtime)
            $scope.subCategoryName=fee.name
            $scope.subCategoryinstallments=fee.installments
            $scope.subCategoryobj={
                "id":fee._id,
                "academic_session_id":$scope.academic_session_id,
                "createdat":fee.time,
                "editedat":fee.updatedtime,
                "subCategoryName":fee.name,
                "amount":fee.amount,
                "active":fee.status,
                "inactive":fee.status,
                "feeType":null,
                "filter_value":fee.filter_value,
                "filter_key":fee.filter_key,
                "annual":fee.feetype,
                "halfyearly":fee.feetype,
                "quaterly":fee.feetype,
                "onetime":fee.feetype,
                "startDate":fee.installments[0].start ? new Date(fee.installments[0].start) : "",
                "endDate":fee.installments[0].end ? new Date(fee.installments[0].end) : "",
                "filterKey":""
        }
        console.log($scope.viewData)
    }

    $scope.openFeeDetails = function () {
        $location.path('/newFee');
    }
    $scope.openAddSubCat = function () {
        FlashService.Error('');
        $scope.subCategoryobj={};
        $scope.mode='addSubCat';
        $scope.subCategoryinstallments=[];
    }
    
});