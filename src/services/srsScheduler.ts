import type { CharacterProgress } from '../types';

/**
 * Spaced Repetition System (SRS) based on SuperMemo 2 algorithm
 *
 * Mastery Levels:
 * 0 - New (never reviewed)
 * 1 - Learning (1 day)
 * 2 - Familiar (3 days)
 * 3 - Known (7 days)
 * 4 - Mastered (14 days)
 * 5 - Burned (30+ days)
 */

const MASTERY_INTERVALS = [
  0,      // Level 0: immediate review
  1,      // Level 1: 1 day
  3,      // Level 2: 3 days
  7,      // Level 3: 7 days
  14,     // Level 4: 14 days
  30,     // Level 5: 30 days
];

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;

/**
 * Calculate next review date based on mastery level and ease factor
 */
export const calculateNextReview = (
  masteryLevel: number,
  easeFactor: number
): Date => {
  const now = new Date();
  const baseInterval = MASTERY_INTERVALS[Math.min(masteryLevel, MASTERY_INTERVALS.length - 1)];
  const adjustedInterval = Math.ceil(baseInterval * easeFactor);

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + adjustedInterval);

  return nextReview;
};

/**
 * Update character progress based on quiz result
 */
export const updateProgressFromResult = (
  progress: CharacterProgress,
  isCorrect: boolean,
  responseTime: number
): CharacterProgress => {
  const updatedProgress = { ...progress };

  // Update counts
  updatedProgress.timesReviewed += 1;
  if (isCorrect) {
    updatedProgress.correctCount += 1;
    updatedProgress.successStreak += 1;
  } else {
    updatedProgress.incorrectCount += 1;
    updatedProgress.successStreak = 0;
    updatedProgress.failureHistory.push(new Date());
  }

  // Update accuracy
  updatedProgress.accuracy =
    (updatedProgress.correctCount / updatedProgress.timesReviewed) * 100;

  // Update average response time
  updatedProgress.averageResponseTime =
    (updatedProgress.averageResponseTime * (updatedProgress.timesReviewed - 1) + responseTime) /
    updatedProgress.timesReviewed;

  // Update ease factor (SuperMemo 2)
  if (isCorrect) {
    // Increase ease factor for correct answers
    updatedProgress.easeFactor = Math.min(
      updatedProgress.easeFactor + 0.1,
      MAX_EASE_FACTOR
    );

    // Level up if conditions are met
    if (updatedProgress.successStreak >= 3 && updatedProgress.masteryLevel < 5) {
      updatedProgress.masteryLevel += 1;
    }
  } else {
    // Decrease ease factor for incorrect answers
    updatedProgress.easeFactor = Math.max(
      updatedProgress.easeFactor - 0.2,
      MIN_EASE_FACTOR
    );

    // Level down on incorrect answer (but not below 0)
    if (updatedProgress.masteryLevel > 1) {
      updatedProgress.masteryLevel = Math.max(0, updatedProgress.masteryLevel - 1);
    }
  }

  // Update review dates
  updatedProgress.lastReviewedAt = new Date();
  updatedProgress.nextReviewAt = calculateNextReview(
    updatedProgress.masteryLevel,
    updatedProgress.easeFactor
  );

  return updatedProgress;
};

/**
 * Check if a character is due for review
 */
export const isDueForReview = (progress: CharacterProgress): boolean => {
  if (!progress.nextReviewAt) return true;
  return new Date() >= new Date(progress.nextReviewAt);
};

/**
 * Get characters that are due for review
 */
export const getDueCharacters = (
  allProgress: Map<string, CharacterProgress>,
  characterIds: string[]
): string[] => {
  return characterIds.filter(id => {
    const progress = allProgress.get(id);
    if (!progress) return true; // New characters are always due
    return isDueForReview(progress);
  });
};

/**
 * Calculate XP earned from a correct answer
 * XP scales with mastery level and response time
 */
export const calculateXP = (
  masteryLevel: number,
  responseTime: number,
  isCorrect: boolean
): number => {
  if (!isCorrect) return 0;

  // Base XP increases with mastery level
  const baseXP = 10 + (masteryLevel * 5);

  // Speed bonus (faster answers get more XP)
  let speedMultiplier = 1.0;
  if (responseTime < 2000) speedMultiplier = 1.5;
  else if (responseTime < 5000) speedMultiplier = 1.2;
  else if (responseTime > 15000) speedMultiplier = 0.8;

  return Math.floor(baseXP * speedMultiplier);
};

/**
 * Calculate combo multiplier
 */
export const calculateComboMultiplier = (comboCount: number): number => {
  if (comboCount < 5) return 1.0;
  if (comboCount < 10) return 1.5;
  if (comboCount < 20) return 2.0;
  if (comboCount < 50) return 2.5;
  return 3.0;
};

/**
 * Calculate level from total XP
 */
export const calculateLevel = (totalXP: number): { level: number; xpToNextLevel: number } => {
  // XP required for level n: 100 * (n^1.5)
  let level = 1;
  let xpForNextLevel = 100;

  while (totalXP >= xpForNextLevel) {
    level += 1;
    xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  const xpToNextLevel = xpForNextLevel - totalXP;

  return { level, xpToNextLevel };
};

/**
 * Update streak based on last study date
 */
export const updateStreak = (lastStudyDate: Date | null, currentStreak: number): number => {
  if (!lastStudyDate) return 1;

  const last = new Date(lastStudyDate);
  const today = new Date();

  // Reset time to midnight for date comparison
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, keep streak
    return currentStreak;
  } else if (diffDays === 1) {
    // Next day, increment streak
    return currentStreak + 1;
  } else {
    // Streak broken, reset to 1
    return 1;
  }
};

/**
 * Get priority score for character (higher = more urgent to review)
 */
export const getPriorityScore = (progress: CharacterProgress): number => {
  const now = new Date().getTime();
  const nextReview = progress.nextReviewAt ? new Date(progress.nextReviewAt).getTime() : now;
  const overdueDays = Math.max(0, (now - nextReview) / (1000 * 60 * 60 * 24));

  // Prioritize overdue items
  let score = overdueDays * 10;

  // Prioritize items with low mastery
  score += (5 - progress.masteryLevel) * 5;

  // Prioritize items with low accuracy
  if (progress.accuracy < 70) score += 10;
  else if (progress.accuracy < 85) score += 5;

  return score;
};

/**
 * Sort characters by priority for optimal learning
 */
export const sortByPriority = (
  characterIds: string[],
  progressMap: Map<string, CharacterProgress>
): string[] => {
  return characterIds.sort((a, b) => {
    const progressA = progressMap.get(a);
    const progressB = progressMap.get(b);

    if (!progressA && !progressB) return 0;
    if (!progressA) return -1; // New items first
    if (!progressB) return 1;

    return getPriorityScore(progressB) - getPriorityScore(progressA);
  });
};
