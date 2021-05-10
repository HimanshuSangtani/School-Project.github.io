app.controller('classController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $http) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $scope.showModal = false;
    $scope.showAddCourseForm = false;
    $scope.testModal = false;
    $scope.showcourseModal = false;
    $scope.selectedCourse ;
    $scope.newClassList = [];
    $scope.studentList = [];
    $scope.showSearchedStudentList = [];
    $scope.showGloble = false;
    var allStudentDetails_hash = {};
    $scope.showSearchedStudentModal = false;
    $scope.existingCourseList = [];
    $scope.courseEdit = false;

    $scope.globelSearchstudent = {
        "name": ""
    }

    $scope.allClassListArray = [];
    var classGradeObj = {}
    $scope.existingClassList = [];
    $scope.isDataValidationProcessComplete = false;
    $scope.newStudentList = [];
    var duplicateStudentList = [];
    var newStudentDataObject = {};
    var newClassDataObject = {}
    var tempNewStudentList = [];
    var csvFileFieldList = [];
    var csvFileReadFieldList = [];
    var csvFileUnReadFieldList = [];
    $scope.isNewStudentList = false;
    $scope.csvFileErrorReport = {
        'total_rows': 0,
        'total_success_rows': 0,
        'total_error_rows': 0,
        'error_summary': {}
    }
    var errorSummaryObj = {}
    $scope.courseForm = {
        name: '',
        type: 'COURSE',
        recommended_classes: [],
        trail_period_duration: '',
        image: '',
        price: [
            {
                value: '',
                duration: ''
            }
        ]
    }
    $scope.courseImage = {
        file: null,
        fileName: '',
        basePath: 'course',
        fileKey: 'courseImage',
        imagePreview: ''
    }
    $scope.recommendedClasses = [];
    $rootScope.mypageloading = true;
    $scope.lastAccessStudentCountObj = {
        'total_no_of_student_app_using': 0,
        'total_no_of_student_app_not_using': 0,
        'total_student': 0
    };

    var csvData = [];

    $scope.courseImageChange = function(file) {
        $scope.courseImage.file = file;
        $scope.courseImage.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.courseImage.imagePreview = e.target.result;
            $scope.courseForm['image'] = '';
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    $scope.deleteCourseImage = function(type) {
        if(type == 'local'){
            $scope.courseImage.file = null;
            $scope.courseImage.fileName = '';
            $scope.courseImage.imagePreview = '';
        }
        else{
            $scope.courseForm['image'] = '';
        }
    }

    $log.debug('HandShakeService.existingClassList call');
    function getAllClass() {
        $rootScope.mypageloading = true;
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.allClassListArray = result;
            $rootScope.mypageloading = false;
            $scope.existingClassList = result;
            // serverFormatToList(result);
            $scope.getAllStudent();
        });
    };

    getAllClass();
    
    $log.debug('HandShakeService.existingClassList passed');

    $scope.selectStudentSearch = function (data) {
        //console.log(data.name);
        $scope.globelSearchstudent = {
            "name": data.name
        }
        //console.log(data);
        //console.log($scope.existingClassList);

        for (var i = 0; i < $scope.existingClassList.length; i++) {

            if ($scope.existingClassList[i]._id == data.grade_id) {
                $scope.showSearchedStudentList.class = $scope.existingClassList[i].name ? '' + $scope.existingClassList[i].name + '-' + $scope.existingClassList[i].section + '' : 'NA';
            }

        }

        $scope.showSearchedStudentList.studentName = data.name ? data.name : 'NA';
        $scope.showSearchedStudentList.fatherName = data.fathername ? data.fathername : 'NA';
        $scope.showSearchedStudentList.motherName = data.mothername ? data.mothername : 'NA';
        $scope.showSearchedStudentList.rollno = data.rollno ? data.rollno : 'NA';
        $scope.showSearchedStudentList.city = data.city ? data.city : 'NA';
        $scope.showSearchedStudentList.address = data.address ? data.address : 'NA';
        $scope.showSearchedStudentList.gender = data.gender ? data.gender : 'NA';
        $scope.showSearchedStudentList.bloodGroup = data.blood ? data.blood : 'NA';
        $scope.showSearchedStudentList.emer_1 = data.emer_1 ? data.emer_1 : 'NA';
        $scope.showSearchedStudentList.alternateEmer_1 = data.contact2 ? data.contact2 : 'NA';
        $scope.showSearchedStudentList.rfid = data.rfid ? data.rfid : 'NA';
        $scope.showSearchedStudentList.doj = data.doj ? data.doj : 'NA';
        $scope.showSearchedStudentList.dob = data.dob ? data.dob : 'NA';
        $scope.showSearchedStudentList.rteorfees = data.rteorfees ? data.rteorfees : 'NA';

        //$scope.FeeDetails.StudentSelect = data._id;
        $scope.showSearchedStudentModal = true;
        $scope.showGloble = false;
        //$scope.selectedStudent(data._id);

    }

    $scope.ClickSearch = function () {

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

        if ($scope.globelSearchstudent.name == '') {
            $scope.showGloble = false;
            $scope.showSearchedStudentModal = false;
            return false;
        }
        $scope.showGloble = true;
    }

    $scope.getAllStudent = function () {

        $rootScope.mypageloading = true;

        $log.debug('HandShakeService.allStudentList call');
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService existingStudentList received');
            $scope.studentList = result;
            //console.log(result);

            angular.forEach(result, function (obj) {

                allStudentDetails_hash[obj.rollno] = obj;
            });
            console.log('allStudentDetails_hash = ' + allStudentDetails_hash)

            if($scope.existingClassList && $scope.existingClassList.length > 0 &&
                 $scope.studentList && $scope.studentList.length > 0){
                for(var i=0; i<$scope.existingClassList.length; i++){
                    $scope.existingClassList[i]['total_last_access_students'] = 0
                    $scope.existingClassList[i]['total_last_access_remain_students'] = 0
                    for(var j=0; j<$scope.studentList.length; j++){
                        if($scope.existingClassList[i]['_id'] == $scope.studentList[j]['grade_id'] && $scope.studentList[j].is_deleted == 0){
                            if($scope.existingClassList[i].count && $scope.existingClassList[i].count != 0) {
                                $scope.existingClassList[i].count++;
                            } else {
                                $scope.existingClassList[i].count = 1
                            }
                            if(!$scope.studentList[j]['last_access_at'] || $scope.studentList[j]['last_access_at'] == '-'){
                                $scope.existingClassList[i]['total_last_access_remain_students'] = $scope.existingClassList[i]['total_last_access_remain_students'] + 1;
                                $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] = $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] + 1
                            }
                            else{
                                $scope.existingClassList[i]['total_last_access_students'] = $scope.existingClassList[i]['total_last_access_students'] + 1;
                                $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] = $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] + 1
                            }
                        }
                    }
                    $scope.lastAccessStudentCountObj['total_student'] = $scope.studentList.length
                }
            }

            $rootScope.mypageloading = false;

        });
        $log.debug('HandShakeService.existingStudentList passed');

    }
    

    $scope.getRecommendedClasses = function() {
        $rootScope.mypageloading = true;
        HttpService.HttpGetData($rootScope.serverURL + '/register/get-boards')
        .then(function (result) {
            if(result.success && result?result.data?result.data.boards?result.data.boards[0]?result.data.boards[0].classes:false:false:false:false) {
                $scope.recommendedClasses = result.data.boards[0].classes;
            }
            $rootScope.mypageloading = false;
        });
    }
    $scope.getRecommendedClasses();

    $scope.addNewClass = function () {
        $log.debug('add class callled');

        $scope.courseForm = {
            name: '',
            type: 'COURSE',
            recommended_classes: [],
            trail_period_duration: '',
            image:'',
            price: [
                {
                    value: '',
                    duration: ''
                }
            ]
        }
        $scope.courseImage = {
            file: null,
            fileName: '',
            basePath: 'course',
            fileKey: 'courseImage',
            imagePreview: ''
        }
        FlashService.Error('');
        $rootScope.mypageloading = false;
        $scope.showModal = true;
        $scope.courseEdit = false;
        $scope.newClassList.length = 0;
        $scope.newClassList = [];
        $scope.editing = false;
        $scope.showAddCourseForm = false;
        var classInfo = {
            name: '',
            section: '',
            count: 0
        };
        $scope.newClassList.push(classInfo);
        FlashService.Error('');
    };

    $scope.typeCourse = function (course){
        $scope.selectedCourse = course;
        $scope.showcourseModal = true;
        console.log("course: " ,course)
    }

    $scope.addClass = function () {
        $log.debug('addClass called');
        var classInfo = {
            name: '',
            section: '',
            count: 0
        };
        $scope.editing = false;
        $scope.newClassList.push(classInfo);
    };

    $scope.deleteNewClass = function ($index) {
        $log.debug('deleteNewStudent new called');
        if ($scope.newClassList.length != 1) {
            $scope.newClassList.splice($index, 1);
        }
    }


    $scope.saveClasses = function () {
        //        $location.path('/login');
        //        return;
        $rootScope.mypageloading = true;
        var classListServer = listToServerFormat();
        console.log(classListServer)

        var duplicateCheck = checkDuplicateEntries();
        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);
        $log.debug('classListServer ' + classListServer);

        if (duplicateCheck == true) {
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/grades', classListServer);
            requestHandle.then(function (result) {
                if (result.success) {
                    $scope.showModal = false;
                    $scope.newClassList.length = 0;
                    $scope.newClassList = [];
                    getAllClass();
                    return;
                    // $scope.existingClassList = $scope.existingClassList.concat(result.data);
                    // serverFormatToList(result.data);
                    $log.debug('$scope.existingClassList ' + $scope.existingClassList);
                    $log.debug('scope.existingClassList = ' + $scope.existingClassList);
                    

                    angular.forEach(result.data, function (gradeItem) {
                        gradeItem.count = 0;
                    });

                    // $indexedDB.openStore('class', function (classStore) {
                    //     $log.debug('opened classStore');
                    //     classStore.upsert(result.data).then(function (e) {
                    //         $log.debug('upserted successfully in classStore');
                    //         // HandShakeService.stuwarningcheck();
                    //     },
                    //         function (error) {
                    //             $log.debug('Error in upserting in classStore = ' + error);
                    //         });
                    // });
                    if($scope.newStudentList.length > 0 && $scope.isNewStudentList  == true){
                        for(var i=0;i<$scope.existingClassList.length; i++){
                            var name = $scope.existingClassList[i]['name'] + '-' + $scope.existingClassList[i]['section']
                                classGradeObj[name] = $scope.existingClassList[i]['_id']
                        }
                        addStudent($scope.newStudentList[0]); 
                    }
                    else{
                        $rootScope.mypageloading = false;
                    }
                }
            });
        }
        else {
            $rootScope.mypageloading = false;
            FlashService.Error('Class Name should be unique.');
        }

    };

    $scope.editClass = function (classObj, $index) {
        $log.debug('edit1 Class called');
        FlashService.Error('');
        $scope.testModal = true;
        $scope.editing = true;
        $scope.courseEdit = false;
        $scope.newClassList.length = 0;
        $scope.newClassList = [];
        if(classObj['type'] == 'COURSE'){
            $scope.courseForm = {
                _id: classObj['_id'],
                name: classObj['name'],
                type: classObj['type'],
                recommended_classes: classObj['recommended_classes'],
                trail_period_duration: parseInt(classObj['trail_period_duration']),
                price: classObj['price'],
                image: classObj['image']?classObj['image']:"",
                annouchment_list: classObj['annouchment_list'],
                count: classObj['count'],
                customer_id: classObj['customer_id'],
            }
            console.log($scope.courseForm)

            var classsIndex = -1;
            for (var i = 0; i < $scope.existingClassList.length; i++) {
                if ($scope.existingClassList[i]._id == $scope.courseForm['_id']) {
                    classsIndex = i;
                }
            }
            $scope.indexInEditing = classsIndex;
            $scope.editing = false;
            $scope.courseEdit = true;
            $scope.showAddCourseForm = true;
        }
        else{

            var res = classObj.name.split("-");
            classObj.name = res[0];
            classObj.section = res[1];
            var classInfo = {
                name: '',
                section: '',
                _id: ''
            };
            
            
    
            var classsIndex = -1;
            for (var i = 0; i < $scope.existingClassList.length; i++) {
                if ($scope.existingClassList[i]._id == classObj._id) {
                    classsIndex = i;
                }
            }
            $scope.indexInEditing = classsIndex;
            angular.copy(classObj, classInfo);
            $scope.newClassList.push(classInfo);
        }
        $scope.showModal = true;
        FlashService.Error('');
    };

    $scope.deleteClass = function (classInfo, $index) {
        $log.debug('deleteClass called');
        var confirmit = true;
        // if (classInfo.count > 0) {
            confirmit = confirm('Students associated with class ' + classInfo.name + ' will be deleted permanently.');
        // }
        if (confirmit) {
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/grades/' + classInfo._id);
            requestHandle.then(function (result) {
                $rootScope.mypageloading = false;
                if (result.success == true) {

                    getAllClass();
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


    }

    $scope.viewSubjects = function (course) {
        $log.debug('view subjects called');
        console.log(course._id);
        if(course && course._id) {
            $location.path('/course-subject/' + course._id);
        } else {
            $log.error('There was an error to fetch id of class.');
        }
    };

    $scope.cancel = function () {
        $log.debug('cancel called');
        $scope.newClassList.length = 0;
        $scope.newClassList = [];
        $scope.showModal = false;
    };


    $scope.updateClass = function () {
        $log.debug('update Class called  ');

        var duplicateCheck = checkDuplicateEntriesWhileUpdate();
        $log.debug('crossed checkDuplicateEntries duplicateCheck = ' + duplicateCheck);

        if (duplicateCheck == 1) {
            var classListServer = listToServerFormat();
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/grades/' + classListServer[0]._id, classListServer[0]);
            requestHandle.then(function (result) {
                if (result.success == true) {

                    $scope.showModal = false;
                    $scope.editing = false;
                    getAllClass();
                    // $indexedDB.openStore('class', function (classStore) {
                    //     $log.debug('opened classStore');
                    //     classStore.delete($scope.existingClassList[$scope.indexInEditing].name + '-' + $scope.existingClassList[$scope.indexInEditing].section).then(function (e) {
                    //         $log.debug('upserted successfully in classStore');
                    //         classListServer[0].count = $scope.existingClassList[$scope.indexInEditing].count;
                    //         classStore.upsert(classListServer[0]).then(function (e) {
                    //             $log.debug('upserted successfully in classStore');
                    //             $scope.existingClassList[$scope.indexInEditing] = $scope.newClassList[0];
                    //         },
                    //             function (error) {
                    //                 $log.debug('Error in upserting in classStore = ' + error);
                    //             });
                    //     },
                    //         function (error) {
                    //             $log.debug('Error in upserting in classStore = ' + error);
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
        else if (duplicateCheck == -1) {
            FlashService.Error('Class Name should be unique.');
        }
        else {
            $scope.showModal = false;
            $scope.editing = false;
        }

    };



    function checkDuplicateEntries() {
        $log.debug('Inside check duplicate entries');

        for (var iterNew = 0; iterNew < $scope.newClassList.length; iterNew++) {
            $log.debug($scope.newClassList[iterNew].name);
            $log.debug($scope.newClassList[iterNew].section);
            for (var iterInNew = iterNew + 1; iterInNew < $scope.newClassList.length; iterInNew++) {
                if ($scope.newClassList[iterInNew].name == $scope.newClassList[iterNew].name &&
                    $scope.newClassList[iterInNew].section == $scope.newClassList[iterNew].section) {
                    return false;
                }
            }

            for (var iterExist = 0; iterExist < $scope.existingClassList.length; iterExist++) {
                $log.debug($scope.existingClassList[iterExist].name);
                $log.debug($scope.existingClassList[iterExist].section);
                if ($scope.existingClassList[iterExist].name == $scope.newClassList[iterNew].name &&
                    $scope.existingClassList[iterExist].section == $scope.newClassList[iterNew].section) {
                    return false;
                }
            }


        }
        return true;
    }

    function checkDuplicateEntriesWhileUpdate() {
        $log.debug('Inside checkDuplicateEntriesWhileUpdate');



        for (var iterExist = 0; iterExist < $scope.existingClassList.length; iterExist++) {
            $log.debug($scope.existingClassList[iterExist].name);
            $log.debug($scope.existingClassList[iterExist].section);
            $log.debug($scope.existingClassList[iterExist]._id + ' ' + $scope.newClassList[0]._id);
            if ($scope.existingClassList[iterExist].name == $scope.newClassList[0].name &&
                $scope.existingClassList[iterExist].section == $scope.newClassList[0].section) {
                if ($scope.existingClassList[iterExist]._id != $scope.newClassList[0]._id) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        }

        return 1;
    }


    function listToServerFormat() {
        var classListServer = [];


        angular.forEach($scope.newClassList, function (classInfo) {
            var classInfoServer = {
                name: '',
                _id: ''
            };
            classInfoServer.name = classInfo.name.split("-")[0];
            classInfoServer.name += '-';
            classInfoServer.name += classInfo.section;
            // classInfoServer.class_students_count = classInfo.class_students_count;
            classInfoServer._id = classInfo._id;
            classListServer.push(classInfoServer);
        });
        return classListServer;
    }
    ;

    function serverFormatToList(gradeListServer) {
        $log.debug('serverFormatToList');
        angular.forEach(gradeListServer, function (classInfoServer) {
            if(classInfoServer['type'] == 'COURSE'){
                var courseObj = {
                    _id: classInfoServer['_id'],
                    name: classInfoServer['name'],
                    type: classInfoServer['type'],
                    recommended_classes: classInfoServer['recommended_classes'],
                    trail_period_duration: parseInt(classInfoServer['trail_period_duration']),
                    price: classInfoServer['price'],
                    image: classInfoServer['image']?classInfoServer['image']:"",
                    annouchment_list: classInfoServer['annouchment_list'],
                    count: classInfoServer['count'],
                    customer_id: classInfoServer['customer_id'],
                }
                if ($scope.existingCourseList.indexOf(courseObj) == -1) {
                    $scope.existingCourseList.push(courseObj);
                }
                if ($scope.existingClassList.indexOf(courseObj) == -1) {
                    $scope.existingClassList.push(courseObj);
                }
            }
            else{
                var res = classInfoServer.name.split("-");
                var classInfo = {
                    name: '',
                    section: '',
                    count: 0,
                    _id: ''
                };
                classInfo.name = res[0];
                classInfo.section = res[1];
                classInfo.count = classInfoServer.count;
                classInfo._id = classInfoServer._id;
                $log.debug(res[0] + ' ' + res[1]);
                if (classInfoServer.count == undefined) {
                    classInfo.count = 0;
                }

                if ($scope.existingClassList.indexOf(classInfo) == -1) {
                    $scope.existingClassList.push(classInfo);
                }
            }
            
        });
        if($scope.studentList && $scope.studentList.length > 0){
            for(var i=0; i<$scope.existingClassList.length; i++){
                if(!('type' in $scope.existingClassList[i])){
                    $scope.existingClassList[i]['total_last_access_students'] = 0
                    $scope.existingClassList[i]['total_last_access_remain_students'] = 0
                    for(var j=0; j<$scope.studentList.length; j++){
                        if($scope.existingClassList[i]['_id'] == $scope.studentList[j]['grade_id']){
                            if(!$scope.studentList[j]['last_access_at'] || $scope.studentList[j]['last_access_at'] == '-'){
                                $scope.existingClassList[i]['total_last_access_remain_students'] = 
                                    $scope.existingClassList[i]['total_last_access_remain_students'] + 1;
                                $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] = 
                                    $scope.lastAccessStudentCountObj['total_no_of_student_app_not_using'] + 1
                            }
                            else{
                                $scope.existingClassList[i]['total_last_access_students'] = 
                                    $scope.existingClassList[i]['total_last_access_students'] + 1;
                                $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] = 
                                    $scope.lastAccessStudentCountObj['total_no_of_student_app_using'] + 1
                            }
                        }
                    }
                    $scope.lastAccessStudentCountObj['total_student'] = $scope.studentList.length
                }
               
            }
        }
        
        $log.debug('End serverFormatToList');
    }


    $scope.openClassDetails = function (classInfo) {
        if(classInfo.type == 'COURSE'){
            $sessionStorage.className =  classInfo.name
            $location.path('/course/:' + classInfo._id + '/students');

        }
        else{
            $sessionStorage.className = classInfo.name + '-' + classInfo.section;
            $location.path('/students/:' + classInfo._id);
        }
    }

    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "ClassesList.pdf");
        });

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
                    var hashMap = {};
                    $scope.isNewStudentList = false;
                    $scope.newStudentList = [];
                    duplicateStudentList = [];
                    newStudentDataObject = {};
                    tempNewClassList = []
                    newClassDataObject = {};
                    tempNewStudentList = [];
                    errorSummaryObj = {}
                    $scope.newClassList = [];
                    $scope.csvFileErrorReport = {
                        'total_rows': 0,
                        'total_success_rows': 0,
                        'total_error_rows': 0,
                        'total_no_of_new_class': 0,
                        'total_no_of_new_student': 0,
                        'csv_file_read_field_list': '',
                        'csv_file_unread_field_list': '',
                        'error_summary': {}
                    }
                    if(csvFileFieldList && csvData.length == 0){
                        var fieldList = ['SECTION', 'ROLLNO', 'STUDENT NAME', 'CLASS', 'CONTACT', 
                            'GENDER', 'FATHER NAME', 'MOTHER NAME', 'DOB', 'ADDRESS', 'CITY', 'CATEGORY', 'CONTACT2'];
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
                        classGradeObj =  {}
                        $scope.isDataValidationProcessComplete = true;
                        $scope.isNewStudentList = true;
                        $scope.csvFileErrorReport['total_rows'] = csvData.length
                        angular.element('#cvsFileLogModal').modal('show');
                        for(var i=0;i<$scope.existingClassList.length; i++){
                            var name = $scope.existingClassList[i]['name'] + '-' + $scope.existingClassList[i]['section']
                            classGradeObj[name] = $scope.existingClassList[i]['_id']
                        }
                        validateStudentData()
                    }
                    // uploadStudent(0)
                    // for (var i = 0; i < data.length; i++) {
                    //     if (data[i].CLASS) {
                    //         // var obj = $scope.newClassList.find((o => o.name === data[i].Class && (!data[i]['SEC.'] || o.section === data[i]['SEC.'].toUpperCase())));
                    //         var obj = $scope.newClassList.find(function (o) {
                    //             return o.name === data[i].CLASS.toString().trim().toUpperCase() && (!data[i]['SECTION'] || o.section === data[i]['SECTION'].trim().toUpperCase())
                    //         });
                    //         if (!obj) {
                    //             $scope.newClassList.push({ name: data[i].CLASS.toString().trim().toUpperCase(), section: data[i]['SECTION'].trim().toUpperCase() ? data[i]['SECTION'].trim().toUpperCase() : 'A' })
                    //         }
                    //     }
                    // }
                    // $scope.saveClasses();
                    

                }
            });
        };

    fileInput.addEventListener('change', readFile);


    function uploadStudent(j) {
        if($scope.existingClassList.length == j) {
            console.log('Finished')
            alert('finished')
            return;
        }
        $scope.newStudentList = [];
        for (var i = 0; i < csvData.length; i++) {
            // var classObj = $scope.existingClassList[i].split("-");
            // var ack = data[i]['ADMISSION NO.'].split('/').reverse()
            // data[i]['ROLLNO'] = ack[0]
            console.log($scope.existingClassList)
            console.log('j = '+ j)
            if (data[i]['ROLLNO'] && data[i]['CONTACT'] && data[i]['CLASS'] && data[i]['SECTION'] && 
                data[i]['CLASS'].toString().trim().toUpperCase()+ '-'+data[i]['SECTION'].toString().trim().toUpperCase() == $scope.existingClassList[j].name+'-'+$scope.existingClassList[j].section) {
                var gender;
                gender = 'GIRL';
                if (data[i]['GENDER'] == 'Male') {
                    gender = 'BOY';
                } else if (data[i]['GENDER'] == 'F') {
                    gender = 'GIRL';
                } else {
                    gender = 'OTHER';
                }
                if (!data[i]['CONTACT']) {
                    console.log('number missing for ' + data[i]['STUDENT NAME']);
                    // alert('number missing for ' + data[i]['STUDENT NAME'])
                    data[i]['CONTACT'] = 1111111111;
                }
                $scope.newStudentList.push({
                    name: data[i]['STUDENT NAME'],
                    fathername: data[i]['FATHER NAME']?data[i]['FATHER NAME'].toUpperCase(): "",
                    mothername: data[i]['MOTHER NAME']?data[i]['MOTHER NAME'].toUpperCase():"",
                    address: data[i]['ADDRESS']?data[i]['ADDRESS']:"",
                    city: data[i]['CITY']?data[i]['CITY'].toUpperCase():"",
                    rollno: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                    rfid: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                    gender: gender,
                    dob: data[i]['DOB']?data[i]['DOB']:"",
                    emer_1: data[i]['CONTACT'],
                    cat: data[i]['CATEGORY']
                });


            } else {
                console.log('name or sch no doesnt exist ' + i)
            }
        }
        console.log($scope.newStudentList);
        console.log($scope.existingClassList[j]._id)
        // if($scope.newStudentList.length) {
        //     var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/student/' + 
        //     $scope.existingClassList[j]._id, $scope.newStudentList);
        //     requestHandle.then(function (result) {
        //         if (result.success == true) {


        //             $scope.newStudentList.length = 0;
        //             $scope.newStudentList = [];
        //             $indexedDB.openStore('student', function (studentStore) {
        //                 $log.debug('opened studentStore');
        //                 studentStore.upsert(result.data).then(function (e) {
        //                     $log.debug('upserted successfully in existingStudentList');
        //                     // $scope.existingStudentList = $scope.existingStudentList.concat(result.data);
        //                     // updateStuCountInClass($scope.existingStudentList.length);
        //                     uploadStudent(j+1);
        //                 },
        //                     function (error) {
        //                         $log.debug('Error in upserting in existingStudentList = ' + error);
        //                     });
        //             });
        //         }
        //         else {
        //             if (result.data == null || result.data == '' || result.data == undefined) {
        //                 FlashService.Error('Oops, something went wrong! Please login again.');
        //             }
        //             else {
        //                 FlashService.Error(result.data);
        //             }
        //         }
        //     });
        // } else {
        //     uploadStudent(j+1);
        // }
        
    }

    function addStudent(studentData){
        $scope.isNewStudentList  == false;
        var clsssSectionName = studentData[0]['class'] + '-' + studentData[0]['section'];
        var classID = classGradeObj[clsssSectionName]
        if(classID && studentData){
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/student/' + 
                classID, studentData);
            requestHandle.then(function (result) {
                if (result.success == true) {
                    $indexedDB.openStore('student', function (studentStore) {
                        $log.debug('opened studentStore');
                        studentStore.upsert(result.data).then(function (e) {
                            var index = $scope.newStudentList.indexOf(studentData);
                            if (index > -1) {
                                $scope.newStudentList.splice(index, 1);
                            }
                            if($scope.newStudentList.length > 0){
                                addStudent($scope.newStudentList[0])
                            }
                            else{
                                $scope.newStudentList = [];
                                $scope.isNewStudentList  == false;
                                classGradeObj = {};
                                duplicateStudentList = [];
                                newStudentDataObject = {};
                                newClassDataObject = {};
                                tempNewStudentList = [];
                                tempNewClassList = [];
                                $scope.csvFileErrorReport = {
                                    'total_rows': 0,
                                    'total_success_rows': 0,
                                    'total_error_rows': 0,
                                    'total_no_of_new_class': 0,
                                    'total_no_of_new_student': 0,
                                    'csv_file_read_field_list': '',
                                    'csv_file_unread_field_list': '',
                                    'error_summary': {}
                                }
                                errorSummaryObj = {}
                                csvData = [];
                                $scope.isDataValidationProcessComplete = false;
                                $rootScope.mypageloading = false;
                                angular.element('#cvsFileLogModal').modal('hide');
                                $scope.getAllStudent();
                                FlashService.Success('Student record succesfully added.');
                                console.log('student data suceesfully store')
                            }
                        },
                        function (error) {
                            $log.debug('Error in upserting in existingStudentList = ' + error);
                        });
                    });
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
        else{
            $rootScope.mypageloading = false;
            angular.element('#cvsFileLogModal').modal('hide');
            FlashService.Error('something went wrong during students adding.');
        }
    }

    $scope.download = function(){
        var a = document.createElement("a");
        var json_pre = 
        '[{"ROLLNO":"1001","CLASS":"1","SECTION":"A","STUDENT NAME":"Ravi","FATHER NAME":"Yogesh", "MOTHER NAME":"Anjali", "CATEGORY":"General", "GENDER":"Male", "DOB":"05/12/2014", "CONTACT":"9999999999", "ADDRESS":"xyz street ", "CITY":"Mumbai","CONTACT2":"9999999999"}, {"ROLLNO":"1002","CLASS":"1","SECTION":"A","STUDENT NAME":"Priyanka","FATHER NAME":"Yogesh", "MOTHER NAME":"Anjali", "CATEGORY":"ST", "GENDER":"Female", "DOB":"05/12/2014", "CONTACT":"9999999999", "ADDRESS":"xyz street ", "CITY":"Mumbai", "CONTACT2":"9999999999"}]'
        
        var csv = Papa.unparse(json_pre);
        if (window.navigator.msSaveOrOpenBlob) {
          var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
            type: "text/csv;charset=utf-8;"
          });
          navigator.msSaveBlob(blob, 'sample.csv');
        } else {
   
          a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
          a.target = '_blank';
          a.download = 'sample.csv';
          document.body.appendChild(a);
          a.click();
        }
    }
    
    function validateStudentData(){
        for (var i=0; i<csvData.length; i++) {
            var errorList = []
            if(!data[i]['SECTION']){
                data[i]['SECTION'] = 'A'
            }
            if(!csvData[i]['ROLLNO']){
                errorList.push('Roll no. is required')
                errorSummaryObj[i+1] = errorList
            }
            if(!csvData[i]['STUDENT NAME']){
                errorList.push('Student Name is required')
                errorSummaryObj[i+1] = errorList
            }
            if(!csvData[i]['CLASS']){
                errorList.push('Class name is required')
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
            if('CONTACT2' in csvData[i] && csvData[i]['CONTACT2'] && csvData[i]['CONTACT2'].toString().length != 10){
                errorList.push('Alternative Contact number should be 10 digit number.')
                errorSummaryObj[i+1] = errorList
            }
            // var currentUniquePair = roll_no.toString() + csvData[i]['CLASS'].toString().trim().toUpperCase()
            //     + csvData[i]['SECTION'].toString().trim().toUpperCase()
            var roll_no = csvData[i]['ROLLNO']
            if(roll_no in newStudentDataObject){
                    errorList.push('Duplicate roll no.' +  csvData[i]['ROLLNO'] + ' ' + 'exists in your cvs file.')
                    errorSummaryObj[i+1] = errorList
            }
            if(('CONTACT2' in csvData[i] && csvData[i]['CONTACT2'] && csvData[i]['CONTACT2'].toString().length == 10) || ('CONTACT2' in csvData[i] && csvData[i]['CONTACT2'] == null) || (csvData[i]['CONTACT2'] == undefined)){
                if(csvData[i]['ROLLNO'] && csvData[i]['STUDENT NAME'] && csvData[i]['CLASS'] && 
                csvData[i]['CONTACT'] && csvData[i]['CONTACT'].toString().length == 10){
                    var roll_no = csvData[i]['ROLLNO'];
                    var clsssSectionName = data[i]['CLASS'].toString().trim().toUpperCase() 
                        + '-'+data[i]['SECTION'].toString().trim().toUpperCase()
                    var classID = classGradeObj[clsssSectionName]
                    if(classID == undefined || classID == ''){
                        var studentClass = data[i]['CLASS'].toString().trim().toUpperCase();
                        var studentSection = data[i]['SECTION'].toString().trim().toUpperCase();
                        var classData = { 
                            'name': studentClass, 
                            'section': studentSection
                        }
                        newClassDataObject[clsssSectionName] = classData;
                    }
                    if(!(roll_no in newStudentDataObject)  || i == 0){
                        var currentClass = data[i]['CLASS'].toString().trim().toUpperCase();
                        var currentSection = data[i]['SECTION'].toString().trim().toUpperCase()
                        if($scope.studentList && $scope.studentList.length > 0){
                            for(var j=0; j<$scope.studentList.length; j++){
                                if(data[i]['ROLLNO'] != $scope.studentList[j]['rfid'].toString() || data[i]['ROLLNO'] != $scope.studentList[j]['rollno'].toString()){
                                    var gender;
                                    gender = 'GIRL';
                                    if (data[i]['GENDER'] == 'Male') {
                                        gender = 'BOY';
                                    } else if (data[i]['GENDER'] == 'Female') {
                                        gender = 'GIRL';
                                    } else {
                                        gender = 'OTHER';
                                    }
                                    
                                    var studentData = {
                                        rollno: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                        rfid: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                        class: currentClass,
                                        section: currentSection,
                                        name: data[i]['STUDENT NAME'],
                                        fathername: data[i]['FATHER NAME']?data[i]['FATHER NAME']: "",
                                        mothername: data[i]['MOTHER NAME']?data[i]['MOTHER NAME']:"",
                                        contact2: data[i]['CONTACT2']?data[i]['CONTACT2']:"",
                                        gender: gender,
                                        address: data[i]['ADDRESS']?data[i]['ADDRESS']:"",
                                        city: data[i]['CITY']?data[i]['CITY'].toUpperCase():"",
                                        dob: data[i]['DOB']?data[i]['DOB']:"",
                                        emer_1: data[i]['CONTACT']?data[i]['CONTACT']:"",
                                        cat: data[i]['CATEGORY']?data[i]['CATEGORY']:""
                                    };
                                    // var uniquePair = studentData['rollno'].toString() + 
                                    // studentData['class'] + studentData['section']
                                    newStudentDataObject[roll_no] = studentData;
                                }
                                else{
                                    var gender;
                                    gender = 'GIRL';
                                    if (data[i]['GENDER'] == 'Male') {
                                        gender = 'BOY';
                                    } else if (data[i]['GENDER'] == 'Female') {
                                        gender = 'GIRL';
                                    } else {
                                        gender = 'OTHER';
                                    }
                                    duplicateStudentList.push({
                                        rollno: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                        rfid: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                        class: currentClass,
                                        section: currentSection,
                                        name: data[i]['STUDENT NAME'],
                                        fathername: data[i]['FATHER NAME']?data[i]['FATHER NAME'].toUpperCase(): "",
                                        mothername: data[i]['MOTHER NAME']?data[i]['MOTHER NAME'].toUpperCase():"",
                                        contact2: data[i]['CONTACT2']?data[i]['CONTACT2']:"",
                                        gender: gender,
                                        address: data[i]['ADDRESS']?data[i]['ADDRESS']:"",
                                        city: data[i]['CITY']?data[i]['CITY'].toUpperCase():"",
                                        dob: data[i]['DOB']?data[i]['DOB']:"",
                                        emer_1: data[i]['CONTACT']?data[i]['CONTACT']:"",
                                        cat: data[i]['CATEGORY']?data[i]['CATEGORY']:""
                                    });
                                    if(data[i]['ROLLNO'] == $scope.studentList[j]['rfid'].toString()){
                                        errorList.push('Student Already Exists with RFID NO. ' + data[i]['ROLLNO'])
                                    }
                                    if(data[i]['ROLLNO'] == $scope.studentList[j]['rollno'].toString()){
                                        errorList.push('Student Already Exists with Roll No. ' + data[i]['ROLLNO'])
                                    }
                                    $scope.csvFileErrorReport['total_error_rows'] = 
                                        $scope.csvFileErrorReport['total_error_rows'] + 1
                                    errorSummaryObj[i+1] = errorList
                                }
                            }
                        }
                        else{
                            var gender;
                            gender = 'GIRL';
                            if (data[i]['GENDER'] == 'Male') {
                                gender = 'BOY';
                            } else if (data[i]['GENDER'] == 'Female') {
                                gender = 'GIRL';
                            } else {
                                gender = 'OTHER';
                            }
                            var studentData = {
                                rollno: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                rfid: data[i]['ROLLNO']?data[i]['ROLLNO']:"",
                                class: currentClass,
                                section: currentSection,
                                name: data[i]['STUDENT NAME'],
                                fathername: data[i]['FATHER NAME']?data[i]['FATHER NAME'].toUpperCase(): "",
                                mothername: data[i]['MOTHER NAME']?data[i]['MOTHER NAME'].toUpperCase():"",
                                contact2: data[i]['CONTACT2']?data[i]['CONTACT2']:"",
                                gender: gender,
                                address: data[i]['ADDRESS']?data[i]['ADDRESS']:"",
                                city: data[i]['CITY']?data[i]['CITY'].toUpperCase():"",
                                dob: data[i]['DOB']?data[i]['DOB']:"",
                                emer_1: data[i]['CONTACT']?data[i]['CONTACT']:"",
                                cat: data[i]['CATEGORY']?data[i]['CATEGORY']:""
                            };
                            // var uniquePair = studentData['rollno'].toString() + 
                            //  studentData['class'] + studentData['section']
                            newStudentDataObject[roll_no] = studentData;

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
            else{
                $scope.csvFileErrorReport['total_error_rows'] = $scope.csvFileErrorReport['total_error_rows'] + 1
            }
        }
        var fieldList = ['SECTION', 'ROLLNO', 'STUDENT NAME', 'CLASS', 'CONTACT', 
                    'GENDER', 'FATHER NAME', 'MOTHER NAME', 'DOB', 'ADDRESS', 'CITY', 'CATEGORY', 'CONTACT2'];
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

        angular.forEach(newStudentDataObject, function(value, key) {
            tempNewStudentList.push(value)
        });

        var tempNewClassList = []
        angular.forEach(newClassDataObject, function(value, key) {
            tempNewClassList.push(value)
        });
        
        function comparer(otherArray){
            return function(current){
              return otherArray.filter(function(other){
                return other.rollno == current.rollno && other.section == current.section  
                    && other.class == current.class && other.rfid == current.rfid
              }).length == 0;
            }
        }
          
        var onlyInA = tempNewStudentList.filter(comparer(duplicateStudentList));
        var onlyInB = duplicateStudentList.filter(comparer(tempNewStudentList));
        var newStudentList = onlyInA.concat(onlyInB);
        console.log("Duplicate Student List");
        console.log(duplicateStudentList);
        console.log("New Student List")
        console.log(newStudentList);
        console.log("New Class List")
        console.log(tempNewClassList)
        $scope.csvFileErrorReport['total_success_rows'] = newStudentList.length
        $scope.csvFileErrorReport['total_no_of_new_class'] = tempNewClassList.length
        $scope.csvFileErrorReport['total_no_of_new_student'] = newStudentList.length
        $scope.isDataValidationProcessComplete = false;
        var tempClassStudentData = {}

        for(var i=0; i<newStudentList.length; i++){
            var clsssSectionName = newStudentList[i]['class'] + '-' + newStudentList[i]['section'];
            if((clsssSectionName in tempClassStudentData)){
                var currentClassStudentList =  tempClassStudentData[clsssSectionName]
                currentClassStudentList.push(newStudentList[i])
                tempClassStudentData[clsssSectionName] = currentClassStudentList
            }
            else{
                tempClassStudentData[clsssSectionName] = [newStudentList[i]]
            }
        }
        angular.forEach(tempClassStudentData, function(value, key) {
            $scope.newStudentList.push(value)
        });
        console.log($scope.newStudentList)
        
        $scope.$apply(function() {
            $scope.csvFileErrorReport['error_summary'] = errorSummaryObj
        });
    };

    $scope.addStudentDataOnServer =  function(){
        $scope.isDataValidationProcessComplete = true;
        $rootScope.mypageloading = true;
        tempNewClassList = []
        angular.forEach(newClassDataObject, function(value, key) {
            tempNewClassList.push(value)
        });
        $scope.newClassList = JSON.parse(JSON.stringify(tempNewClassList))
        if($scope.newClassList && $scope.newClassList.length > 0){
            $scope.saveClasses();
        }
        else{
            if($scope.newStudentList.length > 0){
                addStudent($scope.newStudentList[0])
            }
        }
    };
    
    $scope.sendOTP = function(){
         // sendOne(0);
    }

    function sendOne(i) {
        var smsURL = "/api/mt/SendSMS?user=zuwagon&password=zuwagon&senderid=ZUWAGN&channel=Trans&DCS=0&flashsms=0"
        // smsURL += "&number=91"+"7845238570";
        smsURL += "&number=91"+stuList[i].emer_1.replace(/,\s*$/, "");
        smsURL += "&text=Hello "+stuList[i].name+ "! Your OTP for School App is " + stuList[i].otp+  " How to? https://bit.ly/2YXYWRN  Regards, "+ "Lotus Valley Mandsaur"
        smsURL += "&route=1";

        smsURL = encodeURI(smsURL);
        var smsObj = {
            "smsURL": "http://smss.apptutor.in"+smsURL
         }
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/sendsms/apptutor', smsObj);
        requestHandle.then(function (result) {
            if (result.success)
            {
                console.log('stuList[i].name '+stuList[i].name)
                
                $timeout(function () {

                    sendOne(i+1);
                }, 10000);
                
            }
            else
            {   
                console.log('error i = '+i)
                console.log('stuList[i].name '+stuList[i].name)
                FlashService.Error(result.data.message);
                alert('error')
            }
        });
    }

    function checkDuplicateCourse(){
        if($scope.existingCourseList && $scope.existingCourseList.length > 0){
            for(var i=0; i<$scope.existingCourseList.length;i++){
                if('_id' in $scope.courseForm && $scope.courseForm['_id']){
                    if($scope.courseForm['name'] == $scope.existingCourseList[i]['name'] && 
                        $scope.courseForm['_id'] != $scope.existingCourseList[i]['_id']){
                        return true
                    }
                }
                else{
                    if($scope.courseForm['name'] == $scope.existingCourseList[i]['name']){
                        return true
                    }
                }
            }
            return false
        }
        else{
            return false
        }
        
    }

    $scope.addCourse = function() {
        var is_duplicate_course = checkDuplicateCourse();
        if (is_duplicate_course) {
            FlashService.Error('Course Name should be unique.');
        }
        function addCourseToServer(){
            if(!('_id' in $scope.courseForm)){
                $rootScope.mypageloading = true;
                HttpService.HttpPostData(
                    $rootScope.serverURL + '/customer/grades',
                    [$scope.courseForm]
                ).then(function(result) {
                    if(result && result.success) {
                        if ($scope.existingClassList.indexOf(result.data[0]) == -1) {
                            $scope.existingClassList.push(result.data[0]);
                        }
                        $indexedDB.openStore('class', function (classStore) {
                            $log.debug('opened classStore');
                            classStore.upsert(result.data[0]).then(function (e) {
                                $log.debug('upserted successfully in classStore');
                                // HandShakeService.stuwarningcheck();
                            },
                                function (error) {
                                    $log.debug('Error in upserting in classStore = ' + error);
                                });
                        });
                        $rootScope.mypageloading = false;
                        FlashService.Error('');
                        $scope.showModal = false;
                        $scope.showAddCourseForm = false;
                        $scope.courseForm = {};
                        $scope.courseImage = {};
                    }
                });
            }
            else{
                console.log($scope.courseForm)
                var requestHandle = HttpService.HttpUpdateData(
                $rootScope.serverURL + '/customer/grades/' + $scope.courseForm._id, $scope.courseForm);
                requestHandle.then(function (result) {
                    if (result.success == true) {
                        $indexedDB.openStore('class', function (classStore) {
                            classStore.delete($scope.existingClassList[$scope.indexInEditing].name + '-' + $scope.existingClassList[$scope.indexInEditing].section).then(function (e) {
                                $scope.courseForm.count = $scope.existingClassList[$scope.indexInEditing].count;
                                classStore.upsert($scope.courseForm).then(function (e) {
                                    $log.debug('upserted successfully in classStore');
                                    $scope.existingClassList[$scope.indexInEditing] = $scope.courseForm;
                                },
                                    function (error) {
                                        $log.debug('Error in upserting in classStore = ' + error);
                                    });
                            },
                                function (error) {
                                    $log.debug('Error in upserting in classStore = ' + error);
                                });
    
                        });
                        $rootScope.mypageloading = false;
                        $scope.showModal = false;
                        $scope.courseEdit = false;
                        $scope.indexInEditing = ''
                        $scope.showAddCourseForm = false;
                        $scope.courseForm = {};
                        FlashService.Error('');
                        $scope.courseImage = {};
                    }
                    else {
                        console.log(result.data)
                    }
                });
            }
        }

        if(is_duplicate_course == false){
            if($scope.courseImage?$scope.courseImage.file:false) {
                $rootScope.mypageloading = true;
                UtilService.uploadFilesToAmazonS3([$scope.courseImage]).then(
                    function(fileUploadRes) {
                        if(fileUploadRes?fileUploadRes.data:false) {
                            angular.forEach(Object.keys(fileUploadRes.data),
                            function(key, index) {
                                $scope.courseForm.image = fileUploadRes.data[key].uploadUrl;
                                $scope.courseImage.file = null;
                                $scope.courseImage.fileName = '';
                                $scope.courseImage.imagePreview = '';
                            });
                            addCourseToServer();
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
                addCourseToServer();
            }
        }
    };

    $scope.addNewPriceDetail = function() {
        $scope.courseForm.price.push({
            value: '',
            duration: ''
        });
    }

    $scope.deletePriceDetail = function(index) {
        if($scope.courseForm.price.length > 1) {
            $scope.courseForm.price.splice(index, 1);
        }
    }
});