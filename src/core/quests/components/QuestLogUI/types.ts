import type { ReactNode } from 'react';

import type { QuestObjective, QuestProgress } from '../../types';

export type QuestLogUIProps = {
  toggleKey?: string;
};

export type QuestSectionProps = {
  title: string;
  children: ReactNode;
};

export type QuestRowProps = {
  progress: QuestProgress;
  renderObjective: (objective: QuestObjective) => boolean;
  onComplete?: () => void;
  muted?: boolean;
};
