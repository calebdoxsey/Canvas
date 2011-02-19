LoadInto("Canvas",function() {

	var getTime = function() {
		return (new Date()).getTime();
	};
	
	var Animator = this.Animator = function(canvas) {
		this.canvas = canvas;
		
		this._pausedAnimations = [];
		this._activeAnimations = [];
		this._stoppedAnimations = [];
		
		this._isRunning = false;
		this._timer = null;
	};
	Animator.prototype._run = function() {
		// Not running so start up the timer
		if (!this._isRunning) {
			var that = this;
			window.setTimeout(function() {
				var now = getTime();
				
				if (that._activeAnimations.length) {
					
					var newList = [];
					for (var i=0; i<that._activeAnimations.length; i++) {
						var animation = that._activeAnimations[i];
						
						var diff = now - animation.__lastTime;
						var next = animation.__lastValue + animation.unit * diff;
						
						if (animation.__startTime + animation.time < now) {
							animation.set(animation.to);
							animation._started = false;
						} else if (animation.__startTime < now) {
							animation.set(next);
							newList.push(animation);
							animation.__lastValue = next;
						} else {
							newList.push(animation);
						}
						
						animation.__lastTime = now;
					}
					that._activeAnimations = newList;
					
					that.canvas.draw();
					window.setTimeout(arguments.callee,1);
				} else {
					that._isRunning = false;
				}
			},1);
		}
	};
	/**
	 * Pause the given animation
	 */
	Animator.prototype.pause = function(animation) {
		// Remove from the active list and add to the paused list
		var newList = [];
		for (var i=0; i<this._activeAnimations.length; i++) {
			if (this._activeAnimations[i] == animation) {
				this._pausedAnimations.push(animation);
				animation.__pauseTime = getTime();
			} else {
				newList.push(this._activeAnimations[i]);
			}
		}
		this._activeAnimations = newList;
	};
	/**
	 * Resume the given animation
	 */
	Animator.prototype.resume = function(animation) {
		var newList = [];
		for (var i=0; i<this._pausedAnimations.length; i++) {
			if (this._pausedAnimations[i] == animation) {
				this._activeAnimations.push(animation);
				animation.__startTime += getTime() - animation.__pauseTime;
				animation.__lastTime = getTime();
			} else {
				newList.push(this._pausedAnimations[i]);
			}
		}
		this._pausedAnimations = newList;
		this._run();
	};
	/**
	 * Start the given animation
	 */
	Animator.prototype.start = function(animation) {
		animation.__lastTime = getTime();
		animation.__startTime = getTime() + animation.delay;
		animation.__lastValue = animation.from;
		this._activeAnimations.push(animation);
		this._run();
	};
	/**
	 * Stop the given animation
	 */
	Animator.prototype.stop = function(animation) {
		// Remove from the active list
		var newList = [];
		for (var i=0; i<this._activeAnimations.length; i++) {
			if (this._activeAnimations[i] != animation) {
				newList.push(this._activeAnimations[i]);
			}
		}
		this._activeAnimations = newList;
	};
});