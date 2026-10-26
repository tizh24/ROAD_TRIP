export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  billing_schema: {
    Tables: {
      orders: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          id: string;
          item_id: string;
          item_type: string;
          metadata: Json;
          payment_method: string | null;
          payment_ref: string | null;
          status: string;
          title: string;
          trip_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          id?: string;
          item_id: string;
          item_type: string;
          metadata?: Json;
          payment_method?: string | null;
          payment_ref?: string | null;
          status?: string;
          title: string;
          trip_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          item_id?: string;
          item_type?: string;
          metadata?: Json;
          payment_method?: string | null;
          payment_ref?: string | null;
          status?: string;
          title?: string;
          trip_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          currency: string;
          id: string;
          order_id: string;
          payload: Json;
          processed_at: string;
          provider: string;
          signature: string | null;
          status: string;
          transaction_id: string;
        };
        Insert: {
          amount: number;
          currency?: string;
          id?: string;
          order_id: string;
          payload?: Json;
          processed_at?: string;
          provider?: string;
          signature?: string | null;
          status: string;
          transaction_id: string;
        };
        Update: {
          amount?: number;
          currency?: string;
          id?: string;
          order_id?: string;
          payload?: Json;
          processed_at?: string;
          provider?: string;
          signature?: string | null;
          status?: string;
          transaction_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      travel_books: {
        Row: {
          cover_photo_url: string | null;
          created_at: string;
          format: string;
          id: string;
          order_id: string | null;
          page_count: number;
          preview_data: Json;
          shipping_address: Json | null;
          status: string;
          subtitle: string | null;
          title: string;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cover_photo_url?: string | null;
          created_at?: string;
          format?: string;
          id?: string;
          order_id?: string | null;
          page_count?: number;
          preview_data?: Json;
          shipping_address?: Json | null;
          status?: string;
          subtitle?: string | null;
          title: string;
          trip_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cover_photo_url?: string | null;
          created_at?: string;
          format?: string;
          id?: string;
          order_id?: string | null;
          page_count?: number;
          preview_data?: Json;
          shipping_address?: Json | null;
          status?: string;
          subtitle?: string | null;
          title?: string;
          trip_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'travel_books_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  community_schema: {
    Tables: {
      comments: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          post_id: string;
          status: string;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          post_id: string;
          status?: string;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_saves: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_saves_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          comment_count: number;
          content: string;
          created_at: string;
          id: string;
          like_count: number;
          location_name: string | null;
          media_urls: string[];
          save_count: number;
          status: string;
          title: string;
          trip_id: string | null;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          comment_count?: number;
          content: string;
          created_at?: string;
          id?: string;
          like_count?: number;
          location_name?: string | null;
          media_urls?: string[];
          save_count?: number;
          status?: string;
          title: string;
          trip_id?: string | null;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          comment_count?: number;
          content?: string;
          created_at?: string;
          id?: string;
          like_count?: number;
          location_name?: string | null;
          media_urls?: string[];
          save_count?: number;
          status?: string;
          title?: string;
          trip_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reporter_id: string;
          resolution_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reporter_id: string;
          resolution_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string;
          resolution_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  notification_schema: {
    Tables: {
      notification_deliveries: {
        Row: {
          attempts: number;
          channel: string;
          created_at: string;
          delivered_at: string | null;
          delivery_status: string;
          event_id: string;
          id: string;
          last_error: string | null;
          last_error_code: string | null;
          next_attempt_at: string;
          recipient: string;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          channel: string;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: string;
          event_id: string;
          id?: string;
          last_error?: string | null;
          last_error_code?: string | null;
          next_attempt_at?: string;
          recipient: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          channel?: string;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: string;
          event_id?: string;
          id?: string;
          last_error?: string | null;
          last_error_code?: string | null;
          next_attempt_at?: string;
          recipient?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_deliveries_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'processed_events';
            referencedColumns: ['event_id'];
          },
        ];
      };
      processed_events: {
        Row: {
          consumer_name: string;
          event_id: string;
          event_type: string;
          event_version: number;
          processed_at: string;
        };
        Insert: {
          consumer_name?: string;
          event_id: string;
          event_type: string;
          event_version: number;
          processed_at?: string;
        };
        Update: {
          consumer_name?: string;
          event_id?: string;
          event_type?: string;
          event_version?: number;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  partner_schema: {
    Tables: {
      applications: {
        Row: {
          business_name: string;
          business_type: string;
          contact_email: string;
          contact_phone: string;
          created_at: string;
          description: string | null;
          id: string;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          tax_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          business_name: string;
          business_type: string;
          contact_email: string;
          contact_phone: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          tax_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          business_name?: string;
          business_type?: string;
          contact_email?: string;
          contact_phone?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          tax_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          latitude: number | null;
          location_name: string;
          longitude: number | null;
          media_urls: string[];
          partner_id: string;
          price_amount: number;
          price_currency: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          id?: string;
          latitude?: number | null;
          location_name: string;
          longitude?: number | null;
          media_urls?: string[];
          partner_id: string;
          price_amount: number;
          price_currency?: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          latitude?: number | null;
          location_name?: string;
          longitude?: number | null;
          media_urls?: string[];
          partner_id?: string;
          price_amount?: number;
          price_currency?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      platform_audit_logs: {
        Row: {
          action: string;
          actor_id: string;
          correlation_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          ip_address: string | null;
          new_values: Json | null;
          old_values: Json | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_id: string;
          correlation_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string;
          correlation_id?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string;
          id: string;
          role: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          id: string;
          role?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          role?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  trip_schema: {
    Tables: {
      outbox_events: {
        Row: {
          aggregate_id: string;
          aggregate_type: string;
          attempts: number;
          correlation_id: string;
          created_at: string;
          event_type: string;
          event_version: number;
          id: string;
          last_error: string | null;
          next_attempt_at: string;
          occurred_at: string;
          payload: Json;
          publish_status: string;
          published_at: string | null;
          updated_at: string;
        };
        Insert: {
          aggregate_id: string;
          aggregate_type: string;
          attempts?: number;
          correlation_id: string;
          created_at?: string;
          event_type: string;
          event_version?: number;
          id?: string;
          last_error?: string | null;
          next_attempt_at?: string;
          occurred_at?: string;
          payload: Json;
          publish_status?: string;
          published_at?: string | null;
          updated_at?: string;
        };
        Update: {
          aggregate_id?: string;
          aggregate_type?: string;
          attempts?: number;
          correlation_id?: string;
          created_at?: string;
          event_type?: string;
          event_version?: number;
          id?: string;
          last_error?: string | null;
          next_attempt_at?: string;
          occurred_at?: string;
          payload?: Json;
          publish_status?: string;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_audit_logs: {
        Row: {
          action: string;
          actor_id: string;
          correlation_id: string | null;
          created_at: string;
          id: string;
          new_values: Json | null;
          old_values: Json | null;
          trip_id: string;
        };
        Insert: {
          action: string;
          actor_id: string;
          correlation_id?: string | null;
          created_at?: string;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          trip_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string;
          correlation_id?: string | null;
          created_at?: string;
          id?: string;
          new_values?: Json | null;
          old_values?: Json | null;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_audit_logs_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_days: {
        Row: {
          created_at: string;
          date: string;
          day_index: number;
          id: string;
          status: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          day_index: number;
          id?: string;
          status?: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          day_index?: number;
          id?: string;
          status?: string;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_days_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_expenses: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          payer_id: string;
          trip_id: string;
        };
        Insert: {
          amount: number;
          category?: string;
          created_at?: string;
          currency?: string;
          description: string;
          id?: string;
          payer_id: string;
          trip_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          payer_id?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_expenses_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_user_id: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          invitee_email: string;
          inviter_id: string;
          permission: string;
          status: string;
          token_hash: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          invitee_email: string;
          inviter_id: string;
          permission: string;
          status?: string;
          token_hash: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          invitee_email?: string;
          inviter_id?: string;
          permission?: string;
          status?: string;
          token_hash?: string;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_invitations_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_live_locations: {
        Row: {
          consent_given: boolean;
          id: string;
          latitude: number;
          longitude: number;
          sharing_active: boolean;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          consent_given?: boolean;
          id?: string;
          latitude: number;
          longitude: number;
          sharing_active?: boolean;
          trip_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          consent_given?: boolean;
          id?: string;
          latitude?: number;
          longitude?: number;
          sharing_active?: boolean;
          trip_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_live_locations_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_members: {
        Row: {
          id: string;
          joined_at: string;
          permission: string;
          role: string;
          status: string;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          permission?: string;
          role?: string;
          status?: string;
          trip_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          permission?: string;
          role?: string;
          status?: string;
          trip_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_members_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_memories: {
        Row: {
          cover_photo_url: string | null;
          created_at: string;
          id: string;
          summary: string | null;
          title: string;
          trip_id: string;
          updated_at: string;
          visibility: string;
        };
        Insert: {
          cover_photo_url?: string | null;
          created_at?: string;
          id?: string;
          summary?: string | null;
          title: string;
          trip_id: string;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          cover_photo_url?: string | null;
          created_at?: string;
          id?: string;
          summary?: string | null;
          title?: string;
          trip_id?: string;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_memories_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: true;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_memory_photos: {
        Row: {
          caption: string | null;
          created_at: string;
          id: string;
          memory_id: string;
          photo_url: string;
          taken_at: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          memory_id: string;
          photo_url: string;
          taken_at?: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          memory_id?: string;
          photo_url?: string;
          taken_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_memory_photos_memory_id_fkey';
            columns: ['memory_id'];
            isOneToOne: false;
            referencedRelation: 'trip_memories';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_stops: {
        Row: {
          address: string | null;
          arrival_time: string | null;
          created_at: string;
          day_id: string;
          departure_time: string | null;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          notes: string | null;
          place_id: string;
          status: string;
          stop_index: number;
          trip_id: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          address?: string | null;
          arrival_time?: string | null;
          created_at?: string;
          day_id: string;
          departure_time?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          notes?: string | null;
          place_id: string;
          status?: string;
          stop_index: number;
          trip_id: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          address?: string | null;
          arrival_time?: string | null;
          created_at?: string;
          day_id?: string;
          departure_time?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          notes?: string | null;
          place_id?: string;
          status?: string;
          stop_index?: number;
          trip_id?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_stops_trip_day_fkey';
            columns: ['trip_id', 'day_id'];
            isOneToOne: false;
            referencedRelation: 'trip_days';
            referencedColumns: ['trip_id', 'id'];
          },
          {
            foreignKeyName: 'trip_stops_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          budget_amount: number;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          description: string | null;
          end_date: string;
          id: string;
          owner_id: string;
          published_at: string | null;
          source_trip_id: string | null;
          start_date: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
          visibility: string;
        };
        Insert: {
          budget_amount?: number;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          end_date: string;
          id?: string;
          owner_id: string;
          published_at?: string | null;
          source_trip_id?: string | null;
          start_date: string;
          status?: string;
          title: string;
          updated_at?: string;
          version?: number;
          visibility?: string;
        };
        Update: {
          budget_amount?: number;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          end_date?: string;
          id?: string;
          owner_id?: string;
          published_at?: string | null;
          source_trip_id?: string | null;
          start_date?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_source_trip_id_fkey';
            columns: ['source_trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_trip_admin: { Args: { target_trip_id: string }; Returns: boolean };
      is_trip_editor: { Args: { target_trip_id: string }; Returns: boolean };
      is_trip_member: { Args: { target_trip_id: string }; Returns: boolean };
      is_trip_owner: { Args: { trip_id: string }; Returns: boolean };
      trip_access_level: { Args: { target_trip_id: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  users_schema: {
    Tables: {
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  billing_schema: {
    Enums: {},
  },
  community_schema: {
    Enums: {},
  },
  notification_schema: {
    Enums: {},
  },
  partner_schema: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  trip_schema: {
    Enums: {},
  },
  users_schema: {
    Enums: {},
  },
} as const;
