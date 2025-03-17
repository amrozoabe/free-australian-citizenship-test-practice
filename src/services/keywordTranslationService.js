// src/services/keywordTranslationService.js
import keywords from '../data/keywords.json';

/**
 * Analyze the question and options text to find matching keywords
 * @param {string} questionText - The question text
 * @param {string[]} options - Array of option texts
 * @param {string} userLanguage - User's selected language code
 * @returns {Object} Object with terms array
 */
export const analyzeQuestionAndOptions = async (questionText, options, userLanguage) => {
  try {
    // Combine the question and options into a single text for analysis
    const fullText = `${questionText} ${options.join(' ')}`;
    
    // Extract keywords from the text
    const matchingKeywords = findKeywordsInText(fullText, userLanguage);
    
    return {
      terms: matchingKeywords
    };
  } catch (error) {
    console.error('Error analyzing question:', error);
    return { terms: [] };
  }
};

/**
 * Convert a word to its singular form (basic implementation)
 * @param {string} word - Word to convert
 * @returns {string} Singular form
 */
const toSingular = (word) => {
  if (!word) return word;
  
  const lowercaseWord = word.toLowerCase();
  
  // Handle common plural endings
  if (lowercaseWord.endsWith('ies')) {
    return word.slice(0, -3) + 'y'; // e.g., "communities" -> "community"
  } else if (lowercaseWord.endsWith('es')) {
    // Special cases for -es
    if (lowercaseWord.endsWith('sses') || 
        lowercaseWord.endsWith('xes') || 
        lowercaseWord.endsWith('ches') || 
        lowercaseWord.endsWith('shes')) {
      return word.slice(0, -2); // e.g., "buses" -> "bus"
    }
    return word.slice(0, -1); // e.g., "touches" -> "touche"
  } else if (lowercaseWord.endsWith('s') && !lowercaseWord.endsWith('ss')) {
    return word.slice(0, -1); // e.g., "dogs" -> "dog"
  }
  
  return word; // If no rules match, return the original word
};

/**
 * Convert a word to its plural form (basic implementation)
 * @param {string} word - Word to convert
 * @returns {string} Plural form
 */
const toPlural = (word) => {
  if (!word) return word;
  
  const lowercaseWord = word.toLowerCase();
  
  // Handle common singular endings for plurality
  if (lowercaseWord.endsWith('y') && 
      !['ay', 'ey', 'oy', 'uy'].some(ending => lowercaseWord.endsWith(ending))) {
    return word.slice(0, -1) + 'ies'; // e.g., "community" -> "communities"
  } else if (lowercaseWord.endsWith('s') || 
             lowercaseWord.endsWith('x') || 
             lowercaseWord.endsWith('ch') || 
             lowercaseWord.endsWith('sh')) {
    return word + 'es'; // e.g., "bus" -> "buses", "box" -> "boxes"
  } else {
    return word + 's'; // e.g., "dog" -> "dogs"
  }
};

/**
 * Find keywords in the provided text, accounting for singular/plural forms
 * @param {string} text - Text to search for keywords
 * @param {string} userLanguage - User's language code
 * @returns {Array} Array of term objects
 */
const findKeywordsInText = (text, userLanguage) => {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return [];
  }
  
  const foundTerms = [];
  const processedTerms = new Set(); // Track terms we've already processed
  const lowercaseText = text.toLowerCase();
  
  // First preprocess the keywords to handle both object and string format
  const keywordObjects = keywords.map(item => {
    if (typeof item === 'string') {
      return { word: item, definition: 'Term related to Australian citizenship.' };
    }
    return item;
  });
  
  // Extract words from text
  const textWords = new Set();
  
  // Split text by spaces, then clean each word
  text.split(/\s+/).forEach(word => {
    // Remove punctuation and convert to lowercase
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length >= 3) { // Only consider words that are at least 3 characters
      textWords.add(cleanWord);
      // Also add singular/plural forms of the word
      textWords.add(toSingular(cleanWord).toLowerCase());
      textWords.add(toPlural(cleanWord).toLowerCase());
    }
  });
  
  // Check each keyword against our text words
  keywordObjects.forEach(keywordObj => {
    if (!keywordObj.word) return;
    
    const keywordWord = keywordObj.word;
    const keywordLower = keywordWord.toLowerCase();
    
    // Skip if we've already processed this term
    if (processedTerms.has(keywordLower)) return;
    
    // Get singular and plural forms
    const singularForm = toSingular(keywordWord).toLowerCase();
    const pluralForm = toPlural(singularForm).toLowerCase();
    
    // Check if any form (original, singular, plural) appears in text words
    const originalMatch = textWords.has(keywordLower);
    const singularMatch = singularForm !== keywordLower && textWords.has(singularForm);
    const pluralMatch = pluralForm !== keywordLower && textWords.has(pluralForm);
    
    // Also check for direct matches in the text (for multi-word terms)
    const directMatch = keywordWord.split(' ').length > 1 && 
                       lowercaseText.includes(keywordLower);
    
    if (originalMatch || singularMatch || pluralMatch || directMatch) {
      processedTerms.add(keywordLower);
      processedTerms.add(singularForm);
      processedTerms.add(pluralForm);
      
      // Get translation for this language
      const translation = keywordObj.translations ? 
                         keywordObj.translations[userLanguage] : null;
      
      // Add the term with its definition and translation
      foundTerms.push({
        term: keywordObj.word,
        explanation: keywordObj.definition || 'Term related to Australian citizenship.',
        translation: translation
      });
    }

  });
  
  return foundTerms;
};

