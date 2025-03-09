// src/utils/apiKeyValidator.js
import { CLAUDE_API_KEY } from '@env';

/**
 * Simple utility to check if an API key is properly formatted
 * This doesn't guarantee the key works, just that it's properly formatted
 */
export const validateClaudeApiKey = () => {
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
};

export default {
  validateClaudeApiKey
};