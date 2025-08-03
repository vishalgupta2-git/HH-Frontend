import axios from 'axios';
import { getEndpointUrl } from '@/constants/ApiConfig';

export interface UpcomingPuja {
  pujaName: string;
  dateMapping: string;
  nextDate: string;
  pujaDetails?: string;
  daysUntil: number;
}

// Check for upcoming special pujas in the next 30 days
export const getUpcomingSpecialPujas = async (): Promise<UpcomingPuja[]> => {
  try {
    console.log('🔍 [DEBUG] Fetching special pujas for upcoming check...');
    const response = await axios.get(getEndpointUrl('SPECIAL_PUJA'));
    const pujas = response.data || [];
    
    console.log('🔍 [DEBUG] Total pujas fetched:', pujas.length);
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    console.log('🔍 [DEBUG] Date range:', {
      today: today.toISOString().split('T')[0],
      thirtyDaysFromNow: thirtyDaysFromNow.toISOString().split('T')[0]
    });
    
    const upcomingPujas: UpcomingPuja[] = [];
    
         pujas.forEach((puja: any, index: number) => {
               console.log(`🔍 [DEBUG] Checking puja ${index + 1}:`, {
          pujaName: puja.pujaName,
          dateMapping: puja.dateMapping,
          dateMappingTrimmed: puja.dateMapping?.trim(),
          nextDate: puja.nextDate,
          hasDateMapping: !!puja.dateMapping,
          hasNextDate: !!puja.nextDate,
          hasPujaName: !!puja.pujaName,
          isFixedDate: puja.dateMapping?.trim() === 'fixed'
        });
       
               // Check if this is a fixed date puja and has a nextDate
        const isFixedDate = puja.dateMapping?.trim() === 'fixed';
        
                 // Special debug for puja 14 (Raksha Bandhan)
         if (puja.pujaName === 'Raksha Bandhan') {
           const pujaDate = new Date(puja.nextDate);
           const daysUntil = Math.ceil((pujaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           
           console.log(`🔍 [DEBUG] 🎯 SPECIAL CHECK for Raksha Bandhan:`, {
             originalDateMapping: puja.dateMapping,
             trimmedDateMapping: puja.dateMapping?.trim(),
             trimmedLength: puja.dateMapping?.trim()?.length,
             isFixedDate,
             hasNextDate: !!puja.nextDate,
             nextDate: puja.nextDate,
             pujaDate: pujaDate.toISOString().split('T')[0],
             today: today.toISOString().split('T')[0],
             thirtyDaysFromNow: thirtyDaysFromNow.toISOString().split('T')[0],
             daysUntil,
             isInRange: pujaDate >= today && pujaDate <= thirtyDaysFromNow
           });
         }
        
        if (isFixedDate && puja.nextDate && puja.pujaName) {
         try {
           const pujaDate = new Date(puja.nextDate);
           
           // Check if the date is valid
           if (isNaN(pujaDate.getTime())) {
             console.log(`🔍 [DEBUG] ⚠️ Invalid nextDate for ${puja.pujaName}:`, {
               originalNextDate: puja.nextDate,
               error: 'Invalid date format'
             });
             return; // Skip this puja
           }
           
           console.log(`🔍 [DEBUG] Puja date for ${puja.pujaName}:`, {
             originalNextDate: puja.nextDate,
             parsedDate: pujaDate.toISOString().split('T')[0],
             isValidDate: !isNaN(pujaDate.getTime())
           });
           
           // Check if puja date is in the next 30 days
           if (pujaDate >= today && pujaDate <= thirtyDaysFromNow) {
             const daysUntil = Math.ceil((pujaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
             
             console.log(`🔍 [DEBUG] ✅ Found upcoming puja: ${puja.pujaName} in ${daysUntil} days`);
             
             upcomingPujas.push({
               pujaName: puja.pujaName,
               dateMapping: puja.dateMapping,
               nextDate: puja.nextDate,
               pujaDetails: puja.pujaDetails,
               daysUntil
             });
           } else {
             console.log(`🔍 [DEBUG] ❌ Puja ${puja.pujaName} not in range:`, {
               pujaDate: pujaDate.toISOString().split('T')[0],
               isAfterToday: pujaDate >= today,
               isBeforeThirtyDays: pujaDate <= thirtyDaysFromNow
             });
           }
         } catch (dateError) {
           console.log(`🔍 [DEBUG] ❌ Date parsing error for ${puja.pujaName}:`, {
             originalNextDate: puja.nextDate,
             error: dateError.message
           });
         }
       } else {
                   console.log(`🔍 [DEBUG] ⚠️ Puja ${index + 1} not a fixed date puja or missing fields:`, {
            dateMapping: puja.dateMapping,
            dateMappingTrimmed: puja.dateMapping?.trim(),
            hasDateMapping: !!puja.dateMapping,
            hasNextDate: !!puja.nextDate,
            hasPujaName: !!puja.pujaName,
            isFixedDate: puja.dateMapping?.trim() === 'fixed'
          });
       }
     });
    
    // Sort by date (closest first)
    upcomingPujas.sort((a, b) => a.daysUntil - b.daysUntil);
    
    console.log('🔍 [DEBUG] Final upcoming pujas found:', upcomingPujas.length);
    upcomingPujas.forEach(puja => {
      console.log(`🔍 [DEBUG] - ${puja.pujaName}: ${puja.daysUntil} days`);
    });
    
    return upcomingPujas;
  } catch (error) {
    console.error('❌ Error fetching upcoming special pujas:', error);
    return [];
  }
};

// Safe date parsing function
const parseDateSafely = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  
  try {
    // Try different date formats
    const formats = [
      dateString, // Original format
      dateString.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3'), // YYYY-MM-DD
      dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'), // MM/DD/YYYY
      dateString.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2'), // MM-DD-YYYY
    ];
    
    for (const format of formats) {
      const date = new Date(format);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

// Format date for display
export const formatPujaDate = (dateString: string): string => {
  try {
    const date = parseDateSafely(dateString);
    if (!date) {
      return dateString;
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Get days until text
export const getDaysUntilText = (daysUntil: number): string => {
  if (daysUntil === 0) return 'today';
  if (daysUntil === 1) return 'tomorrow';
  if (daysUntil < 7) return `in ${daysUntil} days`;
  if (daysUntil < 14) return `in ${Math.ceil(daysUntil / 7)} week${Math.ceil(daysUntil / 7) > 1 ? 's' : ''}`;
  return `in ${Math.ceil(daysUntil / 7)} weeks`;
}; 