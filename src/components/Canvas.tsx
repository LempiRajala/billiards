import { useEffect, useMemo, useRef } from "react";

export default function Canvas({
  width, height, balls, lines,
  onmove, ondown, onup
}: {
  width: number, height: number,
  balls: Ball[], lines: Line[],
  onmove: (x: number, y: number) => void,
  ondown: (x: number, y: number, btn: number) => void,
  onup: (x: number, y: number, btn: number) => void
}) {
  const root = useRef<HTMLCanvasElement | null>(null);
  const ctx = useMemo(() => root.current?.getContext('2d') ?? null, [root.current]);

  useEffect(() => {
    let stop = false;
    (function gloop() {
      const ctx = root.current?.getContext('2d');
      if(ctx) {
        ctx.clearRect(0, 0, width, height);
        balls.forEach(({ x, y, radius, color }) => {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = 'grey';
          ctx.stroke();
        });
  
        lines.forEach(line => {
          ctx.beginPath();
          ctx.strokeStyle = `#${line.color.toString(16)}`;
          ctx.lineWidth = line.width;
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();
        });
      }

      !stop && requestAnimationFrame(gloop);
    })();

    return () => void (stop = true);
  }, [ctx, balls, lines]);

  return <canvas
    onMouseMove={e => onmove(e.clientX, e.clientY)}
    onMouseDown={e => ondown(e.clientX, e.clientY, e.button)}
    onMouseUp={e => onup(e.clientX, e.clientY, e.button)}
    onContextMenu={e => e.preventDefault()}
    ref={root} width={width} height={height}></canvas>;
}