/* globals THREE */

var timestamp = window.performance && window.performance.now ? function(){return window.performance.now();} : function(){return new Date().getTime();};

function SimulationObject(simulation) {
    this.simulation = simulation;
}

SimulationObject.prototype.update = function(dt) {};

function Simulation() {
    this.init();
}

Simulation.prototype.init = function() {
    this.initScene();
    this.initInput();
    this.initEvents();
    this.initObjects();
};

Simulation.prototype.initScene = function() {
    /* Creating scene */
    this.scene = new THREE.Scene();

    //Camera
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000000000000 );
    this.camera.position.set(23.21715753525241, 11.01955380195478, 13.709757118304086);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor( 0x000000, 0 );
    document.body.appendChild( this.renderer.domElement );

    //Camera Controlls Temporary
    this.controls = new THREE.OrbitControls( this.camera );
    this.controls.damping = 0.2;
    this.controls.noKeys = true;

    //Lights
    this.lights = [];
    this.lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
    this.lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
    this.lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

    this.lights[0].position.set( 0, 200, 0 );
    this.lights[1].position.set( 100, 200, 100 );
    this.lights[2].position.set( -100, -200, -100 );

    this.scene.add( this.lights[0] );
    this.scene.add( this.lights[1] );
    this.scene.add( this.lights[2] );

    //Add Grid
    var planeW = 10; // pixels
    var planeH = 10; // pixels
    var numW = 50; // how many wide (50*50 = 2500 pixels wide)
    var numH = 50; // how many tall (50*50 = 2500 pixels tall)
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH ),
        new THREE.MeshBasicMaterial( {
            transparent: true,
            opacity: 0.5,
            color: 0x101010,
            wireframe: true
        } )
    );
    plane.rotation.x = 90*(Math.PI/180);
    this.scene.add( plane );

    //Add Coord
    this.scene.add( new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), 20, 0xff0000 )); //x
    this.scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 20, 0x00ff00 )); //y
    this.scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 20, 0x0000ff )); //z
    this.scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 40, 0x101010 )); //ship direction


    //SKYBOX
    var imagePrefix = "./img/";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 5000000000000, 5000000000000, 5000000000000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++) {
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    }
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    this.scene.add( skyBox );
};

Simulation.prototype.initInput = function() {
    this.KEY = {
        BACKSPACE: 8,
        TAB:       9,
        RETURN:   13,
        SHIFT:    16,
        CTRL:     17,
        ALT:      18,
        ESC:      27,
        SPACE:    32,
        PAGEUP:   33,
        PAGEDOWN: 34,
        END:      35,
        HOME:     36,
        LEFT:     37,
        UP:       38,
        RIGHT:    39,
        DOWN:     40,
        INSERT:   45,
        DELETE:   46,
        ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
        A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
        TILDA:    192
    };

    this.INPUT = new Array(255);
    this.TOGGLED = new Array(255);

    for (var i = 0; i < 255; i += 1) {
        this.INPUT[i] = false;
    }
    for (var i = 0; i < 255; i += 1) {
        this.TOGGLED[i] = false;
    }
};

Simulation.prototype.initEvents = function() {
    this.onkeydown = function(event) { this.INPUT[event.keyCode] = true; this.TOGGLED[event.keyCode] = !this.TOGGLED[event.keyCode]; }
    this.onkeyup = function(event) { this.INPUT[event.keyCode] = false; }
    this.onWindowResize = function() {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    };

    window.addEventListener('keydown', this.onkeydown.bind(this),      false);
    window.addEventListener('keyup',   this.onkeyup.bind(this),        false);
    window.addEventListener('resize',  this.onWindowResize.bind(this), false);
};

Simulation.prototype.initObjects = function() {
    this.objects = new Array();
    this.postObjects = new Array();

    this.addObject = function(object) {
        this.objects.push(object);

        console.log(typeof object.postUpdate)

        if(typeof object.postUpdate === 'function') {
            this.postObjects.push(object);
        }

        if(typeof object.sceneObject !== 'undefined') {
            this.scene.add(object.sceneObject);
        }
    };
};

Simulation.prototype.createSimulationObject = function(objectExtension) {
    var object = new SimulationObject(this);

    for(var i in objectExtension) {
        object[i] = objectExtension[i];
    }

    this.addObject(object);

    return object;
};

Simulation.prototype.update = function(step) {
    for (var i = 0, oLen = this.objects.length; i < oLen; i++) {
        this.objects[i].update(step, this);
    };
    for (var i = 0, pLen = this.postObjects.length; i < oLen; i++) {
        this.postObjects[i].postUpdate(this);
    };
};

