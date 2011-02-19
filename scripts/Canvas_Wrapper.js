LoadInto("Canvas",function() {
	/**
	 * Provides helper methods for the HTML Canvas element
	 *
	 * @class Helper
	 * @param canvasElement {HTMLElement}
	 * @author Caleb Doxsey caleb@doxsey.net
	 */
	var Wrapper = this.Wrapper = function(canvasElement) {
		this.animator = new Canvas.Animator(this);
		this.shapes = [];
		this.context = canvasElement.getContext("2d");
		this.canvasElement = canvasElement;

		this.events = new Canvas.CanvasEvents(this,canvasElement);
	};
	/**
	 * Add a shape to the wrapper
	 */
	Wrapper.prototype.add = function(shape) {
		this.shapes.push(shape);
		shape.canvas = this;
		this.positionShape(shape);
	};
	/**
	 * Draw the canvas
	 */
	Wrapper.prototype.draw = function() {
		this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);
		for (var i=0; i<this.shapes.length; i++) {
			if (this.shapes[i].visible) {
				this.shapes[i].draw(this);
			}
		}
	};
	/**
	 * Position the shape along its z axis
	 */
	Wrapper.prototype.positionShape = function(shape) {
		var previousZ = 0;
		var thisZ;
		var nextZ;
		for (var i=0; i<this.shapes.length; i++) {
			thisZ = this.shapes[i].getZ();
			if (this.shapes[i] == shape) {
				if (previousZ > thisZ) {
					// Head to the beginning
					for (var j=i-1; j>=0; j--) {
						nextZ = this.shapes[j].getZ();
						if (nextZ > thisZ) {
							var temp = this.shapes[i];
							this.shapes[i] = this.shapes[j];
							this.shapes[j] = temp;
							i=j;
						} else {
							break;
						}
					}
				} else {
					// Head to the end
					for (var j=i+1; j<this.shapes.length; j++) {
						nextZ = this.shapes[j].getZ();
						if (nextZ < thisZ) {
							// Swap em
							var temp = this.shapes[i];
							this.shapes[i] = this.shapes[j];
							this.shapes[j] = temp;
							i=j;
						} else {
							break;
						}
					}
				}
				break;
			}
			previousZ = thisZ;
		}
	};
});
