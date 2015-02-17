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
		bodyType: 'linearStyle', // fluidStyle|linearStyle
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
                //[45],  ugly       //         |    /                     \
                [90],               //                  -             -
                [135],              //                      \  |  /
                //[180], ugly
                [225],              //        Two wings
                //[270], ugly       //         1   2   3   4
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
        wingShape: 6, // convex 1 - 6 concave
        minWingLength: 5,
        maxWingLength: 10,
        traverseSegments: 2,
        squareHullFactor: 0.5,
        minEnginesNumber: 1,
        maxEnginesNumber: 6
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
            sFactor = pLen - 1,
            lastIndex = pLen - 1;

        for (var i = 0; i < pLen; i++) {
            var tiltStrength = i / sFactor;

            topLine[i].z = topLine[i].z + (tilt * tiltStrength);
            bottomLine[i].z = bottomLine[i].z - (tilt * tiltStrength);
        }

        var avgX = (topLine[lastIndex].x + bottomLine[lastIndex].x + rightLine[lastIndex].x + leftLine[lastIndex].x) / 4;
        var avgY = (topLine[lastIndex].y + bottomLine[lastIndex].y + rightLine[lastIndex].y + leftLine[lastIndex].y) / 4;
        var avgZ = (topLine[lastIndex].z + bottomLine[lastIndex].z + rightLine[lastIndex].z + leftLine[lastIndex].z) / 4;

        topLine.push({x:avgX, y:avgY, z:avgZ});
        bottomLine.push({x:avgX, y:avgY, z:avgZ});
        rightLine.push({x:avgX, y:avgY, z:avgZ});
        leftLine.push({x:avgX, y:avgY, z:avgZ});
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

    //Generate engine
    if (!this.settings.tailCut) { //Many hull engines or none
        //TODO: implement hull engines

    } else { //Many or one tail engine
        var engineAvgX = 0,
            engineAvgY = 0,
            engineAvgZ = 0,
            engineMaxZ = 0,
            engineRadius = 999999999,
            engineRatio = 0.7,
            mufflerRatio = 0.9,
            engineTemplate = [
                bottomLine[0],
                leftLine[0],
                topLine[0],
                rightLine[0]
            ];

        this.enginesNumber = this.randInt(this.settings.minEnginesNumber, this.settings.maxEnginesNumber);

        for (var i = 0, pLen = engineTemplate.length; i < pLen; i++) {
            engineAvgX += engineTemplate[i].x;
            engineAvgY += engineTemplate[i].y;
            engineAvgZ += engineTemplate[i].z;
            if (Math.abs(engineMaxZ) < Math.abs(engineTemplate[i].z)) {
                engineMaxZ = engineTemplate[i].z;
            }
            var tmpRadius = Math.abs(engineTemplate[i].x);
            if (engineRadius > tmpRadius) {
                engineRadius = tmpRadius;
            }
            tmpRadius = Math.abs(engineTemplate[i].y);
            if (engineRadius > tmpRadius) {
                engineRadius = tmpRadius;
            }
        };

        engineAvgZ = engineAvgZ / engineTemplate.length;

        for (var i = 0, pLen = engineTemplate.length; i < pLen; i++) {
            engineTemplate[i].x = engineTemplate[i].x * engineRatio;
            engineTemplate[i].y = engineTemplate[i].y * engineRatio;
            engineTemplate[i].z = ((engineTemplate[i].z - engineAvgZ) * engineRatio) + engineAvgZ;
        };

        //TODO: Here is only one engine for now. Make more engines
        bottomLine.splice(0, 0, []);
        bottomLine.splice(0, 0, []);
        leftLine.splice(0, 0, []);
        leftLine.splice(0, 0, []);
        topLine.splice(0, 0, []);
        topLine.splice(0, 0, []);
        rightLine.splice(0, 0, []);
        rightLine.splice(0, 0, []);

        for (var i = 0; i < engineTemplate.length; i++) {

            var currentArray = bottomLine;

            switch(i) {
                case 0:
                    currentArray = bottomLine;
                    break;
                case 1:
                    currentArray = leftLine;
                    break;
                case 2:
                    currentArray = topLine;
                    break;
                case 3:
                    currentArray = rightLine;
                    break;
            }

            currentArray[1] = {
                x: engineTemplate[i].x,
                y: engineTemplate[i].y,
                z: engineTemplate[i].z
            }
            currentArray[0] = {
                x: engineTemplate[i].x * mufflerRatio,
                y: engineTemplate[i].y * mufflerRatio,
                z: engineMaxZ
            }
        };
    }

    //Hull generation
    topLine = this[this.settings.bodyType](topLine);
    bottomLine = this[this.settings.bodyType](bottomLine);
    rightLine = this[this.settings.bodyType](rightLine);
    leftLine = this[this.settings.bodyType](leftLine);

    var traverseLines = [],
        engineTemplate = [];

    for (var i = 0, sLen = topLine.length; i < sLen; i++) {
        traverseLines[i] = this.finiteDifferenceSpline([
            bottomLine[i],
            leftLine[i],
            topLine[i],
            rightLine[i],
            bottomLine[i]
        ], this.settings.traverseSegments);

        if (i === 0) {
            engineTemplate = this.finiteDifferenceSpline([
                bottomLine[i],
                leftLine[i],
                topLine[i],
                rightLine[i],
                bottomLine[i]
            ], this.settings.traverseSegments);

            engineTemplate[engineTemplate.length - 1] = engineTemplate[0]; //connecting start with end
        }

        traverseLines[i][traverseLines[i].length - 1] = traverseLines[i][0]; //connecting start with end
    };


    //Wings
    this.wingsNumber = this.randInt(this.settings.minWingsNumber, this.settings.maxWingsNumber);

    if((!this.settings.symmetrical && this.wingsNumber > 0) || (this.settings.symmetrical && this.wingsNumber > 1)) {
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
                var currentDistance = 0,
                    maxDistance = 0,
                    traverseLine = {},
                    centerPoint = {x:0, y:0, z:0},
                    hullPoint = {x:0, y:0, z:0};

                this.wingsPlace = 0;

                for (var i = 0, tLen = traverseLines.length; i < tLen; i++) {
                    traverseLine = traverseLines[i];
                    for (var j = 0, lLen = traverseLine.length; j < lLen; j++) {
                        hullPoint.x = traverseLine[j].x;
                        hullPoint.y = traverseLine[j].y;
                        currentDistance = this.distance(centerPoint, hullPoint);
                        if(maxDistance < currentDistance){
                            maxDistance = currentDistance;
                            this.wingsPlace = i;
                        }
                    };
                };
            break;
            case 'random':
                this.wingsPlace = this.randInt(0, (topLine.length - 1));
            break;
        }

        var convexFactor = this.settings.wingShape;

        for (var i = 0, tLen = this.wingsType.length; i < tLen; i++) {

            for (var j = 0, lLen = traverseLines.length; j < lLen; j++) {
                var wingFactor = Math.pow((lLen - 1 - Math.abs(j - this.wingsPlace)) / (lLen - 1), convexFactor),
                    wingPointIndex = this.degreeToTraverseIndex(this.wingsType[i]),
                    wingPoint = traverseLines[j][wingPointIndex],
                    distance = this.distance({x:0, y:0, z:0}, {x:wingPoint.x, y:wingPoint.y, z:0});

                if (distance !== 0) {
                    wingPoint.x = wingPoint.x + (wingPoint.x / distance * this.wingsLength * wingFactor);
                    wingPoint.y = wingPoint.y + (wingPoint.y / distance * this.wingsLength * wingFactor);
                }

                console.log([wingPoint.x, wingPoint.y]);
            };
        };

        console.log(['wings: ', this.wingsNumber, this.wingsType, this.wingsPlace, this.wingsLength]);
    } else {
        console.log(['no wings']);
    }

