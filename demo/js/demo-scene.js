/* globals THREE */

/* Creating ship model */

var config = {

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

console.log(generator.shipHullMaterial.color);

var ship = THREE.SceneUtils.createMultiMaterialObject( shipGeometry, [
    new THREE.MeshLambertMaterial({
        color: generator.shipHullMaterial.color,
        //shading: THREE.FlatShading
        shading: THREE.SmoothShading
    } )/*,
    new THREE.MeshPhongMaterial({
        depthTest: true,
        depthWrite: true,
        color: generator.shipHullMaterial.color,
        specular: 0x222222,
        shininess: 10,
        shading: THREE.FlatShading
        //shading: THREE.SmoothShading
    })*/
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

var render = function () {
    requestAnimationFrame( render );

    renderer.render(scene, camera);
};

render();
