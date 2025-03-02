import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

const studyMaterials = [
  {
    id: 'australian-values',
    title: 'Australian Values',
    description: 'Learn about democracy, equality, and freedom',
    icon: '🤝',
    topics: [
      'Freedom of speech and association',
      'Religious freedom and secular government',
      'Equality under the law',
      'Equal opportunities for all'
    ]
  },
  {
    id: 'history',
    title: 'Australian History',
    description: 'Discover Australia\'s rich history and heritage',
    icon: '📚',
    topics: [
      'Indigenous Australian history',
      'European settlement',
      'Federation and democracy',
      'Modern Australia'
    ]
  },
  {
    id: 'government',
    title: 'Government & Laws',
    description: 'Understanding Australia\'s political system',
    icon: '⚖️',
    topics: [
      'Three levels of government',
      'The Australian Constitution',
      'Voting system',
      'Rights and responsibilities'
    ]
  },
  {
    id: 'symbols',
    title: 'National Symbols',
    description: 'Learn about Australian flags and emblems',
    icon: '🇦🇺',
    topics: [
      'The Australian flag',
      'Indigenous flags',
      'National anthem',
      'Coat of arms'
    ]
  }
];

export default function StudyScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;

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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Study Materials
          </Text>
          <Text style={[
            styles.subtitle,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Select a topic to study and practice
          </Text>
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  cardsContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
    fontSize: 20,
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