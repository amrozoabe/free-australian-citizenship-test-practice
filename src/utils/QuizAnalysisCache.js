// src/utils/QuizAnalysisCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = '@quiz_analysis_cache_';
const CACHE_METADATA_KEY = '@quiz_cache_metadata';
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Utility class for caching Claude API analysis results
 * Enhanced with expiration logic and metadata
 */
class QuizAnalysisCache {
  /**
   * Initialize the cache system
   * @returns {Promise<void>}
   */
  static async init() {
    try {
      // Load or create metadata
      const metadata = await this.getMetadata();
      console.log(`Cache initialized with ${Object.keys(metadata.entries).length} entries`);
      
      // Clean expired entries
      await this.cleanExpiredEntries();
    } catch (error) {
      console.error('Error initializing cache:', error);
      // Create empty metadata if it doesn't exist
      await this.saveMetadata({ 
        version: 1, 
        lastCleanup: Date.now(),
        entries: {} 
      });
    }
  }

  /**
   * Get cache metadata
   * @returns {Promise<Object>} - The cache metadata
   */
  static async getMetadata() {
    const data = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    if (!data) {
      return { version: 1, lastCleanup: Date.now(), entries: {} };
    }
    return JSON.parse(data);
  }

  /**
   * Save cache metadata
   * @param {Object} metadata - The metadata to save
   * @returns {Promise<void>}
   */
  static async saveMetadata(metadata) {
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  }

  /**
   * Generate a unique cache key for a question and language
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {string} - The cache key
   */
  static getCacheKey(questionText, language) {
    // Create a simple hash from the question text
    let hash = 0;
    for (let i = 0; i < questionText.length; i++) {
      hash = ((hash << 5) - hash) + questionText.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    hash = Math.abs(hash).toString(16); // Convert to hex string
    
    return `${CACHE_KEY_PREFIX}${hash}_${language}`;
  }
  
  /**
   * Generate a shorter unique ID for metadata
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {string} - The metadata ID
   */
  static getMetadataId(questionText, language) {
    // Create a simple hash from the question text
    let hash = 0;
    for (let i = 0; i < questionText.length; i++) {
      hash = ((hash << 5) - hash) + questionText.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    hash = Math.abs(hash).toString(16); // Convert to hex string
    
    return `${hash}_${language}`;
  }

  /**
   * Save analysis results to cache with metadata tracking
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @param {Object} analysisData - The analysis data to cache
   * @returns {Promise<void>}
   */
  static async saveToCache(questionText, language, analysisData) {
    try {
      const key = this.getCacheKey(questionText, language);
      const metadataId = this.getMetadataId(questionText, language);
      const dataToStore = {
        question: questionText.substring(0, 100), // Store a truncated version to save space
        language,
        analysis: analysisData,
        timestamp: Date.now()
      };
      
      // Update metadata
      const metadata = await this.getMetadata();
      metadata.entries[metadataId] = {
        key,
        timestamp: Date.now(),
        language,
        questionPreview: questionText.substring(0, 30) + '...'
      };
      
      // Store data and metadata
      await Promise.all([
        AsyncStorage.setItem(key, JSON.stringify(dataToStore)),
        this.saveMetadata(metadata)
      ]);
      
      console.log('Saved analysis to cache:', metadataId);
    } catch (error) {
      console.error('Error saving analysis to cache:', error);
    }
  }

  /**
   * Get cached analysis results
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {Promise<Object|null>} - The cached analysis data or null if not found
   */
  static async getFromCache(questionText, language) {
    try {
      const key = this.getCacheKey(questionText, language);
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        console.log('No cached data found for question');
        return null;
      }
      
      const parsedData = JSON.parse(cachedData);
      
      // Check if data is expired
      if (Date.now() - parsedData.timestamp > CACHE_MAX_AGE_MS) {
        console.log('Cached data is expired');
        await this.removeFromCache(questionText, language);
        return null;
      }
      
      console.log('Retrieved analysis from cache for language:', language);
      return parsedData.analysis;
    } catch (error) {
      console.error('Error getting analysis from cache:', error);
      return null;
    }
  }

  /**
   * Remove an item from cache
   * @param {string} questionText - The question text
   * @param {string} language - The language code
   * @returns {Promise<void>}
   */
  static async removeFromCache(questionText, language) {
    try {
      const key = this.getCacheKey(questionText, language);
      const metadataId = this.getMetadataId(questionText, language);
      
      // Remove from AsyncStorage and metadata
      const metadata = await this.getMetadata();
      delete metadata.entries[metadataId];
      
      await Promise.all([
        AsyncStorage.removeItem(key),
        this.saveMetadata(metadata)
      ]);
      
      console.log('Removed item from cache:', metadataId);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  /**
   * Clean expired cache entries
   * @returns {Promise<number>} - Number of entries cleaned
   */
  static async cleanExpiredEntries() {
    try {
      const metadata = await this.getMetadata();
      const now = Date.now();
      const expiredIds = [];
      
      // Find expired entries
      for (const [id, entry] of Object.entries(metadata.entries)) {
        if (now - entry.timestamp > CACHE_MAX_AGE_MS) {
          expiredIds.push(id);
        }
      }
      
      // Remove expired entries
      const removePromises = expiredIds.map(id => {
        const entry = metadata.entries[id];
        delete metadata.entries[id];
        return AsyncStorage.removeItem(entry.key);
      });
      
      // Update metadata
      metadata.lastCleanup = now;
      removePromises.push(this.saveMetadata(metadata));
      
      await Promise.all(removePromises);
      
      console.log(`Cleaned ${expiredIds.length} expired cache entries`);
      return expiredIds.length;
    } catch (error) {
      console.error('Error cleaning expired entries:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics
   */
  static async getStats() {
    try {
      const metadata = await this.getMetadata();
      const entries = Object.entries(metadata.entries);
      
      // Group by language
      const languageStats = {};
      for (const [id, entry] of entries) {
        if (!languageStats[entry.language]) {
          languageStats[entry.language] = 0;
        }
        languageStats[entry.language]++;
      }
      
      return {
        totalEntries: entries.length,
        lastCleanup: metadata.lastCleanup,
        byLanguage: languageStats
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalEntries: 0, lastCleanup: null, byLanguage: {} };
    }
  }

  /**
   * Clear all cached analyses
   * @returns {Promise<number>} - Number of entries cleared
   */
  static async clearCache() {
    try {
      const metadata = await this.getMetadata();
      const entries = Object.values(metadata.entries);
      
      if (entries.length > 0) {
        // Remove all cache entries
        const removePromises = entries.map(entry => AsyncStorage.removeItem(entry.key));
        
        // Reset metadata
        await Promise.all([
          ...removePromises,
          this.saveMetadata({ version: 1, lastCleanup: Date.now(), entries: {} })
        ]);
        
        console.log('Cleared analysis cache, removed entries:', entries.length);
        return entries.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error clearing analysis cache:', error);
      return 0;
    }
  }
}

export default QuizAnalysisCache;