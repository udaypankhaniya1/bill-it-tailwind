export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          total: number
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate?: number
          total?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          total?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          date: string
          gst: number
          id: string
          invoice_number: string
          party_name: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          gst?: number
          id?: string
          invoice_number: string
          party_name: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          gst?: number
          id?: string
          invoice_number?: string
          party_name?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      item_descriptions: {
        Row: {
          created_at: string
          english_text: string
          gujarati_text: string
          ginlish_text: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          english_text: string
          gujarati_text: string
          ginlish_text?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          english_text?: string
          gujarati_text?: string
          ginlish_text?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          company_address: string | null
          company_gst_number: string | null
          company_mobile: string | null
          company_name: string | null
          created_at: string
          font_size_body: string
          font_size_footer: string
          font_size_header: string
          footer_design: string | null
          footer_enabled: boolean | null
          footer_position: string | null
          header_position: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          show_contact: boolean
          show_gst: boolean
          show_logo: boolean
          table_color: string | null
          updated_at: string
          user_id: string
          watermark_enabled: boolean | null
          watermark_text: string | null
        }
        Insert: {
          company_address?: string | null
          company_gst_number?: string | null
          company_mobile?: string | null
          company_name?: string | null
          created_at?: string
          font_size_body?: string
          font_size_footer?: string
          font_size_header?: string
          footer_design?: string | null
          footer_enabled?: boolean | null
          footer_position?: string | null
          header_position?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string
          secondary_color?: string
          show_contact?: boolean
          show_gst?: boolean
          show_logo?: boolean
          table_color?: string | null
          updated_at?: string
          user_id: string
          watermark_enabled?: boolean | null
          watermark_text?: string | null
        }
        Update: {
          company_address?: string | null
          company_gst_number?: string | null
          company_mobile?: string | null
          company_name?: string | null
          created_at?: string
          font_size_body?: string
          font_size_footer?: string
          font_size_header?: string
          footer_design?: string | null
          footer_enabled?: boolean | null
          footer_position?: string | null
          header_position?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          show_contact?: boolean
          show_gst?: boolean
          show_logo?: boolean
          table_color?: string | null
          updated_at?: string
          user_id?: string
          watermark_enabled?: boolean | null
          watermark_text?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          gemini_api_key: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gemini_api_key?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gemini_api_key?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      translate_text: {
        Args: { text_to_translate: string; target_language?: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
