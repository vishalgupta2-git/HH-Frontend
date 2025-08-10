export interface SearchMatch {
  text: string;
  context: string;
  position: number;
  pageId: string;
  pageTitle: string;
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  matches: SearchMatch[];
}

// Define the spiritual information pages and their content
export const SPIRITUAL_PAGES = {
  'vedas': {
    title: 'Vedas',
    content: [
      'The Vedas represent the oldest and most sacred scriptures of Hinduism',
      'forming the foundational texts that have guided Hindu spiritual and philosophical thought for millennia',
      'These ancient Sanskrit texts constitute the earliest layer of Sanskrit literature',
      'serve as the bedrock upon which all Hindu religious practice and philosophy is built',
      'The Divine Nature of Vedic Knowledge',
      'The Meaning and Origin',
      'Historical Context and Chronology',
      'The Four Vedas: Structure and Content',
      'The Four-Fold Structure of Each Veda',
      'Spiritual and Philosophical Significance',
      'Scientific and Practical Knowledge',
      'Cultural Impact and Influence',
      'Modern Preservation and Study'
    ]
  },
  'holy-books': {
    title: 'Holy Books',
    content: [
      'Hindu sacred literature encompasses a vast collection of texts',
      'form the spiritual, philosophical, and cultural backbone of one of the world\'s oldest religious traditions',
      'These holy books range from ancient hymns and philosophical treatises',
      'epic narratives that continue to guide millions of devotees in their spiritual journey',
      'The Two-Tier Classification: Shruti and Smriti',
      'Shruti refers to divine revelation received by ancient sages',
      'including the Vedas and Upanishads',
      'Smriti encompasses texts composed by human authors but based on divine inspiration',
      'including the great epics and Puranas',
      'The Great Epics: Mahabharat and Ramayan',
      'The Bhagavad Gita',
      'Ramcharitmanas',
      'Cultural and Spiritual Significance',
      'Modern Relevance and Global Impact'
    ]
  },
  'gods-and-godesses': {
    title: 'Gods & Goddesses',
    content: [
      'Hindu mythology presents one of the world\'s most diverse pantheons',
      'where deities serve as accessible manifestations of the ultimate reality called Brahman',
      'The tradition places equal importance on both masculine and feminine divine aspects',
      'recognizing that cosmic balance requires both energies',
      'Followers can approach divinity through multiple paths',
      'polytheistic, pantheistic, monotheistic, monistic, or even agnostic worship',
      'The Divine Foundation',
      'The Trimurti: The Core Trinity',
      'The Divine Feminine: Major Goddesses and Shakti',
      'Regional and Specialized Goddesses',
      'Beloved Popular Deities',
      'Vedic Solar and Cosmic Deities',
      'Important Secondary Deities',
      'The Concept of Shakti',
      'Divine Couples and Their Significance',
      'Cultural and Spiritual Significance'
    ]
  },
  'dhams': {
    title: 'Dhams and Yatras',
    content: [
      'Sacred pilgrimage sites and spiritual journeys',
      'Char Dham: Four sacred abodes',
      'Badrinath, Dwarka, Jagannath Puri, Rameshwaram',
      'Chota Char Dham: Four sacred sites in Uttarakhand',
      'Yamunotri, Gangotri, Kedarnath, Badrinath',
      'Amarnath Yatra: Sacred cave pilgrimage',
      'Vaishno Devi: Divine mother pilgrimage',
      'Kailash Mansarovar: Sacred mountain and lake',
      'Varanasi: City of spiritual enlightenment',
      'Haridwar: Gateway to the gods',
      'Rishikesh: Yoga capital of the world',
      'Spiritual significance of pilgrimage',
      'Cultural and religious importance',
      'Historical background of sacred sites'
    ]
  },
  'famous-temples': {
    title: 'Famous Temples',
    content: [
      'Ancient and modern temples of India',
      'Tirupati Balaji: Most visited temple in India',
      'Golden Temple: Sacred Sikh shrine in Amritsar',
      'Kedarnath: Ancient Shiva temple in Himalayas',
      'Somnath: First Jyotirlinga temple',
      'Badrinath: Vishnu temple in Uttarakhand',
      'Vaishno Devi: Cave temple in Jammu Kashmir',
      'Amarnath: Ice lingam temple in Kashmir',
      'Kashi Vishwanath: Sacred Shiva temple in Varanasi',
      'Meenakshi Temple: Ancient temple complex in Madurai',
      'Jagannath Temple: Sacred temple in Puri',
      'Konark Sun Temple: Ancient sun temple in Odisha',
      'Khajuraho Temples: Famous for architecture',
      'Temple architecture and design principles',
      'Religious significance and historical background',
      'Cultural importance and festival celebrations',
      'Pilgrimage traditions and spiritual practices',
      'Temple rituals and daily ceremonies',
      'Sacred architecture and vastu principles'
    ]
  },
  'fasts-and-festivals': {
    title: 'Fasts & Festivals',
    content: [
      'Traditional Hindu fasting practices',
      'Major Hindu festivals and celebrations',
      'Diwali: Festival of lights',
      'Holi: Festival of colors',
      'Navratri: Nine nights of devotion',
      'Maha Shivratri: Night of Shiva',
      'Krishna Janmashtami: Birth of Krishna',
      'Ram Navami: Birth of Rama',
      'Ganesh Chaturthi: Birth of Ganesha',
      'Raksha Bandhan: Bond of protection',
      'Karva Chauth: Married women\'s fast',
      'Navratri fasting and rituals',
      'Ekadashi fasting practices',
      'Cultural significance of festivals',
      'Traditional customs and celebrations'
    ]
  },
  'astrology': {
    title: 'Astrology',
    content: [
      'Vedic astrology and horoscope',
      'Planetary positions and influences',
      'Birth chart analysis and interpretation',
      'Zodiac signs and characteristics',
      'Planetary transits and effects',
      'Astrological remedies and solutions',
      'Muhurta: Auspicious timing',
      'Compatibility analysis',
      'Career and life path guidance',
      'Health and wellness predictions',
      'Relationship and marriage astrology',
      'Financial and business astrology',
      'Ancient wisdom and modern applications',
      'Scientific basis of astrology'
    ]
  },
  'numerology': {
    title: 'Numerology',
    content: [
      'Sacred numbers and their meanings',
      'Name numerology and calculations',
      'Birth date numerology',
      'Life path number significance',
      'Destiny number and purpose',
      'Soul number and inner self',
      'Personality number traits',
      'Lucky numbers and dates',
      'Numerological compatibility',
      'Business and career numerology',
      'Health and wellness numbers',
      'Relationship numerology',
      'Ancient wisdom of numbers',
      'Modern applications and benefits'
    ]
  },
  'kundli': {
    title: 'Kundli',
    content: [
      'Birth chart and horoscope',
      'Planetary positions at birth',
      'House system and divisions',
      'Planetary aspects and relationships',
      'Dasha and planetary periods',
      'Transit effects and timing',
      'Career and profession analysis',
      'Marriage and relationship timing',
      'Health and longevity indicators',
      'Wealth and prosperity factors',
      'Education and learning potential',
      'Travel and foreign connections',
      'Spiritual growth indicators',
      'Remedial measures and solutions'
    ]
  },
  'vastu': {
    title: 'Vastu',
    content: [
      'Ancient Indian architecture science',
      'Directional influences and energies',
      'Building design principles',
      'Room placement and orientation',
      'Color schemes and materials',
      'Furniture arrangement guidelines',
      'Entrance and exit positioning',
      'Kitchen and bedroom placement',
      'Office and business vastu',
      'Temple and sacred space design',
      'Garden and landscape vastu',
      'Remedial measures and corrections',
      'Modern applications and benefits',
      'Scientific basis of vastu shastra'
    ]
  },
  'puja': {
    title: 'Puja and Rituals',
    content: [
      'Daily puja rituals and ceremonies',
      'Traditional Hindu worship practices',
      'Puja samagri and essential items',
      'Mantras and sacred chants',
      'Aarti and devotional songs',
      'Prasad preparation and offering',
      'Temple puja and community worship',
      'Home puja setup and guidelines',
      'Festival puja celebrations',
      'Special occasion puja ceremonies',
      'Puja timing and auspicious moments',
      'Spiritual purification through puja',
      'Puja benefits and spiritual growth',
      'Modern puja adaptations and practices'
    ]
  },
  'temple': {
    title: 'Temple and Worship',
    content: [
      'Temple architecture and design',
      'Sacred temple spaces and sanctums',
      'Temple rituals and ceremonies',
      'Pilgrimage and temple visits',
      'Temple festivals and celebrations',
      'Sacred temple symbols and meanings',
      'Temple history and legends',
      'Temple administration and management',
      'Temple art and sculptures',
      'Temple music and bhajans',
      'Temple food and prasad',
      'Temple tourism and cultural heritage',
      'Temple conservation and restoration',
      'Modern temple developments'
    ]
  },
  'mudras': {
    title: 'Mudras and Hand Gestures',
    content: [
      'Sacred hand gestures and mudras',
      'Yoga mudras for spiritual practice',
      'Meditation mudras and techniques',
      'Healing mudras for wellness',
      'Chakra balancing mudras',
      'Pranayama mudras for breath control',
      'Mantra mudras for chanting',
      'Temple mudras for worship',
      'Classical dance mudras',
      'Mudra therapy and benefits',
      'Daily mudra practice routines',
      'Mudra meditation techniques',
      'Ancient wisdom of mudras',
      'Modern applications of mudras'
    ]
  },
  'meditation': {
    title: 'Meditation and Spirituality',
    content: [
      'Meditation techniques and practices',
      'Mindfulness and awareness',
      'Breathing exercises and pranayama',
      'Chakra meditation and healing',
      'Mantra meditation and chanting',
      'Transcendental meditation',
      'Vipassana meditation practice',
      'Loving kindness meditation',
      'Meditation for stress relief',
      'Spiritual growth through meditation',
      'Meditation postures and asanas',
      'Meditation timing and duration',
      'Meditation benefits and effects',
      'Guided meditation practices'
    ]
  },
  'special-puja': {
    title: 'Special Puja Services',
    content: [
      'Professional puja services and ceremonies',
      'Birthday and anniversary puja celebrations',
      'Exam success and career puja rituals',
      'Marriage and relationship puja ceremonies',
      'Health and recovery puja prayers',
      'Business and prosperity puja services',
      'Family harmony and peace puja',
      'Spiritual cleansing and purification puja',
      'Custom puja packages and offerings',
      'Online puja booking and consultation',
      'Priest consultation and guidance',
      'Puja timing and muhurta selection',
      'Puja samagri and essential items',
      'Post-puja follow-up and support'
    ]
  },
  'professional-puja': {
    title: 'Professional Puja Services',
    content: [
      'Expert priest services for all occasions',
      'Traditional and modern puja ceremonies',
      'Corporate and business puja services',
      'Wedding and engagement puja rituals',
      'House warming and vastu puja',
      'Vehicle blessing and safety puja',
      'Education and success puja ceremonies',
      'Health and wellness puja prayers',
      'Financial prosperity and abundance puja',
      'Spiritual guidance and counseling',
      'Puja planning and coordination',
      'Customized puja packages',
      'Online consultation and booking',
      'Post-ceremony support and guidance'
    ]
  },
  'puja-guidance': {
    title: 'Puja Guidance and Instructions',
    content: [
      'Step-by-step puja instructions',
      'Traditional puja procedures and rituals',
      'Puja samagri preparation guide',
      'Mantra chanting and pronunciation',
      'Puja timing and auspicious moments',
      'Puja setup and altar preparation',
      'Puja etiquette and customs',
      'Common puja mistakes and solutions',
      'Puja benefits and spiritual significance',
      'Daily puja routines and practices',
      'Festival puja celebrations',
      'Special occasion puja guidance',
      'Puja for beginners and children',
      'Modern puja adaptations and practices'
    ]
  },
  'talk-to-priest': {
    title: 'Talk to Priest Services',
    content: [
      'Direct consultation with experienced priests',
      'Spiritual guidance and counseling',
      'Puja planning and coordination',
      'Astrological consultation and remedies',
      'Marriage compatibility and timing',
      'Career and business guidance',
      'Health and wellness consultation',
      'Family harmony and relationship advice',
      'Spiritual growth and development',
      'Custom puja recommendations',
      'Online consultation and booking',
      'Emergency spiritual guidance',
      'Follow-up consultation services',
      'Priest availability and scheduling'
    ]
  },
  'virtual-darshan': {
    title: 'Virtual Darshan and Temple Visits',
    content: [
      'Online temple darshan and prayers',
      'Virtual temple tours and exploration',
      'Live temple ceremonies and aarti',
      'Online puja booking and participation',
      'Temple history and significance',
      'Sacred temple architecture and design',
      'Temple festivals and celebrations',
      'Virtual pilgrimage and yatra',
      'Online temple donations and offerings',
      'Temple prasad and sacred items',
      'Temple music and bhajan streaming',
      'Sacred temple stories and legends',
      'Temple conservation and restoration',
      'Modern temple technology and services'
    ]
  },
  'charity': {
    title: 'Charity and Seva',
    content: [
      'Spiritual charity and donation practices',
      'Seva and selfless service traditions',
      'Temple donation and offerings',
      'Charitable giving and philanthropy',
      'Community service and volunteering',
      'Helping the needy and underprivileged',
      'Environmental conservation and protection',
      'Animal welfare and protection',
      'Education and healthcare support',
      'Disaster relief and emergency aid',
      'Food donation and feeding programs',
      'Clothing and shelter assistance',
      'Spiritual education and knowledge sharing',
      'Cultural preservation and heritage support'
    ]
  },
  'yoga': {
    title: 'Yoga and Physical Wellness',
    content: [
      'Traditional yoga asanas and postures',
      'Hatha yoga and physical practice',
      'Raja yoga and meditation techniques',
      'Bhakti yoga and devotional practices',
      'Karma yoga and selfless action',
      'Jnana yoga and knowledge pursuit',
      'Pranayama and breathing exercises',
      'Yoga for health and wellness',
      'Yoga therapy and healing',
      'Yoga for stress relief and relaxation',
      'Yoga for children and beginners',
      'Advanced yoga practices and techniques',
      'Yoga philosophy and spiritual principles',
      'Modern yoga adaptations and styles'
    ]
  },
  'ayurveda': {
    title: 'Ayurveda and Natural Healing',
    content: [
      'Ancient Indian system of medicine',
      'Natural healing and wellness practices',
      'Herbal remedies and treatments',
      'Diet and nutrition guidelines',
      'Lifestyle and daily routines',
      'Seasonal health recommendations',
      'Body constitution and dosha balance',
      'Ayurvedic massage and therapies',
      'Detoxification and purification',
      'Mental health and emotional balance',
      'Sleep and relaxation techniques',
      'Ayurvedic beauty and skincare',
      'Preventive healthcare practices',
      'Modern ayurvedic applications'
    ]
  }
};

