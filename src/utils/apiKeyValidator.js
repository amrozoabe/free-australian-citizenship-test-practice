// src/utils/apiKeyValidator.js
import { CLAUDE_API_KEY } from '@env';

/**
 * Utility to validate API keys and provide consistent error handling
 */
class ApiKeyValidator {
  /**
   * Check if the Claude API key is properly formatted and available
   * @returns {boolean} - True if the key appears valid, false otherwise
   */
  static validateClaudeApiKey() {
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      return false;
    }

    // Claude API keys start with 'sk-ant-' and are generally long
    if (!CLAUDE_API_KEY.startsWith('sk-ant-') || CLAUDE_API_KEY.length < 20) {
      console.error('Claude API key appears to be invalid (should start with sk-ant-)');
      return false;
    }

    return true;
  }

  /**
   * Get a sanitized version of the API key for logging (showing only first/last few chars)
   * @returns {string} - Sanitized key or 'not configured' message
   */
  static getSanitizedApiKeyInfo() {
    if (!CLAUDE_API_KEY) {
      return 'not configured';
    }
    
    // Show only first 6 chars and last 4 chars
    const firstPart = CLAUDE_API_KEY.substring(0, 6);
    const lastPart = CLAUDE_API_KEY.substring(CLAUDE_API_KEY.length - 4);
    return `${firstPart}...${lastPart}`;
  }

  /**
   * Check if we can use the Claude API right now
   * @returns {Object} - Status object with canUse and message properties
   */
  static getClaudeApiStatus() {
    if (!CLAUDE_API_KEY) {
      return {
        canUse: false,
        message: 'API key not configured. Offline mode active.'
      };
    }

    if (!this.validateClaudeApiKey()) {
      return {
        canUse: false,
        message: 'API key invalid. Offline mode active.'
      };
    }

    return {
      canUse: true,
      message: 'API key configured and valid.'
    };
  }
}

export default ApiKeyValidator;