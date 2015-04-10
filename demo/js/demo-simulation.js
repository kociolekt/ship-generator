/* globals THREE */

/* Creating ship model */

var config = {
    random: ((function(){ Utils.lfsr.setSeed(0); return Utils.lfsr.rand; })())
};

var generator = new ShipGenerator(config);

console.log(generator);

/* Creating scene */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(23.21715753525241, 11.01955380195478, 13.709757118304086);
camera.lookAt(0, 0, 0);

var controls = new THREE.OrbitControls( camera );
controls.damping = 0.2;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );

/*
var ambientLight = new THREE.AmbientLight( 0x222222 );
scene.add( ambientLight );
*/

var lights = [];
lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[0].position.set( 0, 200, 0 );
lights[1].position.set( 100, 200, 100 );
lights[2].position.set( -100, -200, -100 );

scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );


// directional lighting
/*
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);*/

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

var ship = THREE.SceneUtils.createMultiMaterialObject( shipGeometry, [
    new THREE.MeshLambertMaterial({
        color: generator.shipHullMaterial.color,
        shading: generator.settings.bodyType === 'fluidStyle' ? THREE.SmoothShading : THREE.FlatShading
    } )
]);
scene.add( ship );

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
scene.add( plane );

//Add Coord
scene.add( new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 0, 0 ), 20, 0xff0000 )); //x
scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 20, 0x00ff00 )); //y
scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 20, 0x0000ff )); //z
scene.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 40, 0x101010 )); //ship direction

var loadScene = function () {
    window.addEventListener("resize", resize);
    document.body.appendChild( renderer.domElement );
}

var resize = function () {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

/* prototype of game loop */

var KEY = {
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
},
INPUT = new Array(255);
for (var i = 0; i < 255; i += 1) {
    INPUT[i] = false;
}


var timestamp = window.performance && window.performance.now ? function(){return window.performance.now();} : function(){return new Date().getTime();};


document.addEventListener('keydown',    onkeydown,    false);
document.addEventListener('keyup',      onkeyup,      false);
function onkeydown(event) { INPUT[event.keyCode] = true; console.log(event.keyCode) }
function onkeyup(event) { INPUT[event.keyCode] = false; }




var thrust       = 0,
    minThrust    = -10,
    maxThrust    = 10,
    thrustPerSec = maxThrust/3,
    speed        = 0,
    minSpeed     = -100,
    maxSpeed     = 100;

function update(step) {
    if(INPUT[KEY.SHIFT]) {
        console.log(step);
    }
}

function render(step) {
    renderer.render(scene, camera);
}

var Game = {

    run: function(options) {

        var now,
            dt = 0,
            last = timestamp(),
            step = 1 / options.fps,
            update = options.update,
            render = options.render;

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
    },
};


Game.run({
    fps: 60,
    update: update,
    render: render
});