app.controller('examController', function ($rootScope, $location, HandShakeService, FlashService, teacherServices, examServices, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $scope.timeInMin = UtilService.timeInMin;
    $scope.currentUserDetail = JSON.parse(localStorage.getItem("currentUserDetail"));
    $rootScope.loginUserType = JSON.parse(localStorage.getItem("currentUserDetail"));
    $scope.profileInfo = angular.fromJson($sessionStorage.profileInfo);
    $rootScope.mypageloading = true;
    $scope.examId = "";
    $scope.classId = "";
    $scope.showAddExam = false;
    $scope.Information = false;
    $scope.is_declare = false;
    $scope.checkuncheck = false;
    $scope.studentList = [];
    $scope.totmaxmark = [];
    $scope.subjectList = [];
    $scope.showeditMarksModal = false;
    $scope.selctstudentsMarks = [];
    $scope.chkall = false;
    $scope.classList = [];
    $scope.classSelect = "";
    $scope.examSelect = ""
    $scope.classHash = [];
    $scope.modelType = "Add";
    $scope.searchExam = "";
    $scope.searchQuestion = ""
    $scope.generateResult = false;
    $scope.getData = [];
    $scope.examClassData = {};
    $scope.currentExamdata = {};
    // var html2canvas;
    var examList_hash = {};
    var class_hash = {};
    $scope.classNamesArray = [];
    $scope.setExamName = {
        name: '',
        results_declared: '',
        time: '',
        startdate: '',
        enddate: ''
    };

    FlashService.Error('');
    FlashService.Success('');
    $rootScope.mypageloading = false;

    $scope.showViewExamModal = false;

    $scope.addExams = {
        examName: "",
        addExamClass: [],
        startDate: "",
        endDate: ""
    }
    $scope.isSubmit = false;

    $scope.questionList = [];
    $scope.setExamArrayModal = {
        "exam_id": "",
        "exam_name": "",
        "is_scheduled": true,
        "instructions": "",
        "total_time": 0,
        "total_marks": 0,
        "is_online": true,
        "start_time": "",
        "questions": [],
        "syllabus": "",
        "start_time_buffer": 0,
        "end_time_buffer": 10
    }

    $scope.checkModel = false;
    $scope.showSetExamPreviewModal = false;
    $scope.setExamQuestionsModal = false;

    $scope.hideExamAnswer = false
    $scope.showQuestionModalBox = false;
    $scope.selectedClassIds = [];

    $scope.classDetails = [];
    $scope.classes = [];
    var classDetails_hash = {};
    var teacherName_hash = {};

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
    $scope.currentStudentDetail = {}
    $scope.isPrintStudentAnsweSheet = false;
    $scope.teacherName_hash = {};
    $scope.examTypeSelectionModel = false;
    $scope.currentSelectedExamTypeData = {
        isOnlineExam:"true"
    }
    $scope.isDisplayResultGradeWise = {'is_checked': false};
    $scope.isExamResultCombine = {'is_checked': false, 'examList': []};
    $scope.offlineExamList = [];
    $scope.offlineExamDataObj = {};
    $scope.currentOfflineExamData = {};

    $scope.getTeacherList = function () {
        $rootScope.mypageloading = true;
        teacherServices.getTeacherList(function (response) {
            if (response.success == true) {
                if (response.data && response.data.length > 0) {
                    var teacherList = response.data;
                    for (var i = 0; i < teacherList.length; i++) {
                        $scope.teacherName_hash[teacherList[i]['teacher_id']] = teacherList[i].name
                        teacherName_hash[teacherList[i]['teacher_id']] = teacherList[i].name
                    }
                }
            }
        })
    };
    
    if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
        $scope.getTeacherList();
    }

    $scope.loadExamList = function () {
        $scope.offlineExamList = [];
        $scope.isExamResultCombine = {'is_checked': false, 'examList': []};
        examServices.getExamList(function (response) {
            if (response.success == true) {
                $scope.examList = response.data;
                angular.forEach($scope.examList, function (obj) {
                    examList_hash[obj._id] = obj;
                    if ($scope.examId != null || $scope.examId != "" || $scope.examId != undefined) {
                        if (obj._id == $scope.examId) {
                            $scope.examDetails = obj;
                            console.log("Exam Object : ", obj);
                        }
                    }
                    if('is_online' in obj && obj['is_online'] == false){
                        $scope.offlineExamList.push({
                            '_id':obj['_id'],
                            'name': obj['name']
                        })
                        $scope.offlineExamDataObj[obj._id] = obj['name'];
                    }
                })
                console.log($scope.offlineExamList)
                $scope.getClasses();
            } else {
                $scope.examList = [];
            }
        })
    }
    $scope.loadExamList();

    $scope.backtoExam = function () {
        $scope.examId = '';
        $scope.classId = '';
        $scope.is_declare = false;
        $scope.studentResult = [];
    }
    $scope.getExamDetails = function (ex) {
        FlashService.Error('');
        FlashService.Success('');
        if (ex.is_approved == false) {
            alert("This Exam has not been approved by admin");
        } else {
            $scope.setExamArrayModal.exam_id = ex._id;
            $scope.examDetails = ex;
            $scope.classNamesArray = [];
            $scope.setExamName = {
                name: '',
                results_declared: '',
                time: '',
                startdate: '',
                enddate: ''
            };
            angular.forEach($scope.examList, function (obj) {
                if (obj._id == ex._id) {
                    $scope.setExamName.name = examList_hash[obj._id].name;
                    $scope.setExamName.results_declared = examList_hash[obj._id].results_declared;
                    $scope.setExamName.time = examList_hash[obj._id].time;
                    $scope.setExamName.startdate = examList_hash[obj._id].startdate;
                    $scope.setExamName.enddate = examList_hash[obj._id].enddate;
                    if(examList_hash[obj._id].previous_exam_id){
                        $scope.setExamName.previous_exam_id = examList_hash[obj._id].previous_exam_id;
                    }
                }
            })
            angular.forEach(ex.classes, function (obj) {
                if (class_hash[obj]) {
                    $scope.classNamesArray.push(class_hash[obj])
                }
            })
            $scope.showViewExamModal = true;
        }
    }
    $scope.selectedExam = function (examId) {
        $scope.examId = examId;
        $scope.classSelect = '';
        $scope.searchExam = "";
        $scope.getClasses();

    }

    $scope.selectedclass = function (classId) {
        $scope.isDisplayResultGradeWise['is_checked'] = false;
        $scope.studentList = [];
        $scope.classDetail = classId;
        $scope.classId = classId._id;
        $scope.examId = $scope.examDetails._id;
        $scope.classname = classId.name;
        $scope.searchExam = "";
        $scope.classexamResults = [];
        if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
            getExamresultclasswise().then(function (data) {
                for (var index = 0; index < data.length; index++) {
                    $scope.classexamResults.push(data[index]);
                }
                if($scope.classDetail && 'type' in $scope.classDetail && $scope.classDetail['type'] == "COURSE"){
                    $rootScope.mypageloading = true;
                    var requestHandle = HttpService.HttpGetData(
                        $rootScope.serverURL + '/education/courseStudentList/' + $scope.classDetail._id);
                    requestHandle.then(function (response) {
                        if (response.success == true) {
                            angular.forEach(response['data']['studentList'], function (studentObj) {
                                var studentData = {
                                    '_id':studentObj['user_id'],
                                    rollno:"-",
                                    rfid:"-",
                                    name:studentObj['userInfo']['name'],
                                    fathername:"-",
                                    calculatedResult:{
                                        result_status: "-",
                                        percentage:"-",
                                        total:0,
                                        maxtot:0
                                    },
                                    marks:[],
                                    result:{},
                                    grade_id: $scope.classDetail._id
                                    
                                }
                                $scope.studentList.push(studentData)
                            });
                            console.log($scope.studentList);
                            $rootScope.mypageloading = false;
                            if ($scope.examDetails.is_online == true) {
                                $scope.getOnlineExamDetails($scope.examDetails._id, classId._id);
                            }
                            else {
                                $scope.getResult();
                            }
                        }
                        else{
                            console.log(response)
                            $rootScope.mypageloading = false;
                        }
                    })     
                }
                else{
                    HandShakeService.getStudentInfo(classId._id).then(function (result) {
                        $scope.studentList = result;
                        if ($scope.examDetails.is_online == true) {
                            $scope.getOnlineExamDetails($scope.examDetails._id, classId._id);
                        }
                        else {
                            $scope.getResult();
                        }
                    }); 
                }
            });
        }
        else{
            HandShakeService.getStudentInfo(classId._id).then(function (result) {
                $scope.studentList = result;
                if ($scope.examDetails.is_online == true) {
                    $scope.getOnlineExamDetails($scope.examDetails._id, classId._id);
                }
                else {
                    $scope.getResult();
                }
            });
        }
    }

    function getExamresultclasswise() {
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + "/customer/result/getresult?class_id=" +
            $scope.classId + "&exam_id=" + $scope.examId);
        return requestHandle.then(function (resultsdata) {
            if (resultsdata.success)
                return resultsdata.data.result_list;
        })
    }
    /*-------------- Online Exam-----------------*/

    $scope.getOnlineExamDetails = function (examId, classId) {
        // $scope.examDetails
        $scope.getExamPreviewFunction($scope.examDetails, false, false);
        examServices.getStudentsExamAnswerSheet(examId, classId, function (result) {
            if (result.success) {
                $scope.studentOnlineExamResult = [];
                $scope.totmaxmark = [];
                $scope.subjectList = [];
                $scope.totmaxmark.push($scope.examDetails.total_marks);
                $scope.subjectList.push($scope.examDetails.name);
                $scope.currentExamQuestion = result.data.exam_question;
                var getReponse = result.data.submitted_exam_list;
                if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'TEACHER') {
                    $scope.studentList = result.data.submitted_exam_list;
                }
                angular.forEach($scope.studentList, function (studentObject) {
                    studentObject.marks = [];
                    studentObject.result = {};
                    studentObject.your_ans;
                    studentObject.checked;
                    if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
                        angular.forEach(result.data.submitted_exam_list, function (exam) {
                            if (exam.student_id == studentObject._id) {
                                studentObject.your_ans = exam;
                                console.log("Log : ", exam.total_marks_obtained);
                                studentObject.marks.push(exam.total_marks_obtained ? exam.total_marks_obtained : "0");
                                if (exam.is_eligible == 1)
                                    studentObject.checked = true;
                                else if (exam.is_eligible == 0)
                                    studentObject.checked = false;
                            }
                        })
                        calculateStudentResult(studentObject)
                        angular.forEach($scope.classexamResults, function (resultsdata) {
                            if (resultsdata.student_id == studentObject._id) {
                                studentObject.result = resultsdata;
                            }
                        })
                    }
                    else{
                        studentObject.your_ans = studentObject;
                        studentObject.marks.push(studentObject.total_marks_obtained ? studentObject.total_marks_obtained : "0");
                        if (studentObject.is_eligible == 1)
                            studentObject.checked = true;
                        else if (studentObject.is_eligible == 0)
                            studentObject.checked = false;
                        calculateStudentResult(studentObject)
                    }
                    
                })
                $scope.showViewExamModal = false;
            }
        });
    }

    $scope.checkall = function (checked) {
        if (checked == false) {
            angular.forEach($scope.studentList, function (studentObject) {
                if (studentObject.your_ans != undefined) {
                    if (studentObject.your_ans.is_eligible == 1)
                        studentObject.checked = false;
                }
                else if (!$scope.examDetails.is_online) {
                    studentObject.checked = false;
                }
            })
        } else {
            angular.forEach($scope.studentList, function (studentObject) {
                if (studentObject.your_ans != undefined) {
                    if (studentObject.your_ans.is_eligible == 1)
                        studentObject.checked = true;
                }
                else if (!$scope.examDetails.is_online) {
                    studentObject.checked = true;
                }
            })
        }
    }

    $scope.openAnswersheet = function (studentanswersheet, is_open) {
        if('student' in studentanswersheet && $scope.currentUserDetail['type'] == 'TEACHER'){
            $scope.currentStudentDetail = {
                'name': studentanswersheet['student']['name'],
                'rollno': studentanswersheet['student']['rollno']
            }
        }
        else{
            $scope.currentStudentDetail = {
                'name': studentanswersheet['name'],
                'rollno': studentanswersheet['rollno']
            }
        }
        $scope.studentonlieresult = $scope.currentExamQuestion;
        $scope.examsession_id = studentanswersheet.your_ans._id;
        $scope.studentexamobject = studentanswersheet;
        angular.forEach($scope.studentonlieresult, function (que) {
            que.your_Answer;
            que.your_marks;
            angular.forEach(studentanswersheet.your_ans.questions, function (yourans) {
                if (yourans._id == que._id) {
                    que.your_Answer = yourans.answer;
                    que.your_marks = yourans.mark_obtained;
                }
            })
        });
        $scope.studentmarksheet = is_open;
    }

    $scope.changemarksobtaind = function (marksobtained) {
        if (marksobtained.your_marks > marksobtained.marks) {
            marksobtained.your_marks = 0;
            alert("Please Enter Valid Marks")
        }
    }

    $scope.updateSession = function (ExamsData) {
        var total_marks_obtained = 0;
        var questions = [];
        for (var index = 0; index < ExamsData.length; index++) {
            if (ExamsData[index].your_marks == undefined)
                total_marks_obtained += Number(0);
            else
                total_marks_obtained += Number(ExamsData[index].your_marks);

            if (ExamsData[index].options.length == 0) {
                if (ExamsData[index].your_Answer == undefined) {
                    ExamsData[index].your_Answer = " ";
                    ExamsData[index].options.push({ 'answer': ExamsData[index].your_Answer });
                }
                else {
                    ExamsData[index].options.push({ 'answer': ExamsData[index].your_Answer[0] });
                }
            }
            var data = {
                "_id": ExamsData[index]._id,
                "options": ExamsData[index].options,
                "answer": ExamsData[index].your_Answer ? ExamsData[index].your_Answer : null,
                "mark_obtained": ExamsData[index].your_marks ? ExamsData[index].your_marks : 0
            }
            questions.push(data);
        }
        $scope.studentexamobject.marks = [total_marks_obtained];
        console.log("Total Marks : ", total_marks_obtained)
        var payLoad = {
            "questions": questions,
            "examsession_id": $scope.examsession_id,
            "total_marks_obtained": total_marks_obtained
        }
        console.log("Update Session : ", payLoad);
        if (payLoad.questions.length != 0 || payLoad != null) {
            examServices.updateExamSession(payLoad, function (result) {
                if (result.success) {
                    $rootScope.mypageloading = false;
                    if ($scope.studentexamobject.result._id != null || $scope.studentexamobject.result._id != undefined) {
                        $scope.addresult($scope.studentexamobject)
                            .then(function (data) {
                                if ($scope.studentexamobject.result.is_declare == true)
                                    $scope.multipelStudentDeclare($scope.studentexamobject);
                                else
                                    $scope.selectedclass($scope.classDetail);
                            })
                    } else {
                        $scope.selectedclass($scope.classDetail);
                    }
                }
            })
            alert("Marks Updated");
            $scope.studentmarksheet = false;
        }
    }

    $scope.resetStudentMarks = function (studentlist) {
        angular.forEach(studentlist, function (studentobj) {
            if (studentobj.marks.length != 0) {
                console.log("Reset Student Marks : ", studentobj);
                var total_marks_obtained = 0;
                var questions = [];
                var ExamsData = studentobj.your_ans.questions;
                for (var index = 0; index < ExamsData.length; index++) {
                    if (ExamsData[index].mark_obtained == undefined)
                        total_marks_obtained += Number(0);
                    else
                        total_marks_obtained += Number(ExamsData[index].mark_obtained);
                }
                var payLoad = {
                    "questions": studentobj.your_ans.questions,
                    "examsession_id": studentobj.your_ans._id,
                    "total_marks_obtained": total_marks_obtained,
                    'show_answersheet': true
                }
                studentobj.marks = [total_marks_obtained];
                console.log("Update Session : ", payLoad);
                if (payLoad.questions.length != 0 || payLoad != null) {
                    examServices.updateExamSession(payLoad, function (result) {
                        if (result.success) {
                            $rootScope.mypageloading = false;
                        }
                    })
                    $scope.studentmarksheet = false;
                }
            }
        })
        $scope.selectedclass($scope.classDetail);
    }
    /*------------- End Online Exam --------------*/

    $scope.yesDeclare = function () {
        $scope.is_declare = true;
    }

    $scope.noDeclare = function () {
        $scope.is_declare = false;
    }

    $scope.getClasses = function () {
        if ($scope.currentUserDetail['type'] == 'TEACHER') {
            var classData = JSON.parse(localStorage.getItem('classData'));
            angular.forEach(classData, function (value, key) {
                $scope.classList.push(value);
            });
            $scope.classes = $scope.classList;
            $scope.classDetails = $scope.classList;
            angular.forEach($scope.classList, function (obj) {
                class_hash[obj._id] = obj;
                classDetails_hash[obj._id] = obj;
                $scope.examClassData[obj._id] = obj.name
            })
        }
        else {
            HandShakeService.getGradeInfo().then(function (result) {
                $log.debug('HandShakeService getRouteInfo received');
                $scope.classList = result;
                $scope.classDetails = result;
                $scope.classes = result;
                angular.forEach($scope.classList, function (obj) {
                    class_hash[obj._id] = obj;
                    classDetails_hash[obj._id] = obj;
                    $scope.examClassData[obj._id] = obj.name
                })
            });
        }
    }

    $scope.getResults = function () {
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/customer/exam/result?class_id=' + $scope.classId
            + '&exam_id=' + $scope.examId);

        requestHandle.then(function (result) {
            if (result.success == true) {
                var getReponse = result.data;
                $scope.studentResult = [];
                console.sub("Get Response : ", getReponse);
                angular.forEach($scope.studentList, function (studentObject) {
                    if (getReponse[studentObject._id]) {
                        var studentResult = getReponse[studentObject._id];
                        var studentResultObj = {
                            studentInfo: studentObject,
                            resultList: []
                        };
                        console.sub("Get Response Studentresults : ", studentResult);
                        angular.forEach($scope.subjectList, function (sub) {
                            console.sub("Get Response Studentresults Sub : ", studentResult[sub]);
                            if (studentResult[sub]) {
                                studentResultObj.resultList.push(studentResult[sub])
                            } else {
                                studentResultObj.resultList.push('-')
                            }
                        });
                        $scope.studentResult.push(studentResultObj);
                    }
                })
            }
        })

    }

    $scope.getResult = function () {
        // $scope.getResults();
        $scope.showViewExamModal = false;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL +
            '/customer/exam/marks?class_id=' + $scope.classId + '&exam_id=' + $scope.examId);
        requestHandle.then(function (result) {
            if (result.success == true) {
                var studentmarks = result.data;
                $scope.studentmarks = result.data;
                $scope.totmaxmark = [];
                $scope.subjectList = [];
                for (var index = 0; index < studentmarks.length; index++) {
                    $scope.subjectList.push(studentmarks[index].subject);
                    $scope.totmaxmark.push(studentmarks[index].maxmarks);
                }
                if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'TEACHER') {
                    $scope.studentList = studentmarks;
                }
                angular.forEach($scope.studentList, function (studentObject) {
                    studentObject.marks = [];
                    studentObject.result = {};
                    studentObject.checked;
                    if($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
                        angular.forEach(studentmarks, function (subjectobj) {
                            studentObject.marks.push(subjectobj.students_marks[studentObject._id] ? subjectobj.students_marks[studentObject._id] : "-")
                        })
                        calculateStudentResult(studentObject)
                        angular.forEach($scope.classexamResults, function (resultsdata) {
                            if (resultsdata.student_id == studentObject._id) {
                                studentObject.result = resultsdata;
                                studentObject.checked = true;
                            }
                        })
                    }
                    else{
                        studentObject.marks.push(studentObject.students_marks[studentObject._id] ? studentObject.students_marks[studentObject._id] : "-")
                        calculateStudentResult(studentObject)
                    }
                })
            }
        })
    }

    function calculateStudentResult(studentObj) {
        var percentage = 0, totalmarks = 0, totalmax = 0, ispass = true;
        var resultdata;
        for (var index = 0; index < studentObj.marks.length; index++) {
            if(studentObj.marks[index] != "-"){
                if(studentObj.marks[index] == null || studentObj.marks[index] == undefined) {
                    totalmarks += 0;
                    ispass = false;
                }
                else {
                    totalmarks += Number(studentObj.marks[index]);
                }
                totalmax += $scope.totmaxmark[index];
                var pass = (((studentObj.marks[index]) * 100) / Number($scope.totmaxmark[index]));
                if (pass < 33 || (Number(studentObj.marks[index])) == 0 || studentObj.marks[index] == "-") {
                    ispass = false;
                }
            }
            
        }
        if (studentObj.marks.length == 0) {
            resultdata = {
                result_status: "-",
                percentage: "-",
                total: totalmarks,
                maxtot: totalmax
            }
        } else {
            if (!ispass) {
                resultdata = {
                    result_status: "Fail",
                    percentage: "-",
                    total: totalmarks,
                    maxtot: totalmax
                }
            }
            else {
                resultdata = {
                    result_status: "Pass",
                    percentage: ((totalmarks * 100) / totalmax).toFixed(2) + "%",
                    total: totalmarks,
                    maxtot: totalmax
                }
            }
        }
        studentObj.calculatedResult = resultdata;
    }

    $scope.openAddExam = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.modelType = "Add";
        $scope.addExams = {
            examName: "",
            addExamClass: [],
            startDate: "",
            endDate: ""
        }
        $scope.getClasses();
        $scope.showAddExam = true;
    }

    var vm = this;
    $scope.CheckAddExam = function () {
        $scope.isSubmit = true;
        if ($scope.addExams.examName == "") {
            return false;
        }
        if ($scope.addExams.addExamClass.length == 0) {
            return false;
        }
        FlashService.Error('');
        var to = [];
        var class_list = [];
        $scope.classHash = [];
        angular.forEach($scope.addExams.addExamClass, function (classId) {
            to.push($scope.classHash[classId._id]);
            class_list.push(classId._id);
        });
        vm.to = to.toString();
        vm.from = angular.fromJson($sessionStorage.profileInfo).name;
        vm.class_list = class_list;
        $scope.addExam();
    };

    $scope.addExam = function () {
        var data = {};
        var l_startDate = $scope.addExams.startDate
        var l_endDate = $scope.addExams.endDate
        if (l_startDate != '' && l_startDate != null && l_startDate != undefined) {
            l_startDate.toDateString()
        }
        else {
            l_startDate = '';
        }

        if (l_endDate != '' && l_endDate != null && l_endDate != undefined) {
            l_endDate.toDateString()
        }
        else {
            l_endDate = '';
        }
        var to = [];
        var class_list = [];
        $scope.classHash = [];

        angular.forEach($scope.addExams.addExamClass, function (classId) {
            to.push($scope.classHash[classId._id]);
            class_list.push(classId._id);
        });

        var data = {
            "name": $scope.addExams.examName,
            "is_online": false,
            "classes": class_list,
            "startdate": l_startDate,
            "enddate": l_endDate
        }

        if($scope.isExamResultCombine.is_checked == true && $scope.isExamResultCombine.examList && $scope.isExamResultCombine.examList.length > 0){
            data['previous_exam_id'] = $scope.isExamResultCombine.examList.map(function (item) { return item["_id"]; })
        }
        console.log(data)
        if('examID' in $scope.addExams && $scope.modelType  == 'Edit'){
            var data = $scope.currentOfflineExamData;
            data['exam_id'] = $scope.currentOfflineExamData['_id'];
            data['name'] = $scope.addExams.examName;
            data['classes'] = class_list;
            data['startdate'] = l_startDate;
            data['enddate'] = l_endDate
            data['previous_exam_id'] = $scope.isExamResultCombine.examList.map(function (item) { return item["_id"]; })
            examServices.updateExamDetails(data, function (response) {
                console.log(response)
                if (response.success == true) {
                    $scope.showAddExam = false;
                    $scope.isSubmit = false;
                    $scope.addExams = {
                        examName: "",
                        addExamClass: [],
                        startDate: "",
                        endDate: ""
                    }
                    $scope.currentOfflineExamData = {};
                    $scope.loadExamList();
                } else {
                    console.log(response)
                    FlashService.Error(response.data.message);
                }
            });
        }
        else{
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/education/exam/add-exam', data);
            requestHandle.then(function (result) {
                console.log(result)
                if (result.success == true) {
                    FlashService.Error(result.data.message);
                    if (result.data.result == '') {
    
                    } else {
                        $scope.showAddExam = false;
                        $scope.isSubmit = false;
                        $scope.addExams = {
                            examName: "",
                            addExamClass: [],
                            startDate: "",
                            endDate: ""
                        }
                        $scope.loadExamList();
                    }
    
                } 
                else{
                    FlashService.Error(result.data.message);
                }
            })
        }
    }

    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "Exam&Result.pdf");
        });
    }

    $scope.editRoute = function (Sub, $index) {
        $scope.showAddExam = false;
        $scope.showAddExam = true;

        $scope.getClasses();
        $scope.modelType = "Edit";
        $scope.addExams.examName = Sub.name;
        $scope.addExams.addExamClass = [];
        var class_list = [];
        angular.forEach(Sub.classes, function (item) {
            class_list.push({ _id: item })
        })
        $scope.addExams.addExamClass = class_list;
    }

    $scope.Modifymarks = function (studentResult) {
        // $rootScope.mypageloading = true;
        var marks = {
            result: []
        };
        for (var index = 0; index < studentResult.marks.length; index++) {
            var updatedata = {
                "result_id": $scope.studentmarks[index]._id,
                "student_id": studentResult._id,
                "marks": studentResult.marks[index]
            }
            marks.result.push(updatedata);
        }
        if (marks.result.length != 0 || marks != null) {
            var requestHandle = HttpService.HttpUpdateData(
                $rootScope.serverURL + "/customer/exam/result", marks);
            requestHandle.then(function (resultRsponse) {
                if (resultRsponse.success) {
                    $rootScope.mypageloading = false;
                    if (studentResult.result._id != null || studentResult.result._id != undefined) {
                        $scope.addresult(studentResult)
                            .then(function (data) {
                                if (studentResult.result.is_declare == true)
                                    $scope.multipelStudentDeclare(studentResult);
                                else
                                    $scope.selectedclass($scope.classDetail);
                            })
                    } else {
                        $scope.selectedclass($scope.classDetail);
                    }
                    alert("Marks Updated");
                    $scope.showeditMarksModal = false;
                }
            })
        }
    }

    $scope.multipelStudentDeclare = function (data) {
        if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
            $rootScope.mypageloading = true;
            var payLoad = {
                "exam_id": $scope.examId,
                "result_ids": []
            };
            angular.forEach(data, function (checked) {
                if (checked.checked) {
                    if (checked.result._id != undefined) {
                        payLoad.result_ids.push(checked.result._id);
                    }
                }
            })
            if (payLoad.result_ids.length > 0 || payLoad.result_ids == undefined) {
                var requestHandle = HttpService.HttpUpdateData(
                    $rootScope.serverURL + "/customer/result/declare-result", payLoad);
                requestHandle.then(function (result) {
                    if (result.success) {
                        alert("Result declared successfully");
                        $scope.loadExamList();
                        $scope.selectedclass($scope.classDetail);
                        $scope.is_declare = false;
                        $rootScope.mypageloading = false;
                    }
                })
            }
            else {
                alert("Please Select Students");
                $rootScope.mypageloading = false;
            }
        }
    }

    $scope.results = [];
    $scope.editMarks = function (resultlist, isopen) {
        $scope.results = [];
        $scope.selctstudentsMarks = resultlist;
        $scope.showeditMarksModal = isopen;
    }

    $scope.changevalue = function (resultlist, index) {
        if (resultlist == null || resultlist == undefined || resultlist == "" || resultlist.marks[index] > $scope.totmaxmark[index]) {
            alert("Please Enter Valid Vlaue")
            resultlist.marks[index] = "0";
        } else {
            calculateStudentResult(resultlist);
        }
    }

    $scope.addresult = function (studentinfo) {
        if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
            var marks = [];
            for (var i = 0; i < $scope.subjectList.length; i++) {
                var singelmarks = {
                    "subject": $scope.subjectList[i],
                    "score": studentinfo.marks[i],
                    "max": $scope.totmaxmark[i]
                }
                if($scope.isDisplayResultGradeWise['is_checked'] == true){
                    if(studentinfo.marks[i] != undefined && $scope.totmaxmark[i] != undefined){
                        var percentage = (parseFloat(studentinfo.marks[i]) * 100) / parseFloat(($scope.totmaxmark[i]))
                        var grade = $scope.getGradeFromMarks(percentage)
                        if(grade){
                            singelmarks["score"] = grade
                        }
                    }
                    else{
                        singelmarks["score"] = "-"
                    }
                    singelmarks["max"] = "A+++"
                }
                if(singelmarks["score"] != '-' && singelmarks["score"] != undefined && singelmarks["score"] != ''){
                    marks.push(singelmarks);
                }
            }
            var payLoad = {
                "student_id": studentinfo._id,
                "student_name": studentinfo.name,
                "exam_id": $scope.examId,
                "exam_name": $scope.examDetails.name,
                "class_id": studentinfo.grade_id,
                "marks": marks,
                "total": studentinfo.calculatedResult.total,
                "score": studentinfo.calculatedResult.percentage,
                "max_value": studentinfo.calculatedResult.maxtot,
                "result_type": "precent",
                "result_status": studentinfo.calculatedResult.result_status
            }
            if($scope.isDisplayResultGradeWise['is_checked'] == true){
                if(studentinfo.calculatedResult.maxtot != undefined &&  studentinfo.calculatedResult.percentage != undefined){
                    if(studentinfo.calculatedResult.percentage){
                        var removePercentageSign = studentinfo.calculatedResult.percentage.replace("%", "")
                        var percentage = parseFloat(removePercentageSign);
                        var grade = $scope.getGradeFromMarks(percentage)
                        if(grade){
                            payLoad["score"] = grade
                        }
                    }
                }
            }
            console.log(payLoad)
            if(payLoad['marks'] && payLoad['marks'].length > 0){
                var requestHandle = HttpService.HttpPostData(
                    $rootScope.serverURL + "/customer/result/addresult", payLoad);
                return requestHandle.then(function (result) {
                    if (result.success) {
                        $rootScope.mypageloading = false;
                        $scope.selectedclass($scope.classDetail);
                        $scope.showeditMarksModal = false;
                        $scope.studentmarksheet = false;
                        return result;
                    }
                })
            }
            else{
                $rootScope.mypageloading = false;
                $scope.showeditMarksModal = false;
                $scope.studentmarksheet = false;
            }

            
            // return  true;
        }

    }

    $scope.checkResultsforClass = function (classexamResults) {
        if (classexamResults.length == 0) {
            $scope.addmulresults($scope.studentList)
        } else {
            $scope.information_MSG =
                "Result Already genrated for some Students, this Opertaion will update their Result.";
            $scope.Information = true;
        }
    }

    $scope.information_yes = function () {
        $scope.addmulresults($scope.studentList)
    }

    $scope.information_No = function () {
        $scope.Information = false;
        $scope.information_MSG = "";
    }

    $scope.addmulresults = function (result) {
        $scope.Information = false;
        $scope.information_MSG = "";
        // $rootScope.mypageloading = true;
        var payLoad = [];

        angular.forEach(result, function (studentreults) {
            var marks = [];
            for (var i = 0; i < $scope.subjectList.length; i++) {
                var singelmarks = {
                    "subject": $scope.subjectList[i],
                    "score": studentreults.marks[i],
                    "max": $scope.totmaxmark[i]
                }
                if($scope.isDisplayResultGradeWise['is_checked'] == true){
                    if(studentreults.marks[i] != undefined && $scope.totmaxmark[i] != undefined){
                        var percentage = (parseFloat(studentreults.marks[i]) * 100) / parseFloat(($scope.totmaxmark[i]))
                        var grade = $scope.getGradeFromMarks(percentage)
                        if(grade){
                            singelmarks["score"] = grade
                        }
                    }
                    else{
                        singelmarks["score"] = "-"
                    }
                    singelmarks["max"] = "A+++"
                }
                if(singelmarks["score"] != '-' && singelmarks["score"] != undefined && singelmarks["score"] != ''){
                    marks.push(singelmarks);
                }
            }
            var data = {
                "student_id": studentreults._id,
                "student_name": studentreults.name,
                "exam_id": $scope.examId,
                "exam_name": $scope.examDetails.name,
                "class_id": studentreults.grade_id,
                "marks": marks,
                "total": studentreults.calculatedResult.total,
                "score": studentreults.calculatedResult.percentage,
                "max_value": studentreults.calculatedResult.maxtot,
                "result_type": "precent",
                "result_status": studentreults.calculatedResult.result_status
            }
            if($scope.isDisplayResultGradeWise['is_checked'] == true){
                if(studentreults.calculatedResult.maxtot != undefined &&  studentreults.calculatedResult.percentage != undefined){
                    if(studentreults.calculatedResult.percentage){
                        var removePercentageSign = studentreults.calculatedResult.percentage.replace("%", "")
                        var percentage = parseFloat(removePercentageSign);
                        var grade = $scope.getGradeFromMarks(percentage)
                        if(grade){
                            data["score"] = grade
                        }
                    }
                }
            }
            if(data['marks'] && data['marks'].length > 0){
                payLoad.push(data);
            }
            console.log(payLoad)
        });
        if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
            if (payLoad.length != 0 || payLoad != null) {
                var requestHandle = HttpService.HttpPostData(
                    $rootScope.serverURL + "/customer/result/addresults", payLoad);
                requestHandle.then(function (result) {
                    if (result.success) {
                        $rootScope.mypageloading = false;
                        $scope.selectedclass($scope.classDetail);
                        alert("Results generated successfully");
                    }
                })
            }
        }
    }

    $scope.resultView = function (result, isopen) {
        $scope.results = [];
        $scope.selctstudentsMarks = result;
        $scope.generateResult = isopen;
        $scope.totalMarks = 0;
    }

    $scope.resultDownload = function () {

        $rootScope.mypageloading = true;

        $scope.totalMarks = 0;
        if ($scope.selctstudentsMarks.length > 0) {
            $scope.getData = $scope.ResultInfo.result[0];

            if ($scope.getData && $scope.getData.English) {
                $scope.totalMarks = $scope.totalMarks + $scope.getData.English;
            }
            if ($scope.getData && $scope.getData.Hindi) {
                $scope.totalMarks = $scope.totalMarks + $scope.getData.Hindi;
            }
            if ($scope.getData && $scope.getData.Science) {
                $scope.totalMarks = $scope.totalMarks + $scope.getData.Science;
            }
        }
        $timeout(function () {
            // var red = kendo.parseColor("#ff0000");
            kendo.drawing.drawDOM($("#resultPrint")).then(function (group) {
                kendo.drawing.pdf.saveAs(group, $scope.selctstudentsMarks.name + ".pdf");
            });
            $rootScope.mypageloading = false;
        }, 2000);
    }

    $scope.AllDownload = function () {
        $scope.generateResult = true;
        $rootScope.mypageloading = true;
        angular.forEach($scope.studentResult, function (result) {
            $scope.totalMarks = 0;
            $scope.ResultInfo = result;
            if ($scope.ResultInfo.result.length > 0) {
                $scope.getData = $scope.ResultInfo.result[0];

                if ($scope.getData && $scope.getData.English) {
                    $scope.totalMarks = $scope.totalMarks + $scope.getData.English;
                }
                if ($scope.getData && $scope.getData.Hindi) {
                    $scope.totalMarks = $scope.totalMarks + $scope.getData.Hindi;
                }
                if ($scope.getData && $scope.getData.Science) {
                    $scope.totalMarks = $scope.totalMarks + $scope.getData.Science;
                }
            }
            $timeout(function () {
                kendo.drawing.drawDOM($("#resultPrint")).then(function (group) {
                    kendo.drawing.pdf.saveAs(group, result.studentInfo.name + ".pdf");
                });
                $rootScope.mypageloading = false;
                $scope.generateResult = false;
            }, 2000);

        })
    }

    $scope.updateExamFunction = function (ex) {
        localStorage.removeItem('currentExamDetail');
        localStorage.removeItem('currentExamQuestionDetail');
        localStorage.removeItem('currentExamChapterDetail')
        $location.path('/exam/update/' + ex._id);
    }

    $scope.openexampreview = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.showSetExamdataPreviewModal = true;
    }

    $scope.getExamPreviewFunction = function (ex, is_open, is_popup) {
        FlashService.Error('');
        FlashService.Success('');
        $scope.currentExamdata = ex;
        examServices.getExamDetail(ex._id, function (result) {
            if (result.success == true && result['data']['exam']) {
                console.log(result['data']['exam']);
                var examData = result['data']['exam'];
                $scope.setExamArrayModal = {
                    "exam_id": examData._id,
                    "exam_name": examData.name,
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
                if (examData['is_scheduled'] == false) {
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
                $scope.setExamQuestionsModal = is_open;
                $scope.showSetExamPreviewModal = is_open;
                $scope.showSetExamdataPreviewModal = is_popup;

            } else {
                FlashService.Error('');
            }

        })
    }

    $scope.showExamPreview = function (ex) {
        $location.path('/exam/preview/' + ex._id);
    }

    $scope.approveOrUnApproveExam = function (ex, is_approved) {
        FlashService.Error('');
        FlashService.Success('');
        if ($scope.currentUserDetail && $scope.currentUserDetail['type'] && $scope.currentUserDetail['type'] == 'ADMIN') {
            var payload = {
                'exam_id': ex._id,
                'is_approved': is_approved
            }
            var requestHandle =
                HttpService.HttpUpdateData($rootScope.serverURL + '/customer/exam/approve-disapprove', payload);
            requestHandle.then(function (result) {
                if (result.data) {
                    FlashService.Success(ex.name + ' ' + result.data.message);
                    $scope.loadExamList();
                } else {
                    console.log('something went wrong in approve exam');
                }
            });
        }
    }

    // Set APIs Functions
    $scope.closeFlashMessages = function () {
        FlashService.Error('');
        FlashService.Success('');
    }

    $scope.getOnlineExamChanges = function (data) {

        FlashService.Error('');
        FlashService.Success('');

        if (data == "true") {
            $scope.setExamArrayModal.is_online = true;
        }
        else if (data == "false") {
            $scope.setExamArrayModal.is_online = false;
        }
    }

    $scope.openNewAddExam = function () {
        localStorage.removeItem('currentExamDetail');
        localStorage.removeItem('currentExamQuestionDetail');
        localStorage.removeItem('currentExamChapterDetail')
        $location.path('/exam/set');
    };

    $scope.changeExamTypeSelection = function(isUpdateExam, currentExam){
        console.log(isUpdateExam)
        console.log(currentExam)
        if(isUpdateExam == true && currentExam) {
            $scope.currentOfflineExamData = currentExam;
            $scope.isExamResultCombine['is_checked'] = false;
            $scope.isExamResultCombine['examList'] = []
            if('previous_exam_id' in $scope.currentOfflineExamData && $scope.currentOfflineExamData['previous_exam_id'].length > 0){
                $scope.isExamResultCombine['is_checked'] = true;
                for(var i=0; i<$scope.currentOfflineExamData['previous_exam_id'].length; i++){
                    var currentExamID = $scope.currentOfflineExamData['previous_exam_id'][i]
                    $scope.isExamResultCombine['examList'].push({
                        '_id': currentExamID,
                        'name': $scope.offlineExamDataObj[currentExamID]
                    });
                }
            } 
            $scope.examTypeSelectionModel = false;
            $scope.modelType = "Edit";
            $scope.addExams = {
                'examID': $scope.currentOfflineExamData._id,
                'examName': $scope.currentOfflineExamData.name,
                'addExamClass': [],
                'startDate': $scope.currentOfflineExamData.startdate ? new Date( $scope.currentOfflineExamData.startdate) : "",
                'endDate': $scope.currentOfflineExamData.enddate ? new Date( $scope.currentOfflineExamData.enddate) : "",
            }
            if('classes' in $scope.currentOfflineExamData && $scope.currentOfflineExamData['classes'].length > 0){
                for(var i=0; i<$scope.currentOfflineExamData['classes'].length; i++){
                    var currentClassID = $scope.currentOfflineExamData['classes'][i]
                    $scope.addExams['addExamClass'].push({
                        '_id': currentClassID
                    });
                }
            } 
            console.log($scope.isExamResultCombine)
            console.log($scope.addExams)
            $scope.showAddExam = true;
        }
        else{
            if($scope.currentSelectedExamTypeData.isOnlineExam == "true"){
                $scope.examTypeSelectionModel = false;
                $timeout( function(){ $scope.openNewAddExam(); }, 1000);
            }
            else{
                $scope.isExamResultCombine = {'is_checked': false, 'examList': []};
                $scope.examTypeSelectionModel = false;
                $scope.modelType = "Add";
                $scope.addExams = {
                    examName: "",
                    addExamClass: [],
                    startDate: "",
                    endDate: ""
                }
                $scope.showAddExam = true;
            }
        }
        
    };

    $scope.openExamTypeSelectionModel = function(){
        $scope.examTypeSelectionModel = true;
        $scope.currentSelectedExamTypeData = {
            isOnlineExam:"true"
        }
    };

    $scope.printContent = function(ElementID) {
        var printcontent = document.getElementById(ElementID).innerHTML;
        var popupWin = window.open('', '_blank', 'width=400,height=300,size: landscape');
        popupWin.document.open();
        popupWin.document.write('<html><head><link href="common/CSS/zuwagon.css" rel="stylesheet" /> <link href="../../assets/css/bootstrap.css" rel="stylesheet"></head><body onload="window.print()">' + printcontent + '</body></html>');
        popupWin.document.close();
        $scope.isPrintStudentAnsweSheet = false
    }

    $scope.exportStudentAnswerSheet = function(ElementID){
        $scope.isPrintStudentAnsweSheet = true;
        if($scope.isPrintStudentAnsweSheet){
            $timeout(function(){ $scope.printContent(ElementID);}, 1000);
        }
        
    }

    $scope.download = function(){
        console.log($scope.examDetails)
        console.log($scope.studentList)
        function downloadCSV(studentResultDataList){
            var a = document.createElement("a");
            var json_pre = JSON.stringify(studentResultDataList);
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

        if($scope.studentList && $scope.studentList.length > 0){
            var studentResultDataList = []
            for(var i=0; i<$scope.studentList.length; i++){
                var data = {
                    'Student Name': '-',
                    'Roll No': '-',
                    'Average': '-',
                    'Result': '-',
                    'Eligible': 'No',
                    'Start Time': '',
                    'End Time': '',
                    'Result Declared': 'No',
                    'Remark': ''
                }
                if($scope.currentUserDetail['type'] == 'ADMIN'){
                    data['Student Name'] = $scope.studentList[i]['name']
                    data['Roll No'] = $scope.studentList[i]['rollno']
                }
                else if($scope.currentUserDetail['type'] == 'TEACHER'){
                    data['Student Name'] = $scope.studentList[i]['student']['name']
                    data['Roll No'] = $scope.studentList[i]['student']['rollno']
                }
                if($scope.subjectList && $scope.subjectList.length > 0){
                    for(var j=0; j<$scope.subjectList.length; j++){
                        var name = $scope.subjectList[j]
                        data[name] = '-'
                        if($scope.examDetails['is_online'] == true){
                            if($scope.studentList[i]['marks'][j]){
                                data[name] = $scope.studentList[i]['marks'][j]
                            }
                            else{
                                data[name] = '-'
                            }
                        }
                    } 
                }
                data['Average'] = $scope.studentList[i]['calculatedResult']['percentage'];
                data['Result'] = $scope.studentList[i]['calculatedResult']['result_status'];
                if($scope.examDetails['is_online'] == true && $scope.studentList[i]['your_ans']){
                    if($scope.studentList[i]['your_ans']['is_eligible'] == 1){
                        data['Eligible'] = 'Yes';
                    }
                    else{
                        data['Eligible'] = 'No';
                    }
                }
                if($scope.examDetails['is_online'] == true && $scope.studentList[i]['your_ans']){
                    data['Start Time'] = $scope.timeInMin($scope.studentList[i]['your_ans']['started_at']);
                    data['End Time'] = $scope.timeInMin($scope.studentList[i]['your_ans']['submit_time']);
                }
                if( $scope.studentList[i]['result']['is_declared']){
                    data['Result Declared'] = 'Yes';
                }
                else{
                    data['Result Declared'] = 'No';
                }
                studentResultDataList.push(data);
            }
            downloadCSV(studentResultDataList);
            
        }
        else{
            var studentResultDataList = [{
                'Student Name': '-',
                'Roll No': '-',
                'Average': '-',
                'Result': '-',
                'Eligible': 'No',
                'Start Time': '',
                'End Time': '',
                'Result Declared': 'No',
                'Remark': ''
            }]
            downloadCSV(studentResultDataList);
        }
    }


    $scope.clearExamSessionData = function(studentData){
        if(studentData && 'your_ans' in studentData){
            var requestHandle = 
            HttpService.HttpDeleteData($rootScope.serverURL + '/education/exam/deleteExamsession/' + studentData['your_ans']['_id']);
            requestHandle.then(function (result) {
                if (result.data) {
                    FlashService.Success("Session Data clear successfully");
                    $scope.selectedclass($scope.classDetail);
                } else {
                    console.log('something went wrong in session data clear');
                }
            });
        }
    }

    $scope.getGradeFromMarks = function(percentage){
        if(percentage && percentage != undefined){
            var removePercentageSign = String(percentage).replace("%", "")
            var mark = parseFloat(removePercentageSign);
            if(mark >= 80) { 
                return 'A+++'; 
            } 
            else if(mark < 80 && mark >= 60) {
                return 'A++';
            }
            else if(mark < 60 && mark >= 40) {
                return 'A+';
            }
            else if(mark < 39) {
                return 'A';
            }
            else{
                return '-';
            }
        }
    }

});