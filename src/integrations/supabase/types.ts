export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      arbitrage_signals: {
        Row: {
          detected_at: string
          executed: boolean
          execution_result: Json | null
          id: string
          potential_profit: number
          price_a: number
          price_b: number
          source_a: string
          source_b: string
          spread_pips: number
          symbol_pair: string
          user_id: string
        }
        Insert: {
          detected_at?: string
          executed?: boolean
          execution_result?: Json | null
          id?: string
          potential_profit: number
          price_a: number
          price_b: number
          source_a: string
          source_b: string
          spread_pips: number
          symbol_pair: string
          user_id: string
        }
        Update: {
          detected_at?: string
          executed?: boolean
          execution_result?: Json | null
          id?: string
          potential_profit?: number
          price_a?: number
          price_b?: number
          source_a?: string
          source_b?: string
          spread_pips?: number
          symbol_pair?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_execution_logs: {
        Row: {
          action: string
          bot_id: string
          created_at: string
          details: Json
          id: string
          user_id: string
        }
        Insert: {
          action: string
          bot_id: string
          created_at?: string
          details?: Json
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          bot_id?: string
          created_at?: string
          details?: Json
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_execution_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "trading_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          broker_name: string
          connected_at: string | null
          created_at: string
          id: string
          last_sync: string | null
          metadata: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_name: string
          connected_at?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_name?: string
          connected_at?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deployed_strategies: {
        Row: {
          config: Json | null
          demo_account_id: string | null
          deployed_at: string
          id: string
          status: string | null
          strategy_id: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          demo_account_id?: string | null
          deployed_at?: string
          id?: string
          status?: string | null
          strategy_id?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          demo_account_id?: string | null
          deployed_at?: string
          id?: string
          status?: string | null
          strategy_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployed_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "user_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bot_id: string | null
          created_at: string
          filled_at: string | null
          filled_price: number | null
          id: string
          order_type: Database["public"]["Enums"]["order_type"]
          portfolio_id: string
          price: number | null
          side: Database["public"]["Enums"]["position_side"]
          status: Database["public"]["Enums"]["order_status"]
          symbol: string
          user_id: string
          volume: number
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          filled_at?: string | null
          filled_price?: number | null
          id?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          portfolio_id: string
          price?: number | null
          side: Database["public"]["Enums"]["position_side"]
          status?: Database["public"]["Enums"]["order_status"]
          symbol: string
          user_id: string
          volume: number
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          filled_at?: string | null
          filled_price?: number | null
          id?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          portfolio_id?: string
          price?: number | null
          side?: Database["public"]["Enums"]["position_side"]
          status?: Database["public"]["Enums"]["order_status"]
          symbol?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "trading_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
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
      portfolios: {
        Row: {
          balance: number
          broker_connection_id: string | null
          created_at: string
          currency: string
          equity: number
          id: string
          margin_available: number
          margin_used: number
          portfolio_name: string
          portfolio_type: Database["public"]["Enums"]["portfolio_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          broker_connection_id?: string | null
          created_at?: string
          currency?: string
          equity?: number
          id?: string
          margin_available?: number
          margin_used?: number
          portfolio_name: string
          portfolio_type?: Database["public"]["Enums"]["portfolio_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          broker_connection_id?: string | null
          created_at?: string
          currency?: string
          equity?: number
          id?: string
          margin_available?: number
          margin_used?: number
          portfolio_name?: string
          portfolio_type?: Database["public"]["Enums"]["portfolio_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          current_price: number
          entry_price: number
          id: string
          opened_at: string
          portfolio_id: string
          profit_loss: number
          side: Database["public"]["Enums"]["position_side"]
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          current_price: number
          entry_price: number
          id?: string
          opened_at?: string
          portfolio_id: string
          profit_loss?: number
          side: Database["public"]["Enums"]["position_side"]
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume: number
        }
        Update: {
          current_price?: number
          entry_price?: number
          id?: string
          opened_at?: string
          portfolio_id?: string
          profit_loss?: number
          side?: Database["public"]["Enums"]["position_side"]
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "positions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_onboarded: boolean | null
          phone_number: string
          pin_hash: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean | null
          phone_number: string
          pin_hash?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean | null
          phone_number?: string
          pin_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trading_bots: {
        Row: {
          bot_name: string
          config: Json
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bot_status"]
          strategy_type: Database["public"]["Enums"]["strategy_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_name: string
          config?: Json
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bot_status"]
          strategy_type?: Database["public"]["Enums"]["strategy_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_name?: string
          config?: Json
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bot_status"]
          strategy_type?: Database["public"]["Enums"]["strategy_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_strategies: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          risk_level: string | null
          status: string | null
          strategy_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          risk_level?: string | null
          status?: string | null
          strategy_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          risk_level?: string | null
          status?: string | null
          strategy_name?: string
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
      can_request_otp: { Args: { phone: string }; Returns: boolean }
      hash_otp_code: { Args: { otp_code: string }; Returns: string }
      verify_otp_code: {
        Args: { hashed_otp: string; plain_otp: string }
        Returns: boolean
      }
      verify_otp_secure: {
        Args: { otp: string; phone: string }
        Returns: {
          phone_verified: string
          success: boolean
        }[]
      }
    }
    Enums: {
      bot_status: "running" | "paused" | "stopped" | "error"
      order_status:
        | "pending"
        | "filled"
        | "partially_filled"
        | "cancelled"
        | "rejected"
      order_type: "market" | "limit" | "stop" | "stop_limit"
      portfolio_type: "real" | "demo"
      position_side: "buy" | "sell"
      strategy_type: "arbitrage" | "scalping" | "grid" | "trend_following"
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
      bot_status: ["running", "paused", "stopped", "error"],
      order_status: [
        "pending",
        "filled",
        "partially_filled",
        "cancelled",
        "rejected",
      ],
      order_type: ["market", "limit", "stop", "stop_limit"],
      portfolio_type: ["real", "demo"],
      position_side: ["buy", "sell"],
      strategy_type: ["arbitrage", "scalping", "grid", "trend_following"],
    },
  },
} as const
