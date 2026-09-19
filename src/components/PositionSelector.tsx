import type { PlayerPosition } from '../types/soccer';

const POSITION_LABELS: Record<PlayerPosition, string> = {
  LB: 'Left Back',
  LCB: 'Left Center Back',
  RCB: 'Right Center Back',
  RB: 'Right Back',
  CDM: 'Defensive Midfielder',
};

type PositionSelectorProps = {
  value: PlayerPosition;
  onChange: (position: PlayerPosition) => void;
};

const POSITION_ORDER: PlayerPosition[] = ['LB', 'LCB', 'RCB', 'RB', 'CDM'];

const PositionSelector = ({ value, onChange }: PositionSelectorProps) => {
  return (
    <section aria-label="Position selector" className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {POSITION_ORDER.map((position) => {
          const selected = position === value;
          return (
            <button
              key={position}
              type="button"
              onClick={() => onChange(position)}
              aria-pressed={selected}
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                selected
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              }`}
            >
              <span className="block">{position}</span>
              <span className="block text-[11px] opacity-90">{POSITION_LABELS[position]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PositionSelector;
