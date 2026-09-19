import { Canvas, Rect } from '@shopify/react-native-skia';
import { getHeatmapCells, heatmapColorForScore } from '../../../../packages/core/src/engine/heatmapEngine';
import type { NormalizedPoint, PlayerPosition } from '../../../../packages/core/src/types/soccer';

type HeatmapOverlayProps = {
  ball: NormalizedPoint;
  position: PlayerPosition;
  width: number;
  height: number;
  visible: boolean;
};

const HEATMAP_COLS = 36;
const HEATMAP_ROWS = 24;

const HeatmapOverlay = ({ ball, position, width, height, visible }: HeatmapOverlayProps) => {
  if (!visible || width <= 0 || height <= 0) {
    return null;
  }

  const cells = getHeatmapCells(ball, position, HEATMAP_COLS, HEATMAP_ROWS);
  const cellWidth = width / HEATMAP_COLS;
  const cellHeight = height / HEATMAP_ROWS;

  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      {cells.map((cell) => (
        <Rect
          key={`${cell.x}-${cell.y}`}
          x={(cell.x * HEATMAP_COLS - 0.5) * cellWidth}
          y={(cell.y * HEATMAP_ROWS - 0.5) * cellHeight}
          width={cellWidth + 0.5}
          height={cellHeight + 0.5}
          color={heatmapColorForScore(cell.score)}
        />
      ))}
    </Canvas>
  );
};

export default HeatmapOverlay;
