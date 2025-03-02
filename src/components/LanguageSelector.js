// src/components/LanguageSelector.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { useQuiz } from '../contexts/QuizContext';
import { SET_NATIVE_LANGUAGE } from '../contexts/QuizContext';

const LanguageSelector = () => {
  const { state, dispatch } = useQuiz();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === state.settings?.nativeLanguage
  );

  const handleLanguageSelect = (languageCode) => {
    dispatch({ type: SET_NATIVE_LANGUAGE, payload: languageCode });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonLabel}>Display Language</Text>
          <Text style={styles.selectedLanguage}>
            {selectedLanguage?.name || 'Select Language'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === state.settings?.nativeLanguage && styles.selectedItem
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <View>
                    <Text style={styles.languageName}>{item.name}</Text>
                    <Text style={styles.nativeName}>{item.nativeName}</Text>
                  </View>
                  {item.code === state.settings?.nativeLanguage && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  selectedLanguage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  chevron: {
    fontSize: 20,
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f9ff',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
  },
});

export default LanguageSelector;
