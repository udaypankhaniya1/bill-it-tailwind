
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
  return '₹ ' + toGujaratiNumber(formattedNum);
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
  party: 'પાર્ટી',
  items: 'આઇટમ્સ',
  summary: 'સારાંશ',
  preview: 'પૂર્વાવલોકન',
  save: 'સાચવો',
  edit: 'સંપાદિત કરો',
  add: 'ઉમેરો',
  remove: 'દૂર કરો',
  search: 'શોધ',
  confirm: 'પુષ્ટિ કરો',
  cancel: 'રદ કરો',
  original: 'મૂળ',
  translated: 'અનુવાદિત',
  yes: 'હા',
  no: 'ના',
  close: 'બંધ કરો',
  open: 'ખોલો',
  select: 'પસંદ કરો',
  edit_translation: 'અનુવાદ સંપાદિત કરો',
  save_translation: 'અનુવાદ સાચવો',
  customer: 'ગ્રાહક',
  address: 'સરનામું',
  phone: 'ફોન',
  email: 'ઇમેલ',
  payment_status: 'ચુકવણી સ્થિતિ',
  payment_method: 'ચુકવણી પદ્ધતિ',
  paid: 'ચૂકવેલ',
  unpaid: 'અચૂકવેલ',
  partially_paid: 'આંશિક ચૂકવેલ'
};

// Months in Gujarati
export const gujaratiMonths = [
  'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 
  'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 
  'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
];

// Format date in Gujarati
export const toGujaratiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  
  return `${toGujaratiNumber(day)} ${gujaratiMonths[month]}, ${toGujaratiNumber(year)}`;
};

// Units in Gujarati
export const gujaratiUnits = {
  'pcs': 'નંગ',
  'kg': 'કિલો',
  'g': 'ગ્રામ',
  'l': 'લિટર',
  'ml': 'મિલિ',
  'day': 'દિવસ',
  'hour': 'કલાક',
  'month': 'મહિનો',
  'year': 'વર્ષ',
  'ft': 'ફૂટ',
  'm': 'મીટર',
  'cm': 'સેમી',
  'sqft': 'ચો.ફૂટ',
  'sqm': 'ચો.મી',
  'dozen': 'ડઝન',
  'box': 'બોક્સ',
  'pair': 'જોડી',
  'set': 'સેટ',
  'unit': 'યુનિટ',
  'person': 'વ્યક્તિ',
  'qty': 'જથ્થો'
};

// Convert unit to Gujarati
export const toGujaratiUnit = (unit: string): string => {
  return gujaratiUnits[unit.toLowerCase()] || unit;
};

