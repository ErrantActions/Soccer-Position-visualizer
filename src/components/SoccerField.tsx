import { useMemo, useRef } from 'react';
import type { KeyboardEventHandler, PointerEventHandler } from 'react';
import { useBallDrag } from '../hooks/useBallDrag';
import type { DisplaySettings, NormalizedPoint } from '../types/soccer';
import DraggableBall from './DraggableBall';
import { clamp01 } from '../utils/clamp';
import { toNormalizedPoint, toPercent } from '../utils/coordinates';
import type { TacticalRole, TeamTacticalResult } from '../engine/tactical';
import { ROLE_LABELS } from '../engine/tactical';

type SoccerFieldProps = {
  ball: NormalizedPoint;
  onBallChange: (point: NormalizedPoint) => void;
  model: TeamTacticalResult;
  selectedRole: TacticalRole;
  settings: DisplaySettings;
  mode?: 'explorer' | 'challenge';
  challengePlacement?: NormalizedPoint;
  onChallengePlacementChange?: (point: NormalizedPoint) => void;
  revealExpected?: boolean;
};

const responsibilityColors: Record<string, string> = {
  pressure: '#fb7185',
  cover: '#fbbf24',
  balance: '#38bdf8',
  shape: '#94a3b8',
};

const responsibilityLabels: Record<string, string> = {
  pressure: 'P',
  cover: 'C',
  balance: 'B',
  shape: 'S',
};

const playerFill = (selected: boolean, hidden: boolean) => {
  if (hidden) return 'rgba(0,0,0,0)';
  return selected ? 'url(#selectedPlayerGradient)' : 'url(#playerGradient)';
};

