import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEventHandler } from 'react';
import { CHALLENGES } from '../challenge/challenges';
import { scoreChallenge } from '../challenge/scoring';
import { BADGES, createDefaultProfile, createDefaultProgress, loadProfile, loadProgress, saveProfile, saveProgress } from '../challenge/storage';
import type { BadgeId, ChallengeProgress, PlayerProfile } from '../challenge/types';
import { POSITION_PROFILES } from '../engine/positionProfiles';
import { getRecommendedPosition } from '../engine/positioningEngine';
import type { NormalizedPoint, PlayerPosition } from '../types/soccer';
import { clamp01 } from '../utils/clamp';
import { toNormalizedPoint, toPercent } from '../utils/coordinates';

const MODE_LABELS: Record<PlayerPosition, string> = {
  LB: 'Left Defender',
  LCB: 'Left Center Back',
  RCB: 'Right Center Back',
  RB: 'Right Defender',
  CDM: 'Defensive Midfielder',
};

const getStartingSpot = (position: PlayerPosition): NormalizedPoint => ({
  x: POSITION_PROFILES[position].baseX,
  y: POSITION_PROFILES[position].baseY,
});

const updateBadges = (progress: ChallengeProgress): BadgeId[] => {
  const badges = new Set(progress.badges);

  if (progress.completedChallengeIds.length >= 1) {
    badges.add('first-challenge-complete');
  }

  const strongScores = Object.values(progress.bestScores).filter((score) => score >= 80).length;
  if (strongScores >= 3) {
    badges.add('defensive-wall');
  }

  if (progress.goalSidePerfectChallengeIds.length >= 3) {
    badges.add('goal-side-master');
  }

  if (progress.totalScore >= 400) {
    badges.add('positioning-pro');
  }

  return [...badges];
};

