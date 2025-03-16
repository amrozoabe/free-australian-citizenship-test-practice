#!/usr/bin/env node
/**
 * Extract Keywords Script
 * 
 * This script:
 * 1. Loads the "Our Common Bond" text document
 * 2. Filters content to remove basic words
 * 3. Compares with existing keywords.json to avoid duplicates
 * 4. Sends content to Claude API for key term identification
 * 5. Adds new terms with translations to keywords.json
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const TEXT_PATH = path.join(__dirname, 'assets', 'our-common-bond.txt'); // Main document path
const KEYWORDS_PATH = path.join(__dirname, 'src/data/keywords.json');
const LANGUAGES_PATH = path.join(__dirname, 'src/constants/languages.js');

// List of basic words to exclude
const BASIC_WORDS = [
  "come", "get", "give", "go", "keep", "let", "make", "put", "seem", "take", 
  "be", "do", "have", "say", "see", "send", "may", "will", 
  "about", "across", "after", "against", "among", "at", "before", "between", 
  "by", "down", "from", "in", "off", "on", "over", "through", "to", "under", "up", "with", 
  "as", "for", "of", "till", "than", 
  "a", "the", "all", "any", "every", "no", "other", "some", "such", "that", "this", 
  "i", "he", "you", "who", 
  "and", "because", "but", "or", "if", "though", "while", 
  "how", "when", "where", "why", 
  "again", "ever", "far", "forward", "here", "near", "now", "out", "still", "then", "there", "together", "well", 
  "almost", "enough", "even", "little", "much", "not", "only", "quite", "so", "very", 
  "tomorrow", "yesterday", 
  "north", "south", "east", "west",
  "please", "yes"
];

// Add more common words that should be excluded
const ADDITIONAL_COMMON_WORDS = [
  "also", "can", "could", "would", "should", "must", "many", "more", "most", "our", 
  "their", "them", "they", "we", "what", "which", "she", "her", "his", "me", "my", "your", 
  "its", "each", "few", "into", "like", "just", "new", "time", "year", "years", "day", 
  "days", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"
];

// Combined list of words to exclude
const WORDS_TO_EXCLUDE = new Set([
  ...BASIC_WORDS, 
  ...ADDITIONAL_COMMON_WORDS
].map(word => word.toLowerCase()));

// Check if required files exist
if (!fs.existsSync(KEYWORDS_PATH)) {
  console.error(`Keywords file not found at ${KEYWORDS_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(LANGUAGES_PATH)) {
  console.error(`Languages file not found at ${LANGUAGES_PATH}`);
  process.exit(1);
}

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

// Load existing keywords
const loadKeywords = () => {
  return safeReadJSON(KEYWORDS_PATH, []);
};

// Read text from the our-common-bond.txt file
const getDocumentText = () => {
  try {
    if (!fs.existsSync(TEXT_PATH)) {
      console.error(`Text file not found at ${TEXT_PATH}`);
      console.error('Please place the "Our Common Bond" document as a text file at:');
      console.error(`- ${TEXT_PATH}`);
      process.exit(1);
    }
    
    const text = fs.readFileSync(TEXT_PATH, 'utf8');
    return text;
  } catch (error) {
    console.error('Error reading text file:', error);
    process.exit(1);
  }
};

// Extract potential keywords from text that are not in the exclusion list
const extractPotentialKeywords = (text, existingKeywordsMap) => {
  // Split text into words
  const words = text.split(/\b/).filter(word => 
    // Keep only words with letters, at least 4 characters long, and not in exclusion list
    /^[a-zA-Z][a-zA-Z\-]*$/.test(word) && 
    word.length >= 4 && 
    !WORDS_TO_EXCLUDE.has(word.toLowerCase()) &&
    !existingKeywordsMap.has(word.toLowerCase())
  );
  
  // Get unique words
  const uniqueWords = [...new Set(words)];
  
  // Filter out words that are just forms of other words (plurals, etc.)
  const filteredWords = [];
  const wordForms = new Set();
  
  for (const word of uniqueWords) {
    const lowerWord = word.toLowerCase();
    let isForm = false;
    
    // Check if this is a form of a word we've already included
    for (const existingWord of wordForms) {
      if (lowerWord.startsWith(existingWord) || existingWord.startsWith(lowerWord)) {
        isForm = true;
        break;
      }
    }
    
    if (!isForm) {
      filteredWords.push(word);
      wordForms.add(lowerWord);
    }
  }
  
  return filteredWords;
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

// Process document in chunks due to token limits
const processDocumentInChunks = async (text, languageCodes, existingKeywordsMap) => {
  // Split into approximately 10,000 character chunks
  const chunkSize = 10000;
  const chunks = [];
  
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  console.log(`Processing document in ${chunks.length} chunks`);
  
  let allTerms = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i+1}/${chunks.length}...`);
    
    // Extract potential keywords from this chunk
    const chunkKeywords = extractPotentialKeywords(chunks[i], existingKeywordsMap);
    
    if (chunkKeywords.length === 0) {
      console.log(`No new potential keywords found in chunk ${i+1}`);
      continue;
    }
    
    console.log(`Found ${chunkKeywords.length} potential keywords in chunk ${i+1}`);
    
    // Prepare the keywords formatted as a list for Claude
    const keywordsList = chunkKeywords.join(', ');
    
    // Create prompt with specific keywords instead of full text
    const prompt = `
I need you to analyze these terms from the Australian citizenship test material "Our Common Bond" and provide definitions and translations for non-native English speakers:

TERMS: ${keywordsList}

For each term you can provide a definition for:
1. Provide a clear, concise definition in English that explains its meaning in the context of Australian citizenship
2. Translate the term to these languages: ${languageCodes.join(', ')}

Focus on:
- Australian-specific concepts, places, people, and events
- Government and legal terminology
- Historical terms
- Cultural references
- Words or phrases that might be unfamiliar to someone learning English

IMPORTANT:
- Skip any common words or general English vocabulary
- Translating proper nouns is optional - use transcription if appropriate
- Use consistent formatting for all translations

Return the results ONLY as valid JSON with this format:
[
  {
    "word": "term1",
    "definition": "definition in English",
    "translations": {
      "zh-CN": "Chinese translation",
      "ar": "Arabic translation",
      ...
    }
  },
  ...
]

Return ONLY the JSON array, no other text.
`;

    try {
      const response = await callClaudeAPI(prompt);
      
      // Extract JSON from the response more reliably
      // Look for something that looks like a JSON array
      const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]/;
      const jsonMatch = response.match(jsonRegex);
      
      if (!jsonMatch) {
        console.log('Claude response did not contain valid JSON. Response snippet:');
        console.log(response.substring(0, 200) + '...');
        console.log('Trying an alternative parsing approach...');
        
        // Try to find the JSON by looking for the first '[' and last ']'
        const startIndex = response.indexOf('[');
        const endIndex = response.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
          const jsonCandidate = response.substring(startIndex, endIndex + 1);
          try {
            const terms = JSON.parse(jsonCandidate);
            console.log(`Extracted ${terms.length} terms from chunk ${i+1} using alternative parsing`);
            allTerms = [...allTerms, ...terms];
          } catch (parseError) {
            console.error(`Alternative parsing failed:`, parseError.message);
          }
        } else {
          console.error('Could not find JSON in Claude response');
        }
      } else {
        try {
          const terms = JSON.parse(jsonMatch[0]);
          console.log(`Extracted ${terms.length} terms from chunk ${i+1}`);
          allTerms = [...allTerms, ...terms];
        } catch (parseError) {
          console.error(`Error parsing JSON:`, parseError.message);
        }
      }
      
      // Wait a bit between chunks to avoid rate limiting
      if (i < chunks.length - 1) {
        console.log('Waiting 3 seconds before next chunk...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`Error processing chunk ${i+1}:`, error);
    }
  }
  
  return allTerms;
};

// Main function
const main = async () => {
  try {
    // Load languages
    const languages = loadLanguages();
    if (languages.length === 0) {
      throw new Error('No languages found in languages.js');
    }
    
    // Load existing keywords
    const existingKeywords = loadKeywords();
    console.log(`Loaded ${existingKeywords.length} existing keywords`);
    
    // Create a map of existing keywords for quick lookup
    const existingTermsMap = new Map();
    existingKeywords.forEach(term => {
      if (typeof term === 'string') {
        existingTermsMap.set(term.toLowerCase(), term);
      } else if (term && term.word) {
        existingTermsMap.set(term.word.toLowerCase(), term);
      }
    });
    
    // Get document text
    console.log('Loading "Our Common Bond" document from text file...');
    const documentText = getDocumentText();
    if (!documentText) {
      throw new Error('Failed to load document text');
    }
    
    console.log(`Loaded document text (${documentText.length} characters)`);
    
    // Process document and extract terms
    const extractedTerms = await processDocumentInChunks(documentText, languages, existingTermsMap);
    console.log(`Total extracted terms: ${extractedTerms.length}`);
    
    // Filter out terms that already exist
    let newTermCount = 0;
    const updatedKeywords = [...existingKeywords];
    
    extractedTerms.forEach(newTerm => {
      if (!newTerm || !newTerm.word) return;
      
      const key = newTerm.word.toLowerCase();
      if (!existingTermsMap.has(key)) {
        updatedKeywords.push(newTerm);
        newTermCount++;
        existingTermsMap.set(key, newTerm); // Add to map to prevent duplicates
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
    
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});