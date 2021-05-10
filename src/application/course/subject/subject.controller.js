app.controller('courseSubjectController', function($rootScope, $routeParams, $location,
    $scope, $log, UtilService, HttpService) {

    UtilService.setSidebar();
    $rootScope.showBackStrech = false;
    $rootScope.mypageloading = true;

    $scope.subjectList = [];
    $scope.courseId = ($routeParams.courseId) ? $routeParams.courseId : -1;
    $scope.showGloble = false;

    $scope.getAllSubjects=function(){
        $log.log("Fetch list of subjects");
        $rootScope.mypageloading = true;
        HttpService.HttpGetData($rootScope.serverURL + '/customer/subject')
        .then(function (result) {
            if(result && result.success && result.data) {
                var allSubjects = result.data;
                $scope.subjectList=[];
                angular.forEach(allSubjects, function(subject) {
                    if(subject && subject.classes) {
                        angular.forEach(subject.classes, function(classId) {
                            if($scope.courseId == classId) {
                                $scope.subjectList.push({
                                    id : subject._id,
                                    name : subject.name,
                                    customerId : subject.customer_id,
                                    courseId: classId,
                                });
                            }
                        });
                    }
                });
            } else {
                $log.error("Unable to fetch subjects.");
            }
            $rootScope.mypageloading = false;
        });
    }
    
    $scope.getAllSubjects();

    $scope.openCourseListPage = function() {
        $location.path('/students');
    }

    $scope.openChaptersListPage = function(subject) {
        $location.path('/course-subject/chapter/' + subject.courseId + "/" + subject.id);
    }
});