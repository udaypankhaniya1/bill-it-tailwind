import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/utils/formatNumber';
import { Search, Eye, FileText, Filter, Tag } from 'lucide-react';
import { fetchInvoices, Invoice } from '@/services/invoiceService';
import { useToast } from '@/hooks/use-toast';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error('Error loading invoices:', error);
        toast({
          variant: "destructive",
          title: "Failed to load invoices",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [toast]);

  // Enhanced search with fuzzy matching and filters
  useEffect(() => {
    let filtered = [...invoices];

    // Text search with fuzzy matching
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filtered = filtered.filter((invoice) => {
        const searchableText = [
          invoice.party_name,
          invoice.invoice_number,
          // Add items descriptions for search
          ...(invoice.items?.map(item => item.description) || [])
        ].join(' ').toLowerCase();

        // Simple fuzzy matching - allows for character differences
        return searchableText.includes(searchTerm) ||
               searchTerm.split(' ').some(term => searchableText.includes(term));
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(invoice => new Date(invoice.date) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(invoice => new Date(invoice.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(invoice => new Date(invoice.date) >= filterDate);
          break;
      }
    }

    // Amount filter
    if (amountFilter !== 'all') {
      switch (amountFilter) {
        case 'low':
          filtered = filtered.filter(invoice => invoice.total < 10000);
          break;
        case 'medium':
          filtered = filtered.filter(invoice => invoice.total >= 10000 && invoice.total < 50000);
          break;
        case 'high':
          filtered = filtered.filter(invoice => invoice.total >= 50000);
          break;
      }
    }

    setFilteredInvoices(filtered);
  }, [search, dateFilter, amountFilter, invoices]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Invoices</h2>
        <Button onClick={() => navigate('/create-invoice')}>Create Invoice</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{filteredInvoices.length} invoices</Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search invoices, party names, descriptions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="low">Under 10K</SelectItem>
                    <SelectItem value="medium">10K - 50K</SelectItem>
                    <SelectItem value="high">Above 50K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length > 0 ? (
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
                      <td className="p-3">{invoice.invoice_number}</td>
                      <td className="p-3">{invoice.party_name}</td>
                      <td className="p-3">{invoice.date}</td>
                      <td className="text-right p-3">₹ {formatNumber(invoice.total)}</td>
                      <td className="text-right p-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Eye size={16} className="mr-1" /> View
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
              {(search || dateFilter !== 'all' || amountFilter !== 'all') ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setSearch('');
                    setDateFilter('all');
                    setAmountFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                  <Button onClick={() => navigate('/create-invoice')}>
                    Create Invoice
                  </Button>
                </div>
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
