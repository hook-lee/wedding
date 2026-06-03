export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      wedding_sites: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          groom_name: string;
          bride_name: string;
          parents: Json;
          wedding_at: string | null;
          venue_name: string;
          venue_address: string;
          venue_lat: number | null;
          venue_lng: number | null;
          greeting: string;
          groom_profile: Json;
          bride_profile: Json;
          story_items: Json;
          account_info: Json;
          main_photo_url: string | null;
          gallery_urls: string[];
          bgm_tracks: Json;
          theme: "ivory" | "sage" | "pink" | "cobalt" | "mocha" | "ash";
          name_joiner: string;
          sections_enabled: Json;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          groom_name?: string;
          bride_name?: string;
          parents?: Json;
          wedding_at?: string | null;
          venue_name?: string;
          venue_address?: string;
          venue_lat?: number | null;
          venue_lng?: number | null;
          greeting?: string;
          groom_profile?: Json;
          bride_profile?: Json;
          story_items?: Json;
          account_info?: Json;
          main_photo_url?: string | null;
          gallery_urls?: string[];
          bgm_tracks?: Json;
          theme?: "ivory" | "sage" | "pink" | "cobalt" | "mocha" | "ash";
          name_joiner?: string;
          sections_enabled?: Json;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wedding_sites"]["Insert"]>;
        Relationships: [];
      };
      guestbook: {
        Row: {
          id: string;
          site_id: string;
          guest_name: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          guest_name: string;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guestbook"]["Insert"]>;
        Relationships: [];
      };
      rsvp: {
        Row: {
          id: string;
          site_id: string;
          guest_name: string;
          phone: string | null;
          attending: boolean;
          party_size: number;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          guest_name: string;
          phone?: string | null;
          attending: boolean;
          party_size?: number;
          message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvp"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Convenience helper used elsewhere in code
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
