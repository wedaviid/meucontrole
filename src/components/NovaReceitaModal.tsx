import { useState, useEffect } from 'react'
import type { Receita } from '../types'

interface NovaReceitaModalProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: (receita: Omit<Receita, 'id'> & { id?: number }) => void
  pessoas: string[]
  receitaInicial?: Receita | null
}

export function NovaReceitaModal({ aberto, onFechar, onSalvar, receitaInicial, pessoas }: NovaReceitaModalProps) {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [pessoa, setPessoa] = useState('Conjunto')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [erro, setErro] = useState('')
  const [visivel, setVisivel] = useState(false)

  const isEditando = !!receitaInicial

  useEffect(() => {
    if (aberto) {
      setVisivel(true)
      if (receitaInicial) {
        setNome(receitaInicial.nome)
        setValor(String(receitaInicial.valor))
        setPessoa(receitaInicial.pessoa)
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
        setData(new Date().toISOString().slice(0, 10))
      }
      setErro('')
    } else {
      const t = setTimeout(() => setVisivel(false), 200)
      return () => clearTimeout(t)
    }
  }, [aberto, receitaInicial])

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
    })

    onFechar()
  }

  if (!visivel && !aberto) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-200 ${
        aberto ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl transition-all duration-200 ${
          aberto ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {isEditando ? 'Editar Receita' : 'Nova Receita'}
          </h3>
          <button
            type="button"
            onClick={onFechar}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Descrição</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Salário, Freelance, Venda..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
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
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setData(new Date().toISOString().slice(0, 10))}
                  className="flex-1 py-1.5 rounded-lg text-xs border border-slate-600 text-slate-300 hover:border-sky-500 hover:text-sky-400 transition"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date()
                    d.setDate(d.getDate() - 1)
                    setData(d.toISOString().slice(0, 10))
                  }}
                  className="flex-1 py-1.5 rounded-lg text-xs border border-slate-600 text-slate-300 hover:border-sky-500 hover:text-sky-400 transition"
                >
                  Ontem
                </button>
              </div>
            </div>
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

          {erro && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition"
            >
              {isEditando ? 'Salvar Alterações' : 'Salvar Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
