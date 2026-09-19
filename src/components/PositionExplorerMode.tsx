import { useEffect, useMemo, useState } from 'react';
import DisplayControls from './DisplayControls';
import PositionSelector from './PositionSelector';
import SoccerField from './SoccerField';
import type { DisplaySettings, NormalizedPoint } from '../types/soccer';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  TacticalState,
  buildTeamTacticalModel,
  createDefaultPlayers,
  getBallCarrierTeam,
  type ActivePlayer,
  type LearningMode,
  type TacticalRole,
} from '../engine/tactical';

const createCenterBall = (): NormalizedPoint => ({ x: 0.5, y: 0.5 });

const defaultSettings: DisplaySettings = {
  showDangerMap: true,
  showGoalSideIndicators: true,
  showDefensiveCones: true,
  showPassingLanes: true,
  showSupportTriangles: true,
  showCompactnessBands: true,
  showPressureAssignments: true,
  showWeakSideShading: true,
};

const stateOptions = Object.values(TacticalState);
const learningModes: LearningMode[] = ['child', 'standard', 'advanced'];

type PositionExplorerModeProps = {
  isControlsOpen: boolean;
  onCloseControls: () => void;
};

const PositionExplorerMode = ({ isControlsOpen, onCloseControls }: PositionExplorerModeProps) => {
  const [ball, setBall] = useState<NormalizedPoint>(createCenterBall);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [tacticalState, setTacticalState] = useState<TacticalState>(TacticalState.Defending);
  const [learningMode, setLearningMode] = useState<LearningMode>('standard');
  const [players, setPlayers] = useState<ActivePlayer[]>(() => createDefaultPlayers());
  const [selectedRole, setSelectedRole] = useState<TacticalRole>('LB');

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
          formationLabel: 'Custom team shape',
          orientation: 'leftToRight',
          stylePreset: 'balanced',
          activePlayers: players,
        },
      ),
    [ball, learningMode, players, safeSelectedRole, tacticalState],
  );

  const selectedPlayer = model.players.find((player) => player.player.role === safeSelectedRole) ?? model.players[0];

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
        <SoccerField ball={ball} onBallChange={setBall} model={model} selectedRole={safeSelectedRole} settings={settings} />
      </section>

      <aside
        id="position-explorer-drawer"
        className={`absolute inset-y-0 right-0 z-20 w-full max-w-[430px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-slate-100 shadow-2xl backdrop-blur-md transition-transform duration-200 ${
          isControlsOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Position Explorer</p>
            <h2 className="mt-1 text-xl font-bold">Team state + learner role</h2>
          </div>
          <button
            type="button"
            onClick={onCloseControls}
            aria-label="Close position explorer controls"
            className="min-h-11 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        <p className="text-sm text-slate-300">Move the ball, change the tactical state, and see how every active player adjusts together.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-sm font-semibold">Selected learner</p>
          {selectedPlayer ? (
            <>
              <p className="mt-1 text-sm text-slate-300">{ROLE_LABELS[selectedPlayer.player.role]}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                  <p className="text-slate-400">Goal side</p>
                  <p className="font-semibold text-emerald-300">{selectedPlayer.goalSideScore}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                  <p className="text-slate-400">Shape</p>
                  <p className="font-semibold text-cyan-300">{selectedPlayer.shapeScore}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                  <p className="text-slate-400">Support</p>
                  <p className="font-semibold text-violet-300">{selectedPlayer.supportScore}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-2">
                  <p className="text-slate-400">Positioning</p>
                  <p className="font-semibold text-amber-300">{selectedPlayer.positioningScore}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-100">{selectedPlayer.explanation.primary}</p>
              <p className="mt-1 text-sm text-slate-300">{learningMode === 'child' ? selectedPlayer.explanation.childFriendly : selectedPlayer.explanation.secondary}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-300">Activate at least one role to see guidance.</p>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <PositionSelector value={safeSelectedRole} options={activeRoles} onChange={setSelectedRole} />

          <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Tactical state</p>
            <select
              value={tacticalState}
              onChange={(event) => setTacticalState(event.target.value as TacticalState)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm"
            >
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Learning mode</p>
            <select
              value={learningMode}
              onChange={(event) => setLearningMode(event.target.value as LearningMode)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm"
            >
              {learningModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
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
            onResetBall={() => setBall(createCenterBall())}
          />

          <section className="rounded-xl bg-slate-900/85 p-3 shadow-lg ring-1 ring-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Why each player is there</p>
            <div className="grid gap-2">
              {model.players.map((player) => (
                <div key={player.player.id} className={`rounded-lg border px-3 py-2 ${player.player.role === safeSelectedRole ? 'border-cyan-300/50 bg-cyan-500/10' : 'border-white/10 bg-slate-950/60'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{player.player.role} · {ROLE_LABELS[player.player.role]}</p>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">{player.responsibility}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-200">{player.explanation.primary}</p>
                  <p className="text-xs text-slate-400">{learningMode === 'child' ? player.explanation.childFriendly : player.explanation.secondary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default PositionExplorerMode;
