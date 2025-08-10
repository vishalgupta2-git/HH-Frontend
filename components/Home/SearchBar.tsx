import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SearchResult } from '@/utils/textSearch';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onResultSelect?: (result: SearchResult, matchIndex: number) => void;
  searchResults?: SearchResult[];
  currentResultIndex?: number;
  totalResults?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  isSearching?: boolean;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  onClear,
  onFocus,
  onBlur,
  onResultSelect,
  searchResults = [],
  currentResultIndex = 0,
  totalResults = 0,
  onPrevious,
  onNext,
  showNavigation = false,
  isSearching = false
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const focusAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnimation]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handlePrevious = () => {
    if (onPrevious && currentResultIndex > 0) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext && currentResultIndex < totalResults - 1) {
      onNext();
    }
  };

  const canGoPrevious = currentResultIndex > 0;
  const canGoNext = currentResultIndex < totalResults - 1;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={20} color="#fff" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
        />
        {showNavigation && totalResults > 0 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={!canGoPrevious}
            >
              <Feather name="chevron-up" size={16} color={canGoPrevious ? "#fff" : "rgba(255,255,255,0.5)"} />
            </TouchableOpacity>
            <Text style={styles.resultCounter}>
              {totalResults > 0 ? `${currentResultIndex + 1}/${totalResults}` : '0'}
            </Text>
            <TouchableOpacity
              style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
              onPress={handleNext}
              disabled={!canGoNext}
            >
              <Feather name="chevron-down" size={16} color={canGoNext ? "#fff" : "rgba(255,255,255,0.5)"} />
            </TouchableOpacity>
          </View>
        )}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>...</Text>
          </View>
        )}
        {searchQuery.length > 0 && !isSearching && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              onSearch?.('');
              onClear?.();
            }}
          >
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    width: '88%',
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  navButton: {
    padding: 4,
    borderRadius: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  resultCounter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 6,
    minWidth: 30,
    textAlign: 'center',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingContainer: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
