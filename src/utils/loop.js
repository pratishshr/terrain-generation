export async function withSpiralLoop(X, Y, callback) {
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;
  for (let i = 0; i < Math.max(X, Y) ** 2; i++) {
    if (-X / 2 < x && x <= X / 2 && -Y / 2 < y && y <= Y / 2) {
      await callback(x, y);
    }

    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      [dx, dy] = [-dy, dx];
    }
    x += dx;
    y += dy;
  }
}
