import React from 'react';
import { Text, Pressable } from 'react-native';

const ComplexTermTooltip = ({ term, definition, translations, userLanguage, onPress }) => {
  return (
    <Pressable onPress={() => onPress({ term, definition, translations, userLanguage })}>
      <Text style={{ color: '#2196F3', textDecorationLine: 'underline', fontSize: 16 }}>
        {term}
      </Text>
    </Pressable>
  );
};

export default ComplexTermTooltip;