import { useEffect, useState } from 'react';
import ChallengeMode from './components/ChallengeMode';
import PositionExplorerMode from './components/PositionExplorerMode';

type AppMode = 'explorer' | 'challenge';

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
};

const App = () => {
  const [mode, setMode] = useState<AppMode>('explorer');
  const [showOrientationHint, setShowOrientationHint] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const controlsDrawerId = mode === 'explorer' ? 'position-explorer-drawer' : 'challenge-mode-drawer';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px) and (orientation: portrait)');
    const legacyMedia = media as LegacyMediaQueryList;
    const update = () => setShowOrientationHint(media.matches);

    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => {
        media.removeEventListener('change', update);
      };
    }

    if (typeof legacyMedia.addListener === 'function' && typeof legacyMedia.removeListener === 'function') {
      legacyMedia.addListener(update);
      return () => {
        legacyMedia.removeListener?.(update);
      };
    }

    return undefined;
  }, []);

  const requestLandscape = async () => {
    if (!('orientation' in screen) || !('lock' in screen.orientation)) {
      return;
    }

    try {
      await screen.orientation.lock('landscape');
    } catch {
      // Some mobile browsers block orientation lock entirely; keep the app usable.
    }
  };

  return (
    <div className="min-h-dvh w-full overflow-hidden bg-radial-[at_10%_0%] from-cyan-900/30 via-slate-950 to-slate-950 p-2 sm:p-3 md:p-4">
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-[1400px] flex-col gap-3 md:min-h-[calc(100dvh-2rem)]">
        <header className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Soccer Positioning Visualizer</p>
              <h1 className="text-lg font-bold text-slate-50 sm:text-xl">Learn shape, spacing, and goal-side defending</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('explorer')}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition ${
                  mode === 'explorer' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                }`}
              >
                Position Explorer
              </button>
              <button
                type="button"
                onClick={() => setMode('challenge')}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition ${
                  mode === 'challenge' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                }`}
              >
                Challenge Mode
              </button>
              <button
                type="button"
                onClick={() => setControlsOpen((current) => !current)}
                aria-expanded={controlsOpen}
                aria-controls={controlsDrawerId}
                className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {controlsOpen ? 'Hide Menu' : 'Menu'}
              </button>
            </div>
          </div>
          {showOrientationHint ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
              <span>For more field space, rotate your phone to landscape.</span>
              <button
                type="button"
                onClick={requestLandscape}
                className="rounded-md bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-950"
              >
                Try Landscape
              </button>
            </div>
          ) : null}
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {mode === 'explorer' ? (
            <PositionExplorerMode isControlsOpen={controlsOpen} onCloseControls={() => setControlsOpen(false)} />
          ) : (
            <ChallengeMode isControlsOpen={controlsOpen} onCloseControls={() => setControlsOpen(false)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
