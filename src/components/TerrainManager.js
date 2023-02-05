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
      levelOfDetail: 1,
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

  async generate() {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        await this.createTerrain(i, j);
      }
    }

    this.renderer.camera.lookAt(this.terrains[0].terrainMesh.position);
  }

  onUpdate() {
    this.terrains.forEach((terrain) => {
    });
  }
}

export default TerrainManager;
