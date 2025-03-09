const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read original keywords
const rawKeywords = fs.readFileSync(
  path.join(__dirname, '../src/data/keywords.json'),
  'utf8'
);
const keywords = JSON.parse(rawKeywords);

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

console.log(`Found ${keywords.length} keywords and ${languageCodes.length} languages`);

// Function to call Claude API - API key directly in code (only for development)
async function callClaudeAPI(prompt) {
  // *** REPLACE THIS WITH YOUR ACTUAL CLAUDE API KEY ***
  const CLAUDE_API_KEY = "";
  
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
  const enhancedKeywords = [];
  const batchSize = 5; // Process 5 keywords at a time
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    
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
      
      // Parse the JSON response
      const batchResults = JSON.parse(result);
      enhancedKeywords.push(...batchResults);
      
      // Log progress
      console.log(`Processed ${Math.min(i + batchSize, keywords.length)} of ${keywords.length} keywords`);
      
      // Wait a bit between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
    }
  }
  
  // Write to output file
  fs.writeFileSync(
    path.join(__dirname, '../src/data/keywords-enhanced.json'),
    JSON.stringify(enhancedKeywords, null, 2),
    'utf8'
  );
  
  console.log('Keywords processing complete!');
}

// Run the process
processKeywords().catch(console.error);