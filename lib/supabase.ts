import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://kkgujlnkrazsqwsjlvon.supabase.co";

/** Anon / publishable key — safe for the browser. */
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ3VqbG5rcmF6c3F3c2psdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2ODAwNTEsImV4cCI6MjA5ODI1NjA1MX0.8sO3kUC29_Hn3zS6BDatM3S0z4QC0-FQFX62XwWofVQ";

export const LEADER_PHOTO_BUCKET = "athlete-documents";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
