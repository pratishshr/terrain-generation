import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

import { destroy, generateNoiseImage, getImageData } from './utils/canvas';
import { generateNoiseMap } from './utils/noise';

// Debug UI
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

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

/** Camera **/
const fov = 60;
const aspect = sizes.width / sizes.height;
const near = 1;
const far = 10000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.set(0, 30.5, 50);

scene.add(camera);
/** ----- **/

/** LIGHTS **/
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x433f40, 1);
directionalLight.position.set(10, 10, 1);

scene.add(directionalLight);
/** ------ */

/** Controls **/
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
/** -------- **/

/** Renderer **/
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
/** ------ **/

/** Mesh **/
const material = new THREE.MeshLambertMaterial({
  side: THREE.DoubleSide,
});

material.wireframe = false;
gui.add(material, 'wireframe');

const mapSize = {
  width: 100,
  height: 100,
  widthSegments: 1,
  heightSegments: 1,
};

const sliders = {
  heightMap: 'none',
  frequency: 1,
};

gui.add(sliders, 'frequency', 1, 200, 0.01).onChange((value) => {
  const plane = regenerateBoxGeometry(
    mapSize.width,
    mapSize.height,
    value,
    value
  );

  const noiseMap = generateNoiseMap(value + 1, value + 1, noiseScale);
  const imageData = generateNoiseImage(noiseMap, value + 1, value + 1);

  setHeightFromImageData(imageData, plane);
});

const noiseScale = 4;

let planeGeometry;
let plane;

planeGeometry = new THREE.PlaneGeometry(
  mapSize.width,
  mapSize.height,
  mapSize.widthSegments,
  mapSize.heightSegments
);

plane = new THREE.Mesh(planeGeometry, material);
plane.rotation.x = -Math.PI / 2;
// plane.receiveShadow = true;
// plane.castShadow = true;
scene.add(plane);

function regenerateBoxGeometry(width, height, widthSegments, heightSegments) {
  planeGeometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );

  plane.geometry.dispose();
  plane.geometry = planeGeometry;

  return plane;
}

/** ------ **/

/** Algorithm **/

// function computeNoiseMap(peak, smoothing, noiseMap) {
//   let i = 0;
//   const position = plane.geometry.getAttribute('position');

//   for (let y = 0; y <= mapHeight; y++) {
//     for (let x = 0; x <= mapWidth; x++) {
//       position.setZ(i, peak * Math.abs(noiseMap[x][y]));
//       i++;
//     }
//   }

//   // for (let i = 0; i < count; i++) {
//   //   const position = plane.geometry.getAttribute('position');
//   //   const x = position.getX(i);
//   //   const y = position.getY(i);
//   //   const z = position.getZ(i);

//   //   console.log(x, y)
//   //   // position.setZ(i, peak * Math.abs(noiseMap[x][y]));
//   // }
// }

// gui.add(config, 'peak', 0, 10, 0.01).onChange((value) => {
//   computeNoiseMap(value, config.smoothing, noiseMap);
// });

// gui.add(config, 'smoothing', 1, 10, 0.01).onChange((value) => {
//   computeNoiseMap(config.peak, value, noiseMap);
// });

camera.lookAt(plane.position);
/** ------- **/

/** Noise Generation */
// function drawNoiseMap(noiseMap) {
//   let colors = [];

//   for (let y = 0; y <= mapHeight; y++) {
//     for (let x = 0; x <= mapWidth; x++) {
//       const rgb = getRGB(noiseMap[y][x]);
//       colors.push(rgb[0], rgb[1], rgb[2]);
//     }
//   }

//   plane.geometry.setAttribute(
//     'color',
//     new THREE.BufferAttribute(new Float32Array(colors), 3)
//   );
// }

// const noiseMap = generateNoiseMap(mapWidth, mapHeight, noiseScale);
// drawNoiseMap(noiseMap);
// computeNoiseMap(config.peak, config.smoothing, noiseMap);

const loader = new THREE.TextureLoader();

const textureLoader = new THREE.TextureLoader();

textureLoader.setPath('/textures/').load(sliders.heightMap);

function setHeightFromImageData(imageData, plane) {
  const position = plane.geometry.getAttribute('position');
  const count = plane.geometry.getAttribute('position').count;

  for (let i = 0; i < count; i++) {
    position.setZ(i, imageData[i] * 10);
  }
}

gui
  .add(sliders, 'heightMap')
  .options(['none', 'perlin-noise.png', 'hello.jpg'])
  .onChange((value) => {
    destroy();
    textureLoader.setPath('/textures/').load(value, (result) => {
      result.image.width = mapSize.widthSegments + 1;
      result.image.height = mapSize.heightSegments + 1;

      const imageData = getImageData(
        result.image,
        mapSize.widthSegments + 1,
        mapSize.heightSegments + 1
      );
      setHeightFromImageData(imageData);
    });

    plane.geometry.computeVertexNormals();
  });

const noiseMap = generateNoiseMap(
  mapSize.widthSegments + 1,
  mapSize.heightSegments + 1,
  noiseScale
);

const imageData = generateNoiseImage(
  noiseMap,
  mapSize.widthSegments + 1,
  mapSize.heightSegments + 1
);

setHeightFromImageData(imageData, plane);

/** ----- */

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
