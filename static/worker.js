importScripts('perlin.js');
importScripts('mathutil.js');

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
}) {
  let noiseMap = [];

  let octaveOffsets = new Array(octaves);

  for (let i = 0; i < octaves; i++) {
    let offsetX = randomSeed(seed + i) * 2000000 - 1000000 + offset.x;
    let offsetY = randomSeed(seed + i + octaves) * 2000000 - 1000000 + offset.y;
    octaveOffsets[i] = { x: offsetX, y: offsetY };
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
      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;

      for (let i = 0; i < octaves; i++) {
        let sampleX =
          ((x - halfWidth) / scale) * frequency +
          octaveOffsets[i].x * frequency;
        let sampleY =
          ((y - halfHeight) / scale) * frequency -
          octaveOffsets[i].y * frequency;

        let perlinValue = self.noise.perlin2(sampleX, sampleY) * 2;
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
      noiseMap[x][y] = self.inverseLerp(
        minNoiseHeight,
        maxNoiseHeight,
        noiseMap[x][y]
      );
    }
  }

  return noiseMap;
}

onmessage = function (e) {
  let noiseMap = createNoiseMap(e.data);

  postMessage(noiseMap);
};
