import React, { MouseEventHandler, useEffect, useRef, useState } from "react"
import { Vec2SubVec2, Vec2SumVec2, checkAndHandleBorderCollision, checkCollision, findBallByPos, handleCollision } from "../utils";
import { LeftMouseButton, RightMouseButton, physicsUpdatePerSecond } from "../const";
import Canvas from "./Canvas";
import ColorSelect from "./ColorSelect";

export default function Board({
  balls
}: {
  balls: Ball[]
}) {
  const [size, setSize] = useState<Vec2>([window.innerWidth, window.innerHeight]);
  const [pulseLine, setPulseLine] = useState<Line | null>(null);
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [colorSelectPos, setColorSelectPos] = useState<Vec2 | null>(null);

  useEffect(() => {
    window.addEventListener('resize', () => setSize([window.innerWidth, window.innerHeight]));
  }, []);

  useEffect(() => {
    if(colorSelectPos) return;

    let stop = false;
    let lastStart = performance.now();
    (function phloop() {
      const start = performance.now();

      // столкновения шаров
      for(let i = 0; i !== balls.length - 1; i++) {
        const inth = balls[i];
        for(let j = i + 1; j !== balls.length; j++) {
          const jnth = balls[j];
          if(checkCollision(inth, jnth)) {
            handleCollision(jnth, inth);
          }
        }
      }

      //столкновения со стенами
      balls.forEach(b => checkAndHandleBorderCollision(b, size));

      // расчет позиции от скорости
      const deltaTime = (start - lastStart) / 1e3; // в секундах
      balls.forEach(b => (
        b.x += b.velocity[0] * deltaTime,
        b.y += b.velocity[1] * deltaTime));

      const calcTime = performance.now() - start;
      lastStart = start;

      // обновление координат пульса если таковой есть
      if(selectedBall) {
        setPulseLine(line => line && {
          x1: line.x1,
          y1: line.y1,
          x2: selectedBall.x,
          y2: selectedBall.y,
          width: 1,
          color: 0xfff
        });
      }

      !stop && setTimeout(phloop, Math.max(0, 1e3 / physicsUpdatePerSecond - calcTime));
    })();

    return () => void (stop = true);
  }, [balls, selectedBall, colorSelectPos]);

  const onmove = (mouseX: number, mouseY: number) => {
    if(selectedBall && pulseLine) {
      setPulseLine({
        x1: mouseX,
        y1: mouseY,
        x2: selectedBall.x,
        y2: selectedBall.y,
        width: 1,
        color: 0xfff
      });
    }
  }

  const ondown = (x: number, y: number, btn: number) => {
    const selectedBall = findBallByPos(balls, [x, y]);
    if(selectedBall !== -1) {
      const ball = balls[selectedBall];

      if(btn === LeftMouseButton) {
        setSelectedBall(ball);
        setPulseLine({
          x1: x,
          y1: y,
          x2: ball.x,
          y2: ball.y,
          width: 1,
          color: 0xfff
        });
      }
  
      if(btn === RightMouseButton) {
        setColorSelectPos([ball.x, ball.y]);
        setSelectedBall(ball);
      }
    }

    if(colorSelectPos) {
      setColorSelectPos(null);
    }
  }

  const onup = (x: number, y: number, btn: number) => {
    if(btn === LeftMouseButton && pulseLine && selectedBall) {
      const velocity = [
        pulseLine.x2 - pulseLine.x1,
        pulseLine.y2 - pulseLine.y1] as Vec2;
      selectedBall.velocity = Vec2SumVec2(selectedBall.velocity, velocity);
      setSelectedBall(null);
      setPulseLine(null);
    }
  }

  const onSelectColor = (color: string) => {
    if(selectedBall) {
      selectedBall.color = color;
      setSelectedBall(null);
      setColorSelectPos(null);
    }
  }

  return (
    <>
      { colorSelectPos &&
        <ColorSelect onSelect={onSelectColor} x={colorSelectPos[0]} y={colorSelectPos[1]}/>
      }
      <Canvas
        balls={balls} lines={pulseLine ? [pulseLine] : []}
        width={size[0]} height={size[1]}
        ondown={ondown}
        onmove={onmove}
        onup={onup}/>
    </>
  )
}