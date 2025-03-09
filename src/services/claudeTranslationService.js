// src/services/claudeTranslationService.js
import axios from 'axios';
import { CLAUDE_API_KEY } from '@env';
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';

// Initialize the database when the service is first imported
GlobalTermsDatabase.init();

/**
 * Analyzes a question with Claude API to identify complicated terms and translate them
 * Uses the global terms database first, then falls back to API call if needed
 * @param {string} questionText - The text of the citizenship test question
 * @param {string} language - The target language code for translation
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
export const analyzeQuestion = async (questionText, language) => {
  try {
    if (!questionText || !language) {
      console.log('Missing question text or language');
      return { terms: [] };
    }

    // First, check the global database for any existing terms
    const existingTerms = GlobalTermsDatabase.analyzeText(questionText, language);
    
    // If we found terms in our database and they all have translations,
    // return them without calling Claude API
    const allHaveTranslations = existingTerms.every(term => !!term.translation);
    if (existingTerms.length > 0 && allHaveTranslations) {
      console.log('Using terms from global database:', existingTerms.length);
      return { terms: existingTerms };
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      return getFallbackAnalysis(questionText, language);
    }

    console.log('Analyzing question with Claude API...');
    
    // Create the prompt for Claude
    const prompt = `
You are helping non-English speakers prepare for the Australian citizenship test.

Analyze the following question from the Australian citizenship test:
"${questionText}"

Please identify any potentially complicated words, terms, phrases, or concepts that might be difficult for non-native English speakers to understand.

For each identified term:
1. Provide a clear, simple explanation in English
2. Provide a translation into ${language}

Return ONLY a JSON object with this structure:
{
  "terms": [
    {
      "term": "identified term",
      "explanation": "simple explanation in English",
      "translation": "translation in ${language}"
    },
    ...
  ]
}
`;

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Claude API response received');
    
    // Parse the response
    const content = response.data.content[0].text;
    try {
      // Parse the JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);
        
        // Save these terms to the global database for future use
        if (result.terms && Array.isArray(result.terms)) {
          await saveTermsToGlobalDatabase(result.terms, language);
        }
        
        // Combine any existing terms from database with new ones from Claude
        return mergeDatabaseAndClaudeResults(existingTerms, result.terms);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    // If we get here, we couldn't parse the result
    const fallbackResult = getFallbackAnalysis(questionText, language);
    return fallbackResult;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return getFallbackAnalysis(questionText, language);
  }
};

/**
 * Analyzes a question and its options with Claude API
 * Uses the global database first, then calls Claude if needed
 * @param {string} questionText - The question text
 * @param {string[]} options - The answer options
 * @param {string} language - The target language code
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
export const analyzeQuestionAndOptions = async (questionText, options, language) => {
  try {
    if (!questionText || !options || !language) {
      return { terms: [] };
    }

    // Create a composite text for analysis
    const fullText = `${questionText} ${options.join(' ')}`;
    
    // First, check the global database for any existing terms
    const existingTerms = GlobalTermsDatabase.analyzeText(fullText, language);
    
    // If we found terms in our database and they all have translations,
    // return them without calling Claude API
    const allHaveTranslations = existingTerms.every(term => !!term.translation);
    if (existingTerms.length > 0 && allHaveTranslations) {
      console.log('Using terms from global database:', existingTerms.length);
      return { terms: existingTerms };
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      return getFallbackAnalysis(fullText, language);
    }

    console.log('Analyzing question and options with Claude API...');
    
    // Create the prompt for Claude
    const prompt = `
You are helping non-native English speakers prepare for the Australian citizenship test.

Analyze this question and its answer options:

Question: "${questionText}"

Options:
${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}

Identify any words, terms, or phrases that might be difficult for someone learning English. 
Focus only on important words related to Australian citizenship, government, history, or culture.
Do not include basic English words.

For each identified term:
1. Provide a clear, simple explanation in English
2. Provide a translation in ${language}

Return ONLY a JSON object with this structure:
{
  "terms": [
    {
      "term": "identified term",
      "explanation": "simple explanation in English",
      "translation": "translation in ${language}"
    },
    ...
  ]
}
`;

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Claude API response received');
    
    // Parse the response
    const content = response.data.content[0].text;
    try {
      // Parse the JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);
        
        // Save these terms to the global database for future use
        if (result.terms && Array.isArray(result.terms)) {
          await saveTermsToGlobalDatabase(result.terms, language);
        }
        
        // Combine any existing terms from database with new ones from Claude
        return mergeDatabaseAndClaudeResults(existingTerms, result.terms);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    // If we get here, we couldn't parse the result
    const fallbackResult = getFallbackAnalysis(fullText, language);
    return fallbackResult;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return getFallbackAnalysis(questionText + ' ' + options.join(' '), language);
  }
};

/**
 * Save terms and translations to the global database
 * @param {Array} terms - Array of term objects
 * @param {string} language - The language code
 * @returns {Promise<void>}
 */
