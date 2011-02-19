LoadInto("Canvas",function() {
	var fixEvent = function(evt) {
		if (!evt.pageX) {
			evt.pageX = evt.clientX + document.documentElement.scrollLeft;
		}
		if (!evt.pageY) {
			evt.pageY = evt.clientY + document.documentElement.scrollTop;
		}
	}

	var CanvasEvent = this.CanvasEvent = function(nativeEvent, canvasElement) {
		fixEvent(nativeEvent);

		var x = 0;
		var y = 0;
		var el = canvasElement;
		while (el) {
			x += el.offsetLeft;
			y += el.offsetTop;

			el = el.offsetParent;
		}

		this.x = nativeEvent.pageX - x;
		this.y = nativeEvent.pageY - y;
		this.nativeEvent = nativeEvent;
		this.canvas = canvasElement;
	};

	/**
	 * Canvas has no notion of shapes inside of a canvas, so there is no native
	 *   event handling. This class will simulate events for shapes.
	 *
	 * @class CanvasEvents
	 * @param {Canvas.Wrapper} wrapper The canvas wrapper to manage events for
	 * @param {HTMLElement} el The canvas element to attach events to
	 */
	var CanvasEvents = this.CanvasEvents = function(wrapper, el) {
		var events = this.events = {

			"onmousedown": function(evt,el) {
				var canvasEvent = new CanvasEvent(evt,el);

				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];

					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (containsPoint) {
						if (shape.onmousedown) {
							shape.onmousedown.call(shape, canvasEvent, shape);
						}
						shape.__mousedown = true;
					} else {
						shape.__mousedown = false;
					}
				}
			},
			"onmousemove": function(evt,el) {
				var canvasEvent = new CanvasEvent(evt,el);
				var checkDrag = true;

				// Mouse move events
				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];
					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (containsPoint) {
						if (shape.onmousemove) {
							shape.onmousemove.call(shape, canvasEvent, shape);
						}
					}
				}

				var mousedOver = null;
				// Find a shape that's been moused over
				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];
					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (containsPoint) {
						if (!shape.__mouseover) {
							shape.__mouseover = true;
							mousedOver = shape;
						}
						break;
					}
				}
				// Do all the mouseouts
				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];
					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if ( ((mousedOver && shape != mousedOver) || (!containsPoint)) && shape.__mouseover) {
						if (shape.onmouseout) {
							shape.onmouseout.call(shape, canvasEvent, shape);
						}
						shape.__mouseover = false;
					}
				}
				// We moused over something so call the mouseover event
				if (mousedOver && mousedOver.onmouseover) {
					mousedOver.onmouseover.call(mousedOver, canvasEvent, mousedOver);
				}

				// Do all the mousedown events
				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];
					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					// Handle dragging events
					if (checkDrag && containsPoint && shape.__mousedown) {
						if (!shape.__dragging) {
							shape.__dragging = true;
							if (shape.ondragstart) {
								shape.ondragstart.call(shape, canvasEvent, shape);
							}
						}
					}
					if (checkDrag && shape.__dragging) {
						if (shape.ondrag) {
							shape.ondrag.call(shape, canvasEvent, shape);
						}
						checkDrag = false;
					}
				}
			},
			"onmouseout": function(evt, el) {
				var canvasEvent = new CanvasEvent(evt,el);

				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];
					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (!containsPoint && shape.__mouseover) {
						if (shape.onmouseout) {
							shape.onmouseout.call(shape, canvasEvent, shape);
						}
						shape.__mouseover = false;
					}
				}
			},
			"onmouseup": function(evt,el) {
				var canvasEvent = new CanvasEvent(evt,el);
				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];

					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (containsPoint && shape.onmouseup) {
						shape.onmouseup.call(shape, canvasEvent, shape);
					}
				}

				for (var i=wrapper.shapes.length-1; i>=0; i--) {
					var shape = wrapper.shapes[i];

					var containsPoint = shape.containsPoint(canvasEvent.x,canvasEvent.y);

					if (containsPoint && shape.__mousedown && shape.onclick) {
						shape.onclick.call(shape, canvasEvent, shape);
					}



					if (shape.__dragging) {
						shape.__dragging = false;
						if (shape.ondragend) {
							shape.ondragend.call(shape, canvasEvent, shape);
						}
					}

					shape.__mousedown = false;
				}
			}
		};

		for (var prop in events) {
			el[prop] = (function(prop) {
				return function() {
					return events[prop](arguments.length ? arguments[0] : window.event,this);
				}
			})(prop);
		}
	};
});
