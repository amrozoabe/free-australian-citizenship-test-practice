// src/services/keywordTranslationService.js
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the database when the service is first imported
GlobalTermsDatabase.init();

const CACHE_PREFIX = '@keyword_cache_';

/**
 * Analyzes a question and its options using the keywords database
 * Improved to always return some terms
 * 
 * @param {string} questionText - The question text
 * @param {string[]} options - The answer options
 * @param {string} language - The target language code
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
const analyzeQuestionAndOptions = async (questionText, options, language) => {
  try {
    if (!questionText) {
      return { terms: [] };
    }

    // Create a composite text for analysis
    const fullText = `${questionText} ${options ? options.join(' ') : ''}`;
    
    // Generate a cache key
    const cacheKey = `${CACHE_PREFIX}${hashString(fullText)}_${language}`;
    
    // Check cache
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.terms && parsed.terms.length > 0) {
          return parsed;
        }
        // If cache exists but has no terms, continue to generate new ones
      }
    } catch (error) {
      console.log('Cache miss or error:', error.message);
    }
    
    // Get terms information from the database
    let termsInfo = GlobalTermsDatabase.analyzeText(fullText, language);
    
    // If we didn't find any terms, use a fallback approach
    if (!termsInfo || termsInfo.length === 0) {
      // Extract key nouns and proper nouns from the text as fallback terms
      const words = fullText.split(/\W+/).filter(w => w.length > 3);
      
      // Look for words that start with capital letters (proper nouns) or are common in citizenship tests
      const commonCitizenshipTerms = [
        "australia", "australian", "citizen", "citizenship", "government", 
        "parliament", "anzac", "federal", "constitution", "treaty", "law",
        "vote", "voting", "rights", "responsibilities", "democracy"
      ];
      
      const potentialTerms = words.filter(word => {
        const lowerWord = word.toLowerCase();
        return (
          word.charAt(0) === word.charAt(0).toUpperCase() || // Proper noun
          commonCitizenshipTerms.includes(lowerWord) // Common citizenship term
        );
      });
      
      // Add a few of these as terms
      const uniqueTerms = [...new Set(potentialTerms)];
      termsInfo = uniqueTerms.slice(0, 3).map(term => ({
        term: term.charAt(0).toUpperCase() + term.toLowerCase().slice(1),
        explanation: `An important concept related to Australian citizenship and values.`,
        translation: null
      }));
    }
    
    // Ensure we always have at least one term
    if (termsInfo.length === 0) {
      termsInfo = [{
        term: "Australian citizenship",
        explanation: "The status of being a legal citizen of Australia, with all associated rights and responsibilities.",
        translation: null
      }];
    }
    
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
    // Return some fallback terms even on error
    return { 
      terms: [{
        term: "Citizenship",
        explanation: "The status of being a citizen, with associated rights and responsibilities.",
        translation: null
      }]
    };
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
  
  // Ensure we always return at least one term
  if (!databaseTerms || databaseTerms.length === 0) {
    // Extract some key words from the text as terms
    const words = text.split(/\W+/).filter(w => w.length > 3);
    const candidateTerms = words.filter(w => 
      w.charAt(0) === w.charAt(0).toUpperCase() || 
      ["australia", "citizen", "government", "rights", "values"].includes(w.toLowerCase())
    );
    
    // Get unique terms
    const uniqueTerms = [...new Set(candidateTerms)];
    const fallbackTerms = uniqueTerms.slice(0, 2).map(term => ({
      term: term.charAt(0).toUpperCase() + term.toLowerCase().slice(1),
      explanation: `A key concept related to Australian citizenship.`,
      translation: null
    }));
    
    // Always include at least one term
    if (fallbackTerms.length === 0) {
      fallbackTerms.push({
        term: "Australian values",
        explanation: "The core principles and beliefs that are important to people living in Australia.",
        translation: null
      });
    }
    
    return { terms: fallbackTerms };
  }
  
  return { terms: databaseTerms };
};

/**
 * Create a simple hash from a string for cache keys
 */
function hashString(str) {
  if (!str) return '0';
  
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