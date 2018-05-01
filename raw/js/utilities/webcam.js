/**
 * User media streaming comes in several vendor prefixed flavors. Webcam doesn't
 * care where it's running, so I try to normalize the implementations under
 * navigator.getUserMedia.
 */
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

/**
 * The JsLand side of Webcam
 *
 * <p>
 * Webcam makes it easy to stream data from a MwCoder's webcam using
 * getUserMedia. This is the JsLand side of Webcam; it can be used directly, but
 * you won't get any logging, as that's done by the GwtLand side. Please see the
 * GwtLand documentation for more information.
 */
Webcam = {
  errorOccurred : false,
  constraints : {
    video : true,
    audio : false
  }
};


/**
 * Informs whether camera is supported.
 * It can be called as sync and async version. Sync version just checks whether the browser
 * has proper API to acces camera, but doesn't check if the computer has any video device attached.
 * To get this information an async version (with callback) need to be called.
 */
Webcam.isSupported = function(callback) {
  var supp = !!navigator.getUserMedia && !!window.MediaStreamTrack;
  if (typeof callback === "function") {
	if (supp && window.MediaStreamTrack.getSources) {
		// the most precise check, but so far works for WebKit only
		window.MediaStreamTrack.getSources(function(list){
			callback(list.some(function(x){return x.kind === 'video'}));
		});
	} else {
		callback(supp);
	}
  }
  return supp;
};

Webcam.stream = function(element) {
  navigator.getUserMedia(Webcam.constraints, Webcam.onStream(element), Webcam.onError);
};

Webcam.disconnect = function(element) {
  element.pause();
  if (element.mozSrcObject) {
    element.mozSrcObject = null;
  } else if (navigator.webkitGetUserMedia) {
    element.src = "";
  }
  element.src = null;
};

Webcam.onStream = function(element) {
  return function(stream) {
    if (Webcam.errorOccurred) {
      Webcam.onError({
        name : "A previous error has occurred"
      });
    }

    if (navigator.mozGetUserMedia) {
      element.mozSrcObject = stream;
    } else {
      var URL = window.URL || window.webkitURL;
      element.src = URL.createObjectURL(stream);
    }
    setTimeout(function() {
      element.play();
    }, 100);
  };
};

Webcam.onError = function(e) {
  Webcam.errorOccurred = true;
  EventBridge.Filming.error(e.name);
};
