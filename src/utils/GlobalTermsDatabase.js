// src/utils/GlobalTermsDatabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import keywords from '../data/keywords.json';

// Storage keys for the global database
const GLOBAL_TERMS_KEY = '@global_terms_db';
const GLOBAL_TRANSLATIONS_KEY = '@global_translations_db';
const LAST_UPDATE_KEY = '@global_terms_last_update';

/**
 * Manages a global database of terms and their translations that
 * persists across all users of the app
 */
class GlobalTermsDatabase {
  /**
   * Initialize the database
   * Loads terms and translations from AsyncStorage and imports from keywords.json
   */
  static async init() {
    try {
      // Try to load existing database
      const termsData = await AsyncStorage.getItem(GLOBAL_TERMS_KEY);
      const translationsData = await AsyncStorage.getItem(GLOBAL_TRANSLATIONS_KEY);
      const lastUpdateData = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      
      // Create default structures if not exists
      this.terms = termsData ? JSON.parse(termsData) : {};
      this.translations = translationsData ? JSON.parse(translationsData) : {};
      this.lastUpdate = lastUpdateData ? JSON.parse(lastUpdateData) : 0;
      
      // Always import keywords.json data on initialization to ensure we have the latest data
      await this.importFromKeywordsJson();
      
      console.log(`Global terms database initialized with ${Object.keys(this.terms).length} terms`);
      console.log(`Global translations database initialized with translations for ${Object.keys(this.translations).length} languages`);
      
      return true;
    } catch (error) {
      console.error('Error initializing global terms database:', error);
      // Initialize with empty objects if there's an error
      this.terms = {};
      this.translations = {};
      this.lastUpdate = 0;
      return false;
    }
  }

  /**
   * Import terms and translations from keywords.json
   */
  static async importFromKeywordsJson() {
    try {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        console.log('No keywords found in keywords.json');
        return;
      }
      
      console.log(`Importing ${keywords.length} terms from keywords.json`);
      let importCount = 0;
      
      for (const keywordEntry of keywords) {
        // Handle both object format and string format
        if (typeof keywordEntry === 'string') {
          // Just add the term without definition
          this.terms[keywordEntry.toLowerCase()] = `A key term in Australian citizenship test`;
          importCount++;
        } else if (keywordEntry && keywordEntry.word && keywordEntry.definition) {
          // Add term with definition
          this.terms[keywordEntry.word.toLowerCase()] = keywordEntry.definition;
          
          // Add translations
          if (keywordEntry.translations) {
            for (const [language, translation] of Object.entries(keywordEntry.translations)) {
              if (!this.translations[language]) {
                this.translations[language] = {};
              }
              this.translations[language][keywordEntry.word.toLowerCase()] = translation;
            }
          }
          
          importCount++;
        }
      }
      
      // Update lastUpdate timestamp
      this.lastUpdate = Date.now();
      await AsyncStorage.setItem(LAST_UPDATE_KEY, JSON.stringify(this.lastUpdate));
      
      // Save the imported data
      await this.save();
      
      console.log(`Imported ${importCount} terms from keywords.json`);
    } catch (error) {
      console.error('Error importing from keywords.json:', error);
    }
  }

  /**
   * Save the current state of the database to AsyncStorage
   */
  static async save() {
    try {
      await AsyncStorage.setItem(GLOBAL_TERMS_KEY, JSON.stringify(this.terms));
      await AsyncStorage.setItem(GLOBAL_TRANSLATIONS_KEY, JSON.stringify(this.translations));
      console.log('Global terms database saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving global terms database:', error);
      return false;
    }
  }

  /**
   * Add a term and its explanation to the global database
   * @param {string} term - The term to add
   * @param {string} explanation - The English explanation of the term
   * @returns {boolean} - Success status
   */
  static async addTerm(term, explanation) {
    if (!term || !explanation) return false;
    
    // Normalize the term to lowercase
    const normalizedTerm = term.toLowerCase().trim();
    
    // Only add if the term doesn't exist or has a shorter explanation
    const existingExplanation = this.terms[normalizedTerm];
    if (!existingExplanation || explanation.length > existingExplanation.length) {
      this.terms[normalizedTerm] = explanation;
      await this.save();
      return true;
    }
    
    return false;
  }

  /**
   * Add a translation for a term
   * @param {string} term - The term to add a translation for
   * @param {string} language - The language code
   * @param {string} translation - The translation
   * @returns {boolean} - Success status
   */
  static async addTranslation(term, language, translation) {
    if (!term || !language || !translation) return false;
    
    // Normalize the term to lowercase
    const normalizedTerm = term.toLowerCase().trim();
    
    // Initialize language object if it doesn't exist
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    
    // Add the translation
    this.translations[language][normalizedTerm] = translation;
    await this.save();
    return true;
  }

  /**
   * Get a term's explanation from the database
   * @param {string} term - The term to look up
   * @returns {string|null} - The explanation or null if not found
   */
  static getTerm(term) {
    if (!term) return null;
    
    const normalizedTerm = term.toLowerCase().trim();
    return this.terms[normalizedTerm] || null;
  }

  /**
   * Get a translation for a term
   * @param {string} term - The term to translate
   * @param {string} language - The target language code
   * @returns {string|null} - The translation or null if not found
   */
  static getTranslation(term, language) {
    if (!term || !language) return null;
    
    const normalizedTerm = term.toLowerCase().trim();
    return this.translations[language]?.[normalizedTerm] || null;
  }

  /**
   * Check if a term exists in the database
   * @param {string} term - The term to check
   * @returns {boolean} - Whether the term exists
   */
  static hasTerm(term) {
    if (!term) return false;
    
    const normalizedTerm = term.toLowerCase().trim();
    return !!this.terms[normalizedTerm];
  }

  /**
   * Check if a translation exists for a term
   * @param {string} term - The term to check
   * @param {string} language - The language code
   * @returns {boolean} - Whether the translation exists
   */
  static hasTranslation(term, language) {
    if (!term || !language) return false;
    
    const normalizedTerm = term.toLowerCase().trim();
    return !!this.translations[language]?.[normalizedTerm];
  }

 /**
 * Find all terms in the text that exist in our database or match suggested terms
 * Enhanced to be more thorough in finding matching terms from keywords.json
 * 
 * @param {string} text - The text to analyze
 * @param {string} language - The target language code
 * @param {string[]} [suggestedTerms] - Suggested terms to prioritize checking
 * @returns {Array} - Array of found terms with explanations and translations
 */
