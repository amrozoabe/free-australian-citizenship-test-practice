#!/usr/bin/env node
/**
 * Question Analysis Script
 * 
 * This script:
 * 1. Loads questions from questions.js
 * 2. Checks which questions have already been analyzed (using a tracking file)
 * 3. Sends new questions to Claude API for analysis
 * 4. Extracts key terms, definitions, and translations
 * 5. Updates keywords.json with new terms
 * 6. Updates tracking file with newly processed questions
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const QUESTIONS_PATH = path.join(__dirname, '../src/data/questions.js');
const KEYWORDS_PATH = path.join(__dirname, '../src/data/keywords.json');
const LANGUAGES_PATH = path.join(__dirname, '../src/constants/languages.js');
const TRACKING_PATH = path.join(__dirname, '../src/data/processed-questions.json');

// Utility to safely read JSON
const safeReadJSON = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return defaultValue;
};

// Load questions 
const loadQuestions = () => {
  try {
    // Read questions.js as a string
    const questionsFile = fs.readFileSync(QUESTIONS_PATH, 'utf8');
    
    // Use regex to extract the array content
    const arrayMatch = questionsFile.match(/\[\s*([\s\S]*)\s*\]/);
    if (!arrayMatch) {
      throw new Error('Could not find questions array in file');
    }
    
    // Evaluate the array content in a safe context
    const questionsArray = eval(`[${arrayMatch[1]}]`);
    console.log(`Loaded ${questionsArray.length} questions from questions.js`);
    return questionsArray;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
};

// Load languages from constants file
const loadLanguages = () => {
  try {
    const languagesFile = fs.readFileSync(LANGUAGES_PATH, 'utf8');
    
    // Extract language codes using regex
    const languageCodes = [];
    const codeRegex = /code:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = codeRegex.exec(languagesFile)) !== null) {
      languageCodes.push(match[1]);
    }
    
    console.log(`Loaded ${languageCodes.length} languages`);
    return languageCodes;
  } catch (error) {
    console.error('Error loading languages:', error);
    return [];
  }
};

// Load processed question IDs
const loadProcessedQuestions = () => {
  return safeReadJSON(TRACKING_PATH, { processedIds: [] });
};

// Load existing keywords
const loadKeywords = () => {
  return safeReadJSON(KEYWORDS_PATH, []);
};

// Save data to JSON file
const saveJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving to ${filePath}:`, error);
    return false;
  }
};

// Call Claude API
const callClaudeAPI = async (prompt) => {
  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key not provided. Set CLAUDE_API_KEY in .env file');
  }
  
  try {
    console.log('Calling Claude API...');
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
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
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw error;
  }
};

// Analyze a batch of questions with Claude
const analyzeQuestions = async (questions, languageCodes) => {
  // Create prompt for Claude
  const questionTexts = questions.map(q => {
    let text = q.question;
    text += "\nOptions:\n" + q.options.join("\n");
    if (q.explanation) {
      text += "\nExplanation: " + q.explanation;
    }
    return text;
  }).join("\n\n---\n\n");
  
  const prompt = `
You are helping create a comprehensive knowledge base for an Australian citizenship test app that will be used by non-native English speakers.

I need you to identify key terms in the following questions that might be difficult for non-native English speakers to understand:

${questionTexts}

For each key term you identify:
1. Provide a clear, concise definition in English that explains its meaning in the context of Australian citizenship
2. Translate the term to these languages: ${languageCodes.join(', ')}

Focus on these types of terms:
- Australian-specific concepts, places, people, and events
- Government and legal terminology
- Historical terms
- Cultural references
- Words or phrases that might be unfamiliar to someone learning English

IMPORTANT:
- Only include substantive terms that are directly relevant to Australian citizenship
- Do not include common words or general English vocabulary
- Make sure not to repeat terms that appear multiple times
- Focus on nouns, compound terms, and specialized vocabulary
- Translating proper nouns (like "Anzac") is optional - use transcription if appropriate
- Use consistent formatting for all translations

Return the results in valid JSON format like this:
[
  {
    "word": "identified term",
    "definition": "English definition",
    "translations": {
      "zh-CN": "Chinese translation",
      "ar": "Arabic translation",
      ...
    }
  },
  ...
]

Return only the pure JSON, no introduction or explanations.
`;

  // Call Claude API and parse response
  try {
    const response = await callClaudeAPI(prompt);
    
    // Extract JSON object from response
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Claude response');
    }
    
    let terms = JSON.parse(jsonMatch[0]);
    console.log(`Extracted ${terms.length} terms from Claude's response`);
    return terms;
  } catch (error) {
    console.error('Error analyzing questions:', error);
    return [];
  }
};

// Main function
const main = async () => {
  // Load data
  const allQuestions = loadQuestions();
  const languages = loadLanguages();
  const trackingData = loadProcessedQuestions();
  const existingKeywords = loadKeywords();
  
  // Determine which questions need processing
  const processedIds = new Set(trackingData.processedIds || []);
  const newQuestions = allQuestions.filter(q => !processedIds.has(q.id));
  
  console.log(`Found ${newQuestions.length} new questions to process`);
  
  if (newQuestions.length === 0) {
    console.log('No new questions to process. Exiting.');
    return;
  }
  
  // Process questions in batches of 5
  const batchSize = 5;
  let processedCount = 0;
  let newTerms = [];
  
  for (let i = 0; i < newQuestions.length; i += batchSize) {
    const batch = newQuestions.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} questions)...`);
    
    const batchTerms = await analyzeQuestions(batch, languages);
    newTerms = [...newTerms, ...batchTerms];
    
    // Update tracking data after each batch
    batch.forEach(q => processedIds.add(q.id));
    processedCount += batch.length;
    
    console.log(`Processed ${processedCount}/${newQuestions.length} questions`);
    
    // Wait a bit between batches
    if (i + batchSize < newQuestions.length) {
      console.log('Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`Analysis complete. Found ${newTerms.length} new terms.`);
  
  // Merge with existing keywords, avoiding duplicates
  const existingTermsMap = new Map();
  existingKeywords.forEach(term => {
    if (typeof term === 'string') {
      existingTermsMap.set(term.toLowerCase(), term);
    } else if (term && term.word) {
      existingTermsMap.set(term.word.toLowerCase(), term);
    }
  });
  
  let updatedKeywords = [...existingKeywords];
  let newTermCount = 0;
  
  newTerms.forEach(newTerm => {
    const key = newTerm.word.toLowerCase();
    if (!existingTermsMap.has(key)) {
      updatedKeywords.push(newTerm);
      newTermCount++;
    } else {
      // If we have a string entry, replace it with the object with translations
      const existingTerm = existingTermsMap.get(key);
      if (typeof existingTerm === 'string') {
        const index = updatedKeywords.findIndex(t => 
          typeof t === 'string' && t.toLowerCase() === key
        );
        if (index !== -1) {
          updatedKeywords[index] = newTerm;
          newTermCount++;
        }
      }
    }
  });
  
  console.log(`Added ${newTermCount} new terms to keywords.json`);
  
  // Save updated keywords
  if (saveJSON(KEYWORDS_PATH, updatedKeywords)) {
    console.log(`Successfully updated keywords.json with ${updatedKeywords.length} total terms`);
  }
  
  // Save updated tracking data
  const updatedTrackingData = {
    processedIds: Array.from(processedIds),
    lastUpdated: new Date().toISOString()
  };
  
  if (saveJSON(TRACKING_PATH, updatedTrackingData)) {
    console.log(`Successfully updated tracking data (${updatedTrackingData.processedIds.length} processed questions)`);
  }
};

// Run the script
main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});