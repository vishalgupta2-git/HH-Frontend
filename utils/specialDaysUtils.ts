import axios from 'axios';
import { getEndpointUrl, getAuthHeaders } from '@/constants/ApiConfig';

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
    const response = await axios.get(getEndpointUrl('SPECIAL_PUJA'), {
      headers: getAuthHeaders()
    });
    const pujas = response.data || [];
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const upcomingPujas: UpcomingPuja[] = [];
    
    pujas.forEach((puja: any) => {
      // Check if this is a fixed date puja and has a nextDate
      const isFixedDate = puja.dateMapping?.trim() === 'fixed';
      
      if (isFixedDate && puja.nextDate && puja.pujaName) {
        try {
          const pujaDate = new Date(puja.nextDate);
          
          // Check if the date is valid
          if (isNaN(pujaDate.getTime())) {
            return; // Skip this puja
          }
          
          // Check if puja date is in the next 30 days
          if (pujaDate >= today && pujaDate <= thirtyDaysFromNow) {
            const daysUntil = Math.ceil((pujaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            upcomingPujas.push({
              pujaName: puja.pujaName,
              dateMapping: puja.dateMapping,
              nextDate: puja.nextDate,
              pujaDetails: puja.pujaDetails,
              daysUntil
            });
          }
        } catch (dateError) {
          // Silent error handling for date parsing
        }
      }
    });
    
    // Sort by date (closest first)
    upcomingPujas.sort((a, b) => a.daysUntil - b.daysUntil);
    
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