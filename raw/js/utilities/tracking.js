var TRACKING = TRACKING || {};

(function(window, undefined){

	var Tracking = function() {
		console.log('>>Tracking');
		this.isReady = false;
		this.isLoaded = false;
	}

	Tracking.prototype.onReady = function() {
		this.isReady = true;
		this.init();
	}

	Tracking.prototype.onLoad = function() {
		this.isLoaded = true;
		this.init();
	}

	Tracking.prototype.init = function () {
		if (!this.isLoaded || !this.isReady) return;

		this.initDOM();
	}

	Tracking.prototype.initDOM = function() {

		this.projectName = document.querySelector('.project-name');

		this.aTracked = document.querySelectorAll('.tracking');
		this.saveImage = document.querySelector('.actions .save');
		this.socials = document.querySelectorAll('.social-icons button');

		var self = this;

		if (this.projectName === null) {

			setTimeout(function(){
				self.initDOM();
			}, 100);

			return;
		}

		console.log('>>Tracking:: initDOM');

		if (this.aTracked != null) {

			for (var i = 0; i < this.aTracked.length; i++) {

				var link = this.aTracked[i];

				link.addEventListener('click', function(e){

					var target = e.currentTarget;
					var trackingLabel = target.dataset.trackinglabel;
					var trackingCategory = target.dataset.trackingcategory;

					ga("send", "event", trackingCategory, 'click', trackingLabel);

				}, false);

			}

		}

		if (this.socials != null) {

			for (var i = 0; i < this.socials.length; i++) {

				var social = this.socials[i];

				social.addEventListener('click', function(e){

					var className  = e.currentTarget.className;
					var service = className;

					switch(className) {
						case "gplus": service = "googleplus"; break;
					}
					if(self.projectName.value == "robots"){
						ga("send", "event", "garden_robot", 'click', 'share_' + service);
					}
					else{
						ga("send", "event", self.projectName.value, 'click', 'share_' + service);
					}


				}, false);

			}

		}

		if (this.saveImage != null) {

			this.saveImage.addEventListener('click', function(e){

				ga("send", "event", self.projectName.value, 'click', 'save_project');

			}, false);

		}



	}

	// Start here
	TRACKING = new Tracking();
	document.addEventListener("DOMContentLoaded", TRACKING.onReady.bind(TRACKING), false);
	window.onload = TRACKING.onLoad.bind(TRACKING);

})(window, undefined);
