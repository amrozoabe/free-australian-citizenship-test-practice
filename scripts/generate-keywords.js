// Modified version of scripts/generate-keywords.js
// This updated script uses the keywords-enhanced.json file directly
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read existing enhanced keywords
const enhancedKeywordsPath = path.join(__dirname, '../src/data/keywords.json');
let keywords = [];

try {
  const rawKeywords = fs.readFileSync(enhancedKeywordsPath, 'utf8');
  keywords = JSON.parse(rawKeywords);
  console.log(`Read ${keywords.length} existing keywords from enhanced file`);
} catch (error) {
  console.error('Error reading enhanced keywords file:', error);
  process.exit(1);
}

// Extract words that need definitions and translations
// This assumes the enhanced keywords file now contains full objects with word, definition, translations
const wordsToProcess = keywords.filter(item => {
  // Skip items that already have complete data
  if (typeof item === 'object' && item.word && item.definition && item.translations) {
    return false;
  }
  // Include string items or objects without complete data
  return true;
});

console.log(`Found ${wordsToProcess.length} keywords that need processing`);

// Read languages
const languagesFile = fs.readFileSync(
  path.join(__dirname, '../src/constants/languages.js'),
  'utf8'
);

// Extract language codes
const languageCodes = [];
const regex = /code:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = regex.exec(languagesFile)) !== null) {
  languageCodes.push(match[1]);
}

console.log(`Found ${languageCodes.length} languages`);

// Function to call Claude API - API key directly in code (only for development)
async function callClaudeAPI(prompt) {
  // *** REPLACE THIS WITH YOUR ACTUAL CLAUDE API KEY ***
  const CLAUDE_API_KEY = "";
  
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key not provided');
    return null;
  }
  
  try {
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
}

// Process keywords in batches
async function processKeywords() {
  // Convert string keywords to their object form for processing
  const wordsToSend = wordsToProcess.map(item => typeof item === 'string' ? item : item.word);
  const enhancedKeywords = [...keywords]; // Start with existing keywords
  const batchSize = 5; // Process 5 keywords at a time
  
  for (let i = 0; i < wordsToSend.length; i += batchSize) {
    const batch = wordsToSend.slice(i, i + batchSize);
    
    // Create prompt for Claude
    const prompt = `
I need you to provide English definitions and translations for the following Australian citizenship test keywords.
For each word, give a clear, concise definition that explains its meaning in the context of Australian citizenship.
Then translate each word to the following languages: ${languageCodes.join(', ')}

Keywords:
${batch.join('\n')}

Return the results in a valid JSON format like this:
[
  {
    "word": "keyword",
    "definition": "English definition",
    "translations": {
      "zh-CN": "Chinese translation",
      "ar": "Arabic translation",
      ...
    }
  },
  ...
]
Just return the JSON, nothing else. Do not write "here is a...". only write json file.
`;
    
    try {
      console.log(`Processing batch ${i/batchSize + 1}...`);
      const result = await callClaudeAPI(prompt);
      
      if (!result) {
        console.log('No result from API, skipping this batch');
        continue;
      }
      
      // Parse the JSON response
      const batchResults = JSON.parse(result);
      
      // Update the enhanced keywords array
      batchResults.forEach(newKeyword => {
        // Find the index of this word in the enhanced keywords
        const existingIndex = enhancedKeywords.findIndex(item => {
          if (typeof item === 'string') {
            return item.toLowerCase() === newKeyword.word.toLowerCase();
          }
          return item.word && item.word.toLowerCase() === newKeyword.word.toLowerCase();
        });
        
        if (existingIndex >= 0) {
          // Replace the keyword with the enhanced version
          enhancedKeywords[existingIndex] = newKeyword;
        } else {
          // Add as a new keyword
          enhancedKeywords.push(newKeyword);
        }
      });
      
      // Log progress
      console.log(`Processed ${Math.min(i + batchSize, wordsToSend.length)} of ${wordsToSend.length} keywords`);
      
      // Wait a bit between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
    }
  }
  
  // Write to output file (now using the same file)
  fs.writeFileSync(
    enhancedKeywordsPath,
    JSON.stringify(enhancedKeywords, null, 2),
    'utf8'
  );
  
  console.log('Keywords processing complete!');
}

// Run the process
if (wordsToProcess.length > 0) {
  processKeywords().catch(console.error);
} else {
  console.log('No keywords need processing. All keywords already have definitions and translations.');
}