const saveTermsToGlobalDatabase = async (terms, language) => {
  try {
    if (!terms || !Array.isArray(terms)) return;
    
    for (const termObj of terms) {
      const { term, explanation, translation } = termObj;
      
      if (term && explanation) {
        await GlobalTermsDatabase.addTerm(term, explanation);
      }
      
      if (term && translation) {
        await GlobalTermsDatabase.addTranslation(term, language, translation);
      }
    }
    
    console.log(`Saved ${terms.length} terms to global database`);
  } catch (error) {
    console.error('Error saving terms to global database:', error);
  }
};

/**
 * Merge terms from database and Claude API results
 * @param {Array} dbTerms - Terms from database
 * @param {Array} claudeTerms - Terms from Claude API
 * @returns {Object} - Combined results
 */
const mergeDatabaseAndClaudeResults = (dbTerms, claudeTerms) => {
  // Create a map of terms to easily identify duplicates
  const termsMap = new Map();
  
  // Add database terms first
  dbTerms.forEach(term => {
    termsMap.set(term.term.toLowerCase(), term);
  });
  
  // Add or update with Claude terms
  claudeTerms.forEach(term => {
    const lowercaseTerm = term.term.toLowerCase();
    // Only add if not already in the map, or update if we now have a translation
    if (!termsMap.has(lowercaseTerm) || 
        (!termsMap.get(lowercaseTerm).translation && term.translation)) {
      termsMap.set(lowercaseTerm, term);
    }
  });
  
  // Convert map back to array
  return { terms: Array.from(termsMap.values()) };
};

// Enhanced fallback terms for offline use
const fallbackTerms = {
  "democracy": {
    explanation: "A system of government where people choose their leaders by voting",
    translations: {
      "zh-CN": "民主",
      "zh-TW": "民主",
      "ar": "ديمقراطية",
      "pa": "ਲੋਕਤੰਤਰ",
      "hi": "लोकतंत्र",
      "fil": "demokrasya",
      "vi": "dân chủ",
      "es": "democracia",
      "fr": "démocratie"
    }
  },
  "citizenship": {
    explanation: "Being an official member of a country with rights and responsibilities",
    translations: {
      "zh-CN": "公民身份",
      "zh-TW": "公民身份",
      "ar": "المواطنة",
      "pa": "ਨਾਗਰਿਕਤਾ",
      "hi": "नागरिकता",
      "fil": "pagkamamamayan",
      "vi": "quốc tịch",
      "es": "ciudadanía",
      "fr": "citoyenneté"
    }
  },
  "constitution": {
    explanation: "The set of basic laws that defines how a country is governed",
    translations: {
      "zh-CN": "宪法",
      "zh-TW": "憲法",
      "ar": "الدستور",
      "pa": "ਸੰਵਿਧਾਨ",
      "hi": "संविधान",
      "fil": "konstitusyon",
      "vi": "hiến pháp",
      "es": "constitución",
      "fr": "constitution"
    }
  },
  "parliament": {
    explanation: "The group of elected people who make the laws in a country",
    translations: {
      "zh-CN": "议会",
      "zh-TW": "議會",
      "ar": "البرلمان",
      "pa": "ਸੰਸਦ",
      "hi": "संसद",
      "fil": "parlamento",
      "vi": "quốc hội",
      "es": "parlamento",
      "fr": "parlement"
    }
  },
  "referendum": {
    explanation: "A direct vote by all citizens on an important issue or law",
    translations: {
      "zh-CN": "公民投票",
      "zh-TW": "公民投票",
      "ar": "استفتاء",
      "pa": "ਜਨਮਤ ਸੰਗ੍ਰਹਿ",
      "hi": "जनमत संग्रह",
      "fil": "reperendum",
      "vi": "trưng cầu dân ý",
      "es": "referéndum",
      "fr": "référendum"
    }
  }
};

// Import fallback terms into the global database on initialization
// This ensures we have some data to work with even before any API calls
(async function() {
  await GlobalTermsDatabase.importPredefinedTerms(fallbackTerms);
})();

// Fallback function to use when Claude API is unavailable
export const getFallbackAnalysis = (text, language = 'en') => {
  // First check the global database
  const databaseTerms = GlobalTermsDatabase.analyzeText(text, language);
  
  // If we have terms from the database, use those
  if (databaseTerms.length > 0) {
    return { terms: databaseTerms };
  }
  
  // Otherwise use the static fallback terms
  const terms = [];
  const lowerText = text.toLowerCase();
  
  // Check all fallback terms against the text
  Object.keys(fallbackTerms).forEach(term => {
    if (lowerText.includes(term.toLowerCase())) {
      terms.push({
        term: term,
        explanation: fallbackTerms[term].explanation,
        translation: fallbackTerms[term].translations[language] || 
                    fallbackTerms[term].translations['en'] || 
                    term
      });
    }
  });
  
  return { terms };
};

export default {
  analyzeQuestion,
  analyzeQuestionAndOptions,
  getFallbackAnalysis
};