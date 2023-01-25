export function getRGB(value) {
  // Ensure input is between 0 and 1
  value = Math.max(0, Math.min(1, value));
  // Calculate the RGB values
  let r = Math.round(255 * value);
  let g = Math.round(255 * value);
  let b = Math.round(255 * value);

  return [r, g, b];
}

export function getValueFromRGB(rgb) {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;
  let value = (r + g + b) / 3;

  return value;
}
export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

