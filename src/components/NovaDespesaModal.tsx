import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
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
  /** Todo mês até pausar — grava também em despesas fixas */
  despesaFixa?: boolean
  diaVencimento?: number
}

function inferirMeio(cartao: string, meio?: MeioPagamento): MeioPagamento {
  if (meio) return meio
  const c = (cartao || '').toLowerCase()
  if (c.includes('conta') || c.includes('pix')) return 'pix'
  if (c.includes('débito') || c.includes('debito')) return 'debito'
  if (c.includes('dinheiro') || c.includes('espécie') || c.includes('especie')) return 'dinheiro'
  return 'credito'
}

function ToggleRow({
  label,
  hint,
  ligado,
  onChange,
  cor = 'sky',
}: {
  label: string
  hint?: string
  ligado: boolean
  onChange: () => void
  cor?: 'sky' | 'emerald' | 'violet'
}) {
  const on = cor === 'emerald' ? 'bg-emerald-600' : cor === 'violet' ? 'bg-violet-600' : 'bg-sky-600'
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center justify-between gap-3 py-1.5 text-left"
    >
      <div className="min-w-0">
        <span className="text-sm text-slate-300 block">{label}</span>
        {hint && <span className="text-[11px] text-slate-500 block">{hint}</span>}
      </div>
      <span className={`relative w-11 h-6 rounded-full transition shrink-0 ${ligado ? on : 'bg-slate-700'}`}>
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            ligado ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

export function NovaDespesaModal({
  aberto,
  onFechar,
  onSalvar,
  despesaInicial,
  pessoas,
  origensPorMeio,
}: NovaDespesaModalProps) {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [pessoa, setPessoa] = useState(pessoas[0] || 'Eu')
  const [categoria, setCategoria] = useState('Alimentação')
  const [meio, setMeio] = useState<MeioPagamento>('credito')
  const [cartao, setCartao] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [parcelado, setParcelado] = useState(false)
  const [despesaFixa, setDespesaFixa] = useState(false)
  const [diaFixo, setDiaFixo] = useState('10')
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
        setNome(despesaInicial.nome.replace(/\s+\d+\/\d+$/, ''))
        setValor(String(despesaInicial.valor))
        setPessoa(despesaInicial.pessoa)
        setCategoria(despesaInicial.categoria)
        const m = inferirMeio(despesaInicial.cartao, despesaInicial.meio)
        setMeio(m)
        setCartao(despesaInicial.cartao || '')
        setParcelado(!!despesaInicial.parcelado)
        setDespesaFixa(false)
        setPago(despesaInicial.pago !== false)
        setTotalParcelas(String(despesaInicial.totalParcelas || 2))
        setCategoriaManual(true)
        const parts = despesaInicial.data.split('/')
        if (parts.length >= 2) {
          const [dia, mes] = parts
          const ano = new Date().getFullYear()
          setData(`${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`)
          setDiaFixo(String(parseInt(dia, 10) || 10))
        }
      } else {
        setNome('')
        setValor('')
        setPessoa(pessoas[0] || 'Eu')
        setCategoria('Alimentação')
        setMeio('credito')
        setCartao(origensPorMeio.credito?.[0] || '')
        setParcelado(false)
        setDespesaFixa(false)
        setDiaFixo(String(new Date().getDate()))
        setPago(true)
        setTotalParcelas('2')
        setCategoriaManual(false)
        setSugestaoCategoria(null)
        setData(new Date().toISOString().slice(0, 10))
      }
      setErro('')
    } else {
      const t = setTimeout(() => setVisivel(false), 200)
      return () => clearTimeout(t)
    }
  }, [aberto, despesaInicial, pessoas, origensPorMeio])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) onFechar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [aberto, onFechar])

  const ligarFixa = () => {
    setDespesaFixa((v) => {
      const next = !v
      if (next) setParcelado(false)
      return next
    })
  }

  const ligarParcelado = () => {
    setParcelado((v) => {
      const next = !v
      if (next) setDespesaFixa(false)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) {
      setErro('Informe a descrição')
      return
    }
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Informe um valor válido')
      return
    }
    if (precisaOrigem && !cartao) {
      setErro('Selecione a origem')
      return
    }
    if (despesaFixa) {
      const d = parseInt(diaFixo, 10)
      if (!d || d < 1 || d > 28) {
        setErro('Dia da despesa fixa: use 1 a 28')
        return
      }
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
      totalParcelas: meio === 'credito' && parcelado ? parseInt(totalParcelas, 10) || 2 : undefined,
      pago,
      despesaFixa: !isEditando && despesaFixa,
      diaVencimento: despesaFixa ? parseInt(diaFixo, 10) || 10 : undefined,
    })
    onFechar()
  }

  if (!visivel && !aberto) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-4 transition-opacity duration-200 ${
        aberto ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div
        className={`relative w-full sm:max-w-md max-h-[min(92vh,900px)] flex flex-col bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-200 ${
          aberto ? 'translate-y-0' : 'translate-y-4 sm:translate-y-2'
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-semibold">{isEditando ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <button
            type="button"
            onClick={onFechar}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Descrição</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: iFood, Netflix, Farmácia..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            {sugestaoCategoria && !categoriaManual && (
              <p className="text-[11px] text-sky-400/80 mt-1">Categoria: {sugestaoCategoria}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Valor (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => {
                  setData(e.target.value)
                  const d = e.target.value.split('-')[2]
                  if (d && !despesaFixa) setDiaFixo(String(parseInt(d, 10)))
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Pessoa</label>
            <div className="flex flex-wrap gap-2">
              {pessoas.map((p, idx) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPessoa(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pessoa === p
                      ? idx % 2 === 0
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
            <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value)
                setCategoriaManual(true)
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={`grid gap-3 ${precisaOrigem ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Meio</label>
              <select
                value={meio}
                onChange={(e) => setMeio(e.target.value as MeioPagamento)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                {MEIOS_PAGAMENTO.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {precisaOrigem && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Origem</label>
                <select
                  value={cartao}
                  onChange={(e) => setCartao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">Selecione...</option>
                  {origens.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 space-y-1">
            <ToggleRow
              label="Já foi paga?"
              hint={pago ? 'Conta no total do mês' : 'Pendente'}
              ligado={pago}
              onChange={() => setPago(!pago)}
              cor="emerald"
            />

            {!isEditando && (
              <ToggleRow
                label="Despesa fixa?"
                hint="Repete todo mês até pausar"
                ligado={despesaFixa}
                onChange={ligarFixa}
                cor="violet"
              />
            )}

            {despesaFixa && !isEditando && (
              <div className="pb-1 pt-0.5">
                <label className="text-xs text-slate-400 mb-1 block">Dia do mês</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={diaFixo}
                  onChange={(e) => setDiaFixo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {meio === 'credito' && (
              <>
                <ToggleRow
                  label="Parcelado?"
                  hint={despesaFixa ? 'Indisponível com despesa fixa' : undefined}
                  ligado={parcelado}
                  onChange={() => {
                    if (despesaFixa) return
                    ligarParcelado()
                  }}
                />
                {parcelado && !despesaFixa && (
                  <div className="pb-1 pt-0.5">
                    <label className="text-xs text-slate-400 mb-1 block">Nº de parcelas</label>
                    <input
                      type="number"
                      min={2}
                      max={24}
                      value={totalParcelas}
                      onChange={(e) => setTotalParcelas(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {erro && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>
          )}

          <div
            className="flex gap-3 pt-1"
            style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
            >
              {isEditando ? 'Salvar' : 'Salvar despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
