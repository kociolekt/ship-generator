Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

Array.prototype.clone = function() {
	return this.slice(0);
};

function ShipGenerator(config) {

	this.defaultOptions = {
		className: 'Private Vessel',
		minLength: 10,
		maxLength: 24,
		minWidth: 5,
		maxWidth: 15,
		minHeight: 5,
		maxHeight: 15,
		minBodyBreakPoints: 1,
		maxBodyBreakPoints: 3,
		bodyType: 'fluidStyle' // fluidStyle|linearStyle
	};

	this.settings = this.defaultOptions.extend(config);

	//RaceBasedConfig
    var line = this[this.settings.bodyType];

    //ClassBasedConfig
    var modelLength = this.randInt(config.minLength, config.maxLength);
    var bodyBreakPointsNumber = this.randInt(config.minBodyBreakPoints, config.maxBodyBreakPoints);

    //Generating Body Spain
    var bodyPoints = [],
    	centerOfMass = new THREE.Vector3( 0, 0, 0 );

    for (var i = 0; i < bodyBreakPointsNumber + 2; i++) {
    	var bodyPointHeight = this.randInt(config.minHeight, config.maxHeight),
    		bodyPointLength = modelLength / (bodyBreakPointsNumber + 1) * i;
    	bodyPoints.push(new THREE.Vector3(0, bodyPointHeight, bodyPointLength));
    	centerOfMass.y += bodyPointHeight;
    	centerOfMass.z += bodyPointLength;
    };

    centerOfMass.y = centerOfMass.y / (bodyBreakPointsNumber + 2);
    centerOfMass.z = centerOfMass.z / (bodyBreakPointsNumber + 2);

    this.translate(bodyPoints, {0, -centerOfMass.y, -centerOfMass.z});

    //Meshing

}

ShipGenerator.prototype.fluidStyle = function(points) {
	return points;
};

ShipGenerator.prototype.linearStyle = function(points) {
	return points;
};

/* Utils */
ShipGenerator.prototype.randInt = function(min, max) {
	return Math.floor((Math.random() * max) + min);
};

ShipGenerator.prototype.translate = function(points, v) {

	for (var i = 0, pLen = points.length; i < pLen; i++) {
		points[i].x + v.x;
		points[i].y + v.z;
		points[i].y + v.z;
	};

	return points;
};

ShipGenerator.prototype.distance = function(v1, v2) {
    var dx = v1.x - v2.x,
    	dy = v1.y - v2.y,
    	dz = v1.z - v2.z;

    return Math.sqrt(dx*dx+dy*dy+dz*dz);
};

ShipGenerator.prototype.angle = function(v1, v2, v3) {
    var d12 = distance(v1, v2),
    	d13 = distance(v1, v3),
    	d23 = distance(v2, v3);

    return Math.acos(((d12*d12) + (d13*d13) - (d23*d23)) / (2*d12*d13));
};

ShipGenerator.prototype.bezier = function(points, t) {
	if (points.length === 1) {
		return points[0];
	} else {
		var left = points.clone(),
			right = points.clone();

		left.pop();
		right.shift();

		return {
			x: ((1 - t) * this.bezier(left, t).x) + (t * this.bezier(right, t).x),
			y: ((1 - t) * this.bezier(left, t).y) + (t * this.bezier(right, t).y),
			z: ((1 - t) * this.bezier(left, t).z) + (t * this.bezier(right, t).z)
		};
	}
};

ShipGenerator.prototype.linear = function(points) {
	return points;
};

