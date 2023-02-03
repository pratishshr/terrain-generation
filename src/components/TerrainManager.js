import Terrain from './Terrain';

import GUI from 'lil-gui';
import { clamp } from 'three/src/math/MathUtils';

class TerrainManager {
  constructor({ renderer }) {
    this.renderer = renderer;

    this.terrains = [];
    this.config = {
      offset: {
        x: 0,
        y: 0,
      },
    };

    // this._initConfigGUI();

    // Debug UI
    this.gui = new GUI();
  }

  _initConfigGUI() {
    this.gui.add(this.config.offset, 'x', -500, 500, 1).onChange(async (value) => {
      this.terrains.forEach((terrain, index) => {
        if (index === 1) {
          terrain.offset.x = value;
          terrain.update();
        }
      });
    });
  }

  async createTerrain(i, j, offset = { x: 0, y: 0 }) {
    const terrain = new Terrain({
      offset: {
        x: -j,
        y: i,
      },
      levelOfDetail: 0,
    });

    await terrain.create();

    terrain.setPosition(i * terrain.width, 0, -j * terrain.width);

    this.renderer.addToScene(terrain.terrainMesh);
    this.terrains.push(terrain);
  }

  async generate() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        await this.createTerrain(i, j);
      }
    }

    this.renderer.camera.lookAt(this.terrains[0].terrainMesh.position);
  }

  animate() {
    this.renderer.onUpdate = (elapsedTime) => {
      this.terrains.forEach((terrain, index) => {
        if (index == 1) {
          // terrain.update();
        }
      });
    };
  }
}

export default TerrainManager;
