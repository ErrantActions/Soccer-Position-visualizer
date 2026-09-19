import { useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import DisplayControls from './components/DisplayControls';
import HeatmapLegend from './components/HeatmapLegend';
import PositionSelector from './components/PositionSelector';
import SoccerField from './components/SoccerField';
import { getRecommendedPosition } from './engine/positioningEngine';
import type { DisplaySettings, NormalizedPoint, PlayerPosition } from './types/soccer';

const CENTER_BALL: NormalizedPoint = { x: 0.5, y: 0.5 };

const defaultSettings: DisplaySettings = {
  showHeatmap: true,
  showBoundaries: true,
  showGuides: true,
  showBallLine: true,
};

function App() {
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition>('LB');
  const [ball, setBall] = useState<NormalizedPoint>(CENTER_BALL);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);

  const positioning = useMemo(
    () => getRecommendedPosition({ ball, position: selectedPosition }),
    [ball, selectedPosition],
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-3 sm:p-4">
      <AppHeader />
      <PositionSelector value={selectedPosition} onChange={setSelectedPosition} />

      <SoccerField
        ball={ball}
        onBallChange={setBall}
        selectedPosition={selectedPosition}
        positioning={positioning}
        settings={settings}
      />

      {positioning.isOutsideNormalBoundary ? (
        <p className="rounded-lg border border-amber-300/60 bg-amber-400/15 px-3 py-2 text-sm text-amber-100">
          Covering outside the usual {selectedPosition} area.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <DisplayControls
          settings={settings}
          onToggle={(key) => setSettings((current) => ({ ...current, [key]: !current[key] }))}
          onResetBall={() => setBall(CENTER_BALL)}
        />
        <HeatmapLegend />
      </div>
    </div>
  );
}

export default App;
