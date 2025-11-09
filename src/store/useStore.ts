import { create } from 'zustand';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import type {
  UserProfile,
  CharacterProgress,
  StudySession,
  DailyStats,
  CustomDeck,
  Achievement,
  QuizQuestion,
  UserPreferences,
} from '../types';
import * as storage from '../services/localStorage';
import { DEFAULT_PREFERENCES } from '../services/localStorage';
import { updateProgressFromResult, calculateXP, calculateComboMultiplier, calculateLevel, updateStreak } from '../services/srsScheduler';
import achievementsData from '../data/achievements.json';

interface AppStore {
  // State
  user: UserProfile | null;
  currentSession: StudySession | null;
  progress: Map<string, CharacterProgress>;
  dailyStats: DailyStats[];
  customDecks: CustomDeck[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  comboCount: number;

  // Actions
  initializeApp: () => void;
  createNewUser: (name: string) => void;
  startSession: (mode: any, writingSystem: any, jlptLevel?: any) => void;
  endCurrentSession: () => void;
  submitAnswer: (question: QuizQuestion, userAnswer: string, responseTime: number) => void;
  updateUserXP: (xp: number) => void;
  checkAndUnlockAchievements: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  resetAllData: () => void;
  saveUserSettings: (updates: {
    name?: string;
    preferences?: Partial<UserPreferences>;
  }) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  currentSession: null,
  progress: new Map(),
  dailyStats: [],
  customDecks: [],
  achievements: achievementsData as Achievement[],
  unlockedAchievements: [],
  comboCount: 0,

  initializeApp: () => {
    let user = storage.getUserProfile();
    if (!user) {
      user = storage.createDefaultProfile();
    } else {
      user = {
        ...user,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(user.preferences || {}),
        },
      };
      storage.setUserProfile(user);
    }

    const progress = storage.getCharacterProgress();
    const dailyStats = storage.getDailyStats();
    const customDecks = storage.getCustomDecks();
    const unlockedAchievements = storage.getUnlockedAchievements();

    set({
      user,
      progress,
      dailyStats,
      customDecks,
      unlockedAchievements,
    });
  },

  createNewUser: (name: string) => {
    const user = storage.createDefaultProfile();
    user.name = name;
    storage.setUserProfile(user);
    set({ user });
  },

  startSession: (mode, writingSystem, jlptLevel) => {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      xpEarned: 0,
      mode,
      writingSystem,
      jlptLevel,
    };

