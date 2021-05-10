app.controller('setUpdateExamController', function ($rootScope, $routeParams, $location, HandShakeService, FlashService, examServices, teacherServices, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $scope.PrintDivContent = UtilService.PrintDivContent;
    $scope.currentUserDetail = JSON.parse(localStorage.getItem("currentUserDetail"));
    FlashService.Error('');
    FlashService.Success('');

    $rootScope.mypageloading = true;
    $scope.examId = "";
    var class_hash = {};
    $scope.classList = [];
    $scope.classes = [];
    $scope.subjectList = [];
    var subjectResult_hash = {};
    $scope.examClassData = {};
    var teacherName_hash = {};
    $scope.currentExamdata = {};
    $scope.examSetErrorMessage = '';
    $scope.setExamArrayModal = {
        "exam_id": "",
        "name": "",
        "classes": [],
        "is_scheduled": true,
        "instructions": "",
        "total_time": 0,
        "total_marks": 0,
        "is_online": true,
        "start_time": "",
        "questions": [],
        "syllabus": "",
        "start_time_buffer": 0,
        "end_time_buffer": 10,
        "chapter_id": []
    }

    $scope.getQuestionDetailsModal =
    {
        "question": "",
        "subject_id": "",
        "subject_name": "",
        "level": "",
        "answer": [],
        "options": [],
        "type": "",
        "customer_id": "",
        "grades": "",
        "marks": 0,
        "solution": "",
        "photos": [],
        "localPhotos": []
    }
    $scope.answer = "";
    $scope.hideExamAnswer = false;
    $scope.selectedClassIds = [];
    $scope.questionList = [];
    $scope.uploadProgress = {};

    $scope.showSetExamPreviewModal = false;
    $scope.setExamQuestionsModal = false;
    $scope.ifDirectGoToExamPreview = false;
    $scope.showQuestionModalBox = false;

    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: true,
        showUncheckAll: true,
    };

    $scope.example14settings = {
        scrollableHeight: '300px',
        smartButtonMaxItems: 5,
        enableSearch: true,
        scrollable: true,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };

    $scope.example15settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: true,
        showUncheckAll: true,
    };

    $scope.example15settings = {
        scrollableHeight: '300px',
        smartButtonMaxItems: 5,
        enableSearch: true,
        scrollable: true,
        displayProp: 'chapter_name',
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };

    $scope.classSubjectObj = {}
    $scope.classSubjectChapterList = []
    $scope.examChapters = []
    $scope.chapterHashObj = {}

    $scope.examChapterModel = {
        "is_exam_chapter_assign": false,
        "class_id": '',
        "subject_id": '',
        "newExamChapterList": [],
    }
    $scope.isPrint = false;

    $scope.$watch("setExamArrayModal.is_scheduled", function() {
        if($scope.setExamArrayModal.is_scheduled == false){
            $scope.setExamArrayModal['start_time_buffer'] = 0;
            $scope.setExamArrayModal['end_time_buffer'] = 0;
            $scope.setExamArrayModal['start_time'] = ""
            $scope.setExamArrayModal['total_time'] = 0
        }
        else {
            $scope.setExamArrayModal['end_time_buffer'] = 10;
        }
    });

    $scope.$watch("examChapterModel.is_exam_chapter_assign", function() {
        if($scope.examChapterModel.is_exam_chapter_assign == false){
            $scope.examChapterModel['class_id'] = '';
            $scope.examChapterModel['subject_id'] = '';
            $scope.examChapterModel['newExamChapterList'] = []
            $scope.classSubjectChapterList = []
            $scope.examChapters = []
        }
    });

    $scope.$watch('setExamArrayModal.name', function (newValue, oldValue, scope) {
        if (newValue != oldValue) {
            $scope.examSetErrorMessage = "";
        }
    }, true);

    $scope.getClasses = function () {
        if($scope.currentUserDetail['type'] == 'TEACHER'){
            var classData = JSON.parse(localStorage.getItem('classData'));
            angular.forEach(classData, function(value, key) {
                $scope.classList.push(value);
            });
            $scope.classes = $scope.classList;
            angular.forEach($scope.classList, function (obj) {
                class_hash[obj._id] = obj;
                $scope.examClassData[obj._id] = obj.name
            })
        }
        else {
            HandShakeService.getGradeInfo().then(function (response) {
                $log.debug('HandShakeService getRouteInfo received');
                $scope.classList = response;
                $scope.classes = response;
                angular.forEach($scope.classList, function (obj) {
                    class_hash[obj._id] = obj;
                    $scope.examClassData[obj._id] = obj.name
                })
            });
        }
    };

    $scope.getSubjectList = function () {
        var classSubjectList = []
        if($scope.currentUserDetail['type'] == 'TEACHER'){
            var subjectData = JSON.parse(localStorage.getItem('subjectData'));
            angular.forEach(subjectData, function(value, key) {
                $scope.subjectList.push(value);
                subjectResult_hash[value._id] = value;
                var class_id = value['class_id']
                if((class_id in $scope.classSubjectObj)){
                    var classSubjectList =  $scope.classSubjectObj[class_id]
                    classSubjectList.push({
                        class_id: value.classes_id,
                        subject_name: value.name,
                        subject_id: value._id
                    })
                    $scope.classSubjectObj[class_id] = classSubjectList
                }
                else{
                    $scope.classSubjectObj[class_id] = [{
                        class_id: value.classes_id,
                        subject_name: value.name,
                        subject_id: value._id
                    }]
                }
            });
        }
        else {
            examServices.getSubjectList(function (response) {
                $scope.subjectList = response.data;
                angular.forEach($scope.subjectList, function (obj) {
                    subjectResult_hash[obj._id] = obj;
                    if(obj && obj.classes) {
                        angular.forEach(obj.classes, function(classes_id) {
                            if(classes_id) {
                                classSubjectList.push({
                                    class_id: classes_id,
                                    subject_name:obj.name,
                                    subject_id: obj._id
                                })
                            }
                        });
                    }
                });
                $scope.classSubjectObj = classSubjectList.reduce(function (r, a) {
                    r[a.class_id] = r[a.class_id] || [];
                    r[a.class_id].push(a);
                    return r;
                }, Object.create(null));
            });
        }
    };

    $scope.getTeacherList = function () {
        $rootScope.mypageloading = true;
        teacherServices.getTeacherList(function (response) {
            if (response.success == true) {
                if (response.data && response.data.length > 0) {
                    var teacherList = response.data;
                    for (var i = 0; i < teacherList.length; i++) {
                        teacherName_hash[teacherList[i]['teacher_id']] = teacherList[i].name
                    }
                }
            }
        })
    };

    $scope.getClasses();
    $scope.getSubjectList();
    if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
        $scope.getTeacherList();
    }

    $scope.resetExamChapterData = function(){
        $scope.examChapterModel['class_id'] = '';
        $scope.examChapterModel['subject_id'] = '';
        $scope.classSubjectChapterList = [];
        $scope.examChapters = [];
        console.log($scope.examChapterModel)
    }

    $scope.addNewExamChapterModel = function(){
        function checkChapterIDExists(val) {
            return $scope.examChapterModel.newExamChapterList.some(function (arrayObj) { 
                return val['_id'] === arrayObj['_id']; 
            });
          }
        for(var i=0; i<$scope.examChapters.length; i++){
            var currentChapterObj = {
                '_id':$scope.examChapters[i]['_id'],
                'chapter_name': $scope.chapterHashObj[$scope.examChapters[i]['_id']]
            }
            var isChapterExists = checkChapterIDExists(currentChapterObj)
            if(!isChapterExists){
                $scope.examChapterModel['newExamChapterList'].push(currentChapterObj);
            }
        }
        $scope.resetExamChapterData();
    };

    $scope.removeNewExamChapterModel = function(currentObj){
        if(currentObj){
            var index = $scope.examChapterModel.newExamChapterList.indexOf(currentObj);
            if (index > -1) {
                $scope.examChapterModel.newExamChapterList.splice(index, 1);
            }
        }
    };

    $scope.getChapterListByClassAndSubject = function(){
        if($scope.examChapterModel['class_id'] && $scope.examChapterModel['subject_id']){
            $rootScope.mypageloading = true;
             var requestHandle = HttpService.HttpGetData($rootScope.serverURL + 
                 '/education/chapter/list?class_id='+ $scope.examChapterModel['class_id'] + 
                 '&subject_id=' + $scope.examChapterModel['subject_id']);
             requestHandle.then(function (response) {
                 if (response.success == true && response['data']) {
                     $scope.classSubjectChapterList = response['data']['chapterList'];
                     angular.forEach($scope.classSubjectChapterList, function (chapterObj) {
                         $scope.chapterHashObj[chapterObj['_id']] = chapterObj['chapter_name']
                     })
                     $rootScope.mypageloading = false;
                     
                 } else {
                     $rootScope.mypageloading = false;
                     console.log(response)
                 }
             })
         }
     };

    $scope.getExamPreviewFunction = function (examID) {
        FlashService.Error('');
        FlashService.Success('');
        $scope.examChapterModel = {
            "is_exam_chapter_assign": false,
            "class_id": '',
            "subject_id": '',
            "newExamChapterList": [],
        }
        $scope.classSubjectChapterList = []
        $scope.examChapters = []
        $rootScope.mypageloading = true;
        examServices.getExamDetail(examID, function (response) {
            if (response.success == true && response['data']['exam']) {
                console.log(response['data']['exam']);
                var examData = response['data']['exam'];
                $scope.currentExamdata = response['data']['exam'];
                $scope.setExamArrayModal = {
                    "exam_id": examData._id,
                    "name": examData.name,
                    "instructions": examData.instructions ? examData.instructions : "NA",
                    "total_time": examData.total_time ? examData.total_time : 0,
                    "total_marks": examData.total_marks ? examData.total_marks : 0,
                    "classes": examData.classes ? examData.classes : [],
                    "is_online": examData.is_online ? examData.is_online : true,
                    "start_time": examData.start_time ? new Date(examData.start_time) : "",
                    "questions": examData.questions,
                    "syllabus": examData.syllabus != null ? examData.syllabus : "NA",
                    "start_time_buffer": examData.start_time_buffer ? examData.start_time_buffer : 0,
                    "end_time_buffer": examData.end_time_buffer ? examData.end_time_buffer : 10,
                    "created_at": examData.time ? examData.time : "",
                    "updated_at": examData.updated_at ? examData.updated_at : "",
                }
                if('chapters' in examData){
                    $scope.examChapterModel['is_exam_chapter_assign'] = true;
                    $scope.examChapterModel['newExamChapterList'] = examData['chapters'];
                }
                if(examData['is_scheduled'] == false){
                    $scope.setExamArrayModal['is_scheduled'] = false
                }
                else {
                    $scope.setExamArrayModal['is_scheduled'] = true
                }
                if ($scope.setExamArrayModal.is_scheduled == false) {
                    $scope.setExamArrayModal['end_time_buffer'] = 0
                }
                if (examData['created_by'] == 'TEACHER' && examData['created_by_id']) {
                    $scope.setExamArrayModal['exam_created_name'] = teacherName_hash[examData['created_by_id']]
                }
                for (var i = 0; i < examData.questions.length; i++) {
                    if (examData.questions[i]['type'] == 'MULTI-SELECT') {
                        examData.questions[i]['answer'] = [examData.questions[i]['answer']];
                    }
                    examData.questions[i]['customer_id'] = examData['customer_id'];
                }
                $scope.questionList = examData.questions;
                $scope.setExamQuestionsModal = true;
                $scope.showSetExamPreviewModal = true;
                $scope.ifDirectGoToExamPreview = true;
                $rootScope.mypageloading = false;
            } else {
                FlashService.Error('');
                $rootScope.mypageloading = false;
            }

        })
    };

    $scope.updateSetExamFunction = function (examID) {
        FlashService.Error('');
        FlashService.Success('');
        $rootScope.mypageloading = true;
        $scope.examChapterModel = {
            "is_exam_chapter_assign": false,
            "class_id": '',
            "subject_id": '',
            "newExamChapterList": [],
        }
        $scope.classSubjectChapterList = []
        $scope.examChapters = []
        if(localStorage.getItem('currentExamDetail') && localStorage.getItem('currentExamQuestionDetail')){
            $scope.currentExamdata = JSON.parse(localStorage.getItem('currentExamDetail'));
            getExamDataFromLocalStorage()
            $scope.setExamQuestionsModal = true;
            $scope.showSetExamPreviewModal = false;
        }
        else {
            examServices.getExamDetail(examID, function (response) {
                if (response.success == true && response['data']['exam']) {
                    console.log(response['data']['exam']);
                    var examData = response['data']['exam'];
                    $scope.currentExamdata = response['data']['exam'];
                    $scope.setExamArrayModal = {
                        "exam_id": examData._id,
                        "name": examData.name,
                        "instructions": examData.instructions ? examData.instructions : "NA",
                        "total_time": examData.total_time ? examData.total_time : 0,
                        "total_marks": examData.total_marks ? examData.total_marks : 0,
                        "classes": examData.classes ? examData.classes : [],
                        "is_online": examData.is_online ? examData.is_online : true,
                        "start_time": examData.start_time ? new Date(examData.start_time) : "",
                        "questions": examData.questions,
                        "syllabus": examData.syllabus != null ? examData.syllabus : "NA",
                        "start_time_buffer": examData.start_time_buffer ? examData.start_time_buffer : 0,
                        "end_time_buffer": examData.end_time_buffer ? examData.end_time_buffer : 10,
                        "created_at": examData.time ? examData.time : "",
                        "updated_at": examData.updated_at ? examData.updated_at : "",
                    }
                    if('chapters' in examData){
                        $scope.examChapterModel['is_exam_chapter_assign'] = true;
                        $scope.examChapterModel['newExamChapterList'] = examData['chapters'];
                    }
                    if(examData['is_scheduled'] == false){
                        $scope.setExamArrayModal['is_scheduled'] = false
                    }
                    else {
                        $scope.setExamArrayModal['is_scheduled'] = true
                    }
                    $scope.selectedClassIds = []
                    if ($scope.setExamArrayModal.is_scheduled == false) {
                        $scope.setExamArrayModal['end_time_buffer'] = 0
                    }
                    if (examData['created_by'] == 'TEACHER' && examData['created_by_id']) {
                        $scope.setExamArrayModal['exam_created_name'] = teacherName_hash[examData['created_by_id']]
                    }
                    for (var i = 0; i < examData.questions.length; i++) {
                        if (examData.questions[i]['type'] == 'MULTI-SELECT') {
                            examData.questions[i]['answer'] = [examData.questions[i]['answer']];
                        }
                        examData.questions[i]['customer_id'] = examData['customer_id'];
                    }
                    if (examData['classes'] && examData['classes'].length > 0) {
                        for (var i = 0; i < examData['classes'].length; i++) {
                            $scope.selectedClassIds.push({
                                '_id': examData['classes'][i]
                            })
                        }
                    }
                    $scope.questionList = examData.questions;
                    if($scope.questionList && $scope.questionList.length > 0){
                        if('subject_name' in $scope.questionList[0] || 'subject_id' in $scope.questionList[0]) {
                            $scope.getQuestionDetailsModal['subject_name'] = $scope.questionList[0]['subject_name'];
                            $scope.getQuestionDetailsModal['subject_id'] = $scope.questionList[0]['subject_id'];
                        }
                    }
                    $scope.setExamQuestionsModal = true;
                    $scope.showSetExamPreviewModal = false;
                    $rootScope.mypageloading = false;
                } else {
                    FlashService.Error('');
                    $rootScope.mypageloading = false;
                }
            })
        }
    };

    $scope.hideSetExamTab = function () {
        $location.path('/exam');
    };

    //dynamic key for local photo object
    var dkIndex = 0;
    $scope.questionModalPhotoChange = function (file) {
        dkIndex++;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.getQuestionDetailsModal.localPhotos.push({
                file: file,
                fileName: file.name,
                basePath: 'question',
                fileKey: 'dkQuestionPhoto' + dkIndex,
                imagePreview: e.target.result
            });
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    };

    $scope.deletePhoto = function (type, index) {
        if (type === 'local') {
            $scope.getQuestionDetailsModal.localPhotos.splice(index, 1);
        } else {
            $scope.getQuestionDetailsModal.photos.splice(index, 1);
        }
    };

    $scope.showQuestionsModal = function () {
        FlashService.Error('');
        FlashService.Success('');

        if ($scope.getQuestionDetailsModal['subject_id'] == undefined || $scope.getQuestionDetailsModal['subject_id'] == '') {
            FlashService.Error('Please select subject');
            return false
        }

        if ($scope.selectedClassIds.length == 0) {
            FlashService.Error('Please select atleast one class for which this question is suitable');
            return false
        }
        $scope.getQuestionDetailsModal['question'] = "";
        $scope.getQuestionDetailsModal['customer_id'] =
            $scope.getQuestionDetailsModal.customer_id ? $scope.getQuestionDetailsModal.customer_id : "";
        $scope.getQuestionDetailsModal['grades'] =
            $scope.selectedClassIds.map(function (item) { return item["_id"]; }) ? $scope.getQuestionDetailsModal.grades : "";
        $scope.getQuestionDetailsModal['subject_id'] =
            $scope.getQuestionDetailsModal.subject_id ? $scope.getQuestionDetailsModal.subject_id : "";
        $scope.getQuestionDetailsModal['subject_name'] =
            $scope.getQuestionDetailsModal.subject_name ? $scope.getQuestionDetailsModal.subject_name : "";
        $scope.getQuestionDetailsModal['marks'] = "";
        $scope.getQuestionDetailsModal['level'] = "EASY";
        $scope.getQuestionDetailsModal['answer'] = [];
        $scope.getQuestionDetailsModal['options'] = [];
        $scope.getQuestionDetailsModal['type'] = "";
        $scope.getQuestionDetailsModal['solution'] = "";
        $scope.getQuestionDetailsModal['photos'] = [];
        $scope.getQuestionDetailsModal['localPhotos'] = [];
        $scope.getQuestionDetailsModal['key'] = 0;
        $scope.answer = '';
        $scope.showQuestionModalBox = true;
        $scope.uploadProgress = {};
    };

    $scope.getQuestionTypeChange = function (data) {
        $scope.getQuestionDetailsModal.type = data;
        if (data == 'SINGLE-SELECT' || data == 'MULTI-SELECT') {
            $scope.getQuestionDetailsModal.options = [
                {
                    "id": "A",
                    "answer": ""
                },
                {
                    "id": "B",
                    "answer": ""
                },
                {
                    "id": "C",
                    "answer": ""
                },
                {
                    "id": "D",
                    "answer": ""
                }
            ];
        } else {
            $scope.getQuestionDetailsModal.options = [];
        }
    };

    $scope.getSubjectChange = function (data) {
        if (data) {
            $scope.getQuestionDetailsModal['subject_name'] = subjectResult_hash[data].name;
            $scope.getQuestionDetailsModal['subject_id'] = subjectResult_hash[data]._id;
            $scope.getQuestionDetailsModal['customer_id'] = subjectResult_hash[data].customer_id;
        }
        else {
            $scope.getQuestionDetailsModal['subject_name'] = ''
            $scope.getQuestionDetailsModal['subject_id'] = ''
        }
    };

    $scope.setOptionAnswerValue = function (id, answer) {
        for (var i = 0; i < $scope.getQuestionDetailsModal.options.length; i++) {
            if ($scope.getQuestionDetailsModal.options[i]['id'] == id) {
                $scope.getQuestionDetailsModal.options[i]['answer'] = answer;
            }
        }
    };

    $scope.setAnswerValue = function (value) {
        $scope.getQuestionDetailsModal.answer = [];
        if (value) {
            if ($scope.getQuestionDetailsModal.type == 'MULTI-SELECT') {
                $scope.getQuestionDetailsModal.answer.push(value);
            }
            else {
                $scope.getQuestionDetailsModal.answer.push(value.toString())
            }
        }
        else {
            $scope.getQuestionDetailsModal.answer = []
        }
    };

    $scope.deleteQuestion = function (currentQuestion) {
        var index = $scope.questionList.indexOf(currentQuestion);
        if (index > -1) {
            $scope.questionList.splice(index, 1);
        }
        $scope.setExamArrayModal['total_marks'] =
            $scope.questionList.reduce(function (cnt, o) { return cnt + parseFloat(o.marks); }, 0)
        saveExamDataToLocalStorage();
    };

    $scope.updateQuestionDetail = function (currentQuestion) {
        if ($scope.getQuestionDetailsModal['subject_id'] == undefined || $scope.getQuestionDetailsModal['subject_id'] == '') {
            FlashService.Error('Please select subject');
            return false
        }
        if ($scope.selectedClassIds.length == 0) {
            FlashService.Error('Please select atleast one class for which this question is suitable');
            return false
        }
        console.log(currentQuestion);

        $scope.getQuestionDetailsModal =
        {
            "question": currentQuestion.question,
            "subject_id": $scope.getQuestionDetailsModal.subject_id,
            "subject_name": $scope.getQuestionDetailsModal.subject_name,
            "level": currentQuestion.level,
            "answer": currentQuestion.answer,
            "options": currentQuestion.options,
            "type": currentQuestion.type,
            "customer_id": $scope.getQuestionDetailsModal.customer_id ? $scope.getQuestionDetailsModal.customer_id : currentQuestion.customer_id,
            "grades": currentQuestion.grades ? $scope.getQuestionDetailsModal.grades : "",
            "marks": currentQuestion.marks,
            "solution": currentQuestion.solution ? $scope.getQuestionDetailsModal.solution : "",
            "photos": currentQuestion.photos,
            "localPhotos": []
        }
        if ('_id' in currentQuestion) {
            $scope.getQuestionDetailsModal['_id'] = currentQuestion['_id'];
        }
        if ('key' in currentQuestion) {
            $scope.getQuestionDetailsModal['key'] = currentQuestion['key'];
        }
        else {
            var index = $scope.questionList.indexOf(currentQuestion);
            $scope.getQuestionDetailsModal['key'] = index + 1;
        }

        $scope.answer = $scope.getQuestionDetailsModal.answer[0];
        $scope.showQuestionModalBox = true;
    };

    function resetExamDetail(){
        $scope.showQuestionModalBox = false;
        $scope.getQuestionDetailsModal['question'] = "";
        $scope.getQuestionDetailsModal['marks'] = 0;
        $scope.getQuestionDetailsModal['level'] = "EASY";
        $scope.getQuestionDetailsModal['answer'] = [];
        $scope.getQuestionDetailsModal['options'] = [];
        $scope.getQuestionDetailsModal['type'] = "";
        $scope.getQuestionDetailsModal['solution'] = "";
        $scope.getQuestionDetailsModal['key'] = 0;
        $scope.getQuestionDetailsModal['photos'] = [];
        $scope.getQuestionDetailsModal['localPhotos'] = [];
        $scope.answer = '';
    }

    function updateQuestionDetailOnServer(data) {
        var payLoad = JSON.parse(JSON.stringify(data));
        payLoad['marks'] = parseFloat(payLoad['marks']);
        if (payLoad['type'] != "NUMBER") {
            var newOptionList = []
            for (var j = 0; j < payLoad['options'].length; j++) {
                if (payLoad['options'][j]['answer'] != "") {
                    newOptionList.push(payLoad['options'][j])
                }
            }
            payLoad['options'] = newOptionList
        }
        if (payLoad['type'] == 'MULTI-SELECT') {
            payLoad['answer'] = payLoad['answer'][0];
        }
        payLoad['grades'] = $scope.selectedClassIds.map(function (item) { return item["_id"]; })
        payLoad['id'] = payLoad['_id']
        console.log(payLoad)
        examServices.updateQuestion(payLoad, function (response) {
            console.log(response)
            if (response.success == true) {
                console.log(response);
                $scope.setExamArrayModal['total_marks'] = 
                    $scope.questionList.reduce(function (cnt, o) { return cnt + parseFloat(o.marks); }, 0)
                saveExamDataToLocalStorage()
                $rootScope.mypageloading = false;
            } else {
                console.log('something went wrong in update question request');
                $rootScope.mypageloading = false;
            }
        });
    };

    function addNewQuestionDetailOnServer(data) {
        var payLoad = JSON.parse(JSON.stringify(data));
        payLoad['marks'] = parseFloat(payLoad['marks']);
        if (payLoad['type'] != "NUMBER") {
            var newOptionList = []
            for (var j = 0; j < payLoad['options'].length; j++) {
                if (payLoad['options'][j]['answer'] != "") {
                    newOptionList.push(payLoad['options'][j])
                }
            }
            payLoad['options'] = newOptionList
        }
        if (payLoad['type'] == 'MULTI-SELECT') {
            payLoad['answer'] = payLoad['answer'][0];
        }
        payLoad['grades'] = $scope.selectedClassIds.map(function (item) { return item["_id"]; })
        console.log(payLoad)
        examServices.addQuestion(payLoad, function (response) {
            console.log(response)
            if (response.success == true) {
                var id = response['data']['data'][0]['_id']
                $scope.questionList.push(data)
                var index = $scope.questionList.indexOf(data);
                $scope.questionList[index]['_id'] = id
                $scope.setExamArrayModal['total_marks'] = 
                    $scope.questionList.reduce(function (cnt, o) { return cnt + parseFloat(o.marks); }, 0)
                console.log($scope.questionList[index])
                saveExamDataToLocalStorage()
                $rootScope.mypageloading = false;

            } else {
                console.log('something went wrong in add question request');
                $rootScope.mypageloading = false;
            }
        });
    };

    $scope.addQuestions = function () {
        FlashService.Error('');
        FlashService.Success('');

        if ($scope.getQuestionDetailsModal.question == undefined || $scope.getQuestionDetailsModal.question == '') {
            FlashService.Error('Please enter question');
            return false
        } else if ($scope.getQuestionDetailsModal.level == undefined || $scope.getQuestionDetailsModal.level == '') {
            FlashService.Error('Please set level');
            return false
        } else if ($scope.getQuestionDetailsModal.type == undefined || $scope.getQuestionDetailsModal.type == '') {
            FlashService.Error('Please set type');
            return false
        } else if ($scope.getQuestionDetailsModal.marks == undefined ||
            $scope.getQuestionDetailsModal.marks == 0 ||
            $scope.getQuestionDetailsModal.marks == '') {
            FlashService.Error('Please enter marks');
            return false
        } else if ($scope.getQuestionDetailsModal.answer.length == 0) {
            FlashService.Error('Please select answer');
            return false
        }
        else if ($scope.getQuestionDetailsModal.type == 'MULTI-SELECT' &&
            $scope.getQuestionDetailsModal.answer[0].length == 0) {
            FlashService.Error('Please select answer');
            return false
        }
        if ($scope.getQuestionDetailsModal.type == 'SINGLE-SELECT' || $scope.getQuestionDetailsModal.type == 'MULTI-SELECT') {
            for (var i = 0; i < $scope.getQuestionDetailsModal.options.length; i++) {
                if ($scope.getQuestionDetailsModal.type == 'SINGLE-SELECT') {
                    if ($scope.getQuestionDetailsModal.options[i]['answer'] == '' ||
                        $scope.getQuestionDetailsModal.options[i]['answer'] == undefined) {
                        if ($scope.getQuestionDetailsModal.answer.includes($scope.getQuestionDetailsModal.options[i]['id']) == true) {
                            FlashService.Error('Please choose valid answer');
                            return false
                        }
                    }
                }
                if ($scope.getQuestionDetailsModal.type == 'MULTI-SELECT') {
                    if ($scope.getQuestionDetailsModal.options[i]['answer'] == '' ||
                        $scope.getQuestionDetailsModal.options[i]['answer'] == undefined) {
                        if ($scope.getQuestionDetailsModal.answer[0].includes($scope.getQuestionDetailsModal.options[i]['id']) == true) {
                            var index = $scope.getQuestionDetailsModal.answer[0].indexOf($scope.getQuestionDetailsModal.options[i]['id']);
                            if (index > -1) {
                                $scope.getQuestionDetailsModal.answer[0].splice(index, 1);
                            }
                        }
                    }
                }
            }
        }

        function processAddOrEditNewQuestionData() {
            $scope.uploadProgress = {};
            if ($scope.questionList && $scope.questionList.length > 0 && $scope.getQuestionDetailsModal.key != 0) {
                for (var i = 0; i < $scope.questionList.length; i++) {
                    if (('_id' in $scope.getQuestionDetailsModal) && $scope.questionList[i]['_id'] == $scope.getQuestionDetailsModal['_id']) {
                        $scope.questionList[i].question = $scope.getQuestionDetailsModal.question
                        $scope.questionList[i].subject_id = $scope.getQuestionDetailsModal.subject_id
                        $scope.questionList[i].subject_name = $scope.getQuestionDetailsModal.subject_name
                        $scope.questionList[i].marks = $scope.getQuestionDetailsModal.marks
                        $scope.questionList[i].answer = $scope.getQuestionDetailsModal.answer
                        $scope.questionList[i].options = $scope.getQuestionDetailsModal.options
                        $scope.questionList[i].type = $scope.getQuestionDetailsModal.type
                        $scope.questionList[i].customer_id = $scope.getQuestionDetailsModal.customer_id
                        $scope.questionList[i].grades = $scope.getQuestionDetailsModal.grades
                        $scope.questionList[i].photos = $scope.getQuestionDetailsModal.photos;
                        updateQuestionDetailOnServer($scope.questionList[i]);
                    }
                }
            }
            else {
                var payLoad = {
                    "question": $scope.getQuestionDetailsModal.question,
                    "subject_id": $scope.getQuestionDetailsModal.subject_id ? $scope.getQuestionDetailsModal.subject_id : "",
                    "subject_name": $scope.getQuestionDetailsModal.subject_name ? $scope.getQuestionDetailsModal.subject_name : "",
                    "marks": $scope.getQuestionDetailsModal.marks ? $scope.getQuestionDetailsModal.marks : 0,
                    "level": $scope.getQuestionDetailsModal.level,
                    "answer": $scope.getQuestionDetailsModal.answer,
                    "options": $scope.getQuestionDetailsModal.options,
                    "type": $scope.getQuestionDetailsModal.type,
                    "customer_id": $scope.getQuestionDetailsModal.customer_id ? $scope.getQuestionDetailsModal.customer_id : "",
                    "grades": $scope.selectedClassIds.map(function (item) { return item["_id"]; }) ? $scope.getQuestionDetailsModal.grades : "",
                    "key": $scope.questionList.length + 1,
                    'photos': $scope.getQuestionDetailsModal.photos
                }
                var data = $scope.getQuestionDetailsModal.subject_id;
                payLoad['subject_name'] = subjectResult_hash[data].name;
                payLoad['customer_id'] = subjectResult_hash[data].customer_id;
                addNewQuestionDetailOnServer(payLoad);
                console.log(payLoad);
            }
        }

        if ($scope.getQuestionDetailsModal ? $scope.getQuestionDetailsModal.localPhotos ? $scope.getQuestionDetailsModal.localPhotos.length : false : false) {
            $rootScope.mypageloading = true;
            UtilService.uploadFilesToAmazonS3($scope.getQuestionDetailsModal.localPhotos).then(
                function (fileUploadRes) {
                    if (fileUploadRes ? fileUploadRes.data : false) {
                        angular.forEach(Object.keys(fileUploadRes.data),
                            function (key, index) {
                                $scope.getQuestionDetailsModal.photos.push(
                                    fileUploadRes.data[key].uploadUrl
                                );
                            });
                        $scope.getQuestionDetailsModal.localPhotos = [];
                        processAddOrEditNewQuestionData();
                    }
                },
                function (error) {
                    $log.error(error);
                    $rootScope.mypageloading = false;
                },
                function (progress) {
                    $rootScope.mypageloading = true;
                    $scope.uploadProgress = progress;
                }
            );
        } else {
            processAddOrEditNewQuestionData();
        }
    };

    function saveExamDataToLocalStorage() {
        $scope.setExamArrayModal['classes'] = []
        if ($scope.questionList && $scope.questionList.length > 0) {
            $scope.setExamArrayModal['classes'] = $scope.selectedClassIds.map(function (item) { return item["_id"]; });
        }
        if ($scope.setExamArrayModal['start_time']) {
            $scope.setExamArrayModal['start_time'] = $scope.setExamArrayModal['start_time'].getTime();
        }
        localStorage.setItem('currentExamDetail', JSON.stringify($scope.setExamArrayModal));
        localStorage.setItem('currentExamQuestionDetail', JSON.stringify($scope.questionList));
        localStorage.setItem('currentExamChapterDetail', JSON.stringify($scope.examChapterModel));

        if ($scope.setExamArrayModal['start_time']) {
            $scope.setExamArrayModal['start_time'] = $scope.setExamArrayModal.start_time ? new Date($scope.setExamArrayModal.start_time) : 0
        }
        resetExamDetail()
    };

    function getExamDataFromLocalStorage(){
        if(localStorage.getItem('currentExamDetail')){
            $scope.setExamArrayModal = JSON.parse(localStorage.getItem('currentExamDetail'));
            if($scope.setExamArrayModal['start_time']){
                $scope.setExamArrayModal['start_time'] = $scope.setExamArrayModal.start_time ? new Date($scope.setExamArrayModal.start_time) : 0
            }
            if ($scope.setExamArrayModal['classes'] && $scope.setExamArrayModal['classes'].length > 0) {
                for (var i = 0; i < $scope.setExamArrayModal['classes'].length; i++) {
                    $scope.selectedClassIds.push({
                        '_id': $scope.setExamArrayModal['classes'][i]
                    })
                }
            }
        }
        if(localStorage.getItem('currentExamQuestionDetail')){
            $scope.questionList = JSON.parse(localStorage.getItem('currentExamQuestionDetail'));
            $scope.getQuestionDetailsModal['subject_name'] = $scope.questionList[0]['subject_name'];
            $scope.getQuestionDetailsModal['subject_id'] = $scope.questionList[0]['subject_id'];
        }
        if(localStorage.getItem('currentExamChapterDetail')){
            $scope.examChapterModel = JSON.parse(localStorage.getItem('currentExamChapterDetail'));
        }
        $rootScope.mypageloading = false;
    };

    $scope.cancelShowPreviewBeforeSetExamFunction = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.showSetExamPreviewModal = false;
    };

    $scope.showPreviewBeforeSetExamFunction = function () {
        FlashService.Error('');
        FlashService.Success('');

        if ($scope.questionList && $scope.questionList.length > 0) {
            $scope.setExamArrayModal['classes'] =
                $scope.selectedClassIds.map(function (item) { return item["_id"]; });
        }
        if ($scope.questionList.length == 0 || $scope.questionList.length < 0) {
            FlashService.Error('Please select question.');
            return false
        }
        if ($scope.setExamArrayModal.name == undefined || $scope.setExamArrayModal.name == '') {
            FlashService.Error('Please enter exam name.');
            return false
        }
        if ($scope.setExamArrayModal.is_scheduled == true) {
            if ($scope.setExamArrayModal.start_time == undefined ||
                $scope.setExamArrayModal.start_time <= 0 ||
                $scope.setExamArrayModal.start_time == '') {
                FlashService.Error('Please check start time.');
                return false
            }
            if ($scope.setExamArrayModal.total_time == undefined ||
                $scope.setExamArrayModal.total_time <= 0 ||
                $scope.setExamArrayModal.total_time == '') {
                FlashService.Error('Please check total time.');
                return false
            }
            if ($scope.setExamArrayModal.start_time_buffer == undefined ||
                $scope.setExamArrayModal.start_time_buffer <= 0 ||
                $scope.setExamArrayModal.start_time == '') {
                FlashService.Error('Please check allow late time.');
                return false
            }

        }

        if ($scope.setExamArrayModal.total_marks == 0 || $scope.setExamArrayModal.total_marks < 0) {
            FlashService.Error('Please check total marks.');
            return false
        }

        if ($scope.questionList[0].subject_id == undefined || $scope.questionList[0].subject_id == '') {
            FlashService.Error('Please select subject');
            return false
        }

        if ($scope.selectedClassIds.length == 0) {
            FlashService.Error('Please select atleast one class for which this question is suitable');
            return false
        }
        $scope.showSetExamPreviewModal = true;
    };

    $scope.setOrUpdateExam = function () {
        $scope.examSetErrorMessage = '';
        FlashService.Error('');
        FlashService.Success('');
        var payLoad = {
            "exam_id": $scope.setExamArrayModal.exam_id,
            "name": $scope.setExamArrayModal.name,
            "is_scheduled": $scope.setExamArrayModal.is_scheduled,
            "instructions": $scope.setExamArrayModal.instructions,
            "total_marks": $scope.setExamArrayModal.total_marks,
            'classes': $scope.setExamArrayModal.classes,
            "is_online": $scope.setExamArrayModal.is_online,
            "questions": [],
            "syllabus": $scope.setExamArrayModal.syllabus,
            "chapter_id": []
        }
        if ($scope.setExamArrayModal.is_scheduled == true) {
            payLoad['total_time'] = $scope.setExamArrayModal.total_time
            payLoad['start_time'] = $scope.setExamArrayModal.start_time.getTime(),
                payLoad['start_time_buffer'] = $scope.setExamArrayModal.start_time_buffer
            payLoad['end_time_buffer'] = $scope.setExamArrayModal.end_time_buffer
        }
        if($scope.examChapterModel.is_exam_chapter_assign && $scope.examChapterModel.newExamChapterList && 
            $scope.examChapterModel.newExamChapterList.length > 0){
                for(var i=0; i<$scope.examChapterModel.newExamChapterList.length; i++){
                    payLoad['chapter_id'].push($scope.examChapterModel.newExamChapterList[i]['_id']);
            }
        }
        $rootScope.mypageloading = true;
        $scope.questionList.forEach(function (v) { delete v.key });
        questionIdList = []
        for (var i = 0; i < $scope.questionList.length; i++) {
            questionIdList.push({
                '_id': $scope.questionList[i]['_id'],
                'marks': parseFloat($scope.questionList[i]['marks'])
            });
        }
        payLoad['questions'] = questionIdList
        payLoad['total_question'] = questionIdList.length
        console.log(payLoad)
        if (!payLoad['exam_id']) {
            examServices.addExamDetails(payLoad, function (response) {
                console.log(response)
                if (response.success == true) {
                    $scope.showSetExamPreviewModal = false;
                    $scope.setExamQuestionsModal = false;
                    $rootScope.mypageloading = false;
                    FlashService.Success('Exam added successfully');
                    localStorage.removeItem('currentExamDetail');
                    localStorage.removeItem('currentExamQuestionDetail');
                    localStorage.removeItem('currentExamChapterDetail')
                    $location.path('/exam');
                }
                else {
                    console.log(result)
                    $scope.examSetErrorMessage = result['data']['message'];
                    console.log('something went wrong in set exam paper');
                    $scope.cancelShowPreviewBeforeSetExamFunction();
                }
            });
        }
        else {
            examServices.updateExamDetails(payLoad, function (response) {
                console.log(response)
                if (response.success == true) {
                    $scope.showSetExamPreviewModal = false;
                    $scope.setExamQuestionsModal = false;
                    $rootScope.mypageloading = false;
                    localStorage.removeItem('currentExamDetail');
                    localStorage.removeItem('currentExamQuestionDetail');
                    localStorage.removeItem('currentExamChapterDetail')
                    FlashService.Success('Exam updated successfully');
                    $location.path('/exam');
                } else {
                    console.log(result)
                    $scope.examSetErrorMessage = result['data']['message'];
                    console.log('something went wrong in updated exam paper');
                    $scope.cancelShowPreviewBeforeSetExamFunction();
                }
            });
        }
    }

    $scope.printContent = function(ElementID) {
        var printcontent = document.getElementById(ElementID).innerHTML;
        var popupWin = window.open('', '_blank', 'width=400,height=300,size: landscape');
        popupWin.document.open();
        popupWin.document.write('<html><head><link href="common/CSS/zuwagon.css" rel="stylesheet" /> <link href="../../assets/css/bootstrap.css" rel="stylesheet"></head><body onload="window.print()">' + printcontent + '</body></html>');
        popupWin.document.close();
        $scope.isPrint = false
        $scope.hideExamAnswer = false;
    }

    $scope.examPreviewExport = function (isExamAnswerHide) {
        $scope.hideExamAnswer = isExamAnswerHide;
        // var options = {
        //     filename: $scope.setExamArrayModal.exam_name + 'Details.pdf',
        //     jsPDF:  { unit: 'mm', format: 'a4', orientation: 'portrait' },
        //     image: {type: 'jpg'},
        //     html2canvas:  { scale: 2, logging: true, dpi: 300, letterRendering: true, allowTaint : false, useCORS: true},
        // };
        // var element = document.getElementById('examPreview');
        // var exporter = new html2pdf(element, options);
        // exporter.getPdf(false).then((pdf) => {
        //     $scope.hideExamAnswer = isExamAnswerHide;
        //     pdf.save();
        //     $scope.hideExamAnswer = false;
        // });
        // $scope.hideExamAnswer = false;

        // kendo.drawing.drawDOM($("#examPreview")).then(function (group) {
        //     kendo.drawing.pdf.saveAs(group, $scope.setExamArrayModal.name + 'Details.pdf');
        //     $scope.hideExamAnswer = false;
        // });
        $scope.isPrint = true;
        if($scope.isPrint){
            $timeout(function(){ $scope.printContent('examPreview');}, 1000);
        }

    };

    if($routeParams.ExamID){
        $scope.currentExamID = ($routeParams.ExamID).toString();
        $scope.showSetExamPreviewModal = false;
        $scope.updateSetExamFunction($scope.currentExamID)
    }
    else if ($routeParams.PreviewExamID) {
        var PreviewExamID = ($routeParams.PreviewExamID).toString();
        $scope.setExamQuestionsModal = false;
        $scope.getExamPreviewFunction(PreviewExamID);
    }
    else if (window.location.href.includes('/exam/set')) {
        $scope.showSetExamPreviewModal = false;
        $scope.setExamQuestionsModal = true;
        getExamDataFromLocalStorage()
    }
    else {
        getExamDataFromLocalStorage()
    }
});