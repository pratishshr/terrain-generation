import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const clock = new THREE.Clock();
class Renderer {
  constructor() {
    this.scene;
    this.canvas;
    this.camera;
    this.controls;
    this.ambientLight;
    this.directionalLight;

    // Callbacks
    this.onUpdate;

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.init();
  }

  init() {
    this._initScene();
    this._initCamera();
    this._initAmbientLights();
    this._initDirectionalLights();
    this._initControls();
    this._initEventListeners();
  }

  render() {
    this._render();
    this._startRenderLoop();
  }

  addToScene(item) {
    this.scene.add(item);
  }

  setOnUpdate(onUpdate) {
    this.onUpdate = onUpdate;
  }

  _update() {
    const elapsedTime = clock.getElapsedTime();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.onUpdate?.(elapsedTime);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#2E2E38');
    this.canvas = document.querySelector('canvas.webgl');
  }

  _initCamera() {
    const fov = 60;
    const aspect = this.sizes.width / this.sizes.height;
    const near = 1;
    const far = 10000.0;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 50, 100);

    // this.camera.position.set(800, 500, 1000);

    this.addToScene(this.camera);
  }

  _initAmbientLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);

    this.addToScene(this.ambientLight);
  }

  _initDirectionalLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);

    this.directionalLight.position.x += 20;
    this.directionalLight.position.y += 20;
    this.directionalLight.position.z += 20;
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.position.z = -30;

    const d = 20;
    this.directionalLight.shadow.camera.left = -d;
    this.directionalLight.shadow.camera.right = d;
    this.directionalLight.shadow.camera.top = d;
    this.directionalLight.shadow.camera.bottom = -d;

    this.addToScene(this.directionalLight);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    // this.controls.target.set(800, 0, 0);
  }

  _render() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  _startRenderLoop() {
    this._update();
    window.requestAnimationFrame(() => this._startRenderLoop());
  }

  _initEventListeners() {
    window.addEventListener('resize', () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
}

export default Renderer;
