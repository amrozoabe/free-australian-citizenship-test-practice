import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

// Define study materials based on the four sections of the Australian Citizenship Test
const studyMaterials = [
  {
    id: 'part1',
    title: 'Part 1: Australia and its people',
    description: 'Learn about Australia\'s history, geography, and culture',
    icon: '🇦🇺',
    topics: [
      'Aboriginal and Torres Strait Islander peoples',
      'European settlement and migration',
      'Important historical events',
      'National symbols and holidays'
    ]
  },
  {
    id: 'part2',
    title: 'Part 2: Australia\'s democratic beliefs, rights and liberties',
    description: 'Understanding democracy, freedom and equality',
    icon: '🗳️',
    topics: [
      'Parliamentary democracy',
      'Rule of law',
      'Freedom of speech and association',
      'Equal rights and opportunities'
    ]
  },
  {
    id: 'part3',
    title: 'Part 3: Government and the Law in Australia',
    description: 'Learn about Australia\'s system of government',
    icon: '⚖️',
    topics: [
      'Three levels of government',
      'The Australian Constitution',
      'Roles of parliament, courts, and police',
      'Rights and responsibilities of citizens'
    ]
  },
  {
    id: 'part4',
    title: 'Part 4: Australian values',
    description: 'Core values that unite Australians',
    icon: '🤝',
    topics: [
      'Freedom and dignity of the individual',
      'Freedom of religion and secular government',
      'Equality of men and women',
      'Mutual respect and tolerance'
    ]
  }
];

export default function StudyScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const StudyCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
      ]}
      onPress={() => navigation.navigate('Quiz', { 
        mode: 'practice',
        category: item.id 
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <View style={styles.cardTitleContainer}>
          <Text style={[
            styles.cardTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.cardDescription,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.topicsList}>
        {item.topics.map((topic, index) => (
          <Text 
            key={index}
            style={[
              styles.topicItem,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}
          >
            • {topic}
          </Text>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.practiceButton}
        onPress={() => navigation.navigate('Quiz', { 
          mode: 'practice',
          category: item.id 
        })}
      >
        <Text style={styles.practiceButtonText}>Practice Questions</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Study Materials
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[
          styles.introText,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          Review these key topics from the Australian citizenship test study guide to prepare for your test. Practice questions for each section.
        </Text>

        <View style={styles.cardsContainer}>
          {studyMaterials.map((item) => (
            <StudyCard key={item.id} item={item} />
          ))}
        </View>
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
    paddingTop: 60, // Extra padding for notch
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exitButton: {
    width: 80,
  },
  exitButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  introText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
  },
  topicsList: {
    marginBottom: 15,
  },
  topicItem: {
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
  practiceButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});