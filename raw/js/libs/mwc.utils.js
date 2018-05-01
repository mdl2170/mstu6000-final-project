angular.module("mwc.utils", ["mwc.config"])

    .factory("timeoutStore", [

        function () {

            function TimeoutStore() {

                this.list = [];

            }

            TimeoutStore.prototype = {

                createTimeout: function (fn, context, delay, params) {

                    if (typeof fn !== 'function') {
                        throw new TypeError('"fn" is not a function');
                    }

                    if (context === undefined || context === null) {
                        throw new TypeError('"context" is null or not defined');
                    }

                    delay = delay || 0;
                    params = params || [];

                    var promise = setTimeout(function () {
                        fn.apply(context, params);
                    }, delay);

                    this.list.push(promise);

                    return promise;
                },

                clear: function (promise) {

                    var index = this.list.indexOf(promise);

                    if (index > -1) {
                        clearTimeout(this.list.splice(index, 1));
                    }
                },

                clearAll: function () {

                    var promise;

                    while(promise = this.list.pop()) {
                        clearTimeout(promise);
                    }

                }
            }

            return new TimeoutStore();
        }
    ])

    .factory("renderBuffer", [
        function () {
            return function (image, width, height) {
                function createCanvas(width, height) {
                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    return canvas;
                }
                function createBuffer(image, width, height) {
                    var canvas = createCanvas(width || image.width, height || image.height);
                    var context = canvas.getContext("2d");
                    context.drawImage(image, 0, 0);
                    return canvas;
                }
                return createBuffer(image, width, height);
            }
        }
    ])

    .factory("SpriteSheet", [
        "renderBuffer",
        function (renderBuffer) {
            function SpriteSheet(image, rows, cols, width, height, frames, speed, isLoop) {
                this.rows = rows;
                this.cols = cols;
                this.width = width;
                this.height = height;
                this.frames = frames;
                this.frame = 0;
                this.frameCounter = 0;
                this.frameSpeed = speed;
                this.isLoop = isLoop;
                this.source = image;
                this.cache = [];

                // set to `true` to skip automatic precaching
                this.avoidPrecaching = false;
                // adds the spritesheet to precache-queue
                SpriteSheet.register(this);

                // defer to give us a chance to set the `avoidPrecaching` flag
                setTimeout(function(){
                    // poke cache in case it's idle
                    if (!this.avoidPrecaching) SpriteSheet.processCache();
                }, 1);

            }

            /**
             * Statically keeps track of all the registered sprite sheets
             * @type {Array}
             */
            SpriteSheet.instances = [];

            /**
             * Static method used to keep track of all the sprite sheet instances
             * @return {SpriteSheet} [description]
             */
            SpriteSheet.register = function ( spriteSheet ) {
                var instances = SpriteSheet.getInstances();
                instances.push( spriteSheet );
            };

            SpriteSheet.getInstances = function () {
                return SpriteSheet.instances;
            }

            SpriteSheet.disposeAll = function () {

                var spriteSheet, instances = SpriteSheet.getInstances();

                while( spriteSheet = instances.pop() ) {
                    spriteSheet.dispose();
                }
            };

            /**
             * Background task caching sprite sheet frames
             * @return {function}
             */
            SpriteSheet.processCache = (function () {

                var isDone = false, isProcessing = false;
                var currentSpriteSheet, currentFrame;
                var instances = SpriteSheet.getInstances();

                function getNextToProcess_ () {
                    var i, instance;
                    for ( i = 0; i < instances.length; i ++ ) {
                        instance = instances[i];
                        if ( !instance.isCached && !instance.avoidPrecaching ) return instance
                    }
                }

                function next_() {

                    // check if a sprite sheet is currently processed
                    if (!currentSpriteSheet) {
                        // retrieve next sprite sheet to process
                        currentSpriteSheet = getNextToProcess_();
                        currentFrame = 0;
                        // if nothing left to process, mark as done
                        if ( !currentSpriteSheet ) {
                            isDone = true;
                            isProcessing = false;
                            return;
                        }
                    }
                    // implicitely creates a cached copy of the frame
                    currentSpriteSheet.getCachedFrame_(currentFrame);
                    currentFrame++;

                    if (currentFrame >= currentSpriteSheet.frames) {
                        currentSpriteSheet.isCached = true;
                        currentSpriteSheet = null;
                        currentFrame = 0;
                    }
                }

                function tick_ () {
                    isDone = false;
                    var startTime = new Date();
                    var currentTime = startTime;
                    var frames = 0;
                    while(!isDone && (currentTime - startTime) < 3) {
                        currentTime = new Date();
                        next_();
                        frames ++;
                    }

                    if (!isDone) {
                        setTimeout(tick_, 1);
                    }
                }

                return function () {
                    if (isProcessing) return;
                    isProcessing = true;
                    tick_();
                };

            })();

            SpriteSheet.prototype = {
                reset: function () {
                    this.frameCounter = 0;
                    this.frame = 0;
                },
                update: function () {
                    this.frameCounter += this.frameSpeed;
                    this.frame = Math.floor(this.frameCounter);
                    if (this.isLoop) {
                        this.frame %= this.frames;
                    }  else {
                        this.frame = Math.min(this.frames-1, this.frame);

                    }
                },
                draw: function (buffer, dx, dy) {
                    var source = this.getCachedFrame_(this.frame).canvas;
                    buffer.drawImage(source, dx, dy);
                },
                setFrame: function (frame) {
                    this.frame = frame % this.frames;
                },
                dispose: function () {
                    this.source = null;
                    this.cache = null;
                },
                cacheFrame_: function (frame) {
                    var x = frame % this.cols;
                    var y = Math.floor(frame / this.cols);
                    var w = this.width, h = this.height;

                    var canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;

                    var context = canvas.getContext('2d');

                    context.drawImage(this.source, x * w, y * h, w, h, 0, 0, w, h );
                    this.cache[frame] = { frame: frame, canvas: canvas };
                },
                getCachedFrame_: function (frame) {
                    // caches the frame if not already done
                    if ( !this.cache[frame] ) this.cacheFrame_(frame);

                    return this.cache[frame];
                }
            };

            return SpriteSheet;
        }
    ])

    /*
     * UI Directive not compatible with GWT
     *
    // A file button that can be layouted freely
    .directive("fileButton", [
        "$q",
        "config",
        function($q, config) {
            function linker(scope, elem, attrs) {
                var fileSelector = elem.find("input")[0], deferred;

                fileSelector.addEventListener(
                    "change",
                    function(event) {
                        // Using promises here might seem overkill, but this is needed.
                        // The way IE handles the "change" event in the input
                        // element was causing an "$apply already in progress" error
                        deferred.resolve(event.target.files[0]);
                    },
                    false
                );

                scope.selectFile = function() {
                    deferred = $q.defer();
                    deferred.promise.then(function(file) {
                        scope.file = file;
                    });
                    fileSelector.click();
                }
            }

            return {
                link: linker,
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: config.paths.templatesPath + "/fileButton.html",
                scope: {
                    file: "="
                }
            };
        }
    ])
    */

    // Given a set of promises, returns a promise that is resolved once all promises are resolved
    .factory("resolveAllPromises", [
        "$q",
        function($q) {
            return function(promises) {
                var deferred = $q.defer(), results = new Array(promises.length), resolved = 0;

                function promiseResolved(promiseId, status, resultData) {
                    results[promiseId] = {
                        status: status,
                        resultData: resultData
                    };

                    resolved++;
                    deferred.notify(resolved);
                    if (resolved>=promises.length) {
                        deferred.resolve(results);
                    }
                }

                for (var i=0; i<promises.length; i++) {
                    (function() {
                        var promiseId = i;

                        promises[promiseId].then(
                            function() {
                                promiseResolved(promiseId, true, arguments);
                            },
                            function() {
                                promiseResolved(promiseId, false, arguments);
                            }
                        );
                    })();
                }

                return deferred.promise;
            }
        }
    ])

    // A class used to measure the time elapsed between two animation frames
    .factory("Chronometer", [
        function() {
            function Chronometer() {
                this.reset();
            }

            Chronometer.prototype = {
                reset: function() {
                    this.timestamp = new Date().getTime();
                },

                getTimeDelta: function() {
                    var now = new Date().getTime(), delta = now - this.timestamp;

                    this.timestamp = now;

                    return delta;
                }
            };

            return Chronometer;
        }
    ])

    // A function to ensure that a number is always the result when parsing a string
    .factory("safeParse", [
        function() {
            return function(stringNumber, fallbackResult) {
                return isNaN(stringNumber) || stringNumber.length === 0 ?
                       (fallbackResult || 0) :
                       (parseFloat(stringNumber) || 0);
            }
        }
    ])

    // A quadtree to improve collision detection
    .factory("Quadtree", [
        function() {
            function Quadtree() {
                this.children = null;
                this.data = [];
                this.limit = 10;
                this.height = 1;
                this.maxHeight = 1;
                this.top = 0;
                this.bottom = 0;
                this.left = 0;
                this.right = 0;
            }

            Quadtree.prototype = {
                add: function(box) {
                    // Case 1: if itÂ´s not a leaf node, move on to the child nodes
                    if (this.children) {
                        for (var i=0; i<4; i++) {
                            this.children[i].add(box);
                        }
                        return;
                    }

                    // Case 2: if the box doesnÂ´t fit this node, nothing is made
                    if (box.top>=this.bottom ||
                        box.bottom<this.top ||
                        box.left>=this.right ||
                        box.right<this.left) {

                        return;
                    }

                    // Case 3: add the box to this nodeÂ´s data set and check if it needs to be split
                    this.data.push(box);
                    if (this.data.length > this.limit && this.height < this.maxHeight) {
                        this.children = new Array(4);
                        var mediumY = (this.top + this.bottom)/2, mediumX = (this.left + this.right)/2;

                        for (var i=0; i<4; i++) {
                            var newNode = new Quadtree();

                            newNode.limit = this.limit;
                            newNode.height = this.height + 1;
                            newNode.maxHeight = this.maxHeight;

                            switch(i) {
                                case 0:
                                    newNode.top = this.top;
                                    newNode.bottom = mediumY;
                                    newNode.left = this.left;
                                    newNode.right = mediumX;
                                    break;

                                case 1:
                                    newNode.top = this.top;
                                    newNode.bottom = mediumY;
                                    newNode.left = mediumX;
                                    newNode.right = this.right;
                                    break;

                                case 2:
                                    newNode.top = mediumY;
                                    newNode.bottom = this.bottom;
                                    newNode.left = mediumX;
                                    newNode.right = this.right;
                                    break;

                                case 3:
                                    newNode.top = mediumY;
                                    newNode.bottom = this.bottom;
                                    newNode.left = this.left;
                                    newNode.right = mediumX;
                                    break;
                            }

                            for (var j=0; j<this.data.length; j++) {
                                newNode.add(this.data[j]);
                            }

                            this.children[i] = newNode;
                        }

                        this.data = null;
                    }
                },

                getDataSlots: function(dataSet) {
                    dataSet = dataSet || [];

                    if (!this.children) {
                        dataSet.push(this.data);
                    }

                    else {
                        for (var i=0; i<4; i++) {
                            this.children[i].getDataSlots(dataSet);
                        }
                    }

                    return dataSet;
                },
            };

            return Quadtree;
        }
    ])

    // A service that loads a remote file as a base64 string
    .factory("loadBase64", [
        "$q",
        "$http",
        function($q, $http) {
            return function(url) {
                var deferred = $q.defer();

                $http.get(url, {responseType: "blob"}).then(
                    function(fileData) {
                        var reader = new FileReader();

                        reader.onloadend = function() {
                            deferred.resolve(reader.result);
                        }
                        reader.readAsDataURL(fileData.data);
                    },
                    function(errorData) {
                        deferred.reject(errorData);
                    }
                );

                return deferred.promise;
            }
        }
    ])

    // A service that loads a remote file as an array buffer
    .factory("loadArrayBuffer", [
        "$q",
        "$http",
        function($q, $http) {
            return function(url) {
                var deferred = $q.defer();

                $http.get(url, {responseType: "arraybuffer"}).then(
                    function(fileData) {
                        deferred.resolve(fileData);
                    },
                    function(errorData) {
                        deferred.reject(errorData);
                    }
                );

                return deferred.promise;
            }
        }
    ])

    .factory('SoundFactory', [ 'loadArrayBuffer', 'loadBase64',

    function( loadArrayBuffer, loadBase64 ) {

        /**
         * Class enabling multiple instances of the same sound to play simultaneously.
         * The class is a modified version of mwc.utils.SoundFactory
         *
         * @constructor
         * @param {String} soundData - the file source of the audio item
         */
        function SoundFactory(soundData) {

            if (soundData) this.initAudio_(soundData);

        }

        /**
         * Utility function to create derred loading item
         * based on the audio technology used.
         *
         * @param  {string} src source of the sound file
         * @return {object}     promise for the loading item
         */
        SoundFactory.createLoader = function (src) {

            src += SoundFactory.fileFormatExtension;

            return SoundFactory.webAudioContext ? loadArrayBuffer(src) : loadBase64(src);
        };

        /**
         * Handles iOS compatibiliy.
         * Notably, waits for a user event to unlock the webaudio context.
         *
         * @param  {WebAudioContext} context - the audio context to activate
         * @return {[null]}
         */
        SoundFactory.initCompatibility = function ( context ) {

            // avoid stacking sounds while the context is not ready
            SoundFactory.contextReady = true;

            if (!navigator.userAgent.match(/ipad|iphone/i)) {
                SoundFactory.contextReady = true;
                return;
            }

            // the following section targets iOS only

            var onFirstTouch = function(e) {
                // creates an empty buffer and plays it
                var source = context.createBufferSource();
                source.buffer = context.createBuffer(1, 1, 22050);
                source.connect(context.destination);
                source.start(0);
                // avoid calling this function more than once
                window.removeEventListener('touchstart', onFirstTouch, false);
                // indicates the audio context is unlocked
                SoundFactory.contextReady = true;
            };

            // awaits some user interaction to unlock the context
            window.addEventListener('touchstart', onFirstTouch, false);
        };

        // Automatically initialises the audio context
        SoundFactory.webAudioContext = (function () {

            var context, AudioContext = window.AudioContext || window.webkitAudioContext;

            if ( AudioContext ) {
                context = new AudioContext();
                // Perform a check for iOS compatibiily
                SoundFactory.initCompatibility( context );
            }

            return context;

        })();

        // Automatically determines audio file format support
        SoundFactory.fileFormatExtension = (function () {

            var a = document.createElement('audio'),
                extension = '.mp3',
                canPlayMp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')),
                canPlayOgg = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));

            if (canPlayMp3) {
                extension = '.mp3';
            } else if (canPlayOgg) {
                extension = '.ogg';
            }

            return extension;

        })();


        SoundFactory.prototype = {

            load: function(src) {
                SoundFactory.createLoader(src).then(function(loader) {
                    this.initAudio_(loader);
                }.bind(this));

                return this;
            },

            /**
             * Initialises audio
             * @param  {Base64|ArrayBuffer} soundData
             * @return {null}
             */
            initAudio_: function (soundData) {

                if ( SoundFactory.webAudioContext ) {
                    this.initWebAudio_(soundData);
                } else {
                    this.initLegacyAudio_(soundData);
                }
            },

            initWebAudio_: function (src) {

                var self = this;
                var context = SoundFactory.webAudioContext;

                context.decodeAudioData(src.data, function(buffer) {

                    self.audioBuffer = buffer;
                    self.isInit = true;

                }, function onError ( e ) {

                });

                this.play = function (isLoop) {

                    isLoop = isLoop || false;

                    if (!this.isInit || !SoundFactory.contextReady) return;

                    this.source = context.createBufferSource();
                    this.source.buffer = this.audioBuffer;
                    this.source.loop = isLoop;

                    // connect to the speakers
                    this.source.connect(context.destination);

                    this.source.start(0);
                }

                this.stop = function () {

                    if (!this.source) return;

                    this.source.stop(0);
                }
            },


            initLegacyAudio_: function (src) {

                this.soundInstances = [];
                this.currentPlayingIndex = 0;

                for ( var i = 0; i < 3; i ++ ) {
                    var sound = new Audio();
                    sound.src = src;
                    this.soundInstances.push(sound);
                }

                this.play = function (isLoop) {

                    // Avoid looping different sounds at once
                    var soundIndex = isLoop ? 0 : this.currentPlayingIndex;

                    var sound = this.soundInstances[soundIndex];

                    if ( sound.readyState == 4 ) {
                        sound.currentTime = 0;
                        sound.loop = isLoop;
                        sound.play();
                    }

                    this.currentPlayingIndex = (this.currentPlayingIndex + 1) % this.soundInstances.length;
                }

                this.stop = function () {

                    var sound;

                    for ( var i = 0; i < 3; i ++ ) {
                        sound = this.soundInstances[i];
                        sound.pause();
                    }
                }
            }

        }

        return SoundFactory;
    }])
