import Terrain from '../components/Terrain';
import Renderer from '../components/Renderer';

import GUI from 'lil-gui';

class TerrainGenerator {
  constructor() {
    this.terrain;

    this.config = {
      seed: 1,
      scale: 50,
      octaves: 4,
      lacunarity: 3,
      persistence: 0.3,
      offset: {
        x: 0,
        y: 0,
      },
      elevation: 10,
      levelOfDetail: 0,
      wireframe: false,
    };

    this.gui = new GUI();
    this.renderer = new Renderer({
      orbitControls: true,
    });

    this._initGUI();
  }

  _initGUI() {
    this.gui.add(this.config, 'wireframe');
  }

  async start() {
    this.renderer.render();
    this.renderer.playerCamera.position.set(0, 50, 100);

    this.terrain = new Terrain({
      ...this.config,
      fallOffMap: false,
    });
    await this.terrain.create();

    this.renderer.addToScene(this.terrain.terrainMesh);

    this.update();
  }

  update() {
    this.renderer.update();
    this.terrain.update(this.config);
    window.requestAnimationFrame(() => this.update());
  }
}

export default TerrainGenerator;