/**
 * Fallback analysis when keyword database lookup fails
 * @param {string} text - Text to analyze
 * @param {string} userLanguage - User's language code
 * @returns {Object} Object with terms
 */
export const getFallbackAnalysis = (text, userLanguage) => {
  // Some common Australian citizenship terms with explanations
  const commonTerms = [
    {
      word: 'Parliamentary democracy',
      definition: 'A system of government where citizens elect representatives to form a parliament to make laws.',
      translations: {
        'zh-CN': '议会民主制',
        'ar': 'الديمقراطية البرلمانية',
        'hi': 'संसदीय लोकतंत्र',
        'vi': 'Nền dân chủ nghị viện',
        'es': 'Democracia parlamentaria',
        'fr': 'Démocratie parlementaire'
      }
    },
    {
      word: 'Federation',
      definition: 'The joining of the six separate British colonies to form the Commonwealth of Australia in 1901.',
      translations: {
        'zh-CN': '联邦制',
        'ar': 'الاتحاد الفيدرالي',
        'hi': 'संघ',
        'vi': 'Liên bang',
        'es': 'Federación',
        'fr': 'Fédération'
      }
    },
    {
      word: 'Referendum',
      definition: 'A vote by all eligible citizens on a proposal to change the Australian Constitution.',
      translations: {
        'zh-CN': '全民公投',
        'ar': 'استفتاء',
        'hi': 'जनमत संग्रह',
        'vi': 'Trưng cầu dân ý',
        'es': 'Referéndum',
        'fr': 'Référendum'
      }
    },
    {
      word: 'Mateship',
      definition: 'An Australian cultural concept that emphasizes equality, loyalty, and friendship.',
      translations: {
        'zh-CN': '伙伴情谊',
        'ar': 'الصداقة والتضامن',
        'hi': 'मित्रता',
        'vi': 'Tình bằng hữu',
        'es': 'Camaradería',
        'fr': 'Camaraderie'
      }
    },
    {
      word: 'Rule of Law',
      definition: 'The principle that all people, including those in authority, are subject to the same laws.',
      translations: {
        'zh-CN': '法治',
        'ar': 'سيادة القانون',
        'hi': 'कानून का शासन',
        'vi': 'Pháp quyền',
        'es': 'Estado de derecho',
        'fr': 'État de droit'
      }
    },
    {
      word: 'Anzac Day',
      definition: 'National day of remembrance on April 25 that commemorates the landing of Australian and New Zealand forces at Gallipoli.',
      translations: {
        'zh-CN': '澳新军团日',
        'ar': 'يوم أنزاك',
        'hi': 'अंज़ाक दिवस',
        'vi': 'Ngày Anzac',
        'es': 'Día de Anzac',
        'fr': 'Jour d\'Anzac'
      }
    },
    {
      word: 'Indigenous Australians',
      definition: 'The Aboriginal and Torres Strait Islander peoples, who are the original inhabitants of Australia.',
      translations: {
        'zh-CN': '澳大利亚原住民',
        'ar': 'السكان الأصليون الأستراليون',
        'hi': 'ऑस्ट्रेलिया के आदिवासी',
        'vi': 'Người bản địa Úc',
        'es': 'Indígenas australianos',
        'fr': 'Australiens autochtones'
      }
    }
  ];
  
  const textWords = new Set();
  
  // Extract words from text
  text.split(/\s+/).forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length >= 3) {
      textWords.add(cleanWord);
      textWords.add(toSingular(cleanWord).toLowerCase());
      textWords.add(toPlural(cleanWord).toLowerCase());
    }
  });
  
  const matchedTerms = [];
  const processedTerms = new Set();
  
  commonTerms.forEach(term => {
    if (!term.word) return;
    
    const wordLower = term.word.toLowerCase();
    
    if (processedTerms.has(wordLower)) return;
    
    const singularForm = toSingular(term.word).toLowerCase();
    const pluralForm = toPlural(singularForm).toLowerCase();
    
    const directMatch = text.toLowerCase().includes(wordLower);
    const singularMatch = singularForm !== wordLower && textWords.has(singularForm);
    const pluralMatch = pluralForm !== wordLower && textWords.has(pluralForm);
    
    if (directMatch || singularMatch || pluralMatch) {
      processedTerms.add(wordLower);
      processedTerms.add(singularForm);
      processedTerms.add(pluralForm);
      
      matchedTerms.push({
        term: term.word,
        explanation: term.definition,
        translation: term.translations ? term.translations[userLanguage] : null
      });
    }
  });
  
  return {
    terms: matchedTerms.slice(0, 100)
  };
};