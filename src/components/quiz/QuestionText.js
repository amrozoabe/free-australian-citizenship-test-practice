import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext'; // Fixed import path - going up two levels

const QuestionText = ({ text = "", keywords = [], userLanguage = "en" }) => {
  const [activeKeyword, setActiveKeyword] = useState(null);
  const { state } = useQuiz();
  
  if (!text) return null;

  // Function to find potential keywords in the text
  const findKeywordsInText = (textContent, keywordList) => {
    // Check if keywordList is an array and has elements
    if (!Array.isArray(keywordList) || keywordList.length === 0) {
      return textContent;
    }

    // Sort keywords by length (longest first) to handle cases where one keyword is part of another
    const sortedKeywords = [...keywordList].sort((a, b) => b.word.length - a.word.length);
    
    // Replace each occurrence of a keyword with a marked version
    let markedText = textContent;
    
    sortedKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.word}\\b`, 'gi');
      markedText = markedText.replace(regex, `{${keyword.word}}`);
    });
    
    return markedText;
  };

  // Process the text to find and mark keywords
  const processedText = findKeywordsInText(text, Array.isArray(keywords) ? keywords : []);
  
  // Split the text by marked keywords
  const parts = processedText.split(/(\{[^}]+\})/);

  const handleKeywordPress = (keyword) => {
    const keywordObj = keywords.find(k => k.word.toLowerCase() === keyword.toLowerCase());
    if (keywordObj) {
      setActiveKeyword(keywordObj);
    }
  };

  const handleCloseModal = () => {
    setActiveKeyword(null);
  };

  return (
    <View style={styles.container}>
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

      {/* Modal for displaying keyword definition and translation */}
      <Modal
        visible={activeKeyword !== null}
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
            { backgroundColor: state.settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <ScrollView>
              {activeKeyword && (
                <>
                  <Text style={[
                    styles.modalTitle,
                    { color: state.settings?.theme === 'dark' ? '#fff' : '#000' }
                  ]}>
                    {activeKeyword.word}
                  </Text>
                  
                  <Text style={styles.sectionTitle}>Definition</Text>
                  <Text style={[
                    styles.definitionText,
                    { color: state.settings?.theme === 'dark' ? '#ddd' : '#333' }
                  ]}>
                    {activeKeyword.definition}
                  </Text>
                  
                  {userLanguage !== 'en' && activeKeyword.translations && activeKeyword.translations[userLanguage] && (
                    <>
                      <Text style={styles.sectionTitle}>
                        Translation
                      </Text>
                      <Text style={[
                        styles.translationText,
                        { color: state.settings?.theme === 'dark' ? '#ddd' : '#333' }
                      ]}>
                        {activeKeyword.translations[userLanguage]}
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
  definitionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
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

export default QuestionText;