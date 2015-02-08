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
        tailCut: true,
        minCutNoseTilt: -5,
        maxCutNoseTilt: 5,
        minCutTailTilt: -5,
        maxCutTailTilt: 5,
        wingTypes: [
            [],
            [                       //        One wing
                [0],                //         1   2   3   4   5   6   7   8
                [45],               //         |    /                     \
                [90],               //                  -             -
                [135],              //                      \  |  /
                [180],
                [225],              //        Two wings
                [270],              //         1   2   3   4
                [315]               //         |          \ /
            ],                      //            - -
            [                       //         |      / \
                [0, 180],
                [90, 270],          //        Three wings
                [135, 225],         //         1   2
                [45, 315]           //         |  \ /
            ],                      //
            [                       //        / \  |
                [0, 135, 225],
                [45, 180, 315],     //        Four wings
            ],                      //         1   2
            [                       //         |  \ /
                [0, 90, 180, 270],  //        - -
                [45, 135, 225, 315] //         |  / \
            ]
        ],
        wingPlacing: 'shape', //'front'|'middle'|'back'|'any'|shape
        wingShape: 'linear', //'linear'|'concave'|'convex'|'random'
        minWingLength: 2,
        maxWingLength: 7
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
        startIndex = 0,
        maxPoints = bodyBreakPointsNumber + 2;

    this.shipHeight = this.randInt(this.settings.minHeight, this.settings.maxHeight);
    this.shipWidth = this.randInt(this.settings.minWidth, this.settings.maxWidth);
    this.shipLength = this.randInt(this.settings.minLength, this.settings.maxLength);

    //Preprocess nose and tail
    if (!this.settings.noseCut) {
        maxPoints -= 1;
    }

    if (!this.settings.tailCut) {
        topLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        bottomLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        rightLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        leftLine.push({x:0, y:0, z:-(this.shipLength / 2)});
        startIndex += 1;
    }

    //Proces body frame
    for (var i = startIndex; i < maxPoints; i++) {
        var bodyPointTop = this.randInt(1, this.shipHeight/2),
            bodyPointBottom = -this.randInt(1, this.shipHeight/2),
            bodyPointRight = this.randInt(1, this.shipWidth/2),
            bodyPointLeft = this.settings.symmetrical ? bodyPointRight * -1 : -this.randInt(1, this.shipWidth/2),
            bodyPointLength = (this.shipLength / (bodyBreakPointsNumber + 1) * i) - (this.shipLength / 2),
            bodyPointHeightCenter = (bodyPointTop + bodyPointBottom) / 2;

        topLine.push({x:0, y:bodyPointTop, z:bodyPointLength});
        bottomLine.push({x:0, y:bodyPointBottom, z:bodyPointLength});
        rightLine.push({x:bodyPointRight, y:bodyPointHeightCenter, z:bodyPointLength});
        leftLine.push({x:bodyPointLeft, y:bodyPointHeightCenter, z:bodyPointLength});
    };

    //Postprocess nose and tail
    if (!this.settings.noseCut) {
        topLine.push({x:0, y:0, z:(this.shipLength / 2)});
        bottomLine.push({x:0, y:0, z:(this.shipLength / 2)});
        rightLine.push({x:0, y:0, z:(this.shipLength / 2)});
        leftLine.push({x:0, y:0, z:(this.shipLength / 2)});
    } else {
        var tilt = this.randInt(this.settings.minCutTailTilt, this.settings.maxCutTailTilt),
            pLen = topLine.length,
            sFactor = pLen - 1;

        for (var i = 0; i < pLen; i++) {
            var tiltStrength = i / sFactor;

            topLine[i].z = topLine[i].z + (tilt * tiltStrength);
            bottomLine[i].z = bottomLine[i].z - (tilt * tiltStrength);
        }
    }

    if (this.settings.tailCut) {
        var tilt = this.randInt(this.settings.minCutTailTilt, this.settings.maxCutTailTilt),
            pLen = topLine.length,
            sFactor = pLen - 1;

        for (var i = 0; i < pLen; i++) {
            var tiltStrength = (sFactor - i) / sFactor;

            topLine[i].z = topLine[i].z + (tilt * tiltStrength);
            bottomLine[i].z = bottomLine[i].z - (tilt * tiltStrength);
        }
    }

    //Wings

    var traverseLines = [];

    for (var i = 0, sLen = topLine.length; i < sLen; i++) {
        traverseLines[i] = this.finiteDifferenceSpline([
            bottomLine[i],
            leftLine[i],
            topLine[i],
            rightLine[i],
            bottomLine[i]
        ], 2);
    };

    this.wingsNumber = this.randInt(this.settings.minWingsNumber, this.settings.maxWingsNumber);

    if(this.wingsNumber > 0) {
        this.wingsType = this.settings.wingTypes[this.wingsNumber][this.randInt(0, this.settings.wingTypes[this.wingsNumber].length - 1)];
        this.wingsPlace = 0; //back is default
        this.wingsLength = this.randInt(this.settings.minWingLength, this.settings.maxWingLength);

        //Calculating shape of wings
        switch(this.settings.wingPlacing) {
            case 'front':
                this.wingsPlace = topLine.length - 1;
            break;
            case 'middle':
                this.wingsPlace = Math.round((topLine.length - 1) / 2);
            break;
            case 'back':
                this.wingsPlace = 0;
            break;
            case 'shape':

                var distance = 

                this.wingsPlace = 0;
            break;
            case 'random':
                this.wingsPlace = this.randInt(0, (topLine.length - 1));
            break;
        }

        console.log(['wings: ', this.wingsNumber, this.wingsType, this.wingsPlace, this.wingsLength]);
    } else {
        console.log(['no wings']);
    }

    //Meshing
    topLine = this[this.settings.bodyType](topLine);
    bottomLine = this[this.settings.bodyType](bottomLine);
    rightLine = this[this.settings.bodyType](rightLine);
    leftLine = this[this.settings.bodyType](leftLine);


    for (var i = 0, sLen = topLine.length; i < sLen; i++) {

        var traverseLine = this.finiteDifferenceSpline([
                topLine[i],
                rightLine[i],
                bottomLine[i],
                leftLine[i],
                topLine[i]
            ], 2);

        console.log(traverseLine);

        for (var j = 1, pLen = traverseLine.length; j < pLen; j++) {
            this.geometry.vertices.push(traverseLine[j-1]);
            this.geometry.vertices.push(traverseLine[j]);
        };
    };

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
        segments = Math.round(points.length * 1.5);

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
    var vmin = Math.min(min, max),
        vmax = Math.max(min, max);

	return vmin + Math.floor(Math.random() * ((vmax - vmin) + 1));
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

