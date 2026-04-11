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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note_text: string
          target_user_id: string
          type: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note_text: string
          target_user_id: string
          type?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note_text?: string
          target_user_id?: string
          type?: string
        }
        Relationships: []
      }
      ai_avatar_profiles: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          personality_summary: string | null
          topics_allowed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          personality_summary?: string | null
          topics_allowed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          personality_summary?: string | null
          topics_allowed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_suggestions: {
        Row: {
          content: string
          created_at: string
          id: string
          suggestion_type: string
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          suggestion_type: string
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          suggestion_type?: string
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          members_count: number
          name: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          members_count?: number
          name: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          members_count?: number
          name?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_scores: {
        Row: {
          id: string
          score: number
          signals_json: Json | null
          target_user_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          score?: number
          signals_json?: Json | null
          target_user_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          score?: number
          signals_json?: Json | null
          target_user_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          hidden_at: string | null
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          hidden_at?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          hidden_at?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dates: {
        Row: {
          created_at: string
          id: string
          idea: string
          idea_emoji: string | null
          location: string | null
          message_text: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea?: string
          idea_emoji?: string | null
          location?: string | null
          message_text?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea?: string
          idea_emoji?: string | null
          location?: string | null
          message_text?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      dating_preferences: {
        Row: {
          communication_goals: string[] | null
          created_at: string
          dating_style: string | null
          id: string
          looking_for_gender: string | null
          max_age: number | null
          min_age: number | null
          preferred_city_mode: string | null
          ready_for_chat: boolean | null
          ready_for_meetings: boolean | null
          show_in_discover: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_goals?: string[] | null
          created_at?: string
          dating_style?: string | null
          id?: string
          looking_for_gender?: string | null
          max_age?: number | null
          min_age?: number | null
          preferred_city_mode?: string | null
          ready_for_chat?: boolean | null
          ready_for_meetings?: boolean | null
          show_in_discover?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_goals?: string[] | null
          created_at?: string
          dating_style?: string | null
          id?: string
          looking_for_gender?: string | null
          max_age?: number | null
          min_age?: number | null
          preferred_city_mode?: string | null
          ready_for_chat?: boolean | null
          ready_for_meetings?: boolean | null
          show_in_discover?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flagged_messages: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          id: string
          message_id: string
          reason: string
          reporter_id: string | null
          risk_level: string
          status: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          id?: string
          message_id: string
          reason: string
          reporter_id?: string | null
          risk_level?: string
          status?: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string | null
          risk_level?: string
          status?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          conversation_id: string | null
          created_at: string
          gift_type: string
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          gift_type?: string
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          gift_type?: string
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          user_id: string
          uses: number
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          user_id: string
          uses?: number
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          user_id?: string
          uses?: number
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          is_super: boolean
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          is_super?: boolean
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          is_super?: boolean
          to_user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      meetup_participants: {
        Row: {
          created_at: string
          id: string
          meetup_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meetup_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meetup_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_participants_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
        ]
      }
      meetups: {
        Row: {
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          host_user_id: string
          id: string
          lat: number | null
          lng: number | null
          max_participants: number | null
          start_time: string
          tags: string[] | null
          title: string
        }
        Insert: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          host_user_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          max_participants?: number | null
          start_time: string
          tags?: string[] | null
          title: string
        }
        Update: {
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          host_user_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          max_participants?: number | null
          start_time?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_system: boolean | null
          media_type: string | null
          media_url: string | null
          read_at: string | null
          sender_id: string
          text: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id: string
          text?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category: string | null
          city: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          duplicate_of: string | null
          excerpt: string | null
          id: string
          image_gallery: string[] | null
          is_duplicate: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          source: string | null
          source_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          city?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          duplicate_of?: string | null
          excerpt?: string | null
          id?: string
          image_gallery?: string[] | null
          is_duplicate?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          city?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          duplicate_of?: string | null
          excerpt?: string | null
          id?: string
          image_gallery?: string[] | null
          is_duplicate?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      passes: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: []
      }
      personality_profiles: {
        Row: {
          answers: Json
          created_at: string
          id: string
          personality_type: string
          traits: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          personality_type?: string
          traits?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          personality_type?: string
          traits?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[] | null
          likes_count: number
          shares_count: number
          visibility: string
        }
        Insert: {
          author_id: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          likes_count?: number
          shares_count?: number
          visibility?: string
        }
        Update: {
          author_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          likes_count?: number
          shares_count?: number
          visibility?: string
        }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          expires_at: string
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          age: number | null
          ai_confidence_score: number | null
          anonymous_browsing: boolean | null
          avatar_url: string | null
          city: string | null
          communication_goals: string[] | null
          communication_style: string | null
          cover_url: string | null
          created_at: string
          education: string | null
          favorite_books: string[] | null
          favorite_movies: string[] | null
          favorite_music: string[] | null
          favorite_places: string[] | null
          first_name: string
          gender: string | null
          id: string
          ideal_date: string | null
          interests: string[] | null
          is_banned: boolean | null
          is_online: boolean | null
          is_verified: boolean | null
          is_vip: boolean | null
          last_name: string
          life_values: string[] | null
          lifestyle: string[] | null
          looking_for_company: boolean | null
          looking_for_gender: string | null
          mood_status: string | null
          mood_updated_at: string | null
          privacy_profile_visible: string | null
          privacy_who_can_message: string | null
          ready_for_chat: boolean | null
          ready_for_meetings: boolean | null
          risk_score: number | null
          safety_flags: string[] | null
          show_in_discover: boolean | null
          show_on_map: boolean | null
          status_text: string | null
          temperament: string | null
          trust_score: number | null
          updated_at: string
          user_id: string
          username: string | null
          work: string | null
        }
        Insert: {
          about?: string | null
          age?: number | null
          ai_confidence_score?: number | null
          anonymous_browsing?: boolean | null
          avatar_url?: string | null
          city?: string | null
          communication_goals?: string[] | null
          communication_style?: string | null
          cover_url?: string | null
          created_at?: string
          education?: string | null
          favorite_books?: string[] | null
          favorite_movies?: string[] | null
          favorite_music?: string[] | null
          favorite_places?: string[] | null
          first_name?: string
          gender?: string | null
          id?: string
          ideal_date?: string | null
          interests?: string[] | null
          is_banned?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          is_vip?: boolean | null
          last_name?: string
          life_values?: string[] | null
          lifestyle?: string[] | null
          looking_for_company?: boolean | null
          looking_for_gender?: string | null
          mood_status?: string | null
          mood_updated_at?: string | null
          privacy_profile_visible?: string | null
          privacy_who_can_message?: string | null
          ready_for_chat?: boolean | null
          ready_for_meetings?: boolean | null
          risk_score?: number | null
          safety_flags?: string[] | null
          show_in_discover?: boolean | null
          show_on_map?: boolean | null
          status_text?: string | null
          temperament?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          work?: string | null
        }
        Update: {
          about?: string | null
          age?: number | null
          ai_confidence_score?: number | null
          anonymous_browsing?: boolean | null
          avatar_url?: string | null
          city?: string | null
          communication_goals?: string[] | null
          communication_style?: string | null
          cover_url?: string | null
          created_at?: string
          education?: string | null
          favorite_books?: string[] | null
          favorite_movies?: string[] | null
          favorite_music?: string[] | null
          favorite_places?: string[] | null
          first_name?: string
          gender?: string | null
          id?: string
          ideal_date?: string | null
          interests?: string[] | null
          is_banned?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          is_vip?: boolean | null
          last_name?: string
          life_values?: string[] | null
          lifestyle?: string[] | null
          looking_for_company?: boolean | null
          looking_for_gender?: string | null
          mood_status?: string | null
          mood_updated_at?: string | null
          privacy_profile_visible?: string | null
          privacy_who_can_message?: string | null
          ready_for_chat?: boolean | null
          ready_for_meetings?: boolean | null
          risk_score?: number | null
          safety_flags?: string[] | null
          show_in_discover?: boolean | null
          show_on_map?: boolean | null
          status_text?: string | null
          temperament?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          work?: string | null
        }
        Relationships: []
      }
      relationship_coach_suggestions: {
        Row: {
          context_type: string
          created_at: string
          id: string
          suggestion: string
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          context_type?: string
          created_at?: string
          id?: string
          suggestion?: string
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string
          id?: string
          suggestion?: string
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          assigned_to: string | null
          created_at: string
          details: Json | null
          id: string
          priority: string
          reason: string
          resolution_note: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          priority: string
          reason: string
          resolution_note?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          priority?: string
          reason?: string
          resolution_note?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_permanent: boolean
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          target_user_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_user_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_user_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          city: string | null
          id: string
          lat: number
          lng: number
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          id?: string
          lat: number
          lng: number
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          id?: string
          lat?: number
          lng?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_login_date: string
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_login_date?: string
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_login_date?: string
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vibe_room_participants: {
        Row: {
          id: string
          joined_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibe_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "vibe_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_rooms: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          emoji: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          participants_count: number | null
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          emoji?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          participants_count?: number | null
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          emoji?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          participants_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_or_create_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
