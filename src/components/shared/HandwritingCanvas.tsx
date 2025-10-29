import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, Lightbulb } from 'lucide-react';
import HanziWriter from 'hanzi-writer';
import StrokeOrderAnimation from './StrokeOrderAnimation';

interface HandwritingCanvasProps {
  correctCharacter: string;
  onSubmit: (isCorrect: boolean) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

const HandwritingCanvas = ({ correctCharacter, onSubmit, showResult, isCorrect }: HandwritingCanvasProps) => {
  // HanziWriter Quiz Mode (NEW - Testing)
  const quizContainerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  const [useQuizMode, setUseQuizMode] = useState(true); // Toggle between quiz and canvas
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [currentStrokeNum, setCurrentStrokeNum] = useState(0);

  // Old Canvas Mode (Keep for fallback)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokes, setStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([]);
  const [showAnimation, setShowAnimation] = useState(false);

  // Check if character is Kanji (not Hiragana/Katakana)
  const isKanji = () => {
    const code = correctCharacter.charCodeAt(0);
    // Hiragana: 0x3040-0x309F, Katakana: 0x30A0-0x30FF
    const isHiragana = code >= 0x3040 && code <= 0x309f;
    const isKatakana = code >= 0x30a0 && code <= 0x30ff;
    return !isHiragana && !isKatakana;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get the display size of the canvas
      const rect = canvas.getBoundingClientRect();

      // Set the internal size to match the display size
      // Account for device pixel ratio for sharper rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Scale the context to account for device pixel ratio
      ctx.scale(dpr, dpr);

      // Set drawing style
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Use different color for dark mode
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDark ? '#f7fafc' : '#000';

      // Redraw all existing strokes after resize
      strokes.forEach(stroke => {
        if (stroke.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      });
    };

    resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes]);

  // HanziWriter Quiz Mode Setup
  useEffect(() => {
    if (!useQuizMode || !isKanji() || !quizContainerRef.current) return;

    // Clear previous writer
    if (writerRef.current) {
      writerRef.current.cancelQuiz();
      writerRef.current = null;
    }
    if (quizContainerRef.current) {
      quizContainerRef.current.innerHTML = '';
    }

    // Create HanziWriter instance
    try {
      writerRef.current = HanziWriter.create(quizContainerRef.current, correctCharacter, {
        width: 400,
        height: 400,
        padding: 20,
        strokeColor: '#4F46E5',
        radicalColor: '#7C3AED',
        outlineColor: '#CBD5E1',
        highlightColor: '#10b981',
        drawingColor: '#000',
        showCharacter: false,
        showOutline: true,
      });
    } catch (error) {
      console.error('Error creating HanziWriter for quiz:', error);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
    };
  }, [correctCharacter, useQuizMode]);

  // Start Quiz
  const startQuiz = () => {
    if (!writerRef.current || quizStarted) return;

    setQuizStarted(true);
    setTotalMistakes(0);
    setCurrentStrokeNum(0);

    writerRef.current.quiz({
      leniency: 1.0,
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      acceptBackwardsStrokes: false,
      onMistake: (strokeData: any) => {
        console.log('Mistake on stroke', strokeData);
        setTotalMistakes(prev => prev + 1);
      },
      onCorrectStroke: (strokeData: any) => {
        console.log('Correct stroke!', strokeData);
        setCurrentStrokeNum(strokeData.strokeNum + 1);
      },
      onComplete: (summary: any) => {
        console.log('Quiz complete!', summary);
        setQuizStarted(false);
        // Call parent onSubmit with success
        onSubmit(true);
      }
    });
  };

  // Reset Quiz
  const resetQuiz = () => {
    if (writerRef.current) {
      writerRef.current.cancelQuiz();
    }
    setQuizStarted(false);
    setTotalMistakes(0);
    setCurrentStrokeNum(0);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (showResult) return;

    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);

    const coords = getCoordinates(e);
    setCurrentStroke([coords]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Ensure stroke style is set
    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = isDark ? '#f7fafc' : '#000';

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || showResult) return;

    e.preventDefault();
    const coords = getCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Get the display size for clearing
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    setStrokes([]);
    setCurrentStroke([]);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (!hasDrawn) return;

    // Simple validation: check if user drew something
    // In a real implementation, you would use ML or pattern matching
    // For now, we'll give a 70% chance of being correct if they drew enough
    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
    const hasEnoughDrawing = totalPoints > 20; // At least 20 points drawn

    // Simulate stroke validation
    // In production, this would compare against stored stroke data
    onSubmit(hasEnoughDrawing);
  };

  return (
    <div className="space-y-4">
      {/* Target Character Display */}
      <div className="text-center mb-4">
        <p className="text-slate-600 dark:text-slate-400 mb-2">Draw this character:</p>
        <div className="japanese-char text-slate-300 dark:text-slate-700">{correctCharacter}</div>
      </div>

      {/* Show Animation Toggle - Only for Kanji */}
      {isKanji() && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            {showAnimation ? 'Hide' : 'Show'} Stroke Order
          </button>
        </div>
      )}

      {/* Stroke Order Animation */}
      {isKanji() && showAnimation && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden mb-6"
        >
          <StrokeOrderAnimation character={correctCharacter} size={250} />
        </motion.div>
      )}

      {/* HanziWriter Quiz Mode (NEW - Testing) */}
      {useQuizMode && isKanji() ? (
        <div className="space-y-4">
          {/* Quiz Container */}
          <div className="relative flex justify-center">
            <div
              ref={quizContainerRef}
              className="hanzi-writer-container card border-4 border-blue-500"
              style={{
                width: 400,
                height: 400,
                position: 'relative'
              }}
            />
          </div>

          {/* Quiz Stats */}
          {quizStarted && (
            <div className="flex justify-center gap-4 text-sm">
              <div className="card px-4 py-2">
                <span className="text-slate-600 dark:text-slate-400">Mistakes: </span>
                <span className="font-bold text-red-500">{totalMistakes}</span>
              </div>
              <div className="card px-4 py-2">
                <span className="text-slate-600 dark:text-slate-400">Stroke: </span>
                <span className="font-bold text-blue-500">{currentStrokeNum + 1}</span>
              </div>
            </div>
          )}

          {/* Quiz Controls */}
          <div className="flex gap-3 justify-center">
            {!quizStarted ? (
              <button
                onClick={startQuiz}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Start Drawing
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Draw each stroke in the correct order. The outline will guide you!
          </p>
        </div>
      ) : (
        /* OLD Canvas Mode (Commented out for now, keeping for fallback) */
        <div className="space-y-4">
          <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
            Canvas mode (for Hiragana/Katakana) - Quiz mode available for Kanji only
          </p>
          {/* Old canvas code would go here if needed */}
        </div>
      )}
    </div>
  );
};

export default HandwritingCanvas;
