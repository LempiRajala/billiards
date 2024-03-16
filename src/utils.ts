import { PI2, colors, pulseFading, pulseFadingFactor } from "./const";

export const between = (min: number, x: number, max: number) => x >= min && x <= max;

export const getSign = (x: number) => x < 0 ? -1 : x > 0 ? +1 : 0;

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

export const fadeVelocity = (vel: Vec2): Vec2 => [
    Math.max(0, Math.abs(vel[0] * pulseFadingFactor) - pulseFading) * getSign(vel[0]),
    Math.max(0, Math.abs(vel[1] * pulseFadingFactor) - pulseFading) * getSign(vel[1])];

// export const fadeVelocity = (vel: Vec2, fading = pulseFading): Vec2 => [vel[0] * fading, vel[1] * fading];

export const checkCollision = (b1: Ball, b2: Ball) => {
  const rsumsq = sq(b1.radius + b2.radius);
  const distsq = sq(b1.x - b2.x) + sq(b1.y - b2.y);
  return distsq <= rsumsq;
}

export const handleCollision = (b1: Ball, b2: Ball) => {
  // считаем итоговый импульс
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

  // считаем затухание импульса
  b1.velocity = fadeVelocity(b1.velocity);
  b2.velocity = fadeVelocity(b2.velocity);

  // пытаемся устранить слипание шаров
  const repulsionFactor = 0.5;
  const repulsionVec = Vec2MulNum(Vec2SubVec2([b1.x, b1.y], [b2.x, b2.y]), repulsionFactor);
  b1.velocity = Vec2SumVec2(b1.velocity, repulsionVec);
  b2.velocity = Vec2SubVec2(b2.velocity, repulsionVec);
}

export const checkAndHandleBorderCollision = (b: Ball, [right, bottom]: Vec2) => {
  if(b.x - b.radius < 0) {
    b.velocity[0] = +Math.abs(b.velocity[0]);
    b.velocity = fadeVelocity(b.velocity);
  }

  if(b.x + b.radius > right) {
    b.velocity[0] = -Math.abs(b.velocity[0]);
    b.velocity = fadeVelocity(b.velocity);
  }

  if(b.y - b.radius < 0) {
    b.velocity[1] = +Math.abs(b.velocity[1]);
    b.velocity = fadeVelocity(b.velocity);
  }
  
  if(b.y + b.radius > bottom) {
    b.velocity[1] = -Math.abs(b.velocity[1]);
    b.velocity = fadeVelocity(b.velocity);
  }
  
  b.x = limit(b.radius, b.x, right  - b.radius);
  b.y = limit(b.radius, b.y, bottom - b.radius);
}

export const findBallByPos = (balls: Ball[], pos: Vec2) => (
  balls.findIndex(({ x, y, radius }) => (
    between(x - radius, pos[0], x + radius) &&
    between(y - radius, pos[1], y + radius))));

export const getRandomElement = <T>(arr: T[]) => arr[~~(Math.random() * arr.length)];

export const randomColor = () => getRandomElement(colors);

export const radiusFromArea = (area: number) => Math.sqrt(area / Math.PI);

export const spawnBalls = (number: number) => {
  const result: Ball[] = [];
  for(let i = 0; i !== number; i++) {
    const angle = PI2 / number * i;
    const spawnRadius = Math.min(window.innerWidth, window.innerHeight) / 4;
    const center = [window.innerWidth / 2, window.innerHeight / 2];
    const mass = Math.random() * 1e2 + 5e2;
    result.push({
      x: center[0] + spawnRadius * Math.sin(angle),
      y: center[1] + spawnRadius * Math.cos(angle),
      radius: radiusFromArea(mass),
      color: randomColor(),
      mass,
      velocity: [0, 0] });
  }
  return result;
}