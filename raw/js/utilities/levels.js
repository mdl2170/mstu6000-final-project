/**
 * @fileinfo Set of functions specific for challenges with levels like Robots or Games
 */

window.LevelUtils = (function(){

	var adjustBlockCountPosition = function() {
		var blocks = document.querySelector(".stage-block-count"),
			menu = document.querySelector(".challenge .menu .regular"),
			mobile = document.querySelector(".challenge .menu .mobile"),
			question = menu.querySelector("button.help");

		if (window.getComputedStyle(mobile).display !== "none") {
			return;
		}

		menu.insertBefore(blocks, question);
		blocks.style.backgroundColor = "transparent";
		blocks.style.top = "2px";
		blocks.style.right = "60px";
		blocks.style.width = "280px";
	};

	(function(condition, result){
		(function ticker() {
			if (condition()) {
				result();
			} else {
				setTimeout(ticker, 100);
			}
		})();
	})(function(){ return !!document.querySelector(".stage-block-count") && !!document.querySelector(".challenge .menu .regular")
			&& !!document.querySelector(".challenge .menu .regular .help") && !!document.querySelector(".challenge .menu .mobile"); },
	    adjustBlockCountPosition);

	// public API
	return {

	};
})();
