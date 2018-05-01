window.debounce = function(func, wait, now) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		if(now && !timeout) func.apply(context, arguments);
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if(!now) func.apply(context, arguments);
		}, wait);
	}
}
