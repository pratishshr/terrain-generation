import './style.css';
import * as THREE from 'three';

import Renderer from './Renderer';
import TerrainManager from './TerrainManager';
import Player from './Player';

const keys = [];

const renderer = new Renderer();
renderer.render();

const terrainManager = new TerrainManager({
  renderer,
});

terrainManager.generate();
terrainManager.animate();

const player = new Player();
player.create();

renderer.onUpdate = (elapsedTime, delta) => {
  const lookAt = new THREE.Vector3(0, 0, 0);
  lookAt.x = player.mesh.position.x;
  lookAt.y = player.mesh.position.y;
  lookAt.z = player.mesh.position.z;

  renderer.playerCamera.position.setZ(player.mesh.position.z + 40);
  renderer.playerCamera.position.setX(player.mesh.position.x);
  renderer.playerCamera.position.setY(70);

  renderer.playerCamera.lookAt(lookAt);

  player.update(elapsedTime);

  document.body.addEventListener('keydown', function (e) {
    keys[e.key] = true;
  });

  document.body.addEventListener('keyup', function (e) {
    keys[e.key] = false;
  });

  if (keys['w']) {
    player.velY++;
  }

  if (keys['a']) {
    player.velX--;
  }

  if (keys['s']) {
    player.velY--;
  }

  if (keys['d']) {
    player.velX++;
  }

  if (keys[' ']) {
    player.speed = 0.2;
  } else {
    player.speed = 0.1;
  }

  player.velX *= player.friction;
  player.velY *= player.friction;

  player.mesh.position.x += player.speed * player.velX;
  player.mesh.position.z -= player.speed * player.velY;
};

renderer.addToScene(player.mesh);
