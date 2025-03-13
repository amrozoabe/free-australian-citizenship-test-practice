// src/utils/AppInitializer.js - Enhanced version
import GlobalTermsDatabase from './GlobalTermsDatabase';
import QuizAnalysisCache from './QuizAnalysisCache';
import ApiKeyValidator from './apiKeyValidator';

/**
 * Handles initialization tasks for the app
 * Enhanced with comprehensive term database initialization
 */
class AppInitializer {
  static initialized = false;
  static initializationStatus = {
    database: false,
    cache: false,
    terms: false,
    api: false
  };

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
      
      // Check API key status
      const apiStatus = ApiKeyValidator.getClaudeApiStatus();
      console.log('API Status:', apiStatus.message);
      this.initializationStatus.api = apiStatus.canUse;
      
      // Initialize the global terms database
      await GlobalTermsDatabase.init();
      this.initializationStatus.database = true;
      
      // Preload important terms for offline use
      await this.preloadEssentialTerms();
      this.initializationStatus.terms = true;
      
      // Initialize the cache system
      await QuizAnalysisCache.init();
      
      // Clean any expired cache entries
      await QuizAnalysisCache.cleanExpiredEntries();
      this.initializationStatus.cache = true;
      
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
      const anthemTerms = {
        "national anthem": {
          explanation: "A patriotic song officially adopted by a country as an expression of national identity",
          translations: {
            "zh-CN": "国歌",
            "zh-TW": "國歌",
            "ar": "النشيد الوطني",
            "es": "himno nacional",
            "fr": "hymne national"
          }
        },
        "advance australia fair": {
          explanation: "The national anthem of Australia since 1984",
          translations: {
            "zh-CN": "澳大利亚前进",
            "zh-TW": "澳大利亞前進",
            "ar": "تقدم أستراليا العادلة",
            "es": "Avanza Australia Justa",
            "fr": "Avance Australie Équitable"
          }
        },
        "southern cross": {
          explanation: "A constellation visible in the Southern Hemisphere, featured on the Australian flag",
          translations: {
            "zh-CN": "南十字星",
            "zh-TW": "南十字星",
            "ar": "الصليب الجنوبي",
            "es": "Cruz del Sur",
            "fr": "Croix du Sud"
          }
        }
      };
      
      await GlobalTermsDatabase.importPredefinedTerms(anthemTerms);
      console.log(`Preloaded ${Object.keys(anthemTerms).length} national anthem terms`);
      
      // Preload other essential terms
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
        },
        "ANZAC Day": {
          explanation: "A national day of remembrance in Australia and New Zealand that commemorates those who served and died in wars and conflicts",
          translations: {
            "zh-CN": "澳新军团日",
            "zh-TW": "澳紐軍團日",
            "ar": "يوم أنزاك",
            "es": "Día de Anzac",
            "fr": "Jour d'Anzac"
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
   * Get the current initialization status
   * @returns {Object} - Status object
   */
  static getStatus() {
    return {
      initialized: this.initialized,
      details: { ...this.initializationStatus }
    };
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
      
      // Reset database
      await GlobalTermsDatabase.clearDatabase();
      
      // Reset initialization flags
      this.initialized = false;
      this.initializationStatus = {
        database: false,
        cache: false,
        terms: false,
        api: false
      };
      
      // Reinitialize
      return await this.initialize();
    } catch (error) {
      console.error('Error resetting app:', error);
      return false;
    }
  }
}

export default AppInitializer;