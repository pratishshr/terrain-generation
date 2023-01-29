import { getSegmentsPerLine } from './calculations';
import { getRGB, getValueFromRGB } from './color';
import * as math from './math';

export function destroy() {
  const prevCanvas = document.querySelector('.height-map');
  if (prevCanvas) {
    document.body.removeChild(prevCanvas);
  }
}

export function generateNoiseImage(noiseMap, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const heightData = [];
  const context = canvas.getContext('2d');

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.height; x++) {
      let value = noiseMap[x][y];
      let rgb = getRGB(value);

      context.fillStyle = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
      context.fillRect(x, y, 1, 1);

      heightData.push(value);
    }
  }

  canvas.className = 'height-map';
  document.body.appendChild(canvas);

  // const imageData = context.getImageData(0, 0, width, height);

  // for (let i = 0; i < imageData.data.length; i += 4) {
  //   let r = imageData.data[i];
  //   let g = imageData.data[i + 1];
  //   let b = imageData.data[i + 2];

  //   heightData.push(getValueFromRGB([r, g, b]));
  // }

  return heightData;
}

export function generateColorImage(
  noiseMap,
  width,
  height,
  maxSegments,
  levelOfDetail
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  const regions = [
    {
      height: 0.3,
      color: '#4377BA',
      name: 'deep water',
    },
    {
      height: 0.4,
      color: '#3E6EAC',
      name: 'shallow water',
    },
    {
      height: 0.48,
      color: '#9C8130',
      name: 'sand',
    },
    {
      height: 0.55,
      color: '#57814E',
      name: 'grass',
    },
    { height: 0.6, color: '#40794D', name: 'grass2' },
    { height: 0.7, color: '#5C4C33', name: 'rock' },
    { height: 0.85, color: '#50422C', name: 'rock2' },
    { height: 1, color: '#F9F8F2', name: 'snow' },
  ];
  const colorMap = [];

  const { meshSimplificationIncrement, segmentsPerLine } = getSegmentsPerLine(
    maxSegments,
    levelOfDetail
  );

  for (let y = 0; y < canvas.width; y += meshSimplificationIncrement) {
    for (let x = 0; x < canvas.height; x += meshSimplificationIncrement) {
      let value = noiseMap[x][y];

      for (let i = 0; i < regions.length; i++) {
        if (value <= regions[i].height) {
          colorMap.push(regions[i].color);
          context.fillStyle = regions[i].color;
          context.fillRect(x, y, 1, 1);

          break;
        }
      }
    }
  }

  canvas.className = 'color-map';
  document.body.appendChild(canvas);

  return colorMap;
}

export function getImageData(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  canvas.className = 'height-map';
  document.body.appendChild(canvas);

  const imageData = context.getImageData(0, 0, image.width, image.height);

  const heightData = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    let r = imageData.data[i];
    let g = imageData.data[i + 1];
    let b = imageData.data[i + 2];

    heightData.push(getValueFromRGB([r, g, b]));
  }

  return heightData;
}

const regions = [
  {
    height: 0,
    color: '#3E6EAC',

    name: 'deep water',
  },
  {
    height: 0.07,
    color: '#4377BA',
    name: 'shallow water',
  },
  {
  height: 0.2,
    color: '#9C8130',
    name: 'sand',
  },
  {
    height: 0.3,
    color: '#57814E',
    name: 'grass',
  },
  { height: 0.4, color: '#40794D', name: 'grass2' },
  { height: 0.6, color: '#5C4C33', name: 'rock' },
  { height: 0.9, color: '#50422C', name: 'rock2' },
  // { height: 1, color: '#50422C', name: 'rock3' },
  { height: 1, color: '#F9F8F2', name: 'snow' },
];

export function createColorMap({ noiseMap, levelOfDetail }) {
  const canvas = document.createElement('canvas');
  canvas.width = noiseMap.length;
  canvas.height = noiseMap.length;

  const context = canvas.getContext('2d');

  const colorMap = [];

  const { meshSimplificationIncrement } = getSegmentsPerLine(
    noiseMap.length,
    levelOfDetail
  );

  for (let y = 0; y < canvas.width; y += meshSimplificationIncrement) {
    for (let x = 0; x < canvas.height; x += meshSimplificationIncrement) {
      let value = noiseMap[y][x];

      for (let i = 0; i < regions.length; i++) {
        if (value <= regions[i].height) {
          colorMap.push(regions[i].color);
          context.fillStyle = regions[i].color;
          context.fillRect(x, y, 1, 1);
          break
        } 
      }
    }
  }

  canvas.className = 'color-map';
  // document.body.appendChild(canvas);

  return colorMap;
}
