
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
  };
}

const InvoicePreview = ({ invoice, isGujarati = false, template }: InvoicePreviewProps) => {
  // Default template values - simplified for black and white printing
  const headerPosition = template?.headerPosition || 'center';
  const footerDesign = template?.footerDesign || 'simple';
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

  return (
    <div className="w-full bg-white p-8 print:p-6">
      <div className="flex flex-col gap-6 print:gap-4">
        {/* Header */}
        <div className={`${headerAlignmentClass} relative`}>
          <div className="flex justify-between items-start">
            <div className={headerPosition === 'right' ? 'order-2' : ''}>
              <h1 className="text-2xl font-bold print:text-xl mb-2 text-black">
                {isGujarati ? 'કોટેશન' : 'Quotation'}
              </h1>
              <p className="font-semibold mb-1 text-black">Sharda Mandap Service</p>
              <p className="text-black text-sm mb-1">
                Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225
              </p>
              {showGst && (
                <p className="text-black text-sm mb-1">
                  GST NO: 24AOSPP7196L1ZX
                </p>
              )}
              {showContact && (
                <p className="text-black text-sm">
                  Mobile: 98246 86047
                </p>
              )}
            </div>
            
            {showLogo && (
              <div className={`w-20 h-20 border border-black rounded p-2 flex items-center justify-center ${
                headerPosition === 'right' ? 'order-1' : ''
              }`}>
                <span className="text-xs text-black">Logo</span>
              </div>
            )}
          </div>
        </div>

        <hr className="border-black" />

        {/* Invoice Info */}
        <div>
          <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2 text-black">
            {isGujarati ? 'બિલ વિગતો' : 'Invoice Details'}
          </h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm print:text-xs">
            <div>
              <span className="font-medium text-black">
                {isGujarati ? gujaratiTerms.invoice : 'Invoice No'}:
              </span> <span className="text-black">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-medium text-black">
                {isGujarati ? gujaratiTerms.party : 'Party Name'}:
              </span> <span className="text-black">{invoice.partyName}</span>
            </div>
            <div>
              <span className="font-medium text-black">
                {isGujarati ? gujaratiTerms.date : 'Date'}:
              </span> <span className="text-black">{formatDate(invoice.date)}</span>
            </div>
          </div>
        </div>

        <hr className="border-black" />

        {/* Billing Details */}
        <div>
          <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2 text-black">
            {isGujarati ? 'બિલિંગ વિગતો' : 'Billing Details'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-100">
                  <th className="border border-black p-3 print:p-2 text-left font-semibold text-sm print:text-xs text-black">
                    {isGujarati ? 'ક્રમ' : 'Sr No'}
                  </th>
                  <th className="border border-black p-3 print:p-2 text-left font-semibold text-sm print:text-xs text-black">
                    {isGujarati ? gujaratiTerms.description : 'Description'}
                  </th>
                  <th className="border border-black p-3 print:p-2 text-center font-semibold text-sm print:text-xs text-black">
                    {isGujarati ? gujaratiTerms.quantity : 'Quantity'}
                  </th>
                  <th className="border border-black p-3 print:p-2 text-right font-semibold text-sm print:text-xs text-black">
                    {isGujarati ? `${gujaratiTerms.rate} (₹)` : 'Rate (₹)'}
                  </th>
                  <th className="border border-black p-3 print:p-2 text-right font-semibold text-sm print:text-xs text-black">
                    {isGujarati ? `${gujaratiTerms.total} (₹)` : 'Total (₹)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50 print:bg-gray-50' : 'bg-white'}>
                    <td className="border border-black p-3 print:p-2 text-sm print:text-xs text-black">
                      {isGujarati ? toGujaratiNumber(index + 1) : index + 1}
                    </td>
                    <td className="border border-black p-3 print:p-2 text-sm print:text-xs text-black">
                      {isGujarati && item.gujarati_description ? item.gujarati_description : item.description}
                    </td>
                    <td className="border border-black p-3 print:p-2 text-center text-sm print:text-xs text-black">
                      {formatQuantity(item.quantity)}
                    </td>
                    <td className="border border-black p-3 print:p-2 text-right text-sm print:text-xs text-black">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="border border-black p-3 print:p-2 text-right text-sm print:text-xs text-black">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className="border-black" />

        {/* Summary */}
        <div>
          <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2 text-black">
            {isGujarati ? gujaratiTerms.summary : 'Summary'}
          </h2>
          <div className="flex flex-col items-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-1 text-sm print:text-xs">
                <span className="text-black">{isGujarati ? 'GST વિના કુલ:' : 'Total without GST:'}</span>
                <span className="text-black">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {showGst && (
                <div className="flex justify-between py-1 text-sm print:text-xs">
                  <span className="text-black">{isGujarati ? `${gujaratiTerms.gst} (18%):` : 'GST (18%):'}</span>
                  <span className="text-black">{formatCurrency(invoice.gst)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-black pt-2 mt-2 text-sm print:text-xs text-black">
                <span>{isGujarati ? 'કુલ રકમ:' : 'Total Amount:'}</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-black" />

        {/* Footer */}
        {footerDesign === 'simple' && (
          <div className="text-center text-black">
            <p className="font-medium text-sm print:text-xs">
              {isGujarati ? 'શારદા મંડપ સર્વિસ દ્વારા બનાવેલ' : 'Generated by Sharda Mandap Service'}
            </p>
            {showContact && (
              <p className="text-sm print:text-xs">
                {isGujarati ? 'સંપર્ક: 98246 86047' : 'Contact: 98246 86047'}
              </p>
            )}
          </div>
        )}

        {footerDesign === 'detailed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm print:text-xs text-black">
            <div>
              <p className="font-semibold">Terms & Conditions:</p>
              <p>1. Payment due within 15 days</p>
              <p>2. All prices are inclusive of taxes</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Thank You for Your Business!</p>
              <p>Sharda Mandap Service</p>
              {showContact && <p>98246 86047</p>}
            </div>
            <div className="text-right">
              <p className="font-semibold">Payment Details:</p>
              <p>Bank: Sample Bank Ltd.</p>
              <p>Account: XXXXXXXX</p>
            </div>
          </div>
        )}

        {footerDesign === 'minimal' && (
          <div className="flex justify-between items-center text-sm print:text-xs text-black">
            <div>
              <p>Thank you</p>
            </div>
            <div>
              {showContact && <p>98246 86047</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
