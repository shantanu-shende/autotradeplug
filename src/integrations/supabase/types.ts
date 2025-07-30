export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      demo_accounts: {
        Row: {
          account_name: string
          balance: number
          created_at: string
          hash_id: string
          id: string
          initial_balance: number
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          balance?: number
          created_at?: string
          hash_id: string
          id?: string
          initial_balance?: number
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          balance?: number
          created_at?: string
          hash_id?: string
          id?: string
          initial_balance?: number
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deployed_strategies: {
        Row: {
          demo_account_id: string
          deployed_at: string
          id: string
          is_active: boolean
          strategy_id: string
        }
        Insert: {
          demo_account_id: string
          deployed_at?: string
          id?: string
          is_active?: boolean
          strategy_id: string
        }
        Update: {
          demo_account_id?: string
          deployed_at?: string
          id?: string
          is_active?: boolean
          strategy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployed_strategies_demo_account_id_fkey"
            columns: ["demo_account_id"]
            isOneToOne: false
            referencedRelation: "demo_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployed_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          data_source: string | null
          id: string
          price: number
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          data_source?: string | null
          id?: string
          price: number
          symbol: string
          timestamp?: string
          volume?: number | null
        }
        Update: {
          data_source?: string | null
          id?: string
          price?: number
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number | null
          created_at: string
          expires_at: string
          id: string
          is_verified: boolean | null
          otp_code: string
          phone_number: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          expires_at: string
          id?: string
          is_verified?: boolean | null
          otp_code: string
          phone_number: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          otp_code?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          is_onboarded: boolean | null
          last_name: string | null
          phone_number: string | null
          pin_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_onboarded?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          pin_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_onboarded?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          pin_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_predefined: boolean
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_predefined?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_predefined?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          demo_account_id: string
          entry_price: number | null
          entry_time: string | null
          exit_price: number | null
          exit_time: string | null
          id: string
          pnl: number | null
          quantity: number
          signal_data: Json | null
          status: Database["public"]["Enums"]["trade_status"]
          strategy_id: string
          symbol: string
          trade_type: Database["public"]["Enums"]["trade_type"]
        }
        Insert: {
          created_at?: string
          demo_account_id: string
          entry_price?: number | null
          entry_time?: string | null
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          pnl?: number | null
          quantity: number
          signal_data?: Json | null
          status?: Database["public"]["Enums"]["trade_status"]
          strategy_id: string
          symbol: string
          trade_type: Database["public"]["Enums"]["trade_type"]
        }
        Update: {
          created_at?: string
          demo_account_id?: string
          entry_price?: number | null
          entry_time?: string | null
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          pnl?: number | null
          quantity?: number
          signal_data?: Json | null
          status?: Database["public"]["Enums"]["trade_status"]
          strategy_id?: string
          symbol?: string
          trade_type?: Database["public"]["Enums"]["trade_type"]
        }
        Relationships: [
          {
            foreignKeyName: "trades_demo_account_id_fkey"
            columns: ["demo_account_id"]
            isOneToOne: false
            referencedRelation: "demo_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          referral_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          referral_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          referral_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_hash_id: {
        Args: { first_name: string }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "inactive" | "dumped"
      trade_status: "pending" | "executed" | "cancelled"
      trade_type: "buy" | "sell"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "inactive", "dumped"],
      trade_status: ["pending", "executed", "cancelled"],
      trade_type: ["buy", "sell"],
    },
  },
} as const
