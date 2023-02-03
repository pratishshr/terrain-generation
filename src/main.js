import './styles/style.css';

import GridSimulation from './screens/GridSimulation';
import TerrainGenerator from './screens/TerrainGenerator';
import GridSimulationWithWorker from './screens/GridSimulationWithWorker';

// Configure Routes
function init() {
  const generatorRouteButton = document.querySelector('#route-generator');
  const simulationRouteButton = document.querySelector('#route-simulation');
  const simulationWithWorkerRouteButton = document.querySelector(
    '#route-simulation-web-worker'
  );

  generatorRouteButton.addEventListener('click', () => {
    const terrainGenerator = new TerrainGenerator();

    terrainGenerator.start();
  });

  simulationRouteButton.addEventListener('click', () => {
    const gridSimulation = new GridSimulation();

    gridSimulation.start();
  });

  simulationWithWorkerRouteButton.addEventListener('click', () => {
    const gridSimulationWithWorker = new GridSimulationWithWorker();

    gridSimulationWithWorker.start();
  });
}

init();
