import { useEffect, useRef } from 'react';
import { POSITION_BOUNDARIES } from '../engine/positionBoundaries';
import { heatmapColorForScore, isPointInsidePositionBoundary, scorePosition } from '../engine/heatmapEngine';
import type { FieldDimensions, NormalizedPoint, PlayerPosition } from '../types/soccer';

type HeatmapCanvasProps = {
  ball: NormalizedPoint;
  position: PlayerPosition;
  dimensions: FieldDimensions;
  visible: boolean;
};

const HeatmapCanvas = ({ ball, position, dimensions, visible }: HeatmapCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const dpr = dimensions.dpr;
    canvas.width = Math.max(1, Math.floor(dimensions.width * dpr));
    canvas.height = Math.max(1, Math.floor(dimensions.height * dpr));

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
    context.clearRect(0, 0, dimensions.width, dimensions.height);

    if (!visible) {
      return;
    }

    const cols = 96;
    const rows = 64;
    const offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
      return;
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = (col + 0.5) / cols;
        const y = (row + 0.5) / rows;

        if (!isPointInsidePositionBoundary({ x, y }, position)) {
          continue;
        }

        const score = scorePosition({ x, y }, ball, position);
        offCtx.fillStyle = heatmapColorForScore(score);
        offCtx.fillRect(col, row, 1, 1);
      }
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const boundary = POSITION_BOUNDARIES[position];
    context.save();
    context.beginPath();
    boundary.points.forEach((point, index) => {
      const px = point.x * dimensions.width;
      const py = point.y * dimensions.height;

      if (index === 0) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py);
      }
    });
    context.closePath();
    context.clip();
    context.drawImage(offscreen, 0, 0, dimensions.width, dimensions.height);
    context.restore();
  }, [ball, dimensions.dpr, dimensions.height, dimensions.width, position, visible]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-10 ${visible ? 'block' : 'hidden'}`}
      aria-hidden="true"
    />
  );
};

export default HeatmapCanvas;
