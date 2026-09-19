import type { TacticalRole } from '../engine/tactical';
import { ROLE_LABELS } from '../engine/tactical';

type PositionSelectorProps = {
  value: TacticalRole;
  options: TacticalRole[];
  onChange: (position: TacticalRole) => void;
  title?: string;
};

const PositionSelector = ({ value, options, onChange, title = 'Learner role' }: PositionSelectorProps) => {
  return (
    <section aria-label="Position selector" className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{title}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((position) => {
          const selected = position === value;
          return (
            <button
              key={position}
              type="button"
              onClick={() => onChange(position)}
              aria-pressed={selected}
              className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                selected
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              }`}
            >
              <span className="block">{position}</span>
              <span className="block text-[11px] opacity-90">{ROLE_LABELS[position]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PositionSelector;
