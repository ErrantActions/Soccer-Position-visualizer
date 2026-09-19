import { getRecommendedPosition } from '../engine/positioningEngine';
import type { Challenge } from './types';

const createChallenge = (
  id: string,
  playerRole: Challenge['playerRole'],
  playerRoleLabel: string,
  ballPosition: Challenge['ballPosition'],
  explanation: string,
  supportTeammate: Challenge['supportTeammate'],
  category: Challenge['category'] = 'Defending',
): Challenge => ({
  id,
  category,
  formation: '4-4-2',
  playerRole,
  playerRoleLabel,
  ballPosition,
  expectedPosition: getRecommendedPosition({ ball: ballPosition, position: playerRole }).idealPosition,
  explanation,
  supportTeammate,
});

export const CHALLENGES: Challenge[] = [
  createChallenge(
    'defending-wide-left',
    'LB',
    'Left Defender',
    { x: 0.8, y: 0.25 },
    'Stay between the ball and the goal while supporting your center back.',
    'LCB',
  ),
  createChallenge(
    'defending-wide-right',
    'RB',
    'Right Defender',
    { x: 0.77, y: 0.75 },
    'Close the space on your side, but stay goal side and connected to the back line.',
    'RCB',
  ),
  createChallenge(
    'defending-center',
    'LCB',
    'Left Center Back',
    { x: 0.55, y: 0.52 },
    'Protect the middle lane first so attackers cannot run straight to goal.',
    'RCB',
  ),
  createChallenge(
    'defending-shift',
    'RCB',
    'Right Center Back',
    { x: 0.66, y: 0.3 },
    'Tuck inside to protect the center and help your teammate challenge the ball.',
    'LCB',
  ),
  createChallenge(
    'midfield-screen',
    'CDM',
    'Defensive Midfielder',
    { x: 0.7, y: 0.5 },
    'Screen the center in front of your defenders so passes into danger are blocked.',
    'LCB',
    'Midfield Support',
  ),
];
