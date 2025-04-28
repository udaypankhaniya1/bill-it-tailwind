
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

interface InvoiceEditorProps {
  onSave?: (markdown: string) => void;
  initialContent?: string;
}

const InvoiceEditor = ({ onSave, initialContent }: InvoiceEditorProps) => {
  const [showGst, setShowGst] = useState(true);
  const [invoiceData, setInvoiceData] = useState({
    subtotal: 403000,
    gst: 72540,
    total: 475540
  });

  // Create a simple editor with default configuration
  const editor = useBlockNote({});

  // Update the GST calculation based on the toggle
  const updateGstCalculation = () => {
    const subtotal = invoiceData.subtotal;
    const gst = showGst ? subtotal * 0.18 : 0;
    const total = subtotal + gst;
    
    setInvoiceData({
      subtotal,
      gst,
      total
    });
  };

  useEffect(() => {
    updateGstCalculation();
  }, [showGst]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="gst-switch"
          checked={showGst}
          onCheckedChange={setShowGst}
        />
        <Label htmlFor="gst-switch">Apply GST (18%)</Label>
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
        <p className="mb-1"><span className="font-medium">Invoice No:</span> [To be filled]</p>
        <p className="mb-1"><span className="font-medium">Party Name:</span> Gulab Oil</p>
        <p className="mb-4"><span className="font-medium">Date:</span> 23-04-2025</p>
        
        <hr className="my-4" />
        
        <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr No</TableHead>
                <TableHead>Description (વર્ણન)</TableHead>
                <TableHead>Quantity (જથ્થો)</TableHead>
                <TableHead>Rate (₹)</TableHead>
                <TableHead>Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>મેન ગેટ</TableCell>
                <TableCell>2</TableCell>
                <TableCell>7,000</TableCell>
                <TableCell>14,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Dom (sft)</TableCell>
                <TableCell>4,950</TableCell>
                <TableCell>33.33</TableCell>
                <TableCell>1,65,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>પ્રિન્ટ કાર્પેટ (55X120)</TableCell>
                <TableCell>5</TableCell>
                <TableCell>6,600</TableCell>
                <TableCell>33,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>સ્ટેજ (40X20X2.5)</TableCell>
                <TableCell>40</TableCell>
                <TableCell>800</TableCell>
                <TableCell>32,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>સ્ટેજ બેગ્રાઉન્ડ (40X11)</TableCell>
                <TableCell>25</TableCell>
                <TableCell>440</TableCell>
                <TableCell>11,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>સોફા</TableCell>
                <TableCell>16</TableCell>
                <TableCell>1,200</TableCell>
                <TableCell>19,200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>ખુશી કવર+રીબીન</TableCell>
                <TableCell>500</TableCell>
                <TableCell>30</TableCell>
                <TableCell>15,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>ગાદલા</TableCell>
                <TableCell>20</TableCell>
                <TableCell>30</TableCell>
                <TableCell>600</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>9</TableCell>
                <TableCell>ટેબલ</TableCell>
                <TableCell>150</TableCell>
                <TableCell>175</TableCell>
                <TableCell>26,250</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>10</TableCell>
                <TableCell>કમાન (ગેટ)</TableCell>
                <TableCell>2</TableCell>
                <TableCell>700</TableCell>
                <TableCell>1,400</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>11</TableCell>
                <TableCell>નવ ફ્લોરિંગ (ડબલ) (sft)</TableCell>
                <TableCell>15,000</TableCell>
                <TableCell>3</TableCell>
                <TableCell>45,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>12</TableCell>
                <TableCell>સાઈડ જમણવાર માટે (sft)</TableCell>
                <TableCell>2,500</TableCell>
                <TableCell>10</TableCell>
                <TableCell>25,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>13</TableCell>
                <TableCell>રસોડા માટે મંડપ</TableCell>
                <TableCell>8</TableCell>
                <TableCell>400</TableCell>
                <TableCell>3,200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>14</TableCell>
                <TableCell>રાઉન્ડ ટેબલ</TableCell>
                <TableCell>25</TableCell>
                <TableCell>300</TableCell>
                <TableCell>7,500</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>15</TableCell>
                <TableCell>જમણવાર માટે ખુરશી કવરવાળી</TableCell>
                <TableCell>250</TableCell>
                <TableCell>20</TableCell>
                <TableCell>5,000</TableCell>
              </TableRow>
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
                <TableCell>{invoiceData.subtotal.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              {showGst && (
                <TableRow>
                  <TableCell>GST (18%)</TableCell>
                  <TableCell>{invoiceData.gst.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-bold">{showGst ? 'Amount with GST' : 'Total Amount'}</TableCell>
                <TableCell className="font-bold">{invoiceData.total.toLocaleString('en-IN')}</TableCell>
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
