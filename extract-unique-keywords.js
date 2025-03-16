#!/usr/bin/env node
/**
 * Extract Unique Keywords from Our Common Bond
 * 
 * This script:
 * 1. Reads the Our Common Bond text file
 * 2. Removes basic words and punctuation
 * 3. Arranges remaining words alphabetically and removes duplicates
 * 4. Checks against keywords.json to remove existing terms
 * 5. Saves the results to our-common-bond-keywords.txt
 */

const fs = require('fs');
const path = require('path');

// File paths
const commonBondPath = path.join(__dirname, 'assets', 'our-common-bond.txt');
const keywordsJsonPath = path.join(__dirname, 'src', 'data', 'keywords.json');
const outputPath = path.join(__dirname, 'assets', 'our-common-bond-keywords.txt');

// Basic words to exclude
const basicWords = [
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

// Convert basic words array to a Set for faster lookups
const basicWordsSet = new Set(basicWords.map(word => word.toLowerCase()));

// Check if required files exist
if (!fs.existsSync(commonBondPath)) {
  console.error(`Error: Our Common Bond text file not found at ${commonBondPath}`);
  process.exit(1);
}

// Load Our Common Bond text
console.log('Reading Our Common Bond text file...');
const commonBondText = fs.readFileSync(commonBondPath, 'utf8');

// Load keywords.json if it exists
let existingKeywords = new Set();
if (fs.existsSync(keywordsJsonPath)) {
  console.log('Reading existing keywords.json file...');
  try {
    const keywordsData = JSON.parse(fs.readFileSync(keywordsJsonPath, 'utf8'));
    
    // Extract terms from the keywords.json structure
    keywordsData.forEach(item => {
      if (typeof item === 'string') {
        existingKeywords.add(item.toLowerCase());
      } else if (item && item.word) {
        existingKeywords.add(item.word.toLowerCase());
      }
    });
    
    console.log(`Loaded ${existingKeywords.size} existing keywords`);
  } catch (error) {
    console.error(`Error reading keywords.json: ${error.message}`);
    console.log('Continuing without existing keywords check');
  }
} else {
  console.log('No existing keywords.json found. All unique words will be included.');
}

// Process the text
console.log('Processing text...');

// 1. Remove all punctuation and split into words
const words = commonBondText
  .replace(/[^\w\s]/g, '') // Remove punctuation
  .replace(/\d+/g, '')     // Remove numbers
  .split(/\s+/)            // Split by whitespace
  .filter(word => word);   // Remove empty strings

console.log(`Total words in document (including duplicates): ${words.length}`);

// 2. Filter out basic words and convert to lowercase
const filteredWords = words
  .map(word => word.toLowerCase())
  .filter(word => word.length > 1)  // Remove single-character words
  .filter(word => !basicWordsSet.has(word));

console.log(`Words remaining after removing basic words: ${filteredWords.length}`);

// 3. Remove duplicates
const uniqueWords = [...new Set(filteredWords)];
console.log(`Unique words after removing duplicates: ${uniqueWords.length}`);

// 4. Filter out words that already exist in keywords.json
const newWords = uniqueWords.filter(word => !existingKeywords.has(word));
console.log(`New words not in existing keywords.json: ${newWords.length}`);

// 5. Sort alphabetically
const sortedWords = newWords.sort();

// 6. Save to output file
fs.writeFileSync(outputPath, sortedWords.join('\n'), 'utf8');
console.log(`Saved ${sortedWords.length} words to ${outputPath}`);

// Output some stats
console.log('\nSummary:');
console.log(`- Total words in document: ${words.length}`);
console.log(`- Words after removing basic words: ${filteredWords.length}`);
console.log(`- Unique words: ${uniqueWords.length}`);
console.log(`- New words not in keywords.json: ${newWords.length}`);
console.log(`- Output saved to: ${outputPath}`);