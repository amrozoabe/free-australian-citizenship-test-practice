// src/components/LanguageSelector.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { SET_NATIVE_LANGUAGE } from '../contexts/QuizContext';

const LanguageSelector = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const { state, dispatch } = useQuiz();
  const currentLanguage = state.settings?.nativeLanguage || 'en';

  // Find the current language display name
  const currentLanguageData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
  const currentLanguageName = currentLanguageData ? 
    `${currentLanguageData.name} (${currentLanguageData.nativeName})` : 
    'English';

  const handleSelectLanguage = async (languageCode) => {
    setSaving(true);
    
    // Save user's language selection
    await dispatch({
      type: SET_NATIVE_LANGUAGE,
      payload: languageCode
    });
    
    // Show brief saving indicator before closing modal
    setTimeout(() => {
      setSaving(false);
      setModalVisible(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Language:</Text>
      <TouchableOpacity 
        style={[
          styles.languageButton,
          { backgroundColor: state.settings?.theme === 'dark' ? '#333' : '#fff' }
        ]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.languageText,
          { color: state.settings?.theme === 'dark' ? '#fff' : '#333' }
        ]}>
          {currentLanguageName}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: state.settings?.theme === 'dark' ? '#333' : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: state.settings?.theme === 'dark' ? '#fff' : '#333' }
              ]}>
                Select Your Language
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {saving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ 
                  marginTop: 10, 
                  color: state.settings?.theme === 'dark' ? '#fff' : '#333'
                }}>
                  Saving your language preference...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.languageList}>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      currentLanguage === language.code && styles.selectedLanguageItem
                    ]}
                    onPress={() => handleSelectLanguage(language.code)}
                  >
                    <View style={styles.languageItemContent}>
                      <Text style={[
                        styles.languageItemName,
                        { color: state.settings?.theme === 'dark' ? '#fff' : '#333' }
                      ]}>
                        {language.name}
                      </Text>
                      <Text style={[
                        styles.languageItemNative,
                        { color: state.settings?.theme === 'dark' ? '#ccc' : '#666' }
                      ]}>
                        {language.nativeName}
                      </Text>
                    </View>
                    
                    {currentLanguage === language.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageText: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
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
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 22,
    color: '#666',
    padding: 5,
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageItemContent: {
    flex: 1,
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  languageItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageItemNative: {
    fontSize: 14,
    marginTop: 4,
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default LanguageSelector;