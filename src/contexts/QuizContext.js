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
  COMPLETED_QUESTIONS: '@quiz_completed',
  CATEGORY_STATS: '@quiz_category_stats' // New key for category statistics
};

const defaultSettings = {
  theme: 'light',
  soundEnabled: true,
  vibrationEnabled: true,
  timerEnabled: true,
  nativeLanguage: 'en',
};

// Define default statistics structure
const defaultStatistics = {
  totalQuestions: 0,
  correctAnswers: 0,
  averageScore: 0,
  timeSpent: 0,
  streakDays: 0,
  lastStudyDate: null,
  bestScore: 0,
  totalQuizAttempts: 0,
  passRate: 0,
  totalPassed: 0,
  // Values question stats
  valuesQuestions: {
    total: 0,
    correct: 0,
    accuracy: 0
  },
  // Category stats will be populated when loaded
  categoryStats: {
    'Part 1: Australia and its people': { total: 0, correct: 0, accuracy: 0 },
    'Part 2: Australia\'s democratic beliefs, rights and liberties': { total: 0, correct: 0, accuracy: 0 },
    'Part 3: Government and the law in Australia': { total: 0, correct: 0, accuracy: 0 },
    'Part 4: Australian values': { total: 0, correct: 0, accuracy: 0 }
  },
  // Time tracking
  lastWeekQuestions: 0,
  dailyActivity: {} // Format: { '2023-03-17': { questions: 10, correct: 8 } }
};

