// src/components/quiz/UnifiedQuestionText.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

const UnifiedQuestionText = ({ 
  text = "", 
  keywords = [], 
  userLanguage = null,
  showDefinitions = false 
}) => {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { state } = useQuiz();
  
  // Use the provided language or fall back to the user's settings
  const language = userLanguage || state?.settings?.nativeLanguage || 'en';
  
  if (!text) return null;

  // Just render the question text without any interactive elements
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      
      {/* Only show the definition panel if enabled AND a keyword is selected */}
      {showDefinitions && selectedKeyword && (
        <Animated.View style={[styles.definitionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.definitionTitle}>Definition</Text>
          {selectedKeyword.definition ? (
            <Text style={styles.definitionText}>{selectedKeyword.definition}</Text>
          ) : (
            <Text style={styles.definitionText}>No definition available</Text>
          )}
          
          {selectedKeyword.translations && selectedKeyword.translations[language] && (
            <>
              <Text style={styles.translationTitle}>
                Translation
              </Text>
              <Text style={styles.translationText}>
                {selectedKeyword.translations[language]}
              </Text>
            </>
          )}
        </Animated.View>
      )}
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
  }
});

export default UnifiedQuestionText;