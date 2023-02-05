import GUI from 'lil-gui';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import Terrain from '../components/Terrain';
import Renderer from '../components/Renderer';
import {
  createColorMap,
  generateColorImage,
  generateNoiseImage,
} from '../utils/canvas';
import { downloadObjectAsJson } from '../utils/downloader';

const clock = new THREE.Clock();
const exporter = new GLTFExporter();

class TerrainGenerator {
  constructor() {
    this.terrain;

    this.config = {
      seed: 386,
      scale: 70,
      octaves: 4,
      lacunarity: 2,
      persistance: 0.5,
      offset: {
        x: 0,
        y: 0,
      },
      elevation: 18,
      levelOfDetail: 0,
      wireframe: false,
    };

    this.gui = new GUI();
    this.renderer = new Renderer({
      orbitControls: true,
    });

    this.shouldAnimate = true;

    this._initGUI();
  }

  _initGUI() {
    this.gui.add(this.config, 'wireframe').onChange((value) => {
      this.terrain.wireframe = value;
      this._updateTerrain();
    });

    this.gui.add(this.config, 'levelOfDetail', 0, 3, 1).onChange((value) => {
      this.terrain.levelOfDetail = value;
      this.terrain.regenerate();
    });

    this.gui.add(this.config, 'elevation', 0, 40, 1).onChange((value) => {
      this.terrain.elevation = value;
      this._updateTerrain();
    });

    this.gui.add(this.config.offset, 'x', 0, 10, 0.1).onChange((value) => {
      this.terrain.offset = {
        ...this.config.offset,
        x: value,
      };
      this._updateTerrain();
    });

    this.gui.add(this.config.offset, 'y', 0, 10, 0.1).onChange((value) => {
      this.terrain.offset = {
        ...this.config.offset,
        y: value,
      };
      this._updateTerrain();
    });

    this.gui.add(this.config, 'scale', 1, 100, 0.01).onChange((value) => {
      this.terrain.scale = value;
      this._updateTerrain();
    });

    this.gui.add(this.config, 'octaves', 1, 10, 1).onChange((value) => {
      this.terrain.octaves = value;
      this._updateTerrain();
    });

    this.gui.add(this.config, 'persistance', 0.1, 1, 0.01).onChange((value) => {
      this.terrain.persistance = value;
      this._updateTerrain();
    });

    this.gui.add(this.config, 'lacunarity', 1, 10, 0.01).onChange((value) => {
      this.terrain.lacunarity = value;
      this._updateTerrain();
    });

    this.gui.add(this.config, 'seed', 1, 1000, 1).onChange((value) => {
      this.terrain.seed = value;
      this._updateTerrain();
    });
  }

  async _updateTerrain() {
    await this.terrain.update();

    this._generateNoiseImage();
    this._generateColorMap();
  }

  _generateNoiseImage() {
    generateNoiseImage(this.terrain.noiseMap);
  }

  _generateColorMap() {
    generateColorImage({
      noiseMap: this.terrain.noiseMap,
      levelOfDetail: 0,
      showColorMap: true, 
    });
  }

  _startTerrainAnimation(elapsedTime) {
    if (this.shouldAnimate) {
      this.terrain.terrainMesh.rotation.z = elapsedTime * 0.1;
    }
  }

  _createButtons() {
    const generateButton = document.createElement('div');
    generateButton.className = 'generate-button';
    generateButton.innerHTML = 'Randomize';
    generateButton.addEventListener('click', () => {
      this.config.seed = Math.floor(Math.random() * 1000);
      this.terrain.seed = this.config.seed;
      this._updateTerrain();
    });

    document.body.appendChild(generateButton);

    const downloadButton = document.createElement('div');
    downloadButton.className = 'download-button';
    downloadButton.innerHTML = 'Download';
    downloadButton.addEventListener('click', () => {
      exporter.parse(
        this.renderer.scene,
        function (gltf) {
          downloadObjectAsJson(gltf, 'terrain.gltf');
        },
        function (error) {
          console.log('An error happened');
        },
        {
          animations: false,
        }
      );
    });

    document.body.appendChild(downloadButton);
  }

  async start() {
    this.renderer.render();

    this.terrain = new Terrain({
      ...this.config,
      fallOffMap: false,
    });
    await this.terrain.create();

    this._createButtons();
    this._generateNoiseImage();
    this._generateColorMap();

    this.renderer.addToScene(this.terrain.terrainMesh);
    this._update();
  }

  _update() {
    const elapsedTime = clock.getElapsedTime();

    this._startTerrainAnimation(elapsedTime);

    this.terrain.onUpdate();
    this.renderer.onUpdate();

    window.requestAnimationFrame(() => this._update());
  }
}

export default TerrainGenerator;
