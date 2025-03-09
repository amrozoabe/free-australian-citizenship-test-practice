// src/components/quiz/HelpModal.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';

const HelpModal = ({ 
  visible, 
  onClose, 
  isLoading, 
  terms = [], 
  isDarkMode = false 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: isDarkMode ? '#333' : 'white' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: isDarkMode ? '#fff' : '#333' }
            ]}>
              Help with Terminology
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[
                styles.loadingText,
                { color: isDarkMode ? '#ccc' : '#666' }
              ]}>
                Analyzing question...
              </Text>
            </View>
          ) : terms.length === 0 ? (
            <Text style={[
              styles.noTermsText,
              { color: isDarkMode ? '#ccc' : '#666' }
            ]}>
              No complex terms identified in this question.
            </Text>
          ) : (
            <ScrollView>
              {terms.map((item, index) => (
                <View key={index} style={styles.termContainer}>
                  <Text style={[
                    styles.term,
                    { color: isDarkMode ? '#fff' : '#222' }
                  ]}>
                    {item.term}
                  </Text>
                  
                  <Text style={[
                    styles.explanation,
                    { color: isDarkMode ? '#ddd' : '#444' }
                  ]}>
                    {item.explanation}
                  </Text>
                  
                  {item.translation && (
                    <View style={styles.translationContainer}>
                      <Text style={[
                        styles.translationHeader,
                        { color: isDarkMode ? '#bbb' : '#555' }
                      ]}>
                        Translation:
                      </Text>
                      <Text style={[
                        styles.translation,
                        { color: isDarkMode ? '#ddd' : '#444' }
                      ]}>
                        {item.translation}
                      </Text>
                    </View>
                  )}
                  
                  {index < terms.length - 1 && (
                    <View style={[
                      styles.divider,
                      { backgroundColor: isDarkMode ? '#555' : '#ddd' }
                    ]} />
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={styles.closeButtonContainer}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  termContainer: {
    marginBottom: 20,
  },
  term: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  translationContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderRadius: 6,
  },
  translationHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  translation: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginTop: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noTermsText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
  },
  closeButtonContainer: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default HelpModal;