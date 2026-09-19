import type { PlayerPosition, PositioningResult } from '../types/soccer';
import { toPercent } from '../utils/coordinates';

type RecommendedPlayerProps = {
  position: PlayerPosition;
  result: PositioningResult;
};

const RecommendedPlayer = ({ position, result }: RecommendedPlayerProps) => {
  const pos = toPercent(result.idealPosition);

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
      aria-label="Recommended player marker"
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-full border-2 text-xs font-bold text-white shadow-lg ${
          result.isOutsideNormalBoundary
            ? 'border-amber-200 bg-amber-500/90 ring-4 ring-amber-300/30'
            : 'border-cyan-100 bg-sky-600/95 ring-4 ring-cyan-300/40 motion-safe:animate-pulse'
        }`}
      >
        {position}
      </div>
    </div>
  );
};

export default RecommendedPlayer;
