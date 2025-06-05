
import { formatNumber } from "@/utils/formatNumber";
import { Invoice } from "@/redux/slices/invoiceSlice";
import { 
  gujaratiTerms, 
  toGujaratiNumber, 
  toGujaratiDate, 
  toGujaratiCurrency 
} from "@/utils/gujaratiConverter";

interface InvoicePreviewProps {
  invoice: Invoice;
  isGujarati?: boolean;
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
}

const InvoicePreview = ({ invoice, isGujarati = false, template }: InvoicePreviewProps) => {
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
        {/* Header */}
        <div className={`${headerAlignmentClass} relative mb-6`}>
          <div className="flex justify-between items-start">
            <div className={headerPosition === 'right' ? 'order-2' : ''}>
              <h1 className="text-3xl font-bold print:text-2xl mb-3 text-black">
                {isGujarati ? 'કોટેશન' : 'Quotation'}
              </h1>
              <p className="font-semibold text-lg mb-2 text-black">Sharda Mandap Service</p>
              <p className="text-black mb-2">
                Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225
              </p>
              {showGst && (
                <p className="text-black mb-2">
                  <span className="font-medium">GST NO:</span> 24AOSPP7196L1ZX
                </p>
              )}
              {showContact && (
                <p className="text-black">
                  <span className="font-medium">Mobile:</span> 98246 86047
                </p>
              )}
            </div>
            
            {showLogo && (
              <div className={`w-24 h-24 border-2 border-black rounded p-2 flex items-center justify-center ${
                headerPosition === 'right' ? 'order-1' : ''
              }`}>
                {template?.logoUrl ? (
                  <img 
                    src={template.logoUrl} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-black font-medium">Logo</span>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className="border-black border-t-2 mb-6" />

        {/* Invoice Info */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 print:text-lg text-black">
            {isGujarati ? 'બિલ વિગતો' : 'Invoice Details'}
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base">
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.invoice : 'Invoice No'}:
              </span>
              <span className="text-black ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.party : 'Party Name'}:
              </span>
              <span className="text-black ml-2">{invoice.partyName}</span>
            </div>
            <div>
              <span className="font-semibold text-black">
                {isGujarati ? gujaratiTerms.date : 'Date'}:
              </span>
              <span className="text-black ml-2">{formatDate(invoice.date)}</span>
            </div>
          </div>
        </div>

        <hr className="border-black border-t-2 mb-6" />

        {/* Redesigned Billing Details Table */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 print:text-lg text-black">
            {isGujarati ? 'બિલિંગ વિગતો' : 'Billing Details'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-black p-4 text-left font-bold text-black w-16">
                    {isGujarati ? 'ક્રમ' : 'Sr No'}
                  </th>
                  <th className="border-2 border-black p-4 text-left font-bold text-black">
                    {isGujarati ? gujaratiTerms.description : 'Description'}
                  </th>
                  <th className="border-2 border-black p-4 text-center font-bold text-black w-24">
                    {isGujarati ? gujaratiTerms.quantity : 'Qty'}
                  </th>
                  <th className="border-2 border-black p-4 text-right font-bold text-black w-32">
                    {isGujarati ? `${gujaratiTerms.rate} (₹)` : 'Rate (₹)'}
                  </th>
                  <th className="border-2 border-black p-4 text-right font-bold text-black w-32">
                    {isGujarati ? `${gujaratiTerms.total} (₹)` : 'Total (₹)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-2 border-black p-4 text-center text-black font-medium">
                      {isGujarati ? toGujaratiNumber(index + 1) : index + 1}
                    </td>
                    <td className="border-2 border-black p-4 text-black">
                      {isGujarati && item.gujarati_description ? item.gujarati_description : item.description}
                    </td>
                    <td className="border-2 border-black p-4 text-center text-black font-medium">
                      {formatQuantity(item.quantity)}
                    </td>
                    <td className="border-2 border-black p-4 text-right text-black font-medium">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="border-2 border-black p-4 text-right text-black font-bold">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className="border-black border-t-2 mb-6" />

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 print:text-lg text-black">
            {isGujarati ? gujaratiTerms.summary : 'Summary'}
          </h2>
          <div className="flex justify-end">
            <div className="w-80 border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black p-3">
                <h3 className="font-bold text-black text-center">Amount Details</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-black font-medium">{isGujarati ? 'GST વિના કુલ:' : 'Total without GST:'}</span>
                  <span className="text-black font-bold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {showGst && (
                  <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="text-black font-medium">{isGujarati ? `${gujaratiTerms.gst} (18%):` : 'GST (18%):'}</span>
                    <span className="text-black font-bold">{formatCurrency(invoice.gst)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t-2 border-black pt-3 text-lg">
                  <span className="text-black">
                    {isGujarati ? 'કુલ રકમ:' : 'Total Amount:'}
                  </span>
                  <span className="text-black">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer */}
        {footerEnabled && (
          <>
            <hr className="border-black border-t-2 mb-4" />
            
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
