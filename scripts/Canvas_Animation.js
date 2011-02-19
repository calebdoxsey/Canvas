LoadInto("Canvas", function() {
	/**
	 * Represents an animation animation
	 * 
	 * @class Animation
	 */
	var Animation = this.Animation = function(args) {
		if (args) {
			this.shape = args.shape;
			this.from = args.from;
			this.to = args.to;
			this.time = args.time;
			this.delay = args.delay || 0;
			this.unit = (this.to - this.from) / this.time;
			
			this.onend = function() {};
			this.onstart = function() {};
			
			this._paused = false;	
			this._started = false;
		}
	};
	/**
	 * Pauses an animation
	 */
	Animation.prototype.pause = function() {
		if (!this._paused) {
			this._paused = true;
			this.shape.canvas.animator.pause(this);
		}
	};
	/**
	 * Resumes a paused animation
	 */
	Animation.prototype.resume = function() {
		if (this._paused) {
			this._paused = false;
			this.shape.canvas.animator.resume(this);
		}
	};
	/**
	 * Sets the value for the animation
	 *
	 * @param {Number} value The value
	 */
	Animation.prototype.set = function(value) {
		
	};
	/**
	 * Starts the animation
	 */
	Animation.prototype.start = function() {
		if (!this._started) {
			this._started = true;
			this.shape.canvas.animator.start(this);
		}
	};
	/**
	 * Stops the animation
	 */
	Animation.prototype.stop = function() {
		if (this._started) {
			this._started = false;
			this.shape.canvas.animator.stop(this);
		}
	};
	/**
	 * An animation over a property.
	 *
	 * @class PropertyAnimation
	 */
	var PropertyAnimation = this.PropertyAnimation = function(args) {
		Animation.call(this,args);
		
		this.property = args.property;
	};
	PropertyAnimation.prototype = new Animation();
	PropertyAnimation.prototype.set = function(val) {
		this.shape[this.property] = val;
	};
	/**
	 * A custom animation. Use a function on the animation with property called
	 * "setter" which represents the setter function.
	 */
	var CustomAnimation = this.CustomAnimation = function(args) {
		Animation.call(this,args);
		
		this.setter = args.setter;
	};
	CustomAnimation.prototype = new Animation();
	CustomAnimation.prototype.set = function(value) {
		this.setter.call(this.shape,value);
	};
});