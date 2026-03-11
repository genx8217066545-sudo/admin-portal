
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client proxy or throw? 
    // For build safety, return a mock or throw a specific error that components might catch?
    // Actually, createBrowserClient might handle empty strings if we just default them, 
    // but operations will fail.
    // Let's pass empty strings if missing, so it doesn't crash *creation*.
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseKey || 'placeholder'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