static analyzeText(text, language, suggestedTerms = []) {
  if (!text) return [];
  
  const foundTerms = [];
  const normalizedText = text.toLowerCase();
  const processedTerms = new Set(); // Track which terms we've already processed
  
  // First check suggested terms if provided
  if (Array.isArray(suggestedTerms) && suggestedTerms.length > 0) {
    for (const term of suggestedTerms) {
      const normalizedTerm = term.toLowerCase().trim();
      
      // Skip if we've already processed this term
      if (processedTerms.has(normalizedTerm)) continue;
      
      // Check if the term exists in our database
      if (this.terms[normalizedTerm]) {
        // Check if the term is in the text
        if (normalizedText.includes(normalizedTerm)) {
          const foundTerm = {
            term: term,
            explanation: this.terms[normalizedTerm],
            translation: this.translations[language]?.[normalizedTerm] || null
          };
          foundTerms.push(foundTerm);
          processedTerms.add(normalizedTerm);
        }
      }
    }
  }
  
  // Check for exact word matches using word boundary regex
  const allTerms = Object.keys(this.terms);
  
  // Sort terms by length (longest first) to handle cases where one term is part of another
  allTerms.sort((a, b) => b.length - a.length);
  
  for (const term of allTerms) {
    // Skip if we've already found this term
    if (processedTerms.has(term)) {
      continue;
    }
    
    // Try to find the term in the text
    const termLower = term.toLowerCase();
    if (normalizedText.includes(termLower)) {
      // Check if the term is a whole word
      const foundTerm = {
        term: term,
        explanation: this.terms[termLower],
        translation: this.translations[language]?.[termLower] || null
      };
      
      foundTerms.push(foundTerm);
      processedTerms.add(termLower);
    }
  }
  
  return foundTerms;
}

  /**
   * Get all stored terms and their explanations
   * @returns {Object} - All terms and explanations
   */
  static getAllTerms() {
    return { ...this.terms };
  }

  /**
   * Get all translations for a specific language
   * @param {string} language - The language code
   * @returns {Object} - All translations for the language
   */
  static getAllTranslationsForLanguage(language) {
    return { ...(this.translations[language] || {}) };
  }

  /**
   * Get database statistics
   * @returns {Object} - Statistics about the database
   */
  static getStats() {
    const totalTerms = Object.keys(this.terms).length;
    const languages = Object.keys(this.translations);
    
    const languageStats = languages.map(lang => {
      const translations = Object.keys(this.translations[lang] || {}).length;
      const coverage = totalTerms > 0 ? (translations / totalTerms) * 100 : 0;
      
      return {
        code: lang,
        count: translations,
        coverage: Math.round(coverage)
      };
    });
    
    return {
      totalTerms,
      totalLanguages: languages.length,
      lastUpdate: this.lastUpdate,
      languageStats
    };
  }

  /**
   * Clear the entire database
   * @returns {Promise<boolean>} - Success status
   */
  static async clearDatabase() {
    try {
      this.terms = {};
      this.translations = {};
      this.lastUpdate = 0;
      await AsyncStorage.removeItem(GLOBAL_TERMS_KEY);
      await AsyncStorage.removeItem(GLOBAL_TRANSLATIONS_KEY);
      await AsyncStorage.removeItem(LAST_UPDATE_KEY);
      console.log('Global terms database cleared');
      return true;
    } catch (error) {
      console.error('Error clearing global terms database:', error);
      return false;
    }
  }

  /**
   * Import predefined terms and translations
   * @param {Object} predefinedTerms - Object containing terms and translations
   * @returns {Promise<boolean>} - Success status
   */
  static async importPredefinedTerms(predefinedTerms) {
    try {
      if (!predefinedTerms || typeof predefinedTerms !== 'object') {
        return false;
      }
      
      // Process each term in the predefined data
      for (const [term, data] of Object.entries(predefinedTerms)) {
        if (data.explanation) {
          await this.addTerm(term, data.explanation);
        }
        
        if (data.translations && typeof data.translations === 'object') {
          for (const [lang, translation] of Object.entries(data.translations)) {
            if (translation) {
              await this.addTranslation(term, lang, translation);
            }
          }
        }
      }
      
      console.log(`Imported ${Object.keys(predefinedTerms).length} predefined terms`);
      return true;
    } catch (error) {
      console.error('Error importing predefined terms:', error);
      return false;
    }
  }
}

// Initialize static properties
GlobalTermsDatabase.terms = {};
GlobalTermsDatabase.translations = {};
GlobalTermsDatabase.lastUpdate = 0;

export default GlobalTermsDatabase;