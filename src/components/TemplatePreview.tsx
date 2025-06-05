
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
    headerPosition?: 'left' | 'center' | 'right';
    footerDesign?: 'simple' | 'detailed' | 'minimal';
    footerPosition?: 'left' | 'center' | 'right';
    footerEnabled?: boolean;
    showGst: boolean;
    showContact: boolean;
    showLogo: boolean;
    logoUrl?: string;
    watermarkText?: string;
    watermarkEnabled?: boolean;
  };
  onLogoUpload?: (url: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ invoice, template, onLogoUpload }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  const {
    headerPosition = 'center',
    footerDesign = 'simple',
    footerPosition = 'center',
    footerEnabled = true,
    watermarkEnabled = false,
    watermarkText = '',
    showGst,
    showContact,
    showLogo
  } = template;

  // Calculate totals using fixed rates
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const gst = showGst ? subtotal * 0.18 : 0;
  const total = subtotal + gst;

  return (
    <div className="bg-white p-2 md:p-4 text-xs md:text-sm print:text-sm relative" style={{ maxHeight: '600px', overflow: 'auto' }}>
      {/* Watermark */}
      {watermarkEnabled && watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div 
            className="text-4xl font-bold text-gray-200 opacity-15 select-none"
            style={{ transform: 'rotate(-45deg)' }}
          >
            {watermarkText}
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div 
          className={`flex flex-col md:flex-row items-center gap-4 ${
            headerPosition === 'center' ? 'text-center justify-center' : 
            headerPosition === 'right' ? 'text-right justify-end' : 
            'text-left justify-start'
          } mb-4 relative`}
        >
          <div className="w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-black">Quotation</h1>
            <p className="font-semibold mb-1 text-black">Sharda Mandap Service</p>
            <p className="text-xs mb-1 text-black">Porbandar Baypass, Jalaram Nagar, Mangrol</p>
            
            {/* GST and Contact on same row */}
            <div className="flex justify-between items-center text-xs mb-1">
              {showGst && <span className="text-black"><span className="font-semibold">GST:</span> 24AOSPP7196L1ZX</span>}
              {showContact && <span className="text-black"><span className="font-semibold">Phone:</span> 98246 86047</span>}
            </div>
          </div>
          
          {showLogo && (
            <div className={`w-16 h-16 border border-gray-300 rounded flex items-center justify-center ${
              headerPosition === 'center' ? 'md:absolute md:right-0' : 
              headerPosition === 'right' ? 'md:absolute md:left-0' : 
              'md:absolute md:right-0'
            }`}>
              {template.logoUrl ? (
                <img 
                  src={template.logoUrl} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <span className="text-xs text-black font-medium">Logo</span>
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
        
        <hr className="my-2 md:my-3 border-gray-300" />
        
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-3">
          <div>
            <p className="font-semibold text-black">Invoice #: <span className="font-normal">{invoice.invoiceNumber}</span></p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-black">Date: <span className="font-normal">{invoice.date}</span></p>
          </div>
          <div>
            <p className="font-semibold text-black">Client: <span className="font-normal">{invoice.partyName}</span></p>
          </div>
        </div>
        
        {/* Main Content Grid - Unified Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3 mb-2 md:mb-3">
          {/* Billing Details - Takes 2 columns */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full border-collapse min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border border-gray-300 font-bold text-black">Sr</th>
                  <th className="p-2 text-left border border-gray-300 font-bold text-black">Description</th>
                  <th className="p-2 text-center border border-gray-300 font-bold text-black">Qty</th>
                  <th className="p-2 text-right border border-gray-300 font-bold text-black">Rate (₹)</th>
                  <th className="p-2 text-right border border-gray-300 font-bold text-black">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border border-gray-300 text-black text-center font-medium">{index + 1}</td>
                    <td className="p-2 border border-gray-300 text-black">{item.description}</td>
                    <td className="p-2 text-center border border-gray-300 text-black font-medium">{item.quantity}</td>
                    <td className="p-2 text-right border border-gray-300 text-black font-medium">{formatNumber(item.rate)}</td>
                    <td className="p-2 text-right border border-gray-300 text-black font-bold">{formatNumber(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount Details - Single Unified Table */}
          <div className="lg:col-span-1">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left font-bold text-black text-sm" colspan="2">
                    Amount Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 p-2 text-black font-medium text-xs">Subtotal:</td>
                  <td className="border border-gray-300 p-2 text-right text-black font-bold text-xs">₹ {formatNumber(subtotal)}</td>
                </tr>
                {showGst && (
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-2 text-black font-medium text-xs">GST (18%):</td>
                    <td className="border border-gray-300 p-2 text-right text-black font-bold text-xs">₹ {formatNumber(gst)}</td>
                  </tr>
                )}
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-2 text-black font-bold text-sm">Total:</td>
                  <td className="border border-gray-300 p-2 text-right text-black font-bold text-sm">₹ {formatNumber(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <hr className="my-2 md:my-3 border-gray-300" />
        
        {footerEnabled && (
          <>
            {footerDesign === 'simple' && (
              <div className={`mt-2 md:mt-4 text-black ${
                footerPosition === 'center' ? 'text-center' : 
                footerPosition === 'right' ? 'text-right' : 'text-left'
              }`}>
                <p className="text-xs font-medium">Generated by Sharda Mandap Service</p>
                {showContact && <p className="text-xs">For inquiries, contact us at: 98246 86047</p>}
              </div>
            )}
            
            {footerDesign === 'detailed' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4 text-black">
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
              <div className={`flex mt-2 md:mt-4 text-black ${
                footerPosition === 'center' ? 'justify-center' : 
                footerPosition === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <div className="text-xs flex items-center space-x-4">
                  <span>Thank you</span>
                  {showContact && <span>98246 86047</span>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;
