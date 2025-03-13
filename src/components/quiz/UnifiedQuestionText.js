// src/components/quiz/UnifiedQuestionText.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext';
import keywords from '../../data/keywords.json';

const UnifiedQuestionText = ({ 
  text = "", 
  keywords: additionalKeywords = [], 
  userLanguage = null,
  showDefinitions = true 
}) => {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { state } = useQuiz();
  
  // Use the provided language or fall back to the user's settings
  const language = userLanguage || state?.settings?.nativeLanguage || 'en';
  
  if (!text) return null;

  // Function to find potential keywords in the text
  const findKeywordsInText = (textContent) => {
    // Create a map of all available keywords
    const allKeywords = new Map();
    
    // Add from the keywords.json file
    if (Array.isArray(keywords)) {
      keywords.forEach(keyword => {
        if (typeof keyword === 'string') {
          allKeywords.set(keyword.toLowerCase(), { word: keyword });
        } else if (keyword && keyword.word) {
          allKeywords.set(keyword.word.toLowerCase(), keyword);
        }
      });
    }
    
    // Add any additional keywords passed to the component
    if (Array.isArray(additionalKeywords)) {
      additionalKeywords.forEach(keyword => {
        if (typeof keyword === 'string') {
          allKeywords.set(keyword.toLowerCase(), { word: keyword });
        } else if (keyword && keyword.word) {
          allKeywords.set(keyword.word.toLowerCase(), keyword);
        }
      });
    }
    
    // If no keywords, just return the text
    if (allKeywords.size === 0) {
      return { markedText: textContent, foundKeywords: [] };
    }
    
    // Sort keywords by length (longest first) to handle cases where one keyword is part of another
    const sortedKeywords = Array.from(allKeywords.values())
      .sort((a, b) => {
        const aWord = typeof a === 'string' ? a : a.word;
        const bWord = typeof b === 'string' ? b : b.word;
        return bWord.length - aWord.length;
      });
    
    // Replace each occurrence of a keyword with a marked version
    let markedText = textContent;
    const foundKeywords = [];
    
    sortedKeywords.forEach(keyword => {
      const keywordText = typeof keyword === 'string' ? keyword : keyword.word;
      const regex = new RegExp(`\\b${keywordText}\\b`, 'gi');
      
      // Check if the keyword exists in the text
      if (regex.test(markedText)) {
        // Add to found keywords
        foundKeywords.push(keyword);
        
        // Reset the regex (since we used test() which moves the lastIndex)
        regex.lastIndex = 0;
        
        // Mark the keyword in text
        markedText = markedText.replace(regex, `{${keywordText}}`);
      }
    });
    
    return { markedText, foundKeywords };
  };

  // Process the text to find and mark keywords
  const { markedText, foundKeywords } = findKeywordsInText(text);
  
  // Split the text by marked keywords
  const parts = markedText.split(/(\{[^}]+\})/);

  const handleKeywordPress = (keyword) => {
    // Find the keyword info
    let keywordObj;
    
    // Check in keywords.json
    if (Array.isArray(keywords)) {
      keywordObj = keywords.find(k => {
        if (typeof k === 'string') {
          return k.toLowerCase() === keyword.toLowerCase();
        } else if (k && k.word) {
          return k.word.toLowerCase() === keyword.toLowerCase();
        }
        return false;
      });
    }
    
    // Check in additional keywords
    if (!keywordObj && Array.isArray(additionalKeywords)) {
      keywordObj = additionalKeywords.find(k => {
        if (typeof k === 'string') {
          return k.toLowerCase() === keyword.toLowerCase();
        } else if (k && k.word) {
          return k.word.toLowerCase() === keyword.toLowerCase();
        }
        return false;
      });
    }
    
    // Format the keyword object for our modal
    if (keywordObj) {
      if (typeof keywordObj === 'string') {
        setSelectedKeyword({ word: keywordObj });
      } else {
        setSelectedKeyword(keywordObj);
      }
      
      // Animate the fade in for the definition
      if (showDefinitions) {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedKeyword(null);
  };

  // Render the text with interactive keywords
  const renderText = () => {
    return (
      <Text style={styles.text}>
        {parts.map((part, index) => {
          const match = part.match(/\{([^}]+)\}/);
          if (match) {
            const word = match[1];
            return (
              <TouchableOpacity 
                key={`keyword-${index}`} 
                onPress={() => handleKeywordPress(word)}
              >
                <Text style={styles.keywordText}>{word}</Text>
              </TouchableOpacity>
            );
          }
          return <Text key={`text-${index}`}>{part}</Text>;
        })}
      </Text>
    );
  };

  // Render the keyword definition
  const renderDefinition = () => {
    if (!selectedKeyword || !showDefinitions) return null;

    const definition = typeof selectedKeyword === 'object' ? selectedKeyword.definition : null;
    const translation = typeof selectedKeyword === 'object' && 
                        selectedKeyword.translations ? 
                        selectedKeyword.translations[language] : null;

    return (
      <Animated.View style={[styles.definitionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.definitionTitle}>Definition</Text>
        {definition ? (
          <Text style={styles.definitionText}>{definition}</Text>
        ) : (
          <Text style={styles.definitionText}>No definition available</Text>
        )}
        
        {translation && (
          <>
            <Text style={styles.translationTitle}>
              Translation
            </Text>
            <Text style={styles.translationText}>
              {translation}
            </Text>
          </>
        )}
      </Animated.View>
    );
  };

  // Modal for displaying keyword definition and translation
  const renderModal = () => {
    if (!selectedKeyword) return null;
    
    const isDarkMode = state.settings?.theme === 'dark';

    return (
      <Modal
        visible={selectedKeyword !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <View style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#333' : 'white' }
          ]}>
            <ScrollView>
              {selectedKeyword && (
                <>
                  <Text style={[
                    styles.modalTitle,
                    { color: isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {typeof selectedKeyword === 'string' ? 
                      selectedKeyword : selectedKeyword.word}
                  </Text>
                  
                  <Text style={styles.sectionTitle}>Definition</Text>
                  <Text style={[
                    styles.definitionText,
                    { color: isDarkMode ? '#ddd' : '#333' }
                  ]}>
                    {selectedKeyword.definition || 'No definition available'}
                  </Text>
                  
                  {language !== 'en' && selectedKeyword.translations && 
                   selectedKeyword.translations[language] && (
                    <>
                      <Text style={styles.sectionTitle}>
                        Translation
                      </Text>
                      <Text style={[
                        styles.translationText,
                        { color: isDarkMode ? '#ddd' : '#333' }
                      ]}>
                        {selectedKeyword.translations[language]}
                      </Text>
                    </>
                  )}
                </>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderText()}
      {showDefinitions ? renderDefinition() : renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  keywordText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  definitionContainer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    marginTop: 15,
  },
  definitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2196F3',
  },
  definitionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  translationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2196F3',
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnifiedQuestionText;