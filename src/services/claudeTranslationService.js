import axios from 'axios';
import { CLAUDE_API_KEY } from '@env';

/**
 * Analyzes a question with Claude API to identify complicated terms and translate them
 * @param {string} questionText - The text of the citizenship test question
 * @param {string} language - The target language code for translation
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
export const analyzeQuestion = async (questionText, language) => {
  try {
    if (!questionText || !language) {
      console.log('Missing question text or language');
      return { terms: [] };
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      return { terms: [] };
    }

    console.log('Analyzing question with Claude API...');
    
    // Create the prompt for Claude
    const prompt = `
You are helping non-English speakers prepare for the Australian citizenship test.

Analyze the following question from the Australian citizenship test:
"${questionText}"

Please identify any potentially complicated words, terms, phrases, or concepts that might be difficult for non-native English speakers to understand.

For each identified term:
1. Provide a clear, simple explanation in English
2. Provide a translation into ${language}

Return ONLY a JSON object with this structure:
{
  "terms": [
    {
      "term": "identified term",
      "explanation": "simple explanation in English",
      "translation": "translation in ${language}"
    },
    ...
  ]
}
`;

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Claude API response received');
    
    // Parse the response
    const content = response.data.content[0].text;
    try {
      // Parse the JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    return { terms: [] };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return { terms: [] };
  }
};

/**
 * Analyzes a question and its options with Claude API
 * @param {string} questionText - The question text
 * @param {string[]} options - The answer options
 * @param {string} language - The target language code
 * @returns {Promise<Object>} - Object containing terms, explanations and translations
 */
export const analyzeQuestionAndOptions = async (questionText, options, language) => {
  try {
    if (!questionText || !options || !language) {
      return { terms: [] };
    }

    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not set in environment variables');
      return { terms: [] };
    }

    console.log('Analyzing question and options with Claude API...');
    
    // Create the prompt for Claude
    const prompt = `
You are helping non-native English speakers prepare for the Australian citizenship test.

Analyze this question and its answer options:

Question: "${questionText}"

Options:
${options.map((option, index) => `${index + 1}. ${option}`).join('\n')}

Identify any words, terms, or phrases that might be difficult for someone learning English. 
Focus only on important words related to Australian citizenship, government, history, or culture.
Do not include basic English words.

For each identified term:
1. Provide a clear, simple explanation in English
2. Provide a translation in ${language}

Return ONLY a JSON object with this structure:
{
  "terms": [
    {
      "term": "identified term",
      "explanation": "simple explanation in English",
      "translation": "translation in ${language}"
    },
    ...
  ]
}
`;

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Claude API response received');
    
    // Parse the response
    const content = response.data.content[0].text;
    try {
      // Parse the JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
    }

    return { terms: [] };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return { terms: [] };
  }
};

// Adding console-based fallback for when API fails
const fallbackTerms = {
  "democracy": {
    explanation: "A system of government where people choose their leaders by voting",
    translations: {
      "zh-CN": "民主",
      "es": "democracia",
      "fr": "démocratie"
    }
  },
  "citizenship": {
    explanation: "Being an official member of a country with rights and responsibilities",
    translations: {
      "zh-CN": "公民身份",
      "es": "ciudadanía",
      "fr": "citoyenneté"
    }
  },
  "constitution": {
    explanation: "The set of basic laws that defines how a country is governed",
    translations: {
      "zh-CN": "宪法",
      "es": "constitución",
      "fr": "constitution"
    }
  }
};

// Fallback function to use when Claude API is unavailable
export const getFallbackAnalysis = (text, language = 'en') => {
  const terms = [];
  
  // Very simple matching
  Object.keys(fallbackTerms).forEach(term => {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      terms.push({
        term: term,
        explanation: fallbackTerms[term].explanation,
        translation: fallbackTerms[term].translations[language] || 
                     fallbackTerms[term].translations['en'] || 
                     term
      });
    }
  });
  
  return { terms };
};

export default {
  analyzeQuestion,
  analyzeQuestionAndOptions,
  getFallbackAnalysis
};