
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  party_name: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const fetchInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

  const invoicesWithItems = await Promise.all(
    data.map(async (invoice) => {
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (itemsError) {
        console.error('Error fetching invoice items:', itemsError);
        throw itemsError;
      }

      return {
        ...invoice,
        items: items || [],
      };
    })
  );

  return invoicesWithItems;
};

export const fetchInvoice = async (id: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id);

  if (itemsError) {
    console.error('Error fetching invoice items:', itemsError);
    throw itemsError;
  }

  return {
    ...data,
    items: items || [],
  };
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'user_id'>) => {
  const newInvoiceId = uuidv4();
  
  // Insert the invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      id: newInvoiceId,
      invoice_number: invoice.invoice_number,
      party_name: invoice.party_name,
      date: invoice.date,
      subtotal: invoice.subtotal,
      gst: invoice.gst,
      total: invoice.total,
    });

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError);
    throw invoiceError;
  }

  // Insert all invoice items
  const itemsWithInvoiceId = invoice.items.map((item) => ({
    ...item,
    invoice_id: newInvoiceId,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId);

  if (itemsError) {
    console.error('Error creating invoice items:', itemsError);
    throw itemsError;
  }

  return { id: newInvoiceId };
};

export const updateInvoice = async (invoice: Invoice) => {
  // Update the invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      invoice_number: invoice.invoice_number,
      party_name: invoice.party_name,
      date: invoice.date,
      subtotal: invoice.subtotal,
      gst: invoice.gst,
      total: invoice.total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoice.id);

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
    throw invoiceError;
  }

  // Delete existing items
  const { error: deleteError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', invoice.id);

  if (deleteError) {
    console.error('Error deleting old invoice items:', deleteError);
    throw deleteError;
  }

  // Insert new items
  const itemsWithInvoiceId = invoice.items.map((item) => ({
    ...item,
    invoice_id: invoice.id,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId);

  if (itemsError) {
    console.error('Error updating invoice items:', itemsError);
    throw itemsError;
  }

  return { id: invoice.id };
};

export const deleteInvoice = async (id: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }

  return { success: true };
};
