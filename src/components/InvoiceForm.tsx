
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { addInvoice, InvoiceItem } from '@/redux/slices/invoiceSlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatNumber, parseFormattedNumber, calculateGST } from '@/utils/formatNumber';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowRight, FileText, Trash, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import DescriptionField from '@/components/DescriptionField';
import { toGujaratiNumber, toGujaratiCurrency, gujaratiTerms } from '@/utils/gujaratiConverter';

const InvoiceForm = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [partyName, setPartyName] = useState('');
  const [date, setDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [useGujarati, setUseGujarati] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      total: 0,
    },
  ]);

  const calculateTotal = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === 'quantity' || field === 'rate') {
      const newValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
      updatedItems[index][field] = newValue as number;
      
      // Recalculate total when quantity or rate changes
      updatedItems[index].total = calculateTotal(
        updatedItems[index].quantity,
        updatedItems[index].rate
      );
    } else {
      updatedItems[index][field] = value as never;
    }
    
    setItems(updatedItems);
  };

  const handleDescriptionChange = (index: number, description: string, translatedDescription?: string) => {
    const updatedItems = [...items];
    updatedItems[index].description = description;
    setItems(updatedItems);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unit: 'pcs',
        rate: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const subtotal = calculateSubtotal();
  const gst = calculateGST(subtotal);
  const total = subtotal + gst;

  const handleSave = () => {
    if (!partyName || !date || items.some(item => !item.description || item.quantity <= 0)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill all required fields",
      });
      return;
    }

    const invoice = {
      id: uuidv4(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      partyName,
      date,
      items,
      subtotal,
      gst,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addInvoice(invoice));
    toast({
      title: "Invoice created",
      description: "Your invoice has been saved successfully",
    });

    // Reset form after saving
    setPartyName('');
    setDate('');
    setItems([{
      id: uuidv4(),
      description: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      total: 0,
    }]);
    setShowPreview(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showPreview) {
      handleSave();
    } else {
      setShowPreview(true);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{useGujarati ? "બિલ બનાવો" : "Create Invoice"}</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="gujarati-switch"
            checked={useGujarati}
            onCheckedChange={(checked: boolean) => setUseGujarati(checked)}
          />
          <Label htmlFor="gujarati-switch" className="flex items-center">
            <Languages className="h-4 w-4 mr-1" />
            {useGujarati ? "ગુજરાતી" : "Gujarati"}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partyName">{useGujarati ? gujaratiTerms.party + " નામ" : "Party Name"}</Label>
                <Input
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder={useGujarati ? "ગ્રાહક/ક્લાયન્ટનું નામ" : "Customer/Client Name"}
                  required
                  disabled={showPreview}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{useGujarati ? gujaratiTerms.date : "Date"}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={showPreview}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{useGujarati ? "આઇટમ્સ" : "Items"}</h3>
                {!showPreview && (
                  <Button type="button" variant="outline" size="sm" onClick={addNewItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    {useGujarati ? "આઇટમ ઉમેરો" : "Add Item"}
                  </Button>
                )}
              </div>

              <div className="border rounded-md">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>{useGujarati ? "ક્રમ" : "Sr No"}</th>
                      <th>{useGujarati ? gujaratiTerms.description : "Description"}</th>
                      <th>{useGujarati ? gujaratiTerms.quantity : "Quantity"}</th>
                      <th>{useGujarati ? gujaratiTerms.unit : "Unit"}</th>
                      <th>{useGujarati ? gujaratiTerms.rate + " (₹)" : "Rate (₹)"}</th>
                      <th>{useGujarati ? gujaratiTerms.total + " (₹)" : "Total (₹)"}</th>
                      {!showPreview && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{useGujarati ? toGujaratiNumber(index + 1) : (index + 1)}</td>
                        <td>
                          {showPreview ? (
                            item.description
                          ) : (
                            <DescriptionField
                              value={item.description}
                              onChange={(value, translatedValue) => handleDescriptionChange(index, value, translatedValue)}
                              useGujarati={useGujarati}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          )}
                        </td>
                        <td>
                          {showPreview ? (
                            useGujarati ? toGujaratiNumber(item.quantity) : item.quantity
                          ) : (
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-20"
                              required
                            />
                          )}
                        </td>
                        <td>
                          {showPreview ? (
                            item.unit
                          ) : (
                            <Input
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              placeholder="pcs"
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-20"
                            />
                          )}
                        </td>
                        <td>
                          {showPreview ? (
                            useGujarati ? toGujaratiCurrency(item.rate) : formatNumber(item.rate)
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-24"
                              required
                            />
                          )}
                        </td>
                        <td>{useGujarati ? toGujaratiCurrency(item.total) : formatNumber(item.total)}</td>
                        {!showPreview && (
                          <td>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <div className="flex justify-between w-full max-w-xs">
                  <span className="font-medium">{useGujarati ? gujaratiTerms.subtotal + ":" : "Subtotal:"}</span>
                  <span>
                    {useGujarati ? toGujaratiCurrency(subtotal) : "₹ " + formatNumber(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                  <span className="font-medium">{useGujarati ? gujaratiTerms.gst + " (18%):" : "GST (18%):"}</span>
                  <span>
                    {useGujarati ? toGujaratiCurrency(gst) : "₹ " + formatNumber(gst)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-xs border-t pt-2">
                  <span className="font-bold">{useGujarati ? gujaratiTerms.total + ":" : "Total:"}</span>
                  <span className="font-bold">
                    {useGujarati ? toGujaratiCurrency(total) : "₹ " + formatNumber(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            {showPreview ? (
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowPreview(false)}>
                  {useGujarati ? "સંપાદિત કરો" : "Edit"}
                </Button>
                <Button type="submit">
                  <FileText className="mr-2 h-4 w-4" />
                  {useGujarati ? "બિલ સાચવો" : "Save Invoice"}
                </Button>
              </div>
            ) : (
              <Button type="submit">
                {useGujarati ? "પૂર્વાવલોકન" : "Preview"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
