// src/utils/GlobalTermsDatabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for the global database
const GLOBAL_TERMS_KEY = '@global_terms_db';
const GLOBAL_TRANSLATIONS_KEY = '@global_translations_db';

/**
 * Manages a global database of terms and their translations that
 * persists across all users of the app
 */
class GlobalTermsDatabase {
  /**
   * Initialize the database
   * Loads terms and translations from AsyncStorage
   */
  static async init() {
    try {
      // Try to load existing database
      const termsData = await AsyncStorage.getItem(GLOBAL_TERMS_KEY);
      const translationsData = await AsyncStorage.getItem(GLOBAL_TRANSLATIONS_KEY);
      
      // Create default structures if not exists
      this.terms = termsData ? JSON.parse(termsData) : {};
      this.translations = translationsData ? JSON.parse(translationsData) : {};
      
      console.log(`Global terms database initialized with ${Object.keys(this.terms).length} terms`);
      console.log(`Global translations database initialized with translations for ${Object.keys(this.translations).length} languages`);
      
      return true;
    } catch (error) {
      console.error('Error initializing global terms database:', error);
      // Initialize with empty objects if there's an error
      this.terms = {};
      this.translations = {};
      return false;
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
   * Add multiple terms and translations at once
   * @param {Array} termsData - Array of {term, explanation, language, translation} objects
   * @returns {Promise<number>} - Number of terms added
   */
  static async addMultiple(termsData) {
    if (!Array.isArray(termsData)) return 0;
    
    let addedCount = 0;
    
    for (const item of termsData) {
      const { term, explanation, language, translation } = item;
      
      if (term && explanation) {
        const termAdded = await this.addTerm(term, explanation);
        if (termAdded) addedCount++;
      }
      
      if (term && language && translation) {
        await this.addTranslation(term, language, translation);
      }
    }
    
    return addedCount;
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
   * Analyze text to find terms that are in our database
   * @param {string} text - The text to analyze
   * @param {string} language - The target language for translations
   * @returns {Array} - Array of found terms with explanations and translations
   */
  static analyzeText(text, language) {
    if (!text) return [];
    
    const foundTerms = [];
    const words = text.split(/\s+/);
    const termsList = Object.keys(this.terms);
    
    // Simple word matching - could be improved with more sophisticated NLP
    for (const term of termsList) {
      // Check if the term is in the text (case insensitive)
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(text)) {
        const foundTerm = {
          term: term,
          explanation: this.terms[term],
          translation: this.translations[language]?.[term] || null
        };
        
        foundTerms.push(foundTerm);
      }
    }
    
    return foundTerms;
  }

  /**
   * Clear the entire database
   * @returns {Promise<boolean>} - Success status
   */
  static async clearDatabase() {
    try {
      this.terms = {};
      this.translations = {};
      await AsyncStorage.removeItem(GLOBAL_TERMS_KEY);
      await AsyncStorage.removeItem(GLOBAL_TRANSLATIONS_KEY);
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

export default GlobalTermsDatabase;