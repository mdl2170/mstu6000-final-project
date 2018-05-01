/*
	---------------------------------------------------
	Support notes for getUserMedia
	---------------------------------------------------
	Win IE - no getUserMedia support
	Win Safari - no getUserMedia support
	Win Firefox - no remember allow/disallow
	Win Chrome - https to remember allow, http/https to remember disallow
	Win Opera - http/https to remember allow, http/https to remember disallow

	iOS Chrome - no getUserMedia support
	iOS Safari - no getUserMedia support

	OSX Safari - no getUserMedia support
	OSX Firefox - no remember allow/disallow
	OSX Chrome 33 - https to remember allow, http/https to remember disallow
	OSX Opera - https to remember allow, http/https to remember disallow

	Android Firefox - no remember allow/disallow
	Android Chrome - https to remember allow, http/https to remember disallow
	Android Opera - http/https to remember allow, http/https to remember disallow

	---------------------------------------------------
	Noticed these possible errors while testing
	---------------------------------------------------
	error "NO_DEVICES_FOUND" Firefox Windows - user agent specific error
	error "PermissionDeniedError"
	error "ConstraintNotSatisfied"
	---------------------------------------------------
 */

if (typeof (Detection) === "undefined")
  Detection = {};

/*
 * User Agent ---------------------------------------------------
 */
(function(root) {
  var ua = navigator.userAgent || navigator.vendor || window.opera;
  var agent = root.ua = root.ua || {};
  agent.__ = ua;

  // / Browsers
  agent.ie = /* @cc_on!@ */false || !!document.documentMode; // IE 6.0 - 11
  agent.firefox = typeof InstallTrigger !== 'undefined'; // Firefox 0.8 - 25
  agent.opera = !!window.opera || /Opera|OPR/i.test(ua); // Opera 8.0 - 15
  agent.chrome = !!window.chrome && !agent.opera; // Chrome 1.0 - 30
  agent.safari = /Safari/i.test(ua) && !agent.opera && !agent.chrome; // Safari
  // 1.0 -
  // 6.0

  // / Platforms
  agent.ios = /iPhone|iPad|iPod/i.test(ua);
  agent.android = /Android/i.test(ua);
  agent.mac = !agent.ios && /Mac/.test(ua);
  agent.windows = /Windows/.test(ua);
  agent.linux = /Linux/.test(ua);
})(Detection);

/*
 * Direction ---------------------------------------------------
 */
(function(root) {
  root.getUserMediaDirection = function() {
    var agent = root.ua;
    if (agent.android) {
      if (agent.chrome) {
        return "center bottom";
      } else if (agent.firefox) {
        return "center top";
      } else if (agent.opera) {
        return "center center";
      }
    } else if (agent.windows) {
      if (agent.chrome) {
        return "left top";
      }
    } else if (agent.opera) {
      return "center top";
    } else if (agent.chrome) {
      return "right top";
    } else if (agent.firefox) {
      return "left top";
    }
    return "center top"; // best guess
  };
})(Detection);
