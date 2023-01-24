import { noise } from 'perlin';

noise.seed(Math.random());

export function generateNoiseMap(mapWidth, mapHeight, scale) {
  let noiseMap = []

  if (scale <= 0) {
    scale = 0.0001;
  }

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      let sampleX = x / scale;
      let sampleY = y / scale;

      let perlinValue = noise.perlin2(sampleX, sampleY) + 0.5;

      if (noiseMap[x] === undefined) {
        noiseMap[x] = [];
      }

      if (noiseMap[x][y] === undefined) {
        noiseMap[x][y] = [];
      }

      noiseMap[x][y] = perlinValue;
    }
  }

  return noiseMap;
}
