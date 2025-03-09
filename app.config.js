// src/config/appConfig.js

export default {
  // App information
  appName: 'Australian Citizenship Test Practice',
  version: '1.0.0',
  
  // Quiz settings
  quiz: {
    defaultQuizLength: 20,
    passThreshold: 75, // 75% is passing score
    timeLimit: 45 * 60, // 45 minutes in seconds
  },
  
  // Default user settings
  defaultSettings: {
    theme: 'light',
    soundEnabled: true,
    vibrationEnabled: true,
    timerEnabled: true,
    nativeLanguage: 'en',
  },
  
  // API settings
  api: {
    claudeModel: "claude-3-opus-20240229",
    claudeMaxTokens: 2000,
  },
  
  // Storage keys
  storageKeys: {
    SCORES: '@quiz_scores',
    BOOKMARKS: '@quiz_bookmarks',
    PROGRESS: '@quiz_progress',
    SETTINGS: '@quiz_settings',
    COMPLETED_QUESTIONS: '@quiz_completed'
  }
};