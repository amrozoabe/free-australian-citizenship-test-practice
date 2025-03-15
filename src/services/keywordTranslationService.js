// src/services/keywordTranslationService.js
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the database when the service is first imported
GlobalTermsDatabase.init();

const CACHE_PREFIX = '@keyword_cache_';

/**
 * Analyzes a question and its options using the keywords database
 * 
 * @param {string} questionText - The question text
 * @param {string[]} options - The answer options
 * @param {string} language - The target language code
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
const analyzeQuestionAndOptions = async (questionText, options, language) => {
  try {
    if (!questionText || !options || !language) {
      return { terms: [] };
    }

    // Create a composite text for analysis
    const fullText = `${questionText} ${options.join(' ')}`;
    
    // Generate a cache key
    const cacheKey = `${CACHE_PREFIX}${hashString(fullText)}_${language}`;
    
    // Check cache
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.log('Cache miss or error:', error.message);
    }
    
    // Get terms information from the database
    const termsInfo = GlobalTermsDatabase.analyzeText(fullText, language);
    
    const result = { terms: termsInfo };
    
    // Store in cache
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      console.log('Error saving to cache:', error.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing question:', error);
    return { terms: [] };
  }
};

/**
 * Fallback function when no matches are found
 * @param {string} text - The text to analyze
 * @param {string} language - The target language code
 * @returns {Object} - Analysis result with minimal information
 */
const getFallbackAnalysis = (text, language = 'en') => {
  const databaseTerms = GlobalTermsDatabase.analyzeText(text, language);
  return { terms: databaseTerms };
};

/**
 * Create a simple hash from a string for cache keys
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export { analyzeQuestionAndOptions, getFallbackAnalysis };

export default {
  analyzeQuestionAndOptions,
  getFallbackAnalysis
};