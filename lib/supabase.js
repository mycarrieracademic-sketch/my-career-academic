import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sxqddwpszfumcwxtmxsk.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

export const supabase = createClient(supabaseUrl, supabaseKey);
