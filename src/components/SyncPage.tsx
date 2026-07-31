import { useState } from 'react'
import {
  carregarSyncConfig,
  salvarSyncConfig,
  limparSyncConfig,
  type SyncConfig,
} from '../utils/supabaseClient'
import { syncTestar, syncAutoPull, syncEnviarTudo } from '../utils/sync'

interface SyncPageProps {
  onSincronizado?: () => void
}

export function SyncPage({ onSincronizado }: SyncPageProps) {
  const existente = carregarSyncConfig()
  const [url, setUrl] = useState(existente?.url || '')
  const [anonKey, setAnonKey] = useState(existente?.anonKey || '')
  const [familiaId, setFamiliaId] = useState(existente?.familiaId || 'familia-eben')
  const [status, setStatus] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const conectado = !!existente

  const salvar = async () => {
    setErro('')
    setStatus('')
    if (!url.trim() || !anonKey.trim() || !familiaId.trim()) {
      setErro('Preencha URL, chave e código da família.')
      return
    }
    const config: SyncConfig = {
      url: url.trim().replace(/\/$/, ''),
      anonKey: anonKey.trim(),
      familiaId: familiaId.trim().toLowerCase().replace(/\s+/g, '-'),
    }
    salvarSyncConfig(config)
    setCarregando(true)
    const r = await syncTestar()
    setCarregando(false)
    if (!r.ok) {
      setErro(r.erro || 'Falha na conexão. Confira URL, chave e a tabela mc_dados.')
      return
    }
    setStatus('Conectado! Pode sincronizar.')
  }

  const puxar = async () => {
    setErro('')
    setStatus('')
    setCarregando(true)
    const r = await syncAutoPull()
    setCarregando(false)
    if (!r.ok) {
      setErro(r.erro || 'Erro ao baixar')
      return
    }
    setStatus(`Dados atualizados (${r.itens || 0} itens).`)
    onSincronizado?.()
  }

  const enviar = async () => {
    setErro('')
    setStatus('')
    setCarregando(true)
    const r = await syncEnviarTudo()
    setCarregando(false)
    if (r.falhas > 0) setErro(`${r.falhas} item(ns) falharam`)
    setStatus(`${r.enviados} item(ns) enviados para a nuvem.`)
  }

  const desconectar = () => {
    limparSyncConfig()
    setStatus('Desconectado. Os dados locais continuam neste aparelho.')
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Sincronização na nuvem</h3>
          <p className="text-sm text-slate-400 mt-1">
            Conecte nos dois aparelhos. Ao salvar, sobe sozinho; ao abrir o app, baixa sozinho.
          </p>
        </div>
        <div
          className={`self-start sm:self-auto rounded-xl border px-4 py-2 text-sm ${
            conectado
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }`}
        >
          {conectado ? `Conectado · ${existente?.familiaId}` : 'Ainda não conectado'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-medium text-slate-300">Configuração</h4>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">URL do projeto Supabase</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Chave anônima (anon / publishable)</label>
            <input
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOi... ou sb_publishable_..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">
              Código da família (igual nos dois aparelhos)
            </label>
            <input
              value={familiaId}
              onChange={(e) => setFamiliaId(e.target.value)}
              placeholder="familia-eben"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={salvar}
            disabled={carregando}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium disabled:opacity-50 transition"
          >
            {carregando ? 'Testando…' : 'Salvar e testar conexão'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Ações</h4>
            {conectado ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={enviar}
                  disabled={carregando}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-50 transition"
                >
                  Enviar dados deste aparelho
                </button>
                <button
                  onClick={puxar}
                  disabled={carregando}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-50 transition"
                >
                  Baixar dados da nuvem
                </button>
                <button
                  onClick={desconectar}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Conecte primeiro para enviar ou baixar os dados.
              </p>
            )}

            {status && <p className="text-sm text-emerald-400">{status}</p>}
            {erro && <p className="text-sm text-rose-400">{erro}</p>}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 text-sm text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">Como configurar (uma vez)</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed">
              <li>Conecte uma vez em cada aparelho (mesma URL, chave e código da família)</li>
              <li>Depois disso: ao salvar, sobe sozinho; ao abrir o app, baixa sozinho</li>
              <li>Use Enviar/Baixar só se quiser forçar agora</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