Simulation.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
};

Simulation.prototype.run = function() {
    var now,
        dt = 0,
        last = timestamp(),
        step = 1 / 60, //60fps
        update = this.update.bind(this),
        render = this.render.bind(this);

    function frame() {
        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);
        while(dt > step) {
            dt = dt - step;
            update(step);
        }
        render(dt);
        last = now;
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
};



function Ship() {
    /* Ship properties */
    this.mass = 1; //[kg]
    this.width = null; //filled after initialization
    this.height = null;
    this.length = null;
    this.maxThrustPower = 50;
    this.maxBreakPower = -20;
    this.maxSteeringPower = 20;
    this.shipDirection = new THREE.Vector3( 0, 0, 1 ); //Direction in which ship is pointing
    this.moveDirection = [0, 0, 0]; //Direction in which ship is moving
    this.rotationDirection = [0, 0, 0]; //Direction in which ship is moving

    /* Translation Physics helpers */
    this.acceleration = [0, 0, 0]; //[m/s^2]
    this.velocity = [0, 0, 0]; //[m/s]
    this.force = [0, 0, 0]; //[N]
    this.position = [0, 0, 0]; //[m]
    this.deltaDistance = [0, 0, 0]; //[m] The distance at time deltaTime;
    this.deltaTime = 0; //[s] last timeslice

    /* Rotation Physics helpers */
    this.rotationAcceleration = [0, 0, 0]; //[m/s^2]
    this.rotationVelocity = [0, 0, 0]; //[m/s]
    this.rotationForce = [0, 0, 0]; //[N]
    this.rotationTmp = new THREE.Quaternion(); //[m]
    this.rotationDeltaAngle = [0, 0, 0]; //[m] The distance at time deltaTime;

    /* Camera position helpers */
    this.nextCameraPosition = new THREE.Vector3( 0, 0, 0 );

    this.init();
}

Ship.prototype.init = function() {
    var config = {
        random: ((function(){ Utils.lfsr.setSeed(0); return Utils.lfsr.rand; })())
    };

    var generator = new ShipGenerator(config);

    this.width  = generator.shipWidth;
    this.height = generator.shipHeight;
    this.length = generator.shipLength;
    this.momentOfInertia = [
        ((this.mass / 2) * ((this.height * this.height) + (this.length * this.length))) / 12,
        ((this.mass / 2) * ((this.width * this.width) + (this.length * this.length))) / 12,
        ((this.mass / 2) * ((this.height * this.height) + (this.width * this.width))) / 12
    ];

    console.log(this.momentOfInertia);

    /* transform ship model to three.js model */
    var shipGeometry = new THREE.Geometry();
    for (var i = 0, vLen = generator.geometry.vertices.length; i < vLen; i++) {
        shipGeometry.vertices.push(generator.geometry.vertices[i]);
    };

    for (var i = 0, fLen = generator.geometry.faces.length; i < fLen; i++) {
        shipGeometry.faces.push( new THREE.Face3( generator.geometry.faces[i][0], generator.geometry.faces[i][1], generator.geometry.faces[i][2] ) );
    };

    shipGeometry.computeFaceNormals();
    shipGeometry.computeVertexNormals();

    this.sceneObject = THREE.SceneUtils.createMultiMaterialObject( shipGeometry, [
        new THREE.MeshLambertMaterial({
            color: generator.shipHullMaterial.color,
            shading: generator.settings.bodyType === 'fluidStyle' ? THREE.SmoothShading : THREE.FlatShading
        } )
    ]);

    this.sceneObject.rotation.order = 'YXZ';
};

