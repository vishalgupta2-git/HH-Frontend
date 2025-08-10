import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  highlightStyle?: object;
  textStyle?: object;
}

export default function HighlightedText({ 
  text, 
  highlight, 
  highlightStyle = styles.highlighted,
  textStyle = styles.normal 
}: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <Text style={textStyle}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <Text style={textStyle}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={highlightStyle}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  normal: {
    color: '#333',
  },
  highlighted: {
    backgroundColor: '#FFD700',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});
