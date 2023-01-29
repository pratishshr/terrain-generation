import { OneMinusDstAlphaFactor } from 'three';

function evaluate(value) {
  let a = 3;
  let b = 2.2;

  return Math.pow(value, a) / (Math.pow(value, a) + Math.pow(b - b * value, a));
}

export function generateFallOffMap(size) {
  let map = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let x = (i / size) * 2 - 1;
      let y = (j / size) * 2 - 1;

      let value = Math.max(Math.abs(x), Math.abs(y));

      if (map[i] === undefined) {
        map[i] = [];
      }

      map[i][j] = evaluate(value);
    }
  }

  return map;
}
