app.controller('enquiryController', function ($rootScope,FlashService, $scope, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

    $rootScope.showBackStrech = false;
    UtilService.setSidebar();

    $scope.allEnquiryDetails = [];
    $scope.getAllEnquiryDetails = [];
    $scope.showAddOrUpdateModal = false;
    $scope.isModalAddOrUpdate = '';

    $scope.bloodGroupList = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-', 'NA'];

    $scope.getEnquiryFunction = function () {

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/enquiry/getall');
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.getAllEnquiryDetails = response.data;
                    //console.log($scope.getAllEnquiryDetails);
                    $rootScope.mypageloading = false;
                }
            } else {
                $scope.getAllEnquiryDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.showAddOrUpdateModalFunction = function () {

        //console.log((new Date()).toDateString());
        FlashService.Error('');

        $scope.showAddOrUpdateModal = true;
        $scope.isModalAddOrUpdate = 'addEnquiry';

        $scope.allEnquiryDetails._id = '';
        $scope.allEnquiryDetails.name = '';
        $scope.allEnquiryDetails.fathername = '';
        $scope.allEnquiryDetails.mothername = '';
        $scope.allEnquiryDetails.address = '';
        $scope.allEnquiryDetails.city = '';
        $scope.allEnquiryDetails.gender = '';
        $scope.allEnquiryDetails.contact = '';
        $scope.allEnquiryDetails.grade_id = '';
        $scope.allEnquiryDetails.dob = '';
        $scope.allEnquiryDetails.blood = '';
       
        $scope.allEnquiryDetails.parent_contact = '';
        $scope.allEnquiryDetails.parent_email = '';
        $scope.allEnquiryDetails.guardian_name = '';
        $scope.allEnquiryDetails.guardian_contact = '';
        //$scope.allEnquiryDetails.enquiry_date = new date();
        $scope.allEnquiryDetails.last_school = '';
        $scope.allEnquiryDetails.admission_form_issued = false;
        $scope.allEnquiryDetails.transport = false;
        $scope.allEnquiryDetails.mess = false;
        $scope.allEnquiryDetails.hostel = false;

    }

    $scope.addEnquiryFunction = function () {

        FlashService.Error('');

        if ($scope.allEnquiryDetails.name == undefined || $scope.allEnquiryDetails.name == '') {
            FlashService.Error('Please enter name');
            return false
        }

        if ($scope.allEnquiryDetails.grade_id == undefined || $scope.allEnquiryDetails.grade_id == '') {
            FlashService.Error('Please enter class');
            return false
        }

        if ($scope.allEnquiryDetails.contact == undefined || $scope.allEnquiryDetails.contact == '') {
            FlashService.Error('Please enter contact');
            return false
        }

        if ($scope.allEnquiryDetails.contact < 1) {
            FlashService.Error('Please enter correct contact');
            return false
        }

        if ($scope.allEnquiryDetails.gender == undefined || $scope.allEnquiryDetails.gender == '') {
            FlashService.Error('Please select gender');
            return false
        }

        if ($scope.allEnquiryDetails.dob == undefined || $scope.allEnquiryDetails.dob == '') {
            $scope.allEnquiryDetails.dob == '';
        }
        else {
            $scope.allEnquiryDetails.dob = $scope.allEnquiryDetails.dob.toDateString();
        }

        if ($scope.allEnquiryDetails.blood == undefined || $scope.allEnquiryDetails.blood == '') {
            $scope.allEnquiryDetails.blood = 'Unknown';
        }
        else {
            $scope.allEnquiryDetails.blood = $scope.bloodGroupList[$scope.allEnquiryDetails.blood];
        }

        $rootScope.mypageloading = true;

        var payLoadData = {

            "name": $scope.allEnquiryDetails.name,
            "fathername": $scope.allEnquiryDetails.fathername,
            "mothername": $scope.allEnquiryDetails.mothername,
            "address": $scope.allEnquiryDetails.address,
            "city": $scope.allEnquiryDetails.city,
            "gender": $scope.allEnquiryDetails.gender,
            "contact": parseInt($scope.allEnquiryDetails.contact),
            "grade_id": $scope.allEnquiryDetails.grade_id,
            "dob": $scope.allEnquiryDetails.dob,
            "blood": $scope.allEnquiryDetails.blood,
           
            "parent_contact": $scope.allEnquiryDetails.parent_contact,
            "parent_email": $scope.allEnquiryDetails.parent_email,
            "guardian_name": $scope.allEnquiryDetails.guardian_name,
            "guardian_contact": $scope.allEnquiryDetails.guardian_contact,
            // "enquiry_date": $scope.allEnquiryDetails.enquiry_date,
            "last_school": $scope.allEnquiryDetails.last_school,
            "admission_form_issued": $scope.allEnquiryDetails.admission_form_issued,
            "transport": $scope.allEnquiryDetails.transport,
            "mess": $scope.allEnquiryDetails.mess,
            "hostel": $scope.allEnquiryDetails.hostel

        }

        var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/enquiry/addenquiry', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    //$scope.allEnquiryDetails = response.data;
                    $scope.showAddOrUpdateModal = false;
                    $scope.getEnquiryFunction();
                    $rootScope.mypageloading = false;
                }
            } else {
                $scope.allEnquiryDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.getSingleEnquiryDetailsFunction = function (details) {

        $scope.showAddOrUpdateModal = true;
        $scope.isModalAddOrUpdate = 'updateEnquiry';

        $scope.allEnquiryDetails.parent_contact = '';
        $scope.allEnquiryDetails.parent_email = '';
        $scope.allEnquiryDetails.guardian_name = '';
        $scope.allEnquiryDetails.guardian_contact = '';
        //$scope.allEnquiryDetails.enquiry_date = new date();
        $scope.allEnquiryDetails.last_school = '';
        $scope.allEnquiryDetails.admission_form_issued = false;
        $scope.allEnquiryDetails.transport = false;
        $scope.allEnquiryDetails.mess = false;
        $scope.allEnquiryDetails.hostel = false;
        $scope.allEnquiryDetails.dob = '';

        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/enquiry/getenquirybynum?number=' + details.enquiry_number);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.allEnquiryDetails._id = response.data[0]._id;
                    $scope.allEnquiryDetails.name = response.data[0].name;
                    $scope.allEnquiryDetails.fathername = response.data[0].fathername;
                    $scope.allEnquiryDetails.mothername = response.data[0].mothername;
                    $scope.allEnquiryDetails.address = response.data[0].address;
                    $scope.allEnquiryDetails.city = response.data[0].city;
                    $scope.allEnquiryDetails.gender = response.data[0].gender;
                    $scope.allEnquiryDetails.contact = parseInt(response.data[0].contact2);
                    $scope.allEnquiryDetails.grade_id = response.data[0].grade_id;
                    //$scope.allEnquiryDetails.dob = response.data[0].dob;
                    $scope.allEnquiryDetails.blood = response.data[0].blood;
                    // $scope.allEnquiryDetails.stop_id = response.data[0].stop_id;

                    $scope.allEnquiryDetails.admission_form_issued = response.data[0].admission_form_issued;
                    $scope.allEnquiryDetails.transport = response.data[0].transport;
                    $scope.allEnquiryDetails.mess = response.data[0].mess;
                    $scope.allEnquiryDetails.hostel = response.data[0].hostel;

                    // var getDate = new Date(response.data[0].dob);
                    // //console.log(getDate);
                    // var datestring = getDate.getFullYear() + "-" + ("0" + (getDate.getMonth() + 1)).slice(-2) + "-" + ("0" + getDate.getDate()).slice(-2);
                    // //console.log(datestring);
                    // $scope.allEnquiryDetails.dob = datestring;

                    if(response.data[0].dob != ''){
                        $scope.allEnquiryDetails.dob = new Date(response.data[0].dob);
                    }
                    else{
                        $scope.allEnquiryDetails.dob = 'NA';
                    }
                    
                    $rootScope.mypageloading = false;
                }
            } else {
                //$scope.allEnquiryDetails = [];
                $rootScope.mypageloading = false;
            }
        });

    }

    $scope.updateEnquiryFunction = function () {

        FlashService.Error('');

        if ($scope.allEnquiryDetails.name == undefined || $scope.allEnquiryDetails.name == '') {
            FlashService.Error('Please enter name');
            return false
        }

        if ($scope.allEnquiryDetails.contact == undefined || $scope.allEnquiryDetails.contact == '') {
            FlashService.Error('Please enter contact');
            return false
        }

        if ($scope.allEnquiryDetails.contact < 1) {
            FlashService.Error('Please enter correct contact');
            return false
        }

        $rootScope.mypageloading = true;

        var payLoadData = {

            "_id": $scope.allEnquiryDetails._id,
            "name": $scope.allEnquiryDetails.name,
            "fathername": $scope.allEnquiryDetails.fathername,
            "mothername": $scope.allEnquiryDetails.mothername,
            "address": $scope.allEnquiryDetails.address,
            "city": $scope.allEnquiryDetails.city,
            //"gender": $scope.allEnquiryDetails.gender,
            "contact": parseInt($scope.allEnquiryDetails.contact),
            "grade_id": $scope.allEnquiryDetails.grade_id,
            // "dob": $scope.allEnquiryDetails.dob.toDateString(),
            //"dob": new Date($scope.allEnquiryDetails.dob),
            //"blood": $scope.allEnquiryDetails.blood,
            
            "parent_contact": $scope.allEnquiryDetails.parent_contact,
            "parent_email": $scope.allEnquiryDetails.parent_email,
            "guardian_name": $scope.allEnquiryDetails.guardian_name,
            "guardian_contact": $scope.allEnquiryDetails.guardian_contact,
            // "enquiry_date": $scope.allEnquiryDetails.enquiry_date,
            "last_school": $scope.allEnquiryDetails.last_school,
            "admission_form_issued": $scope.allEnquiryDetails.admission_form_issued,
            "transport": $scope.allEnquiryDetails.transport,
            "mess": $scope.allEnquiryDetails.mess,
            "hostel": $scope.allEnquiryDetails.hostel
        }

        var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/enquiry/updateenquiry', payLoadData);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.showAddOrUpdateModal = false;
                    $scope.getEnquiryFunction();
                    //$rootScope.mypageloading = false;
                }
            } else {
                //$scope.allEnquiryDetails = [];
                $rootScope.mypageloading = false;
            }
        });
    }

    $scope.confirmEnquiryFunction = function (details) {
        details.confirm = true;
    }

    $scope.cancelEnquiryFunction = function (details) {
        details.confirm = false;
    }


    $scope.deleteEnquiryFunction = function (details) {

        details.confirm = false;

        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/enquiry/delete?number=' + details.enquiry_number);
        requestHandle.then(function (response) {
            if (response.success == true) {
                if (response.data != undefined && response.data != null && response.data != '') {

                    $scope.getEnquiryFunction();
                    //$rootScope.mypageloading = false;
                }
            } else {
                $rootScope.mypageloading = false;
            }
        });
    }


    $scope.getEnquiryFunction();
});