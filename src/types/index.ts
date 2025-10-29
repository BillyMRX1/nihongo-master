// Character Types
export type WritingSystem = 'hiragana' | 'katakana' | 'kanji';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type LearningMode = 'recognition' | 'production' | 'writing' | 'listening';

export interface Character {
  id: string;
  character: string;
  romaji: string;
  type: WritingSystem;
  category?: string; // 'basic', 'dakuten', 'combination'
}

export interface Hiragana extends Character {
  type: 'hiragana';
}

export interface Katakana extends Character {
  type: 'katakana';
}

export interface Kanji extends Character {
  type: 'kanji';
  meanings: string[];
  kunReading: string[];
  onReading: string[];
  strokes: number;
  jlptLevel: JLPTLevel;
  radicals?: string[];
  examples: KanjiExample[];
  mnemonic?: string;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

// Progress Tracking
export interface CharacterProgress {
  characterId: string;
  masteryLevel: number; // 0-5 (SRS levels)
  accuracy: number; // percentage
  timesReviewed: number;
  correctCount: number;
  incorrectCount: number;
  averageResponseTime: number; // milliseconds
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  successStreak: number;
  failureHistory: Date[];
  easeFactor: number; // for SRS algorithm
}

// Session Tracking
export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // minutes
  questionsAnswered: number;
  correctAnswers: number;
  xpEarned: number;
  mode: LearningMode;
  writingSystem: WritingSystem;
  jlptLevel?: JLPTLevel;
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  createdAt: Date;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  totalStudyTime: number; // minutes
  achievements: string[]; // achievement IDs
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  dailyGoal: number; // XP
  showStrokeOrder: boolean;
  showMnemonics: boolean;
  enableSounds: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: AchievementCondition;
  unlockedAt?: Date;
}

export interface AchievementCondition {
  type: 'streak' | 'total_xp' | 'accuracy' | 'speed' | 'mastery' | 'sessions' | 'time';
  target: number;
  current?: number;
}

// Learning Quiz
export interface QuizQuestion {
  id: string;
  character: Character;
  mode: LearningMode;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  responseTime?: number; // milliseconds
}

export interface QuizResult {
  sessionId: string;
  questions: QuizQuestion[];
  score: number;
  accuracy: number;
  totalTime: number;
  xpEarned: number;
  newMasteries: string[]; // character IDs that leveled up
  achievementsUnlocked: string[];
}

// Statistics
export interface DailyStats {
  date: string; // YYYY-MM-DD
  studyTime: number; // minutes
  xpEarned: number;
  questionsAnswered: number;
  accuracy: number;
}

export interface GlobalStats {
  totalCharactersLearned: number;
  hiraganaProgress: number; // percentage
  katakanaProgress: number; // percentage
  kanjiProgress: {
    N5: number;
    N4: number;
    N3: number;
    N2: number;
    N1: number;
  };
  overallAccuracy: number;
  averageResponseTime: number;
  totalSessions: number;
  favoriteTime?: string; // e.g., "morning", "evening"
}

// Handwriting
export interface Stroke {
  points: Point[];
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
  time: number;
}

export interface HandwritingResult {
  isCorrect: boolean;
  accuracy: number;
  feedback: string;
  strokeOrderCorrect: boolean;
  strokeDirectionCorrect: boolean;
}

// Deck Management
export interface CustomDeck {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
  createdAt: Date;
  lastStudied: Date | null;
  color: string;
}

// Store State Types
export interface AppState {
  user: UserProfile | null;
  currentSession: StudySession | null;
  progress: Map<string, CharacterProgress>;
  achievements: Achievement[];
  dailyStats: DailyStats[];
  customDecks: CustomDeck[];
  settings: UserPreferences;
}
