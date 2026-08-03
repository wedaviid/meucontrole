import { useState } from 'react'
import type { AppConfig } from '../types'

interface ConfigPageProps {
  config: AppConfig
  onSalvar: (config: AppConfig) => void
}

export function ConfigPage({ config, onSalvar }: ConfigPageProps) {
  const [nomeEspaco, setNomeEspaco] = useState(config.nomeEspaco)
  const [pessoas, setPessoas] = useState<string[]>([...config.pessoas])
  const [credito, setCredito] = useState<string[]>([...config.origens.credito])
  const [debito, setDebito] = useState<string[]>([...config.origens.debito])
  const [pix, setPix] = useState<string[]>([...config.origens.pix])
  const [msg, setMsg] = useState('')

  const [novaPessoa, setNovaPessoa] = useState('')
  const [novoCredito, setNovoCredito] = useState('')
  const [novoDebito, setNovoDebito] = useState('')
  const [novoPix, setNovoPix] = useState('')

  const addItem = (lista: string[], setLista: (v: string[]) => void, valor: string, setValor: (v: string) => void) => {
    const v = valor.trim()
    if (!v) return
    if (lista.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setMsg('Já existe na lista')
      return
    }
    setLista([...lista, v])
    setValor('')
    setMsg('')
  }

  const removeItem = (lista: string[], setLista: (v: string[]) => void, idx: number, min = 0) => {
    if (lista.length <= min) {
      setMsg('Mantenha pelo menos um item')
      return
    }
    setLista(lista.filter((_, i) => i !== idx))
    setMsg('')
  }

  const salvar = () => {
    const pessoasLimpas = pessoas.map((p) => p.trim()).filter(Boolean)
    if (pessoasLimpas.length === 0) {
      setMsg('Cadastre pelo menos uma pessoa')
      return
    }
    onSalvar({
      nomeEspaco: nomeEspaco.trim() || 'Meu espaço',
      pessoas: pessoasLimpas,
      origens: {
        credito: credito.map((c) => c.trim()).filter(Boolean),
        debito: debito.map((c) => c.trim()).filter(Boolean),
        pix: pix.map((c) => c.trim()).filter(Boolean),
      },
    })
    setMsg('Configurações salvas!')
    setTimeout(() => setMsg(''), 2500)
  }

  const ListaEditavel = ({
    titulo,
    dica,
    lista,
    setLista,
    novo,
    setNovo,
    min = 0,
  }: {
    titulo: string
    dica?: string
    lista: string[]
    setLista: (v: string[]) => void
    novo: string
    setNovo: (v: string) => void
    min?: number
  }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">{titulo}</h3>
        {dica && <p className="text-xs text-slate-500 mt-0.5">{dica}</p>}
      </div>
      <ul className="space-y-2">
        {lista.map((item, idx) => (
          <li key={`${item}-${idx}`} className="flex items-center gap-2">
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
              onClick={() => removeItem(lista, setLista, idx, min)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 text-sm"
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
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(lista, setLista, novo, setNovo))}
          placeholder="Adicionar..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={() => addItem(lista, setLista, novo, setNovo)}
          className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
        >
          +
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold">Configurações</h3>
        <p className="text-sm text-slate-400 mt-1">
          Personalize pessoas, cartões e contas. Assim o app deixa de ser só “David e Kamille”.
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
        novo={novaPessoa}
        setNovo={setNovaPessoa}
        min={1}
      />

      <ListaEditavel
        titulo="Cartões de crédito"
        dica="Aparecem em Meio = Crédito"
        lista={credito}
        setLista={setCredito}
        novo={novoCredito}
        setNovo={setNovoCredito}
      />

      <ListaEditavel
        titulo="Contas (débito)"
        dica="Aparecem em Meio = Débito"
        lista={debito}
        setLista={setDebito}
        novo={novoDebito}
        setNovo={setNovoDebito}
      />

      <ListaEditavel
        titulo="Contas (Pix)"
        dica="Aparecem em Meio = Pix"
        lista={pix}
        setLista={setPix}
        novo={novoPix}
        setNovo={setNovoPix}
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
