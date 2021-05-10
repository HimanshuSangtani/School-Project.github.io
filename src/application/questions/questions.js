app.controller('questionsController', function ($rootScope, $scope, FlashService, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

    $rootScope.showBackStrech = false;
    UtilService.setSidebar();

    $scope.example14settings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $rootScope.mypageloading = false;
    $scope.showQuestionModalBox = false;

    $scope.questionList = [];
    $scope.classDetails = [];
    $scope.studentList = [];
    $scope.existingResultList = [];
    $scope.classes = [];
    $scope.selectedClassIds = [];

    var student_hash = {};
    var classDetails_hash = {};
    var questions_hash = {};
    var subjectResult_hash = {};

    $scope.answer = "";
    $scope.selectedAnswers = [];

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
        "solution" : ""
    }

    FlashService.Error('');
    FlashService.Success('');

    $scope.showQuestionsModal = function () {

        FlashService.Error('');
        FlashService.Success('');
        $scope.selectedClassIds = [];

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
            "solution" : ""
        }
        $scope.showQuestionModalBox = true;
    }

    $scope.getSubjectChange = function (data) {
        $scope.getQuestionDetailsModal.subject_name = subjectResult_hash[data].name;
        $scope.getQuestionDetailsModal.subject_id = subjectResult_hash[data]._id;
        $scope.getQuestionDetailsModal.customer_id = subjectResult_hash[data].customer_id;
    }

    $scope.getClassChange = function (data) {
        $scope.getQuestionDetailsModal.grade_name = classDetails_hash[data].name;
    }

    $scope.getQuestionTypeChange = function (data) {
        $scope.getQuestionDetailsModal.type = data;
        if(data == 'SINGLE-SELECT' || data == 'MULTI-SELECT') {
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
    }

    $scope.getQuestionLevelChange = function (data) {
        $scope.getQuestionDetailsModal.level = data;
    }

    $scope.getQuestions = function () {

        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/question/list');
        requestHandle.then(function (result) {

            if (result.success == true) {
                $scope.questionList = result.data.data.question;
                console.log($scope.getQuestions);

                // angular.forEach($scope.getSmsReportsData, function (obj) {
                //     questions_hash[obj._id] = obj;
                // });

                $rootScope.mypageloading = false;
            } else {
                console.log('something went wrong in sms reports');
            }
        });
    }

    $scope.addQuestions = function () {



        FlashService.Error('');
        FlashService.Success('');

        
        $scope.getQuestionDetailsModal.answer = [];
        if($scope.getQuestionDetailsModal.type == 'MULTI-SELECT') {
            // $scope.getQuestionDetailsModal.answer = $scope.selectedAnswers;
        } else {
            $scope.getQuestionDetailsModal.answer.push($scope.answer.toString())
        }

        if ($scope.getQuestionDetailsModal.question == undefined || $scope.getQuestionDetailsModal.question == '') {
            FlashService.Error('Please enter question');
            return false
        }  else if ($scope.getQuestionDetailsModal.level == undefined || $scope.getQuestionDetailsModal.level == '') {
            FlashService.Error('Please set level');
            return false
        } else if ($scope.getQuestionDetailsModal.type == undefined || $scope.getQuestionDetailsModal.type == '') {
            FlashService.Error('Please set type');
            return false
        } else if ($scope.selectedClassIds.length == 0) {
            FlashService.Error('Please select atleast one class for which this question is suitable');
            return false
        } else if ($scope.getQuestionDetailsModal.subject_id == undefined || $scope.getQuestionDetailsModal.subject_id == '') {
            FlashService.Error('Please select subject');
            return false
        } else if ($scope.getQuestionDetailsModal.answer.length == 0) {
            FlashService.Error('Please select answer');
            return false
        } 
        var payLoad = {
            "question": $scope.getQuestionDetailsModal.question,
            "subject_id": $scope.getQuestionDetailsModal.subject_id? $scope.getQuestionDetailsModal.subject_id:"",
            "subject_name": $scope.getQuestionDetailsModal.subject_name?$scope.getQuestionDetailsModal.subject_name:"",
            "marks": $scope.getQuestionDetailsModal.marks?$scope.getQuestionDetailsModal.marks:0,
            "level": $scope.getQuestionDetailsModal.level,
            "answer": $scope.getQuestionDetailsModal.answer,
            "options": $scope.getQuestionDetailsModal.options,
            "type": $scope.getQuestionDetailsModal.type,
            "customer_id": $scope.getQuestionDetailsModal.customer_id,
            "grades":  $scope.selectedClassIds.map(function(item) { return item["_id"]; })
        }
        console.log(payLoad);
        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/question/add', payLoad);
        requestHandle.then(function (result) {

            if (result.success == true) {
                console.log(result);
                $scope.getQuestions();
                $scope.showQuestionModalBox = false;
                $rootScope.mypageloading = false;
            } else {
                console.log('something went wrong in add question request');
            }
        });
    }

    $scope.getResult = function () {

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject');
        requestHandle.then(function (result) {
            $scope.existingResultList = result.data;

            angular.forEach($scope.existingResultList, function (obj) {
                subjectResult_hash[obj._id] = obj;
            });

            console.log(result.data);
            $scope.getQuestions();
        })
    }

    $scope.getStudentsDetails = function () {

        HandShakeService.getAllStudentInfo().then(function (allStudentList) {
            $log.debug('HandShakeService existingStudentList received');

            $scope.studentList = allStudentList;

            angular.forEach(allStudentList, function (studentObj) {
                student_hash[studentObj._id] = studentObj;
            });

            $scope.getResult();
        });
    }


    $scope.getClassDetails = function () {
        $rootScope.mypageloading = true;
        HandShakeService.getGradeInfo().then(function (result) {

            $scope.classDetails = result;
            $scope.classes = result;

            angular.forEach(result, function (classObj) {
                classDetails_hash[classObj._id] = classObj;
            });

            $scope.getStudentsDetails();

        }, function (error) {
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    }

    $scope.getClassDetails();

    $scope.export = function () {
        if ($scope.getSmsReportsData.length) {
            kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
                kendo.drawing.pdf.saveAs(group, "SmsReports" + "-" + $scope.onDate + ".pdf");
            });
        } else {

        }
    }

});