export function searchSpiritualContent(query: string): SearchResult[] {
  console.log('🔍 textSearch: Starting search for query:', query);
  if (!query.trim()) {
    console.log('🔍 textSearch: Empty query, returning empty results');
    return [];
  }

  const searchTerm = query.toLowerCase();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
  console.log('🔍 textSearch: Search words:', searchWords);
  const results: SearchResult[] = [];

  // Score-based search results
  const scoredResults: Array<{ pageId: string; pageData: any; score: number; matches: SearchMatch[] }> = [];

  Object.entries(SPIRITUAL_PAGES).forEach(([pageId, pageData]) => {
    console.log('🔍 textSearch: Searching in page:', pageId);
    const matches: SearchMatch[] = [];
    let pageScore = 0;
    
    pageData.content.forEach((content, index) => {
      const lowerContent = content.toLowerCase();
      
      // Check for exact phrase match first (highest priority)
      let startIndex = 0;
      while (true) {
        const foundIndex = lowerContent.indexOf(searchTerm, startIndex);
        if (foundIndex === -1) break;
        
        console.log('🔍 textSearch: Found exact match in', pageId, 'at position', foundIndex);
        const beforeText = content.substring(Math.max(0, foundIndex - 40), foundIndex);
        const afterText = content.substring(foundIndex + searchTerm.length, foundIndex + searchTerm.length + 40);
        const context = `...${beforeText}${content.substring(foundIndex, foundIndex + searchTerm.length)}${afterText}...`;
        
        matches.push({
          text: content.substring(foundIndex, foundIndex + searchTerm.length),
          context,
          position: foundIndex,
          pageId,
          pageTitle: pageData.title
        });
        
        pageScore += 10; // High score for exact matches
        startIndex = foundIndex + 1;
      }
      
      // Check for individual word matches
      searchWords.forEach(word => {
        if (word.length > 2) { // Only search for words longer than 2 characters
          let wordStartIndex = 0;
          while (true) {
            const wordFoundIndex = lowerContent.indexOf(word, wordStartIndex);
            if (wordFoundIndex === -1) break;
            
            console.log('🔍 textSearch: Found word match in', pageId, 'for word', word, 'at position', wordFoundIndex);
            const beforeText = content.substring(Math.max(0, wordFoundIndex - 35), wordFoundIndex);
            const afterText = content.substring(wordFoundIndex + word.length, wordFoundIndex + word.length + 35);
            const context = `...${beforeText}${content.substring(wordFoundIndex, wordFoundIndex + word.length)}${afterText}...`;
            
            matches.push({
              text: content.substring(wordFoundIndex, wordFoundIndex + word.length),
              context,
              position: wordFoundIndex,
              pageId,
              pageTitle: pageData.title
            });
            
            pageScore += 5; // Medium score for word matches
            wordStartIndex = wordFoundIndex + 1;
          }
        }
      });

      // Check for partial word matches (fuzzy search)
      searchWords.forEach(word => {
        if (word.length > 3) {
          const partialMatches = content.toLowerCase().match(new RegExp(`\\b\\w*${word}\\w*`, 'gi'));
          if (partialMatches) {
            pageScore += 2; // Low score for partial matches
          }
        }
      });
    });

    if (matches.length > 0) {
      console.log('🔍 textSearch: Found', matches.length, 'matches in', pageId, 'with score', pageScore);
      
      // Remove duplicate matches
      const uniqueMatches = matches.filter((match, index, self) => 
        index === self.findIndex(m => m.position === match.position && m.text === match.text)
      );
      
      scoredResults.push({
        pageId,
        pageData,
        score: pageScore,
        matches: uniqueMatches
      });
    }
  });

  // Sort results by score (highest first)
  scoredResults.sort((a, b) => b.score - a.score);
  
  // Convert to final format
  results.push(...scoredResults.map(item => ({
    pageId: item.pageId,
    pageTitle: item.pageData.title,
    matches: item.matches
  })));

  console.log('🔍 textSearch: Final results:', results);
  console.log('🔍 textSearch: Total matches found:', getTotalMatchCount(results));
  return results;
}

export function getTotalMatchCount(results: SearchResult[]): number {
  return results.reduce((total, result) => total + result.matches.length, 0);
}

export function getMatchAtIndex(results: SearchResult[], index: number): { result: SearchResult; match: SearchMatch; matchIndex: number } | null {
  let currentIndex = 0;
  
  for (const result of results) {
    for (let i = 0; i < result.matches.length; i++) {
      if (currentIndex === index) {
        return { result, match: result.matches[i], matchIndex: i };
      }
      currentIndex++;
    }
  }
  
  return null;
}
