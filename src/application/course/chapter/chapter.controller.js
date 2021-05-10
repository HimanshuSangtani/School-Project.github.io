app.controller('courseChapterController', function ($rootScope, $routeParams, $location,
    $scope, $log, UtilService, HttpService, FlashService) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $scope.isAddOrUpdateChapterDialogShown = false;
    $rootScope.mypageloading = true;

    $scope.chapterList = [];
    $scope.courseId = ($routeParams.courseId) ? $routeParams.courseId : -1;
    $scope.subjectId = ($routeParams.subjectId) ? $routeParams.subjectId : -1;
    $scope.isEdit = false;
    $scope.chapterImage = {
        file: null,
        fileName: '',
        basePath: 'chapter',
        fileKey: 'chapterImage'
    }
    $scope.uploadProgress = {};
    $scope.chapterForm = {
        chapter_name: '',
        image: ''
    }

    $scope.getAllChapter = function () {
        var preparedApiUrl = $rootScope.serverURL +
            "/education/chapter/list?" +
            "class_id=" + $scope.courseId + "&" +
            "subject_id=" + $scope.subjectId;
        $rootScope.mypageloading = true;
        HttpService.HttpGetData(preparedApiUrl).then(function (result) {
            if (result && result.success && result.data && result.data.chapterList) {
                $scope.chapterList = result.data.chapterList;
            } else {
                $log.error("Unable to fetch subjects.");
            }
            $rootScope.mypageloading = false;
        });
    }
    $scope.getAllChapter();

    $scope.showAddOrUpdateChapterDialog = function () {
        $scope.resetChapterForm(false);
        $scope.isAddOrUpdateChapterDialogShown = true;
    }

    $scope.hideAddOrUpdateChapterDialog = function () {
        $scope.isAddOrUpdateChapterDialogShown = false;
    }

    $scope.resetChapterForm = function (isEdit) {
        $scope.isEdit = isEdit;
        $scope.uploadProgress = {};
        $scope.chapterImage = {
            file: null,
            fileName: '',
            basePath: 'chapter',
            fileKey: 'chapterImage'
        }
        $scope.chapterForm = {
            chapter_name: '',
            image: ''
        }
    }

    $scope.saveChapter = function () {
        $rootScope.mypageloading = true;
        function saveChapterDetailOnSever() {
            $rootScope.mypageloading = true;
            if (!('chapter_id' in $scope.chapterForm)) {
                var finalChapterForm = {
                    'subject_id': $scope.subjectId,
                    'class_id': $scope.courseId,
                    'chapters': [
                        $scope.chapterForm
                    ]
                }
                $rootScope.mypageloading = true;
                HttpService.HttpPostData(
                    $rootScope.serverURL + '/education/chapter/map',
                    finalChapterForm
                ).then(function (result) {
                    if (result && result.success) {
                        $scope.getAllChapter();
                        $scope.hideAddOrUpdateChapterDialog();
                    }
                    $rootScope.mypageloading = false;
                });
            }
            else {
                HttpService.HttpUpdateData(
                    $rootScope.serverURL + '/education/chapter/' + $scope.chapterForm['chapter_id'],
                    $scope.chapterForm
                ).then(function (result) {
                    if (result && result.success) {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                        $scope.isEdit = false;
                        $scope.getAllChapter();
                        $scope.hideAddOrUpdateChapterDialog();
                    }
                    else {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                    }
                });
            }
        }

        if ($scope.chapterImage && $scope.chapterImage.file) {
            UtilService.uploadFilesToAmazonS3([
                $scope.chapterImage
            ]).then(
                function (uploadRes) {
                    if (uploadRes ? uploadRes.data ? uploadRes.data.chapterImage ? uploadRes.data.chapterImage.isSuccess : false : false : false) {
                        $scope.chapterForm.image = uploadRes ? uploadRes.data ? uploadRes.data.chapterImage ? uploadRes.data.chapterImage.uploadUrl : "" : "" : "";
                        $scope.chapterImage['file'] = null
                        $scope.chapterImage['fileName'] = ''
                        $scope.chapterImage['imagePreview'] = ''
                        saveChapterDetailOnSever();
                    }

                },
                function (error) {
                    $rootScope.mypageloading = false;
                    $log.error(error);
                },
                function (progress) {
                    $rootScope.mypageloading = true;
                    $scope.uploadProgress = progress;
                }
            );
        }
        else {
            saveChapterDetailOnSever();
        }
    }

    $scope.fileChange = function (file) {
        $scope.chapterImage.file = file;
        $scope.chapterImage.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.chapterImage.imagePreview = e.target.result;
            $scope.chapterForm.image = '';
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    $scope.deletePhoto = function (type) {
        if (type === 'local') {
            $scope.chapterImage['file'] = null
            $scope.chapterImage['fileName'] = ''
            $scope.chapterImage['imagePreview'] = ''
        }
        else {
            $scope.chapterForm.image = '';
        }
    }

    $scope.openSubjectsListPage = function () {
        $location.path('/course-subject/' + $scope.courseId);
    }

    $scope.openTopicsListPage = function (chapter, index) {
        $location.path(
            "/course-subject/chapter/topic/" +
            $scope.courseId + "/" +
            $scope.subjectId + "/" +
            chapter._id
        );
    }

    $scope.editChapter = function(currentChapterDetails){
        $scope.uploadProgress = {};
        $scope.isEdit = true;
        $scope.chapterForm = {
            chapter_id: currentChapterDetails['_id'],
            chapter_name: currentChapterDetails['chapter_name'],
            image: currentChapterDetails['image'],
            exam_id: currentChapterDetails['exam_id'],
            topic_ids: currentChapterDetails['topic_ids']
        }
        $scope.isAddOrUpdateChapterDialogShown = true;
        $scope.isEdit = true;
        console.log($scope.chapterForm)
    }

    $scope.removeChapter = function (currentChapterDetails) {
        var confirm_response = false;
        confirm_response = confirm('Are you sure to delete this chapter?');
        if (confirm_response) {
            HttpService.HttpDeleteData(
                $rootScope.serverURL + '/education/chapter/' + currentChapterDetails['_id']
            ).then(function (result) {
                console.log(result)
                if (result && result.success) {
                    $rootScope.mypageloading = false;
                    $scope.getAllChapter();
                }
                else {
                    $rootScope.mypageloading = false;
                }
            });
        }
    }

});
