export type TaskType = 'work' | 'break' | 'meeting' | 'gym';

export interface Task {
  title: string;
  duration: number; // in minutes
  type: TaskType;
  description?: string;
}

export interface SuggestedTasks {
  [key: string]: Task[];
}

export const DEFAULT_TASKS: SuggestedTasks = {
  adhd: [
    {
      title: 'Morning Exercise',
      duration: 45,
      type: 'gym',
      description: 'Start your day with physical activity to boost focus',
    },
    {
      title: 'Focused Work Block',
      duration: 90,
      type: 'work',
      description: 'Deep work session with minimal distractions',
    },
    {
      title: 'Mindful Break',
      duration: 15,
      type: 'break',
      description: 'Short break to reset and recharge',
    },
    {
      title: 'Task Review',
      duration: 30,
      type: 'meeting',
      description: 'Review and plan upcoming tasks',
    },
  ],
};
