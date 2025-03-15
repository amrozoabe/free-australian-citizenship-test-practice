// src/services/keywordTranslationService.js
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the database when the service is first imported
GlobalTermsDatabase.init();

// Simple cache implementation (since QuizAnalysisCache seems to be causing issues)
const CACHE_PREFIX = '@keyword_cache_';

/**
 * Identifies key citizenship terms from text that match with keywords in our database
 * @param {string} text - The text to analyze
 * @returns {string[]} - Array of identified key terms
 */
const identifyKeyTerms = (text) => {
  if (!text) return [];

  // Get all known terms from the database
  const allTerms = GlobalTermsDatabase.getAllTerms();
  const knownTerms = Object.keys(allTerms);
  
  // Find which known terms appear in the text
  const normalizedText = text.toLowerCase();
  const identifiedTerms = [];
  
  // Sort terms by length (longest first) to handle cases where one term is part of another
  knownTerms.sort((a, b) => b.length - a.length);
  
  for (const term of knownTerms) {
    // Use word boundary check when possible
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(text) || normalizedText.includes(term.toLowerCase())) {
      identifiedTerms.push(term);
    }
  }

  return identifiedTerms;
};

/**
 * Analyzes a question and its options using only the keywords.json database
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
    
    // Generate a simple cache key
    const cacheKey = `${CACHE_PREFIX}${hashString(fullText)}_${language}`;
    
    // Check cache first
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        console.log('Found cached analysis for this question');
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.log('Cache miss or error:', error.message);
    }
    
    // Identify key terms from the question and options
    const keyTerms = identifyKeyTerms(fullText);
    console.log('Identified key terms:', keyTerms);
    
    // Get terms information from the database
    const termsInfo = GlobalTermsDatabase.analyzeText(fullText, language, keyTerms);
    
    const result = { terms: termsInfo };
    
    // Store in cache for future use
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
  // First check the database for any terms
  const keyTerms = identifyKeyTerms(text);
  const databaseTerms = GlobalTermsDatabase.analyzeText(text, language, keyTerms);
  
  return { terms: databaseTerms };
};

/**
 * Create a simple hash from a string for cache keys
 * @param {string} str - The string to hash
 * @returns {string} - A hash string
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Export the service functions
export { identifyKeyTerms, analyzeQuestionAndOptions, getFallbackAnalysis };

export default {
  identifyKeyTerms,
  analyzeQuestionAndOptions,
  getFallbackAnalysis
};