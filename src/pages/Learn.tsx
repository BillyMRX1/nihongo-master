import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Pencil, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WritingSystem, JLPTLevel, LearningMode } from '../types';

const Learn = () => {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState<WritingSystem | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('recognition');

  const writingSystems = [
    { id: 'hiragana' as WritingSystem, name: 'Hiragana', char: 'あ', description: '71 characters', color: 'from-blue-500 to-cyan-500' },
    { id: 'katakana' as WritingSystem, name: 'Katakana', char: 'ア', description: '71 characters', color: 'from-purple-500 to-pink-500' },
    { id: 'kanji' as WritingSystem, name: 'Kanji', char: '日', description: '2000+ characters', color: 'from-orange-500 to-red-500' },
  ];

  const jlptLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const learningModes = [
    { id: 'recognition' as LearningMode, name: 'Recognition', icon: BookOpen, description: 'See character → Type romaji' },
    { id: 'production' as LearningMode, name: 'Production', icon: Target, description: 'See romaji → Select character' },
    { id: 'writing' as LearningMode, name: 'Writing', icon: Pencil, description: 'Draw the character by hand' },
  ];

  const handleStart = () => {
    if (selectedSystem) {
      navigate('/practice', { state: { system: selectedSystem, level: selectedLevel, mode: selectedMode } });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-2">Start Learning</h1>
        <p className="text-slate-600 dark:text-slate-400">Choose what you want to learn today</p>
      </motion.div>

      {/* Writing System Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">1. Select Writing System</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {writingSystems.map((system, index) => (
            <motion.button
              key={system.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedSystem(system.id)}
              className={`card p-6 text-left transition-all duration-300 ${
                selectedSystem === system.id
                  ? `bg-gradient-to-br ${system.color} text-white border-none shadow-2xl scale-105`
                  : 'hover:shadow-xl'
              }`}
            >
              <div className={`text-6xl font-japanese mb-3 ${selectedSystem === system.id ? 'opacity-100' : 'opacity-70'}`}>
                {system.char}
              </div>
              <h3 className="text-xl font-bold mb-1">{system.name}</h3>
              <p className={`text-sm ${selectedSystem === system.id ? 'opacity-90' : 'text-slate-600 dark:text-slate-400'}`}>
                {system.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* JLPT Level Selection (for Kanji only) */}
      {selectedSystem === 'kanji' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4">2. Select JLPT Level</h2>
          <div className="flex flex-wrap gap-3">
            {jlptLevels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Mode Selection */}
      {selectedSystem && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4">{selectedSystem === 'kanji' ? '3' : '2'}. Select Learning Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`card p-6 text-left transition-all duration-300 ${
                  selectedMode === mode.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none shadow-2xl scale-105'
                    : 'hover:shadow-xl'
                }`}
              >
                <mode.icon className={`w-8 h-8 mb-3 ${selectedMode === mode.id ? 'text-white opacity-100' : 'text-slate-600 dark:text-slate-400'}`} />
                <h3 className={`text-lg font-bold mb-1 ${selectedMode === mode.id ? 'text-white' : ''}`}>{mode.name}</h3>
                <p className={`text-sm ${selectedMode === mode.id ? 'text-white opacity-90' : 'text-slate-600 dark:text-slate-400'}`}>{mode.description}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Start Button */}
      {selectedSystem && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={handleStart}
            className="btn-primary px-12 py-4 text-lg flex items-center gap-3 animate-glow"
          >
            <Play className="w-6 h-6" />
            Start Learning
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Learn;
