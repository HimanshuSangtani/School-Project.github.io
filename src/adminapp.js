'use strict';

var app = angular.module('TrackWebApp', ['ngRoute', 'ngCookies', 'ngResource', 'angular-jwt', 'ngStorage',
    'indexedDB', 'firebase', '720kb.datepicker', 'ngFileUpload'
]);
/**
 * Configure the Routes
 */
app.config(['$routeProvider', '$indexedDBProvider', '$logProvider', function ($routeProvider, $indexedDBProvider, $logProvider) {
    $routeProvider
        // Home
        .when("/dashboard", {
            templateUrl: "./src/application/maps/maps.html",
            controller: "MapController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/maps/:deviceId", {
            templateUrl: "./src/application/maps/maps.html",
            controller: "MapController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/login", { templateUrl: "./src/application/login/login.html", controller: "LoginController", controllerAs: 'credentials' })
        //                .when("/register", {templateUrl: "register.view.html", controller: "RegisterController", controllerAs: 'vm'})
        .when("/bus", {
            templateUrl: "src/application/bus/bus.html",
            controller: "busDBController",
            controllerAs: 'busInfo',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/routes", {
            templateUrl: "src/application/route/route.html",
            controller: "routeController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/subject", {
            templateUrl: "src/application/subject/subject.html",
            controller: "subjectController",
            controllerAs: 'routeInfo',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/routes/:routeID", {
            templateUrl: "src/application/route/routeinfo.html",
            controller: "routeInfoController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/routes/add", {
            templateUrl: "src/application/route/routeadd.html",
            controller: "routeAddController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/routes/view/:routeID", {
            templateUrl: "src/application/route/routeView.html",
            controller: "RouteViewController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/students", {
            templateUrl: "src/application/students/class.html",
            controller: "classController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/newFee", {
            templateUrl: "src/application/feeNew/newFee.html",
            controller: "newFeeController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/newFee/:feeID", {
            templateUrl: "src/application/feeNew/subCategory.html",
            controller: "subCategoryController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/studentsall", {
            templateUrl: "src/application/students/studentsall.html",
            controller: "studentsAllController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/students/:classID", {
            templateUrl: "src/application/students/students.html",
            controller: "studentsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/course/:courseID/students", {
            templateUrl: "src/application/students/course-student-list.html",
            controller: "courseStudentsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/questions", {
            templateUrl: "src/application/questions/questions.html",
            controller: "questionsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        }).when("/teachers", {
            templateUrl: "src/application/teachers/teachers.html",
            controller: "teachersController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        }).when("/homework", {
            templateUrl: "src/application/homework/homework.html",
            controller: "homeworkController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/exam", {
            templateUrl: "src/application/exam/exam.html",
            controller: "examController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/exam/set", {
            templateUrl: "src/application/exam/setUpdateExamPaper.html", 
            controller: "setUpdateExamController", 
            resolve: {
                delay: function($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function(fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function(error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/exam/update/:ExamID", {
            templateUrl: "src/application/exam/setUpdateExamPaper.html", 
            controller: "setUpdateExamController", 
            resolve: {
                delay: function($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function(fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function(error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/exam/preview/:PreviewExamID", {
            templateUrl: "src/application/exam/setUpdateExamPaper.html", 
            controller: "setUpdateExamController", 
            resolve: {
                delay: function($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function(fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function(error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/fees/feesType", {
            templateUrl: "src/application/fees/feesType/feesType.html",
            controller: "feesTypeController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/fees/feesSubCategory", {
            templateUrl: "src/application/fees/feesSubCategory/feesSubCategory.html",
            controller: "feesSubCategoryController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/fees/feesAllotment", {
            templateUrl: "src/application/fees/feesAllotment/feesAllotment.html",
            controller: "feesAllotmentController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/fees/feeCollection", {
            templateUrl: "src/application/fees/feeCollection/feeCollection.html",
            controller: "feeCollectionController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/fees/feeDetails", {
            templateUrl: "src/application/fees/feeDetails/feeDetails.html",
            controller: "feeDetailsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/fees/feeReports", {
            templateUrl: "src/application/fees/feeReports/feeReports.html",
            controller: "feeReportsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/fees/pocketMoney", {
            templateUrl: "src/application/fees/pocketMoney/pocketmoney.html",
            controller: "pocketmoneyController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/studentAttendance", {
            templateUrl: "src/application/studentAttendance/studentAttendance.html",
            controller: "studentAttendanceController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })


        .when("/gatettendance", {
            templateUrl: "src/application/gateAttendance/gateattendance.html",
            controller: "GateAttendanceController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })


        .when("/gatepass", {
            templateUrl: "src/application/gatepass/gatepass.html",
            controller: "gatepassController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })


        .when("/announce", {
            templateUrl: "src/application/announcement/announcement.html",
            controller: "announcementController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/currentstatus", {
            templateUrl: "src/application/currentStatus/currentStatus.html",
            controller: "statusController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/profile", {
            templateUrl: "src/application/profile/profilesettings.html",
            controller: "profileSettingsController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/alertsetting", {
            templateUrl: "src/application/settings/alertsettings.html",
            controller: "alertSettingsController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/reports", {
            templateUrl: "src/application/reports/reports.html",
            controller: "ReportsController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/reports/:historybusno", {
            templateUrl: "src/application/reports/reports.html",
            controller: "ReportsController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/classattendance", {
            templateUrl: "src/application/classattendance/classattendance.html",
            controller: "ClassAttendanceController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/attendance", {
            templateUrl: "src/application/attendance/attendance.html",
            controller: "AttendanceController",
            controllerAs: 'vm',
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/geofence", {
            templateUrl: "src/application/geofence/geofence.html",
            controller: "geofenceController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/geofenceadd", {
            templateUrl: "src/application/geofence/geofenceAdd.html",
            controller: "geofenceAddController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/geofence/:geofenceId", {
            templateUrl: "src/application/geofence/geofenceView.html",
            controller: "geofenceController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/gateattendance", {
            templateUrl: "src/application/gateAttendance/gateattendance.html",
            controller: "GateAttendanceController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/smsreports", {
            templateUrl: "src/application/smsReports/smsreports.html",
            controller: "smsReportsController",
            resolve: {

                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/calender", {
            templateUrl: "src/application/eventCalender/calender.html",
            controller: "calenderController",
            resolve: {

                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/course-purchase", {
            templateUrl: "src/application/learningApp/course_purchase.html",
            controller: "coursePurchaseController",
            resolve: {
                delay: function($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function(fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function(error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/enquiry", {
                templateUrl: "src/application/enquiry/enquiry.html",
                controller: "enquiryController",
                resolve: {

                    delay: function ($q, InitService, Auth, $location) {
                        var defer = $q.defer();
                        Auth.$requireSignIn().then(function (fbuser) {
                            InitService.handshakeInit(fbuser, defer);
                        }, function (error) {
                            $location.path('/login');
                            defer.reject();
                        });
                        return defer.promise;
                    }
                }
            })
            .when("/academic-session", {
                templateUrl: "src/application/academicSession/academicsession.html",
                controller: "academicSessionController",
                resolve: {

                    delay: function ($q, InitService, Auth, $location) {
                        var defer = $q.defer();
                        Auth.$requireSignIn().then(function (fbuser) {
                            InitService.handshakeInit(fbuser, defer);
                        }, function (error) {
                            $location.path('/login');
                            defer.reject();
                        });
                        return defer.promise;
                    }
                }
            })
        .when("/timeTable/slots", {
            templateUrl: "src/application/timeTable/slots/slots.html",
            controller: "slotsController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/timeTable/timeTable", {
            templateUrl: "src/application/timeTable/timeTablemodule/timeTable.html",
            controller: "timeTableController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/course-subject/:courseId", {
            templateUrl: "src/application/course/subject/subject.html",
            controller: "courseSubjectController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/course-subject/chapter/:courseId/:subjectId", {
            templateUrl: "src/application/course/chapter/chapter.html",
            controller: "courseChapterController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        .when("/course-subject/chapter/topic/:courseId/:subjectId/:chapterId", {
            templateUrl: "src/application/course/topic/topic.html",
            controller: "courseTopicController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/newbooks", {
            templateUrl: "./src/application/library/addBooks/addbook.html", controller: "bookcontroller", resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/bookmanagment", {
            templateUrl: "./src/application/library/booksmanagment/booksManagment.html", controller: "booksmanagmentcontroller", resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })
        .when("/", {
            templateUrl: "src/application/onlineClass/liveClass/liveClass.html",
            controller: "liveClassController",
            resolve: {
                delay: function ($q, InitService, Auth, $location) {
                    var defer = $q.defer();
                    Auth.$requireSignIn().then(function (fbuser) {
                        InitService.handshakeInit(fbuser, defer);
                    }, function (error) {
                        $location.path('/login');
                        defer.reject();
                    });
                    return defer.promise;
                }
            }
        })

        // else 404
        .otherwise({ redirectTo: '/' });
    $indexedDBProvider
        .connection('itrack')
        .upgradeDatabase(1, function (event, db, tx) {
            var objStoreStudent = db.createObjectStore('student', { keyPath: 'rollno' });
            objStoreStudent.createIndex('rfid', 'rfid', { unique: true });
            objStoreStudent.createIndex('gradeIndex', 'grade_id', { unique: false });
            objStoreStudent.createIndex('route_id', 'route_id', { unique: false });
            var objStoreStudent = db.createObjectStore('route', { keyPath: '_id' });
            var objStoreStudent = db.createObjectStore('class', { keyPath: 'name' });
        });
    var config = {
        apiKey: "AIzaSyDYcp-NxPhPfOmLXh3E1lFiN1eXSTMzN8I",
        authDomain: "track-kid-fa7d2.firebaseapp.com",
    };
    firebase.initializeApp(config);
    $logProvider.debugEnabled(false);
}]);
//$window.location.reload();


app.run(function ($rootScope, $log, $interval) {
    $log.debug('run');
    $rootScope.global = {
        error: '',
        buswarning: true,
        stuwarning: false,
        routewarning: false,
        showModal: false,
        showSettingSubMenu: false,
        ShowFeesmodule: false,
        ShowTimeTablemodule: false
    };

    $rootScope.rfidModule = false;

    $rootScope.toolbar = {
        visible: true
    };
    $rootScope.showSideMenu = true;
    // setTimeout(function () {
    //     $('#sidebar').addClass('hide');
    // })
    $rootScope.changeServer = function () {
        if($rootScope.selectserverUrl){
            $rootScope.serverURL = 'http://localhost:5000';
        }else{
            $rootScope.serverURL = 'https://api.zuwagon.com'
        }
        console.log("Server Url : ",$rootScope.serverURL);
    }
    $rootScope.toggleSideThruIcon = function () {
        $rootScope.showSideMenu = !$rootScope.showSideMenu;
        if ($rootScope.showSideMenu == true) {
            $('#sidebar').removeClass('hide');
        } else {
            $('#sidebar').addClass('hide');
        }
    };

    $rootScope.openSubFees = function () {
        if ($rootScope.global.ShowFeesmodule == false) {
            $rootScope.global.ShowFeesmodule = true;
        } else {
            $rootScope.global.ShowFeesmodule = false;
        }

    }
    $rootScope.closeSubFees = function () {
        $rootScope.global.ShowFeesmodule = false;
    }
    $rootScope.openTimeTable = function () {
        if ($rootScope.global.ShowTimeTablemodule == false) {
            $rootScope.global.ShowTimeTablemodule = true;
        } else {
            $rootScope.global.ShowTimeTablemodule = false;
        }

    }
    $rootScope.closeTimeTable = function () {
        $rootScope.global.ShowTimeTablemodule = false;
    }

    $rootScope.categoryLabel = {
        schoolWithRFID: 0,
        schoolWithoutRFID: 1,
        general: 2
    };

    $rootScope.stopRefresh = function () {
        if (angular.isDefined($rootScope.refreshTokenStop)) {
            $log.debug('stoprefresh:')
            $interval.cancel($rootScope.refreshTokenStop);
            $rootScope.refreshTokenStop = undefined;
        }
    };

});

function googleApiLoaded() {
    //    alert('initialize');
};


app.filter('trusted', ['$sce', function ($sce) {
    return $sce.trustAsResourceUrl;
}]);