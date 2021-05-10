app.controller('feeDetailsController', function ($rootScope, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $indexedDB, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    $scope.styles = {
        "box-shadow": "rgb(136, 136, 136) 0px 4px 4px 4px"
    }
    $scope.headerStyles = {
        "color": "white",
        "background": "rgb(78, 205, 196)"
    }

    $scope.selectedItem = "to_be_collected"
    $scope.total_paid = "Total paid"
    $scope.total_collected = "Total collected"
    $scope.total_remainy = "Total remainy"
    $scope.total_defaulties = "Total defaulties"
    $scope.selectedItemName = "Total paid"

    $scope.defaulties = [{
        id: 0,
        class_name: "6th",
        student_name: "Riya Shah",
        section: "A",
        amount: 40000
    },
    {
        id: 0,
        class_name: "7th",
        student_name: "Rahul Gupta",
        section: "B",
        amount: 35000
    }]

    $scope.remainy = [{
        id: 0,
        class_name: "6th",
        student_name: "Rohit Chouhan",
        section: "A",
        amount: 25000
    },
    {
        id: 0,
        class_name: "7th",
        student_name: "Amy Jakson",
        section: "B",
        amount: 20000
    }]

    $scope.collected = [{
        id: 0,
        class_name: "6th",
        student_name: "Pavan Sharma",
        section: "A",
        amount: 100000
    },
    {
        id: 0,
        class_name: "7th",
        student_name: "Juhi Jain",
        section: "B",
        amount: 100000
    }]

    $scope.to_be_collected = [{
        id: 0,
        class_name: "6th",
        student_name: "Harish Ayyar",
        section: "A",
        amount: 50000
    },
    {
        id: 0,
        class_name: "7th",
        student_name: "Lokendra Solanki",
        section: "B",
        amount: 700000
    }]

    $scope.selectItemType = function (type, name) {
        $scope.searchTerm = "";
        $scope.selectedItem = type;
        $scope.selectedItemName = name;
    }


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
        });
        $log.debug('HandShakeService.existingStudentList passed');

    }
    $scope.getAllStudent();


    $scope.allfeePaidList = function () {
        $rootScope.mypageloading = true;
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

                $rootScope.mypageloading = false;

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
        } else  if (j == 3 && k != 13) {
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
        console.log(data.name);
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
        }
        if (payloadRequest.paymentmode == 'NEFT/RTGS') {
            if (payloadRequest.paymentmodedetails.transaction_number == '' || payloadRequest.paymentmodedetails.transaction_number == undefined) {
                FlashService.Error('Please Enter transaction number');
                return false;

            }
        }
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

        var printContents = document.getElementById("printSectionId").innerHTML;
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;

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







});
// app.directive('innerHeader', function ($rootScope) {
//     return {
//         scope: {
//             selectedItem="=",
//             styles: "=",
//             title: "@",
//             type: "@"
//         },
//         template: '<div class="white-header" ng-style="{selectedItem ===type ? styles: \'\'}">' +
//         '<h5 ng-style="selectedItem === type ? {\'font-size\': \'19px\'}: \'\'">{{title}}, {{}}</h5>' +
//         '</div>'
//     }
// })

