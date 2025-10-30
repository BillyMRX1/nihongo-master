import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  Brain
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, progress, unlockedAchievements } = useStore();

  if (!user) return null;

  const masteredCount = Array.from(progress.values()).filter(p => p.masteryLevel >= 5).length;
  const learningCount = Array.from(progress.values()).filter(p => p.masteryLevel > 0 && p.masteryLevel < 5).length;
  const totalCharacters = progress.size;

  const getRandomMode = () => {
    const modes = ['recognition', 'production', 'writing'];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  const handleQuickAction = (system: string) => {
    const randomMode = getRandomMode();
    navigate('/practice', {
      state: { system, mode: randomMode, level: 'N5' }
    });
  };

  const quickActions = [
    {
      title: 'Learn Hiragana',
      icon: BookOpen,
      system: 'hiragana',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Learn Katakana',
      icon: BookOpen,
      system: 'katakana',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Practice Kanji',
      icon: Target,
      system: 'kanji',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Quick Review',
      icon: Zap,
      system: 'kanji',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const stats = [
    { label: 'Total XP', value: user.totalXP.toLocaleString(), icon: Trophy, color: 'text-yellow-500' },
    { label: 'Mastered', value: masteredCount, icon: Award, color: 'text-green-500' },
    { label: 'Learning', value: learningCount, icon: Brain, color: 'text-blue-500' },
    { label: 'Study Time', value: `${user.totalStudyTime}m`, icon: Calendar, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card p-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-gradient">{user.name}</span>!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Let's continue your Japanese learning journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">{user.level}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{user.streak}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Day Streak</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">Level {user.level} Progress</span>
            <span className="font-semibold">{user.xp} / {user.xpToNextLevel} XP</span>
          </div>
          <div className="progress-bar h-4">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Quick Start
        </h2>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action.system)}
              className={`card p-6 text-left hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${action.color} text-white border-none`}
            >
              <action.icon className="w-10 h-10 mb-3 opacity-90" />
              <h3 className="text-lg font-bold">{action.title}</h3>
              <p className="text-sm opacity-90 mt-1">Start learning now</p>
            </motion.button>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory pb-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.system)}
                className={`card p-6 text-left flex-shrink-0 w-[280px] snap-center bg-gradient-to-br ${action.color} text-white border-none`}
              >
                <action.icon className="w-10 h-10 mb-3 opacity-90" />
                <h3 className="text-lg font-bold">{action.title}</h3>
                <p className="text-sm opacity-90 mt-1">Start learning now</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Learning Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mastered Characters</span>
                <span className="font-semibold">{masteredCount}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill bg-gradient-to-r from-green-500 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(masteredCount / (totalCharacters || 1)) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>In Progress</span>
                <span className="font-semibold">{learningCount}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(learningCount / (totalCharacters || 1)) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-1">{totalCharacters}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Characters Learned</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </h2>
          <div className="space-y-3">
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No achievements yet</p>
                <p className="text-sm">Start learning to unlock achievements!</p>
              </div>
            ) : (
              <>
                {unlockedAchievements.slice(-3).reverse().map((achId, index) => (
                  <motion.div
                    key={achId}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="text-3xl">{achId.includes('001') ? '🎯' : '🏆'}</div>
                    <div>
                      <div className="font-semibold">Achievement Unlocked!</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Achievement ID: {achId}</div>
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => navigate('/stats')}
                  className="w-full btn-secondary text-sm"
                >
                  View All Achievements
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Daily Goal */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold mb-4">Daily Goal</h2>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600 dark:text-slate-400">Target: {user.preferences.dailyGoal} XP</span>
          <span className="font-semibold">{user.xp} / {user.preferences.dailyGoal} XP</span>
        </div>
        <div className="progress-bar h-4">
          <motion.div
            className="progress-fill bg-gradient-to-r from-green-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((user.xp / user.preferences.dailyGoal) * 100, 100)}%` }}
            transition={{ duration: 1, delay: 1 }}
          />
        </div>
        {user.xp >= user.preferences.dailyGoal && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <p className="font-semibold text-green-800 dark:text-green-300">Daily Goal Achieved!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
