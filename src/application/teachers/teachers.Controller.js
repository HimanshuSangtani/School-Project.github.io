app.controller('teachersController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;

    $scope.showModal = false;
    $scope.testModal = false;
    $scope.teachersList = [];
    $scope.subjectList = [];
    $scope.SubjectListing = [];

    var csvData = [];
    $scope.newTeacherList = [];
    var duplicateTeacherList = [];
    var newTeacherDataObject = {};
    var tempNewTeacherList = [];
    var csvFileFieldList = [];
    var csvFileReadFieldList = [];
    var csvFileUnReadFieldList = [];
    var newTeacherPasswordDetail = [];
    $scope.csvFileErrorReport = {
        'total_rows': 0,
        'total_success_rows': 0,
        'total_error_rows': 0,
        'error_summary': {}
    }
    var errorSummaryObj = {}
    $scope.isDataValidationProcessComplete = false;

    $rootScope.mypageloading = true;

    function reset() {
        $scope.newTeacher = {};
        $scope.classes = [];
        $scope.classHash = [];
        $scope.selectedClassIds = [];
        $scope.disablePassword = false;
        $scope.classSubList = [];
    };

    reset();

    getTeacherList();

    function getTeacherList() {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher');
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success == true) {
                $scope.teachersList = result.data;
                beautifyTeachersViewList();

            } else {

            }
        });
    };


    // HandShakeService.getGradeInfo().then(function (result) {
    //     $log.debug('HandShakeService getRouteInfo received');
    //     //$scope.existingClassList = result;
    //     $rootScope.mypageloading = false;
    //     // serverFormatToList(result);
    // });

    function beautifyTeachersViewList() {
        angular.forEach($scope.teachersList, function (teacher) {
            teacher.classView = '';
            teacher.classTeacherView = '';
            angular.forEach(teacher.classes_subject, function (classes) {
                    teacher.classView += classes.class + '->' + classes.subject + '  '
            });
            angular.forEach(teacher.class_teacher, function (classTeacher) {
                teacher.classTeacherView += classTeacher.class + ' '
            });
            teacher.last_access_at = teacher.last_access_at ? UtilService.timeInMin(new Date(teacher.last_access_at)) : "-"
        });
    };

    $scope.addNewTeacher = function () {
        $log.debug('addNewTeacher callled');
        reset();
        $scope.classSubList = [];
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getGradeInfo received');
            $rootScope.mypageloading = false;
            $scope.classes = result;
            $log.debug("classes = ", JSON.stringify(result));

            angular.forEach($scope.classes, function (classObject) {
                $scope.classHash[classObject.name] = {
                    _id: classObject._id,
                    name: classObject.name
                }
            });
            $scope.showModal = true;
            $scope.selectedClassIds = [];
            $scope.newTeacher = {
                name: '',
                // email: '',
                contact: '',
                // teacher_id: '',
                role: '',
                password: '',
                class_teacher: [],
                classes_subject: [],
                uid: ''
            };
            $scope.editing = false;
            FlashService.Error('');
        }, function (error) {
            $rootScope.mypageloading = false;
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    };

    // Get All subject list

    $scope.getAllSubjects = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject');
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.SubjectListing = result.data;
                $scope.subjectList = [];
                angular.forEach($scope.SubjectListing, function (subjects) {
                    if (subjects && subjects.classes) {
                        angular.forEach(subjects.classes, function (classes_id) {
                            if (classes_id) {
                                $scope.subjectList.push({
                                    class_id: classes_id,
                                    customer_id: subjects.customer_id,
                                    name: subjects.name
                                })
                            }
                        });
                    }
                });
            }
        })
    }
    $scope.getAllSubjects();

    $scope.editTeacher = function (teacher, $index) {
        $log.debug('addNewTeacher callled');
        reset();
        $scope.editing = true;
        $scope.disablePassword = true;
        // var teacherEdit = $scope.teachersList[$index];
        var teacherEdit = {};
        $scope.editTeacherInfo = teacher;

        var teacherIndex = -1;
        for (var i = 0; i < $scope.teachersList.length; i++) {
            if ($scope.teachersList[i]._id == teacher._id) {
                teacherIndex = i;
            }
        }
        $scope.indexInEditing = teacherIndex;
        // angular.forEach($scope.teachersList, function (teacherList) {
        //     if(teacherList.teacher_id===teacher.teacher_id){

        //         teacherEdit=teacherList;
        //     }

        // })


        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getGradeInfo received');
            $rootScope.mypageloading = false;
            angular.forEach(result, function (classObject) {
                $scope.classes.push({
                    _id: classObject._id,
                    name: classObject.name
                });
                $scope.classHash[classObject._id] = {
                    _id: classObject._id,
                    name: classObject.name
                };
            });
            $scope.showModal = true;
            $scope.selectedClassIds = [];
            angular.forEach(teacher.class_teacher, function (classTeacher) {
                if (classTeacher.class_id) {
                    $scope.selectedClassIds.push({
                        _id: classTeacher.class_id,
                    });
                }
            });

            angular.forEach(teacher.classes_subject, function (classSub) {
                if (classSub.class_id) {
                    $scope.getSubjectsAccordingToclass(classSub, 'edit');
                }
            });


            $scope.newTeacher = {
                name: teacher.name,
                // email: teacher.email,
                contact: teacher.contact,
                teacher_id: Number(teacher.teacher_id),
                role: teacher.role,
                password: '',
                class_teacher: teacher.class_teacher,
                classes_subject: teacher.classes_subject,
                uid: teacher.uid
            };
            FlashService.Error('');
        }, function (error) {
            $rootScope.mypageloading = false;
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    };

    $scope.getSubjectsAccordingToclass = function (classInfo, status) {
        var result = $scope.subjectList.reduce(function (r, a) {
            r[a.class_id] = r[a.class_id] || [];
            r[a.class_id].push(a);
            return r;
        }, Object.create(null));
        if (status == 'edit') {
            angular.forEach(result, function (subjects, key) {
                if (classInfo.class_id === key) {
                    var subjectName = [];
                    var subjectdata;
                    angular.forEach(subjects, function (subjectsname, key) {
                        // subjectdata = { "_id": subjectsname.sub_id, "name": subjectsname.name };
                        subjectName.push(subjectsname.name)
                    })
                    $scope.classSubList.push({
                        subject: classInfo.subject,
                        _id: classInfo.class_id,
                        name: classInfo.class,
                        subjectList: subjectName
                    });

                }
            })
        } else {
            angular.forEach(result, function (subjects, key) {
                if (classInfo._id === key) {
                    var subjectName = [];
                    angular.forEach(subjects, function (subjectsname, key) {
                        subjectName.push(subjectsname.name)
                    })
                    classInfo.subjectList = subjectName;
                }
            })
        }
    }

    $scope.addNewClassSub = function () {
        $scope.classSubList.push({
            subject: "",
            _id: "",
            name: "",
            subjectList: []
        });
    };

    $scope.deleteNewClassSub = function ($index) {
        $scope.classSubList.splice($index, 1);
    }

    $scope.saveNewTeacher = function () {
        $rootScope.mypageloading = true;
        $scope.newTeacher.classes_subject = [];
        $scope.newTeacher.class_teacher = [];

        // if ($scope.newTeacher.contact && $scope.newTeacher.contact.length != 10) {
        //     FlashService.Error('Contact number should be of 10 digits.');
        //     return true;
        // }
        // if ($scope.newTeacher.password && $scope.newTeacher.password < 6) {
        //     FlashService.Error('Password should be of at-least 6 characters.');
        //     return true;
        // }

        angular.forEach($scope.selectedClassIds, function (selectedClass) {
            if (selectedClass._id) {
                angular.forEach($scope.classes, function (classObject) {
                    if (classObject._id == selectedClass._id) {
                        $scope.newTeacher.class_teacher.push({
                            class: classObject.name,
                            class_id: selectedClass._id
                        });
                    }
                });
            }
        });
        angular.forEach($scope.classSubList, function (classSub) {
            if (classSub._id) {
                angular.forEach($scope.classes, function (classObject) {
                    if (classObject._id == classSub._id) {
                        var sub_data;
                        angular.forEach($scope.SubjectListing, function (subjects) {
                            if (subjects.name == classSub.subject) {
                                sub_data = subjects._id;
                            }
                        })
                        $scope.newTeacher.classes_subject.push({
                            class: classObject.name,
                            class_id: classObject._id,
                            subject: classSub.subject,
                            subject_id: sub_data
                        });
                    }
                });
            }
        });
        var isDuplicate = anyDuplicateEntries();
        if (isDuplicate == false) {
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/teacher/', $scope.newTeacher);
            requestHandle.then(function (result) {
                if (result.success) {

                    getTeacherList();
                    // $scope.teachersList.push(result.data);
                    // beautifyTeachersViewList();
                    $scope.showModal = false;
                    $rootScope.mypageloading = false;
                    reset();
                }
                else {
                    FlashService.Error(result.data.message);
                }
            });
        }
        else {
            $rootScope.mypageloading = false;
        }
    };

    $scope.deleteTeacher = function (teacher, $index) {
        var confirmit = true;
        confirmit = confirm('Are you sure you want to delete the teacher ?');
        if (confirmit) {
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/teacher/profile/' + teacher.teacher_id);
            requestHandle.then(function (result) {
                if (result.success) {
                    getTeacherList();
                    // var teacherIndex = -1;
                    // for(var i=0; i < $scope.teachersList.length; i++ ) {
                    //     if($scope.teachersList[i]._id == teacher._id) {
                    //         teacherIndex = i;
                    //     }
                    // }
                    // if(teacherIndex > -1) {
                    //     $scope.teachersList.splice(teacherIndex, 1);
                    // }
                    $rootScope.mypageloading = false;
                }
                else {
                    FlashService.Error(result.data.message);
                }
            });
        }

    };

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.newTeacher = {};
        $scope.showModal = false;
        reset();
    };

    $scope.updateTeacher = function () {
        $log.debug('updateTeacher called  ');
        $scope.newTeacher.class_teacher = [];
        $scope.newTeacher.classes_subject = [];
        $rootScope.mypageloading = true;
        angular.forEach($scope.selectedClassIds, function (selectedClass) {
            if (selectedClass._id) {
                angular.forEach($scope.classes, function (classObject) {
                    if (classObject._id == selectedClass._id) {
                        $scope.newTeacher.class_teacher.push({
                            class: classObject.name,
                            class_id: selectedClass._id
                        });
                    }
                });
            }
        });
        angular.forEach($scope.classSubList, function (classSub) {
            if (classSub._id && $scope.classHash[classSub._id]) {
                var sub_data = null;
                angular.forEach($scope.SubjectListing, function (subjects) {
                    if (subjects.name == classSub.subject) {
                        sub_data = subjects._id;
                    }
                });
                $scope.newTeacher.classes_subject.push({
                    class: $scope.classHash[classSub._id].name,
                    class_id: classSub._id,
                    subject: classSub.subject,
                    subject_id: sub_data
                });
            }
        });


        var isDuplicate = anyDuplicateWhileUpdate();
        var teacherToUpdate = {};

        angular.copy($scope.newTeacher, teacherToUpdate);
        if (isDuplicate == false) {
            if ($scope.disablePassword) {
                // delete teacherToUpdate.email;
                delete teacherToUpdate.password;
            }
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/teacher/profile/' + teacherToUpdate.teacher_id, teacherToUpdate);
            requestHandle.then(function (result) {
                if (result.success) {

                    getTeacherList();
                    // for(var i=0; i< $scope.teachersList.length; i++) {
                    //     if($scope.teachersList[i].teacher_id===$scope.editTeacherInfo.teacher_id){
                    //         $scope.teachersList[i] = result.data;

                    //     }
                    // }
                    // beautifyTeachersViewList();
                    $scope.showModal = false;
                    $rootScope.mypageloading = false;
                    teacherToUpdate = {};
                    reset();
                } else {
                    FlashService.Error(result.data.message);
                }
            });
        }
        else {
            $rootScope.mypageloading = false;
        }
    };

    function anyDuplicateEntries() {
        $log.debug('Inside check duplicate entries');
        for (var i = 0; i < $scope.teachersList.length; i++) {
            if ($scope.teachersList[i].contact == $scope.newTeacher.contact) {
                FlashService.Error('Teacher contact number should be unique.');
                return true;
            }
        }

        var csUnique = [];
        for (var k = 0; k < $scope.newTeacher.classes_subject.length; k++) {
            if (!csUnique[$scope.newTeacher.classes_subject[k].class + $scope.newTeacher.classes_subject[k].subject])
                csUnique[$scope.newTeacher.classes_subject[k].class + $scope.newTeacher.classes_subject[k].subject] = 1;
            else {
                FlashService.Error('Class subject combination should be unique');
                csUnique = [];
                return true;
            }
        }
        return false;
    };

    function anyDuplicateWhileUpdate() {
        $log.debug('Inside anyDuplicateWhileUpdate');
        for (var i = 0; i < $scope.teachersList.length; i++) {
            if (i != $scope.indexInEditing) {
                // if ($scope.teachersList[i].email == $scope.newTeacher.name) {
                //     FlashService.Error('Email should be unique.');
                //     return true;
                // } 
                // else if ($scope.teachersList[i].teacher_id == $scope.newTeacher.teacher_id) {
                //     FlashService.Error('Teacher Id should be unique.');
                //     return true;
                // }
                if ($scope.teachersList[i].contact == $scope.newTeacher.contact) {
                    FlashService.Error('Teacher contact number should be unique.');
                    return true;
                }
            }
        }
        var csUnique = [];
        for (var k = 0; k < $scope.newTeacher.classes_subject.length; k++) {
            if (!csUnique[$scope.newTeacher.classes_subject[k].class + $scope.newTeacher.classes_subject[k].subject])
                csUnique[$scope.newTeacher.classes_subject[k].class + $scope.newTeacher.classes_subject[k].subject] = 1;
            else {
                FlashService.Error('Class subject combination should be unique');
                csUnique = [];
                return true;
            }
        }
        return false;
    };

    // $scope.emailchanged = function() {
    //     if($scope.editing) {
    //         if($scope.teachersList[$scope.indexInEditing].email != $scope.newTeacher.email) {
    //             $scope.disablePassword = false;
    //         } else {
    //             $scope.disablePassword = true;
    //         }
    //     }
    // }

    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };

    $scope.export = function () {

        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "TeachersList.pdf");
        });

    }

    $scope.download = function(isSampleFile){
        var a = document.createElement("a");
        var json_pre = '';
        var file_name = ''
        if(isSampleFile){
            file_name = 'sample.csv'
            json_pre = 
            '[{"TEACHER NAME":"Ravi Sharma","CONTACT":"9999999999"}, {"TEACHER NAME":"Ravi Shah","CONTACT":"9999999991"}, {"TEACHER NAME":"Ravi Tripati","CONTACT":"9999999992"}]'
        }
        else{
            file_name = 'teacher_details.csv'
            json_pre = JSON.stringify(newTeacherPasswordDetail)
        }
        var csv = Papa.unparse(json_pre);
        if (window.navigator.msSaveOrOpenBlob) {
          var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
            type: "text/csv;charset=utf-8;"
          });
          navigator.msSaveBlob(blob, 'sample.csv');
        } else {
   
          a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
          a.target = '_blank';
          a.download = file_name;
          document.body.appendChild(a);
          a.click();
          newTeacherPasswordDetail = [];
        }
    }

    function sendTeacherPassword(teacherData){
        var payload = {
            number: teacherData['contact'],
            message: "Hello "+ teacherData['name'] + "! Your password for the Teacher's app by Zuwagon is " 
                + teacherData['password'] + " Download the app now https://bit.ly/2J3rPE4"
        }
        newTeacherPasswordDetail.push({
            'TEACHER NAME': teacherData['name'],
            'CONTACT': teacherData['contact'],
            'PASSWORD': teacherData['password']
        })
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/sendsms', payload);
        requestHandle.then(function (result) {
            if (result.success == true) {
                var index = $scope.newTeacherList.indexOf(teacherData);
                if (index > -1) {
                    $scope.newTeacherList.splice(index, 1);
                }
                if($scope.newTeacherList.length > 0){
                    addTeacher($scope.newTeacherList[0])
                }
                else{
                    $scope.newTeacherList = [];
                    duplicateTeacherList = [];
                    newTeacherDataObject = {};
                    tempNewTeacherList = [];
                    $scope.csvFileErrorReport = {
                        'total_rows': 0,
                        'total_success_rows': 0,
                        'total_error_rows': 0,
                        'total_no_of_new_teacher': 0,
                        'csv_file_read_field_list': '',
                        'csv_file_unread_field_list': '',
                        'error_summary': {}
                    }
                    errorSummaryObj = {}
                    csvData = [];
                    $scope.isDataValidationProcessComplete = false;
                    $rootScope.mypageloading = false;
                    angular.element('#cvsFileLogModal').modal('hide');
                    getTeacherList();
                    FlashService.Success('Teacher record succesfully added.');
                    console.log('teacher data suceesfully store')
                    $scope.download(false);
                }
            }
            else {
                FlashService.Error(result.data.message);
            }
        });
    }

    function addTeacher(teacherData){
        if(teacherData){
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/teacher/', teacherData);
            requestHandle.then(function (result) {
                if(result.success == true) {
                    sendTeacherPassword(teacherData);
                }
                else {
                    FlashService.Error(result.data.message);
                }
            });
        }
        else{
            $rootScope.mypageloading = false;
            angular.element('#cvsFileLogModal').modal('hide');
            FlashService.Error('something went wrong during teacher record adding.');
        }
    }

    var fileInput = document.getElementById("csv"),
        readFile = function (target) {
            var CSVFile = fileInput.files[0]
            fileInput.value = '';
            Papa.parse(CSVFile, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (results) {
                    data = results.data;
                    csvData = data;
                    csvFileReadFieldList = [];
                    csvFileUnReadFieldList = [];
                    csvFileFieldList = results['meta']['fields'];
                    $scope.newTeacherList = [];
                    duplicateTeacherList = [];
                    newTeacherDataObject = {};
                    tempNewTeacherList = [];
                    newTeacherPasswordDetail = [];
                    errorSummaryObj = {}
                    $scope.csvFileErrorReport = {
                        'total_rows': 0,
                        'total_success_rows': 0,
                        'total_error_rows': 0,
                        'total_no_of_new_teacher': 0,
                        'csv_file_read_field_list': '',
                        'csv_file_unread_field_list': '',
                        'error_summary': {}
                    }
                    if(csvFileFieldList && csvData.length == 0){
                        var fieldList = ['TEACHER NAME', 'CONTACT'];
                        for(var j=0; j<csvFileFieldList.length; j++){
                            if(fieldList.includes(csvFileFieldList[j]) == true){
                                csvFileReadFieldList.push(csvFileFieldList[j])
                            }
                            else{
                                csvFileUnReadFieldList.push(csvFileFieldList[j])
                            }
                        }
                        $scope.csvFileErrorReport['csv_file_read_field_list'] = csvFileReadFieldList.toString()
                        $scope.csvFileErrorReport['csv_file_unread_field_list'] = csvFileUnReadFieldList.toString()
                        $scope.$apply(function() {});
                        angular.element('#cvsFileLogModal').modal('show');
                    }
                    if(csvData && csvData.length > 0){
                        $scope.isDataValidationProcessComplete = true;
                        $scope.csvFileErrorReport['total_rows'] = csvData.length
                        angular.element('#cvsFileLogModal').modal('show');
                        validateStudentData()
                    }
                }
            });
        };

    fileInput.addEventListener('change', readFile);


    function validateStudentData(){
        for (var i=0; i<csvData.length; i++) {
            var errorList = []
            if(!csvData[i]['TEACHER NAME']){
                errorList.push('Teacher Name is required')
                errorSummaryObj[i+1] = errorList
            }
            if(csvData[i]['TEACHER NAME'] && csvData[i]['TEACHER NAME'].toString().length > 30){
                errorList.push('Teacher Name cannot contain more than 30 characters!')
                errorSummaryObj[i+1] = errorList
            }
            if(!csvData[i]['CONTACT']){
                errorList.push('Contact no. is required')
                errorSummaryObj[i+1] = errorList
            }
            if(csvData[i]['CONTACT'] && csvData[i]['CONTACT'].toString().length != 10){
                errorList.push('Contact number should be 10 digit number.')
                errorSummaryObj[i+1] = errorList
            }
            var contact_no = csvData[i]['CONTACT']
            if(contact_no in newTeacherDataObject){
                    errorList.push('Duplicate contact no.' +  csvData[i]['CONTACT'] + ' ' + 'exists in your cvs file.')
                    errorSummaryObj[i+1] = errorList
            }
            if(csvData[i]['TEACHER NAME'] && csvData[i]['TEACHER NAME'].toString().length <= 30 &&
                csvData[i]['CONTACT'] && csvData[i]['CONTACT'].toString().length == 10){
                var contact_no = csvData[i]['CONTACT']
                if(!(contact_no in newTeacherDataObject)  || i == 0){
                    if($scope.teachersList && $scope.teachersList.length > 0){
                        for(var j=0; j<$scope.teachersList.length; j++){
                            var password = Math.floor(100000 + Math.random() * 900000);
                            if(data[i]['CONTACT'] != $scope.teachersList[j]['contact']){
                                var teacherData = {
                                    name: data[i]['TEACHER NAME'],
                                    contact: data[i]['CONTACT'],
                                    role: "",
                                    password: password.toString(),
                                    class_teacher: [],
                                    classes_subject: [],
                                };
                                newTeacherDataObject[contact_no] = teacherData;
                            }
                            else{
                                duplicateTeacherList.push({
                                    name: data[i]['TEACHER NAME'],
                                    contact: data[i]['CONTACT'],
                                    role: "",
                                    password: password.toString(),
                                    class_teacher: [],
                                    classes_subject: [],
                                });
                                if(data[i]['CONTACT'] == $scope.teachersList[j]['contact']){
                                    errorList.push('Teacher Already Exists with Contact No. ' + data[i]['CONTACT'])
                                }
                                $scope.csvFileErrorReport['total_error_rows'] = 
                                    $scope.csvFileErrorReport['total_error_rows'] + 1
                                errorSummaryObj[i+1] = errorList
                            }
                        }
                    }
                    else{
                        var password = Math.floor(100000 + Math.random() * 900000);
                        var teacherData = {
                            name: data[i]['TEACHER NAME'],
                            contact: data[i]['CONTACT'],
                            role: "",
                            password: password.toString(),
                            class_teacher: [],
                            classes_subject: [],
                        };
                        newTeacherDataObject[contact_no] = teacherData;
                    }
                }
                else{
                    $scope.csvFileErrorReport['total_error_rows'] = $scope.csvFileErrorReport['total_error_rows'] + 1
                }
            }
            else{
                $scope.csvFileErrorReport['total_error_rows'] = $scope.csvFileErrorReport['total_error_rows'] + 1
            }
        }
        var fieldList = ['TEACHER NAME', 'CONTACT'];
        for(var j=0; j<csvFileFieldList.length; j++){
            if(fieldList.includes(csvFileFieldList[j]) == true){
                csvFileReadFieldList.push(csvFileFieldList[j])
            }
            else{
                csvFileUnReadFieldList.push(csvFileFieldList[j])
            }
        }
        $scope.csvFileErrorReport['csv_file_read_field_list'] = csvFileReadFieldList.toString()
        $scope.csvFileErrorReport['csv_file_unread_field_list'] = csvFileUnReadFieldList.toString()
        angular.forEach(newTeacherDataObject, function(value, key) {
            tempNewTeacherList.push(value)
        });
        
        function comparer(otherArray){
            return function(current){
              return otherArray.filter(function(other){
                return other.contact == current.contact
              }).length == 0;
            }
        }
          
        var onlyInA = tempNewTeacherList.filter(comparer(duplicateTeacherList));
        var onlyInB = duplicateTeacherList.filter(comparer(tempNewTeacherList));
        $scope.newTeacherList = onlyInA.concat(onlyInB);
        console.log("Duplicate Teacher List");
        console.log(duplicateTeacherList);
        console.log("New Teacher List")
        console.log($scope.newTeacherList);
        $scope.csvFileErrorReport['total_success_rows'] = $scope.newTeacherList.length
        $scope.csvFileErrorReport['total_no_of_new_teacher'] = $scope.newTeacherList.length
        $scope.isDataValidationProcessComplete = false;
        $scope.$apply(function() {
            $scope.csvFileErrorReport['error_summary'] = errorSummaryObj
        });
    };

    $scope.addTeacherDataOnServer =  function(){
        $scope.isDataValidationProcessComplete = true;
        $rootScope.mypageloading = true;
        if($scope.newTeacherList.length > 0){
            addTeacher($scope.newTeacherList[0])
        }
    };

    // var teachPass = [];
    // for(var k=0; k<teachPass.length; k++) {
    //     var url = "https://api.msg91.com/api/sendhttp.php?";
    //     // url += "mobiles=7845238570";
    //     url += "mobiles=" + teachPass[k]['Mobile No.']
    //     url += "&authkey=282164Adf2h9q9g5d0d3ee1";
    //     url += "&route=4";
    //     url += "&sender=ZUWAGO";



    //     url += "&message=" + "Hello " + teachPass[k]['First Name'] + " " + teachPass[k]['Last Name']+ ",\n Your password for the teacher's app is " + teachPass[k]['password'] +".\n Download the app now  https://bit.ly/30MGT3s " +"\n  For queries: 8657420001"+"\nRegards -"+"\n GFPS";

    //     var settings = {
    //         "async": true,
    //         "crossDomain": true,
    //         "url": url,
    //         "method": "GET",
    //         "headers": {}
    //     }



    //     $.ajax(settings).done(function (response) {
    //       console.log(response);
    //     });

    // }

    // var url = "https://api.msg91.com/api/sendhttp.php?";
    // url += "mobiles=7845238570";
    // // url += "mobiles=" + studentObject.emer_1;
    // url += "&authkey=282164Adf2h9q9g5d0d3ee1";
    // url += "&route=4";
    // url += "&sender=SAKETZ";
    // url += "&message=" + "Hello this is a test message with otp";



    // url += "&message=" + "Hello " + studentObject.name + 
    // ",\n Your password for the teacher's app is " + studentObject.otp +
    //  "\n Download the app now https://bit.ly/30MGT3s" +
    //  "\nFor queries: 8657420001"+
    //  "\nRegards"+
    //  "\nGFPS"
    //  ;

    // var settings = {
    //     "async": true,
    //     "crossDomain": true,
    //     "url": url,
    //     "method": "GET",
    //     "headers": {}
    // }



    // $.ajax(settings).done(function (response) {
    //   console.log(response);
    // });


});