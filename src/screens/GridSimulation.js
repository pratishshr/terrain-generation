import * as THREE from 'three';

import Player from '../components/Player';
import Renderer from '../components/Renderer';
import TerrainManager from '../components/TerrainManager';

const clock = new THREE.Clock();

class GridSimulation {
  constructor() {
    this.keys = [];
    this.renderer = new Renderer({
      orbitControls: false,
    });
    this.terrainManager = new TerrainManager({
      renderer: this.renderer,
    });
  }

  addEventListeners() {
    document.body.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    document.body.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  async start() {
    this.addEventListeners();
    this.renderer.render();

    this.player = new Player();
    this.player.create();

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
    this.renderer.camera.position.setY(200);

    this.renderer.camera.lookAt(lookAt);

    if (this.keys['w']) {
      this.player.velY++;
    }

    if (this.keys['a']) {
      this.player.velX--;
    }

    if (this.keys['s']) {
      this.player.velY--;
    }

    if (this.keys['d']) {
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

  _update() {
    const elapsedTime = clock.getElapsedTime();

    this.terrainManager.onUpdate();
    this.renderer.onUpdate();

    this._updatePlayer(elapsedTime);
    window.requestAnimationFrame(() => this._update());
  }
}

export default GridSimulation;
