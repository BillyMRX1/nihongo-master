import type { UserProfile, CharacterProgress, StudySession, DailyStats, CustomDeck } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'nihongo_user_profile',
  CHARACTER_PROGRESS: 'nihongo_character_progress',
  STUDY_SESSIONS: 'nihongo_study_sessions',
  DAILY_STATS: 'nihongo_daily_stats',
  CUSTOM_DECKS: 'nihongo_custom_decks',
  ACHIEVEMENTS: 'nihongo_achievements',
  SETTINGS: 'nihongo_settings',
} as const;

// Generic storage helpers
const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// User Profile
export const getUserProfile = (): UserProfile | null => {
  return getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
};

export const setUserProfile = (profile: UserProfile): void => {
  setItem(STORAGE_KEYS.USER_PROFILE, profile);
};

export const createDefaultProfile = (): UserProfile => {
  const profile: UserProfile = {
    id: `user_${Date.now()}`,
    name: 'Student',
    createdAt: new Date(),
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudyTime: 0,
    achievements: [],
    preferences: {
      theme: 'auto',
      dailyGoal: 100,
      showStrokeOrder: true,
      showMnemonics: true,
      enableSounds: true,
      fontSize: 'medium',
      animationSpeed: 'normal',
    },
  };
  setUserProfile(profile);
  return profile;
};

// Character Progress
export const getCharacterProgress = (): Map<string, CharacterProgress> => {
  const data = getItem<Record<string, CharacterProgress>>(STORAGE_KEYS.CHARACTER_PROGRESS);
  return data ? new Map(Object.entries(data)) : new Map();
};

export const setCharacterProgress = (progress: Map<string, CharacterProgress>): void => {
  const obj = Object.fromEntries(progress);
  setItem(STORAGE_KEYS.CHARACTER_PROGRESS, obj);
};

export const updateCharacterProgress = (characterId: string, progress: CharacterProgress): void => {
  const allProgress = getCharacterProgress();
  allProgress.set(characterId, progress);
  setCharacterProgress(allProgress);
};

export const getCharacterProgressById = (characterId: string): CharacterProgress | null => {
  const progress = getCharacterProgress();
  return progress.get(characterId) || null;
};

export const initializeCharacterProgress = (characterId: string): CharacterProgress => {
  return {
    characterId,
    masteryLevel: 0,
    accuracy: 0,
    timesReviewed: 0,
    correctCount: 0,
    incorrectCount: 0,
    averageResponseTime: 0,
    lastReviewedAt: null,
    nextReviewAt: new Date(),
    successStreak: 0,
    failureHistory: [],
    easeFactor: 2.5,
  };
};

// Study Sessions
export const getStudySessions = (): StudySession[] => {
  return getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS) || [];
};

export const addStudySession = (session: StudySession): void => {
  const sessions = getStudySessions();
  sessions.push(session);
  setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
};

export const getCurrentSession = (): StudySession | null => {
  const sessions = getStudySessions();
  return sessions.find(s => s.endTime === null) || null;
};

export const endSession = (sessionId: string, xpEarned: number): void => {
  const sessions = getStudySessions();
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime.getTime() - new Date(session.startTime).getTime()) / 60000);
    session.xpEarned = xpEarned;
    setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  }
};

// Daily Stats
export const getDailyStats = (): DailyStats[] => {
  return getItem<DailyStats[]>(STORAGE_KEYS.DAILY_STATS) || [];
};

export const updateDailyStats = (date: string, stats: Partial<DailyStats>): void => {
  const allStats = getDailyStats();
  const existingIndex = allStats.findIndex(s => s.date === date);

  if (existingIndex >= 0) {
    allStats[existingIndex] = { ...allStats[existingIndex], ...stats };
  } else {
    allStats.push({
      date,
      studyTime: 0,
      xpEarned: 0,
      questionsAnswered: 0,
      accuracy: 0,
      ...stats,
    });
  }

  setItem(STORAGE_KEYS.DAILY_STATS, allStats);
};

export const getTodayStats = (): DailyStats | null => {
  const today = new Date().toISOString().split('T')[0];
  const allStats = getDailyStats();
  return allStats.find(s => s.date === today) || null;
};

// Custom Decks
export const getCustomDecks = (): CustomDeck[] => {
  return getItem<CustomDeck[]>(STORAGE_KEYS.CUSTOM_DECKS) || [];
};

export const addCustomDeck = (deck: CustomDeck): void => {
  const decks = getCustomDecks();
  decks.push(deck);
  setItem(STORAGE_KEYS.CUSTOM_DECKS, decks);
};

export const updateCustomDeck = (deckId: string, updates: Partial<CustomDeck>): void => {
  const decks = getCustomDecks();
  const index = decks.findIndex(d => d.id === deckId);
  if (index >= 0) {
    decks[index] = { ...decks[index], ...updates };
    setItem(STORAGE_KEYS.CUSTOM_DECKS, decks);
  }
};

export const deleteCustomDeck = (deckId: string): void => {
  const decks = getCustomDecks();
  const filtered = decks.filter(d => d.id !== deckId);
  setItem(STORAGE_KEYS.CUSTOM_DECKS, filtered);
};

// Achievements
export const getUnlockedAchievements = (): string[] => {
  return getItem<string[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
};

export const unlockAchievement = (achievementId: string): void => {
  const achievements = getUnlockedAchievements();
  if (!achievements.includes(achievementId)) {
    achievements.push(achievementId);
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }
};

export const isAchievementUnlocked = (achievementId: string): boolean => {
  const achievements = getUnlockedAchievements();
  return achievements.includes(achievementId);
};

// Export/Import
export const exportAllData = (): string => {
  const data = {
    profile: getUserProfile(),
    progress: Object.fromEntries(getCharacterProgress()),
    sessions: getStudySessions(),
    dailyStats: getDailyStats(),
    customDecks: getCustomDecks(),
    achievements: getUnlockedAchievements(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (data.profile) setUserProfile(data.profile);
    if (data.progress) setCharacterProgress(new Map(Object.entries(data.progress)));
    if (data.sessions) setItem(STORAGE_KEYS.STUDY_SESSIONS, data.sessions);
    if (data.dailyStats) setItem(STORAGE_KEYS.DAILY_STATS, data.dailyStats);
    if (data.customDecks) setItem(STORAGE_KEYS.CUSTOM_DECKS, data.customDecks);
    if (data.achievements) setItem(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Reset
export const resetAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => removeItem(key));
};

export const resetProgressOnly = (): void => {
  removeItem(STORAGE_KEYS.CHARACTER_PROGRESS);
  removeItem(STORAGE_KEYS.STUDY_SESSIONS);
  removeItem(STORAGE_KEYS.DAILY_STATS);
};
