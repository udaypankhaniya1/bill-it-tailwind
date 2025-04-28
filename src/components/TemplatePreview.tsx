import React from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { uploadLogo } from '@/utils/fileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadLogo(file);
      if (url && onLogoUpload) {
        onLogoUpload(url);
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

  return (
    <div className="bg-white p-4 text-sm" style={{ maxHeight: '600px', overflow: 'auto' }}>
      <div 
        className={`flex ${
          headerPosition === 'center' ? 'justify-center text-center' : 
          headerPosition === 'right' ? 'justify-end text-right' : 
          'justify-start text-left'
        } mb-4`}
      >
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>Quotation</h1>
          <p className="font-semibold mb-1">Sharda Mandap Service</p>
          <p className="text-xs mb-1">Porbandar Baypass, Jalaram Nagar, Mangrol</p>
          {showGst && <p className="text-xs mb-1"><span className="font-semibold">GST:</span> 24AOSPP7196L1ZX</p>}
          {showContact && <p className="text-xs mb-1"><span className="font-semibold">Phone:</span> 98246 86047</p>}
        </div>
        {template.showLogo && (
          <div className={`w-16 h-16 border rounded flex items-center justify-center ${
            headerPosition === 'center' ? 'absolute right-8' : 
            headerPosition === 'right' ? 'absolute left-8' : 
            'absolute right-8'
          }`}>
            {template.logoUrl ? (
              <img 
                src={template.logoUrl} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-xs text-gray-400">Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload logo"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <hr className="my-3" style={{ borderColor: `${secondaryColor}40` }} />
      
      <div className="grid grid-cols-2 gap-4 mb-3">
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
      
      <div className="mt-4 mb-3">
        <table className="w-full border-collapse">
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
        <table className="w-64">
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
      
      <hr className="my-3" style={{ borderColor: `${secondaryColor}20` }} />
      
      {footerDesign === 'simple' && (
        <div className="text-center mt-4" style={{ color: secondaryColor }}>
          <p className="text-xs">Generated by Sharda Mandap Service</p>
          {showContact && <p className="text-xs">For inquiries, contact us at: 98246 86047</p>}
        </div>
      )}
      
      {footerDesign === 'detailed' && (
        <div className="grid grid-cols-3 gap-4 mt-4" style={{ color: secondaryColor }}>
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
        <div className="flex justify-between items-center mt-4" style={{ color: secondaryColor }}>
          <div className="text-xs">
            <p>Thank you</p>
          </div>
          <div className="text-xs text-right">
            {showContact && <p>98246 86047</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