Ship.prototype.update = function(dt, simulation) {
    this.deltaTime = dt;

    /* START Calculate new position *********************************************************************************************/
    var accelerationXTmp = this.acceleration[0],                                                                                //
        accelerationYTmp = this.acceleration[1],                                                                                //
        accelerationZTmp = this.acceleration[2];                                                                                //
                                                                                                                                //
    this.deltaDistance[0] = dt * (this.velocity[0] + dt * accelerationXTmp / 2);                                                //
    this.deltaDistance[1] = dt * (this.velocity[1] + dt * accelerationYTmp / 2);                                                //
    this.deltaDistance[2] = dt * (this.velocity[2] + dt * accelerationZTmp / 2);                                                //
                                                                                                                                //
    this.position[0] += this.deltaDistance[0];                                                                                  //
    this.position[1] += this.deltaDistance[1];                                                                                  //
    this.position[2] += this.deltaDistance[2];                                                                                  //
    /* END Calculate new position ***********************************************************************************************/

    /* START Calculate new rotation *********************************************************************************************/
    var rotationAccelerationXTmp = this.rotationAcceleration[0],                                                                //
        rotationAccelerationYTmp = this.rotationAcceleration[1],                                                                //
        rotationAccelerationZTmp = this.rotationAcceleration[2];                                                                //
                                                                                                                                //
    this.rotationDeltaAngle[0] = dt * (this.rotationVelocity[0] + dt * rotationAccelerationXTmp / 2);                           //
    this.rotationDeltaAngle[1] = dt * (this.rotationVelocity[1] + dt * rotationAccelerationYTmp / 2);                           //
    this.rotationDeltaAngle[2] = dt * (this.rotationVelocity[2] + dt * rotationAccelerationZTmp / 2);                           //
                                                                                                                                //
    this.rotationTmp.set( this.rotationDeltaAngle[0], this.rotationDeltaAngle[1], this.rotationDeltaAngle[2], 1 ).normalize();  //
    /* END Calculate new rotation ***********************************************************************************************/

    /* Update Ship Properties */
    this.updateShipProperties(dt);

    /* Update Camera */
    this.updateCamera();

    /* Applying current forces */
    this.resetForces();
    this.applySteeringForces(dt, simulation); //Apply steering forces
    this.applyThrustForces(dt, simulation); //Apply thrust forces
    this.applyWorldForces(dt, simulation); //Apply world forces

    /* START Calculate new acceleration and velocity from forces ****************************************************************/
    this.acceleration[0] = this.force[0] / this.mass;                                                                           //
    this.acceleration[1] = this.force[1] / this.mass;                                                                           //
    this.acceleration[2] = this.force[2] / this.mass;                                                                           //
                                                                                                                                //
    this.velocity[0] += dt * (accelerationXTmp + this.acceleration[0]) / 2;                                                     //
    this.velocity[1] += dt * (accelerationYTmp + this.acceleration[1]) / 2;                                                     //
    this.velocity[2] += dt * (accelerationZTmp + this.acceleration[2]) / 2;                                                     //
    /* END Calculate new acceleration and velocity from forces ******************************************************************/

    /* START Calculate new rotation acceleration and velocity from forces *******************************************************/
    this.rotationAcceleration[0] = this.rotationForce[0] / this.momentOfInertia[0];                                             //
    this.rotationAcceleration[1] = this.rotationForce[1] / this.momentOfInertia[1];                                             //
    this.rotationAcceleration[2] = this.rotationForce[2] / this.momentOfInertia[2];                                             //
                                                                                                                                //
    this.rotationVelocity[0] += dt * (rotationAccelerationXTmp + this.rotationAcceleration[0]) / 2;                             //
    this.rotationVelocity[1] += dt * (rotationAccelerationYTmp + this.rotationAcceleration[1]) / 2;                             //
    this.rotationVelocity[2] += dt * (rotationAccelerationZTmp + this.rotationAcceleration[2]) / 2;                             //
    /* END Calculate new rotation acceleration and velocity from forces *********************************************************/
};

Ship.prototype.postUpdate = function() {
    this.sceneObject.position.x = this.position[0];
    this.sceneObject.position.y = this.position[1];
    this.sceneObject.position.z = this.position[2];

    this.sceneObject.quaternion.multiply( this.rotationTmp );
    // expose the rotation vector for convenience
    this.sceneObject.rotation.setFromQuaternion( this.sceneObject.quaternion, this.sceneObject.rotation.order );
};

Ship.prototype.updateCamera = function() {
    var smooth = 0.2;

    this.simulation.camera.position.x = (this.simulation.camera.position.x * (1 - smooth)) + ((this.sceneObject.position.x - (this.shipDirection.x * this.length )) * smooth);
    this.simulation.camera.position.y = (this.simulation.camera.position.y * (1 - smooth)) + ((this.sceneObject.position.y - (this.shipDirection.y * this.length ) + (this.height / 2)) * smooth);
    this.simulation.camera.position.z = (this.simulation.camera.position.z * (1 - smooth)) + ((this.sceneObject.position.z - (this.shipDirection.z * this.length )) * smooth);

    this.simulation.camera.lookAt(this.sceneObject.position);
};

