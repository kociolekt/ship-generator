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
        minWingsNumber: 0,
        maxWingsNumber: 4,
		bodyType: 'fluidStyle', // fluidStyle|linearStyle
        symmetrical: true,
        noseCut: false,
        tailCut: true
	};

	this.settings = this.defaultOptions.extend(config);

    this.geometry = {
        vertices: [],
        faces: []
    }

    //ClassBasedConfig
    var bodyBreakPointsNumber = this.randInt(this.settings.minBodyBreakPoints, this.settings.maxBodyBreakPoints);

    //Generating Body Spain
    var topLine = [],
        bottomLine = [],
        leftLine = [],
        rightLine = [],
    	centerOfMass = {x:0, y:0, z:0},
        pointIndex = 0,
        maxPoints = bodyBreakPointsNumber + 2;

    this.shipHeight = this.randInt(this.settings.minHeight, this.settings.maxHeight);
    this.shipWidth = this.randInt(this.settings.minWidth, this.settings.maxWidth);
    this.shipLength = this.randInt(this.settings.minLength, this.settings.maxLength);

    if (!this.settings.tailCut) {
        topLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        bottomLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        rightLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        leftLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        pointIndex += 1;
    }

    if (!this.settings.noseCut) {
        maxPoints -= 1;
    }

    for (var i = pointIndex; i < maxPoints; i++) {
        var bodyPointTop = this.randInt(1, this.shipHeight/2),
            bodyPointBottom = -this.randInt(1, this.shipHeight/2),
            bodyPointRight = this.randInt(1, this.shipWidth/2),
            bodyPointLeft = this.settings.symmetrical ? bodyPointRight * -1 : -this.randInt(1, this.shipWidth/2),
            bodyPointLength = (this.shipLength / (bodyBreakPointsNumber + 1) * i) - (this.shipLength / 2),
            bodyPointHeightCenter = bodyPointTop + bodyPointBottom / 2;

        topLine.push({x:0, y:bodyPointTop, z:bodyPointLength});
        bottomLine.push({x:0, y:bodyPointBottom, z:bodyPointLength});
        rightLine.push({x:bodyPointRight, y:bodyPointHeightCenter, z:bodyPointLength});
        leftLine.push({x:bodyPointLeft, y:bodyPointHeightCenter, z:bodyPointLength});
    };

    if (!this.settings.noseCut) {
        topLine.push({x:0, y:0, z:(this.shipLength / 2)});
        bottomLine.push({x:0, y:0, z:(this.shipLength / 2)});
        rightLine.push({x:0, y:0, z:(this.shipLength / 2)});
        leftLine.push({x:0, y:0, z:(this.shipLength / 2)});
    }

    topLine = this[this.settings.bodyType](topLine);
    bottomLine = this[this.settings.bodyType](bottomLine);
    rightLine = this[this.settings.bodyType](rightLine);
    leftLine = this[this.settings.bodyType](leftLine);

    //Meshing
    this.wingsNumber = this.randInt(this.settings.minWingsNumber, this.settings.maxWingsNumber);

    switch(this.settings.bodyType){
        case 'fluidStyle':
            for (var i = 0, wLen = this.wingsNumber * 2; i <= wLen; i++) {
                var

            };
        break;
        case 'linearStyle':

        break;
    }

    for (var i = 1, pLen = topLine.length; i < pLen; i++) {
        this.geometry.vertices.push(topLine[i-1]);
        this.geometry.vertices.push(topLine[i]);
    };

    for (var i = 1, pLen = bottomLine.length; i < pLen; i++) {
        this.geometry.vertices.push(bottomLine[i-1]);
        this.geometry.vertices.push(bottomLine[i]);
    };

    for (var i = 1, pLen = rightLine.length; i < pLen; i++) {
        this.geometry.vertices.push(rightLine[i-1]);
        this.geometry.vertices.push(rightLine[i]);
    };

    for (var i = 1, pLen = leftLine.length; i < pLen; i++) {
        this.geometry.vertices.push(leftLine[i-1]);
        this.geometry.vertices.push(leftLine[i]);
    };

}

ShipGenerator.prototype.fluidStyle = function(points) {
    var result = [],
        segments = points.length * 1.5;

    for (var i = 0; i <= segments; i++) {
        result.push(this.bezier(points, i/segments));
    };

	return result;
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
		points[i].x += v.x;
		points[i].y += v.y;
		points[i].z += v.z;
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

