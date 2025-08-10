import { 
  getSearchSuggestions, 
  getSuggestionsByCategory, 
  getTrendingSearches, 
  getRelatedSearches 
} from './searchSuggestions';

export function testSearchSuggestions() {
  console.log('🧪 Testing search suggestions functionality...');
  
  // Test 1: Get trending searches
  console.log('\n🧪 Test 1: Trending Searches');
  const trending = getTrendingSearches(5);
  console.log('Top 5 trending:', trending.map(s => `${s.query} (${s.popularity}%)`));
  
  // Test 2: Get suggestions for "puja"
  console.log('\n🧪 Test 2: Search suggestions for "puja"');
  const pujaSuggestions = getSearchSuggestions('puja', 4);
  console.log('Puja suggestions:', pujaSuggestions.map(s => `${s.query} - ${s.category}`));
  
  // Test 3: Get suggestions for "temple"
  console.log('\n🧪 Test 3: Search suggestions for "temple"');
  const templeSuggestions = getSearchSuggestions('temple', 4);
  console.log('Temple suggestions:', templeSuggestions.map(s => `${s.query} - ${s.category}`));
  
  // Test 4: Get suggestions by category
  console.log('\n🧪 Test 4: Suggestions by category "Puja & Rituals"');
  const pujaCategory = getSuggestionsByCategory('Puja & Rituals');
  console.log('Puja category:', pujaCategory.map(s => `${s.query} (${s.popularity}%)`));
  
  // Test 5: Get related searches
  console.log('\n🧪 Test 5: Related searches for "daily puja"');
  const relatedPuja = getRelatedSearches('daily puja', 4);
  console.log('Related to daily puja:', relatedPuja.map(s => `${s.query} - ${s.category}`));
  
  // Test 6: Empty query suggestions
  console.log('\n🧪 Test 6: Empty query suggestions');
  const emptyQuerySuggestions = getSearchSuggestions('', 6);
  console.log('Empty query suggestions:', emptyQuerySuggestions.map(s => `${s.query} (${s.popularity}%)`));
  
  // Test 7: Partial word suggestions
  console.log('\n🧪 Test 7: Partial word suggestions for "med"');
  const partialSuggestions = getSearchSuggestions('med', 4);
  console.log('Partial "med" suggestions:', partialSuggestions.map(s => `${s.query} - ${s.category}`));
  
  console.log('\n🧪 Search suggestions testing completed!');
}

// Test specific suggestion scenarios
export function testSpecificSuggestionScenarios() {
  console.log('\n🔍 Testing Specific Suggestion Scenarios...');
  
  const testQueries = [
    'astrology',
    'yoga',
    'festival',
    'god',
    'veda',
    'temple',
    'fast',
    'mudra'
  ];
  
  testQueries.forEach(query => {
    const suggestions = getSearchSuggestions(query, 3);
    console.log(`${query}: ${suggestions.length} suggestions found`);
    suggestions.forEach(s => {
      console.log(`  - ${s.query} (${s.category}) - ${s.description}`);
    });
  });
}

// Test category-based suggestions
export function testCategorySuggestions() {
  console.log('\n🏷️ Testing Category-Based Suggestions...');
  
  const categories = [
    'Puja & Rituals',
    'Temples & Pilgrimage',
    'Vedas & Scriptures',
    'Gods & Goddesses',
    'Festivals & Fasts',
    'Astrology & Vastu',
    'Meditation & Yoga',
    'Mudras & Mantras'
  ];
  
  categories.forEach(category => {
    const suggestions = getSuggestionsByCategory(category);
    console.log(`${category}: ${suggestions.length} suggestions`);
    suggestions.slice(0, 2).forEach(s => {
      console.log(`  - ${s.query} (${s.popularity}%)`);
    });
  });
}
