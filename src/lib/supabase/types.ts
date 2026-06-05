export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          has_specials: boolean;
          has_appetizers: boolean;
          has_mains: boolean;
          has_sides: boolean;
          has_drinks: boolean;
          has_desserts: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          has_specials?: boolean;
          has_appetizers?: boolean;
          has_mains?: boolean;
          has_sides?: boolean;
          has_drinks?: boolean;
          has_desserts?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          has_specials?: boolean;
          has_appetizers?: boolean;
          has_mains?: boolean;
          has_sides?: boolean;
          has_drinks?: boolean;
          has_desserts?: boolean;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string;
          price: number;
          category: Database["public"]["Enums"]["category"];
          image_url: string | null;
          is_featured: boolean;
          is_available: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description: string;
          price: number;
          category: Database["public"]["Enums"]["category"];
          image_url?: string | null;
          is_featured?: boolean;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: Database["public"]["Enums"]["category"];
          image_url?: string | null;
          is_featured?: boolean;
          is_available?: boolean;
          sort_order?: number;
        };
      };
      nfc_tags: {
        Row: {
          id: string;
          restaurant_id: string;
          label: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          label: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          label?: string;
          created_at?: string;
        };
      };
      click_events: {
        Row: {
          id: string;
          restaurant_id: string;
          nfc_tag_id: string;
          event_type: Database["public"]["Enums"]["event_type"];
          menu_item_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          nfc_tag_id: string;
          event_type: Database["public"]["Enums"]["event_type"];
          menu_item_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          nfc_tag_id?: string;
          event_type?: Database["public"]["Enums"]["event_type"];
          menu_item_id?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          nfc_tag_id: string;
          body: string;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          nfc_tag_id: string;
          body: string;
          rating: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          nfc_tag_id?: string;
          body?: string;
          rating?: number;
          created_at?: string;
        };
      };
    };
    Enums: {
      category:
        | "specials"
        | "appetizers"
        | "mains"
        | "sides"
        | "drinks"
        | "desserts";
      event_type: "menu_open" | "item_tap";
    };
  };
};
