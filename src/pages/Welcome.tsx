import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const Welcome = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { createNewUser } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createNewUser(name.trim());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gradient mb-2">日本語マスター</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Nihongo Master</p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-left text-sm font-medium mb-2">What's your name?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              autoFocus
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Start Learning
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-slate-600 dark:text-slate-400"
        >
          Master Hiragana, Katakana, and Kanji with spaced repetition
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Welcome;
