export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          auth_provider: 'email' | 'google'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          auth_provider?: 'email' | 'google'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          auth_provider?: 'email' | 'google'
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          currency: string
          balance: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          currency?: string
          balance?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          currency?: string
          balance?: number | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          type: 'income' | 'expense' | 'transfer'
          category_id: string
          amount: number
          date: string
          notes: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
          is_recurring_instance: boolean
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          type: 'income' | 'expense' | 'transfer'
          category_id: string
          amount: number
          date: string
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
          is_recurring_instance?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          type?: 'income' | 'expense' | 'transfer'
          category_id?: string
          amount?: number
          date?: string
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
          is_recurring_instance?: boolean
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          month?: number
          year?: number
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          target_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          target_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          target_date?: string
          created_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string
          amount: number
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          next_occurrence: string
          auto_generate: boolean
          is_subscription: boolean
          billing_cycle: 'monthly' | 'yearly' | 'custom'
          vendor_name: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id: string
          amount: number
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          next_occurrence: string
          auto_generate?: boolean
          is_subscription?: boolean
          billing_cycle?: 'monthly' | 'yearly' | 'custom'
          vendor_name?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string
          amount?: number
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          next_occurrence?: string
          auto_generate?: boolean
          is_subscription?: boolean
          billing_cycle?: 'monthly' | 'yearly' | 'custom'
          vendor_name?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

