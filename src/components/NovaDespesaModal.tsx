import { useState, useEffect, useMemo } from 'react'
import type { FaturaItem, MeioPagamento } from '../types'
import { CATEGORIAS, MEIOS_PAGAMENTO } from '../types'
import { sugerirCategoria } from '../utils/categorizar'

interface NovaDespesaModalProps {
  aberto: boolean
  onFechar: () => void
  onSalvar: (despesa: NovaDespesa) => void
  despesaInicial?: FaturaItem | null
  pessoas: string[]
  origensPorMeio: Record<MeioPagamento, string[]>
}

export interface NovaDespesa {
  nome: string
  valor: number
  pessoa: string
  categoria: string
  cartao: string
  meio: MeioPagamento
  data: string
  parcelado: boolean
  totalParcelas?: number
  pago: boolean
}

function inferirMeio(cartao: string, meio?: MeioPagamento): MeioPagamento {
  if (meio) return meio
  const c = (cartao || '').toLowerCase()
  if (c.includes('conta') || c.includes('pix')) return 'pix'
  if (c.includes('débito') || c.includes('debito')) return 'debito'
  if (c.includes('dinheiro') || c.includes('espécie') || c.includes('especie')) return 'dinheiro'
  return 'credito'
}

export function NovaDespesaModal({ aberto, onFechar, onSalvar, despesaInicial, pessoas, origensPorMeio }: NovaDespesaModalProps) {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [pessoa, setPessoa] = useState(pessoas[0] || 'Eu')
  const [categoria, setCategoria] = useState('Alimentação')
  const [meio, setMeio] = useState<MeioPagamento>('credito')
  const [cartao, setCartao] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [parcelado, setParcelado] = useState(false)
  const [pago, setPago] = useState(true)
  const [totalParcelas, setTotalParcelas] = useState('2')
  const [erro, setErro] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [sugestaoCategoria, setSugestaoCategoria] = useState<string | null>(null)
  const [categoriaManual, setCategoriaManual] = useState(false)

  const isEditando = !!despesaInicial

  const origens = useMemo(() => origensPorMeio[meio] || [], [meio, origensPorMeio])
  const precisaOrigem = meio !== 'dinheiro'

  useEffect(() => {
    if (categoriaManual || isEditando) return
    const s = sugerirCategoria(nome)
    setSugestaoCategoria(s)
    if (s) setCategoria(s)
  }, [nome, categoriaManual, isEditando])

  // Ao trocar o meio, ajusta origem para a primeira válida
  useEffect(() => {
    if (!precisaOrigem) {
      setCartao('')
      return
    }
    if (!origens.includes(cartao)) {
      setCartao(origens[0] || '')
    }
  }, [meio, origens, precisaOrigem, cartao])

  useEffect(() => {
    if (aberto) {
      setVisivel(true)
      if (despesaInicial) {
        setNome(despesaInicial.nome)
        setValor(String(despesaInicial.valor))
        setPessoa(despesaInicial.pessoa)
        setCategoria(despesaInicial.categoria)
        const m = inferirMeio(despesaInicial.cartao, despesaInicial.meio)
        setMeio(m)
        setCartao(despesaInicial.cartao || '')
        const [dia, mes] = despesaInicial.data.split('/')
        const ano = new Date().getFullYear()
        setData(`${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`)
        setParcelado(!!despesaInicial.parcelado)
        setTotalParcelas(String(despesaInicial.totalParcelas || 2))
        setPago(despesaInicial.pago !== false)
        setCategoriaManual(true)
        setSugestaoCategoria(null)
      } else {
        setNome('')
        setValor('')
        setPessoa(pessoas[0] || 'Eu')
        setCategoria('Alimentação')
        setMeio('credito')
        setCartao(origensPorMeio.credito?.[0] || '')
        setData(new Date().toISOString().slice(0, 10))
        setParcelado(false)
        setTotalParcelas('2')
        setPago(true)
        setCategoriaManual(false)
        setSugestaoCategoria(null)
      }
      setErro('')
    } else {
      const t = setTimeout(() => setVisivel(false), 200)
      return () => clearTimeout(t)
    }
  }, [aberto, despesaInicial])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) onFechar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [aberto, onFechar])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      setErro('Informe a descrição')
      return
    }
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Valor inválido')
      return
    }
    if (precisaOrigem && !cartao) {
      setErro('Selecione a origem')
      return
    }

    onSalvar({
      nome: nome.trim(),
      valor: valorNum,
      pessoa,
      categoria,
      cartao: precisaOrigem ? cartao : 'Dinheiro',
      meio,
      data: data.split('-').reverse().join('/').slice(0, 5),
      parcelado: meio === 'credito' ? parcelado : false,
      totalParcelas: meio === 'credito' && parcelado ? parseInt(totalParcelas) || 2 : undefined,
      pago,
    })

    onFechar()
  }

  if (!visivel && !aberto) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-200 ${
        aberto ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl transition-all duration-200 ${
          aberto ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h3 className="text-lg font-semibold">{isEditando ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <button type="button" onClick={onFechar} className="text-slate-400 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Descrição</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: iFood, Netflix, Farmácia..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition"
              autoFocus
            />
            {sugestaoCategoria && !categoriaManual && (
              <p className="text-xs text-sky-400/80 mt-1">Categoria sugerida: {sugestaoCategoria}</p>
            )}
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
            <label className="text-xs text-slate-400 mb-1.5 block">Pessoa</label>
            <div className="grid grid-cols-2 gap-2">
              {pessoas.map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPessoa(p)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition ${
                    pessoa === p ? (idx % 2 === 0 ? 'bg-indigo-600 text-white' : 'bg-pink-600 text-white') : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value)
                setCategoriaManual(true)
                setSugestaoCategoria(null)
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Meio + Origem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Meio de pagamento</label>
              <select
                value={meio}
                onChange={(e) => setMeio(e.target.value as MeioPagamento)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                {MEIOS_PAGAMENTO.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {precisaOrigem ? (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Origem</label>
                <select
                  value={cartao}
                  onChange={(e) => setCartao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                >
                  {origens.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-end">
                <p className="text-xs text-slate-500 pb-3">Sem conta vinculada (dinheiro em espécie)</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <label className="text-sm text-slate-300">Já foi paga?</label>
              <p className="text-xs text-slate-500">Desmarque se ainda está pendente</p>
            </div>
            <button
              type="button"
              onClick={() => setPago(!pago)}
              className={`relative w-11 h-6 rounded-full transition ${pago ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  pago ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {meio === 'credito' && (
            <>
              <div className="flex items-center justify-between py-1">
                <label className="text-sm text-slate-300">É parcelado?</label>
                <button
                  type="button"
                  onClick={() => setParcelado(!parcelado)}
                  className={`relative w-11 h-6 rounded-full transition ${parcelado ? 'bg-sky-600' : 'bg-slate-700'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      parcelado ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {parcelado && (
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Número de parcelas</label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={totalParcelas}
                    onChange={(e) => setTotalParcelas(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              )}
            </>
          )}

          {erro && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>
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
              className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white transition"
            >
              {isEditando ? 'Salvar Alterações' : 'Salvar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
