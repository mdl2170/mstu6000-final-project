angular.module("mwc.config", [])

    // Singleton object that holds the config data for the app
    .factory("config", [
        "$templateCache",
        function($templateCache) {
            return JSON.parse($templateCache.get("config.json"));
        }
    ]);
