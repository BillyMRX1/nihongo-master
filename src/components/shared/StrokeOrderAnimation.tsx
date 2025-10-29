import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Eye, EyeOff } from 'lucide-react';
import HanziWriter from 'hanzi-writer';

interface StrokeOrderAnimationProps {
  character: string;
  size?: number;
}

const StrokeOrderAnimation = ({ character, size = 300 }: StrokeOrderAnimationProps) => {
  const writerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [isKanji, setIsKanji] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Check if character is Kanji (not Hiragana/Katakana)
  const checkIsKanji = (char: string) => {
    const code = char.charCodeAt(0);
    // Hiragana: 0x3040-0x309F, Katakana: 0x30A0-0x30FF
    // Kanji: 0x4E00-0x9FAF
    const isHiragana = code >= 0x3040 && code <= 0x309f;
    const isKatakana = code >= 0x30a0 && code <= 0x30ff;
    return !isHiragana && !isKatakana;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if character is Kanji
    const kanjiCheck = checkIsKanji(character);
    setIsKanji(kanjiCheck);
    setLoadError(false);

    if (!kanjiCheck) {
      // Clear container for non-Kanji characters
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    // Clear previous writer
    if (writerRef.current) {
      writerRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }

    // Create new writer for Kanji
    try {
      // First, ensure the container is empty
      containerRef.current.innerHTML = '';

      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: size,
        height: size,
        padding: 20,
        strokeAnimationSpeed: 1.5,
        delayBetweenStrokes: 200,
        strokeColor: '#4F46E5',
        radicalColor: '#7C3AED',
        outlineColor: showOutline ? '#CBD5E1' : 'transparent',
        drawingColor: '#06B6D4',
        showCharacter: false,
        showOutline: true,
        renderer: 'svg',  // Explicitly use SVG renderer
        onLoadCharDataError: (error: any) => {
          console.error('Failed to load character data:', error);
          setLoadError(true);
        }
      });
    } catch (error) {
      console.error('Error creating HanziWriter:', error);
      setLoadError(true);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null;
      }
    };
  }, [character, size, showOutline]);

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return;

    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false),
    });
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    writerRef.current.hideCharacter();
    if (showOutline) {
      writerRef.current.showOutline();
    }
    setIsAnimating(false);
  };

  const toggleOutline = () => {
    setShowOutline(!showOutline);
    if (writerRef.current) {
      if (!showOutline) {
        writerRef.current.showOutline();
      } else {
        writerRef.current.hideOutline();
      }
    }
  };

  // Don't show anything for non-Kanji (button is hidden by parent)
  if (!isKanji) {
    return null;
  }

  // Show error message if character data failed to load
  if (loadError) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-4 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <p className="text-sm text-red-700 dark:text-red-300">
          ⚠️ Stroke data unavailable for this character
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center"
      >
        <div className="card p-6 inline-flex items-center justify-center bg-white dark:bg-slate-800">
          <div
            ref={containerRef}
            className="hanzi-writer-container"
            style={{
              width: size,
              height: size,
              position: 'relative'
            }}
          />
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleAnimate}
          disabled={isAnimating}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
        >
          <Play className="w-4 h-4" />
          {isAnimating ? 'Playing...' : 'Play'}
        </button>

        <button
          onClick={handleReset}
          className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default StrokeOrderAnimation;
