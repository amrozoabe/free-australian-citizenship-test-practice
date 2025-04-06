// src/components/booking/DateTimePicker.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { getAvailableTimeSlots } from '../../services/BookingService';

const DateTimePicker = ({ 
  visible, 
  onClose, 
  onSelect, 
  tutorId, 
  theme = 'light'
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate available dates (next 14 days)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (for private lessons)
      if (date.getDay() !== 0) {
        dates.push({
          date: date,
          formatted: formatDate(date),
          dayName: getDayName(date),
          dateStr: date.toISOString().split('T')[0]
        });
      }
    }
    
    setAvailableDates(dates);
  }, [visible]);
  
  // Load time slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }
    
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      const response = await getAvailableTimeSlots(selectedDate.dateStr, tutorId);
      
      if (response.success) {
        setTimeSlots(response.timeSlots);
      } else {
        // Handle error
        setTimeSlots([]);
      }
      
      setIsLoading(false);
    };
    
    fetchTimeSlots();
  }, [selectedDate, tutorId]);
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  // Confirm selection
  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSelect({
        date: selectedDate,
        time: selectedTime
      });
      onClose();
    }
  };
  
  // Utility to format date
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Utility to get day name
  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: theme === 'dark' ? '#333' : 'white' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Select Date & Time
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[
            styles.sectionTitle,
            { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Select Date
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroller}
          >
            {availableDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateOption,
                  selectedDate?.dateStr === date.dateStr && styles.selectedDateOption,
                  { backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5' }
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text style={[
                  styles.dayName,
                  selectedDate?.dateStr === date.dateStr && styles.selectedText,
                  { color: theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  {date.dayName}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate?.dateStr === date.dateStr && styles.selectedText,
                  { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
                ]}>
                  {date.date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={[
            styles.sectionTitle,
            { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Select Time
          </Text>
          
          {!selectedDate ? (
            <Text style={[
              styles.placeholderText,
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              Please select a date first
            </Text>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={[
                styles.loadingText,
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Loading available times...
              </Text>
            </View>
          ) : (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeOption,
                    selectedTime?.time === slot.time && styles.selectedTimeOption,
                    !slot.available && styles.unavailableTimeOption,
                    { backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5' }
                  ]}
                  onPress={() => slot.available && handleTimeSelect(slot)}
                  disabled={!slot.available}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime?.time === slot.time && styles.selectedText,
                    !slot.available && styles.unavailableText,
                    { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedDate || !selectedTime) && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Selection
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
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateScroller: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateOption: {
    width: 70,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDateOption: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 14,
    marginBottom: 5,
  },
  dateNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeOption: {
    width: '30%',
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '3%',
    marginBottom: 10,
  },
  selectedTimeOption: {
    backgroundColor: '#007AFF',
  },
  unavailableTimeOption: {
    opacity: 0.4,
  },
  timeText: {
    fontSize: 16,
  },
  unavailableText: {
    textDecorationLine: 'line-through',
  },
  placeholderText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DateTimePicker;