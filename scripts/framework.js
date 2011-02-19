_global_ = this;
(function() {
	_global_.LoadInto = function(name,func) {		
		var dotParts = name.split(".");
		
		var thisObject = _global_;
		var thisName = "";
		var parentObject = _global_;
		
		while (dotParts.length) {
			var p = dotParts.shift();
			if (!thisObject[p]) {
				thisObject[p] = {};
			}
			parentObject = thisObject;
			thisName = p;
			thisObject = thisObject[p];
		}
		
		var result = func.call(thisObject);
		
		if (result !== undefined) {
			for (var prop in lastObj) {
				result[prop] = lastObj[prop];
			}
			parentObject[thisName] = result;
		}
	};
	
	/*
	var parseUsing = function(str) {
		var asParts = str.split(" as ");
		
		var dotParts = asParts[0].split('.');
		var lastObj = __global__;
		
		while (dotParts.length) {
			var p = dotParts.shift();
			if (!lastObj[p]) {
				lastObj[p] = {};
			}
			lastObj = lastObj[p];
		};
		
		return {
			fullName: str,
			name: p,
			qualifiedName: asParts[1],
			object: lastObj
		};
	};
	using = function() {
		var usingStack = [];
		var objects = {};
		var popEm = false;
		for (var i=0; i<arguments.length; i++) {
			if (typeof(arguments[i]) == "string") {
				
				var parsed = parseUsing(arguments[i]);
				
				if (parsed.qualifiedName) {
					usingStack.push({
						value: __global__[parsed.qualifiedName],
						name: parsed.qualifiedName								
					});
					__global__[parsed.qualifiedName] = parsed.object;
					objects[parsed.qualifiedName] = parsed.fullName;
				} else {
					for (var prop in parsed.object) {
						usingStack.push({
							value: __global__[prop],
							name: prop
						});
						__global__[prop] = parsed.object[prop];
						objects[prop] = parsed.fullName + '.' + prop;
					}
				}						
			} else if (typeof(arguments[i]) == "function") {
				popEm = true;
				var f = arguments[i].toString();
				
				
				var fSignature = f.substr(0,f.indexOf('{')+1);
				var fBody = f.substr(f.indexOf('{')+1);
				
				var newF = ['(',fSignature];
				for (var prop in objects) {
					newF.push('var ',prop,'=',objects[prop],';');
				}
				newF.push(fBody,').call()');
				console.log(newF.join(''));
				
				arguments[i].apply(this,[]);
			}
		}
		
		if (popEm) {
			for (var i=0; i<usingStack.length; i++) {
				__global__[usingStack[i].name] = usingStack[i].value;
			}
		}
	};
	namespace = function(name, func) {
		if (typeof(name) == "string") {
			var parsed = parseUsing(name);
			func.apply(parsed.object,[]);
		}				
	};
	*/
})();