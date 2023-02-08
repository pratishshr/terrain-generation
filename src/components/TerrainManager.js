import Terrain from './Terrain';

class TerrainManager {
  constructor({ renderer, useWorker }) {
    this.renderer = renderer;

    this.terrains = [];
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
      levelOfDetail: 4,
      wireframe: false,
    };

    this.useWorker = useWorker || false;
  }

  async createTerrain(i, j) {
    const terrain = new Terrain({
      ...this.config,
      offset: {
        x: -j,
        y: i,
      },
      fallOffMap: false,
      noiseType: this.useWorker ? 'worker' : 'without-worker',
    });

    await terrain.create();

    terrain.setPosition(i * terrain.width, 0, -j * terrain.width);

    this.renderer.addToScene(terrain.terrainMesh);
    this.terrains.push(terrain);
  }

  async withSpiral(X, Y, callback) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1;
    for (let i = 0; i < Math.max(X, Y) ** 2; i++) {
      if (-X / 2 < x && x <= X / 2 && -Y / 2 < y && y <= Y / 2) {
        await callback(x, y);
      }

      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        [dx, dy] = [-dy, dx];
      }
      x += dx;
      y += dy;
    }
  }

  async generate() {
    await this.withSpiral(10, 10, async (i, j) => {
      await this.createTerrain(i, j);
    });

    this.renderer.camera.lookAt(this.terrains[0].terrainMesh.position);
  }

  onUpdate() {
    this.terrains.forEach((terrain) => {});
  }
}

export default TerrainManager;
