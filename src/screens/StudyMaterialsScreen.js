import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

export default function StudyMaterialsScreen({ navigation }) {
  const { state } = useQuiz();

  const handleExit = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: state.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.title,
          { color: state.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Study Materials
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Your study materials content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30, // Reduced from 60 to 30
    paddingBottom: 10,
  },
  exitButton: {
    width: 80,
  },
  exitButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    padding: 20,
  },
});