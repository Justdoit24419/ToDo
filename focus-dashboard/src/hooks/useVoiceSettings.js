import { useState, useEffect } from 'react';

const VOICE_SETTINGS_KEY = 'pomodoro-voice-settings';

export const useVoiceSettings = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
    return saved !== null ? JSON.parse(saved) : true; // 기본값: 켜짐
  });

  useEffect(() => {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  const toggleVoice = () => {
    setVoiceEnabled(prev => !prev);
  };

  return {
    voiceEnabled,
    toggleVoice,
    setVoiceEnabled
  };
};
