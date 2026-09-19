import { useEffect, useMemo, useRef, useState } from 'react';
import DisplayControls from './components/DisplayControls';
import HeatmapLegend from './components/HeatmapLegend';
import PositionSelector from './components/PositionSelector';
import SoccerField from './components/SoccerField';
import { getRecommendedPosition } from './engine/positioningEngine';
import type { DisplaySettings, NormalizedPoint, PlayerPosition } from './types/soccer';

const createCenterBall = (): NormalizedPoint => ({ x: 0.5, y: 0.5 });

const defaultSettings: DisplaySettings = {
  showHeatmap: true,
  showBoundaries: true,
  showGuides: true,
  showBallLine: true,
};

function App() {
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition>('LB');
  const [ball, setBall] = useState<NormalizedPoint>(createCenterBall);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const positioning = useMemo(
    () => getRecommendedPosition({ ball, position: selectedPosition }),
    [ball, selectedPosition],
  );

  useEffect(() => {
    if (!isMenuOpen) {
      lastFocusedElementRef.current?.focus();
      return;
    }

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeMenuButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <SoccerField
        ball={ball}
        onBallChange={setBall}
        selectedPosition={selectedPosition}
        positioning={positioning}
        settings={settings}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto max-w-sm rounded-xl border border-white/10 bg-slate-950/78 px-4 py-3 text-slate-100 shadow-lg backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Soccer Positioning Visualizer</p>
          <p className="mt-1 text-lg font-semibold">{selectedPosition} defensive view</p>
          <p className="mt-1 text-sm text-slate-300">Drag the ball and use the menu to switch positions or overlays.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-expanded={isMenuOpen}
          aria-controls="field-settings-menu"
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-950/82 px-4 py-2 text-sm font-semibold text-slate-50 shadow-lg backdrop-blur-md transition hover:bg-slate-900/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <span aria-hidden="true">☰</span>
          Menu
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 sm:p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          {positioning.isOutsideNormalBoundary ? (
            <p className="pointer-events-auto rounded-xl border border-amber-300/60 bg-amber-400/15 px-4 py-3 text-sm text-amber-100 shadow-lg backdrop-blur-md">
              Covering outside the usual {selectedPosition} area.
            </p>
          ) : null}
          <div
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ring-1 ${
              positioning.shouldPressBall
                ? 'border-rose-300/60 bg-rose-500/15 text-rose-50 ring-rose-200/20'
                : 'border-slate-700 bg-slate-900/85 text-slate-100 ring-white/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                {positioning.shouldPressBall ? 'Pressure cue' : 'Shape cue'}
              </p>
              <p className={`text-sm ${positioning.shouldPressBall ? 'text-rose-100' : 'text-slate-300'}`}>
                Confidence {Math.round(positioning.confidence)}%
              </p>
            </div>
            <p className="mt-2 text-base font-semibold">{positioning.coachingCue}</p>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="absolute inset-0 z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <aside
            id="field-settings-menu"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-white/10 bg-slate-950/96 p-4 text-slate-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="field-settings-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Menu</p>
                <h1 id="field-settings-title" className="mt-1 text-2xl font-bold">
                  Field settings
                </h1>
                <p className="mt-1 text-sm text-slate-300">Change the defender, overlays, and ball state without leaving the field.</p>
              </div>
              <button
                ref={closeMenuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Close
              </button>
            </div>

            <PositionSelector value={selectedPosition} onChange={setSelectedPosition} />
            <DisplayControls
              settings={settings}
              onToggle={(key) => setSettings((current) => ({ ...current, [key]: !current[key] }))}
              onResetBall={() => setBall(createCenterBall())}
            />
            <HeatmapLegend />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default App;
