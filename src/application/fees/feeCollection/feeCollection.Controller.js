//var app = angular.module('feeCollectionController', ['autocomplete']);
app.controller('feeCollectionController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();

    $scope.showTableLoadingBar = true;

    // $scope.selectedStudentFatherName = '';
    // $scope.selectedStudentMother = '';
    // $scope.selectedStudentContact = '';

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

    $scope.showConfirmButton = false;

    var allStudentDetails_hash = {};
    var excelFileDetails_hash = {};

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
            //console.log(result);

            angular.forEach(result, function (obj) {

                allStudentDetails_hash[obj.rollno] = obj;
            });
            console.log('allStudentDetails_hash = ' + allStudentDetails_hash)

        });
        $log.debug('HandShakeService.existingStudentList passed');

    }
    $scope.getAllStudent();


    $scope.allfeePaidList = function () {

        //$rootScope.mypageloading = true;

        $scope.showTableLoadingBar = true;

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feespaid');
        requestHandle.then(function (result) {

            if (result.success) {

                $scope.feePaidList = result.data;
                angular.forEach($scope.feePaidList, function (Subitem) {
                    Subitem.Datestatus = UtilService.checkDate(Subitem);
                    Subitem.name = '';
                    Subitem.rollno = '';
                    Subitem.grade = '';
                    Subitem.emer_1 = '';
                    for (var i = 0; i <= $scope.studentList.length - 1; i++) {
                        if (Subitem.student_id == $scope.studentList[i]._id) {
                            Subitem.name = $scope.studentList[i].name;
                            Subitem.rollno = $scope.studentList[i].rollno;
                            Subitem.grade = getClassNameById($scope.studentList[i].grade_id);
                            Subitem.emer_1 = $scope.studentList[i].emer_1;
                        }

                    }
                })
                $scope.feePaidList.sort(function (a, b) {
                    return new Date(b.time) - new Date(a.time);
                });

                // for(var k=0; k<$scope.feePaidList.length; k++) {
                //     var requestHandle2 = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/deleteAllFee/deleteFee/'+ $scope.feePaidList[k]._id);
                //     requestHandle2.then(function (result) {
                //         if (result.success)
                //         {
                //             console.log('fees deleted successfully');
                //         }
                //         else
                //         {
                //           FlashService.Error(result.data.message);
                //         }
                //     });
                // }

                    

                //$rootScope.mypageloading = false;
                $scope.showTableLoadingBar = false;

            }
            else {
                FlashService.Error(result.message);
            }
        });

    }

    $scope.getStudent = function () {
        $rootScope.mypageloading = true;
        HandShakeService.getAllStudentInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.studentList = result;

            // for(var k=0; k<$scope.studentList.length; k++) {
            //     var requestHandle2 = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/feespaid/deleteAllFee/'+ $scope.studentList[k]._id);
            //     requestHandle2.then(function (result) {
            //         if (result.success)
            //         {
            //             console.log('fees deleted successfully');
            //         }
            //         else
            //         {
            //           FlashService.Error(result.data.message);
            //         }
            //     });
            // }

            $rootScope.mypageloading = false;
            $scope.allfeePaidList();

        });

    };

    $scope.getClass = function () {
        if ($scope.classList.length != 0) {
            return false;
        }
        HandShakeService.getGradeInfo().then(function (result) {
            $log.debug('HandShakeService getRouteInfo received');
            $scope.classList = result;
            $scope.getStudent();
        });
    };

    $scope.getClass();


    function getClassNameById(class_id) {
        var classObj = $scope.classList.find(function (o) {
            return o._id === class_id
        });
        return classObj.name;
    }

    // ----------------ViewDetailsModel----------------------------------
    $scope.viewStudentt = function (data) {

        $scope.FessDetails = [];
        $scope.FessPaid = [];
        $scope.Installment = [];
        $scope.searchstudent = '';
        $scope.FessPaid = data;
        var b = $scope.InstallmentValue($scope.FessPaid.feeDetails[0].installment_name);
        $scope.FessPaid.feeDetails[0].installment_name = b;

        // $scope.FessDetails =data.feeDetails;
        // $rootScope.mypageloading = true;
        $scope.showStudentInfo = true;

    }
    // ----------------ViewDetailsModel----------------------------------

    // ----------------ViewAddPayModel----------------------------------

    $scope.viewAddPay = function () {
        // $scope.getClass();
        $rootScope.firebaseUser.getToken().then(function (result) { });
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
        $scope.showAddPay = true;
    }



    $rootScope.mypageloading = false;
    $scope.selectedClass = function (id) {
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
    $scope.selectedStudent = function (id) {

        $scope.showGloble = false;
        FlashService.Error('');
        $scope.FeeDetails.StudentSelect = id
        $scope.StudentSelect = id;
        $scope.ShowStudentDetails = [];

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feeallotment/student?student_id=' + id);
        requestHandle.then(function (result) {
            if (result.success) {
                $scope.OldRecpt = [];
                $scope.studentInstallment = [];
                $scope.ShowStudentDetails = result.data;

                console.log(result.data);

                $scope.OldRecpt = result.data.fees_paid;
                if ($scope.ShowStudentDetails.result == '') {
                    angular.forEach($scope.studentListForPay, function (item) {
                        if (item._id == id) {
                            FlashService.Error($scope.ShowStudentDetails.message + " " + item.name);
                        }
                    })
                    return false;
                }
                $scope.FeeDetails = {
                    "allot_id": $scope.ShowStudentDetails.fees_details[0]._id,
                    "classSelect": $scope.FeeDetails.classSelect,
                    "StudentSelect": $scope.FeeDetails.StudentSelect,
                    "feesubcat_id": $scope.ShowStudentDetails.fees_details[0].feesubcatid,
                    "installment_id": "",
                    "feesucatname": $scope.ShowStudentDetails.fees_details[0].feesubcatname,
                    "installment_name": "",
                    "feecatname": $scope.ShowStudentDetails.fees_details[0].feecatname
                };

                $scope.studentInstallment = result.data.fees_details;

                var instalmentDetail = result.data.fees_details;
                if (instalmentDetail) {

                    var installment = [];

                    angular.forEach(instalmentDetail, function (value) {

                        if (value.feesubcat.installments) {

                            angular.forEach(value.feesubcat.installments, function (install) {
                                var isDueover = false
                                if ($scope.currentDate > new Date(install.due)) {
                                    isDueover = true
                                }
                                installment.push({ _id: install._id, name: install.name, start: install.start, due: install.due, end: install.end, amount: install.amount, feecatname: value.feecatname, feesubcatname: value.feesubcatname, status: install.status, check: false, isDueover: isDueover, feesubcat_id: value.feesubcatid, feecatid: value.feecatid })
                            })

                        }

                    })

                }
                $scope.studentInstallment = installment;
                angular.forEach($scope.studentInstallment, function (value) {
                    var a = $scope.InstallmentValue(value.name);
                    value.name = a;

                })

                studentObject = {};

                for (var i = 0; i <= $scope.studentList.length - 1; i++) {
                    if (id == $scope.studentList[i]._id) {
                        studentObject = $scope.studentList[i];
                    }
                }

                angular.forEach($scope.OldRecpt, function (value) {
                    var c = $scope.InstallmentValue(value.feeDetails[0].installment_name);
                    value.feeDetails[0].installment_name = c;
                    value.name = studentObject.name;
                    value.rollno = studentObject.rollno;
                    value.grade = getClassNameById(studentObject.grade_id);
                    value.emer_1 = studentObject.emer_1;
                    // for(var i=0;i<=$scope.studentList.length-1;i++){
                    //     if(value.student_id == $scope.studentList[i]._id){
                    //         value.name = $scope.studentList[i].name;
                    //         value.rollno = $scope.studentList[i].rollno;
                    //         value.grade = getClassNameById($scope.studentList[i].grade_id);
                    //         value.emer_1 = $scope.studentList[i].emer_1;
                    //     }
                    // }
                })

                $scope.studentInstallment.discountAmount = '';
                $scope.studentInstallment.discountRamark = '';
                $scope.studentInstallment.lateFeeAmount = '';
                $scope.studentInstallment.lateFeeRemark = '';
                $scope.studentInstallment.newBalance = {
                    amount: '',
                    reason: ''
                };
                $scope.calculateAmount();
            }
            else {
                FlashService.Error(result.message);
            }
        });

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

    $scope.selectStudentSearch = function (data) {
        //console.log(data.name);
        console.log(data);

        // if (data.emer_1) {
        //     $scope.selectedStudentContact = data.emer_1;
        // }
        // else {
        //     $scope.selectedStudentContact = 'NA';
        // }

        // if (data.fathername) {
        //     $scope.selectedStudentFatherName = data.fathername;
        // }
        // else {
        //     $scope.selectedStudentFatherName = 'NA';
        // }


        // if (data.mothername) {
        //     $scope.selectedStudentMother = data.mothername;
        // }
        // else {
        //     $scope.selectedStudentMother = 'NA';
        // }

        $scope.globelSearchstudent = {
            "name": data.name
        }
        $scope.FeeDetails.StudentSelect = data._id;
        $scope.showGloble = false;
        $scope.selectedStudent(data._id);

    }

    $scope.PayAmount = function () {


        $scope.showPayAlert = false;
        $scope.FeeDetails2 = []
        angular.forEach($scope.studentInstallment, function (item) {
            if (item.check == true) {
                $scope.FeeDetails2.push({
                    "allot_id": item._id,
                    "feesubcat_id": item.feesubcat_id,
                    "installment_id": item._id,
                    "feesubcatname": item.feesubcatname,
                    "installment_name": item.name,
                    "feecatname": item.feecatname,
                    "amount": item.amount,
                })
            }
        })
        var payloadRequest = {
            "topay": $scope.payTotalAmount,
            "amount": $scope.studentInstallment.actualAmount,
            "balance": $scope.studentInstallment.newBalance,
            "student_id": $scope.StudentSelect,
            "description": $scope.payOtherDetails.description,
            "paymentmode": $scope.payOtherDetails.PaymentMode,
            "paymentmodedetails": $scope.ChequeInfo,
            "feeDetails": $scope.FeeDetails2,
            "prevbalance": studentObject.balance,
            "latefees": {
                "amount": $scope.studentInstallment.lateFeeAmount,
                "reason": $scope.studentInstallment.lateFeeRemark
            },
            "discount": {
                "amount": $scope.studentInstallment.discountAmount,
                "reason": $scope.studentInstallment.discountRamark
            }
        }

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
        if (payloadRequest.feeDetails.length == 0) {
            FlashService.Error('Please Select Minimun 1 Installment');
            return false;
        }
        if (payloadRequest.paymentmode == '') {
            FlashService.Error('Please Select Payment Mode');
            return false;
        }
        if (payloadRequest.paymentmode == 'CHEQUE') {
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
            // if (payloadRequest.paymentmodedetails.micr_number == '' || payloadRequest.paymentmodedetails.micr_number == undefined) {
            //     FlashService.Error('Please Select Micr Number');
            //     return false;
            // }

            if (payloadRequest.paymentmodedetails.micr_number == '' || payloadRequest.paymentmodedetails.micr_number == undefined) {
                payloadRequest.paymentmodedetails.micr_number = 0;
            }

            if (payloadRequest.paymentmodedetails.date == '') {
                FlashService.Error('Please Select Date');
                return false;

            }

        } else {

            //delete payloadRequest.paymentmodedetails;
        }
        if (payloadRequest.paymentmode == 'NEFT/RTGS') {
            // if (payloadRequest.paymentmodedetails.transaction_number == '' || payloadRequest.paymentmodedetails.transaction_number == undefined) {
            //     FlashService.Error('Please Enter transaction number');
            //     return false;
            // }

            if (payloadRequest.paymentmodedetails.transaction_number == '' || payloadRequest.paymentmodedetails.transaction_number == undefined) {
                payloadRequest.paymentmodedetails.transaction_number = 0;
            }
        }

        //console.log(payloadRequest);

        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feespaid', payloadRequest);
        requestHandle.then(function (result) {
            $rootScope.mypageloading = false;
            if (result.success) {

                var studentInfo = result.data;

                angular.forEach($scope.studentList, function (item) {
                    if (item._id === studentInfo.student_id) {
                        studentInfo.rollno = item.rollno;
                        studentInfo.name = item.name;
                        studentInfo.emer_1 = item.emer_1;
                        studentInfo.grade = getClassNameById(item.grade_id);
                    }
                })

                $scope.viewStudentt(studentInfo);
                $scope.allfeePaidList();
                $scope.showAddPay = false;
                studentObject.balance = studentInfo.balance.amount;
                if (studentObject.balance) {
                    $indexedDB.openStore('student', function (studentStore) {
                        // $log.debug('opened studentStore, $scope.existingStudentList[indexInEditing].rollno = ' + $scope.existingStudentList[indexInEditing].rollno);
                        studentStore.delete(studentObject.rollno).then(function (e) {

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
                }


            } else {
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
            kendo.drawing.pdf.saveAs(group, "FeeAllotment.pdf");
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

        kendo.drawing.drawDOM($("#printSectionId")).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "Fee_Receipt_No_" + rcpt + ".pdf");
        });

    }
    $scope.printToCart1 = function (id, rcpt) {

        kendo.drawing.drawDOM($("#" + id)).then(function (group) {
            kendo.drawing.pdf.saveAs(group, "Fee_Receipt_No_" + rcpt + ".pdf");
        });

    }


    var fileInput = document.getElementById("csv"),

        readFile = function () {
            Papa.parse(fileInput.files[0], {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    data = results.data;

                    var stuIndex = -1;
                    function processFees(j) {
                        if (!data[j]) {
                            console.log('file completed - ' + j - 1);
                            return;
                        }

                        if (data[j]['Name Of Students'] && (data[j]['Receipt 1 Instalment'] > 0 || data[j]['Receipt 2 Instalment'] > 0)) {
                            for (var i = 0; i < $scope.studentList.length; i++) {
                                if ($scope.studentList[i].name.toUpperCase() == data[j]['Name Of Students'].toUpperCase()) {
                                    stuIndex = i;
                                    break;
                                }
                            }

                            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feeallotment/student?student_id=' + $scope.studentList[stuIndex]._id);
                            requestHandle.then(function (result) {
                                if (result.success) {
                                    var installmentHash = {
                                        1: [],
                                        2: [],
                                        3: [],
                                        4: []
                                    };
                                    if (result.data.fees_details && result.data.fees_details.length > 0) {

                                        var feeDetails = [];
                                        var amount = 0;
                                        angular.forEach(result.data.fees_details, function (feeDetailObj) {
                                            if (feeDetailObj.feesubcat.installments.length) {
                                                angular.forEach(feeDetailObj.feesubcat.installments, function (installmentObj) {
                                                    installmentHash[installmentObj.name].push({
                                                        "allot_id": feeDetailObj._id,
                                                        "feesubcat_id": feeDetailObj.feesubcat._id,
                                                        "installment_id": installmentObj._id,
                                                        "feesubcatname": feeDetailObj.feesubcatname,
                                                        "installment_name": installmentObj.name,
                                                        "feecatname": feeDetailObj.feecatname,
                                                        "amount": installmentObj.amount
                                                    });
                                                });
                                            }
                                        });
                                        var totalPaid = data[j]['Receipt 2'];
                                        for (var inst in installmentHash) {
                                            if (installmentHash.hasOwnProperty(inst)) {
                                                var instList = installmentHash[inst];
                                                var total = 0;
                                                if (instList.length) {
                                                    angular.forEach(instList, function (instObj) {
                                                        total += instObj.amount;
                                                        if (totalPaid >= instObj.amount) {
                                                            feeDetails.push(instObj)
                                                            totalPaid -= instObj.amount;
                                                        } else {

                                                        }
                                                    });
                                                }
                                            }
                                        }
                                        console.log(data[j]['Name Of Students'] + data[j]['Receipt 2'] + ' totalPaid remaining=' + totalPaid);
                                        // if(totalPaid == data[j]['NET BAL.'])
                                        if (feeDetails.length && totalPaid != data[j]['Receipt 2']) {
                                            var payloadRequest = {
                                                "topay": data[j]['Receipt 2'] - totalPaid,
                                                "amount": data[j]['Receipt 2'] - totalPaid,
                                                "balance": {
                                                    "amount": 0,
                                                    "reason": ""
                                                },
                                                "student_id": $scope.studentList[stuIndex]._id,
                                                "description": "",
                                                "paymentmode": "CASH",
                                                "paymentmodedetails": {
                                                    "cheque_number": "",
                                                    "micr_number": "",
                                                    "bank_name": "",
                                                    "brach_name": "",
                                                    "date": ""
                                                },
                                                "feeDetails": feeDetails,
                                                "prevbalance": 0,
                                                "latefees": {
                                                    "amount": "",
                                                    "reason": ""
                                                },
                                                "discount": {
                                                    "amount": "",
                                                    "reason": ""
                                                }
                                            }

                                            // var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feespaid', payloadRequest);
                                            // requestHandle.then(function (result) {
                                            //     $rootScope.mypageloading = false;
                                            //     if (result.success){
                                            //         processFees(j+1);
                                            //     }
                                            // });
                                        } else {
                                            console.log('no fees paid for student ' + data[j]['Name Of Students']);
                                            processFees(j + 1);
                                        }
                                    }
                                }
                            });
                        } else {
                            console.log('rcpt amount 0');
                            processFees(j + 1);
                        }
                    }
                    processFees(0);
                }
            });
        };

    fileInput.addEventListener('change', readFile);


    ////////////////////////////////////////////////////////////////

    $scope.showUploadExcelFileModelFunction = function () {

        $scope.showUploadExcelFileModel = true;

        $scope.showSuccessAndErrorRows = false;
        $scope.analyzedArray = [];
        $scope.listOfColumnNames = [];

        $scope.showErrorLogsButton = false;
        $scope.showLoadedTable = false;
        $scope.showResponseLogsButton = false;
        $scope.showErrorLogs = false;
        $scope.IsVisible = false;
        $scope.showTableWhenUploadFile = false;
        $scope.analyseDataButton = false;
        $scope.confirmPayButton = false;

        $('#xlsxFile').val('');
    }

    $scope.SelectFile = function (file) {
        $scope.SelectedFile = null;
        $scope.SelectedFile = file;

        if ($scope.SelectedFile != null) {
            $scope.Upload();
        }
    };

    $scope.Upload = function () {

        $scope.showLoadingWhenLoadingData = false;

        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
        if (regex.test($scope.SelectedFile.name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                //For Browsers other than IE.
                if (reader.readAsBinaryString) {
                    reader.onload = function (e) {
                        $scope.ProcessExcel(e.target.result);
                    };
                    reader.readAsBinaryString($scope.SelectedFile);
                } else {
                    //For IE Browser.
                    reader.onload = function (e) {
                        var data = "";
                        var bytes = new Uint8Array(e.target.result);
                        for (var i = 0; i < bytes.byteLength; i++) {
                            data += String.fromCharCode(bytes[i]);
                        }
                        $scope.ProcessExcel(data);
                    };
                    reader.readAsArrayBuffer($scope.SelectedFile);
                }
            } else {
                $window.alert("This browser does not support HTML5.");
            }
        } else {
            $window.alert("Please upload a valid Excel file.");
        }
    };

    $scope.ProcessExcel = function (data) {
        //Read the Excel File data.
        $rootScope.mypageloading = true;

        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];

        //Read all rows from First Sheet into an JSON array.
        var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

        //Display the data from Excel file in Table.
        $scope.$apply(function () {

            $scope.isNoDataDisplay = false;
            $scope.showResponseLogsButton = false;
            $scope.showErrorLogsButton = false;
            $scope.showErrorLogs = false;
            $scope.showLoadedTable = false;

            $rootScope.mypageloading = true;

            $scope.feeCatInXlsFileArray = [];
            $scope.listOfColumnNames = [];

            var studentName = '';

            $scope.Customers = excelRows; //Extracted data from xls file
            $scope.listOfColumnNames = Object.keys($scope.Customers[0]); //Only 1st row data

            $scope.tables = [];

            $scope.tables.push({ rows: $scope.Customers, cols: Object.keys($scope.Customers[0]) });

            /* angular.forEach($scope.Customers, function (xlsObj) {
 
                 $scope.feeCatInXlsFileArray.push(xlsObj.fees);
                 excelFileDetails_hash[xlsObj.rollno] = xlsObj;
 
             });*/

            $scope.IsVisible = true;
            $scope.showTableWhenUploadFile = true;
            $scope.analyseDataButton = true;
            $scope.confirmPayButton = false;

            $scope.analyseFileDataFunction();

        });

        $rootScope.mypageloading = false;
    };

    $scope.confirmNotifyParentsFunction = function () {
        $scope.showConfirmButton = true;
    }

    $scope.cancelNotifyParentsFunction = function () {
        $scope.showConfirmButton = false;
    }

    $scope.notifyParentsFunction = function () {
        $rootScope.mypageloading = true;
        $scope.showConfirmButton = false;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feespaid/remainder');
        requestHandle.then(function (result) {
            if (result.success) {
                $rootScope.mypageloading = false;
                window.alert('Successfully sent notification to all parents');
            }
            else {
                window.alert('Something went wrong on notification.');
            }
        })
    }

    ///

    $scope.showErrorLogsFunction = function () {

        $scope.showErrorLogsButton = false;
        $scope.showLoadedTable = false;
        $scope.showResponseLogsButton = true;
        $scope.showErrorLogs = true;
    }

    $scope.showResposneLogsFunction = function () {

        $scope.showErrorLogsButton = true;
        $scope.showLoadedTable = true;
        $scope.showResponseLogsButton = false;
        $scope.showErrorLogs = false;
    }

    $scope.confirmPaymentFunction = function () {
        $scope.confirmPayButton = true;
        $scope.IsVisible = false;
    }

    $scope.cancelPaymentFunction = function () {
        $scope.confirmPayButton = false;
        $scope.IsVisible = true;
    }

    $scope.submitFeesByXlxsFileFunction = function () {

        $scope.showSuccessAndErrorRows = false;

        $scope.beforePayFeesShowPrevBalance = false;
        $scope.afterPayFeesShowTotalBalance = false;

        $rootScope.mypageloading = true;
        $scope.showLoadingWhenLoadingData = true;

        $scope.showLoadedTable = true;
        $scope.showErrorLogsButton = false;
        $scope.showResponseLogsButton = false;
        $scope.analyseDataButton = false;
        $scope.confirmPayButton = false;
        $scope.IsVisible = false;

        $scope.feeCategoryOrInstallmentNotFoundArray = [];
        $scope.fileLengthCount = 0;
        $scope.getFeeDetailsOfSingleStudent = [];
        $scope.totalPayableAmount = 0;
        $scope.showDataInATable = [];
        var feeDetails_hash = {};

        var l_count = 0;

        excelFeePaymentDataObjectFunction(0)


        function excelFeePaymentDataObjectFunction(l_count) {

            feeDetails_hash = {};
            var isFound = false;
            $scope.getFeeDetailsOfSingleStudent = [];

            if ($scope.Customers[l_count] != undefined) {

                isPresent = $scope.studentList.some(function (obj) {
                    return $scope.Customers[l_count].rollno == obj.rollno;
                });

                if (isPresent) {

                    if (allStudentDetails_hash[$scope.Customers[l_count].rollno] != undefined) {

                        if ($scope.Customers[l_count].rollno ==
                            allStudentDetails_hash[$scope.Customers[l_count].rollno].rollno) {

                            var totalAmount = 0;

                            $scope.totalPayableAmount = 0;
                            $scope.balanceRemainingFromTotalPayable = 0;
                            $scope.isBalanceGreaterThanActualFee = 0;

                            var student_ID = '';
                            $scope.feeDetailArray = [];
                            $scope.toPayFeeNames = [];
                            $scope.installmentNameAndFeeName = [];

                            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feeallotment/student?student_id='
                                + allStudentDetails_hash[$scope.Customers[l_count].rollno]._id);
                            requestHandle.then(function (result) {
                                if (result.success) {
                                    console.log('fees paid length ' + result.data.fees_paid.length);
                                    // for(var j=0; j < result.data.fees_paid.length; j++) {
                                    //     var requestHandle2 = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/feespaid/deleteFee/'+ result.data.fees_paid[j]._id);
                                    //     requestHandle2.then(function (result) {
                                    //         if (result.success)
                                    //         {

                                    //         }
                                    //         else
                                    //         {
                                    //           FlashService.Error(result.data.message);
                                    //         }
                                    //     });
                                    // }

                                    $scope.getFeeDetailsOfSingleStudent = result.data;

                                    for (var i = 3; i < $scope.listOfColumnNames.length; i++) {
                                        isFound = false;
                                        var isFirstInstallmentPaid = true;
                                        $scope.toPayInstallmentNumber = [];
                                        $scope.isBalanceGreaterThanActualFee = $scope.Customers[l_count][$scope.listOfColumnNames[i]];

                                        var splitFeeName = $scope.listOfColumnNames[i].toUpperCase();

                                        for (var j = 0; j < $scope.getFeeDetailsOfSingleStudent.fees_details.length; j++) {

                                            if ($scope.getFeeDetailsOfSingleStudent.fees_details[j].feecatname == splitFeeName) {

                                                isFound = true;

                                                var obj = $scope.getFeeDetailsOfSingleStudent.fees_details[j].feesubcat.installments;

                                                for (var key in obj) {
                                                    var attrValue = obj[key];
                                                    var installmentNumber = attrValue.name;

                                                    //$scope.toPayInstallmentNumber.push(attrValue.name);

                                                    //studentName = $scope.Customers[l_count].name;

                                                    if (attrValue.status == 'DUE') {

                                                        if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] != undefined) {

                                                            if (attrValue.amount <= $scope.isBalanceGreaterThanActualFee) {
                                                                //console.log($scope.listOfColumnNames[i] + " : " + attrValue.amount + " : " + $scope.isBalanceGreaterThanActualFee);

                                                                $scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee - attrValue.amount);
                                                                $scope.toPayInstallmentNumber.push(attrValue.name);

                                                                if ($scope.toPayFeeNames.length != 0) {

                                                                    isFeePresent = $scope.toPayFeeNames.some(function (obj) {
                                                                        return splitFeeName == obj;
                                                                    });

                                                                    if (!isFeePresent) {
                                                                        $scope.toPayFeeNames.push(splitFeeName);
                                                                    }
                                                                }
                                                                else {
                                                                    $scope.toPayFeeNames.push(splitFeeName);
                                                                }
                                                                //$scope.installmentNameAndFeeName
                                                                if ($scope.installmentNameAndFeeName.length != 0) {

                                                                    isFeeAndInstalmentPresent = $scope.installmentNameAndFeeName.some(function (obj) {
                                                                        return $scope.Customers[l_count][$scope.listOfColumnNames[i]] == obj.amount
                                                                            && $scope.listOfColumnNames[i] == obj.feeName;
                                                                    });

                                                                    if (!isFeeAndInstalmentPresent) {
                                                                        $scope.installmentNameAndFeeName.push({
                                                                            "amount": $scope.Customers[l_count][$scope.listOfColumnNames[i]],
                                                                            "feeName": $scope.listOfColumnNames[i]
                                                                        });

                                                                        $scope.totalPayableAmount = $scope.totalPayableAmount + parseInt($scope.Customers[l_count][$scope.listOfColumnNames[i]]);
                                                                    }
                                                                }
                                                                else {
                                                                    $scope.installmentNameAndFeeName.push({
                                                                        "amount": $scope.Customers[l_count][$scope.listOfColumnNames[i]],
                                                                        "feeName": $scope.listOfColumnNames[i]
                                                                    });
                                                                    $scope.totalPayableAmount = $scope.totalPayableAmount + parseInt($scope.Customers[l_count][$scope.listOfColumnNames[i]]);
                                                                }

                                                                //$scope.totalPayableAmount = parseInt($scope.Customers[l_count][$scope.listOfColumnNames[i]]);
                                                                totalAmount = parseInt(totalAmount + attrValue.amount);
                                                                //$scope.balanceRemainingFromTotalPayable = parseInt($scope.balanceRemainingFromTotalPayable - attrValue.amount)
                                                                student_ID = allStudentDetails_hash[$scope.Customers[l_count].rollno]._id

                                                                $scope.feeDetailArray.push({

                                                                    "allot_id": attrValue._id,
                                                                    "amount": attrValue.amount,
                                                                    "feecatname": $scope.getFeeDetailsOfSingleStudent.fees_details[j].feecatname,
                                                                    "feesubcat_id": $scope.getFeeDetailsOfSingleStudent.fees_details[j].feesubcat._id,
                                                                    "feesubcatname": $scope.getFeeDetailsOfSingleStudent.fees_details[j].feesubcatname,
                                                                    "installment_id": attrValue._id,
                                                                    "installment_name": installmentNumber,
                                                                    "studentName": $scope.Customers[l_count].name

                                                                })
                                                            }
                                                            else {
                                                                if (installmentNumber == key && isFirstInstallmentPaid) {
                                                                    isFirstInstallmentPaid = false;
                                                                    $scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee);
                                                                }

                                                                /*if(installmentNumber == 2 && isFirstInstallmentPaid){
                                                                    isFirstInstallmentPaid = false;
                                                                    $scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee);
                                                                }

                                                                if(installmentNumber == 3 && isFirstInstallmentPaid){
                                                                    isFirstInstallmentPaid = false;
                                                                    $scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee);
                                                                }*/
                                                                //console.log($scope.balanceRemainingFromTotalPayable + " : " + $scope.isBalanceGreaterThanActualFee);
                                                                //$scope.balanceRemainingFromTotalPayable = parseInt($scope.balanceRemainingFromTotalPayable + $scope.isBalanceGreaterThanActualFee);
                                                            }
                                                        }
                                                    }
                                                    else if (attrValue.status == 'PAID') {


                                                    }


                                                    else {

                                                    }
                                                }
                                            }
                                            else {
                                                /************************************
                                                Here it will show if fee or installment not present in fee_details
                                                **************************************/
                                            }
                                        }

                                        /* if (!isFound) {
 
                                                if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined) {
         
                                                     $scope.feeCategoryOrInstallmentNotFoundArray.push({
                                                         "feeCatName": splitFeeName[0],
                                                         "installmentNo": splitFeeName[1],
                                                         "Status": "FEE IS EMPTY",
                                                         "studentName": $scope.Customers[l_count].name
                                                     })
                                                 }
                                                 else {
         
                                                     $scope.feeCategoryOrInstallmentNotFoundArray.push({
                                                         "feeCatName": splitFeeName[0],
                                                         "installmentNo": splitFeeName[1],
                                                         "Status": "FEE NOT FOUND",
                                                         "studentName": $scope.Customers[l_count].name
                                                     })
                                                 }
                                             
                                         }*/
                                        if (typeof ($scope.isBalanceGreaterThanActualFee) == "number") {
                                            //console.log($scope.balanceRemainingFromTotalPayable + " : " + $scope.isBalanceGreaterThanActualFee);
                                            $scope.balanceRemainingFromTotalPayable = parseInt($scope.balanceRemainingFromTotalPayable + $scope.isBalanceGreaterThanActualFee);
                                        }
                                    }

                                    // Break Point Or loop completes here, for one student
                                    if ($scope.feeDetailArray.length != 0) {

                                        var payRequestData = {

                                            "amount": $scope.totalPayableAmount,
                                            "topay": totalAmount,
                                            "balance": {
                                                "amount": parseInt($scope.balanceRemainingFromTotalPayable + allStudentDetails_hash[$scope.Customers[l_count].rollno].balance),
                                                "reason": ""
                                            },
                                            "student_id": student_ID,
                                            "description": "",
                                            "paymentmode": "CASH",
                                            "paymentmodedetails": {
                                                "cheque_number": "",
                                                "micr_number": "",
                                                "bank_name": "",
                                                "brach_name": "",
                                                "date": ""
                                            },
                                            "feeDetails": $scope.feeDetailArray,
                                            "prevbalance": allStudentDetails_hash[$scope.Customers[l_count].rollno].balance,
                                            "latefees": {
                                                "amount": "",
                                                "reason": ""
                                            },
                                            "discount": {
                                                "amount": "",
                                                "reason": ""
                                            }

                                        }

                                        //console.log(payRequestData);
                                        $scope.totalPayableAmount = 0;

                                        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/feespaid', payRequestData);
                                        requestHandle.then(function (result) {

                                            $scope.afterPayFeesShowTotalBalance = true;

                                            if (result.success) {
                                                // console.log(result);

                                                $scope.showDataInATable.push({

                                                    "balance": parseInt($scope.balanceRemainingFromTotalPayable + allStudentDetails_hash[$scope.Customers[l_count].rollno].balance),
                                                    "studentName": $scope.Customers[l_count].name,
                                                    "rollno": $scope.Customers[l_count].rollno,
                                                    "contact": $scope.Customers[l_count].contact,
                                                    "status": 'PAYMENT SUCCESSFULL',
                                                    "feeAmount": $scope.totalPayableAmount,
                                                    "prevBalance": allStudentDetails_hash[$scope.Customers[l_count].rollno].balance
                                                })

                                                l_count++;
                                                excelFeePaymentDataObjectFunction(l_count);
                                            }
                                            else {
                                                //window.alert('Error when paying fees for "' + $scope.Customers[l_count].name + '" student');

                                                $scope.showDataInATable.push({

                                                    "balance": parseInt($scope.balanceRemainingFromTotalPayable),
                                                    "studentName": $scope.Customers[l_count].name,
                                                    "rollno": $scope.Customers[l_count].rollno,
                                                    "contact": $scope.Customers[l_count].contact,
                                                    "status": 'ERROR',
                                                    "feeAmount": $scope.totalPayableAmount,
                                                    "prevBalance": allStudentDetails_hash[$scope.Customers[l_count].rollno].balance
                                                })
                                                l_count++;
                                                excelFeePaymentDataObjectFunction(l_count);
                                            }
                                        })

                                        //l_count++;
                                        //excelFeePaymentDataObjectFunction(l_count);
                                    }
                                    else {
                                        l_count++;
                                        excelFeePaymentDataObjectFunction(l_count);
                                    }

                                }
                            })
                        }
                    }
                    else {

                        /*
                       $scope.feeCategoryOrInstallmentNotFoundArray.push({
                           "feeCatName": "NULL",
                           "installmentNo": "NULL",
                           "Status": "ROLL NO. NOT MATCHED",
                           "studentName": $scope.Customers[l_count].name
                       })
                   */

                        l_count++;
                        excelFeePaymentDataObjectFunction(l_count);
                    }
                }
                else {

                    /*
                    $scope.feeCategoryOrInstallmentNotFoundArray.push({
                        "feeCatName": "NULL",
                        "installmentNo": "NULL",
                        "Status": "STUDENT NOT FOUND",
                        "studentName": $scope.Customers[l_count].name
                    })
                    */

                    l_count++;
                    excelFeePaymentDataObjectFunction(l_count);
                }
            }
            else {
                // $scope.Customers[l_count] exceeds limit

                $scope.showLoadingWhenLoadingData = false;
                $scope.allfeePaidList();

            }
        }

        $rootScope.mypageloading = false;
    }

    /************************************* Analyse File Data FUNCTION **********************************************/
    $scope.analyseFileDataFunction = function () {

        $scope.showSuccessAndErrorRows = false;

        $scope.formArray = [];
        $scope.errorLogs = [];

        $scope.analyzedArray = [];
        $scope.insertArrayRowByRow = [];
        $scope.installmentDueArray = [];

        $scope.totalSuccessRowCount = 0;
        $scope.totalErrorRowCount = $scope.Customers.length;

        $scope.listOfColumnNames.push("Balance");
        $scope.listOfColumnNames.push("Previous Balance");
        $scope.listOfColumnNames.push("Status");

        var l_count = 0;

        excelDataObjectFunction(0)

        function excelDataObjectFunction(l_count) {


            $scope.getFeeDetailsOfSingleStudent = [];

            if ($scope.Customers[l_count] != undefined) {

                isPresent = $scope.studentList.some(function (obj) {
                    return $scope.Customers[l_count].rollno == obj.rollno;
                });

                if (isPresent) {

                    if (allStudentDetails_hash[$scope.Customers[l_count].rollno] != undefined) {

                        if ($scope.Customers[l_count].rollno ==
                            allStudentDetails_hash[$scope.Customers[l_count].rollno].rollno) {

                            $scope.isBalanceGreaterThanActualFee = 0;
                            $scope.balanceRemainingFromTotalPayable = 0
                            $scope.insertArrayRowByRow = [];
                            var isAnyFeeIsDue = false;

                            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/feeallotment/student?student_id='
                                + allStudentDetails_hash[$scope.Customers[l_count].rollno]._id);
                            requestHandle.then(function (result) {
                                if (result.success) {
                                    $scope.getFeeDetailsOfSingleStudent = result.data;

                                    for (var i = 0; i < $scope.listOfColumnNames.length; i++) {

                                        var splitFeeName = $scope.listOfColumnNames[i].toUpperCase();
                                        var toPushFeeNotFound = true;


                                        if (splitFeeName == 'NAME' || splitFeeName == 'ROLLNO' || splitFeeName == 'CONTACT') {

                                            //$scope.analyzedArray = [];
                                            //$scope.insertArrayRowByRow = [];

                                            if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined ||
                                                $scope.Customers[l_count][$scope.listOfColumnNames[i]] == '') {
                                                $scope.insertArrayRowByRow.push('EMPTY')
                                            }
                                            else {
                                                $scope.insertArrayRowByRow.push($scope.Customers[l_count][$scope.listOfColumnNames[i]])
                                            }

                                        }
                                        else {

                                            if (splitFeeName == 'BALANCE' || splitFeeName == 'STATUS' || splitFeeName == 'PREVIOUS BALANCE') {

                                            }
                                            else {
                                                $scope.toPayInstallmentNumber = [];

                                                $scope.isBalanceGreaterThanActualFee = $scope.Customers[l_count][$scope.listOfColumnNames[i]];

                                                //var splitFeeName = $scope.listOfColumnNames[i].toUpperCase();

                                                for (var j = 0; j < $scope.getFeeDetailsOfSingleStudent.fees_details.length; j++) {

                                                    var isFeeDue = false;
                                                    var isFeePaid = false;
                                                    $scope.toPayInstallmentNumber = [];

                                                    if ($scope.getFeeDetailsOfSingleStudent.fees_details[j].feecatname == splitFeeName) {

                                                        //Fee name Matched 

                                                        var obj = $scope.getFeeDetailsOfSingleStudent.fees_details[j].feesubcat.installments;

                                                        for (var key in obj) {

                                                            var attrValue = obj[key];
                                                            //var installmentNumber = attrValue.name;

                                                            if (attrValue.status == 'DUE') {

                                                                isFeeDue = true;

                                                                if (attrValue.amount <= $scope.isBalanceGreaterThanActualFee) {

                                                                    $scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee - attrValue.amount);

                                                                    $scope.toPayInstallmentNumber.push(attrValue.name)
                                                                    isAnyFeeIsDue = true;
                                                                }
                                                                else {
                                                                    //isAnyFeeIsDue = false;
                                                                    //$scope.isBalanceGreaterThanActualFee = parseInt($scope.isBalanceGreaterThanActualFee);
                                                                }

                                                            }
                                                            else if (attrValue.status == 'PAID') {
                                                                isFeePaid = true;
                                                            }
                                                        }

                                                        if (isFeeDue) {

                                                            if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined ||
                                                                $scope.Customers[l_count][$scope.listOfColumnNames[i]] == '') {
                                                                $scope.insertArrayRowByRow.push('EMPTY');
                                                                $scope.isBalanceGreaterThanActualFee = $scope.isBalanceGreaterThanActualFee;
                                                            }
                                                            else {
                                                                if ($scope.toPayInstallmentNumber.length == 0) {
                                                                    $scope.isBalanceGreaterThanActualFee = $scope.isBalanceGreaterThanActualFee;
                                                                    $scope.insertArrayRowByRow.push('INSUFF. AMOUNT')
                                                                }
                                                                else {

                                                                    // Convert Array into simple string data
                                                                    $scope.arrayToString = function (string) {
                                                                        return string.join(", ");
                                                                    };

                                                                    $scope.insertArrayRowByRow.push($scope.arrayToString($scope.toPayInstallmentNumber))
                                                                }

                                                            }
                                                        }
                                                        else if (isFeePaid) {

                                                            if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined ||
                                                                $scope.Customers[l_count][$scope.listOfColumnNames[i]] == '') {
                                                                $scope.insertArrayRowByRow.push('EMPTY')
                                                            }
                                                            else {
                                                                $scope.insertArrayRowByRow.push('ALREADY PAID')
                                                            }
                                                        }

                                                    }
                                                    else {
                                                        // Fee name not matched

                                                        isFeeNamePresent = $scope.getFeeDetailsOfSingleStudent.fees_details.some(function (obj) {
                                                            return splitFeeName == obj.feecatname;
                                                        });

                                                        if (!isFeeNamePresent) {

                                                            if (toPushFeeNotFound) {
                                                                $scope.insertArrayRowByRow.push('NOT FOUND')
                                                            }
                                                        }
                                                        toPushFeeNotFound = false;

                                                    }

                                                    // 
                                                    if ($scope.toPayInstallmentNumber.length != 0) {
                                                        isAnyFeeIsDue = true;
                                                    }
                                                }

                                                if (typeof ($scope.isBalanceGreaterThanActualFee) == "number") {

                                                    $scope.balanceRemainingFromTotalPayable = parseInt($scope.balanceRemainingFromTotalPayable + $scope.isBalanceGreaterThanActualFee);
                                                }
                                            }

                                        }
                                        //console.log($scope.isBalanceGreaterThanActualFee);
                                        //console.log($scope.balanceRemainingFromTotalPayable);
                                        // Adding balance to get total due balance

                                    }

                                    //console.log($scope.balanceRemainingFromTotalPayable);

                                    //Push current total remaining balance
                                    $scope.insertArrayRowByRow.push($scope.balanceRemainingFromTotalPayable);


                                    //Push previous remaining balance
                                    $scope.insertArrayRowByRow.push(allStudentDetails_hash[$scope.Customers[l_count].rollno].balance);

                                    if (isAnyFeeIsDue) {
                                        $scope.totalSuccessRowCount = $scope.totalSuccessRowCount + 1;
                                        $scope.insertArrayRowByRow.push('OK');
                                    }
                                    else {
                                        $scope.insertArrayRowByRow.push('ERROR');
                                    }
                                    //console.log($scope.insertArrayRowByRow);
                                    $scope.analyzedArray.push($scope.insertArrayRowByRow);
                                    l_count++;
                                    excelDataObjectFunction(l_count);
                                }
                            })

                        }


                    }
                    else {
                        //roll not matched

                        l_count++;
                        excelDataObjectFunction(l_count);
                    }
                }
                else {
                    //student not found

                    $scope.insertArrayRowByRow = [];
                    for (var i = 0; i < $scope.listOfColumnNames.length; i++) {

                        if ($scope.listOfColumnNames[i].toUpperCase() == 'ROLLNO') {

                            $scope.insertArrayRowByRow.push('STUDENT NOT FOUND');
                            /*if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined) {
                                $scope.insertArrayRowByRow.push('STUDENT NOT FOUND');
                            }
                            else {
                                $scope.insertArrayRowByRow.push($scope.Customers[l_count][$scope.listOfColumnNames[i]]);
                            }*/
                        }
                        else {
                            if ($scope.listOfColumnNames[i].toUpperCase() == 'NAME') {

                                if ($scope.Customers[l_count][$scope.listOfColumnNames[i]] == undefined) {
                                    $scope.insertArrayRowByRow.push('EMPTY');
                                }
                                else {
                                    $scope.insertArrayRowByRow.push($scope.Customers[l_count][$scope.listOfColumnNames[i]]);
                                }
                            }
                            else {
                                $scope.insertArrayRowByRow.push('EMPTY');
                            }

                        }
                    }
                    $scope.analyzedArray.push($scope.insertArrayRowByRow);
                    l_count++;
                    excelDataObjectFunction(l_count);
                }
            }
            else {
                $scope.showSuccessAndErrorRows = true;
            }
        }

    }

    $scope.confirmDeleteFeesFunction = function (all) {
        all.confirm = true;
    }

    $scope.cancelDeleteFeesFunction = function (all) {
        all.confirm = false;
    }

    $scope.deleteFeesCollection = function (all) {
        all.confirm = false;

        $rootScope.mypageloading = true;

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/feespaid/deleteFee/' + all._id);
        requestHandle.then(function (result) {
            if (result.success) {

                $scope.allfeePaidList();
                //$rootScope.mypageloading* = false;
            }
            else {
                $rootScope.mypageloading = false;
                window.alert('Something went wrong.');
            }
        })

    }

    //All Functions are closed

});