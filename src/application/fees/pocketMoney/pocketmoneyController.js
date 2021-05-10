//var app = angular.module('feeCollectionController', ['autocomplete']);
app.controller('pocketmoneyController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = true;
    $scope.showStudentInfo = false;
    $scope.showPayAlert = false;
    $scope.feePaidList = [];
    $scope.studentList = [];
    $scope.FessDetails = [];
    $scope.FullValue = [];
    $scope.FessPaid = [];
    $scope.Installment = [];
    $scope.searchstudent = '';
    var dateOffset = (24 * 60 * 60 * 1000) * 1; //1 days
    $scope.currentDate = new Date();
    $scope.currentDate.setTime($scope.currentDate.getTime() - dateOffset);
    $scope.currentDateTimeStamp = $scope.currentDate.getTime()
    $scope.exportFileType = 'pdf';

    $scope.globelSearchstudent = {
        "name": ""
    }
    $scope.showGloble = false;
    $scope.PaymentMode = '';
    $scope.classList = [];
    $scope.classSelect = '';
    $scope.studentListForPay = [];
    $scope.ShowStudentDetails = [];
    $scope.OldRecpt = [];
    $scope.StudentSelect = '';
    $scope.lateFeeAmount = 0;
    $scope.discountAmount = 0;
    $scope.description = '';
    $scope.TodayDate = new Date();
    $scope.profileInfo = angular.fromJson($sessionStorage.profileInfo);
    $scope.visibility = false;
    $scope.yourchoice = '';
    $scope.studentList = [];
    var studentObject = {};
    $scope.balanceText = '';

    $scope.payType = 'CREDIT';
    $scope.onDate = (new Date()).toDateString();
    $scope.pocketMoneyOfSelectedStudent = 0;
    $scope.getNameOfSelectedStudent = '';
    $scope.getRollNoOfSelectedStudent = '';
    $scope.getClassOfSelectedStudent = '';
    $scope.getContactNoOfSelectedStudent = '';
    $scope.getPaymentModeOfSelectedStudent = '';
    $scope.getTotalPocketMoneyOfSelectedStudent = 0;
    $scope.showWhenpaymentFailed = false;
    $scope.showPocketMoneyPayment = true;

    $scope.getTransactionListOfStudents = [];
    var classDetails_hash = {};
    var studentList_hash = {};
    var transactionDetailsOfStudent_hash = {};

    $scope.ChequeInfo = {
        "cheque_number": "",
        "micr_number": "",
        "bank_name": "",
        "brach_name": "",
        "data": ''
    };
    $scope.FeeDetails = {
        "allot_id": "",
        "feesubcat_id": "",
        "installment_id": "",
        "feesucatname": "",
        "installment_name": "",
        "feecatname": "",
        'classSelect': "",
        "StudentSelect": ""
    };
    $scope.currentDate = new Date();


    $scope.getAllStudent = function () {
        $log.debug('HandShakeService.allStudentList call');
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService existingStudentList received');
            $scope.studentList = result;
            angular.forEach($scope.studentList, function (stuObj) {

                if (classDetails_hash[stuObj.grade_id]._id == stuObj.grade_id) {
                    studentList_hash[stuObj._id] = stuObj;
                    studentList_hash[stuObj._id]['class'] = classDetails_hash[stuObj.grade_id].name;
                    // {

                    //     "studentId": stuObj._id,
                    //     "studentName": stuObj.name,
                    //     "studentClass": classDetails_hash[stuObj.grade_id].name,
                    //     "studentRollNo": stuObj.rollno,
                    //     "studentContactNo": stuObj.emer_1,
                    //     "studentGradeId": stuObj.grade_id,
                    //     "studentStatus": stuObj.status,
                    //     "studentParentNotified": stuObj.parent_notified,
                    //     "studentPocketMoney": stuObj.pocketMoney
                    // };
                }

            })
            $scope.getTransactionDetails();
        });
        $log.debug('HandShakeService.existingStudentList passed');

    }

    $scope.getTransactionDetails = function () {

        $scope.getTransactionListOfStudents = [];
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/transaction/getTransactionbyCustId');
        requestHandle.then(function (result) {

            if (result.success) {
                angular.forEach(result.data, function (obj) {

                    if (studentList_hash[obj.student_id]._id == obj.student_id) {

                        $scope.getTransactionListOfStudents.push({
                            "name": studentList_hash[obj.student_id].name,
                            "class": studentList_hash[obj.student_id].class,
                            "rollno": studentList_hash[obj.student_id].rollno,
                            "pocketMoney": studentList_hash[obj.student_id].pocketMoney,
                            "contactNo": studentList_hash[obj.student_id].emer_1,
                            "amount": obj.amount,
                            "credit": obj.credit,
                            "debit": obj.debit,
                            "mode": obj.mode,
                            "status": obj.status,
                            "time": obj.time,
                            "type": obj.type
                        })
                    }
                })

            } else {
                FlashService.Error(result.data.message);
            }
        })
    }

    $scope.getClass = function () {
        if ($scope.classList.length != 0) {
            return false;
        }
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;
            angular.forEach(result, function (classObj) {
                classDetails_hash[classObj._id] = classObj;
            });
            $scope.getAllStudent();
        });
    };

    $scope.getClass();




    function getClassNameById(class_id) {
        var classObj = $scope.classList.find(function (o) {
            return o._id === class_id
        });
        return classObj.name;
    }

    // ----------------ViewAddPayModel----------------------------------

    $scope.viewAddPay = function () {
        // $scope.getClass();

        $rootScope.firebaseUser.getToken(true).then(function (result) { });
        $scope.globelSearchstudent.name = "";
        $scope.showGloble = false;
        $scope.PaymentMode = '';
        $scope.StudentSelect = '';
        $scope.lateFeeAmount = 20;
        $scope.discountAmount = 10;
        $scope.payTotalAmount = 0;
        $scope.description = '';
        $scope.classSelect = '';
        $scope.OldRecpt = [];

        $scope.studentInstallment = [];
        $scope.ShowStudentDetails = [];
        $scope.ChequeInfo = {
            "cheque_number": "",
            "micr_number": "",
            "bank_name": "",
            "brach_name": "",
            "date": ''
        };
        $scope.FeeDetails = {
            "allot_id": "",
            "feesubcat_id": "",
            "installment_id": "",
            "feesucatname": "",
            "installment_name": "",
            "feecatname": "",
            "classSelect": "",
            'StudentSelect': ""
        };
        $scope.payOtherDetails = {
            "description": "",
            "PaymentMode": ""
        }

        $scope.studentListForPay = [];
        $scope.getNameOfSelectedStudent = '';
        $scope.getRollNoOfSelectedStudent = '';
        $scope.getClassOfSelectedStudent = '';
        $scope.getContactNoOfSelectedStudent = '';
        $scope.getPaymentModeOfSelectedStudent = '';
        $scope.getTotalPocketMoneyOfSelectedStudent = 0;
        $scope.showWhenpaymentFailed = false;
        $scope.showPocketMoneyPayment = true;
        $scope.showAddPay = true;
    }

    $scope.InstallmentValue = function (i) {

        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        } else if (j == 2 && k != 12) {
            return i + "nd";
        } else if (j == 3 && k != 13) {
            return i + "rd";
        } else
            return i + "th";

    }

    $scope.calculateAmount = function () {
        var TotalAmount = 0;
        FlashService.Error('');
        angular.forEach($scope.studentInstallment, function (item) {
            if (item.check == true) {
                TotalAmount = item.amount + TotalAmount;
            }

        })
        TotalAmount = TotalAmount + $scope.studentInstallment.lateFeeAmount;
        TotalAmount = TotalAmount - $scope.studentInstallment.discountAmount;
        if (studentObject && studentObject.balance) {
            $scope.studentInstallment.balance = -1 * studentObject.balance;
            if (studentObject.balance < 0) {
                $scope.balanceText = 'Previous Due';
            } else if (studentObject.balance > 0) {
                $scope.balanceText = 'Previous Balance';
            }
            TotalAmount += -1 * studentObject.balance;
        }

        $scope.payTotalAmount = TotalAmount;

    };


    $scope.calculateBalance = function () {
        $scope.studentInstallment.newBalance.amount = $scope.studentInstallment.actualAmount - $scope.payTotalAmount;
    }


    $scope.change = function () {
        FlashService.Error('');
        $scope.showGloble = false;
        $scope.visibility = false;

    }
    $scope.changeModeArray = function (value) {

        if (value == "CHEQUE") {
            $scope.ChequeInfo = {
                "cheque_number": "",
                "micr_number": "",
                "bank_name": "",
                "brach_name": "",
                "date": ''
            };
        }
        if (value == "NEFT/RTGS") {
            $scope.ChequeInfo = {
                "transaction_number": ""
            };
        }
        FlashService.Error('');
        $scope.visibility = false;
    }


    $scope.CheckBoxStatus = function (index, value) {
        FlashService.Error('');
        $scope.studentInstallment[index].check == value;
        $scope.calculateAmount();

    }

    $scope.checkPermission = function () {
        $scope.showPayAlert = true;

    }
    $scope.close = function () {
        $scope.showGloble = false;
        $scope.showPayAlert = false;
        $scope.showAddPay = true;
    }

    $scope.ClickSearch = function () {

        if ($scope.globelSearchstudent.name == '') {
            $scope.FeeDetails.StudentSelect = '';
            $scope.showGloble = false;
            return false;
        }
        $scope.showGloble = true;

        //    if($scope.showGloble == true){
        //     $scope.showGloble = false;
        //     return false;
        //    }
        //    if($scope.showGloble == false){
        //     $scope.showGloble = true;
        //     return false;
        //    }

    }

    $scope.selectedClass = function (id, classData) {

        for (var i = 0; i < classData.length; i++) {
            if (classData[i]._id == id) {
                $scope.getClassOfSelectedStudent = classData[i].name;
            }
        }
        $scope.showGloble = false;
        $scope.FeeDetails.classSelect = id
        $scope.globelSearchstudent.name = "";
        $scope.FeeDetails.StudentSelect = '';
        $scope.studentListForPay = [];
        $scope.OldRecpt = [];
        $scope.studentInstallment = [];
        $scope.payOtherDetails = {
            "description": "",
            "PaymentMode": ""
        }
        $scope.ChequeInfo = {
            "cheque_number": "",
            "micr_number": "",
            "bank_name": "",
            "brach_name": "",
            "date": ''
        };
        FlashService.Error('');
        $rootScope.mypageloading = true;
        HandShakeService.getStudentInfo(id).then(function (result) {
            $rootScope.mypageloading = false;
            $scope.studentListForPay = result;

        });
    }

    $scope.selectedStudent = function (id, data) {

        for (var i = 0; i < data.length; i++) {
            if (data[i]._id == id) {

                $scope.getNameOfSelectedStudent = data[i].name;
                $scope.getRollNoOfSelectedStudent = data[i].rollno;
                $scope.getContactNoOfSelectedStudent = data[i].emer_1;

                if (data[i].pocketMoney) {
                    $scope.pocketMoneyOfSelectedStudent = data[i].pocketMoney;
                }
                else {
                    $scope.pocketMoneyOfSelectedStudent = 0;
                }
            }
        }

        $scope.FeeDetails.StudentSelect = id
    }

    $scope.selectStudentSearch = function (data) {

        $scope.globelSearchstudent = {
            "name": data.name
        }

        $scope.getNameOfSelectedStudent = data.name;
        $scope.getRollNoOfSelectedStudent = data.rollno;
        $scope.getClassOfSelectedStudent = data.class;
        $scope.getContactNoOfSelectedStudent = data.emer_1;

        if (data.pocketMoney) {
            $scope.pocketMoneyOfSelectedStudent = data.pocketMoney;
        }
        else {
            $scope.pocketMoneyOfSelectedStudent = 0;
        }
        $scope.FeeDetails.StudentSelect = data._id;
        $scope.showGloble = false;

    }

    $scope.PayAmount = function () {

        $scope.showPayAlert = false;

        var payloadRequest = {
            "amount": $scope.studentInstallment.actualAmount,
            "student_id": $scope.FeeDetails.StudentSelect,
            "type": $scope.payType,
            "mode": $scope.payOtherDetails.PaymentMode,
            "credit": "",
            "debit": "",
        }

        $scope.getTotalPocketMoneyOfSelectedStudent = $scope.studentInstallment.actualAmount;
        $scope.getPaymentModeOfSelectedStudent = $scope.payOtherDetails.PaymentMode;

        if (payloadRequest.student_id == '') {
            FlashService.Error('Please Select Student');
            return false;
        }
        if (!payloadRequest.amount) {
            FlashService.Error('Please fill actual amount');
            return false;
        }

        if (payloadRequest.payloadRequest == '') {
            FlashService.Error('Please Select Minimun 1 Installment');
            return false;
        }
        if (payloadRequest.payloadRequest < 1) {
            FlashService.Error('Please use Correct Amount');
            return false;
        }

        if (payloadRequest.mode == '') {
            FlashService.Error('Please Select Payment Mode');
            return false;
        }
        /*if (payloadRequest.paymentmode == 'CHEQUE') {
            if (payloadRequest.paymentmodedetails.bank_name == '' || payloadRequest.paymentmodedetails.bank_name == undefined) {
                FlashService.Error('Please Enter Bank Name');
                return false;

            }
            if (payloadRequest.paymentmodedetails.brach_name == '' || payloadRequest.paymentmodedetails.brach_name == undefined) {
                FlashService.Error('Please Enter Branch Name');
                return false;

            }
            if (payloadRequest.paymentmodedetails.cheque_number == '' || payloadRequest.paymentmodedetails.cheque_number == undefined) {
                FlashService.Error('Please Enter Cheque Number');
                return false;

            }
            if (payloadRequest.paymentmodedetails.micr_number == '' || payloadRequest.paymentmodedetails.micr_number == undefined) {
                FlashService.Error('Please Select Micr Number');
                return false;

            }
            if (payloadRequest.paymentmodedetails.date == '') {
                FlashService.Error('Please Select Date');
                return false;

            }

        } else {

            //delete payloadRequest.paymentmodedetails;
        }*/
        /*if (payloadRequest.paymentmode == 'NEFT/RTGS') {
            if (payloadRequest.paymentmodedetails.transaction_number == '' || payloadRequest.paymentmodedetails.transaction_number == undefined) {
                FlashService.Error('Please Enter transaction number');
                return false;

            }
        }*/

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/transaction/addTransaction',
            payloadRequest);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;

            if (result.success) {

                $scope.showPocketMoneyPayment = false;

                var studentObject = studentList_hash[$scope.FeeDetails.StudentSelect]
                $indexedDB.openStore('student', function (studentStore) {
                    // $log.debug('opened studentStore, $scope.existingStudentList[indexInEditing].rollno = ' + $scope.existingStudentList[indexInEditing].rollno);
                    studentStore.delete(studentObject.rollno).then(function (e) {
                        if(studentObject['pocketMoney'])
                            studentObject['pocketMoney'] += $scope.studentInstallment.actualAmount;
                        else
                            studentObject['pocketMoney'] = $scope.studentInstallment.actualAmount;
                        var editStuList = [studentObject];
                        studentStore.upsert(editStuList).then(function (e) {
                            $log.debug('upserted successfully in studentStore');
                        },
                            function (error) {
                                $log.debug('Error in upserting in studentStore = ' + error);
                            });

                    }, function (error) {
                        $log.debug('Error in upserting in studentStore = ' + error);
                    });
                });

            } else {
                $scope.showPocketMoneyPayment = false;
                $scope.showWhenpaymentFailed = true;
                FlashService.Error(result.data.message);
            }
        });
    }
    // ----------------ViewAddPayModel----------------------------------




    $scope.example14settings = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };
    $scope.example14settings2 = {
        scrollableHeight: '300px',
        scrollable: true,
        selectionLimit: 0,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
    };
    $scope.export = function () {
        kendo.drawing.drawDOM($("#exportthis")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "pocketMoney.pdf");
        });

    }
    $scope.setCalender = function () {
        $scope.visibility = true;
    }


    $scope.printToCart = function (rcpt) {

        // var printContents = document.getElementById("printSectionId").innerHTML;
        // var originalContents = document.body.innerHTML;
        // document.body.innerHTML = printContents;
        // window.print();
        // document.body.innerHTML = originalContents;

        // var content = document.getElementById("printSectionId").innerHTML;
        // var mywindow = window.open('', 'Print', 'height=600,width=800');

        // mywindow.document.write('<html><head><title>Print</title></head>');
        // mywindow.document.write('<body>');
        // /mywindow.document.write('</head><body>');
        // mywindow.document.write(content);
        // mywindow.document.write('</body></html>');

        // mywindow.document.close();
        // mywindow.focus()
        // mywindow.print();
        // mywindow.close();
        // return true;

    }
    $scope.printToCart1 = function () {

        kendo.drawing.drawDOM($("#printSectionId")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "Pocketmoney" + "-" + $scope.getNameOfSelectedStudent + "-" +
                $scope.onDate + ".pdf");
        });
    }

    $scope.exportAction = function () {
        switch ($scope.exportFileType) {
            case 'pdf':
                kendo.drawing.drawDOM($("#printSectionId")).then(function (group) {
                    kendo.drawing.pdf.saveAs(group, "Pocketmoney" + "-" + $scope.getNameOfSelectedStudent + "-" +
                        $scope.onDate + ".pdf");
                });
                break;
            case 'xls':
                $scope.$broadcast('export-excel', {});
                break;
            case 'doc':
                $scope.$broadcast('export-doc', {});
                break;
            case 'csv':
                $scope.$broadcast('export-csv', {});
                break;
            default:
        }
    }

});