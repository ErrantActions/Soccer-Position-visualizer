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
        className={`mb-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow ${
          result.shouldPressBall ? 'bg-rose-500/90 text-white' : 'bg-slate-900/80 text-cyan-100'
        }`}
      >
        {result.shouldPressBall ? 'Press' : 'Shape'}
      </div>
      <div
        className={`relative grid h-12 w-12 place-items-center rounded-full border-2 text-xs font-bold text-white shadow-xl ${
          result.isOutsideNormalBoundary
            ? 'border-amber-100 bg-linear-to-br from-amber-300 to-amber-600 ring-4 ring-amber-300/30'
            : 'border-cyan-100 bg-linear-to-br from-sky-400 to-blue-700 ring-4 ring-cyan-300/40 motion-safe:animate-pulse'
        }`}
      >
        <span className="absolute inset-[5px] rounded-full border border-white/25" />
        {position}
      </div>
    </div>
  );
};

export default RecommendedPlayer;
