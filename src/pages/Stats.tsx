import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import achievementsData from '../data/achievements.json';

const Stats = () => {
  const { user, progress, unlockedAchievements } = useStore();

  if (!user) return null;

  const masteredCount = Array.from(progress.values()).filter(p => p.masteryLevel >= 5).length;
  const learningCount = Array.from(progress.values()).filter(p => p.masteryLevel > 0 && p.masteryLevel < 5).length;
  const totalCharacters = progress.size;

  const overallAccuracy = Array.from(progress.values()).reduce((acc, p) => acc + p.accuracy, 0) / (progress.size || 1);

  const statsCards = [
    { label: 'Total XP', value: user.totalXP.toLocaleString(), icon: Trophy, color: 'text-yellow-500' },
    { label: 'Current Level', value: user.level, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Study Time', value: `${user.totalStudyTime}m`, icon: Clock, color: 'text-blue-500' },
    { label: 'Current Streak', value: `${user.streak} days`, icon: Target, color: 'text-orange-500' },
    { label: 'Longest Streak', value: `${user.longestStreak} days`, icon: Award, color: 'text-purple-500' },
    { label: 'Achievements', value: unlockedAchievements.length, icon: Trophy, color: 'text-pink-500' },
  ];

  const progressStats = [
    { label: 'Mastered', value: masteredCount, total: totalCharacters, color: 'from-green-500 to-emerald-600' },
    { label: 'Learning', value: learningCount, total: totalCharacters, color: 'from-blue-500 to-purple-600' },
    { label: 'Overall Accuracy', value: Math.round(overallAccuracy), total: 100, color: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-2">Statistics</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your learning progress</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="card p-4 text-center hover:shadow-xl transition-all"
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Learning Progress</h2>
        <div className="space-y-6">
          {progressStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{stat.label}</span>
                <span>{stat.value} / {stat.total}</span>
              </div>
              <div className="progress-bar h-4">
                <motion.div
                  className={`progress-fill bg-gradient-to-r ${stat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value / stat.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Achievements ({unlockedAchievements.length} / {achievementsData.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievementsData.map((ach, index) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <motion.div
                key={ach.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isUnlocked
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-slate-200 dark:border-slate-700 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{ach.icon}</div>
                <h3 className="font-bold mb-1">{ach.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{ach.description}</p>
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                  {ach.xpReward} XP
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stats;
