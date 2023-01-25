import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import BezierEasing from 'bezier-easing';

import {
  destroy,
  generateColorImage,
  generateNoiseImage,
  getImageData,
} from './utils/canvas';
import { generateNoiseMap } from './utils/noise';
import { hexToRgb } from './utils/color';
import { CubicBezierCurve } from 'three';

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

camera.position.set(0, 50, 100);

scene.add(camera);
/** ----- **/

/** LIGHTS **/
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x433f40, 1);
directionalLight.position.set(50, 50, 1);

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
const material = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  vertexColors: true,
});

material.wireframe = false;
gui.add(material, 'wireframe');

const maxSegments = 240;

const sliders = {
  width: 129,
  height: 129,
  seed: 1,
  levelOfDetail: 0,
  noiseScale: 20,
  octaves: 4,
  persistance: 0.5,
  lacunarity: 2,
  offset: {
    x: 0,
    y: 0,
  },
  elevation: 6,
};

function regenerate({
  width,
  height,
  noiseScale,
  octaves,
  persistance,
  lacunarity,
  offset,
  seed,
  elevation,
  levelOfDetail,
}) {
  const plane = regenerateBoxGeometry(
    width,
    height,
    maxSegments,
    levelOfDetail
  );

  const noiseMap = generateNoiseMap(
    maxSegments + 1,
    maxSegments + 1,
    noiseScale,
    octaves,
    persistance,
    lacunarity,
    offset,
    seed
  );

  const imageData = generateNoiseImage(
    noiseMap,
    maxSegments + 1,
    maxSegments + 1
  );

  const colorMap = generateColorImage(
    noiseMap,
    maxSegments + 1,
    maxSegments + 1
  );

  fillTerrainWithColor(colorMap, plane);

  setHeightFromImageData(
    imageData,
    plane,
    elevation,
    maxSegments,
    levelOfDetail
  );
}

gui.add(sliders, 'noiseScale', 1, 100, 0.01).onChange((value) => {
  regenerate({ ...sliders, noiseScale: value });
});

gui.add(sliders, 'octaves', 1, 10, 1).onChange((value) => {
  regenerate({ ...sliders, octaves: value });
});

gui.add(sliders, 'persistance', 0.1, 1, 0.01).onChange((value) => {
  regenerate({ ...sliders, persistance: value });
});

gui.add(sliders, 'lacunarity', 1, 10, 0.01).onChange((value) => {
  regenerate({ ...sliders, lacunarity: value });
});

gui.add(sliders, 'seed', 1, 1000, 1).onChange((value) => {
  regenerate({ ...sliders, seed: value });
});

gui.add(sliders.offset, 'x', 0, 10, 0.1).onChange((value) => {
  regenerate({
    ...sliders,
    offset: {
      ...sliders.offset,
      x: value,
    },
  });
});

gui.add(sliders.offset, 'y', 0, 10, 0.1).onChange((value) => {
  regenerate({
    ...sliders,
    offset: {
      ...sliders.offset,
      y: value,
    },
  });
});

gui.add(sliders, 'elevation', 0, 40, 1).onChange((value) => {
  regenerate({ ...sliders, elevation: value });
});

gui.add(sliders, 'levelOfDetail', 0, 3, 1).onChange((value) => {
  regenerate({ ...sliders, levelOfDetail: value });
});

let planeGeometry;
let plane;

planeGeometry = new THREE.PlaneGeometry(
  sliders.width,
  sliders.height,
  sliders.maxSegments,
  sliders.maxSegments
);

plane = new THREE.Mesh(planeGeometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = true;
scene.add(plane);

function fillTerrainWithColor(colorMap, plane) {
  const count = plane.geometry.getAttribute('position').count;

  plane.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  );

  const colors = plane.geometry.getAttribute('color');

  for (let i = 0; i < count; i++) {
    const rgb = hexToRgb(colorMap[i]);

    colors.setXYZ(i, rgb.r / 255, rgb.g / 255, rgb.b / 255);
  }
}

function getSegmentsPerLine(maxSegments, levelOfDetail) {
  let meshSimplificationIncrement = levelOfDetail * 2;

  if (meshSimplificationIncrement == 0) {
    meshSimplificationIncrement = 1;
  }

  const segmentsPerLine = maxSegments / meshSimplificationIncrement;

  return { meshSimplificationIncrement, segmentsPerLine };
}

function regenerateBoxGeometry(width, height, maxSegments, levelOfDetail) {
  const { segmentsPerLine } = getSegmentsPerLine(maxSegments, levelOfDetail);

  planeGeometry = new THREE.PlaneGeometry(
    width,
    height,
    segmentsPerLine,
    segmentsPerLine
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

function setHeightFromImageData(
  imageData,
  plane,
  elevation,
  maxSegments,
  levelOfDetail
) {
  const { meshSimplificationIncrement, segmentsPerLine } = getSegmentsPerLine(
    maxSegments,
    levelOfDetail
  );

  const position = plane.geometry.getAttribute('position');
  const count = plane.geometry.getAttribute('position').count;

  const easing = BezierEasing(0.8, 0.17, 0.46, 0.05);

  console.log(meshSimplificationIncrement, segmentsPerLine);

  // for (let i = 0; i < count; i++) {
  //   let easingHeight = easing(imageData[i]);

  //   position.setZ(i, easingHeight * elevation);
  // }

  const heights = [];

  for (let y = 0; y < maxSegments; y += meshSimplificationIncrement) {
    for (let x = 0; x < maxSegments; x += meshSimplificationIncrement) {
      let index = y * maxSegments + x;
      let easingHeight = easing(imageData[index]);

      heights.push(easingHeight * elevation);
    }
  }

  for (let i = 0; i < count; i++) {
    position.setZ(i, heights[i]);
  }
}

regenerate(sliders);

/** ----- */

/**
 * Animate
 */
const clock = new THREE.Clock();
const count = plane.geometry.getAttribute('position').count;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

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