Ship.prototype.updateShipProperties = function() {
    this.shipDirection.x = 0;
    this.shipDirection.y = 0;
    this.shipDirection.z = 1;
    this.shipDirection.applyQuaternion(this.sceneObject.quaternion);

    this.moveDirection[0] = this.deltaDistance[0];
    this.moveDirection[1] = this.deltaDistance[1];
    this.moveDirection[2] = this.deltaDistance[2];
    Utils.normalize(this.moveDirection);

    this.rotationDirection[0] = this.rotationDeltaAngle[0];
    this.rotationDirection[1] = this.rotationDeltaAngle[1];
    this.rotationDirection[2] = this.rotationDeltaAngle[2];
    Utils.normalize(this.rotationDirection);
};

Ship.prototype.resetForces = function() {
    this.force[0] = 0;
    this.force[1] = 0;
    this.force[2] = 0;
    this.rotationForce[0] = 0;
    this.rotationForce[1] = 0;
    this.rotationForce[2] = 0;
};

Ship.prototype.applySteeringForces = function(dt, simulation) {

    var isSteering = false;

    if(simulation.INPUT[simulation.KEY.W]) {
        this.rotationForce[0] = this.maxSteeringPower;
        isSteering = true;
    }

    if(simulation.INPUT[simulation.KEY.S]) {
        this.rotationForce[0] = -this.maxSteeringPower;
        isSteering = true;
    }

    if(simulation.INPUT[simulation.KEY.A]) {
        this.rotationForce[1] = this.maxSteeringPower;
        isSteering = true;
    }

    if(simulation.INPUT[simulation.KEY.D]) {
        this.rotationForce[1] = -this.maxSteeringPower;
        isSteering = true;
    }

    if(simulation.INPUT[simulation.KEY.Q]) {
        this.rotationForce[2] = this.maxSteeringPower;
        isSteering = true;
    }

    if(simulation.INPUT[simulation.KEY.E]) {
        this.rotationForce[2] = -this.maxSteeringPower;
        isSteering = true;
    }

    if ((simulation.TOGGLED[simulation.KEY.V] || simulation.INPUT[simulation.KEY.C]) && !isSteering) { //SAS ON

        var minStopAngle = Utils.magnitude3(this.rotationDeltaAngle);

        if(minStopAngle > 0) { //Ship is in move and breaking is needed
            var currentVelocity = minStopAngle / this.deltaTime,
                requiredAcceleration = -((currentVelocity * currentVelocity) / (2 * minStopAngle));

            this.rotationForce[0] += this.rotationDirection[0] * Math.max(this.momentOfInertia[0] * requiredAcceleration, this.maxBreakPower);
            this.rotationForce[1] += this.rotationDirection[1] * Math.max(this.momentOfInertia[1] * requiredAcceleration, this.maxBreakPower);
            this.rotationForce[2] += this.rotationDirection[2] * Math.max(this.momentOfInertia[2] * requiredAcceleration, this.maxBreakPower);
        }
    }
};

Ship.prototype.applyThrustForces = function(dt, simulation) {

    var isThrusting = false;

    if (simulation.TOGGLED[simulation.KEY.Z] || simulation.INPUT[simulation.KEY.SHIFT]) {
        this.force[0] += this.shipDirection.x * this.maxThrustPower;
        this.force[1] += this.shipDirection.y * this.maxThrustPower;
        this.force[2] += this.shipDirection.z * this.maxThrustPower;
        isThrusting = true;
    }

    if (simulation.TOGGLED[simulation.KEY.X] || simulation.INPUT[simulation.KEY.CTRL]) {
        this.force[0] -= this.shipDirection.x * this.maxThrustPower;
        this.force[1] -= this.shipDirection.y * this.maxThrustPower;
        this.force[2] -= this.shipDirection.z * this.maxThrustPower;
        isThrusting = true;
    }

    if ((simulation.TOGGLED[simulation.KEY.V] || simulation.INPUT[simulation.KEY.C]) && !isThrusting) { //SAS ON

        var minStopDistance = Utils.magnitude3(this.deltaDistance);

        if(minStopDistance > 0) { //Ship is in move and breaking is needed
            var currentVelocity = minStopDistance / this.deltaTime,
                requiredAcceleration = -((currentVelocity * currentVelocity) / (2 * minStopDistance)),
                requiredForce = this.mass * requiredAcceleration,
                breakPower = Math.max(requiredForce, this.maxBreakPower);

            this.force[0] += this.moveDirection[0] * breakPower;
            this.force[1] += this.moveDirection[1] * breakPower;
            this.force[2] += this.moveDirection[2] * breakPower;
        }
    }
};

Ship.prototype.applyWorldForces = function(dt, simulation) {

};

function init() {
    window.simulation = new Simulation();

    simulation.createSimulationObject(new Ship());
    simulation.run();
}








