var ROBOTTRACKING = {};

(function() {

	var RobotTracking = function() {
		this.isReady = false;
		this.isLoaded = false;

		this.levelBtn = null;
		this.levelErrorBtn = null;

	}

	RobotTracking.prototype.onReady = function() {
		this.isReady = true;
		this.init();
	}

	RobotTracking.prototype.onLoad = function() {
		this.isLoaded = true;
		this.init();
	}

	RobotTracking.prototype.init = function() {
		if (!this.isLoaded || !this.isReady)
			return;

		this.initDOM();
	}
	function getCookie(name) {
		  var value = "; " + document.cookie;
		  var parts = value.split("; " + name + "=");
		  if (parts.length == 2) return parts.pop().split(";").shift();
		}

	RobotTracking.prototype.initDOM = function() {

		this.levelBtn = document
				.querySelectorAll(".robots .stage-indicator button");

		this.helpBtn = document
		.querySelector(".robots .help");

		this.overlayClose = document.querySelector(".overlay .content .close");

		this.doneOverlayClose = document.querySelector(".robots .done-overlay .close");

		if (this.levelBtn[0] == null || this.levelBtn[0] == undefined) {
			var self = this;
			setTimeout(function() {
				self.initDOM();
			}, 100);
		} else {
			this.levelBtn[0].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'level_1');
			}, false);
			this.levelBtn[1].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'level_2');
			}, false);
			this.levelBtn[2].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'level_3');
			}, false);
			this.levelBtn[3].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'level_4');
			}, false);
			this.levelBtn[4].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'level_5');
			}, false);

			this.helpBtn.addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'help');
			}, false);

			this.overlayClose.addEventListener('click', function(e) {
				ga('send', 'event', 'Project', 'click', 'close_overlay_garden_robot');
			}, false);

			this.doneOverlayClose.addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'close');
			}, false);

			this.goBackBtn = document.querySelectorAll(".message-action")[0];
			if(this.goBackBtn.querySelector("button").innerHTML == "GO BACK"){
				this.goBackBtn.removeChild(this.goBackBtn.querySelector("button"));
				this.goBackBtn.innerHTML += '<a href="https://www.madewithcode.com/projects" class="done button-small" target="_parent" style="margin-top:10px">GO BACK</a>'
			    this.overlayClose.style.display = "none";
			}
		}
		this.levelErrorBtn = document
				.querySelectorAll(".overlay .action.button-small");

		if (this.levelErrorBtn == null) {
			var self = this;
			setTimeout(function() {
				self.initDOM();
			}, 100);
		} else {
			this.levelErrorBtn[1].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'lets_go_level_' + (parseInt(getCookie("robot_level")) + 1));
			}, false);
			this.levelErrorBtn[2].addEventListener('click', function(e) {
				ga('send', 'event', 'garden_robot', 'click', 'try_again_level_' + (parseInt(getCookie("robot_level"))));
			}, false);
		}
	}

	// Start here
	ROBOTTRACKING = new RobotTracking();
	document.addEventListener("DOMContentLoaded", ROBOTTRACKING.onReady
			.bind(ROBOTTRACKING), false);
	window.onload = ROBOTTRACKING.onLoad.bind(ROBOTTRACKING);

})();
