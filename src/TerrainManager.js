import Terrain from './Terrain';

class TerrainManager {
  constructor({ renderer }) {
    this.renderer = renderer;

    this.terrains = [];
  }

  async createTerrain(i, j) {
    const terrain = new Terrain({
      offset: {
        x: i,
        y: j,
      },
      levelOfDetail: 1,
    });

    terrain.create();

    terrain.setPosition(i * terrain.width, 0, -j * terrain.width);

    this.renderer.addToScene(terrain.terrainMesh);
    this.terrains.push(terrain);
  }

  generate() {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        setTimeout(() => {
          this.createTerrain(i, j);
        }, 1000);
      }
    }
  }

  animate() {
    this.renderer.onUpdate = (elapsedTime) => {
      this.terrains.forEach((terrain, index) => {
        if (index == 1) {
        }
      });
    };
  }
}

export default TerrainManager;
