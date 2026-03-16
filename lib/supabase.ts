import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tyngthitmwazseosvums.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bmd0aGl0bXdhenNlb3N2dW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Nzk3NzksImV4cCI6MjA4OTE1NTc3OX0.ef37Bs_3Z3TTgZ8diCHl0h5PHkV2Thmkt8aphSC6_4Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
