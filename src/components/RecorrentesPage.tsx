import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Recorrente, MeioPagamento } from '../types'
import { CATEGORIAS, CORES_CATEGORIA, MEIOS_PAGAMENTO, LABEL_MEIO } from '../types'

interface RecorrentesPageProps {
  lista: Recorrente[]
  onSalvar: (lista: Recorrente[]) => void
  pessoas: string[]
  origensPorMeio: Record<MeioPagamento, string[]>
}

export function RecorrentesPage({ lista, onSalvar, pessoas, origensPorMeio }: RecorrentesPageProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Recorrente | null>(null)
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [pessoa, setPessoa] = useState('')
  const [categoria, setCategoria] = useState('Assinatura')
  const [meio, setMeio] = useState<MeioPagamento>('credito')
  const [cartao, setCartao] = useState('')
  const [dia, setDia] = useState('10')
  const [erro, setErro] = useState('')
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null)

  const totalMensal = lista.filter((r) => r.ativa).reduce((a, r) => a + r.valor, 0)

  const abrirNovo = () => {
    setEditando(null)
    setNome('')
    setValor('')
    setPessoa(pessoas[0] || 'Eu')
    setCategoria('Assinatura')
    setMeio('credito')
    setCartao(origensPorMeio.credito?.[0] || '')
    setDia('10')
    setErro('')
    setModalAberto(true)
  }

  const abrirEditar = (r: Recorrente) => {
    setEditando(r)
    setNome(r.nome)
    setValor(String(r.valor))
    setPessoa(r.pessoa)
    setCategoria(r.categoria)
    setMeio(r.meio || 'credito')
    setCartao(r.cartao === 'Principal' ? 'Renner' : r.cartao)
    setDia(String(r.diaVencimento))
    setErro('')
    setModalAberto(true)
  }

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome'); return }
    const v = parseFloat(valor.replace(',', '.'))
    if (isNaN(v) || v <= 0) { setErro('Valor inválido'); return }
    const d = parseInt(dia) || 10

    if (editando) {
      onSalvar(lista.map((r) => r.id === editando.id ? {
        ...r, nome: nome.trim(), valor: v, pessoa, categoria, cartao: meio === 'dinheiro' ? 'Dinheiro' : cartao, meio, diaVencimento: d
      } : r))
    } else {
      onSalvar([...lista, {
        id: Date.now(), nome: nome.trim(), valor: v, pessoa, categoria, cartao: meio === 'dinheiro' ? 'Dinheiro' : cartao, meio,
        diaVencimento: d, ativa: true,
      }])
    }
    setModalAberto(false)
  }

  const toggleAtiva = (id: number) => {
    onSalvar(lista.map((r) => r.id === id ? { ...r, ativa: !r.ativa } : r))
  }

  const excluir = (id: number) => {
    onSalvar(lista.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Compras Recorrentes</h3>
          <p className="text-sm text-slate-400">Lançadas automaticamente todo mês</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Total mensal</p>
            <p className="text-lg font-bold text-rose-400">
              R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={abrirNovo}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium transition"
          >
            + Recorrente
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-2">Nenhuma compra recorrente cadastrada</p>
          <p className="text-sm text-slate-500">Ex: Netflix, financiamento do carro, academia, iFood...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <div
              key={r.id}
              className={`relative bg-slate-900 border rounded-2xl p-4 transition ${
                r.ativa ? 'border-slate-800' : 'border-slate-800/60'
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 shrink-0 rounded-xl ${CORES_CATEGORIA[r.categoria] || 'bg-slate-700'} flex items-center justify-center text-xs font-medium ${
                    r.ativa ? '' : 'opacity-60'
                  }`}
                >
                  {r.nome.slice(0, 3).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${r.ativa ? 'text-white' : 'text-slate-400'}`}>{r.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {r.categoria} · {r.pessoa} · {r.meio ? LABEL_MEIO[r.meio] + ' · ' : ''}{r.cartao} · dia {r.diaVencimento}
                      </p>
                    </div>

                    <div className="flex items-start gap-1 shrink-0">
                      <div className="text-right mr-1">
                        <p className={`text-sm font-semibold tabular-nums ${r.ativa ? 'text-rose-400' : 'text-slate-500'}`}>
                          R$ {r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleAtiva(r.id)}
                          className={`mt-1 text-[10px] px-2 py-0.5 rounded-full border transition ${
                            r.ativa
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-slate-600 text-slate-500 bg-slate-800/50'
                          }`}
                        >
                          {r.ativa ? 'Ativa' : 'Pausada'}
                        </button>
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:flex flex-col gap-1 ml-2">
                        <button type="button" onClick={() => abrirEditar(r)} className="text-xs text-slate-400 hover:text-sky-400">
                          Editar
                        </button>
                        <button type="button" onClick={() => excluir(r.id)} className="text-xs text-slate-400 hover:text-rose-400">
                          Excluir
                        </button>
                      </div>

                      {/* Mobile ⋮ */}
                      <div className="relative sm:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuAbertoId(menuAbertoId === r.id ? null : r.id)
                          }}
                          className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center text-lg leading-none"
                          aria-label="Mais ações"
                        >
                          ⋮
                        </button>
                        {menuAbertoId === r.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[180]"
                              onClick={() => setMenuAbertoId(null)}
                            />
                            <div className="absolute right-0 top-9 z-[190] min-w-[140px] rounded-xl border border-slate-600 bg-slate-900 shadow-2xl py-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  abrirEditar(r)
                                  setMenuAbertoId(null)
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-slate-800"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  excluir(r.id)
                                  setMenuAbertoId(null)
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-slate-800"
                              >
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto &&
        createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}
          >
            <div className="w-full sm:max-w-md max-h-[min(92vh,920px)] flex flex-col bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 shrink-0">
                <h3 className="text-lg font-semibold">
                  {editando ? 'Editar Recorrente' : 'Nova Recorrente'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={salvar} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Nome</label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Netflix, Financiamento carro..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Valor (R$)</label>
                    <input
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      inputMode="decimal"
                      placeholder="0,00"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Dia do mês</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={dia}
                      onChange={(e) => setDia(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
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
                        className={`py-2 rounded-lg text-sm font-medium transition ${
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
                  <label className="text-xs text-slate-400 mb-1.5 block">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Meio de pagamento</label>
                    <select
                      value={meio}
                      onChange={(e) => {
                        const m = e.target.value as MeioPagamento
                        setMeio(m)
                        const origs = origensPorMeio[m]
                        setCartao(origs[0] || '')
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      {MEIOS_PAGAMENTO.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {meio !== 'dinheiro' && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Origem</label>
                      <select
                        value={cartao}
                        onChange={(e) => setCartao(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      >
                        {(origensPorMeio[meio] || []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {erro && <p className="text-sm text-rose-400">{erro}</p>}
                <div
                  className="flex gap-3 pt-2 pb-2"
                  style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
                >
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 text-sm text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
