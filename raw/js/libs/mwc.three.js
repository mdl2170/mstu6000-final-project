angular.module("mwc.three", ["mwc.config"])

    .factory("Three", [
        "$window",
        function($window) {
            return $window.THREE;
        }
    ])

    .factory("AnimationUtils", [
        "$window",
        function($window) {
            return $window.AnimationUtils;
        }
    ])

    .value("TrackballConfig", {
        rotateSpeed: 1.0,
        zoomSpeed: 1.2,
        noPan: false,
        staticMoving: true,
        dynamicDampingFactor: 0.3
    })

    .factory("loadALModel", [
        "$q",
        "Three",
        function($q, Three) {
            return function(modelUrl, texturesPath){
                var deferred = $q.defer();

                (new Three.ALLoader()).load(modelUrl, function(modelData) {
                    deferred.resolve(modelData);
                }, texturesPath);

                return deferred.promise;
            }
        }
    ])

    .factory("loadThreeModel", [
        "$q",
        "Three",
        function($q, Three) {
            return function(modelUrl){
                var deferred = $q.defer();

                (new Three.JSONLoader()).load(modelUrl, function(geometry, materials) {
                    deferred.resolve({
                        geometry: geometry,
                        materials: materials
                    });
                });

                return deferred.promise;
            }
        }
    ])

    .factory("loadColladaModel", [
        "$q",
        "Three",
        function($q, Three) {
            return function(modelUrl) {
                var deferred = $q.defer();

                (new Three.ColladaLoader()).load(modelUrl, function(model) {
                    deferred.resolve(model);
                });

                return deferred.promise;
            }
        }
    ])

    /**
     * UI Directive not compatible with GWT
     *
    .directive("threeStage", [
        "Three",
        "TrackballConfig",
        "config",
        function(Three, TrackballConfig, config) {
            function linker(scope, elem, attrs) {
                // Builds the scene with the floor plane
                var scene = new Three.Scene();

                //scene.add(
                //    new Three.Mesh(
                //        new Three.PlaneGeometry(75, 75),
                //        new Three.MeshPhongMaterial({
                //            color: 0x0000ff,
                //            specular: 0xffffff,
                //            shininess: 5,
                //            shading: Three.SmoothShading
                //        })
                //    )
                //);


                // Adds lights to the scene
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(0, -1, 1);
                scene.add( directionalLight );

                var ambientLight = new Three.AmbientLight(0xffffff);
                scene.add(ambientLight);

                // Builds the camera
                var camera = new Three.PerspectiveCamera(75, 1, 0.1, 1000);
                camera.position.z = 75;
                camera.position.y = -75;

                // Builds the renderer and attaches it to the DOM tree
                var renderer = new Three.WebGLRenderer({antialias: false});
                renderer.setClearColor(0x999999, 1);
                elem.append(renderer.domElement);

                // Builds the trackball controls
                var cameraControls = new Three.TrackballControls(
                    camera,
                    scope.documentTrackball() ? undefined : renderer.domElement
                );
                angular.element.extend(cameraControls, TrackballConfig);
                //cameraControls.target.set(0, 0, 25);
                cameraControls.target.set(0, 0, 0);

                // Whenever the model changes, updates the scene
                scope.$watch("model", function(newModel, oldModel){
                    scene.remove(oldModel);
                    scene.add(newModel);
                });

                // The clock that manages the animation time flow
                var clock = new Three.Clock();

                // The render loop
                scope.destroyed = false;
                function render() {
                    // Quits the render loop when the scope is destroyed
                    if (scope.destroyed) {
                        return;
                    }
                    requestAnimationFrame(render);

                    // Do any processing required by the parent scope
                    if (scope.renderStep) {
                        scope.renderStep(clock.getDelta());
                    }

                    // Updates the trackball controller
                    cameraControls.update();

                    // Renders the scene
                    renderer.render(scene, camera);
                }
                render();

                // Whenever the stage dimensions change
                function stageDimensionsChanged() {
                    renderer.setSize(scope.stageWidth(), scope.stageHeight());
                    camera.aspect = scope.stageWidth() / scope.stageHeight();
                    camera.updateProjectionMatrix();
                    cameraControls.handleResize();
                }
                scope.$watch("stageWidth()", stageDimensionsChanged);
                scope.$watch("stageHeight()", stageDimensionsChanged);

                // All good things must come to an end...
                scope.$on("$destroy", function() {
                    scope.destroyed = true;
                });
            }

            return {
                link: linker,
                restrict: "E",
                replace: true,
                templateUrl: config.paths.templatesPath + "/threeStage.html",
                scope: {
                    model: "=",
                    stageWidth: "&",
                    stageHeight: "&",
                    renderStep: "=",
                    documentTrackball: "&"
                }
            }
        }
    ])*/
;
