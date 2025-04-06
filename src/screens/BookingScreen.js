// src/screens/BookingScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Modal, 
  TextInput, 
  Platform,
  Linking,
  Alert
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

// Mock educator profiles
const educators = [
  {
    id: 1,
    name: "Amro",
    languages: ["Arabic", "English"],
    experience: "Worked for years at Illawarra Multicultural Services, a migrant resource centre",
    specialization: "Australian values and government structure",
    avatar: require('../../assets/images/amro.png'),
  },
  {
    id: 2,
    name: "Ria",
    languages: ["Hindi", "English"],
    experience: "Experienced citizenship test tutor with a background in education",
    specialization: "Australian history and culture",
    avatar: require('../../assets/images/ria.png'),
  },
  {
    id: 3,
    name: "Jeffy",
    languages: ["Malayalam", "English"],
    experience: "Professional tutor with expertise in citizenship preparation",
    specialization: "Democratic beliefs and rights",
    avatar: require('../../assets/images/jeffy.png'),
  }
];

// Class types
const classTypes = [
  {
    id: 'in-person',
    title: 'In-Person Private Lesson',
    price: 100,
    details: 'One-on-one personalized tutoring in person',
    duration: '1 hour',
    icon: '👨‍🏫'
  },
  {
    id: 'online',
    title: 'Online Private Lesson',
    price: 50,
    details: 'One-on-one tutoring via video call',
    duration: '1 hour',
    icon: '💻'
  },
  {
    id: 'group',
    title: 'Sunday Group Class (Online)',
    price: 20,
    details: 'Join our weekly online group class every Sunday at 6pm',
    duration: '1 hour',
    icon: '👥'
  }
];

