export const between = (min: number, x: number, max: number) => x >= min && x <= max;

export const limit = (min: number, x: number, max: number) => {
  if(x < min) {
    return min;
  }

  if(x > max) {
    return max;
  }

  return x;
}

export const sq = (x: number) => x * x;

export const Vec2MulNum = (v: Vec2, n: number): Vec2 => [v[0] * n, v[1] * n];

export const Vec2DivNum = (v: Vec2, n: number) => Vec2MulNum(v, 1 / n);

export const Vec2SumVec2 = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] + v2[0], v1[1] + v2[1]];

export const Vec2SubVec2 = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] - v2[0], v1[1] - v2[1]];

export const checkCollision = (b1: Ball, b2: Ball) => {
  const rsumsq = sq(b1.radius + b2.radius);
  const distsq = sq(b1.x - b2.x) + sq(b1.y - b2.y);
  return distsq <= rsumsq;
}

export const handleCollision = (b1: Ball, b2: Ball) => {
  const sMass = b1.mass + b2.mass;
  const dMass = b1.mass - b2.mass;
  const v1 = (
    Vec2DivNum(
      Vec2SumVec2(
        Vec2MulNum(b1.velocity, +dMass),
        Vec2MulNum(b2.velocity, 2 * b2.mass)),
      sMass));
  const v2 = (
    Vec2DivNum(
      Vec2SumVec2(
        Vec2MulNum(b2.velocity, -dMass),
        Vec2MulNum(b1.velocity, 2 * b1.mass)),
      sMass));
  b1.velocity = v1;
  b2.velocity = v2;
}

export const checkAndHandleBorderCollision = (b: Ball, [right, bottom]: Vec2) => {
  if(b.x - b.radius < 0) {
    b.velocity[0] = +Math.abs(b.velocity[0]);
  }

  if(b.x + b.radius > right) {
    b.velocity[0] = -Math.abs(b.velocity[0]);
  }

  if(b.y - b.radius < 0) {
    b.velocity[1] = +Math.abs(b.velocity[1]);
  }
  
  if(b.y + b.radius > bottom) {
    b.velocity[1] = -Math.abs(b.velocity[1]);
  }
  
  b.x = limit(b.radius, b.x, right  - b.radius);
  b.y = limit(b.radius, b.y, bottom - b.radius);
}

export const findBallByPos = (balls: Ball[], pos: Vec2) => (
  balls.findIndex(({ x, y, radius }) => (
    between(x - radius, pos[0], x + radius) &&
    between(y - radius, pos[1], y + radius))));