import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, User, Palette, Settings as SettingsIcon, Save, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { APP_VERSION } from '../version';

const Settings = () => {
  const { user, exportData, importData, resetAllData, saveUserSettings } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [userName, setUserName] = useState(user?.name || '');
  const [dailyGoal, setDailyGoal] = useState(user?.preferences.dailyGoal || 100);
  const [showStrokeOrder, setShowStrokeOrder] = useState<boolean>(user?.preferences.showStrokeOrder ?? true);
  const [showMnemonics, setShowMnemonics] = useState<boolean>(user?.preferences.showMnemonics ?? true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setDailyGoal(user.preferences.dailyGoal);
      setShowStrokeOrder(user.preferences.showStrokeOrder);
      setShowMnemonics(user.preferences.showMnemonics);
    }
  }, [user]);

  if (!user) return null;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo-master-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = importData(content);
          if (success) {
            alert('Data imported successfully!');
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetAllData();
      setShowResetConfirm(false);
      alert('All data has been reset!');
    } else {
      setShowResetConfirm(true);
    }
  };

  const handleSaveSettings = () => {
    if (!user) return;

    saveUserSettings({
      name: userName,
      preferences: {
        dailyGoal,
        showStrokeOrder,
        showMnemonics,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Auto mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const currentTheme = localStorage.getItem('theme') || 'light';

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-500" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <input
                type="text"
                value={user.level}
                readOnly
                className="input-field bg-slate-100 dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Total XP</label>
              <input
                type="text"
                value={user.totalXP.toLocaleString()}
                readOnly
                className="input-field bg-slate-100 dark:bg-slate-700"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-500" />
          Learning Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Daily Goal (XP)</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              min="10"
              max="1000"
              step="10"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 card cursor-pointer hover:shadow-md transition-all">
              <span className="text-sm font-medium">Show Stroke Order</span>
              <input
                type="checkbox"
                checked={showStrokeOrder}
                onChange={(e) => setShowStrokeOrder(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-3 card cursor-pointer hover:shadow-md transition-all">
              <span className="text-sm font-medium">Show Mnemonics</span>
              <input
                type="checkbox"
                checked={showMnemonics}
                onChange={(e) => setShowMnemonics(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Palette className="w-6 h-6 text-pink-500" />
          Appearance
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              currentTheme === 'light'
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            ☀️ Light
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              currentTheme === 'dark'
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => handleThemeChange('auto')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              currentTheme === 'auto'
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            🌓 Auto
          </button>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Save className="w-6 h-6 text-green-500" />
          Data Management
        </h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
          <button
            onClick={handleImport}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Import Data
          </button>
          <button
            onClick={handleReset}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
              showResetConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            }`}
          >
            <Trash2 className="w-5 h-5" />
            {showResetConfirm ? 'Click Again to Confirm Reset' : 'Reset All Data'}
          </button>
          {showResetConfirm && (
            <button
              onClick={() => setShowResetConfirm(false)}
              className="w-full btn-secondary text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card p-6 text-center"
      >
        <h2 className="text-2xl font-bold text-gradient mb-2">日本語マスター</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Version {APP_VERSION}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Learn Japanese with spaced repetition, gamification, and progress tracking.
          <br />
          All data is stored locally in your browser.
        </p>
      </motion.div>
    </div>
  );
};

export default Settings;
