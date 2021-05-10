app.controller('oldExamController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $scope.timeInMin = UtilService.timeInMin;
    $rootScope.showBackStrech = false;
    $scope.profileInfo = angular.fromJson($sessionStorage.profileInfo);

    $scope.showModal = false;
    $scope.testModal = false;
    $rootScope.mypageloading = true;
    $scope.examId = "";
    $scope.classId = "";
    $scope.showAddExam = false;
    $scope.Information = false;
    $scope.is_declare = false;
    $scope.checkuncheck = false;
    $scope.studentList = [];
    $scope.subjectList = [];
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
    var questionList_hash = {};

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

    $scope.$watch("setExamArrayModal.is_scheduled", function() {
        if($scope.setExamArrayModal.is_scheduled == false){
            $scope.setExamArrayModal['start_time_buffer'] = 0;
            $scope.setExamArrayModal['end_time_buffer'] = 0;
            $scope.setExamArrayModal['start_time'] = ""
            $scope.setExamArrayModal['total_time'] = 0
        }
        else{
            $scope.setExamArrayModal['end_time_buffer'] = 10;
        }
    });

    var queFirst = {};
    var queSecond = {};
    $scope.questionSelection = [];
    $scope.quesAfterSelection = [];
    $scope.checkModel = false;
    $scope.showSetExamPreviewModal = false;
    $scope.setExamQuestionsModal = false;
    $scope.ifDirectGoToExamPreview = false;


    // question section code
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
    $scope.showQuestionModalBox = false;
    $scope.existingResultList = [];
    $scope.selectedClassIds = [];
    var subjectResult_hash = {};
    var teacherName_hash = {};

    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: true,
        showUncheckAll: true,
    };

    $scope.example14settings = {
        smartButtonMaxItems: 5,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };
    $scope.classDetails = [];
    $scope.classes = [];
    var classDetails_hash = {};
    // $rootScope.newquestiocreatenpageloading = false;

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
    }

    $scope.deletePhoto = function (type, index) {
        if (type === 'local') {
            $scope.getQuestionDetailsModal.localPhotos.splice(index, 1);
        } else {
            $scope.getQuestionDetailsModal.photos.splice(index, 1);
        }
    }

    $scope.loadExamList = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/exam/');
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.examList = result.data;
                angular.forEach($scope.examList, function (obj) {
                    examList_hash[obj._id] = obj;
                    if ($scope.examId != null || $scope.examId != "" || $scope.examId != undefined) {
                        if (obj._id == $scope.examId) {
                            $scope.examDetails = obj;
                            console.log("Exam Object : ", obj);
                        }
                    }
                })
                $scope.getClasses();
                getTeacherList();
            } else {
                $scope.examList = [];
            }
        })
    }
    $scope.loadExamList();

    function getTeacherList(){
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/teacher');
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if(result.success == true){
                if(result.data && result.data.length > 0){
                    var teacherList = result.data;
                    for(var i=0; i<teacherList.length; i++){
                        teacherName_hash[teacherList[i]['teacher_id']] = teacherList[i].name
                    }
                }
            } 
        });
    };

    // ng-click="hideSetExamTab();loadExamList();"
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
        $scope.classDetail = classId;
        $scope.classId = classId._id;
        $scope.examId = $scope.examDetails._id;
        $scope.classname = classId.name;
        $scope.searchExam = "";
        $scope.classexamResults = [];
        getExamresultclasswise().then(function (data) {
            for (var index = 0; index < data.length; index++) {
                $scope.classexamResults.push(data[index]);
            }
            HandShakeService.getStudentInfo(classId._id).then(function (result) {
                $scope.studentList = result;
                // $scope.getSubjects();
                if ($scope.examDetails.is_online == true) {
                    $scope.getOnlineExamDetails($scope.examDetails._id);
                }
                else {
                    $scope.getResult();
                }
            });
        });
    }

    $scope.getSubjects = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject/class?class_id=' + $scope.classId);
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.subjectList = result.data;
                $scope.getResult();
            } else {
                // $scope.examList=[];
            }
        })
    }
    function getExamresultclasswise() {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + "/customer/result/getresult?class_id=" + $scope.classId + "&exam_id=" + $scope.examId);
        return requestHandle.then(function (resultsdata) {
            if (resultsdata.success)
                return resultsdata.data.result_list;
        })
    }
    /*-------------- Online Exam-----------------*/

    $scope.getOnlineExamDetails = function (examId) {
        // $scope.examDetails
        $scope.getExamPreviewFunction($scope.examDetails, false, false);
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/customer/exam/exam-anwser-sheet?exam_id=' + examId);
        requestHandle.then(function (result) {
            if (result.success) {
                $scope.studentOnlineExamResult = [];
                $scope.totmaxmark = [];
                $scope.subjectList = [];
                $scope.totmaxmark.push($scope.examDetails.total_marks);
                $scope.subjectList.push($scope.examDetails.name);
                $scope.currentExamQuestion = result.data.exam_question;
                var getReponse = result.data.submitted_exam_list;
                angular.forEach($scope.studentList, function (studentObject) {
                    studentObject.marks = [];
                    studentObject.result = {};
                    studentObject.your_ans;
                    studentObject.checked;
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

            if(ExamsData[index].options.length == 0)
                ExamsData[index].options.push({'answer':ExamsData[index].your_Answer[0]});
            var data = {
                "_id": ExamsData[index]._id,
                "options": ExamsData[index].options,
                "answer": ExamsData[index].your_Answer,
                "mark_obtained": ExamsData[index].your_marks
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
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + "/customer/exam/exam-session", payLoad);
            requestHandle.then(function (result) {
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
                var ExamsData =studentobj.your_ans.questions;
                for (var index = 0; index < ExamsData.length; index++) {
                    if (ExamsData[index].mark_obtained == undefined)
                        total_marks_obtained += Number(0);
                    else
                        total_marks_obtained += Number(ExamsData[index].mark_obtained);
                }
                var payLoad = {
                    "questions": studentobj.your_ans.questions,
                    "examsession_id": studentobj.your_ans._id,
                    "total_marks_obtained": total_marks_obtained
                }
                studentobj.marks = [total_marks_obtained];
                console.log("Update Session : ", payLoad);
                if (payLoad.questions.length != 0 || payLoad != null) {
                    var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + "/customer/exam/exam-session", payLoad);
                    requestHandle.then(function (result) {
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
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;

            angular.forEach($scope.classList, function (obj) {
                class_hash[obj._id] = obj;
            })


        });
    }
    $scope.getResults = function () {
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/exam/result?class_id=' + $scope.classId + '&exam_id=' + $scope.examId);
        //var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/exam/result?class_id=5c7a69abde46a569c93029f6&exam_id=5ce251839f3dd4105283d892');

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
            } else {

            }
        })

    }
    $scope.getResult = function () {
        // $scope.getResults();
        $scope.showViewExamModal = false;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/exam/marks?class_id=' + $scope.classId + '&exam_id=' + $scope.examId);
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
                angular.forEach($scope.studentList, function (studentObject) {
                    studentObject.marks = [];
                    studentObject.result = {};
                    studentObject.checked;
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
                })
            }
        })
    }

    function calculateStudentResult(studentObj) {
        var percentage = 0, totalmarks = 0, totalmax = 0, ispass = true;
        var resultdata;
        for (var index = 0; index < studentObj.marks.length; index++) {
            if (studentObj.marks[index] == "-" || studentObj.marks[index] == null || studentObj.marks[index] == undefined) {
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

    // $scope.updateName = function (value) {
    //     $scope.examName=value;
    // }
    // $scope.selectExamClass = function (value) {
    //     $scope.addExamClass=value;
    // }
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
            "classes": class_list,
            "startdate": l_startDate,
            "enddate": l_endDate
        }

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/exam', data);
        requestHandle.then(function (result) {
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

            } else {
                // $scope.examList=[];
            }
        })

    }

    $scope.allDownload = function () {
    }

    $scope.oneDownload = function () {
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
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + "/customer/exam/result", marks);
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
            var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + "/customer/result/declare-result", payLoad);
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
        var marks = [];
        for (var i = 0; i < $scope.subjectList.length; i++) {
            var singelmarks = {
                "subject": $scope.subjectList[i],
                "score": studentinfo.marks[i],
                "max": $scope.totmaxmark[i]
            }
            marks.push(singelmarks);
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
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + "/customer/result/addresult", payLoad);
        return requestHandle.then(function (result) {
            if (result.success) {
                $rootScope.mypageloading = false;
                $scope.selectedclass($scope.classDetail);
                $scope.showeditMarksModal = false;
                $scope.studentmarksheet = false;
                return result;
            }
        })
        // return  true;
    }

    $scope.checkResultsforClass = function (classexamResults) {
        if (classexamResults.length == 0) {
            $scope.addmulresults($scope.studentList)
        } else {
            $scope.information_MSG = "Result Already genrated for some Students, this Opertaion will update their Result.";
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
                marks.push(singelmarks);
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
            payLoad.push(data);
        });
        if (payLoad.length != 0 || payLoad != null) {
            var requestHandle = HttpService.HttpPostData($rootScope.serverURL + "/customer/result/addresults", payLoad);
            requestHandle.then(function (result) {
                if (result.success) {
                    $rootScope.mypageloading = false;
                    $scope.selectedclass($scope.classDetail);
                    alert("Results generated successfully");
                }
            })
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
                // html2canvas(document.getElementById('resultPrint'), {
                //     onrendered: function (canvas) {
                //         var data = canvas.toDataURL();
                //         var docDefinition = {
                //             content: [{
                //                 image: data,
                //                 width: 500
                //             }]
                //         };
                //         pdfMake.createPdf(docDefinition).download(result.studentInfo.name + ".pdf");
                //     }
                // });

                $rootScope.mypageloading = false;
                $scope.generateResult = false;
            }, 2000);

        })
    }

    $scope.updateSetExamFunction = function (ex) {
        FlashService.Error('');
        FlashService.Success('');
        $scope.currentExamdata = ex;
        $scope.quesAfterSelection = [];
        var questionExistInExam = {};

        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/customer/exam/details?exam_id=' + ex._id);
        requestHandle.then(function (result) {
            if (result.success == true && result['data']['exam']) {
                console.log(result['data']['exam']);
                var examData = result['data']['exam'];
                angular.forEach(examData.questions, function (qu) {
                    questionExistInExam[qu._id] = qu;
                })
                if (examData.is_online == true) {
                    $scope.getIsExamOnineSelection = "true";
                }
                else if (examData.is_online == false) {
                    $scope.getIsExamOnineSelection = "false";
                }
                for (var i = 0; i < examData.questions.length; i++) {
                    if (examData.questions[i]['type'] == 'MULTI-SELECT') {
                        examData.questions[i]['answer'] = [examData.questions[i]['answer']];
                    }
                    examData.questions[i]['customer_id'] = examData['customer_id'];
                }
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
                if(examData['is_scheduled'] == false){
                    $scope.setExamArrayModal['is_scheduled'] = false
                }
                else{
                    $scope.setExamArrayModal['is_scheduled'] = true
                }
                $scope.questionList = examData.questions;
                $scope.selectedClassIds = []
                if($scope.setExamArrayModal.is_scheduled == false){
                    $scope.setExamArrayModal['end_time_buffer'] = 0
                }
                if(examData['created_by'] == 'TEACHER' && examData['created_by_id']){
                    $scope.setExamArrayModal['exam_created_name'] = teacherName_hash[examData['created_by_id']]
                }
                if (examData['classes'] && examData['classes'].length > 0) {
                    for (var i = 0; i < examData['classes'].length; i++) {
                        $scope.selectedClassIds.push({
                            '_id': examData['classes'][i]
                        })
                    }
                }
                $scope.getQuestionDetailsModal['subject_name'] = $scope.questionList[0]['subject_name'];
                $scope.getQuestionDetailsModal['subject_id'] = $scope.questionList[0]['subject_id'];
                $scope.setExamQuestionsModal = true;
                $scope.showSetExamPreviewModal = false;
                $scope.searchQuestion = ""
            } else {
                FlashService.Error('');
                // angular.forEach(ex.questions, function (qu) {
                //     questionExistInExam[qu._id] = qu;
                // })

                // angular.forEach($scope.questionList, function (obj) {
                //     if (questionExistInExam[obj._id]) {
                //         obj.checked = true;
                //         obj.marks = questionExistInExam[obj._id].marks;
                //     }
                // })
                // for (var i = 0; i < ex.questions.length; i++) {

                //     $scope.questionSelection.push({
                //         "_id": ex.questions[i]._id,
                //         "marks": ex.questions[i].marks
                //     })

                //     $scope.quesAfterSelection.push({
                //         "_id": ex.questions[i]._id,
                //         "questionName": questionList_hash[ex.questions[i]._id].question,
                //         "marks": ex.questions[i].marks,
                //         "checked": true
                //     })
                // }
                // if (ex.is_online == true) {
                //     $scope.getIsExamOnineSelection = "true";
                // }
                // else if (ex.is_online == false) {
                //     $scope.getIsExamOnineSelection = "false";
                // }
                // $scope.setExamArrayModal = {
                //     "exam_id": ex._id,
                //     "exam_name": ex.name,
                //     "instructions": ex.instructions ? ex.instructions : "NA",
                //     "total_time": ex.total_time ? ex.total_time : 0,
                //     "total_marks": ex.total_marks ? ex.total_marks : 0,
                //     "is_online": ex.is_online ? ex.is_online : true,
                //     "start_time": ex.start_time ? new Date(ex.start_time) : 0,
                //     "questions": $scope.quesAfterSelection,
                //     "syllabus": ex.syllabus != null ? ex.syllabus : "NA",
                //     "start_time_buffer": ex.start_time_buffer ? ex.start_time_buffer : 0,
                //     "end_time_buffer": ex.end_time_buffer ? ex.end_time_buffer : 10
                // }

                // $scope.setExamQuestionsModal = true;
                // $scope.showSetExamPreviewModal = false;
                // $scope.searchQuestion = ""
            }
        })
    }
    $scope.openexampreview = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.showSetExamdataPreviewModal = true;
    }

    $scope.getExamPreviewFunction = function (ex, is_open, is_popup) {
        FlashService.Error('');
        FlashService.Success('');
        $scope.quesAfterSelection = [];
        $scope.currentExamdata = ex;
        var requestHandle = HttpService.HttpGetData(
            $rootScope.serverURL + '/customer/exam/details?exam_id=' + ex._id);
        requestHandle.then(function (result) {
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
                if(examData['is_scheduled'] == false){
                    $scope.setExamArrayModal['is_scheduled'] = false
                }
                else{
                    $scope.setExamArrayModal['is_scheduled'] = true
                }
                if($scope.setExamArrayModal.is_scheduled == false){
                    $scope.setExamArrayModal['end_time_buffer'] = 0
                }
                if(examData['created_by'] == 'TEACHER' && examData['created_by_id']){
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
                $scope.ifDirectGoToExamPreview = is_open;
                $scope.showSetExamdataPreviewModal = is_popup;

            } else {
                FlashService.Error('');
            }

        })

        // for (var i = 0; i < ex.questions.length; i++) {

        //     $scope.quesAfterSelection.push({
        //         "_id": ex.questions[i]._id,
        //         "questionName": questionList_hash[ex.questions[i]._id].question,
        //         "marks": ex.questions[i].marks
        //     })
        // }
    }

    $scope.approveExam = function (ex) {
        FlashService.Error('');
        FlashService.Success('');
        var payload = {
            'exam_id': ex._id,
            'is_approved': true
        }
        var requestHandle =
            HttpService.HttpUpdateData($rootScope.serverURL + '/customer/exam/approve-disapprove', payload);
        requestHandle.then(function (result) {
            if (result.data) {
                FlashService.Success(ex.name + ' exam is approved');
                $scope.loadExamList();
            } else {
                console.log('something went wrong in approve exam');
            }
        });
    };


    // Set APIs Functions

    $scope.closeFlashMessages = function () {
        FlashService.Error('');
        FlashService.Success('');
    }

    $scope.hideSetExamTab = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.setExamQuestionsModal = false;
        $scope.showSetExamPreviewModal = false;
        $scope.ifDirectGoToExamPreview = false;
        $scope.questionList = [];
        $scope.questionSelection = [];
        $scope.quesAfterSelection = [];
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

    $scope.selectQuetionsByCheckBoxFunction = function (checkModel, data) {

        FlashService.Error('');
        FlashService.Success('');
        if (checkModel == true) {
            data.checked = true;
            $scope.questionSelection.push({
                "_id": data._id,
                "marks": data.marks
            })

            $scope.quesAfterSelection.push({
                "_id": data._id,
                "questionName": data.question,
                "marks": data.marks,
                "checked": true
            })

        }
        else if (checkModel == false) {
            data.checked = false;
            $scope.questionSelection.splice($scope.questionSelection.indexOf(queFirst[data._id]), 1)
            $scope.quesAfterSelection.splice($scope.quesAfterSelection.indexOf(queSecond[data._id]), 1)
        }

        angular.forEach($scope.questionSelection, function (qu) {
            queFirst[qu._id] = qu;
        })

        angular.forEach($scope.quesAfterSelection, function (que) {
            queSecond[que._id] = que;
        })
    }

    $scope.showSetExamModalFUnction = function (data) {
        FlashService.Error('');
        FlashService.Success('');
        $scope.questionSelection = [];
        $scope.quesAfterSelection = [];
        $scope.checkModel = false;
        $rootScope.mypageloading = false;

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
            "marks": "",
            "solution": "",
            "photos": [],
            "localPhotos": []
        }
        $scope.answer = "";
        $scope.selectedClassIds = [];
        if (data.classes && data.classes.length > 0) {
            for (var i = 0; i < data.classes.length; i++) {
                $scope.selectedClassIds.push({
                    '_id': data.classes[i]
                })
            }
        }
        $scope.setExamArrayModal.exam_id = data._id;
        $scope.setExamArrayModal.exam_name = data.name;
        $scope.currentExamdata = data;
        $scope.setExamQuestionsModal = true;
        $scope.showSetExamPreviewModal = false;
        $scope.questionList = [];
        $scope.searchQuestion = ""
    }

    $scope.updateMarksIfAnyChangeOnField = function (ques) {
        angular.forEach($scope.questionSelection, function (obj) {
            if (obj._id == ques._id) {
                obj.marks = ques.marks;
            }
        })
        angular.forEach($scope.quesAfterSelection, function (obj) {
            if (obj._id == ques._id) {
                obj.marks = ques.marks;
            }
        })
    }

    $scope.getQuestions = function () {

        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/question/list');
        requestHandle.then(function (result) {

            if (result.success == true) {
                $scope.questionList = result.data.data.question;

                angular.forEach($scope.questionList, function (que) {
                    questionList_hash[que._id] = que;
                })
                $rootScope.mypageloading = false;
            } else {
                console.log('something went wrong in set exam paper');
            }
        });
    };

    $scope.addSetExamFunction = function () {

        FlashService.Error('');
        FlashService.Success('');
        var payLoad = {
            "exam_id": $scope.setExamArrayModal.exam_id,
            "exam_name": $scope.setExamArrayModal.exam_name,
            "is_scheduled":$scope.setExamArrayModal.is_scheduled,
            "instructions": $scope.setExamArrayModal.instructions,
            "total_marks": $scope.setExamArrayModal.total_marks,
            'classes': $scope.setExamArrayModal.classes,
            "is_online": $scope.setExamArrayModal.is_online,
            "questions": [],
            "syllabus": $scope.setExamArrayModal.syllabus,
        }
        if($scope.setExamArrayModal.is_scheduled == true){
            payLoad['total_time'] = $scope.setExamArrayModal.total_time
            payLoad['start_time'] = $scope.setExamArrayModal.start_time.getTime(),
            payLoad['start_time_buffer'] = $scope.setExamArrayModal.start_time_buffer
            payLoad['end_time_buffer'] = $scope.setExamArrayModal.end_time_buffer
        }
        console.log(payLoad)
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
        console.log($scope.questionList);

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/exam/setpaper', payLoad);
        requestHandle.then(function (result) {
            console.log(result)
            if (result.success == true) {
                $scope.showSetExamPreviewModal = false;
                $scope.setExamQuestionsModal = false;
                $rootScope.mypageloading = false;
                $scope.loadExamList();
                FlashService.Success('Exam updated successfully');
            } else {
                console.log('something went wrong in set exam paper');
            }
        });
    }

    $scope.cancelShowPreviewBeforeSetExamFunction = function () {
        FlashService.Error('');
        FlashService.Success('');
        $scope.showSetExamPreviewModal = false;
    }

    $scope.showPreviewBeforeSetExamFunction = function () {
        FlashService.Error('');
        FlashService.Success('');

        if ($scope.questionList && $scope.questionList.length > 0) {
            $scope.setExamArrayModal['classes'] = $scope.selectedClassIds.map(function (item) { return item["_id"]; });
        }
        if ($scope.questionList.length == 0 || $scope.questionList.length < 0) {
            FlashService.Error('Please select question.');
            return false
        }
        if($scope.setExamArrayModal.is_scheduled == true){
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


        var l_quesCount = 0;
        // for (var i = 0; i < $scope.quesAfterSelection.length; i++) {
        //     l_quesCount = l_quesCount + $scope.quesAfterSelection[i].marks;
        // }

        // if ($scope.setExamArrayModal.total_marks != l_quesCount) {
        //     FlashService.Error('Question marks and total marks does not match.');
        //     return false
        // }

        $scope.showSetExamPreviewModal = true;
    }

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
    }

    $scope.getQuestionLevelChange = function (data) {
        $scope.getQuestionDetailsModal.level = data;
    }

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
    }

    $scope.getSubjectChange = function (data) {
        if (data) {
            $scope.getQuestionDetailsModal['subject_name'] = subjectResult_hash[data].name;
            $scope.getQuestionDetailsModal['subject_id'] = subjectResult_hash[data]._id;
            $scope.getQuestionDetailsModal['customer_id'] = subjectResult_hash[data].customer_id;
        }
        // if(data){
        //     for(var i=0; i<$scope.questionList.length; i++){
        //         $scope.questionList[i]['subject_name'] = subjectResult_hash[data].name;
        //         $scope.questionList[i]['subject_id'] = subjectResult_hash[data]._id;
        //         $scope.questionList[i]['customer_id'] = subjectResult_hash[data].customer_id;
        //     }
        // }
        // else{
        //     for(var i=0; i<$scope.questionList.length; i++){
        //         $scope.questionList[i]['subject_name'] = '';
        //         $scope.questionList[i]['subject_id'] = '';
        //         $scope.questionList[i]['customer_id'] = '';
        //     }
        // }
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
        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/question/edit', payLoad);
        requestHandle.then(function (result) {
            console.log(result)
            if (result.success == true) {
                console.log(result);
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
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/question/add', [payLoad]);
        requestHandle.then(function (response) {
            console.log(response)
            if (response.success == true) {
                var id = response['data']['data'][0]['_id']
                var index = $scope.questionList.indexOf(data);
                $scope.questionList[index]['_id'] = id
                console.log($scope.questionList[index])
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
                $scope.questionList.push(payLoad)
                addNewQuestionDetailOnServer(payLoad);
                console.log(payLoad);
            }
            $scope.setExamArrayModal['total_marks'] = $scope.questionList.reduce(function (cnt, o) { return cnt + parseFloat(o.marks); }, 0)
            $scope.showQuestionModalBox = false;
            $rootScope.mypageloading1 = true;
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
    }

    $scope.getSubjectList = function () {

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/subject');
        requestHandle.then(function (result) {
            $scope.existingResultList = result.data;
            angular.forEach($scope.existingResultList, function (obj) {
                subjectResult_hash[obj._id] = obj;
            });
        })
    };

    $scope.getSubjectList();

    $scope.getClassDetails = function () {
        $rootScope.mypageloading1 = true;
        HandShakeService.getGradeInfo().then(function (result) {

            $scope.classDetails = result;
            $scope.classes = result;

            angular.forEach(result, function (classObj) {
                classDetails_hash[classObj._id] = classObj;
                $scope.examClassData[classObj._id] = classObj.name
            });

        }, function (error) {
            $log.debug('insert in class objectstore failed1 , error = ' + error);
        });
    }
    $scope.getClassDetails();
    $scope.deleteQuestion = function (currentQuestion) {
        var index = $scope.questionList.indexOf(currentQuestion);
        if (index > -1) {
            $scope.questionList.splice(index, 1);
        }
        $scope.setExamArrayModal['total_marks'] =
            $scope.questionList.reduce(function (cnt, o) { return cnt + parseFloat(o.marks); }, 0)

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

    $scope.setOptionAnswerValue = function (id, answer) {
        for (var i = 0; i < $scope.getQuestionDetailsModal.options.length; i++) {
            if ($scope.getQuestionDetailsModal.options[i]['id'] == id) {
                $scope.getQuestionDetailsModal.options[i]['answer'] = answer;
            }
        }
    }
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
    }
});