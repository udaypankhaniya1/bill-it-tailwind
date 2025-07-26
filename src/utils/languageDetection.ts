/**
 * Utility functions for language detection and text processing
 */

// Common Gujarati characters and patterns
const gujaratiCharPattern = /[\u0A80-\u0AFF]/;
const gujaratiWordPatterns = [
  /[\u0A80-\u0AFF]+/g, // Gujarati Unicode range
  /[ગજરાતી]/g, // Common Gujarati characters
  /[મુંબઈ]/g, // Mumbai in Gujarati
  /[અહમદાબાદ]/g, // Ahmedabad in Gujarati
];

/**
 * Detects if text contains Gujarati characters
 * @param text The text to analyze
 * @returns true if Gujarati characters are detected
 */
export const containsGujarati = (text: string): boolean => {
  if (!text || text.trim() === '') return false;
  
  // Check for Gujarati Unicode characters
  return gujaratiCharPattern.test(text);
};

/**
 * Estimates the percentage of Gujarati content in text
 * @param text The text to analyze
 * @returns Percentage (0-100) of Gujarati content
 */
export const getGujaratiPercentage = (text: string): number => {
  if (!text || text.trim() === '') return 0;
  
  const totalChars = text.length;
  const gujaratiMatches = text.match(gujaratiCharPattern);
  const gujaratiCount = gujaratiMatches ? gujaratiMatches.length : 0;
  
  return Math.round((gujaratiCount / totalChars) * 100);
};

/**
 * Detects the primary language of the text
 * @param text The text to analyze
 * @returns 'gujarati', 'english', or 'mixed'
 */
export const detectLanguage = (text: string): 'gujarati' | 'english' | 'mixed' => {
  if (!text || text.trim() === '') return 'english';
  
  const gujaratiPercentage = getGujaratiPercentage(text);
  
  if (gujaratiPercentage > 50) return 'gujarati';
  if (gujaratiPercentage > 0) return 'mixed';
  return 'english';
};

/**
 * Checks if text is likely Ginlish (mixed Gujarati and English)
 * @param text The text to analyze
 * @returns true if text appears to be Ginlish
 */
export const isGinlish = (text: string): boolean => {
  if (!text || text.trim() === '') return false;
  
  const gujaratiPercentage = getGujaratiPercentage(text);
  // Consider it Ginlish if it has some Gujarati (5-95%) mixed with English
  return gujaratiPercentage > 5 && gujaratiPercentage < 95;
};

/**
 * Extracts English words from mixed text
 * @param text The mixed text
 * @returns Array of English words
 */
export const extractEnglishWords = (text: string): string[] => {
  if (!text) return [];
  
  // Remove Gujarati characters and extract remaining words
  const englishText = text.replace(gujaratiCharPattern, ' ');
  return englishText.split(/\s+/).filter(word => 
    word.length > 0 && /[a-zA-Z]/.test(word)
  );
};

/**
 * Extracts Gujarati words from mixed text
 * @param text The mixed text
 * @returns Array of Gujarati words
 */
export const extractGujaratiWords = (text: string): string[] => {
  if (!text) return [];
  
  const gujaratiMatches = text.match(/[\u0A80-\u0AFF\s]+/g);
  if (!gujaratiMatches) return [];
  
  return gujaratiMatches
    .join(' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && gujaratiCharPattern.test(word));
};
