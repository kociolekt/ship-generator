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
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.camera.position.set(23.21715753525241, 11.01955380195478, 13.709757118304086);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    //Camera Controlls Temporary
    this.controls = new THREE.OrbitControls( this.camera );
    this.controls.damping = 0.2;

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
    this.mass = 1; //[kg]
    this.acceleration = [0, 0, 0]; //[m/s^2]
    this.velocity = [0, 0, 0]; //[m/s]
    this.force = [0, 0, 0]; //[N]
    this.position = [0, 0, 0]; //[m]
    this.shipDirection = new THREE.Vector3( 0, 0, 1 );
    this.tmpDirection = [0, 0, 0]; //[m];
    this.init();
}

Ship.prototype.init = function() {
    var config = {
        random: ((function(){ Utils.lfsr.setSeed(0); return Utils.lfsr.rand; })())
    };

    var generator = new ShipGenerator(config);

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
};

Ship.prototype.update = function(dt, simulation) {
    /* rotate ship */
    this.shipDirection.x = 0;
    this.shipDirection.y = 0;
    this.shipDirection.z = 1;
    this.shipDirection.applyQuaternion(this.sceneObject.quaternion);

    /* Add up all forces influencing the object */
    if (simulation.TOGGLED[simulation.KEY.SHIFT]) { //Thrust power of 10
        this.force[0] += this.shipDirection.x * 10;
        this.force[1] += this.shipDirection.y * 10;
        this.force[2] += this.shipDirection.z * 10;
    }

    /* SAS System */
    if (simulation.TOGGLED[simulation.KEY.C]) { //Breaks power of 10
        
    }

    /* Calculate new position */
    var accelerationXTmp = this.acceleration[0],
        accelerationYTmp = this.acceleration[1],
        accelerationZTmp = this.acceleration[2],
        positionXTmp = dt * (this.velocity[0] + dt * accelerationXTmp / 2),
        positionYTmp = dt * (this.velocity[1] + dt * accelerationYTmp / 2),
        positionZTmp = dt * (this.velocity[2] + dt * accelerationZTmp / 2);

    this.position[0] += positionXTmp;
    this.position[1] += positionYTmp;
    this.position[2] += positionZTmp;

    /* Calculate new acceleration and velocity from forces */
    this.acceleration[0] = this.force[0] / this.mass;
    this.acceleration[1] = this.force[1] / this.mass;
    this.acceleration[2] = this.force[2] / this.mass;

    this.velocity[0] += dt * (accelerationXTmp + this.acceleration[0]) / 2;
    this.velocity[1] += dt * (accelerationYTmp + this.acceleration[1]) / 2;
    this.velocity[2] += dt * (accelerationZTmp + this.acceleration[2]) / 2;
};

Ship.prototype.postUpdate = function() {
    this.sceneObject.position.x = this.position[0];
    this.sceneObject.position.y = this.position[1];
    this.sceneObject.position.z = this.position[2];
};

function init() {
    window.simulation = new Simulation();

    simulation.createSimulationObject(new Ship());
    simulation.run();
}








