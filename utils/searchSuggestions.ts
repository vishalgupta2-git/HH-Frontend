export interface SearchSuggestion {
  query: string;
  category: string;
  description: string;
  popularity: number;
}

// Popular search suggestions organized by category
export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  // Puja and Rituals
  { query: 'daily puja', category: 'Puja & Rituals', description: 'Daily worship practices', popularity: 95 },
  { query: 'special puja', category: 'Puja & Rituals', description: 'Special occasion ceremonies', popularity: 90 },
  { query: 'puja samagri', category: 'Puja & Rituals', description: 'Essential puja items', popularity: 85 },
  { query: 'mantra chanting', category: 'Puja & Rituals', description: 'Sacred chants and prayers', popularity: 88 },
  
  // Temples and Pilgrimage
  { query: 'famous temples', category: 'Temples & Pilgrimage', description: 'Sacred temple destinations', popularity: 92 },
  { query: 'char dham', category: 'Temples & Pilgrimage', description: 'Four sacred abodes', popularity: 89 },
  { query: 'temple architecture', category: 'Temples & Pilgrimage', description: 'Sacred design principles', popularity: 82 },
  { query: 'pilgrimage guide', category: 'Temples & Pilgrimage', description: 'Yatra and spiritual journeys', popularity: 87 },
  
  // Vedas and Scriptures
  { query: 'vedas', category: 'Vedas & Scriptures', description: 'Ancient sacred texts', popularity: 94 },
  { query: 'bhagavad gita', category: 'Vedas & Scriptures', description: 'Divine song of Lord Krishna', popularity: 96 },
  { query: 'upanishads', category: 'Vedas & Scriptures', description: 'Philosophical teachings', popularity: 88 },
  { query: 'holy books', category: 'Vedas & Scriptures', description: 'Sacred literature collection', popularity: 85 },
  
  // Gods and Goddesses
  { query: 'lord shiva', category: 'Gods & Goddesses', description: 'The destroyer and transformer', popularity: 93 },
  { query: 'goddess lakshmi', category: 'Gods & Goddesses', description: 'Goddess of wealth and prosperity', popularity: 91 },
  { query: 'lord ganesha', category: 'Gods & Goddesses', description: 'Remover of obstacles', popularity: 94 },
  { query: 'lord krishna', category: 'Gods & Goddesses', description: 'Divine teacher and guide', popularity: 95 },
  
  // Festivals and Fasts
  { query: 'diwali', category: 'Festivals & Fasts', description: 'Festival of lights', popularity: 97 },
  { query: 'holi', category: 'Festivals & Fasts', description: 'Festival of colors', popularity: 94 },
  { query: 'navratri', category: 'Festivals & Fasts', description: 'Nine nights of devotion', popularity: 90 },
  { query: 'fasting guide', category: 'Festivals & Fasts', description: 'Spiritual fasting practices', popularity: 86 },
  
  // Astrology and Vastu
  { query: 'vedic astrology', category: 'Astrology & Vastu', description: 'Ancient astrological system', popularity: 89 },
  { query: 'birth chart', category: 'Astrology & Vastu', description: 'Kundli and horoscope', popularity: 88 },
  { query: 'vastu shastra', category: 'Astrology & Vastu', description: 'Architectural science', popularity: 84 },
  { query: 'numerology', category: 'Astrology & Vastu', description: 'Sacred number meanings', popularity: 82 },
  
  // Meditation and Yoga
  { query: 'meditation', category: 'Meditation & Yoga', description: 'Spiritual practice techniques', popularity: 91 },
  { query: 'yoga asanas', category: 'Meditation & Yoga', description: 'Physical yoga postures', popularity: 88 },
  { query: 'pranayama', category: 'Meditation & Yoga', description: 'Breathing exercises', popularity: 85 },
  { query: 'chakra meditation', category: 'Meditation & Yoga', description: 'Energy center practices', popularity: 83 },
  
  // Mudras and Mantras
  { query: 'mudras', category: 'Mudras & Mantras', description: 'Sacred hand gestures', popularity: 86 },
  { query: 'healing mudras', category: 'Mudras & Mantras', description: 'Therapeutic hand positions', popularity: 84 },
  { query: 'mantra meditation', category: 'Mudras & Mantras', description: 'Sacred sound practices', popularity: 87 },
  { query: 'yoga mudras', category: 'Mudras & Mantras', description: 'Yogic hand gestures', popularity: 82 },
  
  // Philosophy and Ethics
  { query: 'dharma', category: 'Philosophy & Ethics', description: 'Righteous living principles', popularity: 88 },
  { query: 'karma', category: 'Philosophy & Ethics', description: 'Action and consequence', popularity: 90 },
  { query: 'moksha', category: 'Philosophy & Ethics', description: 'Liberation and freedom', popularity: 85 },
  { query: 'spiritual wisdom', category: 'Philosophy & Ethics', description: 'Ancient teachings', popularity: 83 },
  
  // History and Culture
  { query: 'hindu culture', category: 'History & Culture', description: 'Cultural traditions', popularity: 86 },
  { query: 'ancient india', category: 'History & Culture', description: 'Historical heritage', popularity: 84 },
  { query: 'spiritual heritage', category: 'History & Culture', description: 'Sacred traditions', popularity: 87 },
  { query: 'cultural practices', category: 'History & Culture', description: 'Traditional customs', popularity: 82 }
];

