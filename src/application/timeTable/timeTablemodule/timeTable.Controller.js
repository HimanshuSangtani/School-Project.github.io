app.controller('timeTableController', function ($rootScope,$interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage,$timeout, $firebaseAuth, Auth) {

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
    // $scope.entryList=[];
    $scope.weeksList=[{name:'Monday',value:1},{name:'Tuesday',value:2},
    {name:'Wednesday',value:3},{name:'Thursday',value:4},
    {name:'Friday',value:5},{name:'Saturday',value:6}];
    $scope.timetableData={entryList:[{}],selectBy:"class"};
    $scope.getTimeTable=function(params){
        $rootScope.mypageloading = true;
        var url='/customer/timetable/gettimetable/';
        if(params&&params.byClass){
             url='/customer/timetable/gettimetablebyclass?class_id='+params.byClass;

        }
        if(params&&params.byTeacher){
             url='/customer/timetable/gettimetablebyteacher?teacher_id='+params.byTeacher;
        }
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + url);
            requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success)
            {
                // $scope.timeTableSlots = result.data;
                // angular.forEach(result.data, function (item) {
                //     // item.Datestatus = UtilService.checkDate(item);
                //     var obj={slot:item.slot_id.name}   
                //     // item.catName = '';
                //     for(var i=0;i<=result.data.length-1;i++){
                //         $scope.timeTableSlots.filter(filterData)
                //     //     if(item.feecatid == $scope.Category[i]._id){
                //     //         item.catName = $scope.Category[i].name;
                //     //     }
                
                //     }
                // })
                // $scope.timeTableSlots.sort(function(a,b){
                //     return new Date(b.time) - new Date(a.time);
                // });
                var output = [];
                var map = new Map();
                angular.forEach(result.data, function (item) {
                    var slotIndex=  output.findIndex(function(element) {
                          return element.name == item.slot_id.name;    
                        })
                        if(slotIndex==-1){
                            output.push({
                                name:item.slot_id.name,
                                timeTableId:item._id,
                                day:[{id:item._id,day:item.day,class_name:item.class_name,teacher_name:item.teacher_name,subject_name:item.subject_name}]
                            })
                        }else{
                            var dayIndex=  output[slotIndex].day.findIndex(function(element) {
                                return element.day == item.day;    
                              })
                                output[slotIndex].day.push({id:item._id,day:item.day,class_name:item.class_name,teacher_name:item.teacher_name,subject_name:item.subject_name});


                              // if(dayIndex==-1){
                              //   output[slotIndex].day.push({id:item._id,day:item.day,class_name:item.class_name,teacher_name:item.teacher_name,subject_name:item.subject_name});
                              // }else{
                              //   output[slotIndex].day[dayIndex]={id:item._id,day:item.day,class_name:item.class_name,teacher_name:item.teacher_name,subject_name:item.subject_name};
                              // }
                        }
                    // if(!map.has(item.slot_id.name)){
                    //     map.set(item.slot_id.name, true); 
                    //     var dataToPush={
                    //         id: item.slot_id.name,
                    //         subject_name: item.subject_name,
                    //     }   // set any value to Map
                    //     if( $scope.timetableData.selectBy=="class"){
                    //         dataToPush.class_name= item.class_name;
                    //     }
                    //     if( $scope.timetableData.selectBy=="teacher"){
                    //         dataToPush.teacher_name= item.teacher_name;   
                    //     }
                    //     output.push(dataToPush);
                    // }
                })
                $scope.timeTableSlots=output;
                $scope.timeTableSlots.sort(function(a,b){
                    return  a.name - b.name;
                });
                console.log(output);
            }
            else
            {
                FlashService.Error(result.message);
            }
        });
        
    }
    // -----Save Sub Cat------

    $scope.save = function (){
        
        FlashService.Error('');
        if($scope.timetableData.class_id == ""){
            FlashService.Error("Please Select Class");
            return false;
        }
        if(!$scope.timetableData.entryList.length){
            FlashService.Error("Please Select required Entry");
            return false;
        }else{
            if(!$scope.timetableData.entryList[0].slot_id || !$scope.timetableData.entryList[0].teacher_id ||!$scope.timetableData.entryList[0].subject_id ){
                FlashService.Error("Please Select required Entry");
                return false;
            }
        }

        // $scope.timetableData.entryList[i].day
        var isDayExist = true;
        var isEntryError = false;
        angular.forEach($scope.timetableData.entryList, function(entry) {
            if(!entry.slot_id || !entry.teacher_id || !entry.subject_id ){
                isEntryError = true;
                return;
                // FlashService.Error("Please Select required Entry");
                // return false;
            }
            if(!entry.day) {
                isDayExist = false;
            }
        })

        if(isEntryError) {
            FlashService.Error("Please Select required Entry");
            return false;
        }

        if(!isDayExist) {
            FlashService.Error("Select atleast one day");
            return false;
        }

        // FlashService.Error('');
        // if( $scope.AddSlot.name == ""){
        //     FlashService.Error("Please Enter Sub Category Name");
        //     return false;
        // }
        // if($scope.AddSlot.startTime == ""){
        //     FlashService.Error("Please Enter Start Time");
        //     return false;
        // }
        // if($scope.AddSlot.endTime == ""){
        //     FlashService.Error("Please Select End Time");
        //     return false;
        // }
        
        // if($scope.flash.message != ''){
        //     return false;
        // }

        var Add = []
        // Add.push()
        for(var i=0;i<$scope.timetableData.entryList.length;i++) {
            var daysData=Object.keys($scope.timetableData.entryList[i].day)
            if(daysData.length){
                for (var index = 0; index < daysData.length; index++) {
                    daysData[index]=daysData[index]++;
                }
            }
            var obj={
                "class_id":$scope.timetableData.class_id,
                "day":daysData,
                "slot_id":$scope.timetableData.entryList[i].slot_id,
                "teacher_id":$scope.timetableData.entryList[i].teacher_id,
                "subject_id":$scope.timetableData.entryList[i].subject_id
            }
            // for (var j=0;j>daysData.length;j++) {
            //     obj.day.push(parseInt(daysData[j])+1)
            //     // console.log(`${key}: ${value}`);
            //   }
              Add.push(obj)
        };

        console.log(Add)
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/timetable/addtimetable', Add);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    $scope.onChange()

                }else{
                    FlashService.Error(result.data.message);
                    $scope.onChange()
                    $scope.showAddTT = false;
                   
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }
    $scope.checkAll=function (params,index) {
        // console.log($scope.timetableData.entryList[index])
        if(params){
            for (var index1 = 0; index1 < $scope.weeksList.length; index1++) {
                $scope.timetableData.entryList[index].day[$scope.weeksList[index1].value]=true;
            }
        }else{
            for (var index2 = 0; index2 < $scope.weeksList.length; index2++) {
                $scope.timetableData.entryList[index].day=[];
            }
        }
        
    }
    // -----Save Sub Cat------

    // -----Open Add Sub Cat------
    $scope.openAddSlot = function () {
        FlashService.Error('');
        $scope.showModel = 'Add';
        $scope.timetableData.class_id='';
        $scope.timetableData.entryList = [{}];
        $scope.showAddTT = true;
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
    HandShakeService.getGradeInfo().then(function (classes) {
        $scope.classList = classes;
        $scope.timetableData.selectedClass=classes[0]._id;
        $scope.getTimeTable({byClass:$scope.timetableData.selectedClass});
        // for (var i = 0; i < $scope.classList.length; i++) {
            // if ($scope.classList[i]._id == $scope.classID) {
                // $scope.className = $scope.classList[i].name;
                // break;
            // }
        })
    HttpService.HttpGetData($rootScope.serverURL + '/customer/slot/getlectureslots/')
    .then(function (result) {
        if (result.success)
        {
            $scope.slotsList = result.data;
        }
    })
    HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher')
    .then(function (result) {
        $rootScope.mypageloading = false;
        if (result.success == true)
        {
            $scope.teachersList = result.data;
            $scope.timetableData.selectedTeacher=result.data[0]._id;

        }
    })
    HttpService.HttpGetData($rootScope.serverURL +'/customer/subject')
    .then(function (result) {
        if (result.success == true) {
            $scope.subjectList=result.data;
        }
    });
    $scope.addEntry=function(){
        $scope.timetableData.entryList.push({index:$scope.timetableData.entryList.length+1})
    }
    $scope.delete=function (index) {
        $scope.timetableData.entryList.splice(index,1);
    }
    $scope.deleteTT=function(params) {
        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/timetable/deletetimetable?id='+params);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success)
            {
                FlashService.Error(result.data.message);
                if(result.data.result == ''){
                    $scope.onChange();
                }else{
                    FlashService.Error(result.data.message);
                    $scope.onChange();
                    $scope.showAddSlot = false;
                   
                }
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }
    $scope.onChange=function (params) {
        console.log($scope.timetableData.selectBy)
        if($scope.timetableData.selectBy=='class'){
            $scope.getTimeTable({byClass:$scope.timetableData.selectedClass});
        }else{
            $scope.getTimeTable({byTeacher:$scope.timetableData.selectedTeacher});
        }
    }



   



    function updateTT(i){
        // https://api.zuwagon.com/customer/timetable/updatetimetable
        if(i == ttList.length) {
            console.log('returning i' + i)
            return;
        }
        var tt = ttList[i];
        console.log('day before ' + tt.day);
        // tt.day--;
        console.log('day before ' + tt.day);
        tt.slot_id = tt.slot_id._id;
        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/timetable/deletetimetable?id='+ tt._id);
        // var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/timetable/updatetimetable', [tt]);
        requestHandle.then(function (result) {
            // $rootScope.mypageloading = false;
                
            if (result.success)
            {
                FlashService.Error(result.data.message);
                console.log('i='+i)
                updateTT(i+1)
            }
            else
            {
                FlashService.Error(result.data.message);
            }
        });
    }

    // updateTT(0);


    $scope.download = function(){

        function downloadCSV(){
            var a = document.createElement("a");
            var json_pre = JSON.stringify(timeTableDataList);
            var csv = Papa.unparse(json_pre);
            if (window.navigator.msSaveOrOpenBlob) {
                var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
                    type: "text/csv;charset=utf-8;"
                });
                navigator.msSaveBlob(blob, 'time_table.csv');
            } 
            else {
                a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
                a.target = '_blank';
                a.download = 'time_table.csv';
                document.body.appendChild(a);
                a.click();
            }
        };

        if($scope.timeTableSlots && $scope.timeTableSlots.length > 0){
            var timeTableDataList = []
            for(var i=0; i<$scope.timeTableSlots.length; i++){
                var data = {
                    'Slots': $scope.timeTableSlots[i]['name'],
                    'Monday': '',
                    'Tuesday': '',
                    'Wednesday': '',
                    'Thursday': '',
                    'Friday': '',
                    'Saturday': ''
                }
                if($scope.timeTableSlots[i]['day']){
                    var slotDay = $scope.timeTableSlots[i]['day'];
                    for(var j=0; j<slotDay.length; j++){
                        if(slotDay[j]['day'] == 1){
                            data['Monday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                        else if(slotDay[j]['day'] == 2){
                            data['Tuesday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                        else if(slotDay[j]['day'] == 3){
                            data['Wednesday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                        else if(slotDay[j]['day'] == 4){
                            data['Thursday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                        else if(slotDay[j]['day'] == 5){
                            data['Friday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                        else if(slotDay[j]['day'] == 6){
                            data['Saturday'] = slotDay[j]['class_name'] + ' ' + slotDay[j]['subject_name']
                        }
                    }
                }
                timeTableDataList.push(data);
            }
            downloadCSV();
            
        }
        else{
            var timeTableDataList = [{
                'Slots': '',
                'Monday': '',
                'Tuesday': '',
                'Wednesday': '',
                'Thursday': '',
                'Friday': '',
                'Saturday': ''
            }]
            downloadCSV();
        }
    }
});