// Dynamic icon mappings for the app
// This file centralizes all icon mappings and makes it easy to add new icons

export const specialPujaIcons = {
  'BirthdayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/BirthdayPujaIcon.png'),
  'AnniversaryPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/AnniversaryPujaIcon.png'),
  'ExamPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/ExamPujaIcon.png'),
  'InterveiwPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/InterveiwPujaIcon.png'),
  'NewbornPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/NewbornPujaIcon.png'),
  'ResultPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/ResultPujaIcon.png'),
  'DeathAnniversaryPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/DeathAnniversaryPujaIcon.png'),
  'ProposalPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/ProposalPujaIcon.png'),
  'RakshaBandhanPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/RakshaBandhanPujaIcon.png'),
  'FathersDayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/FathersDayPujaIcon.png'),
  'MothersDayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/MothersDayPujaIcon.png'),
  'WomansDayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/WomansDayPujaIcon.png'),
  'ValentinesDayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/ValentinesDayPujaIcon.png'),
  'ChildrensDayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/ChildrensDayPujaIcon.png'),
  'SpeedyRecoveryPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/SpeedyRecoveryPujaIcon.png'),
  '1stBirthdayPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/1stBirthdayPujaIcon.png'),
  '1stAnniversaryPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/1stAnniversaryPujaIcon.png'),
  'FirstDatePujaIcon.png': require('@/assets/images/icons/specialPujaIcons/FirstDatePujaIcon.png'),
  'karvachauthPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/karvachauthPujaIcon.png'),
  'newYearPujaIcon.png': require('@/assets/images/icons/specialPujaIcons/newYearPujaIcon.png'),
};

// Helper function to get image source from icon path
export function getImageSource(iconPath: string) {
  if (!iconPath) return null;
  
  // Handle special puja icons
  if (iconPath.includes('@/assets/images/icons/specialPujaIcons/')) {
    const filename = iconPath.replace('@/assets/images/icons/specialPujaIcons/', '');
    return specialPujaIcons[filename as keyof typeof specialPujaIcons] || null;
  }
  
  // Add more icon categories here as needed
  // Example for other icon types:
  // if (iconPath.includes('@/assets/images/icons/otherIcons/')) {
  //   const filename = iconPath.replace('@/assets/images/icons/otherIcons/', '');
  //   return otherIcons[filename as keyof typeof otherIcons] || null;
  // }
  
  return null;
}

// Helper function to check if an icon exists
export function iconExists(iconPath: string): boolean {
  return getImageSource(iconPath) !== null;
}

// Helper function to get all available icon filenames for a category
export function getAvailableIcons(category: 'specialPujaIcons'): string[] {
  switch (category) {
    case 'specialPujaIcons':
      return Object.keys(specialPujaIcons);
    default:
      return [];
  }
} 