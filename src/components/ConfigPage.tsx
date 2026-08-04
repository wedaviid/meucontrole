import { useEffect, useState } from 'react'
import type { AppConfig, ContaItem } from '../types'
import { origensDeContas } from '../types'

interface ConfigPageProps {
  config: AppConfig
  onSalvar: (config: AppConfig) => void
}

function ListaPessoas({
  lista,
  setLista,
}: {
  lista: string[]
  setLista: (v: string[]) => void
}) {
  const [novo, setNovo] = useState('')
  const [erro, setErro] = useState('')

  const add = () => {
    const v = novo.trim()
    if (!v) return
    if (lista.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setErro('Já existe')
      return
    }
    setLista([...lista, v])
    setNovo('')
    setErro('')
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Pessoas</h3>
        <p className="text-xs text-slate-500 mt-0.5">Quem participa do orçamento</p>
      </div>
      <ul className="space-y-2">
        {lista.map((item, idx) => (
          <li key={`p-${idx}`} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...lista]
                next[idx] = e.target.value
                setLista(next)
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              disabled={lista.length <= 1}
              onClick={() => setLista(lista.filter((_, i) => i !== idx))}
              className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Adicionar pessoa..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-sky-600 text-sm text-white">
          +
        </button>
      </div>
      {erro && <p className="text-xs text-amber-400">{erro}</p>}
    </div>
  )
}

export function ConfigPage({ config, onSalvar }: ConfigPageProps) {
  const [nomeEspaco, setNomeEspaco] = useState(config.nomeEspaco)
  const [pessoas, setPessoas] = useState<string[]>([...config.pessoas])
  const [contas, setContas] = useState<ContaItem[]>(
    config.contas?.length ? config.contas.map((c) => ({ ...c })) : []
  )
  const [msg, setMsg] = useState('')
  const [novaNome, setNovaNome] = useState('')
  const [novaTipo, setNovaTipo] = useState<'credito' | 'conta'>('conta')

  useEffect(() => {
    setNomeEspaco(config.nomeEspaco)
    setPessoas([...config.pessoas])
    setContas(config.contas?.length ? config.contas.map((c) => ({ ...c })) : [])
  }, [config])

  const addConta = () => {
    const n = novaNome.trim()
    if (!n) return
    if (contas.some((c) => c.nome.toLowerCase() === n.toLowerCase())) {
      setMsg('Já existe uma conta/cartão com esse nome')
      return
    }
    setContas([
      ...contas,
      {
        id: `c-${Date.now()}`,
        nome: n,
        tipo: novaTipo,
        incluirSaldo: novaTipo === 'conta',
      },
    ])
    setNovaNome('')
    setMsg('')
  }

  const salvar = () => {
    const pessoasLimpas = pessoas.map((p) => p.trim()).filter(Boolean)
    if (pessoasLimpas.length === 0) {
      setMsg('Cadastre pelo menos uma pessoa')
      return
    }
    const contasLimpas = contas
      .map((c) => ({ ...c, nome: c.nome.trim() }))
      .filter((c) => c.nome)
    if (contasLimpas.length === 0) {
      setMsg('Cadastre pelo menos uma conta ou cartão')
      return
    }
    const nova: AppConfig = {
      nomeEspaco: nomeEspaco.trim() || 'Meu espaço',
      pessoas: pessoasLimpas,
      contas: contasLimpas,
      origens: origensDeContas(contasLimpas),
    }
    onSalvar(nova)
    setMsg('Configurações salvas!')
    setTimeout(() => setMsg(''), 2500)
  }

  const cartoes = contas.filter((c) => c.tipo === 'credito')
  const contasCorrente = contas.filter((c) => c.tipo === 'conta')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold">Configurações</h3>
        <p className="text-sm text-slate-400 mt-1">
          Pessoas, contas e cartões — usados em despesas, receitas e faturas.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
        <label className="text-xs text-slate-400 block">Nome do espaço</label>
        <input
          value={nomeEspaco}
          onChange={(e) => setNomeEspaco(e.target.value)}
          placeholder="Ex: Família Silva"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
        />
      </div>

      <ListaPessoas lista={pessoas} setLista={setPessoas} />

      {/* Contas e cartões */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Contas e cartões</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Conta = Pix/débito e destino de receita · Cartão = fatura de crédito
          </p>
        </div>

        {contasCorrente.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Contas</p>
            {contasCorrente.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.nome}
                  onChange={(e) =>
                    setContas(contas.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))
                  }
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                  <input
                    type="checkbox"
                    checked={c.incluirSaldo}
                    onChange={(e) =>
                      setContas(
                        contas.map((x) => (x.id === c.id ? { ...x, incluirSaldo: e.target.checked } : x))
                      )
                    }
                  />
                  Saldo
                </label>
                <button
                  type="button"
                  onClick={() => setContas(contas.filter((x) => x.id !== c.id))}
                  className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {cartoes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Cartões de crédito</p>
            {cartoes.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  value={c.nome}
                  onChange={(e) =>
                    setContas(contas.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))
                  }
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setContas(contas.filter((x) => x.id !== c.id))}
                  className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-400">Adicionar</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={novaTipo}
              onChange={(e) => setNovaTipo(e.target.value as 'credito' | 'conta')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="conta">Conta (Pix/débito)</option>
              <option value="credito">Cartão de crédito</option>
            </select>
            <input
              value={novaNome}
              onChange={(e) => setNovaNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConta())}
              placeholder="Nome (ex: Conta principal)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button type="button" onClick={addConta} className="px-4 py-2 rounded-lg bg-sky-600 text-sm text-white">
              +
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <p className={`text-sm ${msg.includes('salvas') ? 'text-emerald-400' : 'text-amber-400'}`}>{msg}</p>
      )}

      <button
        type="button"
        onClick={salvar}
        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
      >
        Salvar configurações
      </button>
    </div>
  )
}
