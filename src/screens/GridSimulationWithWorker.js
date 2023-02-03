import * as THREE from 'three';

import Player from '../components/Player';
import Renderer from '../components/Renderer';
import TerrainManager from '../components/TerrainManager';

const clock = new THREE.Clock();

class GridSimulationWithWorker {
  constructor() {
    this.keys = [];
    this.renderer = new Renderer({
      orbitControls: true,
    });
    this.terrainManager = new TerrainManager({
      renderer: this.renderer,
      useWorker: true,
    });
  }

  async start() {
    this.renderer.render();
    this._update();

    await this.terrainManager.generate();

    // terrainManager.animate();

    // const player = new Player();
    // player.create();

    // renderer.addToScene(player.mesh);

    // const updatePlayer = (elapsedTime) => {
    //   const lookAt = new THREE.Vector3(0, 0, 0);
    //   lookAt.x = player.mesh.position.x;
    //   lookAt.y = player.mesh.position.y;
    //   lookAt.z = player.mesh.position.z;

    //   renderer.playerCamera.position.setZ(player.mesh.position.z + 40);
    //   renderer.playerCamera.position.setX(player.mesh.position.x);
    //   renderer.playerCamera.position.setY(70);

    //   renderer.playerCamera.lookAt(lookAt);

    //   player.update(elapsedTime);

    //   document.body.addEventListener('keydown', function (e) {
    //     keys[e.key] = true;
    //   });

    //   document.body.addEventListener('keyup', function (e) {
    //     keys[e.key] = false;
    //   });

    //   if (keys['w']) {
    //     player.velY++;
    //   }

    //   if (keys['a']) {
    //     player.velX--;
    //   }

    //   if (keys['s']) {
    //     player.velY--;
    //   }

    //   if (keys['d']) {
    //     player.velX++;
    //   }

    //   if (keys[' ']) {
    //     player.speed = 0.2;
    //   } else {
    //     player.speed = 0.1;
    //   }

    //   player.velX *= player.friction;
    //   player.velY *= player.friction;

    //   player.mesh.position.x += player.speed * player.velX;
    //   player.mesh.position.z -= player.speed * player.velY;
    // };

    // const startRenderLoop = () => {
    //   const elapsedTime = clock.getElapsedTime();

    //   renderer.update();
    //   updatePlayer(elapsedTime);

    //   window.requestAnimationFrame(() => startRenderLoop());
    // };

    // startRenderLoop();
  }

  _update() {
    const elapsedTime = clock.getElapsedTime();

    this.terrainManager.onUpdate();
    this.renderer.onUpdate();

    window.requestAnimationFrame(() => this._update());
  }
}

export default GridSimulationWithWorker;
