app.controller('courseTopicController', function ($rootScope, $routeParams, $location,
    $scope, $log, $http, UtilService, HttpService, FlashService) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = true;
    $scope.showtopic =false;
    $scope.topicList = [];
    $scope.isAddOrUpdateTopicDialogShown = false;
    $scope.courseId = ($routeParams.courseId) ? $routeParams.courseId : -1;
    $scope.subjectId = ($routeParams.subjectId) ? $routeParams.subjectId : -1;
    $scope.chapterId = ($routeParams.chapterId) ? $routeParams.chapterId : -1;
    $scope.isEdit = false;
    $scope.topicForm = {
        topic_name: '',
        topic_attachments: [],
        localTopicAttachments: [],
        video_thumbnail: '',
        video_link: '',
        description: '',
        assignment: '',
        localAssignmentAttachments: [],
        assignment_attachments: []
    }
    $scope.uploadProgress = {};
    $scope.topicAttachment = {
        thumbnail: {
            file: null,
            fileName: '',
            basePath: 'topic',
            fileKey: 'thumbnail'

        },
        video: {
            file: null,
            fileName: '',
            basePath: 'topic/video',
            fileKey: 'video',
        }
    }

    //dynamic key for local photo object
    var dkIndex = 0;
    $scope.topicAssignmentAttachmentChange = function (file) {
        dkIndex++;

        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.topicForm.localAssignmentAttachments.push({
                file: file,
                fileName: file.name,
                basePath: 'topic',
                fileKey: 'topicAssignmentAttachments' + dkIndex,
                imagePreview: e.target.result
            });
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    var dkIndexTopicAttachment = 0;
    $scope.topicAttachmentChange = function (file) {
        dkIndexTopicAttachment++;
        
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.topicForm.localTopicAttachments.push({
                file: file,
                fileName: file.name,
                basePath: 'topic',
                fileKey: 'topicAttachments' + dkIndexTopicAttachment,
                imagePreview: e.target.result
            });
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    $scope.deletePhoto = function (type, index) {
        if (type === 'video') {
            $scope.topicAttachment['video']['file'] = null
            $scope.topicAttachment['video']['fileName'] = ''
            $scope.topicAttachment['video']['videoPreview'] = ''
        }
        else if(type === 'thumbnail'){
            $scope.topicAttachment['thumbnail']['file'] = null
            $scope.topicAttachment['thumbnail']['fileName'] = ''
            $scope.topicAttachment['thumbnail']['imagePreview'] = ''
        }
        else if(type === 'video_link'){
            $scope.topicForm['video_link'] = ''
        }
        else if(type === 'video_thumbnail'){
            $scope.topicForm['video_thumbnail'] = ''
        }
        else if (type === 'assignment-attachments-local') {
            $scope.topicForm.localAssignmentAttachments.splice(index, 1);
        } 
        else if (type === 'assignment-attachments') {
            $scope.topicForm.assignment_attachments.splice(index, 1);
        } 
        else if (type === 'topic-attachments-local') {
            $scope.topicForm.localTopicAttachments.splice(index, 1);
        }
        else {
            $scope.topicForm.topic_attachments.splice(index, 1);
        }
    }

    $scope.getAllTopics = function () {
        var apiUrl = $rootScope.serverURL +
            "/education/topic/list?" +
            "chapter_id=" + $scope.chapterId;
        $rootScope.mypageloading = true;
        HttpService.HttpGetData(apiUrl).then(function (result) {
            if (result && result.success && result.data && result.data.topicList) {
                $scope.topicList = result.data.topicList;
            } else {
                $log.error("Unable to fetch subjects.");
            }
            $rootScope.mypageloading = false;
        });
    }
    $scope.getAllTopics();

    $scope.resetTopicForm = function (isEdit) {
        $scope.isEdit = isEdit;
        $scope.uploadProgress = {};
        $scope.topicAttachment = {
            thumbnail: {
                fileKey: 'thumbnail',
                file: null,
                basePath: 'topic'
            },
            video: {
                fileKey: 'video',
                file: null,
                basePath: 'topic/video'
            }
        }
        $scope.topicForm = {
            topic_name: '',
            topic_attachments: [],
            localTopicAttachments: [],
            video_thumbnail: '',
            video_link: '',
            description: '',
            assignment: '',
            localAssignmentAttachments: [],
            assignment_attachments: []
        }
    }
    $scope.viewtopic = function(topic){
        $scope.singeltopic = topic;
        $scope.showtopic = true;
    }

    $scope.backtoTopic = function (){
        $scope.showtopic = false;
    }
    $scope.showAddOrUpdateTopicDialog = function (isEdit) {
        $scope.resetTopicForm(isEdit);
        $scope.isAddOrUpdateTopicDialogShown = true;
    }

    $scope.hideAddOrUpdateTopicDialog = function () {
        $scope.isAddOrUpdateTopicDialogShown = false;
        $scope.topicForm = {
            topic_name: '',
            topic_attachments: [],
            localTopicAttachments: [],
            video_thumbnail: '',
            video_link: '',
            description: '',
            assignment: '',
            localAssignmentAttachments: [],
            assignment_attachments: []
        }
        $scope.topicAttachment = {
            thumbnail: {
                fileKey: 'thumbnail',
                file: null,
                basePath: 'topic'
            },
            video: {
                fileKey: 'video',
                file: null,
                basePath: 'topic/video'
            }
        }
    }

    $scope.saveTopic = function () {
        function saveTopicDetailOnServer() {
            $rootScope.mypageloading = true;
            if(!('topic_id' in $scope.topicForm)){
                var finalTopicForm = {
                    chapter_id: $scope.chapterId,
                    topics: [
                        {
                            topic_name: $scope.topicForm.topic_name,
                            video_thumbnail: $scope.topicForm.video_thumbnail,
                            video_link: $scope.topicForm.video_link,
                            description: $scope.topicForm.description,
                            assignment: $scope.topicForm.assignment,
                            assignment_attachments: $scope.topicForm.assignment_attachments,
                            topic_attachments: $scope.topicForm.topic_attachments,
                        }
                    ]
                }
                HttpService.HttpPostData(
                    $rootScope.serverURL + '/education/topic/map',
                    finalTopicForm
                ).then(function (result) {
                    if (result && result.success) {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                        $scope.getAllTopics();
                        $scope.hideAddOrUpdateTopicDialog();
                    }
                    else {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                    }
                });
            }
            else{
                HttpService.HttpUpdateData(
                    $rootScope.serverURL + '/education/topic/' + $scope.topicForm['topic_id'],
                    $scope.topicForm
                ).then(function (result) {
                    if (result && result.success) {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                        $scope.isEdit = false;
                        $scope.getAllTopics();
                        $scope.hideAddOrUpdateTopicDialog();
                    }
                    else {
                        $scope.uploadProgress = {};
                        $rootScope.mypageloading = false;
                    }
                });
            }
        }

        function uploadTopicAssignmentAttachments() {
            if ($scope.topicForm ? $scope.topicForm.localAssignmentAttachments ?
                $scope.topicForm.localAssignmentAttachments.length : false : false) {
                $rootScope.mypageloading = true;
                UtilService.uploadFilesToAmazonS3($scope.topicForm.localAssignmentAttachments).then(
                    function (fileUploadRes) {
                        if (fileUploadRes ? fileUploadRes.data : false) {
                            angular.forEach(Object.keys(fileUploadRes.data),
                                function (key, index) {
                                    $scope.topicForm.assignment_attachments.push(
                                        fileUploadRes.data[key].uploadUrl
                                    );
                                });
                            $scope.topicForm.localAssignmentAttachments = [];
                            saveTopicDetailOnServer();
                        }
                    },
                    function (error) {
                        $log.error(error);
                        $rootScope.mypageloading = false;
                    },
                    function (progress) {
                        $scope.uploadProgress = progress;
                        $rootScope.mypageloading = true;
                    }
                );
            } else {
                saveTopicDetailOnServer();
            }
        }

        function uploadTopicAttachments(){
            if ($scope.topicForm ? $scope.topicForm.localTopicAttachments ? 
                $scope.topicForm.localTopicAttachments.length : false : false) {
                    $rootScope.mypageloading = true;
                    UtilService.uploadFilesToAmazonS3($scope.topicForm.localTopicAttachments).then(
                        function (fileUploadRes) {
                            if (fileUploadRes ? fileUploadRes.data : false) {
                                angular.forEach(Object.keys(fileUploadRes.data),
                                    function (key, index) {
                                        $scope.topicForm.topic_attachments.push(
                                            fileUploadRes.data[key].uploadUrl
                                        );
                                    });
                                $scope.topicForm.localTopicAttachments = [];
                                uploadTopicAssignmentAttachments();
                            }
                        },
                        function (error) {
                            $log.error(error);
                            $rootScope.mypageloading = false;
                        },
                        function (progress) {
                            $scope.uploadProgress = progress;
                            $rootScope.mypageloading = true;
                        }
                    );
            } else {
                uploadTopicAssignmentAttachments();
            }
        }

        var filesDetail = []
        if ($scope.topicAttachment.thumbnail.file) {
            filesDetail.push($scope.topicAttachment.thumbnail)
        }
        if ($scope.topicAttachment.video.file) {
            filesDetail.push($scope.topicAttachment.video)
        }
        if (filesDetail && filesDetail.length > 0) {
            $rootScope.mypageloading = true;
            UtilService.uploadFilesToAmazonS3(filesDetail).then(
                function (fileUploadRes) {
                    if (fileUploadRes ? fileUploadRes.data : false) {
                        if (fileUploadRes.data.video ? fileUploadRes.data.video.isSuccess : false) {
                            $scope.topicForm.video_link = fileUploadRes ? fileUploadRes.data ? fileUploadRes.data.video ? fileUploadRes.data.video.uploadUrl : "" : "" : "";
                            $scope.topicAttachment.thumbnail.imagePreview = '';
                        }
                        if (fileUploadRes.data.thumbnail ? fileUploadRes.data.thumbnail.isSuccess : false) {
                            $scope.topicForm.video_thumbnail = fileUploadRes ? fileUploadRes.data ? fileUploadRes.data.thumbnail ? fileUploadRes.data.thumbnail.uploadUrl : "" : "" : "";
                            $scope.topicAttachment.video.videoPreview = '';
                        }
                        uploadTopicAttachments()
                    }
                },
                function (error) {
                    $log.error(error);
                    $rootScope.mypageloading = false;
                },
                function (progress) {
                    $scope.uploadProgress = progress;
                    $rootScope.mypageloading = true;
                }
            );
        }
        else{
            uploadTopicAttachments()
        }
    };

    $scope.openChapterListPage = function () {
        $location.path('/course-subject/chapter/' + $scope.courseId + "/" + $scope.subjectId);
    }

    $scope.thumbnailChange = function (file) {
        $scope.topicAttachment.thumbnail.file = file;
        $scope.topicAttachment.thumbnail.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.topicAttachment.thumbnail.imagePreview = e.target.result;
            $scope.topicForm['video_thumbnail'] = '';
            $scope.$apply();
        };
        reader.readAsDataURL(file);
        
    }

    $scope.videoChange = function (file) {
        $scope.topicAttachment.video.file = file;
        $scope.topicAttachment.video.fileName = file.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.topicAttachment.video.videoPreview = URL.createObjectURL(file);
            $scope.topicForm['video_link'] = '';
            $scope.$apply();
        };
        reader.readAsDataURL(file);
    }

    $scope.editTopic = function(currentTopicDetails){
        $scope.topicForm = {
            topic_name: currentTopicDetails['topic_name'],
            topic_attachments: currentTopicDetails['topic_attachments'],
            localTopicAttachments: [],
            video_thumbnail: currentTopicDetails['video_thumbnail'],
            video_link: currentTopicDetails['video_link'],
            description: currentTopicDetails['description'],
            assignment: currentTopicDetails['assignment'],
            localAssignmentAttachments: [],
            assignment_attachments: currentTopicDetails['assignment_attachments'],
            topic_id: currentTopicDetails['_id']
        }
        console.log($scope.topicForm)
        $scope.isEdit = true;
        $scope.isAddOrUpdateTopicDialogShown = true;
    }

    $scope.removeTopic = function(currentTopicDetails){
        var confirm_response = false;
        confirm_response = confirm('Are you sure to delete this topic?');
        if(confirm_response){
            HttpService.HttpDeleteData(
                $rootScope.serverURL + '/education/topic/' + currentTopicDetails['_id']
            ).then(function (result) {
                console.log(result)
                if (result && result.success) {
                    $rootScope.mypageloading = false;
                    $scope.getAllTopics();
                }
                else {
                    $rootScope.mypageloading = false;
                }
            });
        }
    }

});

app.filter('trusted', ['$sce', function ($sce) {
    return $sce.trustAsResourceUrl;
 }]);