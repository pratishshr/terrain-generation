export function getImageData(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  canvas.className = 'height-map';
  document.body.appendChild(canvas);
  
  return context.getImageData(0, 0, image.width, image.height);
}
