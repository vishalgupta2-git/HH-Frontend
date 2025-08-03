// Test utility to debug special days
export const testSpecialDaysLogic = () => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  console.log('🧪 [TEST] Special Days Debug Info:');
  console.log('🧪 [TEST] Today:', today.toISOString().split('T')[0]);
  console.log('🧪 [TEST] 30 days from now:', thirtyDaysFromNow.toISOString().split('T')[0]);
  
  // Test some common date formats
  const testDates = [
    '2024-08-19', // Rakshabandhan 2024
    '2024-08-20',
    '2024-08-21',
    '2024-09-19', // Rakshabandhan 2024 (alternative)
    '2024-12-25', // Christmas (should not show)
    'invalid-date',
    '',
    null,
    undefined
  ];
  
  testDates.forEach(dateStr => {
    if (dateStr) {
      const testDate = new Date(dateStr);
      const isValid = !isNaN(testDate.getTime());
      const isInRange = isValid && testDate >= today && testDate <= thirtyDaysFromNow;
      const daysUntil = isValid ? Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A';
      
      console.log(`🧪 [TEST] Date: "${dateStr}" -> Valid: ${isValid}, In Range: ${isInRange}, Days Until: ${daysUntil}`);
    } else {
      console.log(`🧪 [TEST] Date: "${dateStr}" -> Valid: false, In Range: false, Days Until: N/A`);
    }
  });
}; 