
import React, { useState } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { uploadLogo } from '@/utils/fileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

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
      unit?: string;
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
    companyName?: string;
    companyAddress?: string;
    companyMobile?: string;
    companyGstNumber?: string;
  };
  onLogoUpload?: (url: string) => void;
  documentTitle?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  invoice,
  template,
  onLogoUpload,
  documentTitle = 'Quotation'
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log('Starting logo upload for file:', file.name);
      const url = await uploadLogo(file);
      if (url && onLogoUpload) {
        console.log('Logo upload successful, calling onLogoUpload with:', url);
        onLogoUpload(url);
        toast({
          title: "Logo uploaded successfully",
          description: "Your template has been updated with the new logo."
        });
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error uploading logo",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Clear the input so the same file can be uploaded again if needed
      event.target.value = '';
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
    showLogo,
    companyName = 'Sharda Mandap Service',
    companyAddress = 'Porbandar Baypass, Jalaram Nagar, Mangrol',
    companyMobile = '98246 86047',
    companyGstNumber = '24AOSPP7196L1ZX'
  } = template;

  // Calculate totals based on showGst setting
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const gst = showGst ? subtotal * 0.18 : 0;
  const total = subtotal + gst;

  console.log('TemplatePreview render - showLogo:', showLogo, 'logoUrl:', template.logoUrl, 'showGst:', showGst);

  return (
    <div className="bg-white p-2 md:p-4 text-xs md:text-sm print:text-sm relative" style={{
      maxHeight: '600px',
      overflow: 'auto'
    }}>
      {/* Watermark */}
      {watermarkEnabled && watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-4xl font-bold text-gray-200 opacity-15 select-none" style={{
            transform: 'rotate(-45deg)'
          }}>
            {watermarkText}
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header - New Layout with Logo Positioned Above Contact Info */}
        <div className="mb-2 md:mb-3">
          <div className="flex justify-between items-start">
            {/* Main Header Content - Takes up most space */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-black text-center">{documentTitle}</h1>
              <p className="font-semibold mb-1 text-black text-center">{companyName}</p>
              <p className="text-xs mb-1 text-black text-center">{companyAddress}</p>
              
              {/* GST info - centered below company info - only show if showGst is true */}
              {showGst && (
                <p className="text-xs mb-1 text-black text-center">
                  <span className="font-semibold">GST:</span> {companyGstNumber}
                </p>
              )}
            </div>
            
            {/* Right Side - Logo Above Contact */}
            <div className="flex flex-col items-end space-y-1 ml-4">
              {/* Logo Section - Only show if showLogo is true */}
              {showLogo && (
                <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center">
                  {template.logoUrl ? (
                    <img 
                      src={template.logoUrl} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain" 
                      onError={e => {
                        console.error('Failed to load logo image:', template.logoUrl);
                        e.currentTarget.style.display = 'none';
                      }} 
                    />
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="h-3 w-3 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400 font-medium">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Upload logo"
                            disabled={uploading}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Contact Info - Below Logo */}
              {showContact && (
                <p className="text-xs text-black text-right">
                  <span className="font-semibold">Phone:</span> {companyMobile}
                </p>
              )}
            </div>
          </div>
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
        
        {/* Main Content Grid - Billing Table and Simple Amount Details */}
        <div className="grid grid-cols-1 gap-4 mt-3 mb-2 md:mb-3">
          {/* Billing Details - Takes 2 columns */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full border-collapse min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border border-gray-300 font-bold text-black">Sr</th>
                  <th className="p-2 text-left border border-gray-300 font-bold text-black">Description</th>
                  <th className="p-2 text-center border border-gray-300 font-bold text-black">Qty</th>
                  <th className="p-2 text-center border border-gray-300 font-bold text-black">Unit</th>
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
                    <td className="p-2 text-center border border-gray-300 text-black font-medium">{item.unit || 'pcs'}</td>
                    <td className="p-2 text-right border border-gray-300 text-black font-medium">{formatNumber(item.rate)}</td>
                    <td className="p-2 text-right border border-gray-300 text-black font-bold">{formatNumber(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Amount Details - Right Aligned Plain Text */}
          <div className="">
            <div className="">
              <div className="text-black text-right">
                <span className="font-medium">Total without GST: </span>
                <span className="font-bold">₹ {formatNumber(subtotal)}</span>
              </div>
              {showGst && (
                <div className="text-black text-right">
                  <span className="font-medium">GST (18%): </span>
                  <span className="font-bold">₹ {formatNumber(gst)}</span>
                </div>
              )}
              <div className="text-black text-lg border-t pt-2 text-right">
                <span className="font-semibold">Total Amount: </span>
                <span className="font-bold">₹ {formatNumber(total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="my-2 md:my-3 border-gray-300" />
        
        {footerEnabled && (
          <>
            {footerDesign === 'simple' && (
              <div className={`mt-2 md:mt-4 text-black ${footerPosition === 'center' ? 'text-center' : footerPosition === 'right' ? 'text-right' : 'text-left'}`}>
                <p className="text-xs font-medium">Generated by {companyName}</p>
                {showContact && <p className="text-xs">For inquiries, contact us at: {companyMobile}</p>}
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
                  <p>{companyName}</p>
                  {showContact && <p>{companyMobile}</p>}
                </div>
                <div className="text-xs text-right">
                  <p className="font-semibold">Payment Details:</p>
                  <p>Bank: Sample Bank Ltd.</p>
                  <p>Account: XXXXXXXX</p>
                </div>
              </div>
            )}
            
            {footerDesign === 'minimal' && (
              <div className={`flex mt-2 md:mt-4 text-black ${footerPosition === 'center' ? 'justify-center' : footerPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
                <div className="text-xs flex items-center space-x-4">
                  <span>Thank you</span>
                  {showContact && <span>{companyMobile}</span>}
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
