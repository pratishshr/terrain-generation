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

  const context = canvas.getContext('2d');

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      let value = noiseMap[x][y];
      let rgb = getRGB(value);

      context.fillStyle = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
      context.fillRect(x, y, 1, 1);
    }
  }

  canvas.className = 'height-map';
  document.body.appendChild(canvas);

  const imageData = context.getImageData(0, 0, width, height);

  const heightData = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    let r = imageData.data[i];
    let g = imageData.data[i + 1];
    let b = imageData.data[i + 2];

    heightData.push(getValueFromRGB([r, g, b]));
  }

  

  return heightData;
}

export function generateColorImage(noiseMap, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  const regions = [
    {
      height: 0.3,
      color: '#3762be',
      name: 'deep water',
    },
    {
      height: 0.4,
      color: '#2e5cb7',
      name: 'shallow water',
    },
    {
      height: 0.45,
      color: '#cab159',
      name: 'sand',
    },
    {
      height: 0.55,
      color: '#5ca61b',
      name: 'grass',
    },
    { height: 0.6, color: '#437514', name: 'grass2' },
    { height: 0.7, color: '#544038', name: 'rock' },
    { height: 0.85, color: '#41302d', name: 'rock2' },
    { height: 1, color: '#c7c7c7', name: 'snow' },
  ];
  const colorMap = new Array(width * height);

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      let value = noiseMap[x][y];

      for (let i = 0; i < regions.length; i++) {
        if (value <= regions[i].height) {
          colorMap[y * canvas.width + x] = regions[i].color;
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
