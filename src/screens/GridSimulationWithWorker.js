import * as THREE from 'three';

import Stats from 'stats.js';
import Player from '../components/Player';
import Renderer from '../components/Renderer';
import { MAX_SEGMENTS } from '../components/Terrain';
import TerrainManager from '../components/TerrainManager';

const clock = new THREE.Clock();

class GridSimulationWithWorker {
  constructor() {
    this.keys = [];
    this.renderer = new Renderer({
      orbitControls: false,
    });
    this.terrainManager = new TerrainManager({
      renderer: this.renderer,
      useWorker: true,
      initialLevelOfDetail: 4,
    });

    this.wireframe = false;
    this.cameraPosition = {
      y: 1000,
    };

    this.addStats();
  }

  addStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);
  }

  addEventListeners() {
    document.body.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    document.body.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  toggleWireframe() {
    this.wireframe = !this.wireframe;

    Object.keys(this.terrainManager.terrains).forEach((key) => {
      if (this.terrainManager.terrains?.[key]) {
        this.terrainManager.terrains[key].wireframe = this.wireframe;
        this.terrainManager.terrains[key].updateGeometry();
      }
    });

    const button = document.querySelector('.wireframe-button');
    button.innerHTML = `𐄳 Wireframe: ${this.wireframe ? 'ON' : 'OFF'}`;
  }

  toggleCamera() {
    switch (this.cameraPosition.y) {
      case 1000:
        this.cameraPosition.y = 30;
        break;

      case 200:
        this.cameraPosition.y = 1000;
        break;

      case 30:
        this.cameraPosition.y = 200;

      default:
        1000;
    }
  }

  createToggleCameraButton() {
    const button = document.createElement('div');
    button.innerHTML = '🎥 Toggle camera';
    button.className = 'camera-button';

    button.addEventListener('click', () => {
      this.toggleCamera();
    });

    document.body.appendChild(button);
  }

  createToggleWireFrameButton() {
    const button = document.createElement('div');
    button.innerHTML = `𐄳 Wireframe: ${this.wireframe ? 'ON' : 'OFF'}`;
    button.className = 'wireframe-button';

    button.addEventListener('click', () => {
      this.toggleWireframe();
    });

    document.body.appendChild(button);
  }

  createInstructions() {
    const div = document.createElement('div');
    div.innerHTML =
      '<h3> Instructions </h3> <br/> Use arrow keys or WASD to move around. <br/> <br/> Press SPACE for boost. <br/>';
    div.className = 'instructions';

    document.body.appendChild(div);
  }

  createButtons() {
    this.createToggleCameraButton();
    this.createToggleWireFrameButton();
    this.createInstructions();
  }

  async start() {
    this.addEventListeners();
    this.renderer.render();

    this.player = new Player();
    this.player.create();

    this.createButtons();

    this.renderer.addToScene(this.player.mesh);

    this._update();

    await this.terrainManager.generate();
  }

  _updatePlayer(elapsedTime) {
    const lookAt = new THREE.Vector3(0, 0, 0);
    lookAt.x = this.player.mesh.position.x;
    lookAt.y = this.player.mesh.position.y;
    lookAt.z = this.player.mesh.position.z;

    this.renderer.camera.position.setZ(this.player.mesh.position.z + 40);
    this.renderer.camera.position.setX(this.player.mesh.position.x);
    this.renderer.camera.position.setY(this.cameraPosition.y);

    this.renderer.camera.lookAt(lookAt);

    if (this.keys['w'] || this.keys['ArrowUp']) {
      this.player.velY++;
    }

    if (this.keys['a'] || this.keys['ArrowLeft']) {
      this.player.velX--;
    }

    if (this.keys['s'] || this.keys['ArrowDown']) {
      this.player.velY--;
    }

    if (this.keys['d'] || this.keys['ArrowRight']) {
      this.player.velX++;
    }

    if (this.keys[' ']) {
      this.player.speed = 0.2;
    } else {
      this.player.speed = 0.1;
    }

    this.player.velX *= this.player.friction;
    this.player.velY *= this.player.friction;

    this.player.mesh.position.x += this.player.speed * this.player.velX;
    this.player.mesh.position.z -= this.player.speed * this.player.velY;
  }

  _updateTerrainChunks() {
    const { x, z } = this.player.mesh.position;
    const dx = 50;
    const dz = 50;

    const chunkX = Math.floor((x + dx) / 100);
    const chunkZ = -Math.floor((z + dz) / 100);

    const toBeUpdated = [];

    for (let offset = -2; offset <= 2; offset++) {
      for (let offset2 = -2; offset2 <= 2; offset2++) {
        const x = chunkX + offset;
        const z = chunkZ + offset2;

        toBeUpdated.push(`[${x}][${z}]`);

        if (offset === 2 || offset === -2 || offset2 === 2 || offset2 === -2) {
          if (
            this.terrainManager.terrains?.[`[${x}][${z}]`]?.levelOfDetail === 1
          ) {
            this.terrainManager.terrains[`[${x}][${z}]`].levelOfDetail = 4;
            this.terrainManager.terrains[`[${x}][${z}]`].regenerate();
          }

          continue;
        }

        if (
          this.terrainManager.terrains?.[`[${x}][${z}]`]?.levelOfDetail === 4
        ) {
          this.terrainManager.terrains[`[${x}][${z}]`].levelOfDetail = 1;
          this.terrainManager.terrains[`[${x}][${z}]`].regenerate();
        }
      }
    }
  }

  _update() {
    this.stats.begin();

    const elapsedTime = clock.getElapsedTime();

    this.terrainManager.onUpdate();
    this.renderer.onUpdate();

    this._updatePlayer(elapsedTime);
    this._updateTerrainChunks();

    this.stats.end();

    window.requestAnimationFrame(() => this._update());
  }
}

export default GridSimulationWithWorker;
