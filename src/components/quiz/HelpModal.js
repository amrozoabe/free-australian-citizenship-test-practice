// src/components/quiz/HelpModal.js - Updated to use keyword database
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
import { SUPPORTED_LANGUAGES } from '../../constants/languages';

// Get a translated label for a given key and language
const getTranslatedLabel = (key, language) => {
  const translations = {
    helpWithTerminology: {
      'en': 'Help with Terminology',
      'zh-CN': '术语帮助',
      'zh-TW': '術語幫助',
      'ar': 'مساعدة مع المصطلحات',
      'pa': 'ਸ਼ਬਦਾਵਲੀ ਮਦਦ',
      'hi': 'शब्दावली सहायता',
      'fil': 'Tulong sa Terminolohiya',
      'vi': 'Trợ giúp về Thuật ngữ',
      'es': 'Ayuda con Terminología',
      'fr': 'Aide avec la Terminologie'
    },
    analyzing: {
      'en': 'Analyzing question...',
      'zh-CN': '分析问题...',
      'zh-TW': '分析問題...',
      'ar': 'تحليل السؤال...',
      'pa': 'ਸਵਾਲ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...',
      'hi': 'प्रश्न का विश्लेषण कर रहा है...',
      'fil': 'Sinusuri ang tanong...',
      'vi': 'Đang phân tích câu hỏi...',
      'es': 'Analizando pregunta...',
      'fr': 'Analyse de la question...'
    },
    noTerms: {
      'en': 'No complex terms identified in this question.',
      'zh-CN': '在此问题中没有发现复杂术语。',
      'zh-TW': '在此問題中沒有發現複雜術語。',
      'ar': 'لم يتم تحديد مصطلحات معقدة في هذا السؤال.',
      'pa': 'ਇਸ ਸਵਾਲ ਵਿੱਚ ਕੋਈ ਜਟਿਲ ਸ਼ਬਦ ਨਹੀਂ ਮਿਲੇ।',
      'hi': 'इस प्रश्न में कोई जटिल शब्द नहीं पाए गए।',
      'fil': 'Walang nakilalang komplikadong termino sa tanong na ito.',
      'vi': 'Không có thuật ngữ phức tạp nào được xác định trong câu hỏi này.',
      'es': 'No se identificaron términos complejos en esta pregunta.',
      'fr': 'Aucun terme complexe identifié dans cette question.'
    },
    translation: {
      'en': 'Translation:',
      'zh-CN': '翻译:',
      'zh-TW': '翻譯:',
      'ar': 'الترجمة:',
      'pa': 'ਅਨੁਵਾਦ:',
      'hi': 'अनुवाद:',
      'fil': 'Pagsasalin:',
      'vi': 'Dịch:',
      'es': 'Traducción:',
      'fr': 'Traduction:'
    },
    close: {
      'en': 'Close',
      'zh-CN': '关闭',
      'zh-TW': '關閉',
      'ar': 'إغلاق',
      'pa': 'ਬੰਦ ਕਰੋ',
      'hi': 'बंद करें',
      'fil': 'Isara',
      'vi': 'Đóng',
      'es': 'Cerrar',
      'fr': 'Fermer'
    }
  };

  // Get the translation for this key and language
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
  }
  
  // Fall back to English if translation not available
  return translations[key]['en'] || key;
};

const HelpModal = ({ 
  visible, 
  onClose, 
  isLoading, 
  terms = [], 
  isDarkMode = false,
  language = 'en' 
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
              {getTranslatedLabel('helpWithTerminology', language)}
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
                {getTranslatedLabel('analyzing', language)}
              </Text>
            </View>
          ) : terms.length === 0 ? (
            <Text style={[
              styles.noTermsText,
              { color: isDarkMode ? '#ccc' : '#666' }
            ]}>
              {getTranslatedLabel('noTerms', language)}
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
                        {getTranslatedLabel('translation', language)}
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
            <Text style={styles.closeButtonText}>
              {getTranslatedLabel('close', language)}
            </Text>
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