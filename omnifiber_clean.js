import * as THREE from "https://threejs.org/build/three.module.js";

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'https://threejs.org/examples/jsm/controls/TrackballControls.js';
import { DragControls } from 'https://threejs.org/examples/jsm/controls/DragControls.js';

var scene, camera, renderer, controls, cubeMesh, mesh, geometry, grid, curve, points, material, tube;

var resizeLayer, drawLayer, dragLayer, designParam, segments, pressureSlider, exportButton, folderOne, folderTwo, folderThree, folderFour, folderFive, folderStrainLimit; 

var seg_material, segment, seg_geometry, seg_mesh, selected, selected_flag;

var vertexHelpers, plane, sphere, intersected;

var objects = []; //strain limit layer drag
var dragControls;
var resize_mode = false; 
var drag_mode = false;
var mouseDown = false;
var offset = new THREE.Vector3();

init();

function createCamera() {
	// create a camera
	const fov = 75; // AKA Field of View
	const aspect = 2; //window.innerWidth/window.innerHeight;
	const near = 10; // the near clipping plane
	const far = 1000; // the far clipping plane

	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 8, 20 );

}

function createLights() {
	// create a directional light
	const ambientLight = new THREE.HemisphereLight( 0xddeeff, 0x202020, 9 );
	var mainLight = new THREE.DirectionalLight( 0xffffff, 5.0 );
	scene.add( ambientLight );

	// move the light back and up a bit
	mainLight.position.set( 20, 20, 10 );

	// add light to the scene
	scene.add( ambientLight, mainLight )
}

function createGrid() {
	//floor 
	mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
	mesh.rotation.x = - Math.PI / 2;
	scene.add( mesh );

	grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );
}


function createCurve() {
	curve = new THREE.CubicBezierCurve3(
		new THREE.Vector3( -10, 0, 0 ),
		new THREE.Vector3( 10, 0, 0 ),
		new THREE.Vector3( -10, 0, 0 ),
		new THREE.Vector3( 10, 0, 0) 
	);
	return {
		curve
	}
}


function createMaterials() {
	material = new THREE.MeshPhongMaterial( { color:0x232323, wireframe:false } );
	material.side = THREE.DoubleSide;
	return material;
}


function createGeomertries() {
	geometry = new THREE.TubeGeometry( curve, 40, 2, 20, false );
	return {
		geometry
	}
}

function createMeshes() {
	mesh = new THREE.Mesh( geometry, material);
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add( mesh );
}

function createRenderer() {
	renderer = new THREE.WebGLRenderer( { antialias:true } );
	renderer.setSize( window.innerWidth, window.innerHeight*0.85 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.gammaFactor = 2.2;
	renderer.grammaOutput = true;
	renderer.physicallyCorrectLights = true;
	document.getElementById('playground').appendChild( renderer.domElement );
}	

function init() {
	// create scene
	scene = new THREE.Scene();

	scene.background = new THREE.Color( 0xFAFAFA );
	
	createCamera();
	createLights();
	createGrid();
	createCurve();
	createMaterials();
	createGeomertries();
	createMeshes();
	createRenderer();

	controls = new OrbitControls( camera, renderer.domElement );
	dragControls = new DragControls (objects, camera, renderer.domElement);
	//invalidation.then(() => (controls.dispose(), renderer.dispose()));
}

function render() {
	renderer.render( scene, camera );
}

function update() {
	// animation logic here
}

function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight*0.85;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
}
  
window.addEventListener( 'resize', onWindowResize )

/* this works to change color, trying this onDocMouseMove */
/*
function onClick(event) {
	if (seg_mesh) {
		console.log(event);

		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		var objects = [seg_mesh]; // here add other segments
		var intersects = [];

		mouse.x = event.clientX / window.innerWidth * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		intersects = raycaster.intersectObjects(objects);
		if (intersects.length > 0) {
			selected = intersects[0].object;
			console.log("changing color");
			guiControls.color = selected.material.color.getStyle();
		}
	}
}*/

function animationLoop() {
	update();
	render();
    //listeners for strain limit layers
	//renderer.domElement.addEventListener("click", onClick);
	controls.update()
}

