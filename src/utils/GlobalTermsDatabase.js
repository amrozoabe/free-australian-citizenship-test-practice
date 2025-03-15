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
   * Improved to be more flexible in finding terms
   * 
   * @param {string} text - The text to analyze
   * @param {string} language - The target language code
   * @returns {Array} - Array of found terms with explanations and translations
   */
  static analyzeText(text, language) {
    if (!text) return [];
    
    // Handle case where keywords.json might not be properly loaded
    if (Object.keys(this.terms).length === 0) {
      // Try to load some hardcoded fallback terms for common concepts
      const fallbackTerms = [
        {
          term: "Australia",
          explanation: "The Commonwealth of Australia, a country in the Southern Hemisphere comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands.",
          translation: null
        },
        {
          term: "Citizenship",
          explanation: "The status of being a legal citizen of a country with all associated rights and responsibilities.",
          translation: null
        }
      ];
      
      // Check if any of these terms appear in the text
      return fallbackTerms.filter(term => 
        text.toLowerCase().includes(term.term.toLowerCase())
      );
    }
    
    const foundTerms = [];
    const normalizedText = text.toLowerCase();
    const processedTerms = new Set(); // Track which terms we've already processed
    
    // Get all terms from the database
    const allTerms = Object.keys(this.terms);
    
    // Sort terms by length (longest first) to handle cases where one term is part of another
    allTerms.sort((a, b) => b.length - a.length);
    
    // First pass: try to find exact matches
    for (const term of allTerms) {
      if (processedTerms.has(term)) continue;
      
      const termLower = term.toLowerCase();
      // More flexible matching - check if the term exists anywhere in the text
      if (normalizedText.includes(termLower)) {
        foundTerms.push({
          term: term,
          explanation: this.terms[termLower],
          translation: this.translations[language]?.[termLower] || null
        });
        processedTerms.add(termLower);
      }
    }
    
    // Add some common citizen test terms if we haven't found anything
    // This helps when the keyword database might not be properly loaded
    if (foundTerms.length === 0) {
      const commonTerms = [
        "citizenship", "australia", "government", "democratic", "values",
        "parliament", "rights", "responsibilities", "anzac"
      ];
      
      for (const term of commonTerms) {
        if (normalizedText.includes(term) && !processedTerms.has(term)) {
          foundTerms.push({
            term: term.charAt(0).toUpperCase() + term.slice(1),
            explanation: `A key concept in Australian citizenship related to ${term}.`,
            translation: null
          });
          processedTerms.add(term);
        }
      }
    }
    
    // Ensure at least the highest frequency words are returned
    // This ensures we always return something helpful
    if (foundTerms.length === 0) {
      // Try to extract any proper nouns or important words from the text
      const words = normalizedText.split(/\W+/).filter(w => w.length > 3);
      const importantWords = words
        .filter(w => w.charAt(0) === w.charAt(0).toUpperCase() || 
                    ["anzac", "day", "government", "australia", "parliament"].includes(w))
        .slice(0, 3);
      
      for (const word of importantWords) {
        foundTerms.push({
          term: word.charAt(0).toUpperCase() + word.slice(1),
          explanation: `This term appears to be important in the context of Australian citizenship.`,
          translation: null
        });
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