export function QuizProvider({ children }) {
  const [state, setState] = useState({
    scores: [],
    bookmarks: [],
    progress: {},
    settings: defaultSettings,
    statistics: defaultStatistics,
    completedQuestions: {},
    categoryStats: {},
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
        completedData,
        categoryStatsData
      ] = await Promise.all([
        AsyncStorage.getItem(storageKeys.SCORES),
        AsyncStorage.getItem(storageKeys.BOOKMARKS),
        AsyncStorage.getItem(storageKeys.PROGRESS),
        AsyncStorage.getItem(storageKeys.SETTINGS),
        AsyncStorage.getItem(storageKeys.COMPLETED_QUESTIONS),
        AsyncStorage.getItem(storageKeys.CATEGORY_STATS),
      ]);

      const parsedScores = scoresData ? JSON.parse(scoresData) : [];
      const parsedCategoryStats = categoryStatsData ? JSON.parse(categoryStatsData) : {};

      setState(prevState => {
        // Calculate statistics from loaded data
        const updatedStats = updateStatistics(parsedScores, parsedCategoryStats);
        
        return {
          ...prevState,
          scores: parsedScores,
          bookmarks: bookmarksData ? JSON.parse(bookmarksData) : [],
          progress: progressData ? JSON.parse(progressData) : {},
          settings: settingsData ? JSON.parse(settingsData) : defaultSettings,
          completedQuestions: completedData ? JSON.parse(completedData) : {},
          categoryStats: parsedCategoryStats,
          statistics: updatedStats,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateStatistics = (scores, categoryStats = {}) => {
    // Basic statistics
    const totalQuestions = scores.reduce((acc, score) => acc + score.total, 0);
    const correctAnswers = scores.reduce((acc, score) => acc + score.score, 0);
    const averageScore = totalQuestions > 0 
      ? (correctAnswers / totalQuestions) * 100 
      : 0;
    
    // Find best score
    const percentageScores = scores.map(score => 
      score.total > 0 ? (score.score / score.total) * 100 : 0
    );
    const bestScore = percentageScores.length > 0 ? Math.max(...percentageScores) : 0;
    
    // Calculate streak
    const streakDays = calculateStreak(scores);
    
    // Get last study date
    const lastStudyDate = scores.length > 0 
      ? scores[scores.length - 1]?.date 
      : null;
    
    // Calculate pass rate
    const totalAttempts = scores.length;
    const passedAttempts = scores.filter(score => score.passed).length;
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
    
    // Special tracking for values questions
    const valuesStats = {
      total: 0,
      correct: 0,
      accuracy: 0
    };
    
    // Extract values category if it exists
    if (categoryStats && categoryStats['Part 4: Australian values']) {
      valuesStats.total = categoryStats['Part 4: Australian values'].total || 0;
      valuesStats.correct = categoryStats['Part 4: Australian values'].correct || 0;
      valuesStats.accuracy = valuesStats.total > 0 
        ? Math.round((valuesStats.correct / valuesStats.total) * 100) 
        : 0;
    }
    
    // Calculate recent activity (last 7 days)
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    // Group questions by day for the last week
    const dailyActivity = {};
    const lastWeekQuestions = scores.reduce((total, score) => {
      const scoreDate = new Date(score.date);
      if (scoreDate >= oneWeekAgo) {
        // Format date as YYYY-MM-DD for the key
        const dateStr = scoreDate.toISOString().split('T')[0];
        
        if (!dailyActivity[dateStr]) {
          dailyActivity[dateStr] = { questions: 0, correct: 0 };
        }
        
        dailyActivity[dateStr].questions += score.total;
        dailyActivity[dateStr].correct += score.score;
        
        return total + score.total;
      }
      return total;
    }, 0);

    // Fill in missing days for the last week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailyActivity[dateStr]) {
        dailyActivity[dateStr] = { questions: 0, correct: 0 };
      }
    }
    
    return {
      totalQuestions,
      correctAnswers,
      averageScore: Math.round(averageScore * 100) / 100,
      timeSpent: scores.reduce((acc, score) => acc + (score.timeSpent || 0), 0),
      streakDays,
      lastStudyDate,
      bestScore: Math.round(bestScore * 100) / 100,
      totalQuizAttempts: scores.length,
      passRate: Math.round(passRate * 100) / 100,
      totalPassed: passedAttempts,
      valuesQuestions: valuesStats,
      categoryStats: categoryStats,
      lastWeekQuestions,
      dailyActivity
    };
  };

  const calculateStreak = (scores) => {
    if (scores.length === 0) return 0;
    
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Get unique dates when the user has done quizzes
    const uniqueDates = new Set();
    scores.forEach(score => {
      const dateStr = new Date(score.date).toDateString();
      uniqueDates.add(dateStr);
    });
    
    // Check if today is included
    const todayStr = new Date(today).toDateString();
    const hasQuizToday = uniqueDates.has(todayStr);
    
    // Sort dates in descending order
    const sortedDates = Array.from(uniqueDates)
      .map(dateStr => new Date(dateStr).getTime())
      .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
    // If no quiz today, check if there was one yesterday
    if (!hasQuizToday) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (!uniqueDates.has(yesterdayStr)) {
        return 0; // Streak broken
      }
    }
    
    // Count consecutive days
    let streak = hasQuizToday ? 1 : 0;
    let currentDate = hasQuizToday ? today : new Date(today).setDate(new Date(today).getDate() - 1);
    
    for (let i = hasQuizToday ? 0 : 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      // Check if there's a quiz on the previous day
      const prevDateStr = prevDate.toDateString();
      if (uniqueDates.has(prevDateStr)) {
        streak++;
        currentDate = prevDate.getTime();
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };

  // Update category stats from quiz results
  const updateCategoryStats = (categoryResults) => {
    const updatedStats = { ...state.categoryStats };
    
    // Update stats for each category
    Object.keys(categoryResults).forEach(category => {
      const result = categoryResults[category];
      
      if (!updatedStats[category]) {
        updatedStats[category] = { total: 0, correct: 0, accuracy: 0 };
      }
      
      updatedStats[category].total += result.total;
      updatedStats[category].correct += result.correct;
      
      // Recalculate accuracy
      updatedStats[category].accuracy = updatedStats[category].total > 0 
        ? Math.round((updatedStats[category].correct / updatedStats[category].total) * 100) 
        : 0;
    });
    
    return updatedStats;
  };

  const value = {
    state,
    dispatch: async (action) => {
      try {
        switch (action.type) {
          case 'ADD_SCORE': {
            const newScores = [...state.scores, action.payload];
            await AsyncStorage.setItem(storageKeys.SCORES, JSON.stringify(newScores));
            
            // Update category stats if available
            let updatedCategoryStats = { ...state.categoryStats };
            if (action.payload.categoryResults) {
              updatedCategoryStats = updateCategoryStats(action.payload.categoryResults);
              await AsyncStorage.setItem(storageKeys.CATEGORY_STATS, JSON.stringify(updatedCategoryStats));
            }
            
            setState(prevState => ({
              ...prevState,
              scores: newScores,
              categoryStats: updatedCategoryStats,
              statistics: updateStatistics(newScores, updatedCategoryStats)
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
                correct: action.payload.correct,
                section: action.payload.section // Store the question section
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
              AsyncStorage.removeItem(storageKeys.CATEGORY_STATS),
            ]);
            
            setState(prevState => ({
              ...prevState,
              scores: [],
              progress: {},
              completedQuestions: {},
              categoryStats: {},
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