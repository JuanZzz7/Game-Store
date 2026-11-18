import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('tu-proyecto')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Las credenciales no están configuradas completamente en .env.local. ' +
    'Asegúrate de que VITE_SUPABASE_URL sea una URL válida (ej: https://xyz.supabase.co) ' +
    'y VITE_SUPABASE_ANON_KEY tu clave anónima (anon/publishable key).'
  )
}

// Cliente de Supabase
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface GameRecord {
  id: string
  title: string
  genre: string
  category: string
  platforms: string[]
  rating: number
  price: number
  original_price: number
  discount: number
  image_url: string
}

export interface NewsRecord {
  id: string
  title: string
  category: string
  published_date: string
  excerpt: string
  image_url: string
}

// ==========================================
// AUTENTICACIÓN CON GOOGLE (OAuth)
// ==========================================

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return {
      error: new Error('Supabase no está configurado. Revisa tu archivo .env.local')
    }
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

    return { error: error ? new Error(error.message) : null }
  } catch (err: any) {
    return { error: err }
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  if (!supabase) return { error: null }
  const { error } = await supabase.auth.signOut()
  return { error: error ? new Error(error.message) : null }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

// ==========================================
// SERVICIOS DE DATOS
// ==========================================

export async function fetchGamesFromSupabase(): Promise<GameRecord[] | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('rating', { ascending: false })

    if (error) {
      console.error('[Supabase] Error al consultar juegos:', error.message)
      return null
    }

    return data && data.length > 0 ? (data as GameRecord[]) : null
  } catch (err) {
    console.error('[Supabase] Excepción al consultar juegos:', err)
    return null
  }
}

export async function fetchNewsFromSupabase(): Promise<NewsRecord[] | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Supabase] Error al consultar noticias:', error.message)
      return null
    }

    return data && data.length > 0 ? (data as NewsRecord[]) : null
  } catch (err) {
    console.error('[Supabase] Excepción al consultar noticias:', err)
    return null
  }
}

export async function saveNewsletterSubscriber(email: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email, subscribed_at: new Date().toISOString() }])

    if (error) {
      console.error('[Supabase] Error al guardar suscriptor:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[Supabase] Excepción al guardar suscriptor:', err)
    return false
  }
}

export async function saveOrder(orderData: {
  customer_name?: string
  total: number
  items: Array<{ id: string; title: string; price: number }>
}): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('orders')
      .insert([
        {
          total: orderData.total,
          items: orderData.items,
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('[Supabase] Error al registrar orden:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[Supabase] Excepción al registrar orden:', err)
    return false
  }
}
