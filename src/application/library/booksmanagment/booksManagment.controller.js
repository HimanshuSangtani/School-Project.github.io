app.controller('booksmanagmentcontroller', function ($rootScope, $interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $window, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = false;
    $scope.isOpenBookIssueModel = false;
    $scope.bookIssusList = []
    $scope.bookIssueObj = {
        book_rfid: '',
        student_rfid: '',
        return_date: '',
        is_book_issue: true
    }
    $scope.currentBookDetail = {}
    $scope.currentStudentDetail = {}

    $scope.getBookIssueList = function(){
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + "/library/book/getBookIssueStatus/");
        requestHandle.then(function (response) {
            if (response.success){
                $scope.bookIssusList = response['data']['bookIssueInfo']
                $rootScope.mypageloading = false;
            }
            else{
                $scope.bookIssusList = []
                $rootScope.mypageloading = false;
            }
        })
    };
    $scope.getBookIssueList();

    $scope.getStudentDetail = function(){
        if($scope.bookIssueObj.student_rfid){
            $rootScope.mypageloading = true;
            HandShakeService.getAllStudentInfo().then(function (result) {
                angular.forEach(result, function (studentObj) {
                    if(studentObj['rfid'] == parseInt($scope.bookIssueObj.student_rfid)){
                        $scope.currentStudentDetail = studentObj;
                    }
                });
                $rootScope.mypageloading = false;
            });
        }
    };
    

    $scope.getCurrentBookDetail = function(){
        if($scope.bookIssueObj.book_rfid){
            $rootScope.mypageloading = true;
            var requestHandle = HttpService.HttpGetData($rootScope.serverURL + "/library/book/getBookByRfid/" + 
                $scope.bookIssueObj.book_rfid);
            requestHandle.then(function (response) {
                if (response.success){
                    $scope.currentBookDetail = response['data']['bookInfo']
                    $rootScope.mypageloading = false;
                }
                else{
                    $scope.currentBookDetail = {}
                    $rootScope.mypageloading = false;
                }
            })
        }
    };

    $scope.openBookIssueModel = function(){
        $scope.currentBookDetail = {}
        $scope.currentStudentDetail = {}
        $scope.bookIssueObj = {
            book_rfid: '',
            student_rfid: '',
            return_date: '',
            is_book_issue: true
        }
        $scope.isOpenBookIssueModel = true;
    }

    $scope.submitBookIssueOrReturnRequest = function(){
        if($scope.bookIssueObj.is_book_issue == true){
            $rootScope.mypageloading = true;
            var payload = {
                book_id: $scope.currentBookDetail['_id'],
                book_rfid:  $scope.bookIssueObj['book_rfid'],
                student_id: $scope.currentStudentDetail['_id'],
                book_expected_return_time: $scope.bookIssueObj['return_date'].getTime(),
                penalty_days: 0
            }
            console.log(payload)
            if($scope.bookIssueObj.book_rfid){
                var requestHandle = HttpService.HttpPostData($rootScope.serverURL + "/library/book/bookIssue",
                   payload);
                requestHandle.then(function (response) {
                    if(response.success){
                        $scope.currentBookDetail = {}
                        $scope.currentStudentDetail = {}
                        $scope.bookIssueObj = {
                            book_rfid: '',
                            student_rfid: '',
                            return_date: '',
                            is_book_issue: true
                        }
                        $scope.isOpenBookIssueModel = false;
                        $rootScope.mypageloading = false;
                        $scope.getBookIssueList();
                    }
                    else{
                        $rootScope.mypageloading = false;
                    }
                })
            }
        }
        else{
            $rootScope.mypageloading = true;
            if($scope.bookIssueObj.book_rfid){
                var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + "/library/book/bookReturn/" + 
                    $scope.bookIssueObj.book_rfid, {});
                requestHandle.then(function (response) {
                    if(response.success){
                        $scope.currentBookDetail = {}
                        $scope.currentStudentDetail = {}
                        $scope.bookIssueObj = {
                            book_rfid: '',
                            student_rfid: '',
                            return_date: '',
                            is_book_issue: true
                        }
                        $scope.isOpenBookIssueModel = false;
                        $rootScope.mypageloading = false;
                        $scope.getBookIssueList();
                    }
                    else{
                        $rootScope.mypageloading = false;
                    }
                })
            }

        }
    }

});
