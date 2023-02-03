import { createNoiseMap } from '../utils/createNoise';

onmessage = function (e) {
  let noiseMap = createNoiseMap(e.data);

  postMessage(noiseMap);
};
