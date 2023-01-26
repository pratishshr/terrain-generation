import * as THREE from 'three';
import BezierEasing from 'bezier-easing';

import * as noise from './utils/noise';
import * as canvas from './utils/canvas';
import { hexToRgb } from './utils/color';

const MAX_SEGMENTS = 240;

class Terrain {
  constructor(params) {
    const terrainParams = params || {};

    this.width = terrainParams.width || 100;
    this.height = terrainParams.height || 100;
    this.segments = terrainParams.segments || MAX_SEGMENTS;

    this.seed = terrainParams.seed || 1;
    this.scale = terrainParams.scale || 70;
    this.octaves = terrainParams.octaves || 4;
    this.lacunarity = terrainParams.lacunarity || 2;
    this.persistence = terrainParams.persistence || 0.5;

    this.offset = terrainParams.offset || { x: 0, y: 0 };
    this.elevation = terrainParams.elevation || 18;
    this.levelOfDetail = terrainParams.levelOfDetail || 0;

    this.terrainMesh = null;

    this.noiseMap = [];
    this.colorMap = [];
  }

  create() {
    this.createGeometry();
    this.generateNoiseMap();
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
    this.terrainMesh.geometry.computeVertexNormals();
    this.terrainMesh.geometry.getAttribute('position').needsUpdate = true;
  }

  update() {
    this.generateNoiseMap();
    this.generateColorMap();
    this.setTerrainColor();
    this.setElevation();

    this.updateGeometry();
  }

  setPosition() {}

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

  generateNoiseMap() {
    this.noiseMap = noise.createNoiseMap({
      // Vertices = segments + 1
      mapWidth: this.segments + 1,
      mapHeight: this.segments + 1,
      seed: this.seed,
      scale: this.scale,
      octaves: this.octaves,
      lacunarity: this.lacunarity,
      persistance: this.persistence,
      offset: this.offset,
    });
  }

  generateColorMap() {
    this.colorMap = canvas.createColorMap({
      noiseMap: this.noiseMap,
      levelOfDetail: this.levelOfDetail,
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
}

export default Terrain;
