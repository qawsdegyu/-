import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lppenxapoklcuwmmgclt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcGVueGFwb2tsY3V3bW1nY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzQxMjAsImV4cCI6MjA5OTc1MDEyMH0.efdWjWFratml2CjjKrx9oAABQMvsHTKencBB2d-gLTE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
