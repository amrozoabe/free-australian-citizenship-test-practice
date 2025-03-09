// src/utils/QuizAnalysisCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = '@quiz_analysis_cache_';

/**
 * Utility class for caching Claude API analysis results
 */
class QuizAnalysisCache {
  /**
   * Generate a unique cache key for a question and language
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {string} - The cache key
   */
  static getCacheKey(questionText, language) {
    // Create a simple hash from the question text to use as part of the key
    let hash = 0;
    for (let i = 0; i < questionText.length; i++) {
      hash = ((hash << 5) - hash) + questionText.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    hash = Math.abs(hash).toString(16); // Convert to hex string
    
    return `${CACHE_KEY_PREFIX}${hash}_${language}`;
  }

  /**
   * Save analysis results to cache
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @param {Object} analysisData - The analysis data to cache
   * @returns {Promise<void>}
   */
  static async saveToCache(questionText, language, analysisData) {
    try {
      const key = this.getCacheKey(questionText, language);
      const dataToStore = {
        question: questionText,
        language,
        analysis: analysisData,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(dataToStore));
      console.log('Saved analysis to cache:', key);
    } catch (error) {
      console.error('Error saving analysis to cache:', error);
    }
  }

  /**
   * Get cached analysis results
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {Promise<Object|null>} - The cached analysis data or null if not found
   */
  static async getFromCache(questionText, language) {
    try {
      const key = this.getCacheKey(questionText, language);
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        console.log('No cached data found for:', key);
        return null;
      }
      
      const parsedData = JSON.parse(cachedData);
      console.log('Retrieved analysis from cache:', key);
      return parsedData.analysis;
    } catch (error) {
      console.error('Error getting analysis from cache:', error);
      return null;
    }
  }

  /**
   * Clear all cached analyses
   * @returns {Promise<void>}
   */
  static async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log('Cleared analysis cache, removed keys:', cacheKeys.length);
      }
    } catch (error) {
      console.error('Error clearing analysis cache:', error);
    }
  }
}

export default QuizAnalysisCache;