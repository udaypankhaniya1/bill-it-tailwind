
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdfFromElement = async (
  elementId: string,
  fileName: string
): Promise<{ pdf: jsPDF; dataUrl: string }> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }

  // Create a canvas from the element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  // Return both the PDF object and the data URL
  return {
    pdf,
    dataUrl: pdf.output('datauristring')
  };
};

export const uploadPdfToStorage = async (
  pdfDataUrl: string, 
  fileName: string
): Promise<string> => {
  try {
    // Convert data URL to Blob
    const res = await fetch(pdfDataUrl);
    const blob = await res.blob();
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('invoice_pdfs')
      .upload(uniqueFileName, blob, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('invoice_pdfs')
      .getPublicUrl(uniqueFileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPdfToStorage:', error);
    throw error;
  }
};

export const sharePdfViaWhatsApp = (
  publicUrl: string, 
  invoiceNumber: string,
  partyName: string,
  amount: number,
  formattedAmount: string
) => {
  // Create the message text
  const message = `📋 *Invoice #${invoiceNumber}*\n\n🏢 *Client:* ${partyName}\n💰 *Total Amount:* ₹${formattedAmount}\n\n🔗 *View PDF:* ${publicUrl}\n\nPlease check the invoice details in the attached PDF link.`;
  
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Construct the WhatsApp URL
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank');
};
