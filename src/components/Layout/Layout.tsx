import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  Moon,
  Sun
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import PWAInstallPrompt from '../shared/PWAInstallPrompt';

const Layout = () => {
  const { user } = useStore();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/learn', icon: BookOpen, label: 'Learn' },
    { to: '/practice', icon: Target, label: 'Practice' },
    { to: '/stats', icon: BarChart3, label: 'Statistics' },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gradient">日本語マスター</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Nihongo Master</p>
          </motion.div>
        </div>

        {/* User Info */}
        <div className="px-6 pb-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{user?.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Level {user?.level}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">XP Progress</span>
                <span className="font-semibold">{user?.xp} / {user?.xpToNextLevel}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${((user?.xp || 0) / (user?.xpToNextLevel || 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">{user?.streak} day streak</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-6">
          <button
            onClick={toggleTheme}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Sun className="w-4 h-4 dark:hidden" />
            <Moon className="w-4 h-4 hidden dark:block" />
            <span>Toggle Theme</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden glass border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gradient">日本語</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">{user?.streak}</span>
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Sun className="w-5 h-5 dark:hidden" />
                <Moon className="w-5 h-5 hidden dark:block" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="container mx-auto p-4 lg:p-8">
            <Outlet />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-200 dark:border-slate-700 p-2 z-50">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </main>
    </div>
  );
};

export default Layout;
