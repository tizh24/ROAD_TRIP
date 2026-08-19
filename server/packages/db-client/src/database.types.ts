export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
  public: {
    Tables: {
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string;
          id: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          id: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
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
          start_date: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
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
          start_date: string;
          status?: string;
          title: string;
          updated_at?: string;
          version?: number;
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
          start_date?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
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
  notification_schema: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  trip_schema: {
    Enums: {},
  },
} as const;
