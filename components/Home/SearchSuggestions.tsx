import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SearchSuggestion, getSearchSuggestions, getTrendingSearches } from '@/utils/searchSuggestions';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  visible: boolean;
}

export default function SearchSuggestions({ 
  query, 
  onSuggestionSelect, 
  visible 
}: SearchSuggestionsProps) {
  if (!visible) return null;

  const suggestions = query.trim() 
    ? getSearchSuggestions(query, 6)
    : getTrendingSearches(8);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {query.trim() ? 'Search Suggestions' : 'Trending Searches'}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.suggestionsContainer} 
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`${suggestion.query}-${index}`}
            style={styles.suggestionItem}
            onPress={() => onSuggestionSelect(suggestion.query)}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionQuery}>{suggestion.query}</Text>
              <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
              <Text style={styles.suggestionDescription} numberOfLines={2}>
                {suggestion.description}
              </Text>
            </View>
            <View style={styles.popularityBadge}>
              <Text style={styles.popularityText}>{suggestion.popularity}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    maxHeight: 300,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  suggestionsContainer: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  suggestionQuery: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  suggestionCategory: {
    fontSize: 12,
    color: '#FF6A00',
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  popularityBadge: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  popularityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
