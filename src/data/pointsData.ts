import { create } from 'zustand';
import { ScheduleEvent } from './scheduleData';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
  criteria: (state: PointsState) => boolean;
}

interface PointsState {
  totalPoints: number;
  completedTasks: string[];
  completedTasksToday: number;
  completedTasksThisWeek: number;
  longestStreak: number;
  currentStreak: number;
  achievements: Achievement[];
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
  taskPoints: Map<string, number>;
  taskAchievements: Map<string, string[]>;
  newlyUnlockedAchievement: Achievement | null;
  addCompletedTask: (taskId: string, event: ScheduleEvent) => { pointsEarned: number; streakBonus: boolean };
  removeCompletedTask: (taskId: string) => void;
  resetPoints: () => void;
  refreshAchievements: () => void;
  clearNewAchievement: () => void;
}

// Level system
const calculateLevel = (points: number): number => {
  // Simple level calculation: level = 1 + floor(points / 100)
  return 1 + Math.floor(points / 100);
};

const calculateNextLevelPoints = (points: number): number => {
  const currentLevel = calculateLevel(points);
  return currentLevel * 100;
};

const calculateLevelProgress = (points: number): number => {
  const currentLevel = calculateLevel(points);
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const pointsInCurrentLevel = points - pointsForCurrentLevel;
  const pointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
  return (pointsInCurrentLevel / pointsNeededForLevel) * 100;
};

