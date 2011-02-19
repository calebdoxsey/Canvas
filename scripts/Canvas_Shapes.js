LoadInto("Canvas.Shapes", function() {
	var distance = function(x1,y1,x2,y2) {
		return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
	};
	var distanceFromLine = function(x,y,x1,y1,x2,y2) {
		var A = x - x1;
		var B = y - y1;
		var C = x2 - x1;
		var D = y2 - y1;

		var dot = A * C + B * D;
		var len_sq = C * C + D * D;
		var param = dot / len_sq;

		var xx;
		var yy;

		if (param < 0) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		return distance(x,y,xx,yy);
	};

	var fromPercent = function(x) {
		return x * Math.PI * 2;
	}
	var fromDegrees = function(x) {
		return x * (Math.PI / 180);
	}

	var toDegrees = function(x) {
		return x * (180 / Math.PI);
	}

	var getAngle = function(x1,y1,x2,y2) {
		var dy = Math.abs(y2-y1);
		var dx = Math.abs(x2-x1);

		if (x2 > x1) {
			if (y2 > y1) {
				return Math.atan(dy/dx);
			} else {
				return (Math.PI * 3 / 2) + Math.atan(dx/dy);
			}
		} else {
			if (y2 > y1) {
				return (Math.PI/2) + Math.atan(dx/dy);
			} else {
				return Math.PI + Math.atan(dy/dx);
			}
		}

		return 0;
	};


	var Dasher = function(canvas, dashes) {
		var ctx = canvas.context;

		var dashValues = dashes;
		var dashIdx = 0;
		var dashOffset = dashValues[0];
		var dashX = 0, dashY = 0;

		this.moveTo = function(x, y) {
			dashX = x;
			dashY = y;
		};

		this.lineTo = function(x1, y1) {
			var length = Math.sqrt( (x1-dashX)*(x1-dashX) + (y1-dashY)*(y1-dashY) );
			var dx = (x1-dashX) / length;
			var dy = (y1-dashY) / length;

			var dist = 0;
			while (dist < length) {
				var dashLength = Math.min(dashValues[dashIdx], length-dist);
				dist += dashLength;

				if (dashIdx % 2 == 0)
					ctx.moveTo(dashX, dashY);

				dashX += dashLength * dx;
				dashY += dashLength * dy;

				if (dashIdx % 2 == 0)
					ctx.lineTo(dashX, dashY);

				dashOffset += dashLength;
				if (dashOffset > dashValues[dashIdx]) {
					dashOffset -= dashValues[dashIdx];
					dashIdx = (dashIdx+1) % dashValues.length;
				}
			}
		};
	};

	/**
	 * The base class for all shapes.
	 *
	 * @class Shape
	 */
	var Shape = this.Shape = function(canvas) {
		this.canvas = canvas;
		this._z = 0;
		this.animations = {};
		this.visible = true;
	};
	Shape.prototype._draw = function(canvas) {};
	/**
	 * Create an Animation for this shape.
	 */
	Shape.prototype.createAnimation = function(args) {
		args.shape = this;
		if (args.setter) {
			return new Canvas.CustomAnimation(args);
		} else {
			return new Canvas.PropertyAnimation(args);
		}
	};
	/**
	 * Whether or not the point is contained within this shape
	 */
	Shape.prototype.containsPoint = function(x,y) {
		return false;
	};
	/**
	 * Draws the shape
	 */
	Shape.prototype.draw = function(canvas) {
		canvas.context.save();

		if (this.fillStyle) {
			canvas.context.fillStyle = this.fillStyle;
		}
		if (this.strokeStyle) {
			canvas.context.strokeStyle = this.strokeStyle;
		}
		if (this.lineWidth) {
			canvas.context.lineWidth = this.lineWidth;
		}
		if (this.lineJoin) {
			canvas.context.lineJoin = this.lineJoin;
		}
		if (this.lineCap) {
			canvas.context.lineCap = this.lineCap;
		}
		if (this.miterLimit) {
			canvas.context.miterLimit = this.miterLimit;
		}
		if (this.globalAlpha) {
			canvas.context.globalAlpha = this.globalAlpha;
		}

		this._draw(canvas);

		canvas.context.restore();
	};
	/**
	 * Move the shape backward
	 */
	Shape.prototype.moveBackward = function() {
		this.setZ(this.z-1);
	};
	/**
	 * Move the shape forward
	 */
	Shape.prototype.moveForward = function() {
		this.setZ(this.z+1);
	};
	/**
	 * Gets the z index of the shape
	 */
	Shape.prototype.getZ = function(z) {
		return this._z;
	};
	/**
	 * Changes the z index of the shape.
	 */
	Shape.prototype.setZ = function(z) {
		this._z = z;
		if (this.canvas) {
			this.canvas.positionShape(this);
		}
	};
	/**
	 * @class Circle
	 */
	var Circle = this.Circle = function(x,y,radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	};
	Circle.prototype = new Shape();
	Circle.prototype.containsPoint = function(x,y) {
		return distance(this.x,this.y,x,y) <= this.radius;
	};
	Circle.prototype._draw = function(canvas) {
		canvas.context.beginPath();
		canvas.context.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
		canvas.context.fill();
	};

	var Line = this.Line = function(x1,y1,x2,y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	};
	Line.prototype = new Shape();
	Line.prototype._draw = function(canvas) {
		canvas.context.beginPath();

		if (this.dashes) {
			var dasher = new Dasher(canvas, this.dashes);
			dasher.moveTo(this.x1, this.y1);
			dasher.lineTo(this.x2, this.y2);
		} else {
			canvas.context.moveTo(this.x1,this.y1);
			canvas.context.lineTo(this.x2,this.y2);
		}
		canvas.context.stroke();
	};
	Line.prototype.containsPoint = function(x,y) {
		return distanceFromLine(x,y,this.x1,this.y1,this.x2,this.y2) < this.lineWidth;
	};


	var LineSeries = this.LineSeries = function(coordinates) {
		this.coordinates = coordinates;
		this.lineWidth = 1;
	};
	LineSeries.prototype = new Shape();
	LineSeries.prototype._draw = function(canvas) {
		canvas.context.beginPath();
		canvas.context.moveTo(this.coordinates[0].x,this.coordinates[0].y);
		for (var i=1; i<this.coordinates.length; i++) {
			canvas.context.lineTo(this.coordinates[i].x,this.coordinates[i].y);
		}
		canvas.context.stroke();
	};
	LineSeries.prototype.containsPoint = function(x,y) {
		// Find the minimum distance from any of the line segments
		var min = Number.POSITIVE_INFINITY;
		for (var i=1; i<this.coordinates.length; i++) {
			min = Math.min(min, distanceFromLine(
				x,y,
				this.coordinates[i-1].x,this.coordinates[i-1].y,
				this.coordinates[i].x,this.coordinates[i].y)
			);
		}
		// If we are within "lineWidth" pixels return true
		if (min < this.lineWidth) {
			return true;
		} else {
			return false;
		}
	};
	var FilledLineSeries = this.FilledLineSeries = function(coordinates) {
		this.coordinates = coordinates;
		this.lineWidth = 1;
		this.fillTo = "bottom";
	};
	FilledLineSeries.prototype = new LineSeries();
	FilledLineSeries.prototype._draw = function(canvas) {

		var w = canvas.context.canvas.width;
		var h = canvas.context.canvas.height;

		canvas.context.beginPath();
		canvas.context.moveTo(0,h);
		canvas.context.lineTo(this.coordinates[0].x,this.coordinates[0].y);
		for (var i=1; i<this.coordinates.length; i++) {
			canvas.context.lineTo(this.coordinates[i].x,this.coordinates[i].y);
		}
		canvas.context.lineTo(this.coordinates[this.coordinates.length-1].x || 0, h);
		canvas.context.lineTo(0,h);
		canvas.context.stroke();
		canvas.context.fill();
	};

	var Polygon = this.Polygon = function(coordinates) {
		this.coordinates = coordinates;

		var minx=coordinates[0].x,miny=coordinates[0].y,maxx=coordinates[0].x,maxy=coordinates[0].y;

		for (var i=1; i<coordinates.length; i++) {
			minx = Math.min(coordinates[i].x, minx);
			miny = Math.min(coordinates[i].y, miny);
			maxx = Math.max(coordinates[i].x, maxx);
			maxy = Math.max(coordinates[i].y, maxy);
		};

		this.minx = minx;
		this.miny = miny;
		this.maxx = maxx;
		this.maxy = maxy;
	};
	Polygon.prototype = new Shape();
	Polygon.prototype.getBoundingBox = function() {
		return {
			x: this.minx,
			y: this.miny,
			width: this.maxx - this.minx,
			height: this.maxy - this.miny
		};
	};
	Polygon.prototype._draw = function(canvasWrapper) {
		canvasWrapper.context.beginPath();
		canvasWrapper.context.moveTo(this.coordinates[0].x,this.coordinates[0].y);
		for (var i=1; i<this.coordinates.length; i++) {
			canvasWrapper.context.lineTo(this.coordinates[i].x,this.coordinates[i].y);
		}
		canvasWrapper.context.lineTo(this.coordinates[0].x,this.coordinates[0].y);
		canvasWrapper.context.fill();

		if (this.strokeStyle && this.lineWidth != 0) {
			canvasWrapper.context.beginPath();
			canvasWrapper.context.moveTo(this.coordinates[0].x,this.coordinates[0].y);
			for (var i=1; i<this.coordinates.length; i++) {
				canvasWrapper.context.lineTo(this.coordinates[i].x,this.coordinates[i].y);
			}
			canvasWrapper.context.lineTo(this.coordinates[0].x,this.coordinates[0].y);
			canvasWrapper.context.stroke();
		}
	};
	Polygon.prototype.containsPoint = function(x,y) {
		var xnew,ynew,xold,yold,x1,y1,x2,y2;

		// TODO: Implement from line check
		if (this.coordinates.length < 3) {
			return false;
		}

		if (x < this.minx || y < this.miny || x > this.maxx || y > this.maxy) {
			return false;
		}

		var inside = false;

		xold = this.coordinates[this.coordinates.length-1].x;
		yold = this.coordinates[this.coordinates.length-1].y;
		for (var i=0; i<this.coordinates.length; i++) {
			xnew = this.coordinates[i].x;
			ynew = this.coordinates[i].y;
			if (xnew > xold) {
				x1 = xold;
				x2 = xnew;
				y1 = yold;
				y2 = ynew;
			} else {
				x1 = xnew;
				x2 = xold;
				y1 = ynew;
				y2 = yold;
			}
			if ( (xnew < x) == (x <= xold)
				&& (y - y1)*(x2 - x1) < (y2 - y1)*(x - x1)) {
				inside = !inside;
			}
			xold = xnew;
			yold = ynew;
		}

		return inside;
	};
	var Rectangle = this.Rectangle = function(x,y,width,height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};
	Rectangle.prototype = new Shape();
	Rectangle.prototype._draw = function(canvas) {
		canvas.context.fillRect(this.x,this.y,this.width,this.height);
		if (this.strokeStyle && this.lineWidth > 0) {
			canvas.context.strokeRect(this.x,this.y,this.width,this.height);
		}
	};
	Rectangle.prototype.containsPoint = function(x,y) {
		return x >= this.x && x <= this.x+this.width
			&& y >= this.y && y <= this.y+this.height;
	};

	/**
	 * @class Wedge
	 */
	var Wedge = this.Wedge = function(x,y,radius,startAngle,endAngle) {
		this.x = x;
		this.y = y;
		this.radius = radius;

		this.startAngle = startAngle;
		this.endAngle = endAngle;
	};
	Wedge.prototype = new Shape();
	Wedge.prototype._draw = function(canvas) {
		canvas.context.beginPath();
		canvas.context.moveTo(this.x + this.radius * Math.cos(this.endAngle),this.y + this.radius * Math.sin(this.endAngle));
		canvas.context.lineTo(this.x,this.y);
		canvas.context.lineTo(this.x + this.radius * Math.cos(this.startAngle),this.y + this.radius * Math.sin(this.startAngle));
		canvas.context.arc(this.x,this.y,this.radius,this.startAngle,this.endAngle,false);
		canvas.context.fill();
		if (this.lineWidth && this.lineWidth > 0) {
			canvas.context.beginPath();
			canvas.context.moveTo(this.x + this.radius * Math.cos(this.endAngle),this.y + this.radius * Math.sin(this.endAngle));
			canvas.context.lineTo(this.x,this.y);
			canvas.context.lineTo(this.x + this.radius * Math.cos(this.startAngle),this.y + this.radius * Math.sin(this.startAngle));
			canvas.context.arc(this.x,this.y,this.radius,this.startAngle,this.endAngle,false);
			canvas.context.stroke();
		}
	};
	Wedge.prototype._fixAngle = function(angle) {
		if (isNaN(angle) || angle == Number.NEGATIVE_INFINITY || angle == Number.POSITIVE_INFINITY) return angle;

		var pi2 = Math.PI*2;

		var sanity = 0;
		while (angle < 0 || sanity++ > 10000) angle+=pi2;
		while (angle - pi2 > 0 || sanity++ > 10000) angle-=pi2;

		return angle;
	};
	Wedge.prototype.containsPoint = function(x,y) {
		var inCircle = distance(this.x,this.y,x,y) <= this.radius;
		var angle = this._fixAngle(getAngle(this.x,this.y,x,y) - this.startAngle);
		var eAngle = this._fixAngle(this.endAngle - this.startAngle);

		return inCircle && angle <= eAngle;
	};

	var Image = this.Image = function(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
		this.img = img;
		this.sx = sx || 0;
		this.sy = sy || 0;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
		this.dx = dx;
		this.dy = dy;
		this.dWidth = dWidth;
		this.dHeight = dHeight;
	};
	Image.prototype = new Shape();
	Image.prototype._draw = function(canvas) {
		if (this.sWidth != undefined && this.sHeight != undefined) {
			// Slicing
			if (this.dx != undefined && this.dy != undefined && this.dWidth != undefined && this.dHeight != undefined) {
				canvas.context.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.dx, this.dy, this.dWidth, this.dHeight);
			// Scaling
			} else {
				canvas.context.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight);
			}
		// Placement
		} else {
			canvas.context.drawImage(this.img, this.sx, this.sy);
		}
	};
	Image.prototype.containsPoint = function(x,y) {
		if (this.sWidth != undefined && this.sHeight != undefined) {
			// Slicing
			if (this.dx != undefined && this.dy != undefined && this.dWidth != undefined && this.dHeight != undefined) {
				return x >= this.dx && x <= this.dx + this.dWidth
					&& y >= this.dy && y <= this.dy + this.dHeight;
			// Scaling
			} else {
				return x >= this.sx && x <= this.sx + this.sWidth
					&& y >= this.sy && y <= this.sy + this.sHeight;
			}
		// Placement
		} else {
			var w = this.img.width;
			var h = this.img.height;

			return x >= this.sx && x <= this.sx+w
				&& y >= this.sy && y <= this.sy+h;
		}
	};

	var DOMElement = this.DOMElement = function(x,y,contents) {
		this.x = x;
		this.y = y;
		this.contents = contents;
		this.id = "canvas_dom_element_" + (DOMElement._elementCount++);

		this.style = {};
	};
	DOMElement.prototype = new Shape();
	DOMElement._elementCount = 0;
	DOMElement.prototype._draw = function(canvas) {
		var el = document.getElementById(this.id);

		if (!el) {
			el = document.createElement("div");
			el.className = "DOMElement";
			el.style.position = "absolute";
			el.id = this.id;
			canvas.canvasElement.parentNode.appendChild(el);
		}

		this.element = el;

		for (var prop in this.style) {
			el.style[prop] = this.style[prop];
		}

		el.innerHTML = this.contents;
		el.style.left = this.x + "px";
		el.style.top  = this.y + "px";
	};

	var DOMText = this.DOMText = function(x,y,text) {
		DOMElement.call(this,x,y,text);
	};
	DOMText.prototype = new DOMElement();
});
