import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { motion } from 'framer-motion';

interface SpeakerButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SpeakerButton = ({ text, size = 'md', showLabel = false }: SpeakerButtonProps) => {
  const { speak, isSupported } = useSpeech({ lang: 'ja-JP' });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (!text || !isSupported) return;

    setIsPlaying(true);
    speak(text);

    // Reset playing state after 2 seconds
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (!isSupported) {
    return null; // Hide button if browser doesn't support speech
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={isPlaying}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center gap-2 transition-all ${
        isPlaying
          ? 'bg-green-500 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${showLabel ? 'px-4 w-auto' : ''}`}
      title="Listen to pronunciation"
    >
      {isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {showLabel && <span className="text-sm font-medium">Listen</span>}
    </motion.button>
  );
};

export default SpeakerButton;
