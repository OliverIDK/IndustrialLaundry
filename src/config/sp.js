import { createClient } from '@supabase/supabase-js';
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig.extra.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = Constants.expoConfig.extra.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
