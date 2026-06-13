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
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string
          phone: string
          role: 'customer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          avatar_url?: string
          phone?: string
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string
          phone?: string
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          image_url: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          image_url?: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string
          parent_id?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string
          stock_quantity: number
          category_id: string | null
          images: Json
          tags: string[]
          is_active: boolean
          is_featured: boolean
          weight: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku: string
          stock_quantity?: number
          category_id?: string | null
          images?: Json
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          weight?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string
          stock_quantity?: number
          category_id?: string | null
          images?: Json
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          weight?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          options: Json
          price: number
          stock_quantity: number
          sku: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          options?: Json
          price: number
          stock_quantity?: number
          sku: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          options?: Json
          price?: number
          stock_quantity?: number
          sku?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax: number
          shipping: number
          discount: number
          total: number
          shipping_address: Json
          payment_intent_id: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax?: number
          shipping?: number
          discount?: number
          total: number
          shipping_address: Json
          payment_intent_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          tax?: number
          shipping?: number
          discount?: number
          total?: number
          shipping_address?: Json
          payment_intent_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot: Json
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot: Json
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          product_snapshot?: Json
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string
          body: string
          is_verified_purchase: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string
          body?: string
          is_verified_purchase?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string
          body?: string
          is_verified_purchase?: boolean
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed'
          value: number
          min_order_amount: number
          max_uses: number
          used_count: number
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          code: string
          type?: 'percentage' | 'fixed'
          value: number
          min_order_amount?: number
          max_uses?: number
          used_count?: number
          expires_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed'
          value?: number
          min_order_amount?: number
          max_uses?: number
          used_count?: number
          expires_at?: string
          is_active?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      profile_role: 'customer' | 'admin'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      coupon_type: 'percentage' | 'fixed'
    }
  }
}
