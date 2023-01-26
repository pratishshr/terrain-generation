import './style.css';

import Renderer from './Renderer';
import TerrainManager from './TerrainManager';

const renderer = new Renderer();
renderer.render();

const terrainManager = new TerrainManager({
  renderer,
});


terrainManager.generate();
terrainManager.animate();