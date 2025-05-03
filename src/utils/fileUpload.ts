
import { supabase } from '@/integrations/supabase/client';

export const uploadLogo = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('template-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('template-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadLogo:', error);
    return null;
  }
};

export const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
  try {
    // Remove old files if they exist (based on user ID or some identifier)
    // This would require knowing which file to replace
    // await deleteOldDocuments(folder);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload the new file
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
    // List files in the folder with the specified pattern
    const { data: files, error } = await supabase.storage
      .from('documents')
      .list(folder);

    if (error) {
      console.error('Error listing files:', error);
      return;
    }

    // Filter files if pattern is provided
    const filesToDelete = pattern ? 
      files.filter(file => file.name.includes(pattern)) : 
      files;
    
    if (filesToDelete.length === 0) return;

    // Delete the files
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
  // We'll use a canvas to apply the watermark
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl); // Return original if context fails
        return;
      }
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Set watermark properties
      ctx.font = `${Math.max(20, img.width * 0.03)}px Arial`;
      ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add diagonal watermark
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4); // 45 degree angle
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
      
      // Get the watermarked image as base64
      const watermarkedImg = canvas.toDataURL('image/jpeg');
      resolve(watermarkedImg);
    };
    
    img.onerror = () => resolve(imageUrl); // Return original on error
    img.src = imageUrl;
  });
};
