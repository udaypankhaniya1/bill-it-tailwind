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
import { Plus, Trash, GripVertical, Languages } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/utils/formatNumber";
import { toGujaratiNumber, toGujaratiCurrency, gujaratiTerms } from "@/utils/gujaratiConverter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "@/services/invoiceService";
import { Template } from "@/services/templateService";
import DescriptionField from "@/components/DescriptionField";
import TagsInput from "@/components/TagsInput";

interface InvoiceItem {
  id: string;
  description: string;
  gujarati_description?: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

interface InvoiceEditorProps {
  templates: Template[];
  onSave?: (markdown: string) => void;
  initialContent?: string;
}

const InvoiceEditor = ({ templates, onSave, initialContent }: InvoiceEditorProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Select default template from the available templates
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  
  useEffect(() => {
    if (templates.length > 0 && !currentTemplate) {
      setCurrentTemplate(templates[0]);
      setShowGst(templates[0].show_gst);
    }
  }, [templates, currentTemplate]);

  // State for all invoice fields
  const [showGst, setShowGst] = useState<boolean>(false);
  const [useGujarati, setUseGujarati] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [partyName, setPartyName] = useState("Gulab Oil");
  const [invoiceDate, setInvoiceDate] = useState("2025-04-23");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Common tag suggestions
  const tagSuggestions = [
    "urgent", "paid", "pending", "overdue", "recurring", "wholesale", "retail",
    "construction", "service", "materials", "labor", "equipment", "rental",
    "maintenance", "repair", "installation", "delivery", "transport"
  ];
  
  // Invoice items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: "મેન ગેટ",
      gujarati_description: "મેન ગેટ",
      quantity: 2,
      unit: "pcs",
      rate: 7000,
      total: 14000
    },
    {
      id: uuidv4(),
      description: "Dom (sft)",
      gujarati_description: "ડોમ (સ્ક્વેર ફૂટ)",
      quantity: 4950,
      unit: "sft",
      rate: 33.33,
      total: 165000
    }
  ]);

  // Update template when changed
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
      setShowGst(template.show_gst);
    }
  };

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

  // Update description with potential translation
  const handleDescriptionChange = (index: number, description: string, translatedDescription?: string) => {
    const updatedItems = [...items];
    updatedItems[index].description = description;
    
    if (translatedDescription) {
      updatedItems[index].gujarati_description = translatedDescription;
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
        unit: 'pcs',
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

  // Handle drag end for reordering items
  const onDragEnd = (result: any) => {
    // If dropped outside the list, do nothing
    if (!result.destination) {
      return;
    }

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setItems(reorderedItems);
  };

  // Save invoice
  const saveInvoice = async () => {
    const { subtotal, gst, total } = calculateTotals();
    
    try {
      setIsSubmitting(true);
      
      const invoiceData = {
        invoice_number: invoiceNumber,
        party_name: partyName,
        date: invoiceDate,
        items: items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          total: item.total
        })),
        subtotal,
        gst,
        total,
        tags
      };

      await createInvoice(invoiceData);

      toast({
        title: "Invoice saved",
        description: "Your invoice has been saved successfully",
      });
      
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        variant: "destructive",
        title: "Failed to save invoice",
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get calculated totals
  const { subtotal, gst, total } = calculateTotals();

  if (!currentTemplate && templates.length > 0) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="gst-switch"
            checked={showGst}
            onCheckedChange={(checked: boolean) => setShowGst(checked)}
          />
          <Label htmlFor="gst-switch">Apply GST (18%)</Label>
        </div>
        
        <div className="flex items-center gap-3">
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
          
          <Select
            value={currentTemplate?.id || "default"}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={saveInvoice} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : useGujarati ? 'સેવ કરો' : 'Save Invoice'}
          </Button>
        </div>
      </div>
      
      <div 
        className="bg-white p-6 rounded-lg border shadow-sm"
        style={{
          '--primary-color': currentTemplate?.primary_color || 'blue',
          '--secondary-color': currentTemplate?.secondary_color || 'gray',
        } as React.CSSProperties}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${currentTemplate?.font_size_header || 'text-3xl'}`}>
              {useGujarati ? "કોટેશન" : "Quotation"}
            </h1>
            <p className="font-semibold mb-1">Sharda Mandap Service</p>
            <p className="text-sm mb-1">Porbandar Baypass, Jalaram Nagar, Mangrol, Dist. Junagadh - 362225</p>
            <p className="text-sm mb-4">
              <span className="font-semibold">GST NO:</span> 24AOSPP7196L1ZX | 
              <span className="font-semibold"> Mobile:</span> 98246 86047
            </p>
          </div>
          
          {currentTemplate?.show_logo && (
            <div className="w-32 h-32 border border-dashed rounded p-4 flex items-center justify-center">
              <p className="text-sm text-gray-500">Business Logo</p>
            </div>
          )}
        </div>
        
        <hr className="my-4" />
        
        <h2 className="text-xl font-semibold mb-2">{useGujarati ? "બિ�� વિગતો" : "Invoice Details"}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="invoice-number" className="block mb-1">
              {useGujarati ? "બિલ નંબર:" : "Invoice No:"}
            </Label>
            <Input 
              id="invoice-number"
              value={invoiceNumber} 
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
              className="max-w-xs"
            />
          </div>
          <div>
            <Label htmlFor="party-name" className="block mb-1">
              {useGujarati ? "પાર્ટી નામ:" : "Party Name:"}
            </Label>
            <Input 
              id="party-name"
              value={partyName} 
              onChange={(e) => setPartyName(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div>
            <Label htmlFor="invoice-date" className="block mb-1">
              {useGujarati ? "તારીખ:" : "Date:"}
            </Label>
            <Input 
              id="invoice-date"
              type="date"
              value={invoiceDate} 
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label className="block mb-2">
            {useGujarati ? "ટેગ્સ:" : "Tags:"}
          </Label>
          <TagsInput
            tags={tags}
            onTagsChange={setTags}
            suggestions={tagSuggestions}
            placeholder={useGujarati ? "ટેગ્સ ઉમેરો..." : "Add tags..."}
            className="max-w-lg"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {useGujarati ? "ટેગ્સ વડે તમે તમારા બિલોને સરળતાથી વર્ગીકૃત અને શોધી શકો છો" : "Use tags to categorize and easily find your invoices"}
          </p>
        </div>

        <hr className="my-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {useGujarati ? "બિલિંગ વિગતો" : "Billing Details"}
          </h2>
          <Button variant="outline" size="sm" onClick={addNewItem}>
            <Plus className="h-4 w-4 mr-2" />
            {useGujarati ? "આઇટમ ઉમેરો" : "Add Item"}
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>{useGujarati ? "ક્રમ" : "Sr No"}</TableHead>
                  <TableHead>
                    {useGujarati ? gujaratiTerms.description : "Description"} {useGujarati ? "" : "(વર્ણન)"}
                  </TableHead>
                  <TableHead>
                    {useGujarati ? gujaratiTerms.quantity : "Quantity"} {useGujarati ? "" : "(જથ્થો)"}
                  </TableHead>
                  <TableHead>
                    {useGujarati ? gujaratiTerms.unit : "Unit"}
                  </TableHead>
                  <TableHead>
                    {useGujarati ? gujaratiTerms.rate : "Rate"} {useGujarati ? "" : "(₹)"}
                  </TableHead>
                  <TableHead>
                    {useGujarati ? gujaratiTerms.total : "Total"} {useGujarati ? "" : "(₹)"}
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="invoice-items">
                {(provided) => (
                  <TableBody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TableCell>
                              <div {...provided.dragHandleProps} className="cursor-move">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                            </TableCell>
                            <TableCell>
                              {useGujarati ? toGujaratiNumber(index + 1) : (index + 1)}
                            </TableCell>
                            <TableCell>
                              <DescriptionField
                                value={item.description}
                                onChange={(value, translatedValue) => handleDescriptionChange(index, value, translatedValue)}
                                useGujarati={useGujarati}
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
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                className="w-full"
                                placeholder="pcs"
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
                            <TableCell>
                              {useGujarati ? toGujaratiCurrency(item.total) : formatNumber(item.total)}
                            </TableCell>
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        </div>

        <hr className="my-4" />
        
        <h2 className="text-xl font-semibold mb-4">
          {useGujarati ? "સારાંશ" : "Summary"}
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{useGujarati ? "વિગત" : "Description"}</TableHead>
                <TableHead>{useGujarati ? "રકમ (₹)" : "Amount (₹)"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{useGujarati ? "જીએસટી વગરની રકમ" : "Total without GST"}</TableCell>
                <TableCell>{useGujarati ? toGujaratiCurrency(subtotal) : formatNumber(subtotal)}</TableCell>
              </TableRow>
              {showGst && (
                <TableRow>
                  <TableCell>{useGujarati ? "જીએસટી (18%)" : "GST (18%)"}</TableCell>
                  <TableCell>{useGujarati ? toGujaratiCurrency(gst) : formatNumber(gst)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-bold">
                  {useGujarati 
                    ? (showGst ? "જીએસટી સાથેની રકમ" : "કુલ રકમ") 
                    : (showGst ? 'Amount with GST' : 'Total Amount')}
                </TableCell>
                <TableCell className="font-bold">
                  {useGujarati ? toGujaratiCurrency(total) : formatNumber(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <hr className="my-4" />
        
        <div className="mt-6" style={{color: `var(--secondary-color)`}}>
          <p className="text-center text-sm">{useGujarati ? "શારદા મંડપ સર્વિસ દ્વારા નિર્મિત" : "Generated by Sharda Mandap Service"}</p>
          {currentTemplate?.show_contact && (
            <p className="text-center text-sm">
              {useGujarati 
                ? "પૂછપરછ માટે, અમારો સંપર્ક કરો" 
                : "For inquiries, contact us at"} <span className="font-semibold">98246 86047</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
