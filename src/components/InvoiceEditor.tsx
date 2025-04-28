
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { addInvoice } from "@/redux/slices/invoiceSlice";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

interface InvoiceEditorProps {
  onSave?: (markdown: string) => void;
  initialContent?: string;
}

const InvoiceEditor = ({ onSave, initialContent }: InvoiceEditorProps) => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  // State for all invoice fields
  const [showGst, setShowGst] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [partyName, setPartyName] = useState("Gulab Oil");
  const [invoiceDate, setInvoiceDate] = useState("2025-04-23");
  
  // Invoice items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: "મેન ગેટ",
      quantity: 2,
      rate: 7000,
      total: 14000
    },
    {
      id: uuidv4(),
      description: "Dom (sft)",
      quantity: 4950,
      rate: 33.33,
      total: 165000
    },
    {
      id: uuidv4(),
      description: "પ્રિન્ટ કાર્પેટ (55X120)",
      quantity: 5,
      rate: 6600,
      total: 33000
    },
    {
      id: uuidv4(),
      description: "સ્ટેજ (40X20X2.5)",
      quantity: 40,
      rate: 800,
      total: 32000
    },
    {
      id: uuidv4(),
      description: "સ્ટેજ બેગ્રાઉન્ડ (40X11)",
      quantity: 25,
      rate: 440,
      total: 11000
    },
    {
      id: uuidv4(),
      description: "સોફા",
      quantity: 16,
      rate: 1200,
      total: 19200
    },
    {
      id: uuidv4(),
      description: "ખુશી કવર+રીબીન",
      quantity: 500,
      rate: 30,
      total: 15000
    },
    {
      id: uuidv4(),
      description: "ગાદલા",
      quantity: 20,
      rate: 30,
      total: 600
    },
    {
      id: uuidv4(),
      description: "ટેબલ",
      quantity: 150,
      rate: 175,
      total: 26250
    },
    {
      id: uuidv4(),
      description: "કમાન (ગેટ)",
      quantity: 2,
      rate: 700,
      total: 1400
    },
    {
      id: uuidv4(),
      description: "નવ ફ્લોરિંગ (ડબલ) (sft)",
      quantity: 15000,
      rate: 3,
      total: 45000
    },
    {
      id: uuidv4(),
      description: "સાઈડ જમણવાર માટે (sft)",
      quantity: 2500,
      rate: 10,
      total: 25000
    },
    {
      id: uuidv4(),
      description: "રસોડા માટે મંડપ",
      quantity: 8,
      rate: 400,
      total: 3200
    },
    {
      id: uuidv4(),
      description: "રાઉન્ડ ટેબલ",
      quantity: 25,
      rate: 300,
      total: 7500
    },
    {
      id: uuidv4(),
      description: "જમણવાર માટે ખુરશી કવરવાળી",
      quantity: 250,
      rate: 20,
      total: 5000
    }
  ]);

  // Function to calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const gst = showGst ? subtotal * 0.18 : 0;
    const total = subtotal + gst;
    
    return {
      subtotal,
      gst,
      total
    };
  };

  // Update item details
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === 'quantity' || field === 'rate') {
      const newValue = typeof value === 'string' ? parseFloat(value) : value;
      updatedItems[index][field] = newValue as number;
      
      // Recalculate total
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].rate;
    } else {
      updatedItems[index][field] = value as never;
    }
    
    setItems(updatedItems);
  };

  // Add new item
  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        rate: 0,
        total: 0
      }
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Format number to Indian currency format
  const formatNumber = (value: number): string => {
    const formatter = new Intl.NumberFormat('en-IN');
    return formatter.format(value);
  };

  // Save invoice
  const saveInvoice = () => {
    const { subtotal, gst, total } = calculateTotals();
    
    const invoice = {
      id: uuidv4(),
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      partyName,
      date: invoiceDate,
      items,
      subtotal,
      gst,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addInvoice(invoice));

    toast({
      title: "Invoice saved",
      description: "Your invoice has been saved successfully",
    });
  };

  // Create editor instance
  const editor = useBlockNote({});

  // Get calculated totals
  const { subtotal, gst, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="gst-switch"
            checked={showGst}
            onCheckedChange={setShowGst}
          />
          <Label htmlFor="gst-switch">Apply GST (18%)</Label>
        </div>
        
        <Button onClick={saveInvoice}>Save Invoice</Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Quotation</h1>
        <p className="font-semibold mb-1">Sharda Mandap Service</p>
        <p className="text-sm mb-1">Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225</p>
        <p className="text-sm mb-4">
          <span className="font-semibold">GST NO:</span> 24AOSPP7196L1ZX | 
          <span className="font-semibold"> Mobile:</span> 98246 86047
        </p>
        
        <hr className="my-4" />
        
        <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="invoice-number" className="block mb-1">Invoice No:</Label>
            <Input 
              id="invoice-number"
              value={invoiceNumber} 
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
              className="max-w-xs"
            />
          </div>
          <div>
            <Label htmlFor="party-name" className="block mb-1">Party Name:</Label>
            <Input 
              id="party-name"
              value={partyName} 
              onChange={(e) => setPartyName(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div>
            <Label htmlFor="invoice-date" className="block mb-1">Date:</Label>
            <Input 
              id="invoice-date"
              type="date"
              value={invoiceDate} 
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Billing Details</h2>
          <Button variant="outline" size="sm" onClick={addNewItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr No</TableHead>
                <TableHead>Description (વર્ણન)</TableHead>
                <TableHead>Quantity (જથ્થો)</TableHead>
                <TableHead>Rate (₹)</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>{formatNumber(item.total)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <hr className="my-4" />
        
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total without GST</TableCell>
                <TableCell>{formatNumber(subtotal)}</TableCell>
              </TableRow>
              {showGst && (
                <TableRow>
                  <TableCell>GST (18%)</TableCell>
                  <TableCell>{formatNumber(gst)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-bold">{showGst ? 'Amount with GST' : 'Total Amount'}</TableCell>
                <TableCell className="font-bold">{formatNumber(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <hr className="my-4" />
        
        <p className="text-center text-sm mt-6">Generated by Sharda Mandap Service</p>
        <p className="text-center text-sm">For inquiries, contact us at <span className="font-semibold">98246 86047</span></p>
        
        <div className="mt-8 border rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2">Rich Text Editor (Optional)</h3>
          <BlockNoteView editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
