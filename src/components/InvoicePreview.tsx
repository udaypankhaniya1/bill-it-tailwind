
import { Card, CardContent } from "@/components/ui/card";
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
}

const InvoicePreview = ({ invoice, isGujarati = false }: InvoicePreviewProps) => {
  const formatCurrency = (amount: number) => {
    return isGujarati ? toGujaratiCurrency(amount) : `₹ ${formatNumber(amount)}`;
  };

  const formatDate = (date: string) => {
    return isGujarati ? toGujaratiDate(date) : date;
  };

  const formatQuantity = (qty: number) => {
    return isGujarati ? toGujaratiNumber(qty) : qty.toString();
  };

  return (
    <Card className="w-full print:shadow-none">
      <CardContent className="p-8 print:p-6">
        <div className="flex flex-col gap-6 print:gap-4">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold print:text-xl">Sharda Mandap Service</h1>
            <p className="text-gray-600 print:text-gray-800 text-sm">
              Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225
            </p>
            <p className="text-gray-600 print:text-gray-800 text-sm">
              GST NO: 24AOSPP7196L1ZX | Mobile: 98246 86047
            </p>
          </div>

          <hr className="border-gray-300 print:border-gray-600" />

          {/* Quotation Info */}
          <div>
            <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2">
              {isGujarati ? 'કોટેશન' : 'Quotation'}
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm print:text-xs">
              <div>
                <span className="font-medium">
                  {isGujarati ? gujaratiTerms.invoice : 'Invoice No'}:
                </span> {invoice.invoiceNumber}
              </div>
              <div>
                <span className="font-medium">
                  {isGujarati ? gujaratiTerms.party : 'Party Name'}:
                </span> {invoice.partyName}
              </div>
              <div>
                <span className="font-medium">
                  {isGujarati ? gujaratiTerms.date : 'Date'}:
                </span> {formatDate(invoice.date)}
              </div>
            </div>
          </div>

          <hr className="border-gray-300 print:border-gray-600" />

          {/* Billing Details */}
          <div>
            <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2">
              {isGujarati ? 'બિલિંગ વિગતો' : 'Billing Details'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 print:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 print:bg-gray-100">
                    <th className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-left font-semibold text-sm print:text-xs">
                      {isGujarati ? 'ક્રમ' : 'Sr No'}
                    </th>
                    <th className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-left font-semibold text-sm print:text-xs">
                      {isGujarati ? gujaratiTerms.description : 'Description'}
                    </th>
                    <th className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-center font-semibold text-sm print:text-xs">
                      {isGujarati ? gujaratiTerms.quantity : 'Quantity'}
                    </th>
                    <th className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-right font-semibold text-sm print:text-xs">
                      {isGujarati ? `${gujaratiTerms.rate} (₹)` : 'Rate (₹)'}
                    </th>
                    <th className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-right font-semibold text-sm print:text-xs">
                      {isGujarati ? `${gujaratiTerms.total} (₹)` : 'Total (₹)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="even:bg-gray-25 print:even:bg-gray-50">
                      <td className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-sm print:text-xs">
                        {isGujarati ? toGujaratiNumber(index + 1) : index + 1}
                      </td>
                      <td className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-sm print:text-xs">
                        {isGujarati && item.gujarati_description ? item.gujarati_description : item.description}
                      </td>
                      <td className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-center text-sm print:text-xs">
                        {formatQuantity(item.quantity)}
                      </td>
                      <td className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-right text-sm print:text-xs">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="border border-gray-300 print:border-gray-600 p-3 print:p-2 text-right text-sm print:text-xs">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-gray-300 print:border-gray-600" />

          {/* Summary */}
          <div>
            <h2 className="text-xl font-bold mb-3 print:text-lg print:mb-2">
              {isGujarati ? gujaratiTerms.summary : 'Summary'}
            </h2>
            <div className="flex flex-col items-end">
              <div className="w-full max-w-xs">
                <div className="flex justify-between py-1 text-sm print:text-xs">
                  <span>{isGujarati ? 'GST વિના કુલ:' : 'Total without GST:'}</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm print:text-xs">
                  <span>{isGujarati ? `${gujaratiTerms.gst} (18%):` : 'GST (18%):'}</span>
                  <span>{formatCurrency(invoice.gst)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 print:border-gray-600 pt-2 mt-2 text-sm print:text-xs">
                  <span>{isGujarati ? 'GST સાથે કુલ:' : 'Amount with GST:'}</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-300 print:border-gray-600" />

          {/* Footer */}
          <div className="text-center text-gray-600 print:text-gray-800">
            <p className="font-medium text-sm print:text-xs">
              {isGujarati ? 'શારદા મંડપ સર્વિસ દ્વારા બનાવેલ' : 'Generated by Sharda Mandap Service'}
            </p>
            <p className="text-sm print:text-xs">
              {isGujarati ? 'સંપર્ક: 98246 86047' : 'Contact: 98246 86047'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;
