'use strict';
app.directive('fileInput', function() {
    return {
        restrict: 'AE',
        scope: {
            file: '@'
        },
        link: function(scope, el, attrs){
            el.bind('change', function(event){
                var files = event.target.files;
                if(files && files.length) {
                    var file = files[0];
                    var fileChangeHandlerName = attrs['fileChangeHandlerName']
                    if(fileChangeHandlerName) {
                        var fileChangeHandler = scope.$parent[fileChangeHandlerName];
                        if(fileChangeHandler && fileChangeHandler instanceof Function) {
                            fileChangeHandler(file);
                        }
                    }
                }
            });
        }
    };
});
