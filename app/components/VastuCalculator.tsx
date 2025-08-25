import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface VastuResult {
  mainEntrance: string;
  bedroom: string;
  kitchen: string;
  livingRoom: string;
  bathroom: string;
  studyRoom: string;
  poojaRoom: string;
  overallScore: number;
  recommendations: string[];
}

interface DirectionAnalysis {
  direction: string;
  element: string;
  color: string;
  deity: string;
  suitableFor: string[];
  avoidFor: string[];
  remedies: string[];
}

const VastuCalculator: React.FC = () => {
  const [houseFacing, setHouseFacing] = useState('');
  const [mainEntrance, setMainEntrance] = useState('');
  const [bedroomLocation, setBedroomLocation] = useState('');
  const [kitchenLocation, setKitchenLocation] = useState('');
  const [livingRoomLocation, setLivingRoomLocation] = useState('');
  const [bathroomLocation, setBathroomLocation] = useState('');
  const [studyRoomLocation, setStudyRoomLocation] = useState('');
  const [poojaRoomLocation, setPoojaRoomLocation] = useState('');
  const [results, setResults] = useState<VastuResult | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'directions' | 'remedies'>('calculator');
  
  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoDescription, setInfoDescription] = useState('');

  // ScrollView reference for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Direction analysis data
  const directionAnalysis: { [key: string]: DirectionAnalysis } = {
    'North': {
      direction: 'North',
      element: 'Water',
      color: 'Blue/Black',
      deity: 'Kubera (God of Wealth)',
      suitableFor: ['Entrance', 'Kitchen', 'Study Room', 'Treasury'],
      avoidFor: ['Bedroom', 'Bathroom'],
      remedies: ['Place water fountain', 'Use blue/black colors', 'Keep clean and organized']
    },
    'South': {
      direction: 'South',
      element: 'Fire',
      color: 'Red/Orange',
      deity: 'Yama (God of Death)',
      suitableFor: ['Bedroom', 'Kitchen', 'Fireplace'],
      avoidFor: ['Main Entrance', 'Pooja Room'],
      remedies: ['Use red/orange colors', 'Place fire elements', 'Keep well-lit']
    },
    'East': {
      direction: 'East',
      element: 'Air',
      color: 'Green/Yellow',
      deity: 'Indra (God of Rain)',
      suitableFor: ['Main Entrance', 'Pooja Room', 'Study Room', 'Living Room'],
      avoidFor: ['Bathroom', 'Kitchen'],
      remedies: ['Use green/yellow colors', 'Place wind chimes', 'Keep windows open']
    },
    'West': {
      direction: 'West',
      element: 'Earth',
      color: 'Brown/Yellow',
      deity: 'Varuna (God of Water)',
      suitableFor: ['Bedroom', 'Bathroom', 'Storage'],
      avoidFor: ['Main Entrance', 'Pooja Room'],
      remedies: ['Use brown/yellow colors', 'Place heavy furniture', 'Keep stable']
    },
    'North-East': {
      direction: 'North-East',
      element: 'Water + Air',
      color: 'Light Blue/White',
      deity: 'Ishanya (God of Knowledge)',
      suitableFor: ['Pooja Room', 'Study Room', 'Entrance'],
      avoidFor: ['Kitchen', 'Bathroom', 'Bedroom'],
      remedies: ['Keep clean and pure', 'Use light colors', 'Place religious items']
    },
    'North-West': {
      direction: 'North-West',
      element: 'Air + Earth',
      color: 'Grey/White',
      deity: 'Vayu (God of Wind)',
      suitableFor: ['Bedroom', 'Guest Room', 'Storage'],
      avoidFor: ['Kitchen', 'Pooja Room'],
      remedies: ['Use grey/white colors', 'Place wind chimes', 'Keep well-ventilated']
    },
    'South-East': {
      direction: 'South-East',
      element: 'Fire + Air',
      color: 'Red/Orange',
      deity: 'Agni (God of Fire)',
      suitableFor: ['Kitchen', 'Fireplace', 'Generator Room'],
      avoidFor: ['Bedroom', 'Pooja Room'],
      remedies: ['Use red/orange colors', 'Place fire elements', 'Keep well-lit']
    },
    'South-West': {
      direction: 'South-West',
      element: 'Earth + Fire',
      color: 'Brown/Red',
      deity: 'Nairutya (God of Demons)',
      suitableFor: ['Master Bedroom', 'Heavy Furniture', 'Storage'],
      avoidFor: ['Main Entrance', 'Pooja Room', 'Kitchen'],
      remedies: ['Use brown/red colors', 'Place heavy items', 'Keep stable and quiet']
    }
  };

  // Room placement guidelines
  const roomGuidelines = {
    'Main Entrance': {
      'North': 'Excellent - Brings wealth and prosperity',
      'North-East': 'Excellent - Brings knowledge and wisdom',
      'East': 'Very Good - Brings health and happiness',
      'North-West': 'Good - Brings success in business',
      'West': 'Moderate - May cause delays',
      'South-East': 'Poor - May cause financial issues',
      'South': 'Poor - May cause health issues',
      'South-West': 'Very Poor - May cause conflicts'
    },
    'Bedroom': {
      'South-West': 'Excellent - Best for master bedroom',
      'South': 'Very Good - Good for sleep',
      'West': 'Good - Peaceful sleep',
      'North-West': 'Good - Good for guests',
      'North': 'Moderate - May cause restlessness',
      'North-East': 'Poor - May cause health issues',
      'East': 'Poor - May cause early rising',
      'South-East': 'Very Poor - May cause insomnia'
    },
    'Kitchen': {
      'South-East': 'Excellent - Best for kitchen',
      'North-West': 'Very Good - Good for cooking',
      'East': 'Good - Good for health',
      'South': 'Moderate - May cause health issues',
      'North': 'Poor - May cause financial issues',
      'North-East': 'Very Poor - May cause health problems',
      'West': 'Poor - May cause digestive issues',
      'South-West': 'Very Poor - May cause family conflicts'
    },
    'Pooja Room': {
      'North-East': 'Excellent - Best for spiritual activities',
      'East': 'Very Good - Good for morning prayers',
      'North': 'Good - Good for meditation',
      'North-West': 'Moderate - Acceptable',
      'West': 'Poor - Not ideal for prayers',
      'South': 'Poor - May cause negative energy',
      'South-East': 'Very Poor - May cause spiritual issues',
      'South-West': 'Very Poor - May cause negative thoughts'
    }
  };

  // Show info modal
  const showInfo = (title: string, description: string) => {
    setInfoTitle(title);
    setInfoDescription(description);
    setShowInfoModal(true);
  };

  // Close info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  // Handle modal overlay click
  const handleModalOverlayClick = () => {
    closeInfoModal();
  };

  // Calculate Vastu score and recommendations
  const calculateVastu = () => {
    if (!houseFacing.trim() || !mainEntrance.trim()) {
      Alert.alert('Error', 'Please enter house facing direction and main entrance location');
      return;
    }

    let score = 100;
    const recommendations: string[] = [];

    // Analyze main entrance
    const entranceScore = getDirectionScore('Main Entrance', mainEntrance);
    score += entranceScore.score;
    if (entranceScore.recommendations.length > 0) {
      recommendations.push(...entranceScore.recommendations);
    }

    // Analyze bedroom
    if (bedroomLocation.trim()) {
      const bedroomScore = getDirectionScore('Bedroom', bedroomLocation);
      score += bedroomScore.score;
      if (bedroomScore.recommendations.length > 0) {
        recommendations.push(...bedroomScore.recommendations);
      }
    }

    // Analyze kitchen
    if (kitchenLocation.trim()) {
      const kitchenScore = getDirectionScore('Kitchen', kitchenLocation);
      score += kitchenScore.score;
      if (kitchenScore.recommendations.length > 0) {
        recommendations.push(...kitchenScore.recommendations);
      }
    }

    // Analyze other rooms
    const rooms = [
      { name: 'Living Room', location: livingRoomLocation },
      { name: 'Bathroom', location: bathroomLocation },
      { name: 'Study Room', location: studyRoomLocation },
      { name: 'Pooja Room', location: poojaRoomLocation }
    ];

    rooms.forEach(room => {
      if (room.location.trim()) {
        const roomScore = getDirectionScore(room.name, room.location);
        score += roomScore.score;
        if (roomScore.recommendations.length > 0) {
          recommendations.push(...roomScore.recommendations);
        }
      }
    });

    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));

    const result: VastuResult = {
      mainEntrance: mainEntrance,
      bedroom: bedroomLocation,
      kitchen: kitchenLocation,
      livingRoom: livingRoomLocation,
      bathroom: bathroomLocation,
      studyRoom: studyRoomLocation,
      poojaRoom: poojaRoomLocation,
      overallScore: score,
      recommendations: recommendations
    };

    setResults(result);
    
    // No scrolling - results will appear below naturally
  };

  // Get direction score for a specific room
  const getDirectionScore = (roomName: string, direction: string) => {
    const guidelines = roomGuidelines[roomName as keyof typeof roomGuidelines];
    if (!guidelines || !guidelines[direction as keyof typeof guidelines]) {
      return { score: -10, recommendations: [`${roomName} placement in ${direction} direction needs analysis`] };
    }

    const placement = guidelines[direction as keyof typeof guidelines];
    let score = 0;
    const recommendations: string[] = [];

    if (placement.includes('Excellent')) {
      score = 15;
    } else if (placement.includes('Very Good')) {
      score = 10;
    } else if (placement.includes('Good')) {
      score = 5;
    } else if (placement.includes('Moderate')) {
      score = 0;
    } else if (placement.includes('Poor')) {
      score = -10;
      recommendations.push(`Consider relocating ${roomName} from ${direction} direction`);
    } else if (placement.includes('Very Poor')) {
      score = -20;
      recommendations.push(`Strongly recommend relocating ${roomName} from ${direction} direction`);
    }

    // Add specific recommendations based on direction analysis
    const directionInfo = directionAnalysis[direction];
    if (directionInfo) {
      if (!directionInfo.suitableFor.includes(roomName)) {
        recommendations.push(`Use ${directionInfo.remedies.join(', ')} for ${roomName} in ${direction}`);
      }
    }

    return { score, recommendations };
  };

  // Clear all inputs and results
  const clearAll = () => {
    setHouseFacing('');
    setMainEntrance('');
    setBedroomLocation('');
    setKitchenLocation('');
    setLivingRoomLocation('');
    setBathroomLocation('');
    setStudyRoomLocation('');
    setPoojaRoomLocation('');
    setResults(null);
    // Scroll to top after clearing
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderCalculatorTab = () => (
    <>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Your House Information</Text>
        
        {/* House Facing */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>House Facing Direction</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => showInfo('House Facing', 'The direction your house faces (main entrance direction). This is crucial for Vastu analysis as it determines the energy flow into your home.')}
          >
            <Text style={styles.dropdownButtonText}>
              {houseFacing || 'Select House Facing Direction'}
            </Text>
            <Text style={styles.dropdownButtonText}>i</Text>
          </TouchableOpacity>
          <View style={styles.directionGrid}>
            {Object.keys(directionAnalysis).map((direction) => (
              <TouchableOpacity
                key={direction}
                style={[
                  styles.directionButton,
                  houseFacing === direction && styles.selectedDirection
                ]}
                onPress={() => setHouseFacing(direction)}
              >
                <Text style={[
                  styles.directionButtonText,
                  houseFacing === direction && styles.selectedDirectionText
                ]}>
                  {direction}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Room Locations */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Room Locations</Text>
          
          {/* Main Entrance */}
          <View style={styles.roomInput}>
            <Text style={styles.roomLabel}>Main Entrance</Text>
            <View style={styles.directionGrid}>
              {Object.keys(directionAnalysis).map((direction) => (
                <TouchableOpacity
                  key={direction}
                  style={[
                    styles.directionButton,
                    mainEntrance === direction && styles.selectedDirection
                  ]}
                  onPress={() => setMainEntrance(direction)}
                >
                  <Text style={[
                    styles.directionButtonText,
                    mainEntrance === direction && styles.selectedDirectionText
                  ]}>
                    {direction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedroom */}
          <View style={styles.roomInput}>
            <Text style={styles.roomLabel}>Bedroom</Text>
            <View style={styles.directionGrid}>
              {Object.keys(directionAnalysis).map((direction) => (
                <TouchableOpacity
                  key={direction}
                  style={[
                    styles.directionButton,
                    bedroomLocation === direction && styles.selectedDirection
                  ]}
                  onPress={() => setBedroomLocation(direction)}
                >
                  <Text style={[
                    styles.directionButtonText,
                    bedroomLocation === direction && styles.selectedDirectionText
                  ]}>
                    {direction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kitchen */}
          <View style={styles.roomInput}>
            <Text style={styles.roomLabel}>Kitchen</Text>
            <View style={styles.directionGrid}>
              {Object.keys(directionAnalysis).map((direction) => (
                <TouchableOpacity
                  key={direction}
                  style={[
                    styles.directionButton,
                    kitchenLocation === direction && styles.selectedDirection
                  ]}
                  onPress={() => setKitchenLocation(direction)}
                >
                  <Text style={[
                    styles.directionButtonText,
                    kitchenLocation === direction && styles.selectedDirectionText
                  ]}>
                    {direction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Other Rooms */}
          {[
            { label: 'Living Room', state: livingRoomLocation, setter: setLivingRoomLocation },
            { label: 'Bathroom', state: bathroomLocation, setter: setBathroomLocation },
            { label: 'Study Room', state: studyRoomLocation, setter: setStudyRoomLocation },
            { label: 'Pooja Room', state: poojaRoomLocation, setter: setPoojaRoomLocation }
          ].map((room) => (
            <View key={room.label} style={styles.roomInput}>
              <Text style={styles.roomLabel}>{room.label}</Text>
              <View style={styles.directionGrid}>
                {Object.keys(directionAnalysis).map((direction) => (
                  <TouchableOpacity
                    key={direction}
                    style={[
                      styles.directionButton,
                      room.state === direction && styles.selectedDirection
                    ]}
                    onPress={() => room.setter(direction)}
                  >
                    <Text style={[
                      styles.directionButtonText,
                      room.state === direction && styles.selectedDirectionText
                    ]}>
                      {direction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateVastu}
        >
          <View style={styles.calculateButtonGradient}>
            <Text style={styles.calculateButtonText}>Calculate Vastu</Text>
          </View>
        </TouchableOpacity>

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAll}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Vastu Analysis Results</Text>
          
          {/* Overall Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Overall Vastu Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{results.overallScore}%</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {results.overallScore >= 80 ? 'Excellent Vastu - Your home has very good energy flow' :
               results.overallScore >= 60 ? 'Good Vastu - Your home has good energy flow with minor issues' :
               results.overallScore >= 40 ? 'Moderate Vastu - Your home has some energy imbalances' :
               'Poor Vastu - Your home needs significant Vastu corrections'}
            </Text>
          </View>

          {/* Room Analysis */}
          <View style={styles.roomAnalysisCard}>
            <Text style={styles.analysisTitle}>Room Placement Analysis</Text>
            
            {[
              { name: 'Main Entrance', location: results.mainEntrance },
              { name: 'Bedroom', location: results.bedroom },
              { name: 'Kitchen', location: results.kitchen },
              { name: 'Living Room', location: results.livingRoom },
              { name: 'Bathroom', location: results.bathroom },
              { name: 'Study Room', location: results.studyRoom },
              { name: 'Pooja Room', location: results.poojaRoom }
            ].map((room) => {
              if (!room.location) return null;
              const guidelines = roomGuidelines[room.name as keyof typeof roomGuidelines];
              const placement = guidelines?.[room.location as keyof typeof guidelines] || 'Analysis needed';
              
              return (
                <View key={room.name} style={styles.roomAnalysisItem}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomLocation}>{room.location}</Text>
                  <Text style={styles.roomPlacement}>{placement}</Text>
                </View>
              );
            })}
          </View>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.analysisTitle}>Recommendations</Text>
              {results.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );

  const renderDirectionsTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Direction Analysis</Text>
        <Text style={styles.sectionSubtitle}>Click any direction to learn about its properties and suitable uses</Text>
        
        {Object.entries(directionAnalysis).map(([direction, info]) => (
          <TouchableOpacity
            key={direction}
            style={styles.directionCard}
            onPress={() => showInfo(direction, 
              `${direction} Direction Analysis:\n\n` +
              `Element: ${info.element}\n` +
              `Color: ${info.color}\n` +
              `Deity: ${info.deity}\n\n` +
              `Suitable for: ${info.suitableFor.join(', ')}\n` +
              `Avoid for: ${info.avoidFor.join(', ')}\n\n` +
              `Remedies: ${info.remedies.join(', ')}`
            )}
          >
            <View style={styles.directionCardHeader}>
              <Text style={styles.directionCardTitle}>{direction}</Text>
              <Text style={styles.dropdownButtonText}>i</Text>
            </View>
            <Text style={styles.directionCardElement}>Element: {info.element}</Text>
            <Text style={styles.directionCardDeity}>Deity: {info.deity}</Text>
            <Text style={styles.directionCardSuitable}>
              Best for: {info.suitableFor.slice(0, 2).join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderRemediesTab = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Vastu Remedies</Text>
        
        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>General Remedies</Text>
          <Text style={styles.remedyText}>
            • Keep your home clean and clutter-free{'\n'}
            • Ensure proper ventilation in all rooms{'\n'}
            • Use natural light whenever possible{'\n'}
            • Place mirrors strategically to enhance positive energy{'\n'}
            • Use appropriate colors for each direction{'\n'}
            • Keep the center of your home open and clean{'\n'}
            • Place heavy furniture in South-West direction{'\n'}
            • Avoid placing kitchen and bathroom in North-East
          </Text>
        </View>

        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>Color Remedies</Text>
          <Text style={styles.remedyText}>
            • North: Blue/Black for wealth{'\n'}
            • South: Red/Orange for energy{'\n'}
            • East: Green/Yellow for health{'\n'}
            • West: Brown/Yellow for stability{'\n'}
            • North-East: Light Blue/White for purity{'\n'}
            • South-East: Red/Orange for fire{'\n'}
            • South-West: Brown/Red for grounding{'\n'}
            • North-West: Grey/White for balance
          </Text>
        </View>

        <View style={styles.remedyCard}>
          <Text style={styles.remedyTitle}>Element Remedies</Text>
          <Text style={styles.remedyText}>
            • Water: Place water fountains in North{'\n'}
            • Fire: Use red colors and fire elements in South-East{'\n'}
            • Earth: Place heavy items in South-West{'\n'}
            • Air: Use wind chimes and keep East well-ventilated{'\n'}
            • Space: Keep center of home open and clean
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calculator' && styles.activeTab]}
          onPress={() => setActiveTab('calculator')}
        >
          <Text style={[styles.tabText, activeTab === 'calculator' && styles.activeTabText]}>
            Calculator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'directions' && styles.activeTab]}
          onPress={() => setActiveTab('directions')}
        >
          <Text style={[styles.tabText, activeTab === 'directions' && styles.activeTabText]}>
            Directions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'remedies' && styles.activeTab]}
          onPress={() => setActiveTab('remedies')}
        >
          <Text style={[styles.tabText, activeTab === 'remedies' && styles.activeTabText]}>
            Remedies
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'directions' && renderDirectionsTab()}
        {activeTab === 'remedies' && renderRemediesTab()}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Vastu Shastra</Text>
          <Text style={styles.infoText}>
            Vastu Shastra is an ancient Indian science of architecture and design that aims to create harmony between nature and human dwellings. It is based on the principle that everything in the universe has energy, and the proper placement of rooms and objects can enhance positive energy flow.
          </Text>
          <Text style={styles.infoText}>
            The eight directions (Ashtadik) play a crucial role in Vastu, each having specific elements, colors, and deities associated with them. Proper room placement according to Vastu principles can bring health, wealth, and happiness to the residents.
          </Text>
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeInfoModal}
        onDismiss={closeInfoModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleModalOverlayClick}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoTitle}</Text>
              <TouchableOpacity
                onPress={closeInfoModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{infoDescription}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeInfoModal}
            >
              <View style={styles.modalCloseButtonGradient}>
                <Text style={styles.modalCloseButtonText}>Got it!</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFA040',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  directionButton: {
    width: (screenWidth - 80) / 4 - 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDirection: {
    backgroundColor: '#FFA040',
    borderColor: '#FFA040',
  },
  directionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  selectedDirectionText: {
    color: 'white',
  },
  roomInput: {
    marginBottom: 15,
  },
  roomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  calculateButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFA040',
    borderRadius: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    padding: 18,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFA040',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  roomAnalysisCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  roomAnalysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  roomLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  roomPlacement: {
    fontSize: 12,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  directionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  directionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  directionCardElement: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  directionCardDeity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  directionCardSuitable: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  remedyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  remedyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  remedyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'left',
  },
  modalCloseButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalCloseButtonGradient: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFA040',
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VastuCalculator;
