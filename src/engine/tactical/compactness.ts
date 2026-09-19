import { clamp } from '../../utils/clamp';
import type { ActivePlayer, LineSpacingDiagnostics, TacticalContext, UnitLine } from './types';
import type { NormalizedPoint } from '../../types/soccer';

const lines: UnitLine[] = ['goalkeeper', 'back', 'midfield', 'forward'];

export const measureCompactness = (players: ActivePlayer[], positions: Record<string, NormalizedPoint>): LineSpacingDiagnostics => {
  const lineDepths = lines.reduce<Record<UnitLine, number>>((acc, line) => {
    const linePlayers = players.filter((player) => player.line === line);
    acc[line] = linePlayers.length === 0 ? 0 : linePlayers.reduce((sum, player) => sum + positions[player.id].x, 0) / linePlayers.length;
    return acc;
  }, { goalkeeper: 0, back: 0, midfield: 0, forward: 0 });

  const xs = players.map((player) => positions[player.id].x);
  const ys = players.map((player) => positions[player.id].y);
  const verticalCompactness = xs.length === 0 ? 100 : clamp(100 - (Math.max(...xs) - Math.min(...xs)) * 100, 0, 100);
  const horizontalCompactness = ys.length === 0 ? 100 : clamp(100 - (Math.max(...ys) - Math.min(...ys)) * 80, 0, 100);

  return { verticalCompactness, horizontalCompactness, lineDepths };
};

export const getCompactnessTarget = (
  player: ActivePlayer,
  positions: Record<string, NormalizedPoint>,
  context: TacticalContext,
): NormalizedPoint => {
  const teammates = Object.values(positions);
  const avgX = teammates.reduce((sum, point) => sum + point.x, 0) / teammates.length;
  const avgY = teammates.reduce((sum, point) => sum + point.y, 0) / teammates.length;
  const lineOffset = player.line === 'forward' ? 0.12 : player.line === 'midfield' ? 0.03 : player.line === 'back' ? -0.06 : -0.16;
  const sidePull = player.side === 'left' ? -0.12 : player.side === 'right' ? 0.12 : 0;
  const ballPull = (context.ball.y - 0.5) * 0.12;

  return {
    x: clamp(avgX + lineOffset, 0, 1),
    y: clamp(avgY + sidePull + ballPull * 0.5, 0, 1),
  };
};
