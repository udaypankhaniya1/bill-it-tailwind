
import { supabase } from '@/integrations/supabase/client';

export interface Description {
  id: string;
  english_text: string;
  gujarati_text: string;
  created_at: string;
  updated_at: string;
}

export const fetchDescriptions = async (searchTerm: string = ''): Promise<Description[]> => {
  try {
    let query = supabase
      .from('item_descriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm.trim()) {
      query = query.or(`english_text.ilike.%${searchTerm}%,gujarati_text.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching descriptions:', error);
      throw error;
    }

    // Return only user-added descriptions, no default items
    return data || [];
  } catch (error) {
    console.error('Error in fetchDescriptions:', error);
    throw error;
  }
};

export const createDescription = async (
  englishText: string,
  gujaratiText?: string
): Promise<Description> => {
  try {
    const { data, error } = await supabase
      .from('item_descriptions')
      .insert({
        english_text: englishText,
        gujarati_text: gujaratiText || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating description:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createDescription:', error);
    throw error;
  }
};

export const updateDescription = async (
  id: string,
  englishText: string,
  gujaratiText?: string
): Promise<Description> => {
  try {
    const { data, error } = await supabase
      .from('item_descriptions')
      .update({
        english_text: englishText,
        gujarati_text: gujaratiText || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating description:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateDescription:', error);
    throw error;
  }
};

export const deleteDescription = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('item_descriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting description:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDescription:', error);
    throw error;
  }
};

export const saveDescription = async (description: {
  id?: string;
  english_text: string;
  gujarati_text: string;
}): Promise<Description> => {
  if (description.id) {
    return updateDescription(description.id, description.english_text, description.gujarati_text);
  } else {
    return createDescription(description.english_text, description.gujarati_text);
  }
};