const ChallengeMode = () => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLButtonElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  const [profile, setProfile] = useState<PlayerProfile>(() => createDefaultProfile());
  const [progress, setProgress] = useState<ChallengeProgress>(() => createDefaultProgress());
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<NormalizedPoint>(getStartingSpot(CHALLENGES[0].playerRole));
  const [showWhy, setShowWhy] = useState(false);
  const [latestMessage, setLatestMessage] = useState<string>('Drag the highlighted player to the best spot, then tap Check Answer.');
  const [scoreBreakdown, setScoreBreakdown] = useState<ReturnType<typeof scoreChallenge> | null>(null);

  const challenge = CHALLENGES[challengeIndex];

  const teammateSupport = useMemo(
    () => getRecommendedPosition({ ball: challenge.ballPosition, position: challenge.supportTeammate }).idealPosition,
    [challenge.ballPosition, challenge.supportTeammate],
  );

  useEffect(() => {
    setProfile(loadProfile());
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    setPlayerPosition(getStartingSpot(challenge.playerRole));
    setShowWhy(false);
    setScoreBreakdown(null);
    setLatestMessage('Find your best defensive spot!');
  }, [challenge.id, challenge.playerRole]);

  const playerName = profile.name.trim();

  const roleChecks = useMemo(() => {
    const goalSide = playerPosition.x <= challenge.ballPosition.x - 0.015;
    const centerProtection = Math.abs(playerPosition.y - 0.5) <= Math.abs(challenge.ballPosition.y - 0.5) + 0.1;
    const teammateCover = Math.hypot(playerPosition.x - teammateSupport.x, playerPosition.y - teammateSupport.y) <= 0.22;
    const ballSideSupport = Math.abs(playerPosition.y - challenge.ballPosition.y) <= 0.24;
    const shape = Math.hypot(playerPosition.x - challenge.expectedPosition.x, playerPosition.y - challenge.expectedPosition.y) <= 0.2;

    return {
      goalSide,
      centerProtection,
      teammateCover,
      ballSideSupport,
      shape,
    };
  }, [challenge.ballPosition, challenge.expectedPosition, playerPosition, teammateSupport]);

  const checkAnswer = () => {
    const result = scoreChallenge(playerPosition, challenge.expectedPosition);
    setScoreBreakdown(result);

    const prefix = playerName ? `${playerName}, ` : '';
    const goalSideMessage = roleChecks.goalSide ? 'You stayed goal side.' : 'Try staying goal side next time.';
    setLatestMessage(`${prefix}${result.message} ${goalSideMessage}`);

    setProgress((current) => {
      const completedChallengeIds = current.completedChallengeIds.includes(challenge.id)
        ? current.completedChallengeIds
        : [...current.completedChallengeIds, challenge.id];

      const bestScoreForChallenge = Math.max(current.bestScores[challenge.id] ?? 0, result.points);
      const bestScores = { ...current.bestScores, [challenge.id]: bestScoreForChallenge };

      const goalSidePerfectChallengeIds =
        result.points === 100 && roleChecks.goalSide && !current.goalSidePerfectChallengeIds.includes(challenge.id)
          ? [...current.goalSidePerfectChallengeIds, challenge.id]
          : current.goalSidePerfectChallengeIds;

      const nextProgress: ChallengeProgress = {
        ...current,
        completedChallengeIds,
        bestScores,
        goalSidePerfectChallengeIds,
        totalScore: current.totalScore + result.points,
        badges: current.badges,
      };

      nextProgress.badges = updateBadges(nextProgress);
      return nextProgress;
    });
  };

  const nextChallenge = () => {
    setChallengeIndex((current) => (current + 1) % CHALLENGES.length);
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const point = toNormalizedPoint(clientX, clientY, rect);
    setPlayerPosition({ x: clamp01(point.x), y: clamp01(point.y) });
  };

  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerRelease: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const ballPct = toPercent(challenge.ballPosition);
  const expectedPct = toPercent(challenge.expectedPosition);
  const playerPct = toPercent(playerPosition);
  const teammatePct = toPercent(teammateSupport);

  return (
    <div className="grid h-full min-h-0 gap-3 md:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)]">
      <section className="relative min-h-[48dvh] overflow-hidden rounded-2xl border border-white/10 bg-[#0c4a2d] shadow-2xl">
        <div ref={fieldRef} className="relative h-full w-full touch-none select-none">
          <svg viewBox="0 0 120 80" className="absolute inset-0 h-full w-full" aria-label="Challenge soccer field">
            <defs>
              <linearGradient id="challengeField" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="118" height="78" fill="url(#challengeField)" stroke="#dcfce7" strokeWidth="0.8" rx="1.5" />
            <line x1="60" y1="1" x2="60" y2="79" stroke="#dcfce7" strokeWidth="0.7" />
            <circle cx="60" cy="40" r="9" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="1" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="1" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="101" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
            <rect x="112" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />

            {showWhy ? (
              <g>
                <line
                  x1={challenge.expectedPosition.x * 120}
                  y1={challenge.expectedPosition.y * 80}
                  x2={teammateSupport.x * 120}
                  y2={teammateSupport.y * 80}
                  stroke="rgba(56, 189, 248, 0.9)"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <line
                  x1={challenge.expectedPosition.x * 120}
                  y1={challenge.expectedPosition.y * 80}
                  x2={1}
                  y2={40}
                  stroke="rgba(250, 204, 21, 0.9)"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <line
                  x1={challenge.ballPosition.x * 120}
                  y1={challenge.ballPosition.y * 80}
                  x2={challenge.expectedPosition.x * 120}
                  y2={challenge.expectedPosition.y * 80}
                  stroke="rgba(74, 222, 128, 0.9)"
                  strokeWidth="1"
                />
              </g>
            ) : null}
          </svg>

          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: ballPct.left, top: ballPct.top }}
            aria-label="Challenge ball"
          >
            <div className="h-7 w-7 rounded-full border border-slate-900/20 bg-white shadow-md" />
          </div>

          <div
            className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-2 py-1 text-[11px] font-semibold shadow-lg ${
              showWhy ? 'border-cyan-200 bg-cyan-500/85 text-slate-950' : 'border-white/30 bg-slate-900/70 text-slate-100'
            }`}
            style={{ left: expectedPct.left, top: expectedPct.top }}
          >
            Correct
          </div>

          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-indigo-500/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ left: teammatePct.left, top: teammatePct.top }}
          >
            {challenge.supportTeammate}
          </div>

          <button
            ref={markerRef}
            type="button"
            aria-label={`Move ${challenge.playerRoleLabel}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            className="absolute z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-100 bg-amber-500 font-bold text-slate-950 shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            style={{ left: playerPct.left, top: playerPct.top, touchAction: 'none' }}
          >
            You
          </button>
        </div>
      </section>

      <aside className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/72 p-4 text-slate-100 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Challenge Mode</p>
        <h2 className="mt-1 text-xl font-bold">{challenge.category} Scenario</h2>
        <p className="mt-1 text-sm text-slate-300">
          Formation {challenge.formation} • Role <strong>{challenge.playerRoleLabel}</strong>
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-sm font-semibold">{latestMessage}</p>
          {scoreBreakdown ? (
            <p className={`mt-2 rounded-lg border px-3 py-2 text-sm font-semibold ${scoreBreakdown.colorClass}`}>
              {scoreBreakdown.message} • {Math.round(scoreBreakdown.distanceYards)} yards away • +{scoreBreakdown.points} points
            </p>
          ) : null}
          <p className="mt-2 text-sm text-slate-300">{challenge.explanation}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <p className="font-semibold text-slate-200">Defender learning rules</p>
          <p className={roleChecks.goalSide ? 'text-emerald-300' : 'text-rose-300'}>Goal side positioning</p>
          <p className={roleChecks.teammateCover ? 'text-emerald-300' : 'text-amber-300'}>Covering a teammate</p>
          <p className={roleChecks.centerProtection ? 'text-emerald-300' : 'text-amber-300'}>Protecting the center</p>
          <p className={roleChecks.ballSideSupport ? 'text-emerald-300' : 'text-amber-300'}>Supporting the ball side</p>
          <p className={roleChecks.shape ? 'text-emerald-300' : 'text-amber-300'}>Maintaining team shape</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={checkAnswer}
            className="min-h-11 rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Check Answer
          </button>
          <button
            type="button"
            onClick={() => setShowWhy((current) => !current)}
            className="min-h-11 rounded-lg bg-cyan-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Why Am I Here?
          </button>
          <button
            type="button"
            onClick={nextChallenge}
            className="min-h-11 rounded-lg bg-indigo-500 px-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Next Challenge
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-sm font-semibold">Player profile</p>
          <div className="mt-2 grid gap-2">
            <label className="text-xs text-slate-300">
              Name
              <input
                value={profile.name}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 w-full rounded-md border border-white/20 bg-slate-950 px-2 py-2 text-sm"
                maxLength={24}
              />
            </label>
            <label className="text-xs text-slate-300">
              Favorite Position
              <select
                value={profile.favoritePosition}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, favoritePosition: event.target.value as PlayerPosition }))
                }
                className="mt-1 w-full rounded-md border border-white/20 bg-slate-950 px-2 py-2 text-sm"
              >
                {Object.entries(MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-300">
              Age
              <input
                type="number"
                min={7}
                max={12}
                value={profile.age}
                onChange={(event) => {
                  const value = event.target.value;
                  setProfile((current) => ({ ...current, age: value ? Number(value) : '' }));
                }}
                className="mt-1 w-full rounded-md border border-white/20 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-sm font-semibold">Progress</p>
          <p className="mt-1 text-sm text-slate-300">Total score: {progress.totalScore}</p>
          <p className="text-sm text-slate-300">Completed challenges: {progress.completedChallengeIds.length}</p>
          <div className="mt-2 grid gap-2">
            {BADGES.map((badge) => {
              const unlocked = progress.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    unlocked ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100' : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <p className="font-semibold">
                    {badge.icon} {badge.label}
                  </p>
                  <p>{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ChallengeMode;
