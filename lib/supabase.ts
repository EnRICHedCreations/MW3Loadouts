import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Loadout = {
  id: string;
  created_at: string;
  user_id: string;
  author: string;
  title: string;
  weapon_class: string;
  attachments: string;
  description: string;
  image_url: string | null;
  likes: number;
  views: number;
};

export type Profile = {
  id: string;
  username: string;
  created_at: string;
};
