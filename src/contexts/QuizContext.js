import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SET_NATIVE_LANGUAGE = 'SET_NATIVE_LANGUAGE';
const QuizContext = createContext();

// Define storage keys and default settings directly in this file
const storageKeys = {
  SCORES: '@quiz_scores',
  BOOKMARKS: '@quiz_bookmarks',
  PROGRESS: '@quiz_progress',
  SETTINGS: '@quiz_settings',
  COMPLETED_QUESTIONS: '@quiz_completed'
};

const defaultSettings = {
  theme: 'light',
  soundEnabled: true,
  vibrationEnabled: true,
  timerEnabled: true,
  nativeLanguage: 'en',
};

export function QuizProvider({ children }) {
  const [state, setState] = useState({
    scores: [],
    bookmarks: [],
    progress: {},
    settings: defaultSettings,
    statistics: {
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      timeSpent: 0,
      streakDays: 0,
      lastStudyDate: null,
    },
    completedQuestions: {},
    currentMode: 'practice',
    isLoading: true,
  });

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        scoresData,
        bookmarksData,
        progressData,
        settingsData,
        completedData
      ] = await Promise.all([
        AsyncStorage.getItem(storageKeys.SCORES),
        AsyncStorage.getItem(storageKeys.BOOKMARKS),
        AsyncStorage.getItem(storageKeys.PROGRESS),
        AsyncStorage.getItem(storageKeys.SETTINGS),
        AsyncStorage.getItem(storageKeys.COMPLETED_QUESTIONS),
      ]);

      setState(prevState => ({
        ...prevState,
        scores: scoresData ? JSON.parse(scoresData) : [],
        bookmarks: bookmarksData ? JSON.parse(bookmarksData) : [],
        progress: progressData ? JSON.parse(progressData) : {},
        settings: settingsData ? JSON.parse(settingsData) : defaultSettings,
        completedQuestions: completedData ? JSON.parse(completedData) : {},
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateStatistics = (scores) => {
    const totalQuestions = scores.reduce((acc, score) => acc + score.total, 0);
    const correctAnswers = scores.reduce((acc, score) => acc + score.score, 0);
    const averageScore = totalQuestions > 0 
      ? (correctAnswers / totalQuestions) * 100 
      : 0;

    return {
      totalQuestions,
      correctAnswers,
      averageScore: Math.round(averageScore * 100) / 100,
      timeSpent: scores.reduce((acc, score) => acc + (score.timeSpent || 0), 0),
      streakDays: calculateStreak(scores),
      lastStudyDate: scores.length > 0 ? scores[scores.length - 1]?.date : null,
    };
  };

  const calculateStreak = (scores) => {
    if (scores.length === 0) return 0;
    
    const today = new Date().setHours(0, 0, 0, 0);
    const dates = scores.map(score => 
      new Date(score.date).setHours(0, 0, 0, 0)
    );
    
    let streak = 0;
    let currentDate = today;
    
    while (dates.includes(currentDate)) {
      streak++;
      currentDate = new Date(currentDate - 86400000).setHours(0, 0, 0, 0);
    }
    
    return streak;
  };

  const value = {
    state,
    dispatch: async (action) => {
      try {
        switch (action.type) {
          case 'ADD_SCORE': {
            const newScores = [...state.scores, action.payload];
            await AsyncStorage.setItem(storageKeys.SCORES, JSON.stringify(newScores));
            setState(prevState => ({
              ...prevState,
              scores: newScores,
              statistics: updateStatistics(newScores)
            }));
            break;
          }

          case SET_NATIVE_LANGUAGE: {
            const newSettings = {
              ...state.settings,
              nativeLanguage: action.payload
            };
            
            await AsyncStorage.setItem(storageKeys.SETTINGS, JSON.stringify(newSettings));
            setState(prevState => ({
              ...prevState,
              settings: newSettings
            }));
            break;
          }

          case 'TOGGLE_BOOKMARK': {
            const questionId = action.payload;
            const newBookmarks = state.bookmarks.includes(questionId)
              ? state.bookmarks.filter(id => id !== questionId)
              : [...state.bookmarks, questionId];
            
            await AsyncStorage.setItem(storageKeys.BOOKMARKS, JSON.stringify(newBookmarks));
            setState(prevState => ({
              ...prevState,
              bookmarks: newBookmarks
            }));
            break;
          }

          case 'UPDATE_PROGRESS': {
            const newProgress = {
              ...state.progress,
              [action.payload.category]: {
                completed: action.payload.completed,
                total: action.payload.total
              }
            };
            
            await AsyncStorage.setItem(storageKeys.PROGRESS, JSON.stringify(newProgress));
            setState(prevState => ({
              ...prevState,
              progress: newProgress
            }));
            break;
          }

          case 'UPDATE_SETTINGS': {
            const newSettings = {
              ...state.settings,
              ...action.payload
            };
            
            await AsyncStorage.setItem(storageKeys.SETTINGS, JSON.stringify(newSettings));
            setState(prevState => ({
              ...prevState,
              settings: newSettings
            }));
            break;
          }

          case 'MARK_QUESTION_COMPLETED': {
            const newCompleted = {
              ...state.completedQuestions,
              [action.payload.questionId]: {
                completed: true,
                timestamp: new Date().toISOString(),
                correct: action.payload.correct
              }
            };
            
            await AsyncStorage.setItem(storageKeys.COMPLETED_QUESTIONS, JSON.stringify(newCompleted));
            setState(prevState => ({
              ...prevState,
              completedQuestions: newCompleted
            }));
            break;
          }

          case 'SET_MODE':
            setState(prevState => ({
              ...prevState,
              currentMode: action.payload
            }));
            break;

          case 'RESET_PROGRESS': {
            await Promise.all([
              AsyncStorage.removeItem(storageKeys.SCORES),
              AsyncStorage.removeItem(storageKeys.PROGRESS),
              AsyncStorage.removeItem(storageKeys.COMPLETED_QUESTIONS),
            ]);
            
            setState(prevState => ({
              ...prevState,
              scores: [],
              progress: {},
              completedQuestions: {},
              statistics: updateStatistics([])
            }));
            break;
          }
        }
      } catch (error) {
        console.error('Error in dispatch:', error);
      }
    }
  };

  if (state.isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}