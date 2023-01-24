export function lerp(x, a, b) {
  return x * (b - a) + a;
}

export function sat(x) {
  return Math.min(Math.max(x, 0.0), 1.0);
}

export function clamp(x, a, b) {
  return Math.min(Math.max(x, a), b);
}
