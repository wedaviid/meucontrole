import { carregarSyncConfig, criarCliente } from './supabaseClient'
import { normalizarMes } from './storage'

/** Sobe um valor para a nuvem (upsert). Silencioso se não houver config. */
export async function syncPush(chave: string, valor: unknown): Promise<{ ok: boolean; erro?: string }> {
  const config = carregarSyncConfig()
  if (!config) return { ok: false, erro: 'nao_configurado' }

  try {
    const sb = criarCliente(config)
    const { error } = await sb.from('mc_dados').upsert(
      {
        familia_id: config.familiaId,
        chave,
        valor,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'familia_id,chave' }
    )
    if (error) return { ok: false, erro: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro_desconhecido' }
  }
}

/** Baixa um valor da nuvem. */
export async function syncPull<T>(chave: string): Promise<{ ok: boolean; valor?: T; erro?: string }> {
  const config = carregarSyncConfig()
  if (!config) return { ok: false, erro: 'nao_configurado' }

  try {
    const sb = criarCliente(config)
    const { data, error } = await sb
      .from('mc_dados')
      .select('valor, updated_at')
      .eq('familia_id', config.familiaId)
      .eq('chave', chave)
      .maybeSingle()

    if (error) return { ok: false, erro: error.message }
    if (!data) return { ok: true, valor: undefined }
    return { ok: true, valor: data.valor as T }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro_desconhecido' }
  }
}

/** Baixa todas as chaves da família. */
export async function syncPullAll(): Promise<{
  ok: boolean
  dados?: Record<string, unknown>
  erro?: string
}> {
  const config = carregarSyncConfig()
  if (!config) return { ok: false, erro: 'nao_configurado' }

  try {
    const sb = criarCliente(config)
    const { data, error } = await sb
      .from('mc_dados')
      .select('chave, valor')
      .eq('familia_id', config.familiaId)

    if (error) return { ok: false, erro: error.message }
    const mapa: Record<string, unknown> = {}
    for (const row of data || []) {
      mapa[row.chave] = row.valor
    }
    return { ok: true, dados: mapa }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro_desconhecido' }
  }
}

/** Aplica payload da nuvem no localStorage (ignora _ping e config). */
export function aplicarDadosNuvemNoLocal(dados: Record<string, unknown>): number {
  let n = 0
  for (const [chave, valor] of Object.entries(dados)) {
    if (chave === '_ping') continue
    if (chave === 'meucontrole_sync_config') continue
    try {
      // mes_atual deve ser texto limpo YYYY-MM (sem aspas de JSON)
      if (chave === 'meucontrole_mes_atual') {
        const mes = normalizarMes(valor)
        if (mes) {
          localStorage.setItem(chave, mes)
          n++
        }
        continue
      }
      localStorage.setItem(chave, JSON.stringify(valor))
      n++
    } catch {
      /* ignore quota */
    }
  }
  return n
}

/**
 * Baixa tudo da nuvem e grava no localStorage.
 * Usado ao abrir o app e ao voltar para a aba.
 */
export async function syncAutoPull(): Promise<{ ok: boolean; itens?: number; erro?: string }> {
  if (!carregarSyncConfig()) return { ok: false, erro: 'nao_configurado' }
  const r = await syncPullAll()
  if (!r.ok) return { ok: false, erro: r.erro }
  const itens = aplicarDadosNuvemNoLocal(r.dados || {})
  try {
    localStorage.setItem('meucontrole_last_sync', new Date().toISOString())
  } catch {}
  return { ok: true, itens }
}

/** Envia todas as chaves locais meucontrole_* para a nuvem. */
export async function syncEnviarTudo(): Promise<{ ok: boolean; enviados: number; falhas: number; erro?: string }> {
  if (!carregarSyncConfig()) return { ok: false, enviados: 0, falhas: 0, erro: 'nao_configurado' }
  let enviados = 0
  let falhas = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('meucontrole_')) continue
    if (key === 'meucontrole_sync_config') continue
    if (key === 'meucontrole_last_sync') continue
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) continue
      const valor = JSON.parse(raw)
      const r = await syncPush(key, valor)
      if (r.ok) enviados++
      else falhas++
    } catch {
      falhas++
    }
  }
  return { ok: falhas === 0, enviados, falhas }
}

/** Testa conexão e permissão de escrita. */
export async function syncTestar(): Promise<{ ok: boolean; erro?: string }> {
  const config = carregarSyncConfig()
  if (!config) return { ok: false, erro: 'Configure URL, chave e código da família.' }

  try {
    const sb = criarCliente(config)
    const { error } = await sb.from('mc_dados').upsert(
      {
        familia_id: config.familiaId,
        chave: '_ping',
        valor: { t: Date.now() },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'familia_id,chave' }
    )
    if (error) return { ok: false, erro: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro_desconhecido' }
  }
}
