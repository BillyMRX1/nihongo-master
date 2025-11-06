import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Lightbulb } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import HandwritingCanvas from '../components/shared/HandwritingCanvas';
import SpeakerButton from '../components/shared/SpeakerButton';
import hiraganaData from '../data/hiragana.json';
import katakanaData from '../data/katakana.json';
import kanjiN5Data from '../data/kanji-n5.json';
import kanjiN4Data from '../data/kanji-n4.json';
import kanjiN3Data from '../data/kanji-n3.json';
import kanjiN2Data from '../data/kanji-n2.json';
import kanjiN1Data from '../data/kanji-n1.json';
import type { Character, QuizQuestion } from '../types';

const Practice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession, endCurrentSession, submitAnswer, currentSession, comboCount } = useStore();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const state = location.state as any;
    const system = state?.system || 'hiragana';
    const mode = state?.mode || 'recognition';
    const level = state?.level || 'N5';

    let data: any[] = [];
    if (system === 'hiragana') {
      data = hiraganaData;
    } else if (system === 'katakana') {
      data = katakanaData;
    } else if (system === 'kanji') {
      switch (level) {
        case 'N5':
          data = kanjiN5Data;
          break;
        case 'N4':
          data = kanjiN4Data;
          break;
        case 'N3':
          data = kanjiN3Data;
          break;
        case 'N2':
          data = kanjiN2Data;
          break;
        case 'N1':
          data = kanjiN1Data;
          break;
        default:
          data = kanjiN5Data;
      }
    }

    setCharacters(data as Character[]);

    // Start session
    if (!currentSession) {
      startSession(mode, system, state?.level);
    }

    // Load first question
    loadNextQuestion(data as Character[], mode);
  }, []);

  const loadNextQuestion = (chars: Character[], mode: string = 'recognition') => {
    if (chars.length === 0) return;

    const randomChar = chars[Math.floor(Math.random() * chars.length)];

    // Generate question based on mode
    let question: QuizQuestion;
    if (mode === 'recognition') {
      // Show character, user types romaji
      question = {
        id: `q_${Date.now()}`,
        character: randomChar,
        mode: 'recognition',
        correctAnswer: randomChar.romaji,
      };
    } else if (mode === 'writing') {
      // Writing mode: show romaji/meaning, draw character
      question = {
        id: `q_${Date.now()}`,
        character: randomChar,
        mode: 'writing',
        correctAnswer: randomChar.character,
      };
    } else {
      // Production mode: show romaji, select character
      const wrongAnswers = chars
        .filter(c => c.id !== randomChar.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.character);

      const options = [randomChar.character, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setOptions(options);

      question = {
        id: `q_${Date.now()}`,
        character: randomChar,
        mode: 'production',
        options,
        correctAnswer: randomChar.character,
      };
    }

    setCurrentQuestion(question);
    setUserAnswer('');
    setShowResult(false);
    setQuestionStartTime(Date.now());
  };

  const Hint = (status=false) =>{
   setShowHint(status)
  }

  const handleSubmit = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const responseTime = Date.now() - questionStartTime;
    submitAnswer(currentQuestion, userAnswer, responseTime);

    setShowResult(true);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      setQuestionIndex(questionIndex + 1);
      loadNextQuestion(characters, currentQuestion.mode);
    }, 1500);
  };

  const handleOptionSelect = (option: string) => {
    setUserAnswer(option);
    const responseTime = Date.now() - questionStartTime;
    if (currentQuestion) {
      submitAnswer(currentQuestion, option, responseTime);
      setShowResult(true);
      setTimeout(() => {
        Hint(false)
        setQuestionIndex(questionIndex + 1);
        loadNextQuestion(characters, currentQuestion.mode);
      }, 1500);
    }
  };

  const handleEndSession = () => {
    endCurrentSession();
    navigate('/');
  };

  const handleWritingSubmit = (isCorrect: boolean) => {
    if (!currentQuestion) return;

    const responseTime = Date.now() - questionStartTime;
    const answer = isCorrect ? currentQuestion.correctAnswer : 'wrong';

    submitAnswer(currentQuestion, answer, responseTime);
    setUserAnswer(answer);
    setShowResult(true);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      setQuestionIndex(questionIndex + 1);
      loadNextQuestion(characters, currentQuestion.mode);
    }, 2000);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCorrect = showResult && userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
  const hintContent =
  currentQuestion.character.type === "kanji"
    ? currentQuestion.character.meanings?.join(", ") ||
      currentQuestion.correctAnswer
    : currentQuestion.correctAnswer;


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Practice</h1>
          <p className="text-slate-600 dark:text-slate-400">Question {questionIndex + 1}</p>
        </div>
        <button onClick={handleEndSession} className="btn-secondary">
          End Session
        </button>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentSession?.correctAnswers || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentSession?.xpEarned || 0}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">XP Earned</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{comboCount}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Combo</div>
          </div>
        </div>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`card p-12 text-center relative overflow-hidden ${
            showResult
              ? isCorrect
                ? 'ring-4 ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'ring-4 ring-red-500 bg-red-50 dark:bg-red-900/20'
              : ''
          }`}
        >
          {/* Combo Animation */}
          {showResult && isCorrect && comboCount > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-4 right-4"
            >
              <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                {comboCount}x Combo!
              </div>
            </motion.div>
          )}

          {/* Question Display */}
          {currentQuestion.mode === 'recognition' ? (
            <>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="japanese-char">{currentQuestion.character.character}</div>
                <SpeakerButton text={currentQuestion.character.character} size="lg" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Type the romaji</p>

              {!showResult ? (
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Type answer..."
                    className="input-field text-center text-2xl mb-4"
                    autoFocus
                  />
                  <button onClick={handleSubmit} className="btn-primary w-full">
                    Submit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-12 h-12" />
                        <span>Correct!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-12 h-12" />
                          <span>Incorrect</span>
                        </div>
                        <div className="text-lg">
                          Correct answer: <span className="text-blue-600 dark:text-blue-400">{currentQuestion.correctAnswer}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : currentQuestion.mode === 'writing' ? (
            <>
              <div className="mb-6">
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">Draw this character:</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-4xl font-bold text-slate-700 dark:text-slate-300">{currentQuestion.character.romaji}</div>
                  <SpeakerButton text={currentQuestion.character.character} size="md" />
                </div>
              </div>

              <HandwritingCanvas
                correctCharacter={currentQuestion.character.character}
                onSubmit={handleWritingSubmit}
                showResult={showResult}
                isCorrect={isCorrect}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-6xl font-bold text-slate-700 dark:text-slate-300">{currentQuestion.character.romaji}</div>
                <SpeakerButton text={currentQuestion.character.character} size="lg" />
              </div>
             <>
            {showHint ? (
                  <p>{hintContent}</p>
                ) : (
                  <Lightbulb
                    onClick={() => Hint(true)}
                    className="mx-auto w-16 h-8 p-1 rounded-md border border-slate-600 hover:scale-125 hover:bg-slate-700 hover:text-yellow-500 transition-all"
                  />
                )}
              </>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Select the correct character</p>

              {!showResult ? (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionSelect(option)}
                      className="card p-12 japanese-char hover:shadow-2xl transition-all "
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className={`text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-12 h-12" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-12 h-12" />
                        <span>Incorrect</span>
                      </div>
                      <div className="japanese-char text-blue-600 dark:text-blue-400">{currentQuestion.correctAnswer}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Practice;
