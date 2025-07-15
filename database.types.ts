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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          download_url: string | null
          file_name: string
          file_size: number
          file_type: string
          id: number
          note_id: number | null
          storage_path: string
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          download_url?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: number
          note_id?: number | null
          storage_path: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          download_url?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: number
          note_id?: number | null
          storage_path?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          commenter_avatar_url: string | null
          commenter_name: string | null
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          is_hidden_by_moderator: boolean
          note_id: number
          parent_comment_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commenter_avatar_url?: string | null
          commenter_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_hidden_by_moderator?: boolean
          note_id: number
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commenter_avatar_url?: string | null
          commenter_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_hidden_by_moderator?: boolean
          note_id?: number
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_note_id"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "fk_comments_note_id"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_note_id"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_note_id"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: number
          note_id: number
          upload_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: number
          note_id: number
          upload_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: number
          note_id?: number
          upload_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_collaborators: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: number
          note_id: number | null
          permission: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          note_id?: number | null
          permission?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          note_id?: number | null
          permission?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_collaborators_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "note_collaborators_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_collaborators_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_collaborators_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_edit_sessions: {
        Row: {
          id: number
          last_activity: string | null
          note_id: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          id?: number
          last_activity?: string | null
          note_id?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          id?: number
          last_activity?: string | null
          note_id?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_edit_sessions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "note_edit_sessions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_edit_sessions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_edit_sessions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_favorites: {
        Row: {
          created_at: string | null
          id: number
          note_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          note_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          note_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_favorites_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "note_attachment_stats"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "note_favorites_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_favorites_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_favorites_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "public_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          creator_name: string | null
          id: number
          is_favorite: boolean
          is_public: boolean | null
          parent_document: number | null
          title: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          creator_name?: string | null
          id?: number
          is_favorite?: boolean
          is_public?: boolean | null
          parent_document?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          creator_name?: string | null
          id?: number
          is_favorite?: boolean
          is_public?: boolean | null
          parent_document?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_to: string | null
          message: string
          source_comment_id: string | null
          source_user_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          message: string
          source_comment_id?: string | null
          source_user_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          message?: string
          source_comment_id?: string | null
          source_user_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_source_comment_id_fkey"
            columns: ["source_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      note_attachment_stats: {
        Row: {
          attachment_count: number | null
          file_count: number | null
          folder_count: number | null
          note_id: number | null
          title: string | null
          total_size: number | null
          user_id: string | null
        }
        Relationships: []
      }
      notes_with_creator: {
        Row: {
          attachment_count: number | null
          comment_count: number | null
          content: string | null
          created_at: string | null
          creator_email: string | null
          creator_name: string | null
          has_favorites: boolean | null
          id: number | null
          is_public: boolean | null
          parent_document: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Relationships: []
      }
      public_notes: {
        Row: {
          attachment_count: number | null
          comment_count: number | null
          content: string | null
          created_at: string | null
          creator_email: string | null
          creator_name: string | null
          has_favorites: boolean | null
          id: number | null
          is_public: boolean | null
          parent_document: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      clean_expired_permissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_collaborators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_edit_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_children_notes_recursively: {
        Args: { note_id: number }
        Returns: {
          content: string | null
          created_at: string
          creator_name: string | null
          id: number
          is_favorite: boolean
          is_public: boolean | null
          parent_document: number | null
          title: string | null
          updated_at: string
          user_id: string
          views: number | null
        }[]
      }
      get_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      invite_collaborator_by_email: {
        Args:
          | {
              note_id_param: number
              user_email_param: string
              permission_param: string
              expires_at_param?: string
            }
          | {
              note_id_param: number
              user_email_param: string
              permission_param?: string
            }
        Returns: Json
      }
    }
    Enums: {
      permission_type: "VIEWER" | "EDITOR"
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
      permission_type: ["VIEWER", "EDITOR"],
    },
  },
} as const
