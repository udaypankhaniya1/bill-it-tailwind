import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdfFromElement = async (
  elementId: string,
  fileName: string,
  template?: any
): Promise<{ pdf: jsPDF; dataUrl: string }> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }

  // Temporarily apply print styles to ensure consistency
  const originalStyles = {
    width: element.style.width,
    minHeight: element.style.minHeight,
    padding: element.style.padding,
    backgroundColor: element.style.backgroundColor,
    fontSize: element.style.fontSize,
    lineHeight: element.style.lineHeight
  };

  // Apply PDF-optimized styles
  element.style.width = '210mm';
  element.style.minHeight = '297mm';
  element.style.padding = '20mm';
  element.style.backgroundColor = '#ffffff';
  element.style.fontSize = '12pt';
  element.style.lineHeight = '1.4';

  // Create a canvas from the element with better options for A4
  const canvas = await html2canvas(element, {
    scale: 3, // Higher scale for better quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: 1200,
    windowHeight: 1600
  });

  // Restore original styles
  Object.assign(element.style, originalStyles);
  
  const imgData = canvas.toDataURL('image/png');
  
  // Create PDF with A4 dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;
  
  // Calculate image dimensions to fit A4 properly
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = a4Width;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  // If the content is taller than A4, scale it down to fit
  if (pdfHeight > a4Height) {
    const scale = a4Height / pdfHeight;
    const scaledWidth = pdfWidth * scale;
    const scaledHeight = a4Height;
    
    // Center the scaled content
    const xOffset = (a4Width - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
  } else {
    // Center vertically if content is shorter than A4
    const yOffset = (a4Height - pdfHeight) / 2;
    pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
  }
  
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
    const res = await fetch(pdfDataUrl);
    const blob = await res.blob();
    
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
    
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
  formattedAmount: string,
  messageTemplate?: string
) => {
  // Use custom template if provided, otherwise use default
  const template = messageTemplate || `📋 *Invoice #{{invoice_number}}*

🏢 *Client:* {{client_name}}
💰 *Total Amount:* ₹{{total_amount}}

🔗 *View PDF:* {{invoice_link}}

Please check the invoice details in the attached PDF link.`;

  // Replace variables in the template
  const message = template
    .replace(/{{invoice_number}}/g, invoiceNumber)
    .replace(/{{client_name}}/g, partyName)
    .replace(/{{total_amount}}/g, formattedAmount)
    .replace(/{{invoice_link}}/g, publicUrl);
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};