/*
    //Generate engine
    var engineAvgZ = 0
        engineMaxZ = 0,
        engineRatio = 0.7,
        mufflerRatio = 0.9;

    this.enginesNumber = this.randInt(this.settings.minEnginesNumber, this.settings.maxEnginesNumber);

    for (var i = 0, pLen = engineTemplate.length; i < pLen; i++) {
        engineAvgZ += engineTemplate[i].z;
        if (Math.abs(engineMaxZ) < Math.abs(engineTemplate[i].z)) {
            engineMaxZ = engineTemplate[i].z;
        }
    };

    engineAvgZ = engineAvgZ / engineTemplate.length;

    for (var i = 0, pLen = engineTemplate.length; i < pLen; i++) {
        engineTemplate[i].x = engineTemplate[i].x * engineRatio;
        engineTemplate[i].y = engineTemplate[i].y * engineRatio;
        engineTemplate[i].z = ((engineTemplate[i].z - engineAvgZ) * engineRatio) + engineAvgZ;
    };

    //TODO: Here is only one engine for now. Make more engines
    traverseLines.splice(0, 0, []);
    traverseLines.splice(0, 0, []);

    for (var i = 0; i < engineTemplate.length; i++) {
        traverseLines[1][i] = {
            x: engineTemplate[i].x,
            y: engineTemplate[i].y,
            z: engineTemplate[i].z
        }
        traverseLines[0][i] = {
            x: engineTemplate[i].x * mufflerRatio,
            y: engineTemplate[i].y * mufflerRatio,
            z: engineMaxZ
        }
    };
*/

    //Meshing
    /*
    for (var i = 0, tLen = traverseLines.length; i < tLen; i++) {
        var traverseLine = traverseLines[i];

        for (var j = 1, pLen = traverseLine.length; j < pLen; j++) {
            this.geometry.vertices.push(traverseLine[j-1]);
            this.geometry.vertices.push(traverseLine[j]);
        };

        if (i > 0) {
            for (var j = 0, pLen = traverseLine.length; j < pLen; j++) {
                this.geometry.vertices.push(traverseLines[i-1][j]);
                this.geometry.vertices.push(traverseLine[j]);
            };
        }
    };*/

    var vertices = 0,
        lines = 0,
        triangles = 0,
        planes = 0;

    for (var i = 1, tLen = traverseLines.length; i < tLen; i++) {

        var traverseLine = traverseLines[i];

        for (var j = 1, pLen = traverseLine.length; j < pLen; j++) {
            var p1 = traverseLines[i-1][j-1],
                p2 = traverseLines[i][j-1],
                p3 = traverseLines[i][j],
                p4 = traverseLines[i-1][j];

            if(j > pLen / 2) {
                this.geometry.vertices.push(p1);
                this.geometry.vertices.push(p2);
                this.geometry.vertices.push(p2);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p1);
                this.geometry.vertices.push(p1);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p1);
            } else {
                this.geometry.vertices.push(p2);
                this.geometry.vertices.push(p1);
                this.geometry.vertices.push(p1);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p2);
                this.geometry.vertices.push(p2);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p3);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p4);
                this.geometry.vertices.push(p2);
            }
        };
    };

/*
    for (var j = 1, pLen = engineTemplate.length; j < pLen; j++) {
        this.geometry.vertices.push(engineTemplate[j-1]);
        this.geometry.vertices.push(engineTemplate[j]);
    };*/
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
        sf = this.settings.squareHullFactor,
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
            m0.x = sf * (points[j + 1].x - points[j - 1].x);
            m0.y = sf * (points[j + 1].y - points[j - 1].y);
            m0.z = sf * (points[j + 1].z - points[j - 1].z);
        } else {
            m0.x = points[j + 1].x - points[j].x;
            m0.y = points[j + 1].y - points[j].y;
            m0.z = points[j + 1].z - points[j].z;
        }
        if (j < pLen - 2) {
            m1.x = sf * (points[j + 2].x - points[j].x);
            m1.y = sf * (points[j + 2].y - points[j].y);
            m1.z = sf * (points[j + 2].z - points[j].z);
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

        for (var i = j === 0 ? 0 : 1; i < numberOfPoints; i++) {
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

    return Math.floor(((this.settings.traverseSegments * 4) + 1) * (degree / 360));

};
