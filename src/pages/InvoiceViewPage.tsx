import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchInvoice, Invoice } from '@/services/invoiceService';
import { fetchTemplates, Template } from '@/services/templateService';
import InvoicePreview from '@/components/InvoicePreview';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FileText, Share, Link, Languages, Settings } from 'lucide-react';
import { formatNumber } from '@/utils/formatNumber';
import { generatePdfFromElement, uploadPdfToStorage, sharePdfViaWhatsApp } from '@/utils/pdfStorage';

const InvoiceViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGujarati, setIsGujarati] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<'Bill' | 'Quotation'>('Quotation');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the custom WhatsApp message template from Redux
  const whatsappMessageTemplate = useSelector((state: RootState) => state.template.whatsappMessageTemplate);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // Load invoice
        const invoiceData = await fetchInvoice(id);
        const transformedInvoice = {
          ...invoiceData,
          invoiceNumber: invoiceData.invoice_number,
          partyName: invoiceData.party_name,
          createdAt: invoiceData.created_at || '',
          updatedAt: invoiceData.updated_at || '',
        };
        setInvoice(transformedInvoice as any);

        // Load templates
        try {
          const templatesData = await fetchTemplates();
          if (templatesData && templatesData.length > 0) {
            const formattedTemplates = templatesData.map(template => ({
              id: template.id,
              name: template.name,
              primary_color: template.primary_color,
              secondary_color: template.secondary_color,
              font_size_header: template.font_size_header,
              font_size_body: template.font_size_body,
              font_size_footer: template.font_size_footer,
              show_gst: template.show_gst,
              show_contact: template.show_contact,
              show_logo: template.show_logo,
              header_position: (template.header_position || 'center') as 'left' | 'center' | 'right',
              table_color: template.table_color || '#f8f9fa',
              footer_design: (template.footer_design || 'simple') as 'simple' | 'detailed' | 'minimal',
              footer_position: (template.footer_position || 'center') as 'left' | 'center' | 'right',
              footer_enabled: template.footer_enabled ?? true,
              watermark_text: template.watermark_text || '',
              watermark_enabled: template.watermark_enabled ?? false,
              logo_url: template.logo_url
            }));
            setTemplates(formattedTemplates);
            setSelectedTemplateId(formattedTemplates[0].id);
          }
        } catch (templateError) {
          console.warn('Could not load templates:', templateError);
          // Set default template if loading fails
          const defaultTemplate: Template = {
            id: 'default',
            name: 'Default Template',
            primary_color: '#000000',
            secondary_color: '#666666',
            font_size_header: 'text-2xl',
            font_size_body: 'text-base',
            font_size_footer: 'text-sm',
            show_gst: true,
            show_contact: true,
            show_logo: true,
            header_position: 'center',
            table_color: '#f8f9fa',
            footer_design: 'simple',
            footer_position: 'center',
            footer_enabled: true,
            watermark_text: '',
            watermark_enabled: false,
            logo_url: ''
          };
          setTemplates([defaultTemplate]);
          setSelectedTemplateId('default');
        }
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

    loadData();
  }, [id, toast]);

  // Get selected template
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const exportAsPDF = async () => {
    if (!invoice) return;
    
    toast({
      title: "Preparing PDF...",
      description: "Please wait while we generate your PDF",
    });

    try {
      const previewElement = document.getElementById('invoice-preview');
      if (previewElement) {
        previewElement.style.width = '210mm';
        previewElement.style.minHeight = '297mm';
        previewElement.style.padding = '20mm';
        previewElement.style.backgroundColor = 'white';
        previewElement.style.fontSize = '12pt';
        previewElement.style.lineHeight = '1.4';
      }

      const { pdf } = await generatePdfFromElement(
        'invoice-preview',
        `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      if (previewElement) {
        previewElement.style.width = '';
        previewElement.style.minHeight = '';
        previewElement.style.padding = '';
        previewElement.style.backgroundColor = '';
        previewElement.style.fontSize = '';
        previewElement.style.lineHeight = '';
      }
      
      pdf.save(`${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}.pdf`);
      
      toast({
        title: "PDF Exported Successfully",
        description: `Your ${documentTitle.toLowerCase()} has been exported as PDF`,
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
          <title>${documentTitle} ${invoice.invoice_number}${isGujarati ? ' - Gujarati' : ''}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              line-height: 1.4;
              font-size: 12pt;
              ${isGujarati ? 'font-family: "Noto Sans Gujarati", Arial, sans-serif;' : ''}
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0;
              page-break-inside: avoid;
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
            h1, h2 { page-break-after: avoid; }
            .page-break { page-break-before: always; }
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
    link.download = `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Document Exported Successfully",
      description: `Your ${documentTitle.toLowerCase()} has been exported as a Word document`,
    });
  };

  const shareToWhatsApp = async () => {
    if (!invoice) return;
    
    try {
      toast({
        title: "Preparing invoice for sharing...",
        description: "This may take a moment",
      });
      
      setIsExporting(true);
      
      const previewElement = document.getElementById('invoice-preview');
      if (previewElement) {
        previewElement.style.width = '210mm';
        previewElement.style.minHeight = '297mm';
        previewElement.style.padding = '20mm';
        previewElement.style.backgroundColor = 'white';
        previewElement.style.fontSize = '12pt';
        previewElement.style.lineHeight = '1.4';
      }
      
      const { dataUrl } = await generatePdfFromElement(
        'invoice-preview', 
        `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      if (previewElement) {
        previewElement.style.width = '';
        previewElement.style.minHeight = '';
        previewElement.style.padding = '';
        previewElement.style.backgroundColor = '';
        previewElement.style.fontSize = '';
        previewElement.style.lineHeight = '';
      }
      
      const publicUrl = await uploadPdfToStorage(
        dataUrl, 
        `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
      );
      
      setPdfUrl(publicUrl);
      
      sharePdfViaWhatsApp(
        publicUrl,
        invoice.invoice_number,
        invoice.party_name,
        invoice.total,
        formatNumber(invoice.total),
        whatsappMessageTemplate
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
      
      if (!urlToCopy) {
        toast({
          title: "Preparing PDF link...",
          description: "This may take a moment",
        });
        
        setIsExporting(true);
        
        const previewElement = document.getElementById('invoice-preview');
        if (previewElement) {
          previewElement.style.width = '210mm';
          previewElement.style.minHeight = '297mm';
          previewElement.style.padding = '20mm';
          previewElement.style.backgroundColor = 'white';
          previewElement.style.fontSize = '12pt';
          previewElement.style.lineHeight = '1.4';
        }
        
        const { dataUrl } = await generatePdfFromElement(
          'invoice-preview', 
          `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
        );
        
        if (previewElement) {
          previewElement.style.width = '';
          previewElement.style.minHeight = '';
          previewElement.style.padding = '';
          previewElement.style.backgroundColor = '';
          previewElement.style.fontSize = '';
          previewElement.style.lineHeight = '';
        }
        
        urlToCopy = await uploadPdfToStorage(
          dataUrl, 
          `${documentTitle}-${invoice.invoice_number}${isGujarati ? '-Gujarati' : ''}`
        );
        
        setPdfUrl(urlToCopy);
      }
      
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
        <h2 className="text-3xl font-bold">{documentTitle} #{invoice?.invoice_number}</h2>
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

      {/* Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Document Title Toggle */}
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <Label htmlFor="document-title" className="text-sm font-medium">Document Type</Label>
          <Select value={documentTitle} onValueChange={(value) => setDocumentTitle(value as 'Bill' | 'Quotation')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Quotation">Quotation</SelectItem>
              <SelectItem value="Bill">Bill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Selection */}
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <Label htmlFor="template-select" className="text-sm font-medium">Template</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center space-x-2">
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
      </div>
      
      <div id="invoice-preview" className="mb-8">
        <InvoicePreview 
          invoice={invoice as any} 
          isGujarati={isGujarati}
          documentTitle={documentTitle}
          template={{
            showGst: selectedTemplate?.show_gst ?? true,
            showContact: selectedTemplate?.show_contact ?? true,
            showLogo: selectedTemplate?.show_logo ?? true,
            headerPosition: selectedTemplate?.header_position || 'center',
            footerDesign: selectedTemplate?.footer_design || 'simple',
            footerPosition: selectedTemplate?.footer_position || 'center',
            footerEnabled: selectedTemplate?.footer_enabled ?? true,
            watermarkText: selectedTemplate?.watermark_text || '',
            watermarkEnabled: selectedTemplate?.watermark_enabled ?? false,
            logoUrl: selectedTemplate?.logo_url
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceViewPage;
