import * as THREE from 'three'
import TWEEN from 'tween.js'
import 'imports-loader?THREE=three!exports-loader?THREE.OrbitControls!../node_modules/three/examples/js/controls/OrbitControls'

var camera, controls, scene, renderer, background, light;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersected;
var baseColor = new THREE.Color();

var meshes = [];

var flippingObjects = [];
var pages = {
  about: {
    label: 'ABOUT',
    position: '7.5%'
  },
  projects: {
    label: 'PROJECTS',
    position: '27.5%'
  },
  contact: {
    label: 'CONTACT',
    position: '47.5%'
  },
  memes: {
    label: 'TEMP',
    position: '67.5%'
  },
  gachi: {
    label: 'TEMP',
    position: '87.5%'
  }
}

init();
initDom();
animate();

function initDom() {
  var headerOne = document.createElement('h1');
  headerOne.id = 'title'
  headerOne.innerHTML = 'JORDAN MUNROE';
  headerOne.style.fontSize = '6vw';
  headerOne.style.letterSpacing = '2vw';
  headerOne.style.width = '100%';
  headerOne.style.textAlign = 'center';
  headerOne.style.fontFamily = 'Century Gothic';
  headerOne.style.position = 'absolute';
  headerOne.style.top = '30%';
  headerOne.style.left = '0';
  headerOne.style.color = 'rgba(0, 0, 0, 1)';
  headerOne.style.opacity = '0.3'
  document.getElementById('container').appendChild(headerOne);

  for (var i in pages) {
    var aboutMe = document.createElement('h2');
    aboutMe.class = 'section'
    aboutMe.innerHTML = pages[i].label;
    aboutMe.style.fontSize = '12px';
    aboutMe.style.letterSpacing = '5px';
    aboutMe.style.fontFamily = 'Century Gothic';
    aboutMe.style.position = 'absolute';
    aboutMe.style.top = '70%';
    aboutMe.style.left = pages[i].position;
    aboutMe.style.color = 'black';
    aboutMe.style.textAlign = 'center';
    document.getElementById('container').appendChild(aboutMe);
  }
}

function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcccccc, 0.1);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 1.8;
    camera.position.y = 0.5;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);

    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enableRotate = false;
    controls.rotateSpeed = 0.1;
    // controls.autoRotate = true;
    controls.autoRotateSpeed = -0.01;

    controls.enableZoom = false;
    controls.zoomSpeed = 0.5;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    // world

    var geometry = new THREE.CylinderGeometry(0, 0.1, 0.3, 4, 1);
    var material =  new THREE.MeshPhysicalMaterial({color:0xffffff, shading: THREE.FlatShading});

    for (var i = 0; i < 5; i ++) {

        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.rotation.set(0, Math.PI / 4, 0);
        flippingObjects.push(mesh);

        var vector = new THREE.Vector3(-10 + (5 * i), 0, 0);
        vector.unproject( camera );
        var dir = vector.sub( camera.position ).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
        mesh.position.copy(pos);
        mesh.position.y = 0.1;
        mesh.position.z = -0.5;
        mesh.name = i;

        if (i % 2 === 0) {

            mesh.material = new THREE.MeshPhongMaterial({color:0x2997DB, shading: THREE.FlatShading});

        } else {

            mesh.material = new THREE.MeshPhongMaterial({color:0x777777, shading: THREE.FlatShading});

        }

        meshes.push(mesh);

    }

    background = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.3, 0.3, 4, 1), material);
    background.scale.set(50, 50, 50);
    background.position.set(0, 0, -14);
    scene.add(background)

    // lights

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    // dom

    var aboutMe = document.createElement('div');
    aboutMe.id = "about-me";
    aboutMe.innerHTML = "About Me";
    // container.appendChild(aboutMe);

    // events

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('click', onMouseClick, false);

}

function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth, window.innerHeight);

for (var i in flippingObjects) {
  var vector = new THREE.Vector3(-1 + (0.5 * i), 0, 0);
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
  flippingObjects[i].position.copy(pos);
  flippingObjects[i].position.y = 0.1;
  flippingObjects[i].position.z = -0.5;
}

}

function onMouseMove(event) {

mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
raycaster.setFromCamera(mouse, camera);

// See if the ray from the camera into the world hits one of our meshes
var intersects = raycaster.intersectObjects(meshes);

// Toggle rotation bool for meshes that we clicked
if (intersects.length > 0) {

    if (intersected != intersects[0].object) {

        if (intersected) intersected.material.color.copy(baseColor);

        intersected = intersects[0].object;
        baseColor.copy(intersected.material.color);

        intersected.material.color.setHex(0xff0000);

    }

} else if (intersected) {
    intersected.material.color.copy(baseColor)
    intersected = null
}
}

function onMouseClick(event) {
if (intersected !== null) {
  focus(intersected)
}
}

function flipAnimation() {
for (var i in flippingObjects) {
    flippingObjects[i].rotation.y += 0.005
}
}

function focus(object) {
let title = document.getElementById('title')
let sections = document.getElementsByClass('section')
console.log(sections)
let target = controls.target.clone();
var targetTween = new TWEEN.Tween(target);
targetTween.to(object.position, 1000);
targetTween.onUpdate(function(value) {
title.style.opacity = (1 - value) * 0.3
controls.target.copy(target);
});
targetTween.start();

var pos = object.position.clone();
pos.z += 0.3;
var curPos = camera.position.clone();
var posTween = new TWEEN.Tween(curPos);
posTween.to(pos, 1000);
posTween.onUpdate(function(value) {
camera.position.copy(curPos);
});
posTween.start();
}

function animate() {

requestAnimationFrame(animate);

TWEEN.update();
controls.update();
flipAnimation();
background.rotation.y += 0.0002;

render();

}

function render() {

renderer.render(scene, camera);

}