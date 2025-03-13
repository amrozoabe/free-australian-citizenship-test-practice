// src/utils/AppInitializer.js
import GlobalTermsDatabase from './GlobalTermsDatabase';
import QuizAnalysisCache from './QuizAnalysisCache';

/**
 * Handles initialization tasks for the app
 * Enhanced with comprehensive term database initialization
 */
class AppInitializer {
  static initialized = false;

  /**
   * Initialize all required app components
   * @returns {Promise<boolean>} - Success status
   */
  static async initialize() {
    if (this.initialized) {
      console.log('App already initialized');
      return true;
    }

    try {
      console.log('Initializing app...');
      
      // Initialize the global terms database
      await GlobalTermsDatabase.init();
      
      // Preload important terms for offline use
      await this.preloadEssentialTerms();
      
      // Initialize the cache system
      await QuizAnalysisCache.init();
      
      // Clean any expired cache entries
      await QuizAnalysisCache.cleanExpiredEntries();
      
      // Mark as initialized
      this.initialized = true;
      console.log('App initialization complete');
      return true;
    } catch (error) {
      console.error('Error during app initialization:', error);
      return false;
    }
  }

  /**
   * Preload essential terms for offline use
   * @returns {Promise<void>}
   */
  static async preloadEssentialTerms() {
    try {
      // Preload national anthem terms
      const anthemTermsCount = await GlobalTermsDatabase.preloadAnthemTerms();
      console.log(`Preloaded ${anthemTermsCount} national anthem terms`);
      
      // Preload other essential terms (could be extended later)
      const essentialTerms = {
        "Australian citizenship": {
          explanation: "The status of being a legal citizen of Australia with full rights and responsibilities",
          translations: {
            "zh-CN": "澳大利亚公民身份",
            "zh-TW": "澳大利亞公民身份",
            "ar": "الجنسية الأسترالية",
            "es": "ciudadanía australiana",
            "fr": "citoyenneté australienne",
            "hi": "ऑस्ट्रेलियाई नागरिकता",
            "id": "kewarganegaraan Australia",
            "ja": "オーストラリア市民権",
            "ko": "호주 시민권",
            "ru": "австралийское гражданство",
            "vi": "quốc tịch Úc"
          }
        },
        "citizenship test": {
          explanation: "An examination that tests a person's knowledge of Australia, its history, values, and government, as part of the process to become a citizen",
          translations: {
            "zh-CN": "公民考试",
            "zh-TW": "公民考試",
            "ar": "اختبار الجنسية",
            "es": "examen de ciudadanía",
            "fr": "test de citoyenneté",
            "hi": "नागरिकता परीक्षा",
            "id": "ujian kewarganegaraan",
            "ja": "市民権テスト",
            "ko": "시민권 시험",
            "ru": "тест на гражданство",
            "vi": "bài kiểm tra quốc tịch"
          }
        }
      };
      
      await GlobalTermsDatabase.importPredefinedTerms(essentialTerms);
      console.log(`Preloaded ${Object.keys(essentialTerms).length} essential citizenship terms`);
    } catch (error) {
      console.error('Error preloading essential terms:', error);
    }
  }

  /**
   * Check if the app has been initialized
   * @returns {boolean} - Initialization status
   */
  static isInitialized() {
    return this.initialized;
  }
  
  /**
   * Reset and reinitialize the app
   * Useful for troubleshooting or when major updates are deployed
   * @returns {Promise<boolean>} - Success status
   */
  static async reset() {
    try {
      console.log('Resetting app...');
      
      // Clear caches
      await QuizAnalysisCache.clearCache();
      
      // Clear database
      await GlobalTermsDatabase.clearDatabase();
      
      // Reset initialization flag
      this.initialized = false;
      
      // Reinitialize
      return await this.initialize();
    } catch (error) {
      console.error('Error resetting app:', error);
      return false;
    }
  }
}

export default AppInitializer;