import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

//Debug UI
const gui = new GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const material = new THREE.MeshStandardMaterial();

// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 0.5);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// Base camera
const fov = 60;
const aspect = sizes.width / sizes.height;
const near = 1;
const far = 10000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.set(30, 30.5, 30.4);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

material.wireframe = true;
gui.add(material, 'wireframe');

const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);

const plane = new THREE.Mesh(planeGeometry, material);
plane.rotation.x = -Math.PI / 2;

// ---------
const count = plane.geometry.getAttribute('position').count;

for (let i = 0; i <= count; i++) {
  const x = plane.geometry.getAttribute('position').getX(i);
  const y = plane.geometry.getAttribute('position').getY(i);
  const z = plane.geometry.getAttribute('position').getZ(i);

  console.log(x, y, z)
  if (i === 0) {
    plane.geometry.getAttribute('position').setZ(i, 10);
  }
}
// ---------

camera.lookAt(plane.position);
scene.add(plane);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
