import { format } from 'date-fns';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'work' | 'break' | 'meeting' | 'gym';
  completed?: boolean;
}

// Helper function to create a date for today with specific hours and minutes
const createTimeToday = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Shared schedule data to be used across the app
export const scheduleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly sync with the product team',
    startTime: createTimeToday(9, 0),
    endTime: createTimeToday(10, 0),
    type: 'meeting',
    completed: false,
  },
  {
    id: '2',
    title: 'Focus Work',
    description: 'Work on the new feature implementation',
    startTime: createTimeToday(10, 30),
    endTime: createTimeToday(12, 30),
    type: 'work',
    completed: false,
  },
  {
    id: '3',
    title: 'Lunch Break',
    description: 'Take a break and recharge',
    startTime: createTimeToday(12, 30),
    endTime: createTimeToday(13, 30),
    type: 'break',
    completed: false,
  },
  {
    id: '4',
    title: 'Gym Session',
    description: 'Cardio and strength training',
    startTime: createTimeToday(17, 0),
    endTime: createTimeToday(18, 0),
    type: 'gym',
    completed: false,
  },
].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

// Helper functions to format events for different views
export const formatTimeForDisplay = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDuration = (startTime: Date, endTime: Date): string => {
  // Ensure both dates are valid
  if (!startTime || !endTime) {
    return '0 minutes';
  }
  
  try {
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      if (minutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    }
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '0 minutes';
  }
};

// Format duration in minutes to a human-readable string
export const formatDurationMinutes = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} minutes`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
};

// Get type color based on event type
export const getTypeColor = (type: ScheduleEvent['type']): string => {
  switch (type) {
    case 'work':
      return 'bg-[#6366F1]';
    case 'break':
      return 'bg-[#34D399]';
    case 'meeting':
      return 'bg-[#F472B6]';
    case 'gym':
      return 'bg-[#FB923C]';
    default:
      return 'bg-gray-400';
  }
};

// Get background color based on event type
export const getTypeBackground = (type: ScheduleEvent['type']): string => {
  switch (type) {
    case 'work':
      return 'rgba(99, 102, 241, 0.3)';
    case 'break':
      return 'rgba(52, 211, 153, 0.3)';
    case 'meeting':
      return 'rgba(239, 68, 68, 0.3)';
    case 'gym':
      return 'rgba(245, 158, 11, 0.3)';
    default:
      return 'rgba(156, 163, 175, 0.3)';
  }
};

// Get gradient colors based on event type
export const getTypeGradient = (type: ScheduleEvent['type']): string[] => {
  switch (type) {
    case 'work':
      return ['rgba(99, 102, 241, 0.35)', 'rgba(99, 102, 241, 0.15)'];
    case 'break':
      return ['rgba(52, 211, 153, 0.35)', 'rgba(52, 211, 153, 0.15)'];
    case 'meeting':
      return ['rgba(239, 68, 68, 0.35)', 'rgba(239, 68, 68, 0.15)'];
    case 'gym':
      return ['rgba(245, 158, 11, 0.35)', 'rgba(245, 158, 11, 0.15)'];
    default:
      return ['rgba(156, 163, 175, 0.35)', 'rgba(156, 163, 175, 0.15)'];
  }
};
