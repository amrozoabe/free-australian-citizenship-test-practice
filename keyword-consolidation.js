// keyword-consolidation.js
// This script consolidates keywords.json and keywords-enhanced.json
// Run this script from your project root

const fs = require('fs');
const path = require('path');

// Paths to the keyword files
const KEYWORDS_PATH = path.join(__dirname, 'src', 'data', 'keywords.json');
const KEYWORDS_ENHANCED_PATH = path.join(__dirname, 'src', 'data', 'keywords-enhanced.json');
const BACKUP_PATH = path.join(__dirname, 'src', 'data', 'keywords.json.bak');

// Main function to consolidate files
async function consolidateKeywords() {
  console.log('Starting keyword file consolidation...');
  
  try {
    // 1. Read both files
    const keywordsRaw = fs.readFileSync(KEYWORDS_PATH, 'utf8');
    const keywordsEnhancedRaw = fs.readFileSync(KEYWORDS_ENHANCED_PATH, 'utf8');
    
    const keywords = JSON.parse(keywordsRaw);
    const keywordsEnhanced = JSON.parse(keywordsEnhancedRaw);
    
    console.log(`Read ${keywords.length} items from keywords.json`);
    console.log(`Read ${keywordsEnhanced.length} items from keywords-enhanced.json`);
    
    // 2. Find words from keywords.json that are missing in keywords-enhanced.json
    const enhancedWords = keywordsEnhanced.map(item => 
      typeof item === 'object' && item.word ? item.word.toLowerCase() : null
    ).filter(word => word !== null);
    
    const missingWords = keywords.filter(word => 
      typeof word === 'string' && !enhancedWords.includes(word.toLowerCase())
    );
    
    console.log(`Found ${missingWords.length} words that are in keywords.json but not in keywords-enhanced.json`);
    
    // 3. Backup the original keywords.json file
    fs.copyFileSync(KEYWORDS_PATH, BACKUP_PATH);
    console.log(`Backed up keywords.json to ${BACKUP_PATH}`);
    
    // 4. Replace keywords.json with keywords-enhanced.json
    fs.copyFileSync(KEYWORDS_ENHANCED_PATH, KEYWORDS_PATH);
    console.log('Replaced keywords.json with enhanced version');
    
    // 5. If needed, update imports in components that use keywords.json
    updateComponentReferences();
    
    console.log('Keyword consolidation complete!');
    console.log(`Note: ${missingWords.length} words from the original keywords.json are not in the enhanced version.`);
    if (missingWords.length > 0) {
      console.log('You may want to manually add these words to the enhanced file.');
      console.log('The original keywords.json has been backed up to keywords.json.bak');
    }
  } catch (error) {
    console.error('Error consolidating keyword files:', error);
  }
}

// Update component references to the keywords file if needed
function updateComponentReferences() {
  const filesToUpdate = [
    path.join(__dirname, 'src', 'components', 'quiz', 'InteractiveQuestionText.js'),
    path.join(__dirname, 'src', 'components', 'quiz', 'QuestionText.js')
  ];
  
  filesToUpdate.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file uses keywords.json
        if (content.includes("keywords.json")) {
          // No need to change import if we're keeping the same filename
          // If we were changing the filename, we'd update the import here
          
          console.log(`Checked ${filePath} - no changes needed as we're keeping the keywords.json filename`);
        }
      }
    } catch (error) {
      console.error(`Error updating references in ${filePath}:`, error);
    }
  });
}

// Run the consolidation
consolidateKeywords();