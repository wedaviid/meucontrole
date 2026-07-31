import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const CONFIG_KEY = 'meucontrole_sync_config'

export interface SyncConfig {
  url: string
  anonKey: string
  familiaId: string
}

export function carregarSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as SyncConfig
    if (c.url && c.anonKey && c.familiaId) return c
    return null
  } catch {
    return null
  }
}

export function salvarSyncConfig(config: SyncConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  // Invalida cliente em cache se mudou URL/chave
  cachedClient = null
  cachedKey = null
}

export function limparSyncConfig(): void {
  localStorage.removeItem(CONFIG_KEY)
  cachedClient = null
  cachedKey = null
}

let cachedClient: SupabaseClient | null = null
let cachedKey: string | null = null

/** Um único cliente por URL+chave (evita warning Multiple GoTrueClient). */
export function criarCliente(config: SyncConfig): SupabaseClient {
  const key = `${config.url}::${config.anonKey}`
  if (cachedClient && cachedKey === key) return cachedClient
  cachedClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `mc-sb-${config.familiaId}`,
    },
  })
  cachedKey = key
  return cachedClient
}
