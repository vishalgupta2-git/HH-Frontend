import { searchSpiritualContent, getTotalMatchCount } from './textSearch';

export function testTextSearch() {
  console.log('🧪 Testing text search functionality...');
  
  // Test 1: Search for "puja"
  console.log('\n🧪 Test 1: Searching for "puja"');
  const pujaResults = searchSpiritualContent('puja');
  console.log('Results:', pujaResults);
  console.log('Total matches:', getTotalMatchCount(pujaResults));
  
  // Test 2: Search for "vedas"
  console.log('\n🧪 Test 2: Searching for "vedas"');
  const vedasResults = searchSpiritualContent('vedas');
  console.log('Results:', vedasResults);
  console.log('Total matches:', getTotalMatchCount(vedasResults));
  
  // Test 3: Search for "temple"
  console.log('\n🧪 Test 3: Searching for "temple"');
  const templeResults = searchSpiritualContent('temple');
  console.log('Results:', templeResults);
  console.log('Total matches:', getTotalMatchCount(templeResults));
  
  // Test 4: Search for "gods"
  console.log('\n🧪 Test 4: Searching for "gods"');
  const godsResults = searchSpiritualContent('gods');
  console.log('Results:', godsResults);
  console.log('Total matches:', getTotalMatchCount(godsResults));
  
  console.log('\n🧪 Text search testing completed!');
}

// Test specific search scenarios
export function testSpecificSearches() {
  console.log('\n🔍 Testing Specific Search Scenarios...');
  
  const testQueries = [
    'astrology',
    'numerology',
    'kundli',
    'fasts',
    'festivals',
    'dhams',
    'pilgrimage',
    'vastu',
    'mudras',
    'meditation'
  ];
  
  testQueries.forEach(query => {
    const results = searchSpiritualContent(query);
    console.log(`${query}: ${results.length} pages, ${getTotalMatchCount(results)} total matches`);
  });
}
