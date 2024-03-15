import React, { MouseEventHandler, useEffect, useRef, useState } from "react"
import { checkAndHandleBorderCollision, checkCollision, handleCollision } from "../utils";
import { physicsUpdatePerSecond } from "../const";


export default function Board({
  onmove, onmousedown, onmouseup, balls, arrow
}: {
  onmove: (x: number, y: number) => void,
  onmousedown: (x: number, y: number, btn: number) => void,
  onmouseup: (x: number, y: number, btn: number) => void,
  balls: Ball[], arrow: [number, Vec2]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<Vec2>([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    if(canvasRef.current) {
      setCtx(canvasRef.current.getContext("2d") as CanvasRenderingContext2D);
    }
  }, [canvasRef]);

  useEffect(() => {
    if(!ctx) return;

    let stop = false;
    (function gloop() {
      ctx.clearRect(0, 0, size[0], size[1]);
      balls.forEach(({ x, y, radius, color }) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `#${color.toString(16)}`;
        ctx.fill();
      });

      if(arrow[0] !== -1) {
        const ball = balls[arrow[0]];
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(...arrow[1]);
        ctx.stroke();
      }

      !stop && requestAnimationFrame(gloop);
    })();

    return () => void (stop = true);
  }, [ctx, balls, arrow]);

  useEffect(() => {
    if(ctx) {
      ctx.canvas.width = size[0];
      ctx.canvas.height = size[1];
    }
  }, [ctx, size]);

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
      !stop && setTimeout(phloop, Math.max(0, 1e3 / physicsUpdatePerSecond - calcTime));
    })();

    return () => void (stop = true);
  }, []);

  if(size[0] !== window.innerWidth || size[1] !== window.innerHeight) {
    setSize([window.innerWidth, window.innerHeight]);
  }

  return (
    <canvas ref={canvasRef}
      onMouseMove={e => onmove(e.clientX, e.clientY)}
      onMouseDown={e => onmousedown(e.clientX, e.clientY, e.button)}
      onMouseUp={e => onmouseup(e.clientX, e.clientY, e.button)}></canvas>
  )
}