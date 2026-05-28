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
          twitch_id: string | null
          twitch_username: string | null
          twitch_display_name: string | null
          twitch_avatar_url: string | null
          twitch_email: string | null
          app_role: string
          profile_visibility: string
          employment_title: string | null
          company_role: string | null
          department: string | null
          industry: string | null
          country: string | null
          city: string | null
          about: string | null
          contact_email: string | null
          mobile_phone: string | null
          phone: string | null
          company_website: string | null
          company_address: string | null
          preferred_contact_method: string | null
          social_links: Json
          profile_completed_at: string | null
          is_admin: boolean
          is_partner: boolean
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          twitch_id?: string | null
          twitch_username?: string | null
          twitch_display_name?: string | null
          twitch_avatar_url?: string | null
          twitch_email?: string | null
          app_role?: string
          profile_visibility?: string
          employment_title?: string | null
          company_role?: string | null
          department?: string | null
          industry?: string | null
          country?: string | null
          city?: string | null
          about?: string | null
          contact_email?: string | null
          mobile_phone?: string | null
          phone?: string | null
          company_website?: string | null
          company_address?: string | null
          preferred_contact_method?: string | null
          social_links?: Json
          profile_completed_at?: string | null
          is_admin?: boolean
          is_partner?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          twitch_id?: string | null
          twitch_username?: string | null
          twitch_display_name?: string | null
          twitch_avatar_url?: string | null
          twitch_email?: string | null
          app_role?: string
          profile_visibility?: string
          employment_title?: string | null
          company_role?: string | null
          department?: string | null
          industry?: string | null
          country?: string | null
          city?: string | null
          about?: string | null
          contact_email?: string | null
          mobile_phone?: string | null
          phone?: string | null
          company_website?: string | null
          company_address?: string | null
          preferred_contact_method?: string | null
          social_links?: Json
          profile_completed_at?: string | null
          is_admin?: boolean
          is_partner?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          website: string | null
          industry: string | null
          country: string | null
          city: string | null
          address: string | null
          description: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          website?: string | null
          industry?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          website?: string | null
          industry?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          id: string
          company_id: string
          profile_id: string
          role_title: string | null
          relationship_type: string
          status: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          profile_id: string
          role_title?: string | null
          relationship_type?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          profile_id?: string
          role_title?: string | null
          relationship_type?: string
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          subject: string
          content: string
          is_read: boolean
          message_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          subject: string
          content: string
          is_read?: boolean
          message_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string | null
          subject?: string
          content?: string
          is_read?: boolean
          message_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          room_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          room_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          room_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          created_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          created_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          created_at?: string
          last_message_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          admin_id: string | null
          title: string
          description: string | null
          appointment_date: string
          duration_minutes: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          admin_id?: string | null
          title: string
          description?: string | null
          appointment_date: string
          duration_minutes?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          admin_id?: string | null
          title?: string
          description?: string | null
          appointment_date?: string
          duration_minutes?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      forum_topics: {
        Row: {
          id: string
          category_id: string
          author_id: string
          title: string
          slug: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          author_id: string
          title: string
          slug: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          author_id?: string
          title?: string
          slug?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          author_id: string
          content: string
          is_solution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          author_id: string
          content: string
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          author_id?: string
          content?: string
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image_url: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          cover_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
