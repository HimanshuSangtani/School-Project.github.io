module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        //Read the package.json (optional)
        pkg: grunt.file.readJSON('package.json'),
        // Metadata.
        meta: {
            basePath: '/',
            srcPath: '/src/',
            deployPath: '/deploy/'
        },
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ',
        // Task configuration.
        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                files: {
                    './src/admin-min.js':
                            ['./assets/js/*.js',
                                './assets/js/gritter/js/jquery.gritter.js',
                                './assets/js/chart-master/Chart.js',
                                './assets/js/AngularJs/1.4.8/*.js',
                                './assets/js/AngularJs/1.4.8/others/*.js',
                                './assets/js/maps/*.js',
                                './src/common/calenderPackage/core/main.js',
                                './src/common/calenderPackage/interaction/main.js',
                                './src/common/calenderPackage/daygrid/main.js',
                                './src/common/calenderPackage/timegrid/main.js',
                                './src/admin-min.js'
                            ]
                }
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            your_target: {
                files: {
                    //dest :  [src]
                    './src/admin-min.js':
                            ['./src/adminapp.js',
                                './src/common/js/*.js',
                                './src/common/services/*.js',
                                './src/application/announcement/*.js',
                                './src/application/attendance/*.js',
                                './src/application/bus/*.js',
                                './src/application/currentStatus/*.js',
                                './src/application/login/*.js',
                                './src/application/maps/*.js',
                                './src/application/profile/*.js',
                                './src/application/reports/*.js',
                                './src/application/route/*.js',
                                './src/application/settings/*.js',
                                './src/application/students/*.js', 
                                './src/application/geofence/*.js',
                                './src/application/teachers/*.js',
                                './src/application/homework/*.js',
                                './src/application/exam/*.js',
                                './src/application/questions/*.js',
                                './src/application/subject/*.js',
                                './src/application/fees/feesType/*.js',
                                './src/application/fees/feesSubCategory/*.js',
                                './src/application/timeTable/slots/*.js',
                                './src/application/onlineClass/liveClass/*.js',
                                './src/application/timeTable/timeTablemodule/*.js',
                                './src/application/fees/feesAllotment/*.js',
                                './src/application/fees/feeCollection/*.js',
                                './src/application/fees/feeDetails/*.js',
                                './src/application/fees/feeReports/*.js',
                                './src/application/fees/pocketMoney/*.js',
                                './src/application/studentAttendance/*.js',
                                './src/application/gateAttendance/*.js',
                                './src/application/smsReports/*.js',
                                './src/application/eventCalender/*.js',
                                './src/application/gatepass/*.js',
                                './src/application/enquiry/*.js',
                                './src/application/course/subject/*.js',
                                './src/application/course/chapter/*.js',
                                './src/application/course/topic/*.js',
                                './src/application/learningApp/*.js',
//                                './js/admin/app-services/*.js',
//                                './js/admin/login/*.js',
//                                './js/admin/announcement/*.js',
//                                './js/admin/bus/*.js',
//                                './js/admin/currentStatus/*.js',
//                                './js/admin/maps/*.js',
//                                './js/admin/profile/*.js',
//                                './js/admin/route/*.js',
//                                './js/admin/students/*.js',
//                                './js/admin/settings/*.js',
//                                './js/admin/Reports/*.js',
//                                './js/admin/Attendance/*.js',
                            ]
                }
            },
        },
        uglify: {
            options: {
                preserveComments: false,
            },
            js: {
                files: {
                    './src/admin-min.js': ['./src/admin-min.js']
                }

            }
        },
        cssmin: {
            target: {
                src: ["./assets/css/*.css",
                    "./assets/js/gritter/css/*.css",
                    "./assets/lineicons/*.css",
                    "./assets/css/pace/themes/*.css",
                    "./assets/font-awesome/css/*.css",
                    "./src/common/css/*.css",
                    "./src/common/calenderPackage/core/*.css",
                    "./src/common/calenderPackage/daygrid/*.css",
                    "./src/common/calenderPackage/coretimegrid/*.css",
                ]
                ,
                dest: "./assets/vendor.min.css"
            }
        }
    });

    // These plugins provide necessary tasks.
    //grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task
    //grunt.registerTask('default', ['concat']);

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //register grunt default task
    // grunt.registerTask('default', ['ngAnnotate', 'concat', 'cssmin']);
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify', 'cssmin']);

};

/*All the files in util
 * grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
 *
 * 
 *   files: {
 './admin/admin-min.js': ['./assets/js/*.js', './assets/js/gritter/js/jquery.gritter.js', './assets/js/AngularJs/1.4.8/*.js',
 './assets/js/AngularJs/1.4.8/others/*.js', './assets/js/maps/*.js', './admin/admin-min.js'],
 './parents/parents-min.js': ['./assets/js/*.js', './assets/js/gritter/js/jquery.gritter.js', './assets/js/AngularJs/1.4.8/*.js',
 './assets/js/AngularJs/1.4.8/others/*.js', './assets/js/maps/*.js', './parents/parents-min.js'],
 './superadmin/superadmin-min.js': ['./assets/js/*.js', './assets/js/gritter/js/jquery.gritter.js', './assets/js/AngularJs/1.4.8/*.js',
 './assets/js/AngularJs/1.4.8/others/*.js', './superadmin/superadmin-min.js']
 }
 */