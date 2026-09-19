import type { DisplaySettings } from '../types/soccer';

type DisplayControlsProps = {
  settings: DisplaySettings;
  onToggle: (key: keyof DisplaySettings) => void;
  onResetBall: () => void;
};

const DisplayControls = ({ settings, onToggle, onResetBall }: DisplayControlsProps) => {
  const toggleDefinitions: Array<{ key: keyof DisplaySettings; label: string }> = [
    { key: 'showHeatmap', label: 'Show Heatmap' },
    { key: 'showBoundaries', label: 'Show Position Boundaries' },
    { key: 'showGuides', label: 'Show Tactical Guides' },
    { key: 'showBallLine', label: 'Show Ball to Player Line' },
  ];

  return (
    <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10" aria-label="Display controls">
      <div className="grid gap-2 sm:grid-cols-2">
        {toggleDefinitions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={settings[key]}
            onClick={() => onToggle(key)}
            className={`min-h-11 rounded-lg px-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
              settings[key] ? 'bg-emerald-500/80 text-slate-950' : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onResetBall}
        className="mt-3 min-h-11 w-full rounded-lg bg-cyan-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        Reset Ball
      </button>
    </section>
  );
};

export default DisplayControls;
