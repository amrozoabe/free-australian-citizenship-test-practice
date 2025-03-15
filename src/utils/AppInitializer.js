// src/utils/AppInitializer.js
import GlobalTermsDatabase from './GlobalTermsDatabase';

/**
 * Handles initialization tasks for the app
 * Focuses on keyword database initialization
 */
class AppInitializer {
  static initialized = false;
  static initializationStatus = {
    database: false,
    terms: false
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
      
      // Initialize the global terms database
      await GlobalTermsDatabase.init();
      this.initializationStatus.database = true;
      
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
   * Check if the app has been initialized
   * @returns {boolean} - Initialization status
   */
  static isInitialized() {
    return this.initialized;
  }
}

export default AppInitializer;