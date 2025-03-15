// src/utils/GlobalTermsDatabase.js - Simplified version
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
      return true;
    } catch (error) {
      console.error('Error saving global terms database:', error);
      return false;
    }
  }

  /**
   * Find all terms in the text that exist in our database
   * 
   * @param {string} text - The text to analyze
   * @param {string} language - The target language code
   * @returns {Array} - Array of found terms with explanations and translations
   */
  static analyzeText(text, language) {
    if (!text) return [];
    
    const foundTerms = [];
    const normalizedText = text.toLowerCase();
    const processedTerms = new Set(); // Track which terms we've already processed
    
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
        // Add the term to found terms
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
          // Add the term
          this.terms[term.toLowerCase()] = data.explanation;
        }
        
        if (data.translations && typeof data.translations === 'object') {
          for (const [lang, translation] of Object.entries(data.translations)) {
            if (translation) {
              // Initialize language object if it doesn't exist
              if (!this.translations[lang]) {
                this.translations[lang] = {};
              }
              
              // Add the translation
              this.translations[lang][term.toLowerCase()] = translation;
            }
          }
        }
      }
      
      // Save the updated data
      await this.save();
      return true;
    } catch (error) {
      console.error('Error importing predefined terms:', error);
      return false;
    }
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
      return true;
    } catch (error) {
      console.error('Error clearing global terms database:', error);
      return false;
    }
  }
}

// Initialize static properties
GlobalTermsDatabase.terms = {};
GlobalTermsDatabase.translations = {};
GlobalTermsDatabase.lastUpdate = 0;

export default GlobalTermsDatabase;