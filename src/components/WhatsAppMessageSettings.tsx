
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setWhatsappMessageTemplate } from '@/redux/slices/templateSlice';
import { MessageSquare, Copy } from 'lucide-react';

const WhatsAppMessageSettings = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const whatsappMessageTemplate = useSelector((state: RootState) => state.template.whatsappMessageTemplate);
  const [message, setMessage] = useState(whatsappMessageTemplate);

  const handleSave = () => {
    dispatch(setWhatsappMessageTemplate(message));
    toast({
      title: "WhatsApp message template updated",
      description: "Your custom message template has been saved successfully",
    });
  };

  const handleReset = () => {
    const defaultMessage = `📋 *Invoice #{{invoice_number}}*

🏢 *Client:* {{client_name}}
💰 *Total Amount:* ₹{{total_amount}}

🔗 *View PDF:* {{invoice_link}}

Please check the invoice details in the attached PDF link.`;
    setMessage(defaultMessage);
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast({
      title: "Variable copied",
      description: `${variable} has been copied to clipboard`,
    });
  };

  const variables = [
    { name: 'Invoice Number', variable: '{{invoice_number}}' },
    { name: 'Client Name', variable: '{{client_name}}' },
    { name: 'Total Amount', variable: '{{total_amount}}' },
    { name: 'Invoice Link', variable: '{{invoice_link}}' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Message Template
        </CardTitle>
        <CardDescription>
          Customize the message that gets shared when sending invoices via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="whatsapp-message">Message Template</Label>
          <Textarea
            id="whatsapp-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Enter your WhatsApp message template..."
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Available Variables</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {variables.map((item) => (
              <Button
                key={item.variable}
                variant="outline"
                size="sm"
                onClick={() => copyVariable(item.variable)}
                className="justify-between text-xs"
              >
                <span>{item.name}</span>
                <Copy className="h-3 w-3" />
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on any variable to copy it to clipboard
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Template
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessageSettings;
