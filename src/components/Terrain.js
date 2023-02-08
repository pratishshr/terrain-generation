import * as THREE from 'three';
import BezierEasing from 'bezier-easing';

import * as noise from '../utils/noise';
import * as canvas from '../utils/canvas';
import { hexToRgb } from '../utils/color';
import { generateFallOffMap } from '../utils/fallOff';

export const MAX_SEGMENTS = 240;

const regionsForSimulation = [
  {
    height: 0,
    color: '#3E6EAC',

    name: 'deep water',
  },
  {
    height: 0.07,
    color: '#4377BA',
    name: 'shallow water',
  },
  {
    height: 0.2,
    color: '#9C8130',
    name: 'sand',
  },
  {
    height: 0.3,
    color: '#57814E',
    name: 'grass',
  },
  { height: 0.4, color: '#40794D', name: 'grass2' },
  { height: 0.6, color: '#5C4C33', name: 'rock' },
  { height: 0.9, color: '#50422C', name: 'rock2' },
  // { height: 1, color: '#50422C', name: 'rock3' },
  { height: 1, color: '#F9F8F2', name: 'snow' },
];

const regions = [
  {
    height: 0.3,
    color: '#4377BA',
    name: 'deep water',
  },
  {
    height: 0.4,
    color: '#3E6EAC',
    name: 'shallow water',
  },
  {
    height: 0.48,
    color: '#9C8130',
    name: 'sand',
  },
  {
    height: 0.55,
    color: '#57814E',
    name: 'grass',
  },
  { height: 0.6, color: '#40794D', name: 'grass2' },
  { height: 0.7, color: '#5C4C33', name: 'rock' },
  { height: 0.85, color: '#50422C', name: 'rock2' },
  { height: 1, color: '#F9F8F2', name: 'snow' },
];

class Terrain {
  constructor(params) {
    const terrainParams = params || {};

    this.width = terrainParams.width || 100;
    this.height = terrainParams.height || 100;
    this.segments = terrainParams.segments || MAX_SEGMENTS;

    this.seed = terrainParams.seed || 1;
    this.scale = terrainParams.scale || 50;
    this.octaves = terrainParams.octaves || 4;
    this.lacunarity = terrainParams.lacunarity || 3;
    this.persistance = terrainParams.persistance || 0.3;

    this.offset = terrainParams.offset || { x: 0, y: 0 };
    this.elevation = terrainParams.elevation || 10;
    this.levelOfDetail = terrainParams.levelOfDetail || 0;
    this.wireframe = terrainParams.wireframe || false;

    this.terrainMesh = null;

    this.noiseMap = [];
    this.colorMap = [];
    this.fallOffMap = [];

    this.noiseType = params.noiseType || 'terrain';
  }

  async create() {
    await this.generateNoiseMap();

    this.createGeometry();

    this.generateColorMap();

    this.setTerrainColor();
    this.setElevation();

    this.updateGeometry();
  }

  setPosition(x, y) {
    this.terrainMesh.position.x = x;
    this.terrainMesh.position.y = y;
  }

  updateGeometry() {
    this.terrainMesh.material.wireframe = this.wireframe;

    this.terrainMesh.geometry.computeVertexNormals();
    this.terrainMesh.geometry.getAttribute('position').needsUpdate = true;
  }

  async update() {
    await this.generateNoiseMap();

    this.generateColorMap();

    this.setTerrainColor();
    this.setElevation();
    this.updateGeometry();
  }

  generateFallOffMap() {
    this.fallOffMap = generateFallOffMap(MAX_SEGMENTS);
  }

  async regenerate() {
    this.regenerateGeometry();
    // await this.generateNoiseMap();

    this.generateColorMap();

    this.setTerrainColor();
    this.setElevation();
    this.updateGeometry();
  }

