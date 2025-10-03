import { useState, useCallback, useEffect } from 'react';

export type VoiceType = 'female' | 'male' | 'child';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceType, setVoiceType] = useState<VoiceType>('female');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const getVoiceSettings = (type: VoiceType) => {
    const koreanVoices = availableVoices.filter(voice => voice.lang.includes('ko'));
    
    switch (type) {
      case 'female':
        return {
          voice: koreanVoices.find(v => v.name.includes('Female') || v.name.includes('여성')) || koreanVoices[0],
          pitch: 1.1,
          rate: 0.9
        };
      case 'male':
        return {
          voice: koreanVoices.find(v => v.name.includes('Male') || v.name.includes('남성')) || koreanVoices[1] || koreanVoices[0],
          pitch: 0.8,
          rate: 0.9
        };
      case 'child':
        return {
          voice: koreanVoices[0],
          pitch: 1.5,
          rate: 1.0
        };
      default:
        return {
          voice: koreanVoices[0],
          pitch: 1,
          rate: 0.9
        };
    }
  };

  const speak = useCallback((text: string, customVoiceType?: VoiceType) => {
    // 이미 재생 중이면 중지
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = getVoiceSettings(customVoiceType || voiceType);
    
    utterance.lang = 'ko-KR';
    if (settings.voice) {
      utterance.voice = settings.voice;
    }
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceType, availableVoices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, voiceType, setVoiceType };
};
