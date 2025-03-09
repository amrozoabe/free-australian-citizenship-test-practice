import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Linking 
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

// Define study materials
const studyMaterials = [
  {
    id: 'australian-values',
    title: 'Australian Values',
    description: 'Democracy, equality, freedom, and respect for the law',
    content: `
Australian values include:
• Freedom of speech and expression
• Freedom of religion and secular government
• Freedom of association
• Equal rights for all people
• The rule of law applies to everyone
• Equality of opportunity
• Peaceful resolution of conflicts
• Respect for the equal worth, dignity, and freedom of the individual
• Mateship and a 'fair go' for all

All Australians should embrace these values regardless of their cultural, ethnic, religious, or linguistic background.
    `,
    link: 'https://immi.homeaffairs.gov.au/citizenship/become-a-citizen/australian-values'
  },
  {
    id: 'government',
    title: 'Australian Government',
    description: 'Understanding Australia\'s political and legal system',
    content: `
Australia has three levels of government:
• Federal Government - handles national matters like defense, immigration, foreign affairs
• State/Territory Governments - handle education, health, roads, police
• Local Governments - handle local issues like waste collection, parks, local roads

Australia is both a parliamentary democracy and a constitutional monarchy. This means:
• The King of Australia is the head of state, represented by the Governor-General
• The Prime Minister is the head of government
• People vote to elect representatives to Parliament
• Laws are made by Parliament and interpreted by courts
    `,
    link: 'https://www.australia.gov.au/government-and-parliament'
  },
  {
    id: 'history',
    title: 'Australian History',
    description: 'Key events and milestones in Australia\'s development',
    content: `
Key historical events:
• Aboriginal and Torres Strait Islander peoples have inhabited Australia for over 65,000 years
• European settlement began in 1788 with the arrival of the First Fleet
• The gold rushes of the 1850s brought people from around the world
• In 1901, the six British colonies united to form the Commonwealth of Australia
• Australia fought alongside allies in WWI and WWII
• Post-WWII migration brought people from across Europe and later Asia
• In 1967, a referendum allowed Aboriginal peoples to be counted in the census
    `,
    link: 'https://www.nationalmuseum.gov.au/learning/australian-history'
  },
  {
    id: 'symbols',
    title: 'National Symbols',
    description: 'Flags, emblems, and other important symbols',
    content: `
Australia's important symbols:
• The Australian National Flag - Blue with Union Jack, Commonwealth Star, and Southern Cross
• Aboriginal Flag - Black (people), Red (land), Yellow (sun)
• Torres Strait Islander Flag - Green (land), Blue (sea), Black lines (people), White star (island groups)
• National anthem - "Advance Australia Fair"
• National colors - Green and gold
• National flower - Golden wattle
• Coat of Arms - Kangaroo and emu supporting a shield showing the states
• National gemstone - Opal
    `,
    link: 'https://www.pmc.gov.au/government/australian-national-symbols'
  }
];

export default function StudyScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
    });
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: settings?.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Study Materials
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[
          styles.introText,
          { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          Review these key topics to prepare for your Australian citizenship test. Practice related questions to test your knowledge.
        </Text>

        {studyMaterials.map((material) => (
          <View 
            key={material.id}
            style={[
              styles.materialCard,
              { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
            ]}
          >
            <Text style={[
              styles.materialTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              {material.title}
            </Text>
            
            <Text style={[
              styles.materialDescription,
              { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {material.description}
            </Text>
            
            <Text style={[
              styles.materialContent,
              { color: settings?.theme === 'dark' ? '#ddd' : '#444' }
            ]}>
              {material.content}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.practiceButton}
                onPress={() => navigation.navigate('Quiz', { 
                  mode: 'practice',
                  category: material.id 
                })}
              >
                <Text style={styles.buttonText}>Practice Questions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => handleOpenLink(material.link)}
              >
                <Text style={styles.linkButtonText}>Official Resource</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    paddingTop: 60,
  },
  exitButton: {
    width: 80,
  },
  exitButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    padding: 20,
  },
  introText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  materialCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  materialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  materialDescription: {
    fontSize: 16,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  materialContent: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  practiceButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});