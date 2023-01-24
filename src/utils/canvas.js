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
