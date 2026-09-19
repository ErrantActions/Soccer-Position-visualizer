import type { ExplanationTag, LearningMode, PlayerTacticalResult, ResponsibilityRole } from './types';

const tagToText: Record<ExplanationTag, { standard: string; child: string }> = {
  'protect-goal': { standard: 'You are protecting the goal first.', child: 'Stay between the ball and the goal.' },
  'stay-goal-side': { standard: 'You are staying goal side of the ball.', child: 'Keep the goal behind you and the ball in front.' },
  'protect-central-area': { standard: 'You are protecting the center of the field.', child: 'Help protect the middle.' },
  'maintain-shape': { standard: 'You are keeping the team shape connected.', child: 'Stay close enough to help your team.' },
  'support-teammate': { standard: 'You are supporting a teammate near the ball.', child: 'Give your teammate help.' },
  'create-triangle': { standard: 'You are creating a better passing triangle.', child: 'Make an easy passing angle.' },
  'cover-danger-space': { standard: 'You are covering the most dangerous space.', child: 'Guard the dangerous area.' },
  'pressure-ball': { standard: 'You are the closest player, so you can pressure the ball.', child: 'You are close enough to step to the ball.' },
  'maintain-width': { standard: 'You are holding useful width for the team.', child: 'Do not crowd the middle.' },
  'maintain-depth': { standard: 'You are keeping depth to stretch the field.', child: 'Stay high enough to give space.' },
  'weak-side-tuck': { standard: 'The ball is far away, so you tuck inside to protect the middle.', child: 'Ball is far, so slide inside a little.' },
  'passing-lane-denial': { standard: 'You are blocking a dangerous passing lane.', child: 'Stand where a pass would be harder.' },
};

const responsibilityText: Record<ResponsibilityRole, string> = {
  pressure: 'Your job is to pressure the ball.',
  cover: 'Your job is to give cover behind the pressure defender.',
  balance: 'Your job is to balance the weak side.',
  shape: 'Your job is to stay connected in the team shape.',
};

export const buildExplanation = (tags: ExplanationTag[], responsibility: ResponsibilityRole, mode: LearningMode) => {
  const uniqueTags = [...new Set(tags)];
  const primaryTag = uniqueTags[0] ?? 'maintain-shape';
  const secondaryTag = uniqueTags[1] ?? 'support-teammate';
  const primary = tagToText[primaryTag][mode === 'child' ? 'child' : 'standard'];
  const secondaryBase = tagToText[secondaryTag][mode === 'child' ? 'child' : 'standard'];
  const responsibilityLine = mode === 'child' ? responsibilityText[responsibility].replace('Your job is to ', '') : responsibilityText[responsibility];

  return {
    primary,
    secondary: `${secondaryBase} ${responsibilityLine}`,
    suppressed: uniqueTags.slice(2).map((tag) => tagToText[tag][mode === 'child' ? 'child' : 'standard']),
    childFriendly: `${tagToText[primaryTag].child} ${responsibilityText[responsibility].replace('Your job is to ', '')}`,
    tags: uniqueTags,
  };
};

export const pickExplanationTags = (player: PlayerTacticalResult): ExplanationTag[] => {
  const ordered = [...player.influences]
    .sort((a, b) => b.weight - a.weight)
    .flatMap((influence) => influence.reasonTags);

  const merged = [...player.roleProfile.explanationPriorities, ...ordered];
  return [...new Set(merged)].slice(0, 5);
};
