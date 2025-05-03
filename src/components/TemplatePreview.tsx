
import React, { useState } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { uploadLogo, applyWatermark } from '@/utils/fileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TemplatePreviewProps {
  invoice: {
    invoiceNumber: string;
    partyName: string;
    date: string;
    total: number;
    items: {
      id: string;
      description: string;
      quantity: number;
      rate: number;
      total: number;
    }[];
  };
  template: {
    primaryColor: string;
    secondaryColor: string;
    tableColor?: string;
    headerPosition?: 'left' | 'center' | 'right';
    footerDesign?: 'simple' | 'detailed' | 'minimal';
    showGst: boolean;
    showContact: boolean;
    showLogo: boolean;
    logoUrl?: string;
  };
  onLogoUpload?: (url: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ invoice, template, onLogoUpload }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkedLogo, setWatermarkedLogo] = useState<string | null>(null);
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadLogo(file);
      if (url && onLogoUpload) {
        onLogoUpload(url);
        
        // Apply watermark if enabled
        if (showWatermark) {
          const watermarkedUrl = await applyWatermark(url);
          setWatermarkedLogo(watermarkedUrl);
        }
        
        toast({
          title: "Logo uploaded successfully",
          description: "Your template has been updated with the new logo.",
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error uploading logo",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const toggleWatermark = async () => {
    setShowWatermark(!showWatermark);
    
    if (!showWatermark && template.logoUrl) {
      // Apply watermark when enabling
      const watermarkedUrl = await applyWatermark(template.logoUrl);
      setWatermarkedLogo(watermarkedUrl);
    } else {
      // Remove watermark when disabling
      setWatermarkedLogo(null);
    }
  };

  const {
    primaryColor,
    secondaryColor,
    tableColor = '#f8f9fa',
    headerPosition = 'center',
    footerDesign = 'simple',
    showGst,
    showContact,
    showLogo
  } = template;

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const gst = showGst ? subtotal * 0.18 : 0;
  const total = subtotal + gst;
  
  // Determine the logo URL to use (watermarked or original)
  const displayLogoUrl = showWatermark && watermarkedLogo ? watermarkedLogo : template.logoUrl;

  return (
    <div className="bg-white p-2 md:p-4 text-xs md:text-sm print:text-sm" style={{ maxHeight: '600px', overflow: 'auto' }}>
      <div 
        className={`flex flex-col md:flex-row items-center gap-4 ${
          headerPosition === 'center' ? 'text-center justify-center' : 
          headerPosition === 'right' ? 'text-right justify-end' : 
          'text-left justify-start'
        } mb-4 relative`}
      >
        <div className="w-full md:w-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2" style={{ color: primaryColor }}>Quotation</h1>
          <p className="font-semibold mb-1">Sharda Mandap Service</p>
          <p className="text-xs mb-1">Porbandar Baypass, Jalaram Nagar, Mangrol</p>
          {showGst && <p className="text-xs mb-1"><span className="font-semibold">GST:</span> 24AOSPP7196L1ZX</p>}
          {showContact && <p className="text-xs mb-1"><span className="font-semibold">Phone:</span> 98246 86047</p>}
        </div>
        {template.showLogo && (
          <div className={`w-16 h-16 border rounded flex items-center justify-center ${
            headerPosition === 'center' ? 'md:absolute md:right-0' : 
            headerPosition === 'right' ? 'md:absolute md:left-0' : 
            'md:absolute md:right-0'
          }`}>
            {displayLogoUrl ? (
              <img 
                src={displayLogoUrl} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <>
                    <span className="text-xs text-gray-400">Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload logo"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <hr className="my-2 md:my-3" style={{ borderColor: `${secondaryColor}40` }} />
      
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-3">
        <div>
          <p className="font-semibold">Invoice #: <span className="font-normal">{invoice.invoiceNumber}</span></p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Date: <span className="font-normal">{invoice.date}</span></p>
        </div>
        <div>
          <p className="font-semibold">Client: <span className="font-normal">{invoice.partyName}</span></p>
        </div>
      </div>
      
      <div className="mt-3 mb-2 md:mb-3 overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
              <th className="p-1 text-left border">Sr</th>
              <th className="p-1 text-left border">Description</th>
              <th className="p-1 text-center border">Qty</th>
              <th className="p-1 text-right border">Rate (₹)</th>
              <th className="p-1 text-right border">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? tableColor : 'white' }}>
                <td className="p-1 border">{index + 1}</td>
                <td className="p-1 border">{item.description}</td>
                <td className="p-1 text-center border">{item.quantity}</td>
                <td className="p-1 text-right border">{formatNumber(item.rate)}</td>
                <td className="p-1 text-right border">{formatNumber(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end">
        <table className="w-full md:w-64">
          <tbody>
            <tr>
              <td className="py-1 font-semibold">Subtotal:</td>
              <td className="py-1 text-right">₹ {formatNumber(subtotal)}</td>
            </tr>
            {showGst && (
              <tr>
                <td className="py-1 font-semibold">GST (18%):</td>
                <td className="py-1 text-right">₹ {formatNumber(gst)}</td>
              </tr>
            )}
            <tr style={{ color: primaryColor }}>
              <td className="py-1 font-bold">Total:</td>
              <td className="py-1 text-right font-bold">₹ {formatNumber(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <hr className="my-2 md:my-3" style={{ borderColor: `${secondaryColor}20` }} />
      
      {footerDesign === 'simple' && (
        <div className="text-center mt-2 md:mt-4" style={{ color: secondaryColor }}>
          <p className="text-xs">Generated by Sharda Mandap Service</p>
          {showContact && <p className="text-xs">For inquiries, contact us at: 98246 86047</p>}
        </div>
      )}
      
      {footerDesign === 'detailed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4" style={{ color: secondaryColor }}>
          <div className="text-xs">
            <p className="font-semibold">Terms & Conditions:</p>
            <p>1. Payment due within 15 days</p>
            <p>2. All prices are inclusive of taxes</p>
          </div>
          <div className="text-xs text-center">
            <p className="font-semibold">Thank You for Your Business!</p>
            <p>Sharda Mandap Service</p>
            {showContact && <p>98246 86047</p>}
          </div>
          <div className="text-xs text-right">
            <p className="font-semibold">Payment Details:</p>
            <p>Bank: Sample Bank Ltd.</p>
            <p>Account: XXXXXXXX</p>
          </div>
        </div>
      )}
      
      {footerDesign === 'minimal' && (
        <div className="flex justify-between items-center mt-2 md:mt-4" style={{ color: secondaryColor }}>
          <div className="text-xs">
            <p>Thank you</p>
          </div>
          <div className="text-xs text-right">
            {showContact && <p>98246 86047</p>}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleWatermark} 
          className="text-xs"
        >
          {showWatermark ? "Remove Watermark" : "Add Watermark"}
        </Button>
      </div>
    </div>
  );
};

export default TemplatePreview;
