import * as THREE from 'three';

class Player {
  constructor() {
    this.mesh;
    this.velX = 0;
    this.velY = 0;
    this.speed = 0.1;
    this.friction = 0.9;
    this.position = new THREE.Vector3(0, 0, 0);
  }

  create() {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 'white' })
    );

    this.mesh.position.set(0, 10, 0);
  }

  update(elapsedTime) {
    // this.mesh.position.z += -elapsedTime * 0.1;
    // this.mesh.position.x += elapsedTime * 0.1;
  }
}

export default Player;
