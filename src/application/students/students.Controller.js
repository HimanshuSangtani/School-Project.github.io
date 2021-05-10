app.controller('studentsController', function ($rootScope, $location, $scope, HandShakeService, UtilService, $sessionStorage, $routeParams, HttpService, FlashService, $indexedDB, $log) {

    UtilService.setSidebar();
    $log.debug("studentsController reporting for duty.");
    $rootScope.showBackStrech = false;

    FlashService.Error('')
    FlashService.Success('')

    $scope.storeAWSUploadLink = '';
    $scope.storeAWSUploadMethod = '';

    $scope.showAddStudentModal = false;
    $scope.addNewStudentModal = [];

    $scope.showSearchedStudentList = [];
    $scope.showViewStudentModal = false;

    $scope.showAddNewStudentModal = false;
    $scope.showEditStudentModal = false;

    $scope.allClassListArray = [];
    $scope.getStudentIdToPromote = [];
    $scope.getClassIdToPromote = null;
    $scope.showPromoteClassModalBox = false;
    $scope.totalSelectedStudents = 0;

    $scope.checkAll = true;

    var studentList_hash = {};

    $scope.newStudentList = [];
    $scope.existingStudentList = [];
    $rootScope.mypageloading = true;
    $scope.classID = '';
    $scope.className = '';
    $scope.routeList = angular.fromJson($sessionStorage.routeList);
    if($routeParams.classID){
        $scope.classID = ($routeParams.classID).toString();
        if ($scope.classID.substring(0, 1) === ':') {
            $scope.classID = $scope.classID.substring(1);
        }
    }
    // $scope.className = $sessionStorage.className;

    $scope.bloodGroupList = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-', 'NA'];

    function getAllStudentInfo(){
        $scope.existingStudentList = [];
        $scope.lastAccessStudentCountObj = {
            'total_no_of_student_app_using': 0,
            'total_no_of_student_app_not_using': 0,
            'total_student': 0
        };
        if($scope.classID){
            HandShakeService.getStudentInfo($scope.classID).then(function (result) {
                $rootScope.mypageloading = false;
                $scope.existingStudentList = result;
    
                angular.forEach($scope.existingStudentList, function (obj) {
                    studentList_hash[obj._id] = obj;
                    $scope.getStudentIdToPromote.push(obj._id);
                    if(!obj.last_access_at) {
                        obj.last_access_at = "-"
                    } else if(typeof obj.last_access_at === 'number') {
                        obj.last_access_at = UtilService.timeInMin(new Date(obj.last_access_at))
    
                    if(!obj['last_access_at'] || obj['last_access_at'] == '-'){
                        $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] = $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] + 1
                    }
                    else{
                        $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] = $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] + 1
                    }
                    }
                })
                $scope.lastAccessStudentCountObj['total_student'] = $scope.existingStudentList.length
    
                //console.log(studentList_hash);
                $log.debug('studentInfo received');
                HandShakeService.getGradeInfo().then(function (classes) {
                    $scope.classList = classes;
                    for (var i = 0; i < $scope.classList.length; i++) {
                        if ($scope.classList[i]._id == $scope.classID) {
                            $scope.className = $scope.classList[i].name;
                            break;
                        }
                    }
                    // updateStuCountInClass($scope.existingStudentList.length);
    
                    angular.forEach(result, function (stuObject) {
                        if (stuObject.route_id !== undefined && stuObject.route_id !== null && stuObject.route_id !== '') {
                            HandShakeService.getRouteStopInfo(stuObject.route_id).then(function (routeObject) {
                                stuObject.route_name = routeObject.route_name;
                                if (routeObject.stop_list.length > 0) {
                                    var i = 0;
                                    for (i = 0; i < routeObject.stop_list.length; i++) {
                                        if (routeObject.stop_list[i]._id === stuObject.stop_id) {
                                            stuObject.stop_name = routeObject.stop_list[i].name;
                                            break;
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
            });
        }
    }
    

    $log.debug('HandShakeService.existingStudentList passed');


    $scope.openClassDetails = function () {
        $location.path('/students');
    }

    $scope.getClassIdChangeForStudentPromote = function (value) {
        FlashService.Error('')
        $scope.getClassIdToPromote = value;
    }

    $scope.getSelectedStudentsfunction = function (stuId, stuModal) {

        if (stuModal == true) {
            if ($scope.getStudentIdToPromote.indexOf(studentList_hash[stuId]._id) != -1) {
                $scope.totalSelectedStudents = $scope.totalSelectedStudents - 1;
                $scope.getStudentIdToPromote.splice($scope.getStudentIdToPromote.indexOf(studentList_hash[stuId]._id), 1)
            }
            else if ($scope.getStudentIdToPromote.indexOf(studentList_hash[stuId]._id) == -1) {
                $scope.totalSelectedStudents = $scope.totalSelectedStudents + 1;
                $scope.getStudentIdToPromote.push(studentList_hash[stuId]._id)
            }
        }
    }

    $scope.showPromoteClassModal = function () {
        //$scope.uncheckAllStudents();
        $scope.showPromoteClassModalBox = true;
        $scope.getStudentIdToPromote = [];
        $scope.getClassIdToPromote = null;
        $scope.totalSelectedStudents = 0;
        FlashService.Error('')

        $scope.checkAllStudents();

        angular.forEach($scope.existingStudentList, function (obj) {
            $scope.getStudentIdToPromote.push(obj._id);
            $scope.totalSelectedStudents = $scope.totalSelectedStudents + 1;
        })

    }

    $scope.checkAllStudents = function () {
        $scope.checkAll = true;
    }

    $scope.uncheckAllStudents = function () {
        $scope.checkAll = false;
        //$scope.getClassIdToPromote = null;
    }

    $scope.promoteStudentsToClass = function () {

        $scope.getTempNewStudentList = [];

        FlashService.Error('')
        if ($scope.getClassIdToPromote == null || $scope.getClassIdToPromote == undefined) {
            FlashService.Error('Please select class')
            return false
        }

        if ($scope.getStudentIdToPromote.length == 0) {
            FlashService.Error('Please select student')
            return false
        }

        $rootScope.mypageloading = true;

        var payLoadData = {
            "grade_id": $scope.getClassIdToPromote,
            "student_ids": $scope.getStudentIdToPromote
        }

        $scope.getTempNewStudentList = $scope.existingStudentList;

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/student/promote/class', payLoadData);
        requestHandle.then(function (result) {
            if (result.success) {
                $scope.uncheckAllStudents();
                $scope.showPromoteClassModalBox = false;
                FlashService.Success('Students promoted successfully.')
                getAllStudentInfo();
                return;
                // $scope.stuDataVar = [];
                // for (var i = 0; i < $scope.getStudentIdToPromote.length; i++) {
                //     var indexStu = $scope.getTempNewStudentList.indexOf(studentList_hash[$scope.getStudentIdToPromote[i]])
                //     $scope.getTempNewStudentList[indexStu].grade_id = $scope.getClassIdToPromote;
                //     $scope.stuDataVar.push($scope.getTempNewStudentList[indexStu]);
                //     $scope.existingStudentList.splice($scope.existingStudentList.indexOf(studentList_hash[$scope.getStudentIdToPromote[i]]), 1);
                // }

                // var indexFunction = function (counter) {

                //     if ($scope.stuDataVar[counter] != undefined) {

                //         $indexedDB.openStore('student', function (studentStore) {
                //             //$log.debug('opened studentStore, $scope.existingStudentList[indexInEditing].rollno = ' + $scope.existingStudentList[indexInEditing].rollno);
                //             studentStore.delete(parseInt($scope.stuDataVar[counter].rollno)).then(function (e) {
                //                 //var editStuList = [$scope.getTempNewStudentList[indexStu]];
                //                 console.log($scope.stuDataVar[counter]);
                //                 studentStore.upsert($scope.stuDataVar[counter]).then(function (e) {
                //                     $log.debug('upserted successfully in studentStore');
                //                     counter = counter + 1;
                //                     indexFunction(counter)
                //                     updateStuCountInClass($scope.existingStudentList.length);
                //                 },
                //                     function (error) {
                //                         $log.debug('Error in upserting in studentStore = ' + error);
                //                     });

                //             }, function (error) {
                //                 $log.debug('Error in upserting in studentStore = ' + error);
                //             });
                //         });
                //     }

                // }
                // indexFunction(0)
                
            }
            else {
                $rootScope.mypageloading = false;
            }
        });
    }

    function sendOTPtoAllParents() {
        var url = "";
        angular.forEach(allStudentList, function (studentObject) {
            if (studentObject.emer_1 && studentObject.emer_1 != 1111111111 && studentObject.emer_1 > 999999999) {
                url = "https://api.msg91.com/api/sendhttp.php?";
                url += "mobiles=" + studentObject.emer_1;
                url += "&authkey=282164Adf2h9q9g5d0d3ee1";
                url += "&route=4";
                url += "&sender=SAKETZ";
                url += "&message=" + "Hello " + studentObject.name + "'s parents.\n Download Saket's mobile app to track your school bus and attendance. Your OTP is " + studentObject.otp + "\n App Link https://bit.ly/2yBcGFc";
                // "url": "https://api.msg91.com/api/sendhttp.php?mobiles=7845238570&authkey=282164Adf2h9q9g5d0d3ee1&route=4&sender=TESTIN&message=Hello!%20This%20is%20a%20test%20message&country=91",

                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": url,
                    "method": "GET",
                    "headers": {}
                }
                console.log('sending SMS ' + studentObject.emer_1);
                $.ajax(settings).done(function (response) {
                    console.log(response);
                });
            } else {
                console.log('Incorrect contact number ' + studentObject.name);
            }

        });

    };

    function getAllStudentList(){
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService existingStudentList received');
            console.log(result);
            allStudentList = result;
            //$scope.showAddNewStudentModal = !$scope.showAddNewStudentModal;
            $scope.newStudentList.length = 0;
            $scope.newStudentList = [];
            $scope.editing = false;
            $scope.addStudent();
            FlashService.Error('');
            // sendOTPtoAllParents();

             // updateNumber(358);
        });
        $log.debug('HandShakeService.existingStudentList passed');
    }
    // getAllStudentList();

    var allStudentList = [];
    $scope.addNewStudent = function () {

        $scope.showAddStudentModal = true;

        $scope.addNewStudentModal.studentName = '';
        $scope.addNewStudentModal.fatherName = '';
        $scope.addNewStudentModal.motherName = '';
        $scope.addNewStudentModal.rollno = '';
        $scope.addNewStudentModal.city = '';
        $scope.addNewStudentModal.address = '';
        $scope.addNewStudentModal.gender = '';
        $scope.addNewStudentModal.bloodGroup = '';
        $scope.addNewStudentModal.emer_1 = '';
        $scope.addNewStudentModal.alternateEmer_1 = '';
        $scope.addNewStudentModal.rfid = '';
        $scope.addNewStudentModal.routeID = '';
        $scope.addNewStudentModal.stopID = '';
        $scope.addNewStudentModal.parentNotify = '';
        //$scope.addNewStudentModal.status = '';
        $scope.addNewStudentModal.doj = '';
        $scope.addNewStudentModal.dob = '';
        $scope.addNewStudentModal.type = '';
        // getAllStudentList();
        // getAllStudentInfo();

        $log.debug('HandShakeService.allStudentList call');
    };


    $scope.addNewStudentFunction = function () {


        FlashService.Error('');

        if ($scope.addNewStudentModal.studentName == undefined || $scope.addNewStudentModal.studentName == '') {
            FlashService.Error('Please enter student name');
            return false
        }

        if ($scope.addNewStudentModal.rollno == undefined || $scope.addNewStudentModal.rollno == '') {
            FlashService.Error('Please enter roll number');
            return false
        }

        if ($scope.addNewStudentModal.rollno < 1) {
            FlashService.Error('Please enter correct roll number');
            return false
        }

        if ($scope.addNewStudentModal.gender == undefined || $scope.addNewStudentModal.gender == '') {
            FlashService.Error('Please select gender');
            return false
        }


        if ($scope.addNewStudentModal.emer_1 == undefined || $scope.addNewStudentModal.emer_1 == '') {
            FlashService.Error('Please enter contact number');
            return false
        }

        if ($scope.addNewStudentModal.emer_1 && $scope.addNewStudentModal.emer_1.toString().length != 10) {
            FlashService.Error('Contact number should be 10 digit number.');
            return false
        }

        if ('alternateEmer_1' in $scope.addNewStudentModal && $scope.addNewStudentModal.alternateEmer_1 && 
            $scope.addNewStudentModal.alternateEmer_1.toString().length != 10) {
            FlashService.Error('Alternative Contact number should be 10 digit number.');
            return false
        }

        if ($scope.addNewStudentModal.rfid == undefined || $scope.addNewStudentModal.rfid == '') {
            FlashService.Error('Please enter RFID');
            return false
        }

        // if ($scope.addNewStudentModal.status == undefined || $scope.addNewStudentModal.status == '') {
        //     FlashService.Error('Please enter Status');
        //     return false
        // }

        // if ($scope.addNewStudentModal.status < 1) {
        //     FlashService.Error('Please enter correct status');
        //     return false
        // }

        if ($scope.addNewStudentModal.bloodGroup == undefined || $scope.addNewStudentModal.bloodGroup == '') {
            $scope.addNewStudentModal.bloodGroup = 'Unknown';
        }
        else {
            $scope.addNewStudentModal.bloodGroup = $scope.bloodGroupList[$scope.addNewStudentModal.bloodGroup];
        }

        if ($scope.addNewStudentModal.parentNotify != true || $scope.addNewStudentModal.parentNotify == '') {
            $scope.addNewStudentModal.parentNotify = false;
        }

        if ($scope.addNewStudentModal.type == undefined || $scope.addNewStudentModal.type == '') {
            $scope.addNewStudentModal.type = 'FEES';
        }

        $rootScope.mypageloading = true;

        $scope.newStudentList = [

            {
                name: $scope.addNewStudentModal.studentName,
                fathername: $scope.addNewStudentModal.fatherName,
                mothername: $scope.addNewStudentModal.motherName,
                blood: $scope.addNewStudentModal.bloodGroup,
                address: $scope.addNewStudentModal.address,
                rollno: $scope.addNewStudentModal.rollno,
                gender: $scope.addNewStudentModal.gender,
                rfid: $scope.addNewStudentModal.rfid,
                city: $scope.addNewStudentModal.city,
                emer_1: $scope.addNewStudentModal.emer_1,
                contact2: $scope.addNewStudentModal.alternateEmer_1,
                route_id: $scope.addNewStudentModal.routeID,
                stop_id: $scope.addNewStudentModal.stopID,
                parent_notified: $scope.addNewStudentModal.parentNotify,
                //status: $scope.addNewStudentModal.status,
                doj: $scope.addNewStudentModal.doj,
                dob: $scope.addNewStudentModal.dob,
                rteorfees: $scope.addNewStudentModal.type
            }
        ];

        //console.log($scope.newStudentList);
        $scope.saveStudent();

        // Need to check duplicate roll number and RFID before hit the Add new student API

        // var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/student/' + $scope.classID, $scope.newStudentList);
        // requestHandle.then(function (result) {
        //     if (result.success == true) {

        //         $scope.showAddStudentModal = false;
        //         //$scope.existingStudentList.concat(result.data);

        //         $log.debug('scope.existingStudentList = ' + $scope.existingStudentList);
        //         $scope.newStudentList.length = 0;
        //         $scope.newStudentList = [];
        //         //$scope.showAddNewStudentModal = false;

        //         $indexedDB.openStore('student', function (studentStore) {
        //             $log.debug('opened studentStore');
        //             studentStore.upsert(result.data).then(function (e) {
        //                 $log.debug('upserted successfully in existingStudentList');
        //                 $scope.existingStudentList = $scope.existingStudentList.concat(result.data);
        //                 updateStuCountInClass($scope.existingStudentList.length);
        //             },
        //                 function (error) {
        //                     $log.debug('Error in upserting in existingStudentList = ' + error);
        //                 });
        //         });
        //         HandShakeService.stuwarningcheck();
        //     }
        //     else {
        //         if (result.data == null || result.data == '' || result.data == undefined) {
        //             FlashService.Error('Oops, something went wrong! Please login again.');
        //         }
        //         else {
        //             FlashService.Error(result.data);
        //         }
        //     }
        // });
    }


    $scope.addStudent = function () {
        $log.debug('addStudent called');
        var studentInfo = {
            name: '',
            rollno: '',
            gender: '',
            rfid: ''
        };
        //$scope.editing = false;
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
        $scope.newStudentList.push(studentInfo);
        $log.debug('$scope.newStudentList.length ' + $scope.newStudentList.length);
    };

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];
        $scope.showAddNewStudentModal = false;
        $scope.showEditStudentModal = false;
        FlashService.Error('');
    };


    var indexInEditing = 0;

    $scope.saveStudent = function () {

        $rootScope.mypageloading = true;

        $log.debug('saveStudent called');

        $log.debug('$scope.newStudentList.length' + $scope.newStudentList.length);
        $log.debug('$scope.newStudentList.length' + $scope.newStudentList[0].name);
        //$scope.unassignedDeviceList[newStudentInfo.unassignedListIndex].bus_number = newStudentInfo.bus_number;

        var duplicateCheck = checkDuplicateEntries();

        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);
        //$sessionStorage.newStudentList = $scope.newStudentList;
        if (duplicateCheck == true) {
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/student/' + $scope.classID, $scope.newStudentList);
            requestHandle.then(function (result) {
                if (result.success == true) {

                    //$scope.existingStudentList.concat(result.data);
                    $scope.showAddStudentModal = false;

                    $log.debug('scope.existingStudentList = ' + $scope.existingStudentList);
                    $scope.newStudentList.length = 0;
                    $scope.newStudentList = [];
                    $scope.showAddNewStudentModal = false;
                    $rootScope.mypageloading = false;
                    getAllStudentInfo();
                    return;
                    // $indexedDB.openStore('student', function (studentStore) {
                    //     $log.debug('opened studentStore');
                    //     studentStore.upsert(result.data).then(function (e) {
                    //         $log.debug('upserted successfully in existingStudentList');
                    //         $scope.existingStudentList = $scope.existingStudentList.concat(result.data);
                    //         updateStuCountInClass($scope.existingStudentList.length);
                    //     },
                    //         function (error) {
                    //             $log.debug('Error in upserting in existingStudentList = ' + error);
                    //         });
                    // });
                    // HandShakeService.stuwarningcheck();
                }
                else {
                    if (result.data == null || result.data == '' || result.data == undefined) {
                        FlashService.Error('Oops, something went wrong! Please login again.');
                    }
                    else {
                        FlashService.Error(result.data);
                    }
                }
            });
        }
        else {
            FlashService.Error('Student Roll No and RFID should be unique.');
            $rootScope.mypageloading = false;
        }

    };


    $scope.editStudentInfo = function (studentInfo, $index) {
        $log.debug('Editing Student info');
        editStudentUtil(studentInfo, $index);

        // if (allStudentList.length == 0) {
        //     $log.debug('HandShakeService.allStudentList call');
        //     HandShakeService.getAllStudentInfo().then(function (result) {
        //         $log.debug('HandShakeService existingStudentList received');
        //         allStudentList = result;

        //         editStudentUtil(studentInfo, $index);
        //     });
        //     $log.debug('HandShakeService.existingStudentList passed');
        // } else {
        //     editStudentUtil(studentInfo, $index);
        // }

    };

    $scope.resendOTP = function (studentInfo) {
        console.log(JSON.stringify(studentInfo))
        var schoolName = angular.fromJson($sessionStorage.profileInfo).name;
        var smsObj = {
            number: studentInfo.emer_1,
            message: 'Hello '+ studentInfo.name +'! Your OTP for school app is '+ studentInfo.otp + '\nHow to? \nhttps://bit.ly/2YXYWRN \nRegards,\n '+ schoolName
        }

        var confirmit = confirm(smsObj.message);

        if (confirmit)
        {
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/sendsms', smsObj);
            requestHandle.then(function (result) {
                if (result.success)
                {

                    alert('OTP sent successfully')
                }
                else
                {
                    FlashService.Error(result.data.message);
                }
            });
        }

    };

    function editStudentUtil(studentInfo, $index) {
        $scope.editing = true;
        $scope.newStudentList.length = 0;
        $scope.newStudentList = [];

        console.log(studentInfo);

        $scope.addStudent();
        angular.copy(studentInfo, $scope.newStudentList[0]);

        $scope.newStudentList[0].dob = new Date($scope.newStudentList[0].dob);
        $scope.newStudentList[0].doj = new Date($scope.newStudentList[0].doj);

        // var getDateDob = new Date(studentInfo.dob);
        // var datestringDob = getDateDob.getFullYear() + "-" + ("0" + (getDateDob.getMonth() + 1)).slice(-2) + "-" + ("0" + getDateDob.getDate()).slice(-2);
        // $scope.newStudentList[0].dob = datestringDob;


        // var getDate = new Date(studentInfo.doj);
        // var datestring = getDate.getFullYear() + "-" + ("0" + (getDate.getMonth() + 1)).slice(-2) + "-" + ("0" + getDate.getDate()).slice(-2);
        // $scope.newStudentList[0].doj = datestring;


        // angular.copy($scope.existingStudentList[$index], );
        $log.debug('$scope.newStudentList[0].blood = ' + $scope.newStudentList[0].blood);
        for (var bloodIndex = 0; bloodIndex < $scope.bloodGroupList.length; bloodIndex++) {
            if ($scope.bloodGroupList[bloodIndex] == $scope.newStudentList[0].blood) {
                $log.debug('bloodListIndex = ' + bloodIndex);
                $scope.newStudentList[0].bloodListIndex = bloodIndex;
                break;
            }
        }
        $scope.showEditStudentModal = true;
        indexInEditing = $index;
        FlashService.Error('');
    }
    ;


    $scope.deleteNewStudent = function ($index) {
        $log.debug('deleteNewStudent new called');
        $scope.newStudentList.splice($index, 1);
    }




    $scope.updateStudentInfo = function () {
        $log.debug('inside updateStudentInfo');
        FlashService.Error('');
        console.log($scope.newStudentList[0])
        if ($scope.newStudentList[0].name == undefined || $scope.newStudentList[0].name == '') {
            FlashService.Error('Please enter student name');
            return false
        }

        if ($scope.newStudentList[0].rollno == undefined || $scope.newStudentList[0].rollno == '') {
            FlashService.Error('Please enter roll number');
            return false
        }

        if ($scope.newStudentList[0].rollno < 1) {
            FlashService.Error('Please enter correct roll number');
            return false
        }

        if ($scope.newStudentList[0].gender == undefined || $scope.newStudentList[0].gender == '') {
            FlashService.Error('Please select gender');
            return false
        }

        if ($scope.newStudentList[0].emer_1 == undefined || $scope.newStudentList[0].emer_1 == '') {
            FlashService.Error('Please enter contact number');
            return false
        }

        if ($scope.newStudentList[0].emer_1 && $scope.newStudentList[0].emer_1.toString().length != 10) {
            FlashService.Error('Contact number should be 10 digit number.');
            return false
        }
        if ('contact2' in $scope.newStudentList[0] && $scope.newStudentList[0].contact2 && 
                $scope.newStudentList[0].contact2.toString().length != 10) {
            FlashService.Error('Alternative Contact number should be 10 digit number.');
            return false
        }

        if ($scope.newStudentList[0].rfid == undefined ||$scope.newStudentList[0].rfid == '') {
            FlashService.Error('Please enter RFID');
            return false
        }

        if ($scope.newStudentList[0].blood == undefined || $scope.newStudentList[0].blood == '') {
            $scope.newStudentList[0].blood = 'Unknown';
        }
        if ($scope.newStudentList[0].parent_notified != true || $scope.newStudentList[0].parent_notified == '') {
            $scope.newStudentList[0].parent_notified = false;
        }

        if ($scope.newStudentList[0].type == undefined || $scope.newStudentList[0].type == '') {
            $scope.newStudentList[0].type = 'FEES';
        }
        var duplicateCheck = checkDuplicateEntriesWhileUpdate();
        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);

        if (duplicateCheck == 1) {

            $scope.newStudentList[0].dob = new Date($scope.newStudentList[0].dob);
            $scope.newStudentList[0].doj = new Date($scope.newStudentList[0].doj);

            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/student/'
                + $scope.newStudentList[0]._id, $scope.newStudentList[0]);
            requestHandle.then(function (result) {
                if (result.success == true) {


                    $scope.showEditStudentModal = false;
                    $scope.editing = false;
                    getAllStudentInfo();
                    // $indexedDB.openStore('student', function (studentStore) {
                    //     $log.debug('opened studentStore, $scope.existingStudentList[indexInEditing].rollno = ' + $scope.existingStudentList[indexInEditing].rollno);
                    //     studentStore.delete($scope.existingStudentList[indexInEditing].rollno).then(function (e) {
                    //         var editStuList = [$scope.newStudentList[0]];
                    //         studentStore.upsert(editStuList).then(function (e) {
                    //             $log.debug('upserted successfully in studentStore');
                    //             var stuIndex = -1;
                    //             for (var i = 0; i < $scope.existingStudentList.length; i++) {
                    //                 if ($scope.existingStudentList[i]._id === $scope.newStudentList[0]._id) {
                    //                     if ($scope.existingStudentList[i].grade_id != $scope.newStudentList[0].grade_id) {
                    //                         stuIndex = i;
                    //                     } else {
                    //                         $scope.existingStudentList[i] = $scope.newStudentList[0];
                    //                     }
                    //                 }
                    //             }
                    //             if (stuIndex > -1) {
                    //                 $scope.existingStudentList.splice(stuIndex, 1);
                    //                 updateStuCountInClass($scope.existingStudentList.length);
                    //             }
                    //         },
                    //             function (error) {
                    //                 $log.debug('Error in upserting in studentStore = ' + error);
                    //             });

                    //     }, function (error) {
                    //         $log.debug('Error in upserting in studentStore = ' + error);
                    //     });
                    // });
                    // getAllStudentList();
                }
                else {
                    if (result.data == null || result.data == '' || result.data == undefined) {
                        FlashService.Error('Oops, something went wrong! Please login again.');
                    }
                    else {
                        FlashService.Error(result.data);
                    }
                }
            });
        }
        else if (duplicateCheck == -1) {
            FlashService.Error('Student Roll No and RFID should be unique.');
        }
        else {
            $scope.showEditStudentModal = false;
            $scope.editing = false;
        }

    }

    $scope.deleteStudent = function (studentInfo, $index) {
        $log.debug('Deleting student info, index' + ' ' + $index);

        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/student/' + studentInfo._id);
        requestHandle.then(function (result) {
            if (result.success == true) {
                getAllStudentInfo();

                // $indexedDB.openStore('student', function (studentStore) {
                //     $log.debug('opened studentStore');
                //     studentStore.delete($scope.existingStudentList[$index].rollno).then(function (e) {
                //         $log.debug('deleted successfully in studentStore');
                //         var stuIndex = -1;
                //         for (var i = 0; i < $scope.existingStudentList.length; i++) {
                //             if ($scope.existingStudentList[i]._id == studentInfo._id) {
                //                 stuIndex = i;
                //             }
                //         }
                //         if (stuIndex > -1) {
                //             $scope.existingStudentList.splice(stuIndex, 1);
                //         }

                //         updateStuCountInClass($scope.existingStudentList.length);
                //         // HandShakeService.stuwarningcheck();
                //     },
                //         function (error) {
                //             $log.debug('Error in upserting in studentStore = ' + error);
                //         });
                // });
            }
            else {
                if (result.data == null || result.data == '' || result.data == undefined) {
                    FlashService.Error('Oops, something went wrong! Please login again.');
                }
                else {
                    FlashService.Error(result.data);
                }
            }
        });

    }

    function checkDuplicateEntries() {
        $log.debug('Inside check duplicate entries');
        $sessionStorage.newStudentList = $scope.newStudentList;
        for (var iterNew = 0; iterNew < $scope.newStudentList.length; iterNew++) {
            $scope.newStudentList[iterNew].blood = $scope.bloodGroupList[$scope.newStudentList[iterNew].bloodListIndex];
            // $log.debug('$scope.newStudentList[iterNew].blood = ' + $scope.newStudentList[iterNew].blood);
            // for (var iterInNew = iterNew + 1; iterInNew < $scope.existingStudentList.length; iterInNew++) {
            //     if ($scope.existingStudentList[iterInNew].rollno == cnewStudentList[iterNew].rollno ||
            //         $scope.existingStudentList[iterInNew].rfid == $scope.newStudentList[iterNew].rfid) {
            //         return false;
            //     }
            // }

            $log.debug('allStudentList.length ' + allStudentList.length);
            for (var iterExist = 0; iterExist < $scope.existingStudentList.length; iterExist++) {
                
                if ($scope.existingStudentList[iterExist].rollno == $scope.newStudentList[iterNew].rollno ||
                    $scope.existingStudentList[iterExist].rfid == $scope.newStudentList[iterNew].rfid) {
                    return false;
                }
            }
        }
        return true;
    }


    function checkDuplicateEntriesWhileUpdate() {
        $log.debug('Inside checkDuplicateEntriesWhileUpdate');
        $scope.newStudentList[0].blood = $scope.bloodGroupList[$scope.newStudentList[0].bloodListIndex];
        $log.debug('$scope.newStudentList[0].blood = ' + $scope.newStudentList[0].blood);
        if(allStudentList && allStudentList.length > 0){
            for (var iterExist = 0; iterExist < allStudentList.length; iterExist++) {
                $log.debug(allStudentList[iterExist].rollno);
                $log.debug(allStudentList[iterExist].rfid);
                $log.debug(allStudentList[iterExist]._id + ' ' + $scope.newStudentList[0]._id);
                if('_id' in $scope.newStudentList[0] && $scope.newStudentList[0]['_id']){
                    if ($scope.newStudentList[0]._id != allStudentList[iterExist]._id) {
                        if ($scope.newStudentList[0].rollno == allStudentList[iterExist].rollno ||
                            $scope.newStudentList[0].rfid == allStudentList[iterExist].rfid ) {
                            return -1;
                        }
                    }
                }
                else {
                    if (allStudentList[iterExist].rollno == $scope.newStudentList[0].rollno ||
                        allStudentList[iterExist].rfid == $scope.newStudentList[0].rfid) {
                        return -1;
                    }
                }
    
            }
            return 1;
        }
        else{
            return 1;
        } 
    }

    function updateStuCountInClass(stuCount) {
        $log.debug('updateStuCountInClass stuCount = ' + stuCount);
        $indexedDB.openStore('class', function (classStore) {
            classStore.find($scope.className).then(function (classInfo) {
                classInfo.count = stuCount;
                classStore.upsert(classInfo).then(function (e) {
                    $log.debug('upserted successfully in studentStore ');

                },
                    function (error) {
                        $log.debug('Error in upserting in studentStore = ' + error);
                    });

            });
        });
    };

    $scope.myFile = '';

    $scope.itemField = [{
        documentName: '',
        file: ''
    }];

    $scope.addItem = function () {

        var newItem = {
            documentName: '',
            file: $scope.myFile
        };

        $scope.itemField.push(newItem);
        console.log($scope.itemField);
    }

    $scope.removeItem = function (item) {
        console.log(item);
        var index = $scope.itemField.indexOf(item);
        $scope.itemField.splice(index, 1);
    }

    $scope.getImageUploadLinkFunction = function () {

        // var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/sales/salesman/imagelink?path=salesman');
        // requestHandle.then(function (result) {
        //     if (result.success) {

        //         $scope.storeAWSUploadLink = result.data.url;

        //     } else {
        //         FlashService.Error('Something went wrong. Please try again');
        //     }
        // });
    }

    $scope.uploadFileToAWSLink = function () {

        //UtilService.uploadToAWS($scope.file, $scope.storeAWSUploadLink);
    }

    $scope.showViewStudentDetails = function (studentInfo) {

        FlashService.Error('')
        $scope.showSearchedStudentList.studentName = '';
        $scope.showSearchedStudentList.fatherName = '';
        $scope.showSearchedStudentList.motherName = '';
        $scope.showSearchedStudentList.rollno = '';
        $scope.showSearchedStudentList.class = '';
        $scope.showSearchedStudentList.city = '';
        $scope.showSearchedStudentList.address = '';
        $scope.showSearchedStudentList.gender = '';
        $scope.showSearchedStudentList.bloodGroup = '';
        $scope.showSearchedStudentList.emer_1 = '';
        $scope.showSearchedStudentList.alternateEmer_1 = '';
        $scope.showSearchedStudentList.doj = '';
        $scope.showSearchedStudentList.dob = '';
        $scope.showSearchedStudentList.rteorfees = '';

        $scope.showSearchedStudentList.studentName = studentInfo.name ? studentInfo.name : 'NA';
        $scope.showSearchedStudentList.fatherName = studentInfo.fathername ? studentInfo.fathername : 'NA';
        $scope.showSearchedStudentList.motherName = studentInfo.mothername ? studentInfo.mothername : 'NA';
        $scope.showSearchedStudentList.rollno = studentInfo.rollno ? studentInfo.rollno : 'NA';
        $scope.showSearchedStudentList.class = $scope.className ? $scope.className : 'NA';
        $scope.showSearchedStudentList.city = studentInfo.city ? studentInfo.city : 'NA';
        $scope.showSearchedStudentList.address = studentInfo.address ? studentInfo.address : 'NA';
        $scope.showSearchedStudentList.emer_1 = studentInfo.emer_1 ? studentInfo.emer_1 : 'NA';
        $scope.showSearchedStudentList.alternateEmer_1 = studentInfo.contact2 ? studentInfo.contact2 : 'NA';
        $scope.showSearchedStudentList.rfid = studentInfo.rfid ? studentInfo.rfid : 'NA';
        $scope.showSearchedStudentList.gender = studentInfo.gender ? studentInfo.gender : 'NA';
        $scope.showSearchedStudentList.bloodGroup = studentInfo.blood ? studentInfo.blood : 'NA';
        $scope.showSearchedStudentList.doj = studentInfo.doj ? studentInfo.doj : 'NA';
        $scope.showSearchedStudentList.dob = studentInfo.dob ? studentInfo.dob : 'NA';
        $scope.showSearchedStudentList.rteorfees = studentInfo.rteorfees ? studentInfo.rteorfees : 'NA';

        $scope.showViewStudentModal = true;
    }


    $scope.blockParent = function(student_id,is_block){
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/student/block-parent/'
                + student_id, {is_block:is_block});
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true) {
                if(is_block){
                    alert(studentList_hash[student_id].name + "'s parents account blocked successfully");
                }
                else{
                    alert(studentList_hash[student_id].name + "'s parents account unblocked successfully");
                }
                getAllStudentInfo();
                return;
                // $indexedDB.openStore('student', function (studentStore) {
                //     studentStore.delete(studentList_hash[student_id].rollno).then(function (e) {
                //         studentList_hash[student_id].is_parent_block = is_block;
                //         studentStore.upsert([studentList_hash[student_id]]).then(function (e) {
                //             $log.debug('upserted successfully in studentStore');
                //             getAllStudentInfo();
                //         },
                //             function (error) {
                //                 $log.debug('Error in upserting in studentStore = ' + error);
                //             });

                //     }, function (error) {
                //         $log.debug('Error in upserting in studentStore = ' + error);
                //     });
                // });


            } else {
                alert(result.data.message);
                FlashService.Error(result.data.message);
            }
        });
    }

    var fileInput = document.getElementById("csv"),

        readFile = function () {
            Papa.parse(fileInput.files[0], {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    data = results.data;
                    var classNameCsvRow;
                    $scope.newStudentList = [];
                    for (var i = 0; i < data.length; i++) {
                        var classObj = $scope.className.split("-");
                        if (data[i]['Scholor No.'] && data[i]['Mobile No.'] && data[i]['Class'] && data[i]['Section'] && data[i]['Class'].toUpperCase()+ '-'+data[i]['Section'].toString().toUpperCase() == $scope.className) {
                            // if (data[i]['Scholor No.'] && data[i]['Mobile No.'] && data[i]['Class'] && data[i]['Class'].toUpperCase() == classObj[0] && data[i]['Section'] == classObj[1]) {
                            var gender;
                            gender = 'GIRL';
                            if (data[i]['Gender'] == 'Male') {
                                gender = 'BOY';
                            } else if (data[i]['Gender'] == 'F') {
                                gender = 'GIRL';
                            } else {
                                gender = 'OTHER';
                            }
                            if (!data[i]['Mobile No.']) {
                                console.log('number missing for ' + data[i]['Student Name']);
                                alert('number missing for ' + data[i]['Student Name'])
                                data[i]['Mobile No.'] = 1111111111;
                            }
                            $scope.newStudentList.push({
                                name: data[i]['Student Name'],
                                fathername: data[i]['Father Name']?data[i]['Father Name']: "",
                                mothername: data[i]['Mother Name']?data[i]['Mother Name']:"",
                                address: data[i]['Address']?data[i]['Address']:"",
                                city: data[i]['Village']?data[i]['Village']:"",
                                rollno: data[i]['Scholor No.']?data[i]['Scholor No.']:"",
                                rfid: data[i]['Scholor No.']?data[i]['Scholor No.']:"",
                                gender: gender,
                                emer_1: data[i]['Mobile No.'],
                                // blood: data[i]['Blood Group'],
                                // contact2: data[i]['Mobile No.2'],
                                // doj: data[i]['Date of Admission'],
                                // dob: data[i]['DOB'],
                                // cat: data[i]['Category'],
                                // cast: data[i]['Cast'],
                                // religion: data[i]['Religion']
                                // rteorfees: data[i]['R/F']
                            });


                        } else {
                            console.log('name or sch no doesnt exist ' + i)
                        }
                    }
                    $scope.saveStudent();
                }
            });

        };

    fileInput.addEventListener('change', readFile);
// allStudentList


    function updateNumber (i){
        if(i == allStudentList.length) {
            console.log('finished')
            alert('finished')
            return;
        }
        allStudentList[i].emer_1 = allStudentList[i].emer_1.replace(/,\s*$/, "");
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/student/'
                + allStudentList[i]._id, allStudentList[i]);
            requestHandle.then(function (result) {
                if (result.success == true) {
                    updateNumber(i+1)
                } else {
                    console.log('error i = '+i)
                    console.log('allStudentList[i].name '+allStudentList[i].name)
                    FlashService.Error(result.data.message);
                    alert('error')
                }
            });

    }
    // updateNumber(0);

    getAllStudentInfo();

    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "class_student_list.pdf");
        });

    }


});