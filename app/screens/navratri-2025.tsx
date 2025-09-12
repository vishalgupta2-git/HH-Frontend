import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Dimensions, StatusBar, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_TOP = 250;
const CARD_MARGIN_TOP = -40;

const mantras = [
  // All mantras will be removed
];

export default function Navratri2025Screen() {
  const router = useRouter();
  const { isHindi } = useLanguage();
  const [selectedMantra, setSelectedMantra] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shuffledMantras, setShuffledMantras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tocItems, setTocItems] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: View | null }>({});

  // Fisher-Yates shuffle algorithm - keep Ganesha mantra always first
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    // Keep the first mantra (Ganesha) always on top
    const firstMantra = shuffled[0];
    const remainingMantras = shuffled.slice(1);
    
    // Shuffle only the remaining mantras
    for (let i = remainingMantras.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingMantras[i], remainingMantras[j]] = [remainingMantras[j], remainingMantras[i]];
    }
    
    return [firstMantra, ...remainingMantras];
  };

  // Parse text with bold formatting, bullet points, and images
  const parseTextWithFormatting = (text: string) => {
    const lines = text.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for image tags first (both correct and malformed)
      const imageMatches = line.match(/<image>(.*?)<\/image>/g);
      const malformedImageMatches = line.match(/<\/image>(.*?)<\/image>/g);
      const singleMalformedMatch = line.match(/<\/image>(.*?)$/);
      
      if (imageMatches && imageMatches.length > 0) {
        const imageUrls = imageMatches.map(match => 
          match.replace(/<\/?image>/g, '').trim()
        );
        formattedLines.push({
          type: 'images',
          content: imageUrls,
          indent: 0
        });
      } else if (malformedImageMatches && malformedImageMatches.length > 0) {
        const imageUrls = malformedImageMatches.map(match => 
          match.replace(/<\/image>/g, '').trim()
        );
        formattedLines.push({
          type: 'images',
          content: imageUrls,
          indent: 0
        });
      } else if (singleMalformedMatch) {
        const imageUrl = singleMalformedMatch[1].trim();
        formattedLines.push({
          type: 'images',
          content: [imageUrl],
          indent: 0
        });
      } else if (line.trim().startsWith('---')) {
        // Sub bullet point (---)
        const content = line.replace(/^---\s*/, '').trim();
        formattedLines.push({
          type: 'sub-bullet',
          content: parseBoldText(content),
          indent: 2
        });
      } else if (line.trim().startsWith('--')) {
        // Main bullet point (--)
        const content = line.replace(/^--\s*/, '').trim();
        formattedLines.push({
          type: 'bullet',
          content: parseBoldText(content),
          indent: 1
        });
      } else if (line.trim().startsWith('-')) {
        // Main bullet point (-)
        const content = line.replace(/^-\s*/, '').trim();
        formattedLines.push({
          type: 'bullet',
          content: parseBoldText(content),
          indent: 1
        });
      } else if (line.trim() === '') {
        // Empty line
        formattedLines.push({
          type: 'empty',
          content: '',
          indent: 0
        });
      } else {
        // Regular text
        formattedLines.push({
          type: 'text',
          content: parseBoldText(line),
          indent: 0
        });
      }
    }
    
    return formattedLines;
  };

  // Parse bold text within a line
  const parseBoldText = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Find all <b> tags
    const boldRegex = /<b>(.*?)<\/b>/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold tag
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          bold: false
        });
      }
      
      // Add the bold text
      parts.push({
        text: match[1],
        bold: true
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        bold: false
      });
    }
    
    return parts;
  };

  // Extract content based on language
  const extractLanguageContent = (text: string, isHindi: boolean) => {
    const languageTag = isHindi ? 'hindi' : 'english';
    const languageRegex = new RegExp(`<${languageTag}>(.*?)<\/${languageTag}>`, 's');
    const match = text.match(languageRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // Fallback to English if Hindi content not found
    if (isHindi) {
      const englishMatch = text.match(/<english>(.*?)<\/english>/s);
      if (englishMatch) {
        return englishMatch[1].trim();
      }
    }
    
    return text; // Return original text if no language tags found
  };

  // Parse the custom HTML-like text content
  const parseTextContent = (text: string) => {
    const sections = [];
    const tocItems = [];
    
    // Extract language-specific content
    const languageContent = extractLanguageContent(text, isHindi);
    
    // Extract ToC items (h1t tags)
    const tocMatches = languageContent.match(/<h1t>(.*?)<\/h1t>/g);
    if (tocMatches) {
      tocMatches.forEach(match => {
        const title = match.replace(/<\/?h1t>/g, '').trim();
        tocItems.push(title);
      });
    }
    
    // Extract content sections
    tocItems.forEach(tocItem => {
      const sectionRegex = new RegExp(`<${tocItem}>(.*?)<\/${tocItem}>`, 's');
      const sectionMatch = languageContent.match(sectionRegex);
      
      if (sectionMatch) {
        const content = sectionMatch[1].trim();
        const formattedContent = parseTextWithFormatting(content);
        
        sections.push({
          title: tocItem,
          content: content,
          formattedContent: formattedContent,
          id: tocItem.toLowerCase().replace(/\s+/g, '-')
        });
      }
    });
    
    return { tocItems, sections };
  };

  // Fetch content from your S3 bucket
  const fetchNavratriContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct S3 URL (replace with your actual public URL)
      const response = await fetch('https://hinduheritage-public-bucket.s3.ap-south-1.amazonaws.com/Navratri.txt');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const textContent = await response.text();
      const { tocItems, sections } = parseTextContent(textContent);
      
      setTocItems(tocItems);
      setSections(sections);
    } catch (error) {
      console.error('Error fetching Navratri content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavratriContent();
  }, []);

  // Refresh content when language changes
  useEffect(() => {
    fetchNavratriContent();
  }, [isHindi]);

  const openMantraModal = (mantra: any) => {
    setSelectedMantra(mantra);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMantra(null);
  };

  const speakMantra = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'hi-IN',
      pitch: 0.8,
      rate: 0.8,
      voice: 'male'
    });
  };

  const scrollToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    const sectionRef = sectionRefs.current[sectionId];
    if (sectionRef && scrollViewRef.current) {
      sectionRef.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => {}
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNavratriContent();
    setRefreshing(false);
  };

  // Calculate image height based on natural dimensions
  const getImageHeight = (imageUrl: string, targetWidth: number) => {
    const dimensions = imageDimensions[imageUrl];
    if (dimensions) {
      const aspectRatio = dimensions.height / dimensions.width;
      return targetWidth * aspectRatio;
    }
    return targetWidth; // Fallback to square if dimensions not available
  };

  // Handle image load to get dimensions
  const handleImageLoad = (imageUrl: string, event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions(prev => ({
      ...prev,
      [imageUrl]: { width, height }
    }));
  };

  // Component to render formatted text with bullets and images
  const FormattedText = ({ formattedContent }: { formattedContent: any[] }) => {
    return (
      <View>
        {formattedContent.map((line, lineIndex) => {
          if (line.type === 'empty') {
            return <View key={lineIndex} style={styles.emptyLine} />;
          }
          
          if (line.type === 'images') {
            return (
              <View key={lineIndex} style={styles.imageContainer}>
                {line.content.map((imageUrl, imageIndex) => {
                  // Use 35% width for side-by-side images, 45% for single images
                  const targetWidth = line.content.length > 1 ? width * 0.35 : width * 0.45;
                  const calculatedHeight = getImageHeight(imageUrl, targetWidth);
                  
                  return (
                    <Image
                      key={imageIndex}
                      source={{ uri: imageUrl }}
                      style={[
                        styles.image,
                        {
                          width: targetWidth,
                          height: calculatedHeight,
                        },
                        line.content.length > 1 && styles.sideBySideImage
                      ]}
                      resizeMode="cover"
                      onError={(error) => console.error('Image load error:', error, imageUrl)}
                      onLoad={(event) => {
                        handleImageLoad(imageUrl, event);
                      }}
                    />
                  );
                })}
              </View>
            );
          }
          
          return (
            <View key={lineIndex} style={[styles.textLine, { marginLeft: line.indent * 20 }]}>
              {line.type === 'bullet' && (
                <Text style={styles.bulletPoint}>• </Text>
              )}
              {line.type === 'sub-bullet' && (
                <Text style={styles.subBulletPoint}>  ◦ </Text>
              )}
              <Text style={styles.sectionContent}>
                {line.content.map((part, partIndex) => (
                  <Text key={partIndex} style={part.bold ? styles.boldText : styles.normalText}>
                    {part.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
        
        <LinearGradient
          colors={["#FFA040", "#FF6A00"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Hindu Heritage</Text>
          <Image
            source={require('@/assets/images/temple illustration.png')}
            style={styles.temple}
          />
        </LinearGradient>
        
        <View style={styles.card}>
          <View style={styles.contentHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-undo" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.screenTitle}>{isHindi ? 'नवरात्रि 2025' : 'Navratri 2025'}</Text>
            </View>
          </View>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{isHindi ? 'नवरात्रि 2025 सामग्री लोड हो रही है...' : 'Loading Navratri 2025 content...'}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
        
        <LinearGradient
          colors={["#FFA040", "#FF6A00"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Hindu Heritage</Text>
          <Image
            source={require('@/assets/images/temple illustration.png')}
            style={styles.temple}
          />
        </LinearGradient>
        
        <View style={styles.card}>
          <View style={styles.contentHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-undo" size={24} color="#666" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.screenTitle}>{isHindi ? 'नवरात्रि 2025' : 'Navratri 2025'}</Text>
            </View>
          </View>

          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNavratriContent}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFA040" />
      
      {/* Header matching Shalokas screen */}
      <LinearGradient
        colors={["#FFA040", "#FF6A00"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Image source={require('@/assets/images/hindu heritage.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Hindu Heritage</Text>
        <Image
          source={require('@/assets/images/temple illustration.png')}
          style={styles.temple}
        />
      </LinearGradient>
      
      {/* Content card overlapping header */}
      <View style={styles.card}>
        <View style={styles.contentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-undo" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>{isHindi ? 'नवरात्रि 2025' : 'Navratri 2025'}</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6A00']} // Android
              tintColor="#FF6A00" // iOS
              title="Pull to refresh" // iOS
              titleColor="#666" // iOS
            />
          }
        >
          {/* Table of Contents */}
          {tocItems.length > 0 && (
            <View style={styles.tocContainer}>
              <Text style={styles.tocTitle}>{isHindi ? 'विषय सूची' : 'Table of Contents'}</Text>
              {tocItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tocItem,
                    selectedSection === item.toLowerCase().replace(/\s+/g, '-') && styles.tocItemSelected
                  ]}
                  onPress={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.tocItemText,
                    selectedSection === item.toLowerCase().replace(/\s+/g, '-') && styles.tocItemTextSelected
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Content Sections */}
          <View style={styles.sectionsContainer}>
            {sections.map((section, index) => (
              <View
                key={index}
                ref={(ref) => {
                  sectionRefs.current[section.id] = ref;
                }}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.formattedContent ? (
                  <FormattedText formattedContent={section.formattedContent} />
                ) : (
                  <Text style={styles.sectionContent}>{section.content}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Mantra Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalSpeakerButton}
                onPress={() => speakMantra(selectedMantra?.sanskrit || '')}
              >
                <Text style={styles.modalSpeakerIcon}>▶️</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSanskrit}>{selectedMantra?.sanskrit}</Text>
            <Text style={styles.modalEnglish}>{selectedMantra?.english}</Text>
            <Text style={styles.modalDeity}>Deity: {selectedMantra?.deity}</Text>
            <Text style={styles.modalReference}>Reference: {selectedMantra?.reference}</Text>
            <Text style={styles.modalMeaning}>{selectedMantra?.meaning}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export const options = { headerShown: false };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: CARD_TOP,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    position: 'relative',
  },
  logo: {
    width: Math.min(width * 1.125 * 0.8, width),
    height: undefined,
    aspectRatio: 1,
    marginTop: -60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  temple: {
    position: 'absolute',
    width: width * 1.5 * 0.8 * 1.2, // 120% size
    height: 120 * 0.8 * 1.2, // 120% size
    left: width * -0.25 * 0.8,
    bottom: 0, // Same positioning as home screen
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: CARD_MARGIN_TOP,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tilesContainer: {
    paddingVertical: 20,
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  speakerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  speakerIcon: {
    fontSize: 16,
  },
  tileSanskrit: {
    fontSize: 16,
    color: '#FF6A00',
    flex: 1,
    marginBottom: 8,
  },
  tileEnglish: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  tileDeity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tileReference: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  modalSpeakerButton: {
    padding: 8,
  },
  modalSpeakerIcon: {
    fontSize: 24,
  },
  modalSanskrit: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalEnglish: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalDeity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalReference: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMeaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  tocContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 12,
  },
  tocItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tocItemSelected: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  tocItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tocItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionsContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  normalText: {
    fontWeight: 'normal',
    color: '#333',
  },
  textLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  emptyLine: {
    height: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#FF6A00',
    fontWeight: 'bold',
    marginRight: 4,
  },
  subBulletPoint: {
    fontSize: 14,
    color: '#FF6A00',
    fontWeight: 'bold',
    marginRight: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
    justifyContent: 'center', // Center images by width
    alignItems: 'center',
  },
  image: {
    width: width * 0.45, // 45% of screen width
    height: width * 0.45, // Square aspect ratio to prevent clipping
    borderRadius: 8,
    marginBottom: 8,
  },
  sideBySideImage: {
    marginRight: 5, // 5px spacing between side-by-side images
  },
});
