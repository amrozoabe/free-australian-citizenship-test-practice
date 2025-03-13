// src/services/claudeTranslationService.js
import axios from 'axios';
import { CLAUDE_API_KEY } from '@env';
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';
import QuizAnalysisCache from '../utils/QuizAnalysisCache';

// Initialize the database when the service is first imported
GlobalTermsDatabase.init();

// Enhanced identifyKeyTerms function for Claude Translation Service

/**
 * Improved method to identify key citizenship terms from text
 * Uses a more comprehensive pattern matching approach
 * @param {string} text - The text to analyze
 * @returns {string[]} - Array of identified key terms
 */
const identifyKeyTerms = (text) => {
  if (!text) return [];

  // Common Australian citizenship test keywords to look for
  const citizenshipKeywords = [
    // Existing keywords
    'anzac', 'aboriginal', 'torres strait', 'democracy', 'parliament', 'constitution',
    'federation', 'governor', 'prime minister', 'referendum', 'commonwealth',
    'legislation', 'national', 'citizenship', 'migrants', 'settlers', 'flag',
    'anthem', 'indigenous', 'monarchy', 'government', 'election', 'vote',
    'senate', 'representative', 'court', 'law', 'rights', 'responsibilities',
    'values', 'freedom', 'equality', 'mateship', 'gallipoli', 'nation',
    
    // Added national anthem related terms
    'australians', 'rejoice', 'beneath', 'radiant', 'southern cross', 'young', 'free',
    'national anthem', 'advance australia fair', 'girt', 'sea', 'golden soil', 'wealth',
    'toil', 'nature', 'beauty', 'history', 'page', 'commonwealth', 'star',
    
    // Added general vocabulary that might be challenging
    'sentence', 'symbol', 'emblem', 'oath', 'pledge', 'allegiance', 'sovereign',
    'ceremony', 'heritage', 'tradition', 'culture', 'identity', 'boundary', 'territory',
    'resident', 'eligibility', 'requirement'
  ];

  // Additional terms that are always relevant to check
  const alwaysCheckTerms = [
    'national anthem', 'southern cross', 'young and free', 'let us rejoice',
    'beneath', 'radiant', 'sentence', 'australians all'
  ];
  
  // Define a function to identify potential terms in the text
  const normalizedText = text.toLowerCase();
  const identifiedTerms = new Set();
  
  // First, check for any specifically defined always-check terms
  alwaysCheckTerms.forEach(term => {
    if (normalizedText.includes(term.toLowerCase())) {
      identifiedTerms.add(term);
    }
  });

  // Split text into words and clean them
  const words = normalizedText.split(/\s+/);
  const cleanWords = words.map(word => word.trim().replace(/[.,!?'"()]/g, ''));
  
  // Find single-word matches
  cleanWords.forEach(word => {
    if (word && citizenshipKeywords.includes(word)) {
      identifiedTerms.add(word);
    }
    
    // Also look for words not in the predefined list that might be important
    // These are usually longer words or proper nouns
    if (word.length > 6 && !commonWords.has(word)) {
      identifiedTerms.add(word);
    }
  });

  // Find multi-word phrases (2-3 words)
  for (let i = 0; i < words.length - 1; i++) {
    // Try two-word combinations
    const twoWordPhrase = (cleanWords[i] + ' ' + cleanWords[i+1]).trim();
    if (citizenshipKeywords.includes(twoWordPhrase)) {
      identifiedTerms.add(twoWordPhrase);
    }
    
    // Try three-word combinations
    if (i < words.length - 2) {
      const threeWordPhrase = (cleanWords[i] + ' ' + cleanWords[i+1] + ' ' + cleanWords[i+2]).trim();
      if (citizenshipKeywords.includes(threeWordPhrase)) {
        identifiedTerms.add(threeWordPhrase);
      }
    }
  }

  // Look for proper nouns (capitalized words) in the original text
  const properNouns = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  properNouns.forEach(noun => {
    identifiedTerms.add(noun.toLowerCase());
  });
  
  // Look for quotations, which often contain important phrases
  const quotations = text.match(/["'](.+?)["']/g) || [];
  quotations.forEach(quote => {
    // Remove the quotes and add the content
    const cleanQuote = quote.replace(/["']/g, '').toLowerCase();
    identifiedTerms.add(cleanQuote);
    
    // If the quote contains multiple words, also add those individually
    const quoteWords = cleanQuote.split(/\s+/);
    quoteWords.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        identifiedTerms.add(word);
      }
    });
  });

  // Make sure we're not returning too many terms (limit to 20 most important)
  return Array.from(identifiedTerms).slice(0, 20);
};

// List of common words to ignore
const commonWords = new Set([
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'her', 'they', 'from', 'she', 'will', 'been', 'has', 'are', 'was',
  'all', 'who', 'what', 'when', 'why', 'how', 'where', 'which', 'there',
  'than', 'them', 'then', 'its', 'our', 'we', 'were'
]);

export default identifyKeyTerms;

/**
 * Analyzes a question and its options with Claude API
 * Uses the global database first, then calls Claude if needed
 * Enhanced to identify more terms and ensure comprehensive coverage
 * 
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
    
    // Check cache first
    const cachedResult = await QuizAnalysisCache.getFromCache(fullText, language);
    
    // Identify key terms from the question and options
    const keyTerms = identifyKeyTerms(fullText);
    console.log('Identified key terms:', keyTerms);
    
    // Check the global database for any existing terms
    const existingTerms = GlobalTermsDatabase.analyzeText(fullText, language, keyTerms);
    
    // If we have cached results, use them but ensure all identified terms are included
    if (cachedResult) {
      console.log('Using cached analysis result, but checking for additional terms');
      
      // Create a set of terms from the cached result
      const cachedTermsSet = new Set(cachedResult.terms.map(t => t.term.toLowerCase()));
      
      // Check if all current key terms are in the cached result
      const allTermsCovered = keyTerms.every(term => 
        cachedTermsSet.has(term) || cachedTermsSet.has(term.toLowerCase())
      );
      
      // If all terms are already covered, just return the cached result
      if (allTermsCovered) {
        console.log('All key terms are covered in cached result');
        return cachedResult;
      }
      
      // Otherwise, we should augment the cached result with new terms from the database
      console.log('Some key terms are missing from cached result, augmenting...');
      const combinedTerms = [...cachedResult.terms];
      
      // Add any database terms that aren't already in the cached result
      for (const dbTerm of existingTerms) {
        if (!cachedTermsSet.has(dbTerm.term.toLowerCase())) {
          combinedTerms.push(dbTerm);
          cachedTermsSet.add(dbTerm.term.toLowerCase());
        }
      }
      
      // Check if we need to call the API for any missing terms
      const missingTerms = keyTerms.filter(term => 
        !cachedTermsSet.has(term) && !cachedTermsSet.has(term.toLowerCase())
      );
      
      // If there are no missing terms or we don't have an API key, return the combined results
      if (missingTerms.length === 0 || !CLAUDE_API_KEY) {
        const augmentedResult = { terms: combinedTerms };
        await QuizAnalysisCache.saveToCache(fullText, language, augmentedResult);
        return augmentedResult;
      }
      
      // If we get here, we need to call the API for the missing terms
      console.log('Calling API for missing terms:', missingTerms);
      try {
        const apiResult = await callClaudeAPIForTerms(fullText, missingTerms, language);
        if (apiResult && apiResult.terms) {
          // Add the new terms to our result and save to database
          for (const term of apiResult.terms) {
            if (!cachedTermsSet.has(term.term.toLowerCase())) {
              combinedTerms.push(term);
              cachedTermsSet.add(term.term.toLowerCase());
              
              // Save to database
              if (term.term && term.explanation) {
                await GlobalTermsDatabase.addTerm(term.term, term.explanation);
              }
              
              if (term.term && term.translation) {
                await GlobalTermsDatabase.addTranslation(term.term, language, term.translation);
              }
            }
          }
        }
        
        const finalResult = { terms: combinedTerms };
        await QuizAnalysisCache.saveToCache(fullText, language, finalResult);
        return finalResult;
      } catch (error) {
        console.error('Error calling API for missing terms:', error);
        // Return what we have so far
        return { terms: combinedTerms };
      }
    }
    
    // If we don't have cached results, continue with normal flow
    // If we found terms in our database and they all have translations,
    // save to cache and return them without calling Claude API
    const allHaveTranslations = existingTerms.every(term => !!term.translation);
    const allTermsCovered = keyTerms.every(term => 
      existingTerms.some(dbTerm => 
        dbTerm.term.toLowerCase() === term.toLowerCase()
      )
    );
    
    if (existingTerms.length > 0 && allHaveTranslations && allTermsCovered) {
      console.log('Using terms from global database:', existingTerms.length);
      const result = { terms: existingTerms };
      // Store in cache
      await QuizAnalysisCache.saveToCache(fullText, language, result);
      return result;
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      const fallbackResult = getFallbackAnalysis(fullText, language);
      await QuizAnalysisCache.saveToCache(fullText, language, fallbackResult);
      return fallbackResult;
    }

    console.log('Analyzing question and options with Claude API...');
    
    // Create the prompt for Claude with specific instructions for key citizenship terms
    const prompt = `
You are helping non-native English speakers prepare for the Australian citizenship test.

Analyze this question and its answer options:

Question: "${questionText}"

Options:
${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}

Please identify ALL important terms that might be difficult for someone learning English, including:
1. Key words related to Australian citizenship, governance, history, culture, or values
2. Words or phrases from the Australian national anthem or other national symbols
3. Any proper nouns, specialized terms, or words that might be unfamiliar to non-native English speakers
4. Do not skip any potentially difficult words, even if they seem basic to native speakers

For EACH identified term:
1. Provide a clear, simple explanation in English (focus on the Australian context when relevant)
2. Provide a translation in ${language}

The following specific terms MUST be included if they appear in the text:
- national anthem
- southern cross
- young and free
- let us rejoice 
- beneath
- radiant
- sentence
- australians all

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
        const mergedResult = mergeDatabaseAndClaudeResults(existingTerms, result.terms);
        
        // Store in cache for future use
        await QuizAnalysisCache.saveToCache(fullText, language, mergedResult);
        
        return mergedResult;
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    // If we get here, we couldn't parse the result
    const fallbackResult = getFallbackAnalysis(fullText, language);
    await QuizAnalysisCache.saveToCache(fullText, language, fallbackResult);
    return fallbackResult;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    const fallbackResult = getFallbackAnalysis(questionText + ' ' + options.join(' '), language);
    await QuizAnalysisCache.saveToCache(questionText + ' ' + options.join(' '), language, fallbackResult);
    return fallbackResult;
  }
};

/**
 * Call Claude API specifically for a set of terms that need definitions and translations
 * @param {string} text - The full text context 
 * @param {string[]} terms - The specific terms to get definitions and translations for
 * @param {string} language - The target language code
 * @returns {Promise<Object>} - Object containing terms with explanations and translations
 */
async function callClaudeAPIForTerms(text, terms, language) {
  if (!terms || terms.length === 0) {
    return { terms: [] };
  }
  
  console.log('Calling Claude API for specific terms:', terms);
  
  const prompt = `
You are helping non-native English speakers prepare for the Australian citizenship test.

Here is the context text:
"${text}"

I need you to provide definitions and translations for these specific terms from the text:
${terms.map(term => `- ${term}`).join('\n')}

For EACH term:
1. Provide a clear, simple explanation in English (focus on the Australian context when relevant)
2. Provide a translation in ${language}

Return ONLY a JSON object with this structure:
{
  "terms": [
    {
      "term": "term from the list",
      "explanation": "simple explanation in English",
      "translation": "translation in ${language}"
    },
    ...
  ]
}
`;

  // Call Claude API
  try {
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
    
    console.log('Claude API response received for specific terms');
    
    // Parse the response
    const content = response.data.content[0].text;
    
    // Parse the JSON from Claude's response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    }
    
    return { terms: [] };
  } catch (error) {
    console.error('Error calling Claude API for specific terms:', error);
    return { terms: [] };
  }
}

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
    
    // Check cache first
    const cachedResult = await QuizAnalysisCache.getFromCache(fullText, language);
    if (cachedResult) {
      console.log('Using cached analysis result');
      return cachedResult;
    }
    
    // Identify key terms from the question and options
    const keyTerms = identifyKeyTerms(fullText);
    
    // Check the global database for any existing terms
    const existingTerms = GlobalTermsDatabase.analyzeText(fullText, language, keyTerms);
    
    // If we found terms in our database and they all have translations,
    // save to cache and return them without calling Claude API
    const allHaveTranslations = existingTerms.every(term => !!term.translation);
    if (existingTerms.length > 0 && allHaveTranslations) {
      console.log('Using terms from global database:', existingTerms.length);
      const result = { terms: existingTerms };
      // Store in cache
      await QuizAnalysisCache.saveToCache(fullText, language, result);
      return result;
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      const fallbackResult = getFallbackAnalysis(fullText, language);
      await QuizAnalysisCache.saveToCache(fullText, language, fallbackResult);
      return fallbackResult;
    }

    console.log('Analyzing question and options with Claude API...');
    
    // Create the prompt for Claude with specific instructions for key citizenship terms
    const prompt = `
You are helping non-native English speakers prepare for the Australian citizenship test.

Analyze this question and its answer options:

Question: "${questionText}"

Options:
${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}

Identify important terms related to Australian citizenship, governance, history, culture, or values that might be difficult for someone learning English.

For each identified term:
1. Provide a clear, simple explanation in English (focus on the Australian context)
2. Provide a translation in ${language}

Focus on these types of terms:
- Historical events, dates, periods (like Anzac Day, Federation)
- Place names (like Gallipoli)
- People's names and titles
- Political and legal concepts (parliament, democracy)
- Cultural practices, symbols, and values
- Government institutions and roles

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
        const mergedResult = mergeDatabaseAndClaudeResults(existingTerms, result.terms);
        
        // Store in cache for future use
        await QuizAnalysisCache.saveToCache(fullText, language, mergedResult);
        
        return mergedResult;
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    // If we get here, we couldn't parse the result
    const fallbackResult = getFallbackAnalysis(fullText, language);
    await QuizAnalysisCache.saveToCache(fullText, language, fallbackResult);
    return fallbackResult;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    const fallbackResult = getFallbackAnalysis(questionText + ' ' + options.join(' '), language);
    await QuizAnalysisCache.saveToCache(questionText + ' ' + options.join(' '), language, fallbackResult);
    return fallbackResult;
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

// Enhanced fallback terms for offline use - extended list
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
  "anzac day": {
    explanation: "A national day of remembrance in Australia and New Zealand that commemorates those who served and died in wars and conflicts",
    translations: {
      "zh-CN": "澳新军团日",
      "zh-TW": "澳紐軍團日",
      "ar": "يوم أنزاك",
      "es": "Día de Anzac",
      "fr": "Jour d'Anzac"
    }
  },
  "gallipoli": {
    explanation: "A peninsula in Turkey where Australian and New Zealand forces landed during World War I",
    translations: {
      "zh-CN": "加利波利",
      "zh-TW": "加利波利",
      "ar": "غاليبولي",
      "es": "Galípoli",
      "fr": "Gallipoli"
    }
  },
  "landing": {
    explanation: "The act of coming to shore from a boat or ship",
    translations: {
      "zh-CN": "登陆",
      "zh-TW": "登陸",
      "ar": "هبوط",
      "es": "desembarco",
      "fr": "débarquement"
    }
  },
  "settlers": {
    explanation: "People who move to a new place to live permanently",
    translations: {
      "zh-CN": "定居者",
      "zh-TW": "定居者",
      "ar": "المستوطنون",
      "es": "colonos",
      "fr": "colons"
    }
  },
  "federation": {
    explanation: "The process of forming Australia as a nation by uniting separate colonies",
    translations: {
      "zh-CN": "联邦制",
      "zh-TW": "聯邦制",
      "ar": "اتحاد",
      "es": "federación",
      "fr": "fédération"
    }
  },
  // Add more entries as needed...
};

// Import fallback terms into the global database on initialization
// This ensures we have some data to work with even before any API calls
(async function() {
  await GlobalTermsDatabase.importPredefinedTerms(fallbackTerms);
})();

// Fallback function to use when Claude API is unavailable
export const getFallbackAnalysis = (text, language = 'en') => {
  // First check the global database
  const keyTerms = identifyKeyTerms(text);
  const databaseTerms = GlobalTermsDatabase.analyzeText(text, language, keyTerms);
  
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
  getFallbackAnalysis,
  identifyKeyTerms // Export for testing
};