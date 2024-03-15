import { useState } from 'react'
import Board from './components/Board'
import { LeftMouseButton, PI2, RightMouseButton } from './const';
import { Vec2SubVec2, findBallByPos } from './utils';

const initialBalls: Ball[] = [];
for(let angle = 0; angle <= PI2; angle += PI2 / 6) {
  const spawnRadius = Math.min(window.innerWidth, window.innerHeight) / 4;
  const center = [window.innerWidth / 2, window.innerHeight / 2];
  initialBalls.push({
    x: center[0] + spawnRadius * Math.sin(angle),
    y: center[1] + spawnRadius * Math.cos(angle),
    radius: 15,
    color: 0xff0000,
    mass: 10, velocity: [0, 0] });
}

// [
//   { x: 500, y: 200, radius: 40, mass: 10, color: 0xff0000, velocity: [0, 0] },
//   { x: 200, y: 200, radius: 40, mass: 10, color: 0xff0000, velocity: [30, 0] }
// ];

function App() {
  const [balls] = useState(initialBalls);
  const [ballForPulse, setBallForPulse] = useState<number>(-1);
  const [arrow, setArrow] = useState([-1, [0, 0]] as [number, Vec2]);

  const onmove = (mouseX: number, mouseY: number) => {
    setArrow([ballForPulse, [mouseX, mouseY]]);
  }

  const ondown = (x: number, y: number, btn: number) => {
    if(btn === LeftMouseButton) {
      const ball = findBallByPos(balls, [x, y]);
      setBallForPulse(ball);
    }

    if(btn === RightMouseButton) {
      // todo
    }
  }

  const onup = (x: number, y: number, btn: number) => {
    if(btn === LeftMouseButton && arrow[0] !== -1) {
      const ball = balls[arrow[0]];
      const velocity = [
        arrow[1][0] - ball.x,
        arrow[1][1] - ball.y] as Vec2;
      ball.velocity = Vec2SubVec2(ball.velocity, velocity);
      setBallForPulse(-1);
    }
  }

  return (
    <>
      <Board balls={balls} arrow={arrow} onmove={onmove} onmousedown={ondown} onmouseup={onup}/>
    </>
  )
}

export default App
