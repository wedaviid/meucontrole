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

function gerarChaveAcesso(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let sufixo = ''
  for (let i = 0; i < 8; i++) sufixo += chars[Math.floor(Math.random() * chars.length)]
  return `mc-${sufixo}`
}

export function SyncPage({ onSincronizado }: SyncPageProps) {
  const existente = carregarSyncConfig()
  const [url, setUrl] = useState(existente?.url || '')
  const [anonKey, setAnonKey] = useState(existente?.anonKey || '')
  const [familiaId, setFamiliaId] = useState(existente?.familiaId || '')
  const [status, setStatus] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const conectado = !!existente

  const gerar = () => {
    const nova = gerarChaveAcesso()
    setFamiliaId(nova)
    setStatus('Chave gerada. Salve e teste a conexão. Guarde a chave — é o acesso ao seu espaço.')
    setErro('')
    setCopiado(false)
  }

  const copiar = async () => {
    if (!familiaId.trim()) return
    try {
      await navigator.clipboard.writeText(familiaId.trim())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setErro('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const salvar = async () => {
    setErro('')
    setStatus('')
    if (!url.trim() || !anonKey.trim() || !familiaId.trim()) {
      setErro('Preencha URL, chave do projeto e a sua chave de acesso.')
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
    setStatus('Conectado! Seu espaço está isolado pela chave de acesso.')
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
            Cada chave de acesso é um espaço separado. Quem não tem a sua chave não vê seus lançamentos no app.
          </p>
        </div>
        {conectado && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start">
            Conectado · {existente?.familiaId}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-medium text-slate-300">Configuração</h4>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">URL do projeto Supabase</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Chave do projeto (anon / publishable)</label>
            <input
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="chave anônima do Supabase"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Sua chave de acesso</label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              É o código do seu espaço privado. Gere uma nova ou cole a que você guardou. Não compartilhe se quiser manter os dados só com quem você autorizar.
            </p>
            <div className="flex gap-2">
              <input
                value={familiaId}
                onChange={(e) => setFamiliaId(e.target.value)}
                placeholder="mc-xxxxxxxx"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={gerar}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-sky-400 shrink-0"
                title="Gerar chave nova"
              >
                Gerar
              </button>
              <button
                type="button"
                onClick={copiar}
                disabled={!familiaId.trim()}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 shrink-0 disabled:opacity-40"
                title="Copiar chave"
              >
                {copiado ? 'OK' : 'Copiar'}
              </button>
            </div>
          </div>

          <button
            type="button"
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
                  type="button"
                  onClick={enviar}
                  disabled={carregando}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-50 transition"
                >
                  Enviar dados deste aparelho
                </button>
                <button
                  type="button"
                  onClick={puxar}
                  disabled={carregando}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-50 transition"
                >
                  Baixar dados da nuvem
                </button>
                <button
                  type="button"
                  onClick={desconectar}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Conecte primeiro para enviar ou baixar os dados.</p>
            )}

            {status && <p className="text-sm text-emerald-400">{status}</p>}
            {erro && <p className="text-sm text-rose-400">{erro}</p>}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 text-sm text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">Espaço privado</p>
            <ul className="list-disc list-inside space-y-1.5 text-xs leading-relaxed">
              <li>
                <strong className="text-slate-300">Gerar</strong> cria uma chave só sua (ex.: mc-a3k9xq2p)
              </li>
              <li>No app, só quem usa a <strong className="text-slate-300">mesma chave</strong> vê os mesmos lançamentos</li>
              <li>Seu amigo gera a chave dele — você não precisa (nem deve) usar a chave dele</li>
              <li>Guarde a chave: é o acesso ao espaço neste e em outros aparelhos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
