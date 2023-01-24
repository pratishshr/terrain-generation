export function getRGB(value) {
  // Ensure input is between 0 and 1
  value = Math.max(0, Math.min(1, value));
  // Calculate the RGB values
  let r = Math.round(255 * value);
  let g = Math.round(255 * value);
  let b = Math.round(255 * value);
  
  return [r, g, b];
}