  regenerateGeometry() {
    const { segmentsPerLine } = this._getSegmentsPerLine(
      MAX_SEGMENTS,
      this.levelOfDetail
    );

    this.terrainMesh.geometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      segmentsPerLine,
      segmentsPerLine
    );
  }

  createGeometry() {
    const { segmentsPerLine } = this._getSegmentsPerLine(
      MAX_SEGMENTS,
      this.levelOfDetail
    );

    const planeGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      segmentsPerLine,
      segmentsPerLine
    );
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
    });

    this.terrainMesh = new THREE.Mesh(planeGeometry, material);
    this.terrainMesh.material.wireframe = this.wireframe;
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
  }

  getPosition() {
    return this.terrainMesh.position;
  }

  setPosition(x, y, z) {
    this.terrainMesh.position.set(x, y, z);
  }

  async generateNoiseMap() {
    if (this.noiseType == 'worker') {
      this.noiseMap = await noise.createNoiseMapWithWorker({
        // Vertices = segments + 1
        mapWidth: this.segments + 1,
        mapHeight: this.segments + 1,
        seed: this.seed,
        scale: this.scale,
        octaves: this.octaves,
        lacunarity: this.lacunarity,
        persistance: this.persistance,
        offset: {
          x: this.offset.x * MAX_SEGMENTS,
          y: this.offset.y * MAX_SEGMENTS,
        },
      });

      return;
    }

    if (this.noiseType == 'without-worker') {
      this.noiseMap = await noise.createNoiseMapWithoutWorker({
        // Vertices = segments + 1
        mapWidth: this.segments + 1,
        mapHeight: this.segments + 1,
        seed: this.seed,
        scale: this.scale,
        octaves: this.octaves,
        lacunarity: this.lacunarity,
        persistance: this.persistance,
        offset: {
          x: this.offset.x * MAX_SEGMENTS,
          y: this.offset.y * MAX_SEGMENTS,
        },
      });

      return;
    }

    this.noiseMap = await noise.generateNoiseMapForTerrain({
      // Vertices = segments + 1
      mapWidth: this.segments + 1,
      mapHeight: this.segments + 1,
      seed: this.seed,
      scale: this.scale,
      octaves: this.octaves,
      lacunarity: this.lacunarity,
      persistance: this.persistance,
      offset: {
        x: this.offset.x * MAX_SEGMENTS,
        y: this.offset.y * MAX_SEGMENTS,
      },
    });
  }

  generateColorMap() {
    this.colorMap = canvas.createColorMap({
      noiseMap: this.noiseMap,
      levelOfDetail: this.levelOfDetail,
      regions: this.noiseType === 'terrain' ? regions : regionsForSimulation,
    });
  }

  setTerrainColor() {
    const count = this.terrainMesh.geometry.getAttribute('position').count;

    this.terrainMesh.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    );

    const colors = this.terrainMesh.geometry.getAttribute('color');

    for (let i = 0; i < count; i++) {
      const rgb = hexToRgb(this.colorMap[i]);

      colors.setXYZ(i, rgb.r / 255, rgb.g / 255, rgb.b / 255);
    }
  }

  _getSegmentsPerLine(maxSegments, levelOfDetail) {
    let meshSimplificationIncrement = levelOfDetail * 2;

    if (meshSimplificationIncrement == 0) {
      meshSimplificationIncrement = 1;
    }

    const segmentsPerLine = maxSegments / meshSimplificationIncrement;

    return { meshSimplificationIncrement, segmentsPerLine };
  }

  setElevation() {
    const { meshSimplificationIncrement } = this._getSegmentsPerLine(
      MAX_SEGMENTS,
      this.levelOfDetail
    );

    const position = this.terrainMesh.geometry.getAttribute('position');
    const count = this.terrainMesh.geometry.getAttribute('position').count;

    const easing = BezierEasing(0.8, 0.17, 0.46, 0.05);

    const heights = [];

    for (
      let y = 0;
      y < this.noiseMap.length;
      y += meshSimplificationIncrement
    ) {
      for (
        let x = 0;
        x < this.noiseMap.length;
        x += meshSimplificationIncrement
      ) {
        let easingHeight = easing(this.noiseMap[y][x]);

        heights.push(easingHeight * this.elevation);
      }
    }

    for (let i = 0; i < count; i++) {
      position.setZ(i, heights[i]);
    }
  }

  onUpdate() {
    this.updateGeometry();
  }
}

export default Terrain;
