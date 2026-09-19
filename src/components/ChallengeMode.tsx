import { useEffect, useMemo, useState } from 'react';
import DisplayControls from './DisplayControls';
import PositionSelector from './PositionSelector';
import SoccerField from './SoccerField';
import { BADGES, loadProfile, loadProgress, saveProfile, saveProgress } from '../challenge/storage';
import type { BadgeId, ChallengeProgress, PlayerProfile } from '../challenge/types';
import type { DisplaySettings, NormalizedPoint } from '../types/soccer';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  TacticalState,
  buildTeamTacticalModel,
  createDefaultPlayers,
  createChallengeScenario,
  evaluateChallengePlacement,
  findPlayerResult,
  getBallCarrierTeam,
  type ActivePlayer,
  type LearningMode,
  type TacticalRole,
} from '../engine/tactical';

const defaultSettings: DisplaySettings = {
  showDangerMap: true,
  showGoalSideIndicators: true,
  showDefensiveCones: true,
  showPassingLanes: true,
  showSupportTriangles: false,
  showCompactnessBands: true,
  showPressureAssignments: true,
  showWeakSideShading: true,
};

const challengeStates: TacticalState[] = [TacticalState.Defending, TacticalState.TransitionToDefense, TacticalState.Attacking, TacticalState.GoalKick];
const learningModes: LearningMode[] = ['child', 'standard', 'advanced'];

type ChallengeModeProps = {
  isControlsOpen: boolean;
  onCloseControls: () => void;
};

const getStartingSpot = (role: TacticalRole, players: ActivePlayer[]) => {
  const match = players.find((player) => player.role === role);
  return match ? { x: match.role === 'GK' ? 0.08 : match.side === 'left' ? 0.24 : match.side === 'right' ? 0.76 : 0.5, y: match.side === 'left' ? 0.22 : match.side === 'right' ? 0.78 : 0.5 } : { x: 0.5, y: 0.5 };
};

const updateBadges = (progress: ChallengeProgress): BadgeId[] => {
  const badges = new Set(progress.badges);
  if (progress.completedChallengeIds.length >= 1) badges.add('first-challenge-complete');
  if (Object.values(progress.bestScores).filter((score) => score >= 80).length >= 3) badges.add('defensive-wall');
  if (progress.goalSidePerfectChallengeIds.length >= 3) badges.add('goal-side-master');
  if (progress.totalScore >= 400) badges.add('positioning-pro');
  return [...badges];
};

