import { useState } from 'react'
import type { FaturaItem } from '../types'

interface FaturasPageProps {
  lancamentos: FaturaItem[]
  onExcluir?: (item: FaturaItem) => void
  onEditar?: (item: FaturaItem) => void
  pessoas?: string[]
  origensLista?: string[]
}

export function FaturasPage({ lancamentos, onExcluir, onEditar, pessoas = [], origensLista = [] }: FaturasPageProps) {
  const [pessoaFiltro, setPessoaFiltro] = useState('Todos')
  const [cartaoFiltro, setCartaoFiltro] = useState('Todos')
  const FILTROS_PESSOA = ['Todos', ...(pessoas.length ? pessoas : Array.from(new Set(lancamentos.map((l) => l.pessoa))))]
  const ORIGENS_FILTRO = ['Todos', ...Array.from(new Set([
    ...origensLista,
    ...lancamentos.map((l) => l.cartao).filter(Boolean),
  ]))]
  const [busca, setBusca] = useState('')


  const filtrados = lancamentos.filter((l) => {
    const matchPessoa = pessoaFiltro === 'Todos' || l.pessoa === pessoaFiltro
    const matchCartao = cartaoFiltro === 'Todos' || l.cartao === cartaoFiltro
    const matchBusca =
      busca === '' ||
      l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.categoria.toLowerCase().includes(busca.toLowerCase())
    return matchPessoa && matchCartao && matchBusca
  })

  const isPago = (l: FaturaItem) => l.pago !== false
  const totalFiltrado = filtrados.filter(isPago).reduce((acc, l) => acc + l.valor, 0)
  const pessoasCards = (pessoas.length ? pessoas : Array.from(new Set(lancamentos.map((l) => l.pessoa))))
  const totalGeral = lancamentos.filter(isPago).reduce((a, b) => a + b.valor, 0)
  const totalPendenteGeral = lancamentos.filter((l) => !isPago(l)).reduce((a, b) => a + b.valor, 0)

  const handleExcluir = (item: FaturaItem) => {
    onExcluir?.(item)
  }

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 gap-4 ${pessoasCards.length <= 1 ? 'md:grid-cols-2' : pessoasCards.length === 2 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400 mb-1">Total de despesas</p>
          <p className="text-2xl font-bold text-rose-400">
            R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lancamentos.length} lançamentos
            {totalPendenteGeral > 0 && (
              <span className="text-amber-400"> · R$ {totalPendenteGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente</span>
            )}
          </p>
        </div>
        {pessoasCards.map((nome, idx) => {
          const total = lancamentos.filter((l) => l.pessoa === nome && isPago(l)).reduce((a, b) => a + b.valor, 0)
          const cores = ['text-indigo-400', 'text-pink-400', 'text-emerald-400', 'text-amber-400', 'text-violet-400']
          return (
            <div key={nome} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">{nome}</p>
              <p className={`text-2xl font-bold ${cores[idx % cores.length]}`}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Gastos no mês</p>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1.5 block">Buscar</label>
            <input
              type="text"
              placeholder="Nome ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Pessoa</label>
            <select
              value={pessoaFiltro}
              onChange={(e) => setPessoaFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              {FILTROS_PESSOA.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Origem</label>
            <select
              value={cartaoFiltro}
              onChange={(e) => setCartaoFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              {ORIGENS_FILTRO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold">
            Lançamentos <span className="text-slate-400 font-normal text-sm">({filtrados.length} itens)</span>
          </h3>
          <span className="text-sm font-medium text-rose-400">
            Total pago filtrado: R$ {totalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs text-slate-500 border-b border-slate-800/80 bg-slate-900/50">
          <div className="col-span-1">Data</div>
          <div className="col-span-3">Descrição</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Pessoa / Origem</div>
          <div className="col-span-1">Parcelas</div>
          <div className="col-span-2 text-right">Valor</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto">
          {filtrados.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500">
              Nenhum lançamento encontrado.
            </div>
          ) : (
            filtrados.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3.5 hover:bg-slate-800/40 transition items-center"
              >
                <div className="col-span-1 text-sm text-slate-400">{l.data}</div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${l.cor} flex items-center justify-center text-xs font-medium shrink-0`}>
                    {l.sigla}
                  </div>
                  <span className="text-sm font-medium truncate">{l.nome}{l.pago === false && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pendente</span>}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300">{l.categoria}</span>
                </div>
                <div className="col-span-2 text-sm">
                  <span className={pessoasCards.indexOf(l.pessoa) % 2 === 0 ? 'text-indigo-400' : 'text-pink-400'}>{l.pessoa}</span>
                  <span className="text-slate-500 text-xs block">
                    {l.meio === 'pix' ? 'Pix · ' : l.meio === 'debito' ? 'Débito · ' : l.meio === 'dinheiro' ? 'Dinheiro · ' : l.meio === 'credito' ? 'Crédito · ' : ''}
                    {l.cartao}
                  </span>
                </div>
                <div className="col-span-1 text-sm text-slate-400">
                  {l.parcelado ? `${l.parcelaAtual}/${l.totalParcelas}` : <span className="text-slate-600">—</span>}
                </div>
                <div className="col-span-2 text-right text-sm font-medium text-rose-400">
                  R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  {onEditar && (
                    <button
                      onClick={() => onEditar(l)}
                      className="w-7 h-7 rounded-md hover:bg-slate-700 text-slate-400 hover:text-sky-400 flex items-center justify-center transition"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {onExcluir && (
                    <button
                      onClick={() => handleExcluir(l)}
                      className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-slate-700 text-slate-400 hover:text-rose-400"
                      title="Excluir"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
