import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SearchResult, SearchMatch } from '@/utils/textSearch';

interface SearchResultsProps {
  results: SearchResult[];
  currentResultIndex: number;
  totalResults: number;
  onResultSelect: (result: SearchResult, matchIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  visible: boolean;
}

export default function SearchResults({
  results,
  currentResultIndex,
  totalResults,
  onResultSelect,
  onPrevious,
  onNext,
  visible
}: SearchResultsProps) {
  // Component rendered with search results
  
  // Temporarily show when there are results, regardless of visible prop
  if (results.length === 0) {
    return null;
  }

  // Showing results
  const currentMatch = getCurrentMatch(results, currentResultIndex);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.resultCount}>
          {totalResults} result{totalResults !== 1 ? 's' : ''} found
        </Text>
        {totalResults > 1 && (
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, currentResultIndex === 0 && styles.navButtonDisabled]}
              onPress={onPrevious}
              disabled={currentResultIndex === 0}
            >
              <Text style={styles.navButtonText}>↑</Text>
            </TouchableOpacity>
            <Text style={styles.currentIndex}>
              {currentResultIndex + 1} / {totalResults}
            </Text>
            <TouchableOpacity
              style={[styles.navButton, currentResultIndex === totalResults - 1 && styles.navButtonDisabled]}
              onPress={onNext}
              disabled={currentResultIndex === totalResults - 1}
            >
              <Text style={styles.navButtonText}>↓</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {currentMatch && (
        <View style={styles.currentResult}>
          <View style={styles.resultHeader}>
            <Text style={styles.pageTitle}>{currentMatch.result.pageTitle}</Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onResultSelect(currentMatch.result, currentMatch.matchIndex)}
            >
              <Text style={styles.viewButtonText}>View Page</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.context}>{currentMatch.match.context}</Text>
        </View>
      )}

      <ScrollView style={styles.allResults} showsVerticalScrollIndicator={false}>
        {results.map((result, resultIndex) => (
          <View key={`${result.pageId}-${resultIndex}`} style={styles.resultGroup}>
            <Text style={styles.groupTitle}>{result.pageTitle}</Text>
            {result.matches.map((match, matchIndex) => (
              <TouchableOpacity
                key={`${result.pageId}-${resultIndex}-${matchIndex}`}
                style={styles.matchItem}
                onPress={() => onResultSelect(result, matchIndex)}
              >
                <Text style={styles.matchText}>{match.context}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function getCurrentMatch(results: SearchResult[], currentIndex: number) {
  let count = 0;
  for (const result of results) {
    for (let i = 0; i < result.matches.length; i++) {
      if (count === currentIndex) {
        return { result, match: result.matches[i], matchIndex: i };
      }
      count++;
    }
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    maxHeight: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FF6A00',
    borderRadius: 4,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentIndex: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
    fontWeight: '500',
  },
  currentResult: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    flex: 1,
  },
  viewButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  context: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  allResults: {
    maxHeight: 200,
  },
  resultGroup: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6A00',
    marginBottom: 8,
  },
  matchItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 106, 0, 0.05)',
    borderRadius: 6,
    marginBottom: 6,
  },
  matchText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
