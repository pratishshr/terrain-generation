import Terrain from './Terrain';

class TerrainManager {
  constructor({ renderer }) {
    this.renderer = renderer;

    this.terrains = [];
  }

  createTerrain() {
    const terrain = new Terrain({
      offset: {
        x: 0,
        y: 0,
      },
      levelOfDetail: 1,
    });

    terrain.create();

    this.renderer.addToScene(terrain.terrainMesh);

    this.terrains.push(terrain);
  }

  animate() {
    this.renderer.onUpdate = (elapsedTime) => {
      this.terrains.forEach((terrain) => {
      });
    };
  }
}

export default TerrainManager;
