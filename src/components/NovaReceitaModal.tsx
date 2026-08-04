import { useState, useEffect } from 'react'
import type { Receita, ContaItem } from '../types'
import { CATEGORIAS_RECEITA } from '../types'
import { sugerirCategoriaReceita } from '../utils/categorizar'

interface NovaReceitaModalProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: (receita: Omit<Receita, 'id'> & { id?: number }) => void
  pessoas: string[]
  contas: ContaItem[]
  receitaInicial?: Receita | null
  /** Último valor de salário para atalho */
  atalhoSalario?: number
}

export function NovaReceitaModal({
  aberto,
  onFechar,
  onSalvar,
  pessoas,
  contas,
  receitaInicial,
  atalhoSalario,
}: NovaReceitaModalProps) {
  const contasDestino = contas.filter((c) => c.tipo === 'conta' || c.incluirSaldo)
  const contasTodas = contasDestino.length ? contasDestino : contas.filter((c) => c.tipo === 'conta')

  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [pessoa, setPessoa] = useState('Conjunto')
  const [categoria, setCategoria] = useState<string>('Salário')
  const [conta, setConta] = useState('')
  const [observacao, setObservacao] = useState('')
  const [recorrente, setRecorrente] = useState(false)
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [erro, setErro] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [categoriaManual, setCategoriaManual] = useState(false)

  const isEditando = !!receitaInicial

  useEffect(() => {
    if (aberto) {
      setVisivel(true)
      if (receitaInicial) {
        setNome(receitaInicial.nome)
        setValor(String(receitaInicial.valor))
        setPessoa(receitaInicial.pessoa)
        setCategoria(receitaInicial.categoria || 'Salário')
        setConta(receitaInicial.conta || contasTodas[0]?.nome || '')
        setObservacao(receitaInicial.observacao || '')
        setRecorrente(!!receitaInicial.recorrente)
        setCategoriaManual(true)
        const parts = receitaInicial.data.split('/')
        if (parts.length >= 2) {
          const [dia, mes] = parts
          const ano = new Date().getFullYear()
          setData(`${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`)
        }
      } else {
        setNome('')
        setValor('')
        setPessoa(pessoas[0] || 'Eu')
        setCategoria('Salário')
        setConta(contasTodas[0]?.nome || '')
        setObservacao('')
        setRecorrente(false)
        setCategoriaManual(false)
        setData(new Date().toISOString().slice(0, 10))
      }
      setErro('')
    } else {
      const t = setTimeout(() => setVisivel(false), 200)
      return () => clearTimeout(t)
    }
  }, [aberto, receitaInicial])

  useEffect(() => {
    if (!aberto || categoriaManual || isEditando) return
    const s = sugerirCategoriaReceita(nome)
    if (s) setCategoria(s)
  }, [nome, categoriaManual, isEditando, aberto])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) onFechar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [aberto, onFechar])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) {
      setErro('Informe a descrição da receita')
      return
    }
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Informe um valor válido')
      return
    }

    onSalvar({
      id: receitaInicial?.id,
      nome: nome.trim(),
      valor: valorNum,
      pessoa,
      data: data.split('-').reverse().join('/').slice(0, 5),
      categoria,
      conta: conta || undefined,
      observacao: observacao.trim() || undefined,
      recorrente,
    })
    onFechar()
  }

  if (!visivel && !aberto) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-200 ${
        aberto ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-black/0 opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        className={`w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl transition-all duration-200 max-h-[90vh] overflow-y-auto ${
          aberto ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-lg font-semibold text-white">
            {isEditando ? 'Editar Receita' : 'Nova Receita'}
          </h2>
          <button type="button" onClick={onFechar} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Descrição</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Salário, Freelance..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Valor (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ''))}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              {(atalhoSalario || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setValor(String(atalhoSalario))}
                  className="mt-1.5 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  Usar último salário (R$ {atalhoSalario!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </button>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Categoria</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIAS_RECEITA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategoria(c)
                    setCategoriaManual(true)
                  }}
                  className={`py-2 rounded-lg text-xs font-medium transition ${
                    categoria === c
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Conta de destino</label>
            <select
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Selecione...</option>
              {(contasTodas.length ? contasTodas : contas).map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Quem recebeu</label>
            <div className="grid grid-cols-3 gap-2">
              {[...pessoas, 'Conjunto'].filter((v, i, a) => a.indexOf(v) === i).map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPessoa(p)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition ${
                    pessoa === p
                      ? p === 'Conjunto'
                        ? 'bg-emerald-600 text-white'
                        : idx % 2 === 0
                          ? 'bg-indigo-600 text-white'
                          : 'bg-pink-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Observação (opcional)</label>
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: adiantamento 13º"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setRecorrente(!recorrente)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700"
          >
            <span className="text-sm text-slate-300">Repetir todo mês</span>
            <span
              className={`relative w-11 h-6 rounded-full transition ${recorrente ? 'bg-emerald-600' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${
                  recorrente ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>

          {erro && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white"
            >
              {isEditando ? 'Salvar' : 'Salvar receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
