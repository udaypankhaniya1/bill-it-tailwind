
import { supabase } from '@/integrations/supabase/client';

export const uploadLogo = async (file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    console.log('Uploading logo to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('template-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('template-assets')
      .getPublicUrl(filePath);

    console.log('Logo uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadLogo:', error);
    return null;
  }
};

export const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return null;
  }
};

export const deleteOldDocuments = async (folder: string, pattern?: string): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('documents')
      .list(folder);

    if (error) {
      console.error('Error listing files:', error);
      return;
    }

    const filesToDelete = pattern ? 
      files.filter(file => file.name.includes(pattern)) : 
      files;
    
    if (filesToDelete.length === 0) return;

    const filePaths = filesToDelete.map(file => `${folder}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove(filePaths);

    if (deleteError) {
      console.error('Error deleting files:', deleteError);
    }
  } catch (error) {
    console.error('Error in deleteOldDocuments:', error);
  }
};

export const applyWatermark = async (
  imageUrl: string, 
  watermarkText: string = 'Sharda Mandap Service'
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      ctx.font = `${Math.max(20, img.width * 0.03)}px Arial`;
      ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
      
      const watermarkedImg = canvas.toDataURL('image/jpeg');
      resolve(watermarkedImg);
    };
    
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};
