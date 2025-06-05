
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchInvoice, Invoice } from '@/services/invoiceService';
import InvoicePreview from '@/components/InvoicePreview';
import { useToast } from '@/hooks/use-toast';
import { FileText, Share, Link, Languages } from 'lucide-react';
import { formatNumber } from '@/utils/formatNumber';
import { generatePdfFromElement, uploadPdfToStorage, sharePdfViaWhatsApp } from '@/utils/pdfStorage';

const InvoiceViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGujarati, setIsGujarati] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await fetchInvoice(id);

        const transformedInvoice = {
          ...data,
          invoiceNumber: data.invoice_number,
          partyName: data.party_name,
          createdAt: data.created_at || '',
          updatedAt: data.updated_at || '',
        };

        setInvoice(transformedInvoice as any);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          variant: "destructive",
          title: "Failed to load invoice",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id, toast]);

  const exportAsPDF = async () => {
    if (!invoice) return;
    
    toast({
      title: "Preparing PDF...",
      description: "Please wait while we generate your PDF",
    });

    try {
      const { pdf } = await generatePdfFromElement(
        'invoice-preview',
        `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      pdf.save(`Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}.pdf`);
      
      toast({
        title: "PDF Exported Successfully",
        description: "Your invoice has been exported as PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: "destructive",
        title: "Failed to export PDF",
        description: "An error occurred while generating the PDF",
      });
    }
  };

  const exportAsDoc = () => {
    if (!invoice) return;

    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}${isGujarati ? ' - Gujarati' : ''}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              ${isGujarati ? 'font-family: "Noto Sans Gujarati", Arial, sans-serif;' : ''}
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0;
            }
            th, td { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            hr { border: 1px solid #333; margin: 15px 0; }
          </style>
        </head>
        <body>
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Document Exported Successfully",
      description: "Your invoice has been exported as a Word document",
    });
  };

  const shareToWhatsApp = async () => {
    if (!invoice) return;
    
    try {
      // Show loading toast
      toast({
        title: "Preparing invoice for sharing...",
        description: "This may take a moment",
      });
      
      setIsExporting(true);
      
      // Generate PDF
      const { dataUrl } = await generatePdfFromElement(
        'invoice-preview', 
        `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      // Upload to Supabase storage
      const publicUrl = await uploadPdfToStorage(
        dataUrl, 
        `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      // Save the URL for later use
      setPdfUrl(publicUrl);
      
      // Share via WhatsApp
      sharePdfViaWhatsApp(
        publicUrl,
        invoice.invoice_number,
        invoice.party_name,
        invoice.total,
        formatNumber(invoice.total)
      );
      
      toast({
        title: "Ready to share",
        description: "WhatsApp will open with your invoice link",
      });
    } catch (error) {
      console.error('Error preparing share:', error);
      toast({
        variant: "destructive",
        title: "Failed to prepare sharing",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyPdfLinkToClipboard = async () => {
    if (!invoice) return;
    
    try {
      let urlToCopy = pdfUrl;
      
      // If we don't have a PDF URL yet, generate one
      if (!urlToCopy) {
        toast({
          title: "Preparing PDF link...",
          description: "This may take a moment",
        });
        
        setIsExporting(true);
        
        // Generate PDF
        const { dataUrl } = await generatePdfFromElement(
          'invoice-preview', 
          `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
        );
        
        // Upload to Supabase storage
        urlToCopy = await uploadPdfToStorage(
          dataUrl, 
          `Invoice-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
        );
        
        // Save the URL for later use
        setPdfUrl(urlToCopy);
      }
      
      // Copy to clipboard
      await navigator.clipboard.writeText(urlToCopy);
      
      toast({
        title: "Link copied to clipboard",
        description: "You can now paste it anywhere",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        variant: "destructive",
        title: "Failed to copy link",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">Invoice Details</h2>
          <Button onClick={() => navigate('/invoices')} variant="outline">Back to Invoices</Button>
        </div>
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading invoice...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">Invoice Not Found</h2>
          <Button onClick={() => navigate('/invoices')} variant="outline">Back to Invoices</Button>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-red-500 mb-4">Invoice not found or has been deleted</p>
            <Button onClick={() => navigate('/invoices')}>View All Invoices</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Invoice #{invoice?.invoice_number}</h2>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button onClick={() => navigate('/invoices')} variant="outline">Back</Button>
          <Button onClick={exportAsDoc} variant="outline">
            <FileText className="mr-2" /> Export as Doc
          </Button>
          <Button onClick={exportAsPDF} variant="outline">
            <FileText className="mr-2" /> Export as PDF
          </Button>
          <Button 
            onClick={shareToWhatsApp} 
            variant="outline" 
            disabled={isExporting}
          >
            <Share className="mr-2" /> 
            {isExporting ? "Preparing..." : "Share to WhatsApp"}
          </Button>
          <Button 
            onClick={copyPdfLinkToClipboard} 
            variant="outline"
            disabled={isExporting}
          >
            <Link className="mr-2" /> 
            {isExporting ? "Preparing..." : "Copy PDF Link"}
          </Button>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <Languages className="h-4 w-4" />
        <Label htmlFor="language-toggle" className="text-sm font-medium">
          Generate in Gujarati
        </Label>
        <Switch
          id="language-toggle"
          checked={isGujarati}
          onCheckedChange={setIsGujarati}
        />
        <span className="text-sm text-gray-600">
          {isGujarati ? 'Gujarati' : 'English'}
        </span>
      </div>
      
      <div id="invoice-preview" className="mb-8">
        <InvoicePreview invoice={invoice as any} isGujarati={isGujarati} />
      </div>
    </div>
  );
};

export default InvoiceViewPage;
