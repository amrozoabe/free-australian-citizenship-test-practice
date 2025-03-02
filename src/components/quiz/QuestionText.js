import React from 'react';
import { Text } from 'react-native';
import ComplexTermTooltip from './ComplexTermTooltip';

const QuestionText = ({ text = "", terms = {}, userLanguage = "english", onTermPress }) => {
  if (!text) return null;

  if (!terms || Object.keys(terms).length === 0) {
    return <Text style={{ fontSize: 16 }}>{text}</Text>;
  }

  const parts = text.split(/(\{[^}]+\})/);
  
  return (
    <Text style={{ fontSize: 16, lineHeight: 24 }}>
      {parts.map((part, index) => {
        const match = part.match(/\{([^}]+)\}/);
        if (match) {
          const term = match[1];
          const termInfo = terms[term];
          if (!termInfo) return term;
          
          return (
            <ComplexTermTooltip
              key={`term-${index}`}
              term={term}
              definition={termInfo.definition}
              translations={termInfo.translations}
              userLanguage={userLanguage}
              onPress={onTermPress}  // Pass onTermPress here
            />
          );
        }
        return part;
      })}
    </Text>
  );
};

export default QuestionText;