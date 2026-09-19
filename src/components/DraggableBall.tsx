import type { KeyboardEvent, PointerEvent } from 'react';
import type { DragState, NormalizedPoint } from '../types/soccer';
import { toPercent } from '../utils/coordinates';

type DraggableBallProps = {
  ball: NormalizedPoint;
  dragState: DragState;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

const DraggableBall = ({
  ball,
  dragState,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
}: DraggableBallProps) => {
  const pos = toPercent(ball);

  return (
    <button
      type="button"
      aria-label="Soccer ball. Drag to move position or use arrow keys."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
      onKeyDown={onKeyDown}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:cursor-grabbing"
      style={{ left: pos.left, top: pos.top, width: 44, height: 44, touchAction: 'none' }}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg ${
          dragState.isDragging ? 'ring-4 ring-cyan-300/50' : 'ring-2 ring-slate-950/10'
        }`}
      >
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
        <span className="absolute left-1.5 top-2 h-2 w-2 -rotate-12 rounded-[2px] bg-slate-900" />
        <span className="absolute right-1.5 top-2 h-2 w-2 rotate-12 rounded-[2px] bg-slate-900" />
        <span className="absolute left-2 bottom-1.5 h-2 w-2 rotate-6 rounded-[2px] bg-slate-900" />
        <span className="absolute right-2 bottom-1.5 h-2 w-2 -rotate-6 rounded-[2px] bg-slate-900" />
      </span>
    </button>
  );
};

export default DraggableBall;
