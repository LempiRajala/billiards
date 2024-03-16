import React, { MouseEventHandler, useEffect, useRef, useState } from "react"
import { Vec2SubVec2, Vec2SumVec2, checkAndHandleBorderCollision, checkCollision, findBallByPos, handleCollision } from "../utils";
import { LeftMouseButton, RightMouseButton, physicsUpdatePerSecond } from "../const";
import Canvas from "./Canvas";

export default function Board({
  balls
}: {
  balls: Ball[]
}) {
  const [size, setSize] = useState<Vec2>([window.innerWidth, window.innerHeight]);
  const [pulseLine, setPulseLine] = useState<Line | null>(null);
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);

  useEffect(() => {
    window.addEventListener('resize', () => setSize([window.innerWidth, window.innerHeight]));
  }, []);

  useEffect(() => {
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
  }, [balls, selectedBall]);

  const onmove = (mouseX: number, mouseY: number) => {
    if(selectedBall) {
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
      if(btn === LeftMouseButton) {
        setSelectedBall(balls[selectedBall]);
      }
  
      if(btn === RightMouseButton) {
        // todo
      }
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

  if(size[0] !== window.innerWidth || size[1] !== window.innerHeight) {
    setSize([window.innerWidth, window.innerHeight]);
  }

  return (
    <Canvas
      balls={balls} lines={pulseLine ? [pulseLine] : []}
      width={size[0]} height={size[1]}
      ondown={ondown}
      onmove={onmove}
      onup={onup}/>
  )
}