export default function BookingScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;
  
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle exit back to home
  const handleExit = () => {
    navigation.navigate('Home');
  };

  // Open educator details
  const handleSelectEducator = (educator) => {
    setSelectedEducator(educator);
  };

  // Select class type and open booking form
  const handleSelectClass = (classType) => {
    setSelectedClass(classType);
    setModalVisible(true);
  };

  // Handle booking form submission
  const handleBookNow = () => {
    // Basic validation
    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      setShowConfirmation(true);
    }, 1500);
  };

  // Handle payment process
  const handlePayNow = () => {
    // For demonstration, we'll just provide options for payment methods
    Alert.alert(
      'Select Payment Method',
      'Choose your preferred payment method',
      [
        {
          text: 'Credit Card',
          onPress: () => openPaymentLink('creditcard')
        },
        {
          text: 'PayPal',
          onPress: () => openPaymentLink('paypal')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Simulated payment link
  const openPaymentLink = (method) => {
    // This would typically link to your payment processor
    // For demo purposes, we'll just show an alert
    Alert.alert(
      'External Payment',
      `You would now be redirected to a secure ${method} payment page. After payment, your booking will be confirmed via email.`,
      [{ text: 'OK' }]
    );
  };

  // Render each educator card
  const renderEducator = (educator) => (
    <TouchableOpacity 
      key={educator.id}
      style={[
        styles.educatorCard,
        selectedEducator?.id === educator.id && styles.selectedCard,
        { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
      ]}
      onPress={() => handleSelectEducator(educator)}
    >
      <Image source={educator.avatar} style={styles.educatorAvatar} />
      <View style={styles.educatorInfo}>
        <Text style={[
          styles.educatorName,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          {educator.name}
        </Text>
        <Text style={[
          styles.educatorLanguages,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          Languages: {educator.languages.join(', ')}
        </Text>
        <Text style={[
          styles.educatorExperience,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          {educator.experience}
        </Text>
      </View>
      <Text style={styles.selectText}>
        {selectedEducator?.id === educator.id ? '✓ Selected' : 'Select'}
      </Text>
    </TouchableOpacity>
  );

  // Render each class type
  const renderClassType = (classType) => (
    <TouchableOpacity 
      key={classType.id}
      style={[
        styles.classCard,
        { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
      ]}
      onPress={() => handleSelectClass(classType)}
    >
      <Text style={styles.classIcon}>{classType.icon}</Text>
      <View style={styles.classDetails}>
        <Text style={[
          styles.classTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          {classType.title}
        </Text>
        <Text style={[
          styles.classDuration,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          {classType.duration}
        </Text>
        <Text style={[
          styles.classDescription,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          {classType.details}
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${classType.price}</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Booking form modal
  const renderBookingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Book {selectedClass?.title}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={[
              styles.formLabel,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                  color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                }
              ]}
              placeholder="Your full name"
              placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
              value={bookingDetails.name}
              onChangeText={(text) => setBookingDetails({...bookingDetails, name: text})}
            />

            <Text style={[
              styles.formLabel,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Email *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                  color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                }
              ]}
              placeholder="Your email address"
              placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
              keyboardType="email-address"
              value={bookingDetails.email}
              onChangeText={(text) => setBookingDetails({...bookingDetails, email: text})}
            />

            <Text style={[
              styles.formLabel,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Phone Number *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                  color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                }
              ]}
              placeholder="Your contact number"
              placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
              keyboardType="phone-pad"
              value={bookingDetails.phone}
              onChangeText={(text) => setBookingDetails({...bookingDetails, phone: text})}
            />

            {selectedClass?.id !== 'group' && (
              <>
                <Text style={[
                  styles.formLabel,
                  { color: settings.theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  Preferred Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                      color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                    }
                  ]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
                  value={bookingDetails.date}
                  onChangeText={(text) => setBookingDetails({...bookingDetails, date: text})}
                />

                <Text style={[
                  styles.formLabel,
                  { color: settings.theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  Preferred Time
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                      color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                    }
                  ]}
                  placeholder="e.g. 10:00 AM"
                  placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
                  value={bookingDetails.time}
                  onChangeText={(text) => setBookingDetails({...bookingDetails, time: text})}
                />
              </>
            )}

            <Text style={[
              styles.formLabel,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Special Requests or Notes
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: settings.theme === 'dark' ? '#444' : '#f5f5f5',
                  color: settings.theme === 'dark' ? '#fff' : '#1a1a1a'
                }
              ]}
              placeholder="Any specific topics you'd like to focus on?"
              placeholderTextColor={settings.theme === 'dark' ? '#aaa' : '#999'}
              multiline={true}
              numberOfLines={4}
              value={bookingDetails.notes}
              onChangeText={(text) => setBookingDetails({...bookingDetails, notes: text})}
            />

            <View style={styles.educatorSelection}>
              <Text style={[
                styles.formLabel,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Selected Educator:
              </Text>
              <Text style={[
                styles.selectedEducatorText,
                { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {selectedEducator ? selectedEducator.name : 'None selected'}
              </Text>
              {!selectedEducator && (
                <Text style={styles.warningText}>
                  Please select an educator from the previous screen
                </Text>
              )}
            </View>

            <View style={styles.priceBreakdown}>
              <Text style={[
                styles.formLabel,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Price:
              </Text>
              <Text style={[
                styles.priceText,
                { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                ${selectedClass?.price}.00
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.bookNowButton,
                (!selectedEducator || loading) && styles.disabledButton
              ]}
              onPress={handleBookNow}
              disabled={!selectedEducator || loading}
            >
              <Text style={styles.bookNowButtonText}>
                {loading ? 'Processing...' : 'Book Now'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Confirmation modal after successful booking
  const renderConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showConfirmation}
      onRequestClose={() => setShowConfirmation(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.confirmationModal,
          { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
        ]}>
          <Text style={styles.confirmationIcon}>✅</Text>
          <Text style={[
            styles.confirmationTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Booking Successful!
          </Text>
          <Text style={[
            styles.confirmationText,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Your {selectedClass?.title} with {selectedEducator?.name} has been booked.
            {selectedClass?.id === 'group' 
              ? ' Join us online every Sunday at 6pm.'
              : ''
            }
          </Text>
          <Text style={[
            styles.confirmationDetails,
            { color: settings.theme === 'dark' ? '#ddd' : '#444' }
          ]}>
            A confirmation email has been sent to {bookingDetails.email} with all the details.
          </Text>

          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={handlePayNow}
          >
            <Text style={styles.paymentButtonText}>
              Complete Payment - ${selectedClass?.price}.00
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.closeConfirmationButton}
            onPress={() => {
              setShowConfirmation(false);
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.closeConfirmationText}>
              Return to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
          Book a Tutor
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[
          styles.introText,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          Boost your preparation with personalized tutoring from our experienced citizenship test educators.
        </Text>

        <Text style={[
          styles.sectionTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Choose an Educator
        </Text>
        
        <View style={styles.educatorsList}>
          {educators.map(renderEducator)}
        </View>

        <Text style={[
          styles.sectionTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Select Class Type
        </Text>
        
        <View style={styles.classList}>
          {classTypes.map(renderClassType)}
        </View>

        <View style={styles.infoSection}>
          <Text style={[
            styles.infoTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Why book a class with us?
          </Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👍</Text>
            <Text style={[
              styles.benefitText,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Personalized focus on your specific knowledge gaps
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👍</Text>
            <Text style={[
              styles.benefitText,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Practice in your native language with bilingual tutors
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👍</Text>
            <Text style={[
              styles.benefitText,
              { color: settings.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Flexible scheduling options to fit your calendar
            </Text>
          </View>
        </View>
      </ScrollView>

      {renderBookingModal()}
      {renderConfirmationModal()}
      <FeedbackButton />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // Educator card styles
  educatorsList: {
    marginBottom: 25,
  },
  educatorCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  educatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  educatorInfo: {
    flex: 1,
  },
  educatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  educatorLanguages: {
    fontSize: 14,
    marginBottom: 4,
  },
  educatorExperience: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Class card styles
  classList: {
    marginBottom: 25,
  },
  classCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  classDetails: {
    flex: 1,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classDuration: {
    fontSize: 14,
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Benefits section
  infoSection: {
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 16,
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
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
  // Form styles
  formContainer: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  educatorSelection: {
    marginBottom: 15,
  },
  selectedEducatorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookNowButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirmation modal
  confirmationModal: {
    width: '90%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmationIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmationDetails: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  paymentButton: {
    backgroundColor: '#4CAF50', // Green for payment
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeConfirmationButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  closeConfirmationText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});