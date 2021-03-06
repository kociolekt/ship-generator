Object.prototype.extend = function(obj) {
    for(var i in obj)
        this[i] = obj[i];
    return this;
};

Array.prototype.clone = function() {
	return this.slice(0);
};

function ShipGenerator(config) {

    var _this = this;

	this.defaultOptions = {
        random: Math.random(),
		className: 'Private Vessel',
		minLength: 10,
		maxLength: 24,
		minWidth: 5,
		maxWidth: 15,
		minHeight: 5,
		maxHeight: 15,
		minBodyBreakPoints: 1,
		maxBodyBreakPoints: 4,
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
        wingShape: 'random', // convex 1 - 10 concave || frontSkew, straight, backSkew, random
        wingInflection: 0.7, //0 - no inflection, 0.9 blade like wings
        minWingLength: 5,
        maxWingLength: 10,
        traverseSegments: 2,
        squareHullFactor: 0.5,
        minEnginesNumber: 1,
        maxEnginesNumber: 6,
        hullMaterials: [
            {
                name: 'Eridium',
                description: 'Amethyst coloured Eridium is appropriately named after the ancient precursor race that utilized it, the Eridians.',
                color: 0x8456CC,
                texture: 'marble'
            },
            {
                name: 'Iridium',
                description: 'A very hard, brittle, silvery-white transition metal of the platinum family.',
                color: 0xe8e8e8,
                texture: 'metal-plate'
            },
            {
                name: 'Vibranium',
                description: 'Tiara coloured metal. It is most commonly known as one of the materials used to construct Captain America\'s shield.',
                color: 0xc2ccce,
                texture: 'metal-plate'
            },
            {
                name: 'Naquadah',
                description: 'Tundora coloured metal. Both the Ancients (who built the network of Stargates) and the Goa\'uld (who exploit the network) used naquadah in the creation of their advanced technology.',
                color: 0x494949,
                texture: 'metal-plate'
            },
            {
                name: 'Scrith',
                description: 'Scrith is milky-gray translucent in color, and is a nearly frictionless material.',
                color: 0xd8dace,
                texture: 'solid'
            },
            {
                name: 'Adamantium',
                description: 'Adamantium is a group of man-made silver steel metal alloys of varying durability, but all are nearly indestructible.',
                color: 0xf0f0f0,
                texture: 'metal-plate'
            },
            {
                name: 'Dalekanium',
                description: 'Dalekanium was first used by Davros to create the Dalek casing, chosen as it was immune to bullets and most laser weapons.',
                color: 0xA57530,
                texture: 'metal-plate'
            },
            {
                name: 'Durasteel',
                description: 'Durasteel was an incredibly strong and versatile metal alloy, created from carvanium, lommite, carbon, meleenium, neutronium, and zersium. It was capable of withstanding blistering heat, frigid cold, and monumental physical stress, even when very thin.',
                color: 0x8b8a89,
                texture: 'metal-plate'
            },
            {
                name: 'Beskar',
                description: 'Beskar is a uniquely resistant iron that develops a wide range of properties—and colors—in the hands of skilled metalsmiths.',
                color: 0x7c9a7c,
                texture: 'metal-plate'
            },
            {
                name: 'Phrik',
                description: 'Rare metallic compound. Extremely light and durable.',
                color: 0x43484b,
                texture: 'metal-plate'
            },
            {
                name: 'Byeshk',
                description: 'It is a rare metal with a purple sheen.',
                color: 0x9c7f9c,
                texture: 'metal-plate'
            },
            {
                name: 'Obdurium',
                description: 'Incredibly rare and hard black metal.',
                color: 0x101010,
                texture: 'metal-plate'
            }
        ]
	};

	this.settings = this.defaultOptions.extend(config);

    this.geometry = {
        vertices: [],
        faces: [],
        normals: [],
        faceVertexUvs: []
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
        maxPoints = bodyBreakPointsNumber + 2,
        shipNoseZ = 0,
        shipTailZ = 0;

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
        shipNoseZ = (this.shipLength / 2);
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

        shipNoseZ = Math.max(topLine[lastIndex].z, bottomLine[lastIndex].z);

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

    shipTailZ = Math.min(topLine[0].z, bottomLine[0].z);

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

        engineAvgX = engineAvgX / engineTemplate.length;
        engineAvgY = engineAvgY / engineTemplate.length;
        engineAvgZ = engineAvgZ / engineTemplate.length;

        for (var i = 0, pLen = engineTemplate.length; i < pLen; i++) {
            engineTemplate[i].x = engineTemplate[i].x * engineRatio;
            engineTemplate[i].y = engineTemplate[i].y * engineRatio;
            engineTemplate[i].z = ((engineTemplate[i].z - engineAvgZ) * engineRatio) + engineAvgZ;
        };

        //TODO: Here is only one engine for now. Make more engines
        bottomLine.splice(0, 0, []);
        bottomLine.splice(0, 0, []);
        bottomLine.splice(0, 0, []);
        leftLine.splice(0, 0, []);
        leftLine.splice(0, 0, []);
        leftLine.splice(0, 0, []);
        topLine.splice(0, 0, []);
        topLine.splice(0, 0, []);
        topLine.splice(0, 0, []);
        rightLine.splice(0, 0, []);
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

            currentArray[2] = {
                x: engineTemplate[i].x * engineRatio,
                y: engineTemplate[i].y * engineRatio,
                z: ((engineTemplate[i].z - engineAvgZ) * engineRatio) + engineAvgZ
            }
            currentArray[1] = {
                x: engineTemplate[i].x * engineRatio * mufflerRatio,
                y: engineTemplate[i].y * engineRatio * mufflerRatio,
                z: engineMaxZ * 0.95
            }
            currentArray[0] = {
                x: engineTemplate[i].x * engineRatio,
                y: engineTemplate[i].y * engineRatio,
                z: ((engineTemplate[i].z - engineAvgZ) * engineRatio) + engineAvgZ
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

        if (typeof this.settings.wingShape === 'number') {
            var convexFactor = this.settings.wingShape,
                offset = 0;

            for (var i = 0, tLen = this.wingsType.length; i < tLen; i++) {

                var baseTraverseLineLenght = traverseLines[0].length,
                    wingPointIndex = this.degreeToTraverseIndex(this.wingsType[i]) + offset,
                    wingPointLeftIndex = wingPointIndex === 0 ? (baseTraverseLineLenght - 2) : (wingPointIndex - 1),
                    wingPointRightIndex = (baseTraverseLineLenght + (wingPointIndex + 1)) % baseTraverseLineLenght;

                for (var j = 0, lLen = traverseLines.length; j < lLen; j++) {

                    var wingFactor = Math.pow((lLen - 1 - Math.abs(j - this.wingsPlace)) / (lLen - 1), convexFactor),
                        wingPoint = traverseLines[j][wingPointIndex],
                        wingPointLeft = traverseLines[j][wingPointLeftIndex],
                        wingPointRight = traverseLines[j][wingPointRightIndex],
                        distance = this.distance({x:0, y:0, z:0}, {x:wingPoint.x, y:wingPoint.y, z:0}),
                        newWingPointLeft = {
                            x: this.lerp(wingPointLeft.x, wingPoint.x, this.settings.wingInflection),
                            y: this.lerp(wingPointLeft.y, wingPoint.y, this.settings.wingInflection),
                            z: this.lerp(wingPointLeft.z, wingPoint.z, this.settings.wingInflection)
                        },
                        newWingPointRight = {
                            x: this.lerp(wingPointRight.x, wingPoint.x, this.settings.wingInflection),
                            y: this.lerp(wingPointRight.y, wingPoint.y, this.settings.wingInflection),
                            z: this.lerp(wingPointRight.z, wingPoint.z, this.settings.wingInflection)
                        };

                        console.log(wingPointIndex,wingPointLeftIndex ,wingPointRightIndex);

                    if (wingPointIndex === 0) {
                        traverseLines[j][baseTraverseLineLenght - 1] = wingPoint;
                    }

                    traverseLines[j].splice(wingPointRightIndex, 0, newWingPointRight);
                    traverseLines[j].splice(wingPointIndex === 0 ? traverseLines[j].length - 1 : wingPointIndex, 0, newWingPointLeft);

                    if (distance !== 0) {
                        wingPoint.x = wingPoint.x + (wingPoint.x / distance * this.wingsLength * wingFactor);
                        wingPoint.y = wingPoint.y + (wingPoint.y / distance * this.wingsLength * wingFactor);
                    }
                };

                offset += wingPointIndex === 0 ? 1 : 2;
            };
        } else if (typeof this.settings.wingShape === 'string') {

            var wingShape = this.settings.wingShape;

            if (wingShape === 'random') {
                wingShape = (['frontSkew', 'straight', 'backSkew'])[this.randInt(0, 2)];
            }

            var wingsPlaces = [this.wingsPlace],
                wingsSkew = 0;

            wingsPlaces.push((this.wingsPlace >= traverseLines.length / 2) ? this.wingsPlace - 1 : this.wingsPlace + 1);

            switch(wingShape) { //frontSkew, straight, backSkew, random
                case 'frontSkew':
                        wingsSkew = shipNoseZ * ((wingsPlaces[0] + wingsPlaces[1]) / 2) / (traverseLines.length - 1);
                    break;
                case 'backSkew':
                        wingsSkew = shipTailZ * (1 - ((wingsPlaces[0] + wingsPlaces[1]) / 2) / (traverseLines.length - 1));
                    break;
            }

            var offset = 0;

            for (var i = 0, tLen = this.wingsType.length; i < tLen; i++) {

                var baseTraverseLineLenght = traverseLines[0].length,
                    wingPointIndex = this.degreeToTraverseIndex(this.wingsType[i]) + offset,
                    wingPointLeftIndex = wingPointIndex === 0 ? (baseTraverseLineLenght - 2) : (wingPointIndex - 1),
                    wingPointRightIndex = (baseTraverseLineLenght + (wingPointIndex + 1)) % baseTraverseLineLenght;

                for (var j = 0, lLen = traverseLines.length; j < lLen; j++) {

                    var isWing = wingsPlaces.indexOf(j) !== -1,
                        wingPoint = traverseLines[j][wingPointIndex],
                        wingPointLeft = traverseLines[j][wingPointLeftIndex],
                        wingPointRight = traverseLines[j][wingPointRightIndex],
                        distance = this.distance({x:0, y:0, z:0}, {x:wingPoint.x, y:wingPoint.y, z:0}),
                        newWingPointLeft = {
                            x: this.lerp(wingPointLeft.x, wingPoint.x, this.settings.wingInflection),
                            y: this.lerp(wingPointLeft.y, wingPoint.y, this.settings.wingInflection),
                            z: this.lerp(wingPointLeft.z, wingPoint.z, this.settings.wingInflection)
                        },
                        newWingPointRight = {
                            x: this.lerp(wingPointRight.x, wingPoint.x, this.settings.wingInflection),
                            y: this.lerp(wingPointRight.y, wingPoint.y, this.settings.wingInflection),
                            z: this.lerp(wingPointRight.z, wingPoint.z, this.settings.wingInflection)
                        };

                    if (wingPointIndex === 0) {
                        traverseLines[j][baseTraverseLineLenght - 1] = wingPoint;
                    }

                    traverseLines[j].splice(wingPointRightIndex, 0, newWingPointRight);
                    traverseLines[j].splice(wingPointIndex === 0 ? traverseLines[j].length - 1 : wingPointIndex, 0, newWingPointLeft);

                    if (isWing && distance !== 0) {
                        wingPoint.x = (Math.cos((this.wingsType[i] + 90) * (Math.PI/180)) * this.wingsLength);
                        wingPoint.y = (Math.cos((this.wingsType[i] + 180) * (Math.PI/180)) * this.wingsLength);
                        wingPoint.z = wingPoint.z + wingsSkew;
                    }
                };

                offset += wingPointIndex === 0 ? 1 : 2;
            };
        }
    } else {
        //console.log(['no wings']);
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

    this.shipHullMaterial = this.settings.hullMaterials[this.randInt(0, this.settings.hullMaterials.length - 1)];

    var vertices = 0,
        lines = 0,
        triangles = 0,
        planes = 0,
        tmpArr = [];

        /**

        0 0 0
        0 1 1
        0 2 2
        1 0

        */

    var bbox = {
        min: {
            x: 9999999999,
            y: 9999999999,
            z: 9999999999
        },
        max: {
            x: -9999999999,
            y: -9999999999,
            z: -9999999999
        }
    };

    for (var i = 0, tLen = traverseLines.length; i < tLen; i++) {
        for (var j = 0, pLen = traverseLines[i].length; j < pLen; j++) {

            var point = traverseLines[i][j];

            bbox.min.x = Math.min(bbox.min.x, point.x);
            bbox.min.y = Math.min(bbox.min.y, point.y);
            bbox.min.z = Math.min(bbox.min.z, point.z);

            bbox.max.x = Math.max(bbox.max.x, point.x);
            bbox.max.y = Math.max(bbox.max.y, point.y);
            bbox.max.z = Math.max(bbox.max.z, point.z);

            this.geometry.vertices.push(traverseLines[i][j]);

            if (i > 0 && j > 0) {
                var p1i = ((i - 1) * pLen) + j - 1,
                    p2i = ((i) * pLen) + j - 1,
                    p3i = ((i) * pLen) + j,
                    p4i = ((i - 1) * pLen) + j,
                    f1,
                    f2;

                if(j > pLen / 2) {
                    f1 = [p4i, p1i, p2i];
                    f2 = [p3i, p4i, p2i];
                } else {
                    f1 = [p1i, p2i, p3i];
                    f2 = [p1i, p3i, p4i];
                }

                this.geometry.faces.push(f1);
                this.geometry.faces.push(f2);
                this.geometry.normals.push(this.computeNormal(f1));
                this.geometry.normals.push(this.computeNormal(f2));
            }
        }
    }

    //generating uv's
/*
    var max     = bbox.max;
    var min     = bbox.min;

    var offset  = {x:0 - min.x, y:0 - min.y};
    var range   = {x:max.x - min.x, y:max.y - min.y};

    this.geometry.faceVertexUvs[0] = [];

    var faces = this.geometry.faces;

    for (i = 0, fLen = this.geometry.faces.length; i < fLen; i++) {

        var v1 = this.geometry.vertices[faces[i][0]];
        var v2 = this.geometry.vertices[faces[i][1]];
        var v3 = this.geometry.vertices[faces[i][2]];

        this.geometry.faceVertexUvs[0].push([
            {x:( v1.x + offset.x ) / range.x, y:( v1.y + offset.y ) / range.y },
            {x:( v2.x + offset.x ) / range.x, y:( v2.y + offset.y ) / range.y },
            {x:( v3.x + offset.x ) / range.x, y:( v3.y + offset.y ) / range.y }
        ]);
    }*/

    this.geometry.faceVertexUvs[0] = [];

    for (i = 0, fLen = this.geometry.faces.length; i < fLen; i++) {
        var face = this.geometry.faces[i],
            faceNormal = this.geometry.normals[i];

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(faceNormal[a]) > Math.abs(faceNormal[b]);
        });

        var v1 = this.geometry.vertices[face[0]];
        var v2 = this.geometry.vertices[face[1]];
        var v3 = this.geometry.vertices[face[2]];

        this.geometry.faceVertexUvs[0].push([
            {x:v1[components[0]], y:v1[components[1]] },
            {x:v2[components[0]], y:v2[components[1]] },
            {x:v3[components[0]], y:v3[components[1]] }
        ]);
    }
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

	return vmin + Math.floor(this.settings.random() * ((vmax - vmin) + 1));
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

ShipGenerator.prototype.lerp = function(a, b, t) {
    return (1-t)*a + t*b;
};


ShipGenerator.prototype.computeNormal = function(face){

    //console.log(face);

    //perform cross product of two lines on plane
    var a = this.geometry.vertices[face[0]],
        b = this.geometry.vertices[face[1]],
        c = this.geometry.vertices[face[2]],
        n = this.crossProduct({
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        },{
            x: b.x - c.x,
            y: b.y - c.y,
            z: b.z - c.z
        }),
        magnitude = this.distance({x:0,y:0,z:0},n);

    if(magnitude > 0) {
        n.x = n.x / magnitude;  //normalize
        n.y = n.y / magnitude;
        n.z = n.z / magnitude;
    }

    return n;
};

ShipGenerator.prototype.crossProduct = function(a, b) {
    return {
        x: a.y*b.z - a.z*b.y,
        y: a.z*b.x - a.x*b.z,
        z: a.x*b.y - a.y*b.x
    }
}