const SoccerField = ({
  ball,
  onBallChange,
  model,
  selectedRole,
  settings,
  mode = 'explorer',
  challengePlacement,
  onChallengePlacementChange,
  revealExpected = false,
}: SoccerFieldProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const challengePointerIdRef = useRef<number | null>(null);
  const drag = useBallDrag({ fieldRef, ball, onBallChange });
  const selectedResult = model.players.find((player) => player.player.role === selectedRole) ?? model.players[0];

  const compactnessBand = useMemo(() => {
    const ys = model.players.map((player) => player.finalPosition.y);
    return {
      top: Math.max(0.05, Math.min(...ys) - 0.06),
      bottom: Math.min(0.95, Math.max(...ys) + 0.06),
      backLine: model.compactness.lineDepths.back,
      midfieldLine: model.compactness.lineDepths.midfield,
      forwardLine: model.compactness.lineDepths.forward,
    };
  }, [model.compactness.lineDepths.back, model.compactness.lineDepths.forward, model.compactness.lineDepths.midfield, model.players]);

  const updateChallengePlacement = (clientX: number, clientY: number) => {
    if (!fieldRef.current || !onChallengePlacementChange) {
      return;
    }
    const point = toNormalizedPoint(clientX, clientY, fieldRef.current.getBoundingClientRect());
    onChallengePlacementChange({ x: clamp01(point.x), y: clamp01(point.y) });
  };

  const handlePlacementKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (!challengePlacement || !onChallengePlacementChange) {
      return;
    }
    const step = event.shiftKey ? 0.04 : 0.02;
    const delta = { x: 0, y: 0 };
    if (event.key === 'ArrowLeft') delta.x = -step;
    if (event.key === 'ArrowRight') delta.x = step;
    if (event.key === 'ArrowUp') delta.y = -step;
    if (event.key === 'ArrowDown') delta.y = step;
    if (delta.x === 0 && delta.y === 0) return;
    event.preventDefault();
    onChallengePlacementChange({ x: clamp01(challengePlacement.x + delta.x), y: clamp01(challengePlacement.y + delta.y) });
  };

  const handlePlacementPointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    challengePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateChallengePlacement(event.clientX, event.clientY);
  };

  const handlePlacementPointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (challengePointerIdRef.current !== event.pointerId) {
      return;
    }
    updateChallengePlacement(event.clientX, event.clientY);
  };

  const handlePlacementPointerRelease: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (challengePointerIdRef.current !== event.pointerId) {
      return;
    }
    challengePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    updateChallengePlacement(event.clientX, event.clientY);
  };

  const challengePct = challengePlacement ? toPercent(challengePlacement) : null;

  return (
    <section className="h-full w-full">
      <div className="flex h-full w-full items-center justify-center">
        <div
          ref={fieldRef}
          className="relative h-auto w-full max-h-full max-w-full touch-none select-none overflow-hidden rounded-2xl bg-[#0c4a2d] [aspect-ratio:3/2]"
        >
          <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full" aria-label="Soccer field tactical board">
            <defs>
              <linearGradient id="fieldSurface" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="playerGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="selectedPlayerGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="120" height="80" fill="#0f172a" />
            <rect x="1" y="1" width="118" height="78" fill="url(#fieldSurface)" stroke="#dcfce7" strokeWidth="0.8" rx="1.5" />
            {Array.from({ length: 6 }, (_, index) => (
              <rect key={index} x="1" y={1 + index * 13} width="118" height="6.5" fill={index % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'} />
            ))}
            <line x1="60" y1="1" x2="60" y2="79" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="60" cy="40" r="9" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="60" cy="40" r="0.7" fill="#dcfce7" />
            <rect x="1" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="1" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="101" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="112" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />

            {settings.showDangerMap
              ? model.dangerMap.map((cell) => (
                  <rect
                    key={`${cell.x}-${cell.y}`}
                    x={cell.x * 120 - 120 / 36 / 2}
                    y={cell.y * 80 - 80 / 24 / 2}
                    width={120 / 18}
                    height={80 / 12}
                    fill={`rgba(248,113,113,${cell.score * 0.24})`}
                  />
                ))
              : null}

            {settings.showWeakSideShading
              ? model.players.flatMap((player) =>
                  player.overlays.weakSideShade
                    ? [
                        <rect
                          key={`${player.player.id}-weak`}
                          x={player.overlays.weakSideShade.x * 120}
                          y={player.overlays.weakSideShade.y * 80}
                          width={player.overlays.weakSideShade.width * 120}
                          height={player.overlays.weakSideShade.height * 80}
                          fill="rgba(56, 189, 248, 0.12)"
                          stroke="rgba(56, 189, 248, 0.3)"
                          strokeDasharray="2 2"
                        />,
                      ]
                    : [],
                )
              : null}

            {settings.showCompactnessBands ? (
              <g>
                <rect
                  x="0"
                  y={compactnessBand.top * 80}
                  width="120"
                  height={(compactnessBand.bottom - compactnessBand.top) * 80}
                  fill="rgba(226,232,240,0.08)"
                  stroke="rgba(226,232,240,0.2)"
                />
                {[compactnessBand.backLine, compactnessBand.midfieldLine, compactnessBand.forwardLine]
                  .filter((value) => value > 0)
                  .map((value, index) => (
                    <line
                      key={`compact-${index}`}
                      x1={value * 120}
                      y1={compactnessBand.top * 80}
                      x2={value * 120}
                      y2={compactnessBand.bottom * 80}
                      stroke="rgba(250,204,21,0.5)"
                      strokeDasharray="3 2"
                    />
                  ))}
              </g>
            ) : null}

            {settings.showPassingLanes
              ? model.passingLanes.map((lane, index) => (
                  <line
                    key={`lane-${index}`}
                    x1={lane.from.x * 120}
                    y1={lane.from.y * 80}
                    x2={lane.to.x * 120}
                    y2={lane.to.y * 80}
                    stroke={`rgba(125, 211, 252, ${0.3 + lane.danger * 0.4})`}
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                ))
              : null}

            {settings.showSupportTriangles
              ? model.supportTriangles.map((triangle, index) => {
                  const trianglePlayers = triangle.playerIds
                    .map((id) => model.players.find((player) => player.player.id === id))
                    .filter((value): value is NonNullable<typeof value> => Boolean(value));
                  if (trianglePlayers.length !== 3) {
                    return null;
                  }
                  const [a, b, c] = trianglePlayers;
                  return (
                    <polygon
                      key={`triangle-${index}`}
                      points={`${a.finalPosition.x * 120},${a.finalPosition.y * 80} ${b.finalPosition.x * 120},${b.finalPosition.y * 80} ${c.finalPosition.x * 120},${c.finalPosition.y * 80}`}
                      fill="rgba(74, 222, 128, 0.08)"
                      stroke="rgba(74, 222, 128, 0.6)"
                      strokeDasharray="3 2"
                    />
                  );
                })
              : null}

            {settings.showGoalSideIndicators
              ? model.players.map((player) => (
                  <line
                    key={`${player.player.id}-goal-side`}
                    x1={player.finalPosition.x * 120}
                    y1={player.finalPosition.y * 80}
                    x2={player.overlays.goalSideSegment.to.x * 120}
                    y2={player.overlays.goalSideSegment.to.y * 80}
                    stroke="rgba(250,204,21,0.75)"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                ))
              : null}

            {settings.showDefensiveCones
              ? model.players
                  .filter((player) => player.player.line === 'back' || player.player.role === 'CDM')
                  .map((player) => (
                    <polygon
                      key={`${player.player.id}-cone`}
                      points={`${player.overlays.defensiveCone.apex.x * 120},${player.overlays.defensiveCone.apex.y * 80} ${player.overlays.defensiveCone.left.x * 120},${player.overlays.defensiveCone.left.y * 80} ${player.overlays.defensiveCone.right.x * 120},${player.overlays.defensiveCone.right.y * 80}`}
                      fill="rgba(248, 250, 252, 0.08)"
                      stroke="rgba(248, 250, 252, 0.35)"
                    />
                  ))
              : null}

            {model.players.map((player) => {
              const hiddenForChallenge = mode === 'challenge' && !revealExpected && player.player.role === selectedRole;
              return (
                <g key={player.player.id} opacity={hiddenForChallenge ? 0 : 1}>
                  <circle
                    cx={player.finalPosition.x * 120}
                    cy={player.finalPosition.y * 80}
                    r={player.player.role === selectedRole ? 4.5 : 3.8}
                    fill={playerFill(player.player.role === selectedRole, hiddenForChallenge)}
                    stroke={player.player.role === selectedRole ? '#fef3c7' : '#e0f2fe'}
                    strokeWidth={player.player.role === selectedRole ? 1.5 : 1}
                  />
                  <text
                    x={player.finalPosition.x * 120}
                    y={player.finalPosition.y * 80 + 0.6}
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="700"
                    fill={player.player.role === selectedRole ? '#0f172a' : '#ffffff'}
                  >
                    {player.player.role}
                  </text>
                  {settings.showPressureAssignments ? (
                    <g>
                      <rect
                        x={player.finalPosition.x * 120 - 4}
                        y={player.finalPosition.y * 80 - 8.2}
                        width="8"
                        height="4.2"
                        rx="1.5"
                        fill={responsibilityColors[player.responsibility]}
                      />
                      <text
                        x={player.finalPosition.x * 120}
                        y={player.finalPosition.y * 80 - 5.2}
                        textAnchor="middle"
                        fontSize="2.6"
                        fontWeight="700"
                        fill="#0f172a"
                      >
                        {responsibilityLabels[player.responsibility]}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}

            {mode === 'challenge' && revealExpected ? (
              <g>
                <circle
                  cx={selectedResult.finalPosition.x * 120}
                  cy={selectedResult.finalPosition.y * 80}
                  r="5.6"
                  fill="rgba(6, 182, 212, 0.18)"
                  stroke="rgba(165, 243, 252, 0.9)"
                  strokeDasharray="2 2"
                />
                <text
                  x={selectedResult.finalPosition.x * 120}
                  y={selectedResult.finalPosition.y * 80 - 6.8}
                  textAnchor="middle"
                  fontSize="2.8"
                  fontWeight="700"
                  fill="#cffafe"
                >
                  Correct {selectedRole}
                </text>
              </g>
            ) : null}
          </svg>

          <DraggableBall
            ball={ball}
            dragState={drag.dragState}
            onPointerDown={drag.handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
            onLostPointerCapture={drag.handleLostPointerCapture}
            onKeyDown={drag.handleKeyDown}
          />

          {mode === 'challenge' && challengePct ? (
            <button
              type="button"
              aria-label={`Move ${ROLE_LABELS[selectedRole]}`}
              onPointerDown={handlePlacementPointerDown}
              onPointerMove={handlePlacementPointerMove}
              onPointerUp={handlePlacementPointerRelease}
              onPointerCancel={handlePlacementPointerRelease}
              onKeyDown={handlePlacementKeyDown}
              className="absolute z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-100 bg-amber-500 font-bold text-slate-950 shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              style={{ left: challengePct.left, top: challengePct.top, touchAction: 'none' }}
            >
              You
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default SoccerField;
