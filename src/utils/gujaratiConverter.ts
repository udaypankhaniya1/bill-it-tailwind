
// Convert numbers to Gujarati
export const toGujaratiNumber = (num: number | string): string => {
  if (num === undefined || num === null) return '';
  
  const numStr = num.toString();
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  
  return numStr.replace(/\d/g, (match) => {
    return gujaratiDigits[parseInt(match)];
  });
};

// Convert currency format to Gujarati
export const toGujaratiCurrency = (num: number | string): string => {
  if (num === undefined || num === null) return '';
  
  const formattedNum = typeof num === 'number' ? num.toLocaleString('en-IN') : num;
  return toGujaratiNumber(formattedNum);
};

// Basic Gujarati translations for invoice-related terms
export const gujaratiTerms = {
  subtotal: 'પેટા સરવાળો',
  total: 'કુલ',
  gst: 'જીએસટી',
  quantity: 'જથ્થો',
  rate: 'દર',
  unit: 'એકમ',
  description: 'વર્ણન',
  date: 'તારીખ',
  invoice: 'બિલ',
  party: 'પાર્ટી'
};