// Create a store for points and achievements
export const usePointsStore = create<PointsState>((set, get) => ({
  totalPoints: 0,
  completedTasks: [],
  completedTasksToday: 0,
  completedTasksThisWeek: 0,
  longestStreak: 0,
  currentStreak: 0,
  achievements: [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first task',
      points: 5,
      unlocked: false,
      criteria: (state) => state.completedTasks.length >= 1,
    },
    {
      id: '2',
      title: 'Task Master',
      description: 'Complete 3 tasks in a day',
      points: 10,
      unlocked: false,
      criteria: (state) => state.completedTasksToday >= 3,
    },
    {
      id: '3',
      title: 'Productivity Ninja',
      description: 'Complete 5 tasks in a week',
      points: 15,
      unlocked: false,
      criteria: (state) => state.completedTasksThisWeek >= 5,
    },
    {
      id: '4',
      title: 'Time Lord',
      description: 'Complete 10 tasks total',
      points: 20,
      unlocked: false,
      criteria: (state) => state.completedTasks.length >= 10,
    },
  ],
  level: 1,
  levelProgress: 0,
  pointsToNextLevel: 100,
  taskPoints: new Map<string, number>(),
  taskAchievements: new Map<string, string[]>(),
  newlyUnlockedAchievement: null,
  
  addCompletedTask: (taskId, event) => {
    let pointsEarned = 0;
    let streakBonus = false;
    
    set((state) => {
      // Skip if already completed
      if (state.completedTasks.includes(taskId)) {
        return state;
      }
      
      // Add to completed tasks
      const newCompletedTasks = [...state.completedTasks, taskId];
      
      // Update counts
      const newCompletedTasksToday = state.completedTasksToday + 1;
      const newCompletedTasksThisWeek = state.completedTasksThisWeek + 1;
      
      // Update streak
      const newCurrentStreak = state.currentStreak + 1;
      const newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);
      
      // Calculate base points for completing a task
      let taskPointsValue = 10; // Base points for completing a task
      
      // Add streak bonus (1 point per day of streak)
      if (newCurrentStreak > 1) {
        const streakBonusPoints = Math.min(newCurrentStreak, 10); // Cap at 10 bonus points
        taskPointsValue += streakBonusPoints;
        streakBonus = true;
      }
      
      // Store points for this task
      const newTaskPoints = new Map(state.taskPoints);
      newTaskPoints.set(taskId, taskPointsValue);
      
      // Save the points earned for return value
      pointsEarned = taskPointsValue;
      
      // Update state with new task counts and base points
      const newState = {
        ...state,
        completedTasks: newCompletedTasks,
        completedTasksToday: newCompletedTasksToday,
        completedTasksThisWeek: newCompletedTasksThisWeek,
        longestStreak: newLongestStreak,
        currentStreak: newCurrentStreak,
        totalPoints: state.totalPoints + taskPointsValue,
        taskPoints: newTaskPoints,
        level: calculateLevel(state.totalPoints + taskPointsValue),
        levelProgress: calculateLevelProgress(state.totalPoints + taskPointsValue),
        pointsToNextLevel: calculateNextLevelPoints(state.totalPoints + taskPointsValue),
      };
      
      // Check for newly unlocked achievements
      let achievementPoints = 0;
      const newUnlockedAchievements: string[] = [];
      const updatedAchievements = state.achievements.map(achievement => {
        if (!achievement.unlocked && achievement.criteria(newState)) {
          // Achievement newly unlocked, add points
          achievementPoints += achievement.points;
          newUnlockedAchievements.push(achievement.id);
          return { ...achievement, unlocked: true };
        }
        return achievement;
      });
      
      // Store achievements unlocked by this task
      const newTaskAchievements = new Map(state.taskAchievements);
      if (newUnlockedAchievements.length > 0) {
        newTaskAchievements.set(taskId, newUnlockedAchievements);
      }
      
      // Add achievement points to total
      const finalPoints = newState.totalPoints + achievementPoints;
      
      // Set newly unlocked achievement
      const newlyUnlockedAchievement = updatedAchievements.find(achievement => newUnlockedAchievements.includes(achievement.id));
      
      return {
        ...newState,
        achievements: updatedAchievements,
        totalPoints: finalPoints,
        taskAchievements: newTaskAchievements,
        level: calculateLevel(finalPoints),
        levelProgress: calculateLevelProgress(finalPoints),
        pointsToNextLevel: calculateNextLevelPoints(finalPoints),
        newlyUnlockedAchievement,
      };
    });
    
    // Return the points information
    return { pointsEarned, streakBonus };
  },
  
  removeCompletedTask: (taskId) => {
    set((state) => {
      // Skip if not completed
      if (!state.completedTasks.includes(taskId)) {
        return state;
      }
      
      // Get points associated with this task
      const taskPoints = state.taskPoints.get(taskId) || 0;
      
      // Get achievements unlocked by this task
      const taskAchievements = state.taskAchievements.get(taskId) || [];
      
      // Remove from completed tasks
      const newCompletedTasks = state.completedTasks.filter(id => id !== taskId);
      
      // Update counts
      const newCompletedTasksToday = Math.max(0, state.completedTasksToday - 1);
      const newCompletedTasksThisWeek = Math.max(0, state.completedTasksThisWeek - 1);
      
      // Reset streak if necessary
      let newCurrentStreak = state.currentStreak;
      if (newCompletedTasksToday === 0) {
        newCurrentStreak = 0;
      } else {
        newCurrentStreak -= 1;
      }
      
      // Remove task from tracking maps
      const newTaskPoints = new Map(state.taskPoints);
      newTaskPoints.delete(taskId);
      
      const newTaskAchievements = new Map(state.taskAchievements);
      newTaskAchievements.delete(taskId);
      
      // Create new state to check achievements
      const newState = {
        ...state,
        completedTasks: newCompletedTasks,
        completedTasksToday: newCompletedTasksToday,
        completedTasksThisWeek: newCompletedTasksThisWeek,
        currentStreak: newCurrentStreak,
        taskPoints: newTaskPoints,
        taskAchievements: newTaskAchievements,
      };
      
      // Calculate points to subtract
      let pointsToSubtract = taskPoints;
      
      // Check which achievements should be unlocked based on current state
      const updatedAchievements = state.achievements.map(achievement => {
        // If this achievement was unlocked by this task, check if it's still valid
        if (achievement.unlocked && taskAchievements.includes(achievement.id)) {
          const stillValid = achievement.criteria(newState);
          if (!stillValid) {
            // Achievement no longer valid, subtract its points
            pointsToSubtract += achievement.points;
            return { ...achievement, unlocked: false };
          }
        }
        return achievement;
      });
      
      // Calculate new total points
      const newTotalPoints = Math.max(0, state.totalPoints - pointsToSubtract);
      
      return {
        ...newState,
        achievements: updatedAchievements,
        totalPoints: newTotalPoints,
        level: calculateLevel(newTotalPoints),
        levelProgress: calculateLevelProgress(newTotalPoints),
        pointsToNextLevel: calculateNextLevelPoints(newTotalPoints),
        newlyUnlockedAchievement: null,
      };
    });
  },
  
  resetPoints: () => {
    set({
      totalPoints: 0,
      completedTasks: [],
      completedTasksToday: 0,
      completedTasksThisWeek: 0,
      longestStreak: 0,
      currentStreak: 0,
      achievements: get().achievements.map(achievement => ({
        ...achievement,
        unlocked: false,
      })),
      level: 1,
      levelProgress: 0,
      pointsToNextLevel: 100,
      taskPoints: new Map<string, number>(),
      taskAchievements: new Map<string, string[]>(),
      newlyUnlockedAchievement: null,
    });
  },
  
  refreshAchievements: () => {
    set((state) => {
      const updatedAchievements = state.achievements.map(achievement => {
        const shouldBeUnlocked = achievement.criteria(state);
        if (shouldBeUnlocked && !achievement.unlocked) {
          // Achievement newly unlocked, add points
          return { ...achievement, unlocked: true };
        } else if (!shouldBeUnlocked && achievement.unlocked) {
          // Achievement no longer met, lock it again
          return { ...achievement, unlocked: false };
        }
        return achievement;
      });
      
      return {
        ...state,
        achievements: updatedAchievements,
        newlyUnlockedAchievement: null,
      };
    });
  },
  
  clearNewAchievement: () => {
    set((state) => ({ ...state, newlyUnlockedAchievement: null }));
  },
}));