ShipGenerator.prototype.finiteDifferenceSpline = function(points, segments) {

    // loop over segments of spline
    var p0 = { x: 0, y: 0, z: 0},
        p1 = { x: 0, y: 0, z: 0},
        m0 = { x: 0, y: 0, z: 0},
        m1 = { x: 0, y: 0, z: 0},
        pLen = points.length,
        results = [];

    if (typeof segments === 'undefined') {
        var segments = 2;
    }

    var numberOfPoints = segments + 1;

    for (var j = 0; j < pLen - 1; j++) {
        // check control points
        if (typeof points[j] === 'undefined' || typeof points[j + 1] === 'undefined' || (j > 0 && typeof points[j - 1] === 'undefined') || (j < pLen - 2 && typeof points[j + 2] === 'undefined')) {
            return;
        }

        // determine control points of segment
        p0 = points[j];
        p1 = points[j + 1];
        if (j > 0) {
            m0.x = 0.5 * (points[j + 1].x - points[j - 1].x);
            m0.y = 0.5 * (points[j + 1].y - points[j - 1].y);
            m0.z = 0.5 * (points[j + 1].z - points[j - 1].z);
        } else {
            m0.x = points[j + 1].x - points[j].x;
            m0.y = points[j + 1].y - points[j].y;
            m0.z = points[j + 1].z - points[j].z;
        }
        if (j < pLen - 2) {
            m1.x = 0.5 * (points[j + 2].x - points[j].x);
            m1.y = 0.5 * (points[j + 2].y - points[j].y);
            m1.z = 0.5 * (points[j + 2].z - points[j].z);
        } else {
            m1.x = points[j + 1].x - points[j].x;
            m1.y = points[j + 1].y - points[j].y;
            m1.z = points[j + 1].z - points[j].z;
        }

        // set points of Hermite curve
        var t = 0,
            t3 = 0,
            t2 = 0,
            wp0 = 0,
            wm0 = 0,
            wp1 = 0,
            wm1 = 0;
        
        for (var i = 0; i < numberOfPoints; i++) {
            t = i / (numberOfPoints - 1);
            t3 = t*t*t;
            t2 = t*t;
            wp0 = ((2 * t3) - (3 * t2) + 1);
            wm0 = (t3 - (2 * t2) + t);
            wp1 = ((-2 * t3) + (3 * t2));
            wm1 = (t3 - t2);

            results.push({
                x: (wp0 * p0.x) + (wm0 * m0.x) + (wp1 * p1.x) + (wm1 * m1.x),
                y: (wp0 * p0.y) + (wm0 * m0.y) + (wp1 * p1.y) + (wm1 * m1.y),
                z: (wp0 * p0.z) + (wm0 * m0.z) + (wp1 * p1.z) + (wm1 * m1.z)
            });
        }
    }

    return results;
};

ShipGenerator.prototype.linear = function(points) {
	return points;
};

ShipGenerator.prototype.degreeToTraverseIndex = function(degree) {
    switch(degree) {
        case 0:
            return 4;
        break;
        case 45:
            return 5;
        break;
        case 90:
            return 6;
        break;
        case 135:
            return 7;
        break;
        case 180:
            return 0;
        break;
        case 225:
            return 1;
        break;
        case 270:
            return 2;
        break;
        case 315:
            return 3;
        break;
    }
};