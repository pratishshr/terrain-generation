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

// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001);

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

/** LIGHTS */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('0x00fffc', 0.3);
directionalLight.position.set(10, 10, 1);

scene.add(directionalLight);

// Helpers
// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   0.2
// );
// scene.add(directionalLightHelper);

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

const textureLoader = new THREE.TextureLoader();

const sliders = {
  heightMap: 'none',
};

const disMap = textureLoader.setPath('/textures/').load(sliders.heightMap);

const material = new THREE.MeshStandardMaterial({
  displacementMap: disMap,
  displacementScale: 4,
  side: THREE.DoubleSide,
});

material.wireframe = false;
gui.add(material, 'wireframe');

const planeGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);

// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
// const sphereMaterial = new THREE.MeshStandardMaterial();

// const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphereMesh.position.setY(5);
// scene.add(sphereMesh);

const plane = new THREE.Mesh(planeGeometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = true;

gui
  .add(material, 'displacementScale')
  .min(0)
  .max(10)
  .step(0.0001)
  .onChange(() => {
    plane.geometry.computeVertexNormals();
  });

gui
  .add(sliders, 'heightMap')
  .options(['none', 'perlin-noise.png', 'hello.jpg'])
  .onChange((value) => {
    material.displacementMap = textureLoader.setPath('/textures/').load(value);

    plane.geometry.computeVertexNormals();
  });

// ---------
const count = plane.geometry.getAttribute('position').count;

for (let i = 0; i <= count; i++) {
  const position = plane.geometry.getAttribute('position');
  const x = position.getX(i);
  const y = position.getY(i);
  const z = position.getZ(i);
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

  // for (let i = 0; i <= count; i++) {
  //   const x = plane.geometry.getAttribute('position').getX(i);
  //   const y = plane.geometry.getAttribute('position').getY(i);
  //   const z = plane.geometry.getAttribute('position').getZ(i);

  //   const xsin = Math.sin(x);

  //     plane.geometry.getAttribute('position').setZ(i, xsin);
  // }

  plane.geometry.computeVertexNormals();
  plane.geometry.getAttribute('position').needsUpdate = true;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
