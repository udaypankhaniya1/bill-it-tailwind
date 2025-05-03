
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from '@/utils/supabaseClient';

export interface Template {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  font_size_header: string;
  font_size_body: string;
  font_size_footer: string;
  show_gst: boolean;
  show_contact: boolean;
  show_logo: boolean;
  header_position: 'left' | 'center' | 'right';
  table_color: string;
  footer_design: 'simple' | 'detailed' | 'minimal';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  logo_url?: string;
}

export const fetchTemplates = async () => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return data || [];
};

export const fetchTemplate = async (id: string) => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    throw error;
  }

  return data;
};

export const createTemplate = async (template: Omit<Template, 'id' | 'user_id'>) => {
  const newTemplateId = uuidv4();
  
  // Get the user ID before making the database call
  const userId = await getCurrentUserId();
  
  const { error } = await supabase
    .from('templates')
    .insert({
      id: newTemplateId,
      user_id: userId, 
      header_position: template.header_position || 'center',
      table_color: template.table_color || '#f8f9fa',
      footer_design: template.footer_design || 'simple',
      ...template
    });

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }

  return { id: newTemplateId };
};

export const updateTemplate = async (template: Template) => {
  const { error } = await supabase
    .from('templates')
    .update({
      name: template.name,
      primary_color: template.primary_color,
      secondary_color: template.secondary_color,
      font_size_header: template.font_size_header,
      font_size_body: template.font_size_body,
      font_size_footer: template.font_size_footer,
      show_gst: template.show_gst,
      show_contact: template.show_contact,
      show_logo: template.show_logo,
      header_position: template.header_position,
      table_color: template.table_color,
      footer_design: template.footer_design,
      updated_at: new Date().toISOString(),
    })
    .eq('id', template.id);

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }

  return { id: template.id };
};

export const deleteTemplate = async (id: string) => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }

  return { success: true };
};

export const updateTemplateLogo = async (templateId: string, logoUrl: string) => {
  const { error } = await supabase
    .from('templates')
    .update({ logo_url: logoUrl })
    .eq('id', templateId);

  if (error) {
    console.error('Error updating template logo:', error);
    throw error;
  }

  return { id: templateId, logoUrl };
};