const ChallengeMode = ({ isControlsOpen, onCloseControls }: ChallengeModeProps) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [progress, setProgress] = useState<ChallengeProgress>(() => loadProgress());
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [players, setPlayers] = useState<ActivePlayer[]>(() => createDefaultPlayers());
  const [tacticalState, setTacticalState] = useState<TacticalState>(TacticalState.Defending);
  const [learningMode, setLearningMode] = useState<LearningMode>('standard');
  const [selectedRole, setSelectedRole] = useState<TacticalRole>(() => loadProfile().favoritePosition);
  const [showWhy, setShowWhy] = useState(false);
  const [latestMessage, setLatestMessage] = useState('Place yourself, then check your tactical position.');
  const [scoreBreakdown, setScoreBreakdown] = useState<ReturnType<typeof evaluateChallengePlacement> | null>(null);
  const [playerPosition, setPlayerPosition] = useState<NormalizedPoint>(() => getStartingSpot(loadProfile().favoritePosition, createDefaultPlayers()));

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const activeRoles = useMemo(
    () => players.filter((player) => player.active).map((player) => player.role),
    [players],
  );

  useEffect(() => {
    if (!activeRoles.includes(selectedRole) && activeRoles[0]) {
      setSelectedRole(activeRoles[0]);
    }
  }, [activeRoles, selectedRole]);

  const safeSelectedRole = activeRoles.includes(selectedRole) ? selectedRole : activeRoles[0] ?? 'GK';

  const ball = useMemo<NormalizedPoint>(() => {
    const seed = challengeStates.indexOf(tacticalState);
    const verticalSeed = safeSelectedRole.length * 0.03;
    return {
      x: tacticalState === TacticalState.GoalKick ? 0.12 : tacticalState === TacticalState.Attacking ? 0.68 : tacticalState === TacticalState.TransitionToDefense ? 0.58 : 0.42,
      y: Math.min(0.84, Math.max(0.16, 0.28 + seed * 0.14 + verticalSeed)),
    };
  }, [safeSelectedRole, tacticalState]);

  const model = useMemo(
    () =>
      buildTeamTacticalModel(
        {
          ball,
          tacticalState,
          learningMode,
          ballCarrierTeam: getBallCarrierTeam(tacticalState),
          selectedRole: safeSelectedRole,
        },
        {
          formationLabel: 'Challenge setup',
          orientation: 'leftToRight',
          stylePreset: 'balanced',
          activePlayers: players,
        },
      ),
    [ball, learningMode, players, safeSelectedRole, tacticalState],
  );

  const scenario = useMemo(() => createChallengeScenario(model, safeSelectedRole), [model, safeSelectedRole]);
  const expectedPlayer = useMemo(() => findPlayerResult(model, safeSelectedRole), [model, safeSelectedRole]);

  useEffect(() => {
    setPlayerPosition(expectedPlayer.formationAnchor);
    setScoreBreakdown(null);
    setShowWhy(false);
    setLatestMessage('Find the best team-connected spot before you reveal the answer.');
  }, [scenario.id]);

  const checkAnswer = () => {
    const result = evaluateChallengePlacement(playerPosition, expectedPlayer);
    setScoreBreakdown(result);
    const prefix = profile.name.trim() ? `${profile.name.trim()}, ` : '';
    setLatestMessage(`${prefix}${result.feedback}`);

    setProgress((current) => {
      const completedChallengeIds = current.completedChallengeIds.includes(scenario.id)
        ? current.completedChallengeIds
        : [...current.completedChallengeIds, scenario.id];
      const previousBest = current.bestScores[scenario.id] ?? 0;
      const bestScoreForChallenge = Math.max(previousBest, result.positioningScore);
      const scoreImprovement = Math.max(0, bestScoreForChallenge - previousBest);
      const goalSidePerfectChallengeIds =
        result.goalSideScore >= 85 && !current.goalSidePerfectChallengeIds.includes(scenario.id)
          ? [...current.goalSidePerfectChallengeIds, scenario.id]
          : current.goalSidePerfectChallengeIds;

      const nextProgress: ChallengeProgress = {
        ...current,
        completedChallengeIds,
        bestScores: { ...current.bestScores, [scenario.id]: bestScoreForChallenge },
        goalSidePerfectChallengeIds,
        totalScore: current.totalScore + scoreImprovement,
        badges: current.badges,
      };
      nextProgress.badges = updateBadges(nextProgress);
      return nextProgress;
    });
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {isControlsOpen ? (
        <div
          aria-hidden="true"
          onClick={onCloseControls}
          className="absolute inset-0 z-10 bg-slate-950/70"
        />
      ) : null}

      <section className="h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-2xl">
        <SoccerField
          ball={ball}
          onBallChange={() => undefined}
          model={model}
          selectedRole={safeSelectedRole}
          settings={settings}
          mode="challenge"
          challengePlacement={playerPosition}
          onChallengePlacementChange={setPlayerPosition}
          revealExpected={showWhy || Boolean(scoreBreakdown)}
        />
      </section>

      <aside
        id="challenge-mode-drawer"
        className={`absolute inset-y-0 right-0 z-20 w-full max-w-[430px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-slate-100 shadow-2xl backdrop-blur-md transition-transform duration-200 ${
          isControlsOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Challenge Mode</p>
            <h2 className="mt-1 text-xl font-bold">{scenario.title}</h2>
          </div>
          <button
            type="button"
            onClick={onCloseControls}
            aria-label="Close challenge controls"
            className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        <p className="text-sm text-slate-300">{scenario.prompt}</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-sm font-semibold">{latestMessage}</p>
          <p className="mt-2 text-sm text-slate-300">{expectedPlayer.explanation.primary}</p>
          {scoreBreakdown ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                <p className="text-slate-400">Goal side</p>
                <p className="font-semibold text-emerald-300">{scoreBreakdown.goalSideScore}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                <p className="text-slate-400">Shape</p>
                <p className="font-semibold text-cyan-300">{scoreBreakdown.shapeScore}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                <p className="text-slate-400">Support</p>
                <p className="font-semibold text-violet-300">{scoreBreakdown.supportScore}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                <p className="text-slate-400">Danger</p>
                <p className="font-semibold text-amber-300">{scoreBreakdown.dangerCoverageScore}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-cyan-300/30 bg-cyan-500/10 p-2">
                <p className="text-slate-300">Final positioning score</p>
                <p className="text-lg font-bold text-cyan-200">{scoreBreakdown.positioningScore}</p>
                <p className="text-xs text-slate-400">About {Math.round(scoreBreakdown.distanceYards)} yards from the engine answer.</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <PositionSelector value={safeSelectedRole} options={activeRoles} onChange={(role) => {
            setSelectedRole(role);
            setProfile((current) => ({ ...current, favoritePosition: role }));
          }} title="Challenge role" />

          <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Challenge setup</p>
            <label className="text-xs text-slate-300">
              Tactical state
              <select
                value={tacticalState}
                onChange={(event) => setTacticalState(event.target.value as TacticalState)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm"
              >
                {challengeStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-slate-300">
              Difficulty / learning mode
              <select
                value={learningMode}
                onChange={(event) => setLearningMode(event.target.value as LearningMode)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm"
              >
                {learningModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Active positions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLE_ORDER.map((role) => {
                const active = players.find((player) => player.role === role)?.active ?? false;
                return (
                  <label key={role} className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() =>
                        setPlayers((current) =>
                          current.map((player) => (player.role === role ? { ...player, active: !player.active } : player)),
                        )
                      }
                    />
                    <span>
                      <span className="block font-semibold">{role}</span>
                      <span className="block text-xs text-slate-400">{ROLE_LABELS[role]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <DisplayControls
            settings={settings}
            onToggle={(key) => setSettings((current) => ({ ...current, [key]: !current[key] }))}
          />

          <div className="flex flex-wrap gap-2">
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
              {showWhy ? 'Hide Answer' : 'Why Here?'}
            </button>
          </div>

          <section className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
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
                  onChange={(event) => {
                    const role = event.target.value as TacticalRole;
                    setProfile((current) => ({ ...current, favoritePosition: role }));
                    setSelectedRole(role);
                  }}
                  className="mt-1 w-full rounded-md border border-white/20 bg-slate-950 px-2 py-2 text-sm"
                >
                  {ROLE_ORDER.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-300">
                Age
                <input
                  type="number"
                  min={7}
                  max={14}
                  value={profile.age}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      setProfile((current) => ({ ...current, age: '' }));
                      return;
                    }
                    const parsed = Number(value);
                    setProfile((current) => ({ ...current, age: Math.min(14, Math.max(7, parsed)) }));
                  }}
                  className="mt-1 w-full rounded-md border border-white/20 bg-slate-950 px-2 py-2 text-sm"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
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
                    <p className="font-semibold">{badge.icon} {badge.label}</p>
                    <p>{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default ChallengeMode;