controls.update();
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.1;
renderer.setAnimationLoop( animationLoop )

// user controls

// response to insert button click
function addSegment() {
	
	segment = new THREE.CubicBezierCurve3(
	new THREE.Vector3(-7, 1, 0),
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(-7, 1, 0),
	new THREE.Vector3(0, 1, 0),
	);

	seg_geometry = new THREE.TubeGeometry( segment, 40, 1, 20, false );
	seg_material = new THREE.MeshBasicMaterial({color:0xF97446, wireframe:false})
	seg_material.polygonOffset = true;
	seg_material.polygonOffsetFactor = -0.1;
	seg_mesh = new THREE.Mesh( seg_geometry, seg_material);
	seg_mesh.renderOrder = 999;
	seg_mesh.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    scene.add(seg_mesh);

    objects.push(seg_mesh)

    // add gui controls to change color 
	var guiControls = new function() {
  		this.color = seg_material.color.getStyle();
	};

	folderThree.addColor( guiControls, "color" ).listen()
		.onChange( function(e) {
		selected.material.color.setStyle(e);
	});
	
	if (drag_mode) {
		dragControls.addEventListener( 'dragstart', function ( event ) {
		console.log('drag start');
		controls.enabled = false;
	});
	dragControls.addEventListener ( 'drag', function( event ){
		console.log('drag');
		// below use raycasting instead
		//if (event.object.position.x < -10 || event.object.position.x > 0) {
		//	event.object.position.x = 0;
		//}
		event.seg_mesh.position.y = 0;
		event.seg_mesh.position.z = 0; // This will prevent moving z axis, but will be on 0 line. change this to your object position of z axis.
	})
	dragControls.addEventListener( 'dragend', function ( event ) {
		console.log('drag end');
		controls.enabled = true;
	});
	}
}

function resizeSegment(){
	if (seg_mesh) {
		
		resize_mode = true;

	}
}


/*function dragSegment(){
	if (seg_mesh) {
		
		drag_mode = true;

	}
}*/

// gui controls
const datGui = new dat.GUI( { autoPlace: false } );
datGui.domElement.id = 'gui';

// mode controls
folderOne = datGui.addFolder( 'Step 1: Select Mode' );
folderOne.add( { mode: 'design' }, 'mode', ['simulation', 'design'] ).name( 'mode' ).listen();

// primitive controls
folderTwo = datGui.addFolder('Step 2: Choose Primitive');
folderTwo.add({contractible: false}, 'contractible').name('contractible').listen();
folderTwo.add({extensible: false}, 'extensible').name('extensible').listen();


// strain limitation controls
folderThree = datGui.addFolder('Step 3: Parameters');
folderStrainLimit = folderThree.addFolder('Strain Limiting Layer');
drawLayer = folderStrainLimit.add({insert: addSegment}, 'insert').listen();

resizeLayer = folderStrainLimit.add({resize: false}, 'resize').name('resize');

// // resize segments
resizeLayer.onChange( function (newValue) {
	if (newValue) {
		resizeSegment();
	}
	else {
		resize_mode = false;
	}
});

dragLayer = folderStrainLimit.add({drag: false}, 'drag').name('drag');

// // resize segments
dragLayer.onChange( function (newValue) {
	if (newValue) {
		//dragSegment();
		drag_mode = true;
	}
});


// actuation controls
folderFour = datGui.addFolder('Step 4: Actuation');
pressureSlider = folderFour.add({pressure: 0}, 'pressure', 0, 100);

// export controls
folderFive = datGui.addFolder('Step 5: Export');
exportButton = folderFive.add({export: function() { }}, 'export');

var customContainer = document.getElementById('my-gui-container');
customContainer.appendChild(datGui.domElement);

/*//changing options based on mode
mode.onChange( function (newValue) {
	if (newValue == 'design') {
		folderThree.remove(pressure);
		//designParam = folderThree.add({designParam: 0}, 'designParam', 0, 100);
		segments = folderThree.add({segments: 0}, 'segments', 0, 10);
	} else {
		folderThree.remove(designParam);
		folderThree.add({pressure: 0}, 'pressure', 0, 100);
	}
});*/

