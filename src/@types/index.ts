type Vec2 = [number, number];

type Circle = {
  x: number
  y: number
  radius: number
  color: string
}

type Line = {
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  color: number
}

type Ball = Circle & {
  mass: number
  velocity: Vec2
}