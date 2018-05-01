angular.module("mwc.video", [])

    .value("videojsDefaultConfig", {
        "techOrder" : ["html5", "flash"],
        "controls" : false,
        "preload" : "auto",
        "children": {
            "loadingSpinner": false
        }
    })

    // MWC version without UI directives
    .factory("mwcVideojsApi", [
	    "videojsDefaultConfig",
        function (videojsDefaultConfig) {
            return {
            	link: function(element, callback) {
            		videojs(element,
           				angular.element.extend({}, videojsDefaultConfig),
            			function() {
            				callback(this);
            			}
            		);
            	}
            };
        }
    ])

     /*
     * UI Directive not compatible with GWT
     *
    .directive("videojsApi", [
        "videojsDefaultConfig",
        function(videojsDefaultConfig) {
            function linker(scope, elem, attrs) {
                videojs(elem[0],
                        angular.element.extend({}, videojsDefaultConfig, scope.videojsConfig()),
                        function() {
                            scope.videojsApi = this;
                        }
                );
            }

            return {
                link: linker,
                scope: {
                    "videojsApi": "=",
                    "videojsConfig": "&"
                }
            };
        }
    ])*/
;