// Get suggestions based on search query
export function getSearchSuggestions(query: string, limit: number = 8): SearchSuggestion[] {
  if (!query.trim()) {
    // Return popular suggestions when no query
    return SEARCH_SUGGESTIONS
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  const lowerQuery = query.toLowerCase();
  const suggestions: Array<{ suggestion: SearchSuggestion; score: number }> = [];

  SEARCH_SUGGESTIONS.forEach(suggestion => {
    let score = 0;
    
    // Exact match gets highest score
    if (suggestion.query.toLowerCase() === lowerQuery) {
      score = 100;
    }
    // Starts with query
    else if (suggestion.query.toLowerCase().startsWith(lowerQuery)) {
      score = 80;
    }
    // Contains query
    else if (suggestion.query.toLowerCase().includes(lowerQuery)) {
      score = 60;
    }
    // Category matches
    else if (suggestion.category.toLowerCase().includes(lowerQuery)) {
      score = 40;
    }
    // Description matches
    else if (suggestion.description.toLowerCase().includes(lowerQuery)) {
      score = 30;
    }

    if (score > 0) {
      suggestions.push({ suggestion, score });
    }
  });

  // Sort by score and popularity, then return limited results
  return suggestions
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.suggestion.popularity - a.suggestion.popularity;
    })
    .slice(0, limit)
    .map(item => item.suggestion);
}

// Get suggestions by category
export function getSuggestionsByCategory(category: string): SearchSuggestion[] {
  return SEARCH_SUGGESTIONS
    .filter(suggestion => suggestion.category === category)
    .sort((a, b) => b.popularity - a.popularity);
}

// Get trending searches (most popular)
export function getTrendingSearches(limit: number = 10): SearchSuggestion[] {
  return SEARCH_SUGGESTIONS
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// Get related searches based on a query
export function getRelatedSearches(query: string, limit: number = 6): SearchSuggestion[] {
  const lowerQuery = query.toLowerCase();
  const related: SearchSuggestion[] = [];
  
  // Find the category of the current query
  const currentSuggestion = SEARCH_SUGGESTIONS.find(s => 
    s.query.toLowerCase() === lowerQuery
  );
  
  if (currentSuggestion) {
    // Get other suggestions from the same category
    const sameCategory = SEARCH_SUGGESTIONS
      .filter(s => s.category === currentSuggestion.category && s.query !== currentSuggestion.query)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
    
    related.push(...sameCategory);
  }
  
  // If not enough related searches, add popular ones
  if (related.length < limit) {
    const popular = SEARCH_SUGGESTIONS
      .filter(s => !related.some(r => r.query === s.query))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit - related.length);
    
    related.push(...popular);
  }
  
  return related;
}
