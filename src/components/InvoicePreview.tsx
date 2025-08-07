
import { formatNumber } from "@/utils/formatNumber";
import { Invoice } from "@/redux/slices/invoiceSlice";
import { gujaratiTerms, toGujaratiNumber, toGujaratiDate, toGujaratiCurrency } from "@/utils/gujaratiConverter";
import { uploadLogo } from '@/utils/fileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
  isGujarati?: boolean;
  documentTitle?: string;
  template?: {
    showGst?: boolean;
    showContact?: boolean;
    showLogo?: boolean;
    headerPosition?: 'left' | 'center' | 'right';
    footerDesign?: 'simple' | 'detailed' | 'minimal';
    footerPosition?: 'left' | 'center' | 'right';
    footerEnabled?: boolean;
    watermarkText?: string;
    watermarkEnabled?: boolean;
    logoUrl?: string;
  };
  onLogoUpload?: (url: string) => void;
}

const InvoicePreview = ({
  invoice,
  isGujarati = false,
  documentTitle = 'Quotation',
  template,
  onLogoUpload
}: InvoicePreviewProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Default template values - simplified for black and white printing
  const headerPosition = template?.headerPosition || 'center';
  const footerDesign = template?.footerDesign || 'simple';
  const footerPosition = template?.footerPosition || 'center';
  const footerEnabled = template?.footerEnabled ?? true;
  const watermarkEnabled = template?.watermarkEnabled ?? false;
  const watermarkText = template?.watermarkText || '';
  const showGst = template?.showGst ?? true;
  const showContact = template?.showContact ?? true;
  const showLogo = template?.showLogo ?? true;
  
  console.log('InvoicePreview render - showLogo:', showLogo, 'logoUrl:', template?.logoUrl, 'showGst:', showGst);

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

  const formatCurrency = (amount: number) => {
    return isGujarati ? toGujaratiCurrency(amount) : `₹ ${formatNumber(amount)}`;
  };

  const formatDate = (date: string) => {
    return isGujarati ? toGujaratiDate(date) : date;
  };

  const formatQuantity = (qty: number) => {
    return isGujarati ? toGujaratiNumber(qty) : qty.toString();
  };

  // Header alignment classes
  const headerAlignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[headerPosition];

  // Footer alignment classes
  const footerAlignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[footerPosition];

  // Calculate totals based on showGst setting
  const originalSubtotal = invoice.subtotal;
  const calculatedGst = showGst ? originalSubtotal * 0.18 : 0;
  const calculatedTotal = originalSubtotal + calculatedGst;

  return (
    <div className="w-full bg-white p-8 print:p-6 relative min-h-[297mm] flex flex-col">
      {/* Watermark */}
      {watermarkEnabled && watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div 
            className="text-6xl font-bold text-gray-200 opacity-20 rotate-45 select-none" 
            style={{ transform: 'rotate(-45deg)' }}
          >
            {watermarkText}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header - New Layout with Logo Positioned Above Contact Info */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            {/* Main Header Content - Takes up most space */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold print:text-2xl mb-3 text-black text-center">
                {isGujarati ? documentTitle === 'Bill' ? 'બિલ' : 'કોટેશન' : documentTitle}
              </h1>
              <p className="font-semibold text-lg mb-2 text-black text-center">Sharda Mandap Service</p>
              <p className="text-black mb-2 text-center">
                Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225
              </p>
              
              {/* GST info - centered below company info - only show if showGst is true */}
              {showGst && (
                <p className="text-black mb-2 text-center">
                  <span className="font-medium">GST NO:</span> 24AOSPP7196L1ZX
                </p>
              )}
            </div>
            
            {/* Right Side - Logo Above Contact */}
            <div className="flex flex-col items-end space-y-2 ml-6">
              {/* Logo Section - Only show if showLogo is true */}
              {showLogo && (
                <div className="w-24 h-24 border border-gray-300 rounded p-2 flex items-center justify-center flex-shrink-0">
                  {template?.logoUrl ? (
                    <img 
                      src={template.logoUrl} 
                      alt="Company Logo" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
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
                <p className="text-black text-right">
                  <span className="font-medium">Mobile:</span> 98246 86047
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-300 border-t mb-6" />

        {/* Invoice Info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 print:text-lg text-black">
            {isGujarati ? 'બિલ વિગતો' : `${documentTitle} Details`}
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base">
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.invoice : `${documentTitle} No`}:
              </span>
              <span className="text-black ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.party : 'Party Name'}:
              </span>
              <span className="text-black ml-2 font-normal text-base">{invoice.partyName}</span>
            </div>
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.date : 'Date'}:
              </span>
              <span className="text-black ml-2">{formatDate(invoice.date)}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 border-t mb-6" />

        {/* Main Content Grid - Billing Table and Simple Amount Details */}
        <div className="grid grid-cols-1 gap-6 mb-6 rounded-xl">
          {/* Billing Details - Takes 2 columns */}
          <div className="lg:col-span-2 rounded-none">
            <h2 className="text-xl font-bold mb-4 print:text-lg text-black">
              {isGujarati ? 'બિલિંગ વિગતો' : 'Billing Details'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-bold text-black w-16">
                      {isGujarati ? 'ક્રમ' : 'Sr No'}
                    </th>
                    <th className="border border-gray-300 p-3 text-left font-bold text-black">
                      {isGujarati ? gujaratiTerms.description : 'Description'}
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-black w-24">
                      {isGujarati ? gujaratiTerms.quantity : 'Qty'}
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-bold text-black w-20">
                      {isGujarati ? gujaratiTerms.unit : 'Unit'}
                    </th>
                    <th className="border border-gray-300 p-3 text-right font-bold text-black w-32">
                      {isGujarati ? `${gujaratiTerms.rate} (₹)` : 'Rate (₹)'}
                    </th>
                    <th className="border border-gray-300 p-3 text-right font-bold text-black w-32">
                      {isGujarati ? `${gujaratiTerms.total} (₹)` : 'Total (₹)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3 text-center text-black font-medium">
                        {isGujarati ? toGujaratiNumber(index + 1) : index + 1}
                      </td>
                      <td className="border border-gray-300 p-3 text-black">
                        {isGujarati && item.gujarati_description ? item.gujarati_description : item.description}
                      </td>
                      <td className="border border-gray-300 p-3 text-center text-black font-medium">
                        {formatQuantity(item.quantity)}
                      </td>
                      <td className="border border-gray-300 p-3 text-center text-black font-medium">
                        {item.unit || 'pcs'}
                      </td>
                      <td className="border border-gray-300 p-3 text-right text-black font-medium">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="border border-gray-300 p-3 text-right text-black font-bold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Amount Details - Right Aligned Plain Text */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 print:text-lg text-black text-right">
              {isGujarati ? gujaratiTerms.summary : 'Amount Summary'}
            </h2>
            <div className="text-right space-y-3">
              <div className="text-black text-base">
                <span className="font-medium">
                  {isGujarati ? 'GST વિના કુલ: ' : 'Total without GST: '}
                </span>
                <span className="font-bold">{formatCurrency(originalSubtotal)}</span>
              </div>
              {showGst && (
                <div className="text-black text-base">
                  <span className="font-medium">
                    {isGujarati ? `${gujaratiTerms.gst} (18%): ` : 'GST (18%): '}
                  </span>
                  <span className="font-bold">{formatCurrency(calculatedGst)}</span>
                </div>
              )}
              <div className="text-black text-lg border-t pt-3">
                <span className="font-semibold">
                  {isGujarati ? 'કુલ રકમ: ' : 'Total Amount: '}
                </span>
                <span className="font-bold">{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer */}
        {footerEnabled && (
          <>
            <hr className="border-gray-300 border-t mb-4" />
            
            {footerDesign === 'simple' && (
              <div className={`${footerAlignmentClass} text-black pb-4`}>
                <p className="font-semibold text-base mb-2">
                  {isGujarati ? 'શારદા મંડપ સર્વિસ દ્વારા બનાવેલ' : 'Generated by Sharda Mandap Service'}
                </p>
                {showContact && (
                  <p className="text-sm">
                    {isGujarati ? 'સંપર્ક: 98246 86047' : 'Contact: 98246 86047'}
                  </p>
                )}
              </div>
            )}

            {footerDesign === 'detailed' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-black pb-4">
                <div className={footerPosition === 'right' ? 'order-3' : footerPosition === 'center' ? 'order-2' : 'order-1'}>
                  <p className="font-semibold mb-1">Terms & Conditions:</p>
                  <p>1. Payment due within 15 days</p>
                  <p>2. All prices are inclusive of taxes</p>
                </div>
                <div className={`${footerPosition === 'center' ? 'text-center order-1' : footerPosition === 'right' ? 'text-right order-2' : 'text-left order-3'}`}>
                  <p className="font-semibold mb-1">Thank You for Your Business!</p>
                  <p>Sharda Mandap Service</p>
                  {showContact && <p>98246 86047</p>}
                </div>
                <div className={footerPosition === 'left' ? 'order-2' : footerPosition === 'center' ? 'order-3' : 'order-1'}>
                  <p className="font-semibold mb-1">Payment Details:</p>
                  <p>Bank: Sample Bank Ltd.</p>
                  <p>Account: XXXXXXXX</p>
                </div>
              </div>
            )}

            {footerDesign === 'minimal' && (
              <div className={`flex ${footerPosition === 'center' ? 'justify-center' : footerPosition === 'right' ? 'justify-end' : 'justify-start'} items-center text-sm text-black pb-4`}>
                <div className="flex items-center space-x-4">
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

export default InvoicePreview;
