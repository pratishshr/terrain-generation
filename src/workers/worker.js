import { clamp } from 'three/src/math/MathUtils';
import { noise } from 'perlin';
import { generateFallOffMap } from '../utils/fallOff';

noise.seed(1994);

function randomSeed(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createNoiseMap({
  mapWidth,
  mapHeight,
  scale,
  octaves,
  persistance,
  lacunarity,
  offset,
  seed,
  useFallOff = false
}) {
  let noiseMap = [];
  const fallOffMap = generateFallOffMap(mapWidth);

  let octaveOffsets = new Array(octaves);

  let maxPossibleHeight = 0;

  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    let offsetX = randomSeed(seed + i) * 200000 - 100000 + offset.x;
    let offsetY = randomSeed(seed + i) * 200000 - 100000 + offset.y;
    octaveOffsets[i] = { x: offsetX, y: offsetY };

    maxPossibleHeight += amplitude;
    amplitude *= persistance;
  }

  if (scale <= 0) {
    scale = 0.0001;
  }

  let maxNoiseHeight = Number.MIN_VALUE;
  let minNoiseHeight = Number.MAX_VALUE;

  let halfWidth = mapWidth / 2;
  let halfHeight = mapHeight / 2;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      let noiseHeight = 0;
      amplitude = 1;
      frequency = 1;

      for (let i = 0; i < octaves; i++) {
        let sampleX =
          ((x - halfWidth + octaveOffsets[i].x) / scale) * frequency;
        let sampleY =
          ((y - halfHeight + octaveOffsets[i].y) / scale) * frequency;

        let perlinValue = noise.perlin2(sampleX, sampleY) * 2;
        noiseHeight += perlinValue * amplitude;

        amplitude *= persistance;
        frequency *= lacunarity;
      }

      if (noiseMap[x] === undefined) {
        noiseMap[x] = [];
      }

      if (noiseMap[x][y] === undefined) {
        noiseMap[x][y] = [];
      }

      if (noiseHeight > maxNoiseHeight) {
        maxNoiseHeight = noiseHeight;
      }

      if (noiseHeight < minNoiseHeight) {
        minNoiseHeight = noiseHeight;
      }

      noiseMap[x][y] = noiseHeight;
    }
  }

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      // noiseMap[x][y] = inverseLerp(
      //   minNoiseHeight,
      //   maxNoiseHeight,
      //   noiseMap[x][y]
      // );

      let normalizedHeight = noiseMap[x][y] / maxPossibleHeight;
      noiseMap[x][y] = clamp(normalizedHeight, 0, 1);

      if (useFallOff) {
        noiseMap[x][y] = clamp(noiseMap[x][y] - fallOffMap[x][y], 0, 1);
      }
    }
  }

  return noiseMap;
}

onmessage = function (e) {
  let noiseMap = createNoiseMap(e.data);

  postMessage(noiseMap);
};
