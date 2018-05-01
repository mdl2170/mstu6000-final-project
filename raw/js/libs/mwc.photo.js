angular.module("mwc.photo", ["mwc.utils"])

    .value("localFileSupport", window.File && window.FileReader)

    .factory("loadImageFile", [
        "$q",
        function($q) {
            return function(imageFile) {
                var deferred = $q.defer();

                // Checks if the file is a valid image
                if (!imageFile.type.match(/image\/(jpeg|png|gif)/i)) {
                    deferred.reject("Please choose a valid image file");
                }

                // If itÂ´s valid, reads it
                else {
                    var reader = new FileReader();

                    reader.onload = function(event) {
                        var image = document.createElement("img");
                        image.onload = function(event) {
                            deferred.resolve(image);
                        }
                        image.src = event.target.result;
                    }

                    reader.readAsDataURL(imageFile);
                }

                return deferred.promise;
            }
        }
    ])

    .factory("loadImageUrl", [
        "$q",
        function($q) {
            return function(url) {
                var deferred = $q.defer();

                var image = new Image();
                image.onload = function() {
                    deferred.resolve(image);
                }
                image.onerror = function() {
                    deferred.reject("Error while loading the image in '" + url + "'");
                }
                image.src = url;

                return deferred.promise;
            }
        }
    ])

    /*
     * UI Directive not compatible with GWT
     *
    .directive("imageHolder", [
        function() {
            function linker(scope, elem, attrs) {
                scope.$watch("source", function(newSource) {
                    elem.empty().append(newSource);
                });
            }

            return {
                restrict: "E",
                link: linker,
                scope: {
                    source: "="
                }
            }
        }
    ])
    */
;
    
