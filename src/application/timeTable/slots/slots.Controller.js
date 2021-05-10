app.controller('slotsController', function ($rootScope,$interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    // $rootScope.mypageloading = true;
    $scope.catSelect = '';
    $scope.cashType = "";
    $scope.Category = []
    $scope.timeTableSlots = [];
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
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/slot/getlectureslots/');
            requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success)
            {
                $scope.timeTableSlots = result.data;
                angular.forEach($scope.timeTableSlots, function (item) {
                    item.Datestatus = UtilService.checkDate(item);
                
                    item.catName = '';
                    for(var i=0;i<=$scope.Category.length-1;i++){
                        
                        if(item.feecatid == $scope.Category[i]._id){
                            item.catName = $scope.Category[i].name;
                        }
                
                    }
                })
                $scope.timeTableSlots.sort(function(a,b){
                    return new Date(b.time) - new Date(a.time);
                });
                
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }
    

    // $scope.cat=function(){
    //     if($scope.Category.length != 0){
    //         return false;
    //     }
    //     $rootScope.mypageloading = true;
    //     var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feecat');
    //         requestHandle.then(function (result) {
    //             $rootScope.mypageloading = false;
    //         if (result.success)
    //         {
    //             $scope.Category = result.data;
                $scope.Subcat();
                
    //         }
    //         else
    //         {
    //             FlashService.Error(result.message);
    //         }
    //     });
        
    // }
    // $scope.cat();
    
    // -----Save Sub Cat------

    $scope.save = function (){
        
        FlashService.Error('');
        if( $scope.AddSlot.name == ""){
            FlashService.Error("Please Enter Slot Name");
            return false;
        }
        if($scope.AddSlot.startTime == ""){
            FlashService.Error("Please Enter Start Time");
            return false;
        }
        if($scope.AddSlot.endTime == ""){
            FlashService.Error("Please Select End Time");
            return false;
        }
        
        if($scope.flash.message != ''){
            return false;
        }
        var startT= new Date($scope.AddSlot.startTime).format('h:mmtt')
        var endT= new Date($scope.AddSlot.endTime).format('h:mmtt')
        var Add = 
        [{
            "name": $scope.AddSlot.name,
            "starttime": startT,
            // "starttime": "08:00 AM",
            // "endtime": "08:40 AM",
            "endtime": endT
        }]
        
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/slot/addlectureslot', Add);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    $scope.Subcat();
                }else{
                    FlashService.Error(result.data.message);
                    $scope.Subcat();
                    $scope.showAddSlot = false;
                   
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }
    // -----Save Sub Cat------
    $scope.delete=function(params) {
        console.log(params)
        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/slot/deletelectureslot?id='+params._id);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    $scope.Subcat();
                }else{
                    FlashService.Error(result.data.message);
                    $scope.Subcat();
                    $scope.showAddSlot = false;
                   
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }
    // -----Open Add Sub Cat------
    $scope.openAddSlot = function () {
        FlashService.Error('');
        // $scope.cat();
        // $scope.feeTypeInstallment =[];
        $scope.showModel = 'Add';
        $scope.AddSlot = 
        {
            "name": "",
            "startTime": "",
            "endTime": ""
        }
        
        $scope.showAddSlot = true;
    }
    // -----Open Add Sub Cat------

    
    $scope.viewSubCat=function(SubCat){
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

    $scope.setCalender = function() {
      //toggling manually everytime
      $scope.visibility = true;
    }
    $scope.dateValidation = function (fromDate, toDate) {
        FlashService.Error('');
        
    };
    $scope.dateValidation= function(data,data2){
    }
    Date.prototype.format = function (format, utc){
        return formatDate(this, format, utc);
    };
    function formatDate(date, format, utc){
            var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }
    
            var y = utc ? date.getUTCFullYear() : date.getFullYear();
            format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
            format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
            format = format.replace(/(^|[^\\])y/g, "$1" + y);
    
            var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
            format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
            format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
            format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
            format = format.replace(/(^|[^\\])M/g, "$1" + M);
    
            var d = utc ? date.getUTCDate() : date.getDate();
            format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
            format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
            format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
            format = format.replace(/(^|[^\\])d/g, "$1" + d);
    
            var H = utc ? date.getUTCHours() : date.getHours();
            format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
            format = format.replace(/(^|[^\\])H/g, "$1" + H);
    
            var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
            format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
            format = format.replace(/(^|[^\\])h/g, "$1" + h);
    
            var m = utc ? date.getUTCMinutes() : date.getMinutes();
            format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
            format = format.replace(/(^|[^\\])m/g, "$1" + m);
    
            var s = utc ? date.getUTCSeconds() : date.getSeconds();
            format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
            format = format.replace(/(^|[^\\])s/g, "$1" + s);
    
            var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
            format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
            f = Math.round(f / 10);
            format = format.replace(/(^|[^\\])f/g, "$1" + f);
    
            var T = H < 12 ? "AM" : "PM";
            format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
            format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));
    
            var t = T.toLowerCase();
            format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
            format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));
    
            var tz = -date.getTimezoneOffset();
            var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
            if (!utc)
            {
                tz = Math.abs(tz);
                var tzHrs = Math.floor(tz / 60);
                var tzMin = tz % 60;
                K += ii(tzHrs) + ":" + ii(tzMin);
            }
            format = format.replace(/(^|[^\\])K/g, "$1" + K);
    
            var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
            format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
            format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);
    
            format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
            format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);
    
            format = format.replace(/\\(.)/g, "$1");
    
            return format;
        };
});