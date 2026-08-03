import { useEffect, useState } from 'react'
import type { AppConfig } from '../types'

interface ConfigPageProps {
  config: AppConfig
  onSalvar: (config: AppConfig) => void
}

function ListaEditavel({
  titulo,
  dica,
  lista,
  setLista,
  min = 0,
}: {
  titulo: string
  dica?: string
  lista: string[]
  setLista: (v: string[]) => void
  min?: number
}) {
  const [novo, setNovo] = useState('')
  const [erroLocal, setErroLocal] = useState('')

  const addItem = () => {
    const v = novo.trim()
    if (!v) return
    if (lista.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setErroLocal('Já existe na lista')
      return
    }
    setLista([...lista, v])
    setNovo('')
    setErroLocal('')
  }

  const removeItem = (idx: number) => {
    if (lista.length <= min) {
      setErroLocal('Mantenha pelo menos um item')
      return
    }
    setLista(lista.filter((_, i) => i !== idx))
    setErroLocal('')
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">{titulo}</h3>
        {dica && <p className="text-xs text-slate-500 mt-0.5">{dica}</p>}
      </div>
      <ul className="space-y-2">
        {lista.map((item, idx) => (
          <li key={`item-${idx}`} className="flex items-center gap-2">
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
              onClick={() => removeItem(idx)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 text-sm shrink-0"
              title="Remover"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder="Adicionar..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white shrink-0"
        >
          +
        </button>
      </div>
      {erroLocal && <p className="text-xs text-amber-400">{erroLocal}</p>}
    </div>
  )
}

export function ConfigPage({ config, onSalvar }: ConfigPageProps) {
  const [nomeEspaco, setNomeEspaco] = useState(config.nomeEspaco)
  const [pessoas, setPessoas] = useState<string[]>([...config.pessoas])
  const [credito, setCredito] = useState<string[]>([...config.origens.credito])
  const [debito, setDebito] = useState<string[]>([...config.origens.debito])
  const [pix, setPix] = useState<string[]>([...config.origens.pix])
  const [msg, setMsg] = useState('')

  // Quando a config externa muda (ex.: sync), atualiza o formulário
  useEffect(() => {
    setNomeEspaco(config.nomeEspaco)
    setPessoas([...config.pessoas])
    setCredito([...config.origens.credito])
    setDebito([...config.origens.debito])
    setPix([...config.origens.pix])
  }, [config])

  const salvar = () => {
    const pessoasLimpas = pessoas.map((p) => p.trim()).filter(Boolean)
    if (pessoasLimpas.length === 0) {
      setMsg('Cadastre pelo menos uma pessoa')
      return
    }
    const nova: AppConfig = {
      nomeEspaco: nomeEspaco.trim() || 'Meu espaço',
      pessoas: pessoasLimpas,
      origens: {
        credito: credito.map((c) => c.trim()).filter(Boolean),
        debito: debito.map((c) => c.trim()).filter(Boolean),
        pix: pix.map((c) => c.trim()).filter(Boolean),
      },
    }
    onSalvar(nova)
    setMsg('Configurações salvas!')
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold">Configurações</h3>
        <p className="text-sm text-slate-400 mt-1">
          Personalize pessoas, cartões e contas. O app usa essas listas em despesas, receitas e recorrentes.
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

      <ListaEditavel
        titulo="Pessoas"
        dica="Quem participa do orçamento (1 ou mais)"
        lista={pessoas}
        setLista={setPessoas}
        min={1}
      />

      <ListaEditavel
        titulo="Cartões de crédito"
        dica="Aparecem quando o meio for Crédito"
        lista={credito}
        setLista={setCredito}
      />

      <ListaEditavel
        titulo="Contas (débito)"
        dica="Aparecem quando o meio for Débito"
        lista={debito}
        setLista={setDebito}
      />

      <ListaEditavel
        titulo="Contas (Pix)"
        dica="Aparecem quando o meio for Pix"
        lista={pix}
        setLista={setPix}
      />

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
