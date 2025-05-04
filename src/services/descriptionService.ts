
import { supabase } from '@/integrations/supabase/client';

export interface DescriptionData {
  id?: string;
  english_text: string;
  gujarati_text: string;
}

// Fetch descriptions with optional search term
export const fetchDescriptions = async (searchTerm: string = '') => {
  let query = supabase
    .from('item_descriptions')
    .select('*')
    .order('created_at', { ascending: false });
    
  // Add search filter if provided
  if (searchTerm) {
    query = query.or(`english_text.ilike.%${searchTerm}%,gujarati_text.ilike.%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching descriptions:', error);
    throw error;
  }
  
  return data;
};

// Fetch a single description by ID
export const fetchDescription = async (id: string) => {
  const { data, error } = await supabase
    .from('item_descriptions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching description:', error);
    throw error;
  }
  
  return data;
};

// Save a description (create new or update existing)
export const saveDescription = async (description: DescriptionData) => {
  if (description.id) {
    // Update existing
    const { data, error } = await supabase
      .from('item_descriptions')
      .update({
        english_text: description.english_text,
        gujarati_text: description.gujarati_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', description.id)
      .select();
      
    if (error) {
      console.error('Error updating description:', error);
      throw error;
    }
    
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('item_descriptions')
      .insert({
        english_text: description.english_text,
        gujarati_text: description.gujarati_text
      })
      .select();
      
    if (error) {
      console.error('Error creating description:', error);
      throw error;
    }
    
    return data;
  }
};

// Delete a description
export const deleteDescription = async (id: string) => {
  const { error } = await supabase
    .from('item_descriptions')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting description:', error);
    throw error;
  }
  
  return true;
};
