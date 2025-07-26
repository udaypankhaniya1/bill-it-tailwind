import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/utils/supabaseClient";

interface GeminiApiKeyResponse {
  api_key?: string;
  error?: string;
}

export const getGeminiApiKey = async (): Promise<GeminiApiKeyResponse> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { error: 'User not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching Gemini API key:', error);
      return { error: error.message };
    }
    
    return { api_key: data?.gemini_api_key || '' };
  } catch (error) {
    console.error('Exception fetching Gemini API key:', error);
    return { error: 'Failed to fetch API key' };
  }
};

export const updateGeminiApiKey = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Check if user settings record exists
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId);
    
    let result;
    
    if (existingSettings && existingSettings.length > 0) {
      // Update existing record
      result = await supabase
        .from('user_settings')
        .update({ gemini_api_key: apiKey })
        .eq('user_id', userId);
    } else {
      // Insert new record
      result = await supabase
        .from('user_settings')
        .insert({ user_id: userId, gemini_api_key: apiKey });
    }
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exception updating Gemini API key:', error);
    return { success: false, error: 'Failed to update API key' };
  }
};

export const callGeminiAI = async (text: string, action: 'enhance' | 'translate' | 'multilang' = 'enhance'): Promise<{ enhancedText?: string; translatedText?: string; translations?: any; error?: string }> => {
  try {
    const { api_key, error } = await getGeminiApiKey();
    
    if (error || !api_key) {
      return { error: error || 'No API key found' };
    }
    
    const response = await supabase.functions.invoke('gemini-ai', {
      body: JSON.stringify({ text, apiKey: api_key, action }),
    });
    
    if (response.error) {
      return { error: response.error.message || `Failed to call Gemini AI for ${action}` };
    }
    
    if (action === 'translate') {
      return { translatedText: response.data.translatedText };
    } else {
      return { enhancedText: response.data.enhancedText };
    }
  } catch (error) {
    console.error(`Exception calling Gemini AI for ${action}:`, error);
    return { error: `Failed to call Gemini AI for ${action}` };
  }
};
