angular.module("mwc.experiences", ["mwc.config"])

    // Modal window used in the experiences
    .directive("modal", [
        "config",
        function(config) {
            return {
                restrict: "E",
                transclude: true,
                replace: true,
                templateUrl: config.paths.templatesPath + "/modal.html",
                scope: {
                    condition: "&"
                }
            };
        }
    ])

    // Modal window specific for sharing purposes
    .directive("modalShare", [
        "config",
        function(config) {
            return {
                restrict: "E",
                transclude: true,
                replace: true,
                templateUrl: config.paths.templatesPath + "/modalShare.html",
                scope: {
                    shareOpen: "=open"
                }
            };
        }
    ])

    // Modal for try again
    .directive("modalRetry", [
        "config",
        function(config) {
            return {
                restrict: "E",
                transclude: true,
                replace: true,
                templateUrl: config.paths.templatesPath + "/modalRetry.html",
                scope: {
                    retryOpen: "=open"
                }
            };
        }
    ])

    // Modal for all stages complete
    .directive("modalComplete", [
        "config",
        function(config) {
            return {
                restrict: "E",
                transclude: true,
                replace: true,
                templateUrl: config.paths.templatesPath + "/modalComplete.html",
                scope: {
                    completeOpen: "=open"
                }
            };
        }
    ])

    // Modal window for level interstitial
    .directive("modalInterstitial", [
        "config",
        function(config) {
            return {
                restrict: "E",
                transclude: true,
                replace: true,
                templateUrl: config.paths.templatesPath + "/modalInterstitial.html",
                scope: {
                    interstitialOpen: "=open"
                }
            };
        }
    ])

    .directive("mwcExperience", [
        "config",
        function(config) {
            function linker(scope, elem, attrs) {
                scope.experienceTitle = attrs.title;
                scope.experienceDescription = attrs.description;
            }

            return {
                link: linker,
                restrict: "E",
                templateUrl: config.paths.templatesPath + "/mwcExperience.html",
                transclude: true
            };
        }
    ]);
