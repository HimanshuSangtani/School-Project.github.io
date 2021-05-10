app.controller('bookcontroller', function ($rootScope, $interval, $location, HandShakeService, FlashService, $scope, $log, UtilService, HttpService, $window, $sessionStorage, $timeout, $firebaseAuth, Auth) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = false;
    $scope.addBookSection = false;

    $scope.searchBooks;
    $scope.tagname;
    $scope.RFIDno;
    $scope.showaddRFID = false;
    $scope.showaddTAGS = false;

    $scope.tagList = [];
    $scope.BookList = [];
    $scope.listofRFID = [];
    $scope.addBookDetails = {}

    $scope.showaddbook = function(){
        $scope.addBookSection = true
    }
    /*------------------- Tags -------------*/
    $scope.showaddtags = function(){
        $scope.showaddTAGS = true;
    }
    $scope.addTags = function (tag) {
        $scope.tagList.push(tag);
        $scope.tagname = null;
        $scope.showaddTAGS = false;
    }
    $scope.removeTags = function (index) {
        if (index > -1) {
            $scope.tagList.splice(index, 1);
        }
    }

    /*------------------- RFIDs ------------*/
    $scope.showaddrfid = function(){
        $scope.showaddRFID = true;
    }
    $scope.addRFIDS = function (rfid) {
        $scope.listofRFID.push(rfid);
        $scope.RFIDno = null;
        $scope.showaddRFID = false;
    }
    $scope.removeRfID = function (index) {
        if (index > -1) {
            $scope.listofRFID.splice(index, 1);
        }
    }

    /*------------------- Book Details -------------*/
    $scope.addBooks = function (bookdetail) {
        $rootScope.mypageloading = true;
        bookdetail.rfid_list = $scope.listofRFID;
        bookdetail.tags = $scope.tagList;
        bookdetail.available_quantity = $scope.listofRFID.length;
        var requestHandle;
        if (bookdetail._id)
            requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/library/book/' + bookdetail._id, bookdetail);
        else
            requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/library/book/add', bookdetail);

        requestHandle.then(function (result) {
            if (result.success == true) {
                $rootScope.mypageloading = false;
                $scope.tagList = [];
                $scope.listofRFID = [];
                $scope.addBookDetails = {}
                $scope.addBookSection = false;
                $scope.showaddRFID = false;
                $scope.showaddTAGS = false;
                $scope.getBookList();
            } else {
                $rootScope.mypageloading = false;
                // $scope.examList=[];
            }
        })
    }

    $scope.getBookList = function () {
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/library/book/list?currentPage=1');
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.BookList = result.data.bookList;
                $rootScope.mypageloading = false;
            } else {
                $rootScope.mypageloading = false;
                // $scope.examList=[];
            }
        })
    }
    $scope.getBookList();

    $scope.getBookdata = function (bookid) {
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/library/book/book-detail/' + bookid);
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.addBookSection = true;
                $scope.tagList = result.data.bookInf.tags;
                $scope.listofRFID = result.data.bookInf.rfid_list;
                $scope.addBookDetails = result.data.bookInf;
                console.log("Update : ", $scope.addBookDetails);
                $rootScope.mypageloading = false;
            } else {
                $rootScope.mypageloading = false;
                // $scope.examList=[];
            }
        })
    }

    $scope.deleteBooks = function (bookid) {
        $rootScope.mypageloading = true;
        var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/library/book/' + bookid);
        requestHandle.then(function (result) {
            if (result.success == true) {
                $scope.getBookList();
                $rootScope.mypageloading = false;
            } else {
                $rootScope.mypageloading = false;
            }
        })
    }
});
