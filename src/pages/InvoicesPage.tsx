
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/utils/formatNumber';
import { Search } from 'lucide-react';

const InvoicesPage = () => {
  const { invoices } = useSelector((state: RootState) => state.invoice);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.partyName.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Invoices</h2>
        <Button onClick={() => navigate('/create-invoice')}>Create Invoice</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Invoice No</th>
                    <th className="text-left p-3">Party Name</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="p-3">{invoice.invoiceNumber}</td>
                      <td className="p-3">{invoice.partyName}</td>
                      <td className="p-3">{invoice.date}</td>
                      <td className="text-right p-3">₹ {formatNumber(invoice.total)}</td>
                      <td className="text-right p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoice/${invoice.id}`)}
                          className="mr-2"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">No invoices found</p>
              {search ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => navigate('/create-invoice')}>
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;