    storage.addStudySession(session);
    set({ currentSession: session, comboCount: 0 });
  },

  endCurrentSession: () => {
    const { currentSession, user } = get();
    if (!currentSession || !user) return;

    const completedSession = storage.finalizeSession(currentSession);

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = storage.getTodayStats();
    const previousQuestions = todayStats?.questionsAnswered || 0;
    const previousCorrect = todayStats
      ? Math.round(((todayStats.accuracy || 0) / 100) * previousQuestions)
      : 0;
    const totalQuestions = previousQuestions + completedSession.questionsAnswered;
    const newAccuracy = totalQuestions > 0
      ? Math.round(((previousCorrect + completedSession.correctAnswers) / totalQuestions) * 100)
      : 0;
    storage.updateDailyStats(today, {
      studyTime: (todayStats?.studyTime || 0) + completedSession.duration,
      xpEarned: (todayStats?.xpEarned || 0) + completedSession.xpEarned,
      questionsAnswered: totalQuestions,
      accuracy: newAccuracy,
    });

    // Update user streak and study time
    const streak = updateStreak(user.lastStudyDate, user.streak);
    const updatedUser: UserProfile = {
      ...user,
      streak,
      longestStreak: Math.max(user.longestStreak, streak),
      lastStudyDate: new Date(),
      totalStudyTime: user.totalStudyTime + completedSession.duration,
    };
    storage.setUserProfile(updatedUser);

    set({ currentSession: null, user: updatedUser, comboCount: 0 });
    get().checkAndUnlockAchievements();
  },

  submitAnswer: (question, userAnswer, responseTime) => {
    const { currentSession, progress, user, comboCount } = get();
    if (!currentSession || !user) return;

    const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

    // Update question
    question.userAnswer = userAnswer;
    question.isCorrect = isCorrect;
    question.responseTime = responseTime;

    // Update session stats
    currentSession.questionsAnswered += 1;
    if (isCorrect) {
      currentSession.correctAnswers += 1;
    }

    // Update combo
    const newComboCount = isCorrect ? comboCount + 1 : 0;

    // Calculate XP
    let charProgress = progress.get(question.character.id);
    if (!charProgress) {
      charProgress = storage.initializeCharacterProgress(question.character.id);
    }

    const baseXP = calculateXP(charProgress.masteryLevel, responseTime, isCorrect);
    const comboMultiplier = calculateComboMultiplier(newComboCount);
    const totalXP = Math.floor(baseXP * comboMultiplier);

    currentSession.xpEarned += totalXP;

    // Update character progress
    const updatedProgress = updateProgressFromResult(charProgress, isCorrect, responseTime);
    progress.set(question.character.id, updatedProgress);
    storage.updateCharacterProgress(question.character.id, updatedProgress);

    // Show XP toast notification
    if (isCorrect && totalXP > 0) {
      if (comboMultiplier > 1) {
        toast.success(`+${totalXP} XP (${comboMultiplier}x Combo!)`, {
          icon: '⚡',
          duration: 2000,
        });
      } else {
        toast.success(`+${totalXP} XP`, {
          duration: 1500,
        });
      }
    }

    // Show combo milestone notifications
    if (newComboCount === 5) {
      toast('5x Combo Streak!', { icon: '🔥', duration: 2000 });
    } else if (newComboCount === 10) {
      toast('10x Combo! On fire!', { icon: '🔥', duration: 2000 });
      // Mini confetti for 10x combo
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff6b6b', '#feca57', '#ff9ff3'],
      });
    } else if (newComboCount === 20) {
      toast('20x Combo! Unstoppable!', { icon: '🔥', duration: 2500 });
      // More confetti for 20x combo
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff'],
      });
    } else if (newComboCount > 0 && newComboCount % 25 === 0) {
      toast(`${newComboCount}x Combo! Legendary!`, { icon: '🔥', duration: 2500 });
      // Epic confetti for 25+ combo
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#48dbfb'],
      });
    }

    // Update user XP
    get().updateUserXP(totalXP);

    storage.saveSessionProgress(currentSession);

    set({
      currentSession,
      progress: new Map(progress),
      comboCount: newComboCount,
    });
  },

  updateUserXP: (xp: number) => {
    const { user } = get();
    if (!user || xp <= 0) return;

    const previousLevel = user.level;
    const totalXP = user.totalXP + xp;
    const { level, xpProgress, xpToNextLevel } = calculateLevel(totalXP);

    const updatedUser: UserProfile = {
      ...user,
      level,
      xp: xpProgress,
      xpToNextLevel,
      totalXP,
    };

    if (level > previousLevel) {
      toast.success(`Level Up! You reached Level ${level}!`, {
        icon: '🎉',
        duration: 4000,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      });
    }

    storage.setUserProfile(updatedUser);
    set({ user: updatedUser });
  },

  checkAndUnlockAchievements: () => {
    const { user, progress, unlockedAchievements, achievements } = get();
    if (!user) return;

    const sessions = storage.getStudySessions();
    const newUnlocks: string[] = [];

    achievements.forEach(ach => {
      if (unlockedAchievements.includes(ach.id)) return;

      let shouldUnlock = false;

      switch (ach.condition.type) {
        case 'sessions':
          shouldUnlock = sessions.length >= ach.condition.target;
          break;
        case 'streak':
          shouldUnlock = user.streak >= ach.condition.target;
          break;
        case 'total_xp':
          shouldUnlock = user.totalXP >= ach.condition.target;
          break;
        case 'mastery':
          const masteredCount = Array.from(progress.values()).filter(
            p => p.masteryLevel >= 5
          ).length;
          shouldUnlock = masteredCount >= ach.condition.target;
          break;
        case 'accuracy':
          // Check last session accuracy
          const lastSession = sessions[sessions.length - 1];
          if (lastSession && lastSession.questionsAnswered > 0) {
            const accuracy = (lastSession.correctAnswers / lastSession.questionsAnswered) * 100;
            shouldUnlock = accuracy >= ach.condition.target;
          }
          break;
        case 'time':
          const hour = new Date().getHours();
          if (ach.id === 'ach_014') {
            shouldUnlock = hour === 0;
          } else if (ach.id === 'ach_015') {
            shouldUnlock = hour < 6;
          }
          break;
      }

      if (shouldUnlock) {
        storage.unlockAchievement(ach.id);
        newUnlocks.push(ach.id);
        get().updateUserXP(ach.xpReward);
      }
    });

    if (newUnlocks.length > 0) {
      set({ unlockedAchievements: storage.getUnlockedAchievements() });

      // Show achievement unlock notifications with confetti
      newUnlocks.forEach((achId, index) => {
        const ach = achievements.find(a => a.id === achId);
        if (ach) {
          // Stagger notifications if multiple achievements
          setTimeout(() => {
            toast.success(`Achievement Unlocked: ${ach.name}`, {
              icon: ach.icon,
              duration: 5000,
            });

            // Celebrate with confetti!
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#ffd700'],
              ticks: 200,
            });
          }, index * 1000); // Stagger by 1 second if multiple achievements
        }
      });
    }
  },

  saveUserSettings: ({ name, preferences }) => {
    const { user } = get();
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      ...(name !== undefined ? { name: name.trim() || user.name } : {}),
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...user.preferences,
        ...preferences,
      },
    };

    storage.setUserProfile(updatedUser);
    set({ user: updatedUser });
  },

  exportData: () => {
    return storage.exportAllData();
  },

  importData: (jsonString: string) => {
    const success = storage.importAllData(jsonString);
    if (success) {
      get().initializeApp();
    }
    return success;
  },

  resetAllData: () => {
    storage.resetAllData();
    set({
      currentSession: null,
      progress: new Map(),
      dailyStats: [],
      customDecks: [],
      unlockedAchievements: [],
      comboCount: 0,
    });
    get().initializeApp();
  },
}));
