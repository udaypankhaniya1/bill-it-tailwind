
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
  invoiceId: string
): Promise<string> => {
  try {
    // Convert data URL to Blob
    const res = await fetch(pdfDataUrl);
    const blob = await res.blob();
    
    // Use invoice ID as filename for deduplication
    const uniqueFileName = `invoice-${invoiceId}.pdf`;
    
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

// Interface for WhatsApp message customization
export interface WhatsAppMessageConfig {
  customMessage?: string;
  includeInvoiceNumber?: boolean;
  includePartyName?: boolean;
  includeAmount?: boolean;
}

export const sharePdfViaWhatsApp = (
  publicUrl: string, 
  invoiceNumber: string,
  partyName: string,
  amount: number,
  formattedAmount: string,
  config: WhatsAppMessageConfig = {}
) => {
  // Default configuration
  const defaultConfig = {
    customMessage: "Please check the invoice details in the attached PDF link.",
    includeInvoiceNumber: true,
    includePartyName: true,
    includeAmount: true
  };
  
  // Merge provided config with defaults
  const finalConfig = { ...defaultConfig, ...config };
  
  // Build the message parts
  let messageParts = [];
  
  // Add invoice number if configured
  if (finalConfig.includeInvoiceNumber) {
    messageParts.push(`📋 *Invoice #${invoiceNumber}*\n`);
  }
  
  // Add party name if configured
  if (finalConfig.includePartyName) {
    messageParts.push(`🏢 *Client:* ${partyName}\n`);
  }
  
  // Add amount if configured
  if (finalConfig.includeAmount) {
    messageParts.push(`💰 *Total Amount:* ₹${formattedAmount}\n`);
  }
  
  // Add PDF link
  messageParts.push(`\n🔗 *View PDF:* ${publicUrl}\n\n`);
  
  // Add custom message
  messageParts.push(finalConfig.customMessage);
  
  // Create the message text
  const message = messageParts.join('');
  
  // Encode the message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Construct the WhatsApp URL
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank');
};
