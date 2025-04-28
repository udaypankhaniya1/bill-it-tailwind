
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchInvoice, Invoice } from '@/services/invoiceService';
import InvoicePreview from '@/components/InvoicePreview';
import { useToast } from '@/hooks/use-toast';
import { FileText, Share } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await fetchInvoice(id);

        // Transform the data structure to match what InvoicePreview expects
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
    
    const invoiceElement = document.getElementById('invoice-preview');
    if (!invoiceElement) return;

    toast({
      title: "Preparing PDF...",
      description: "Please wait while we generate your PDF",
    });

    try {
      const canvas = await html2canvas(invoiceElement, {
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
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
      
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

    // Create a blob with HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
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
    link.download = `Invoice-${invoice.invoice_number}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Document Exported Successfully",
      description: "Your invoice has been exported as a Word document",
    });
  };

  const shareToWhatsApp = () => {
    if (!invoice) return;
    
    const text = `Invoice #${invoice.invoice_number} for ${invoice.party_name}. Total Amount: ₹${invoice.total}`;
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
    
    window.open(whatsappUrl, '_blank');
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
        <h2 className="text-3xl font-bold">Invoice #{invoice.invoice_number}</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/invoices')} variant="outline">Back</Button>
          <Button onClick={exportAsDoc} variant="outline">
            <FileText className="mr-2" /> Export as Doc
          </Button>
          <Button onClick={exportAsPDF} variant="outline">
            <FileText className="mr-2" /> Export as PDF
          </Button>
          <Button onClick={shareToWhatsApp} variant="outline">
            <Share className="mr-2" /> Share to WhatsApp
          </Button>
        </div>
      </div>
      
      <div id="invoice-preview" className="mb-8">
        <InvoicePreview invoice={invoice as any} />
      </div>
    </div>
  );
};

export default InvoiceViewPage;
