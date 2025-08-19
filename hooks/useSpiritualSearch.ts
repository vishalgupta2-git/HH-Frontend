import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { searchSpiritualContent, getTotalMatchCount, getMatchAtIndex, SearchResult, SearchMatch } from '@/utils/textSearch';

export interface UseSpiritualSearchReturn {
  searchQuery: string;
  searchResults: SearchResult[];
  currentResultIndex: number;
  totalResults: number;
  isSearching: boolean;
  hasResults: boolean;
  currentMatch: { result: SearchResult; match: SearchMatch; matchIndex: number } | null;
  handleSearch: (query: string) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  clearSearch: () => void;
  navigateToResult: (result: SearchResult, matchIndex: number) => void;
}

export function useSpiritualSearch(): UseSpiritualSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const totalResults = useMemo(() => getTotalMatchCount(searchResults), [searchResults]);
  const hasResults = useMemo(() => totalResults > 0, [totalResults]);
  
  const currentMatch = useMemo(() => 
    getMatchAtIndex(searchResults, currentResultIndex), 
    [searchResults, currentResultIndex]
  );

  const handleSearch = useCallback((query: string) => {
    // Starting search for query
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Empty query, clearing results
      setSearchResults([]);
      setCurrentResultIndex(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // Searching...
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const results = searchSpiritualContent(query);
      // Search results processed
      setSearchResults(results);
      setCurrentResultIndex(0);
      setIsSearching(false);
    }, 300);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1);
    }
  }, [currentResultIndex]);

  const handleNext = useCallback(() => {
    if (currentResultIndex < totalResults - 1) {
      setCurrentResultIndex(currentResultIndex + 1);
    }
  }, [currentResultIndex, totalResults]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentResultIndex(0);
    setIsSearching(false);
  }, []);

  const navigateToResult = useCallback((result: SearchResult, matchIndex: number) => {
    // Navigate to the specific page
    const routePath = `/screens/${result.pageId}`;
    router.push(routePath);
    
    // Store the search context for highlighting when the page loads
    // This could be stored in AsyncStorage or a global state manager
    const searchContext = {
      query: searchQuery,
      pageId: result.pageId,
      matchIndex,
      timestamp: Date.now()
    };
    
    // Store in AsyncStorage for persistence across navigation
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
      AsyncStorage.setItem('spiritualSearchContext', JSON.stringify(searchContext));
    });
  }, [searchQuery, router]);

  return {
    searchQuery,
    searchResults,
    currentResultIndex,
    totalResults,
    isSearching,
    hasResults,
    currentMatch,
    handleSearch,
    handlePrevious,
    handleNext,
    clearSearch,
    navigateToResult
  };
}
