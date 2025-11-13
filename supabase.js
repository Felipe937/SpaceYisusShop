// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://iexiugoyykoyrajhbekc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleGl1Z295eWtveXJhamhiZWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzIwOTMsImV4cCI6MjA3ODQwODA5M30.DIDTdoOSxfO5XlhFCuJAck6GGNzm9S32NqHktamkd18';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      Accept: 'application/json', // 🔥 evita el 406
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
});
