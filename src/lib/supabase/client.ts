import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mesbwbazijuayqctilee.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lc2J3YmF6aWp1YXlxY3RpbGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODQ3NTMsImV4cCI6MjEwMjU2MDc1M30.gSQG_PnhnemVc4fWkHrgvddOZiigk-s7_QjyW_T8RVE'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
