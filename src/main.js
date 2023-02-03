import './styles/style.css';

import GridSimulation from './screens/GridSimulation';
import TerrainGenerator from './screens/TerrainGenerator';

// Configure Routes
function init() {
  const generatorRouteButton = document.querySelector('#route-generator');
  const simulationRouteButton = document.querySelector('#route-simulation');


  generatorRouteButton.addEventListener('click', () => {
    const terrainGenerator = new TerrainGenerator();

    terrainGenerator.start();
  });

  simulationRouteButton.addEventListener('click', () => {
    const gridSimulation = new GridSimulation();

    gridSimulation.start();
  });
}

init();
