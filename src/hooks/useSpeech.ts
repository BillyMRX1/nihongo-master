import { useCallback } from 'react';

interface UseSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const {
    lang = 'ja-JP',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
  } = options;

  const speak = useCallback((text: string) => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Optional: Add error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    // Speak!
    window.speechSynthesis.speak(utterance);
  }, [lang, rate, pitch, volume]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const isSupported = 'speechSynthesis' in window;

  return { speak, stop, isSupported };
};
