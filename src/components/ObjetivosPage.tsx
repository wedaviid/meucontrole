import { useState } from 'react'
import type { Objetivo } from '../types'
import { CORES_OBJETIVO } from '../types'

interface ObjetivosPageProps {
  lista: Objetivo[]
  onSalvar: (lista: Objetivo[]) => void
  saldoDisponivel?: number
}

export function ObjetivosPage({ lista, onSalvar }: ObjetivosPageProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Objetivo | null>(null)
  const [nome, setNome] = useState('')
  const [valorMeta, setValorMeta] = useState('')
  const [valorAtual, setValorAtual] = useState('')
  const [dataLimite, setDataLimite] = useState('')
  const [erro, setErro] = useState('')
  const [aporteId, setAporteId] = useState<number | null>(null)
  const [aporteValor, setAporteValor] = useState('')

  const totalMetas = lista.reduce((a, o) => a + o.valorMeta, 0)
  const totalGuardado = lista.reduce((a, o) => a + o.valorAtual, 0)

  const abrirNovo = () => {
    setEditando(null)
    setNome('')
    setValorMeta('')
    setValorAtual('0')
    setDataLimite('')
    setErro('')
    setModalAberto(true)
  }

  const abrirEditar = (o: Objetivo) => {
    setEditando(o)
    setNome(o.nome)
    setValorMeta(String(o.valorMeta))
    setValorAtual(String(o.valorAtual))
    setDataLimite(o.dataLimite || '')
    setErro('')
    setModalAberto(true)
  }

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do objetivo'); return }
    const meta = parseFloat(valorMeta.replace(',', '.'))
    const atual = parseFloat(valorAtual.replace(',', '.')) || 0
    if (isNaN(meta) || meta <= 0) { setErro('Valor da meta inválido'); return }

    if (editando) {
      onSalvar(lista.map((o) => o.id === editando.id ? {
        ...o, nome: nome.trim(), valorMeta: meta, valorAtual: atual, dataLimite: dataLimite || undefined
      } : o))
    } else {
      const cor = CORES_OBJETIVO[lista.length % CORES_OBJETIVO.length]
      onSalvar([...lista, {
        id: Date.now(), nome: nome.trim(), valorMeta: meta, valorAtual: atual,
        dataLimite: dataLimite || undefined, cor,
      }])
    }
    setModalAberto(false)
  }

  const excluir = (id: number) => onSalvar(lista.filter((o) => o.id !== id))

  const fazerAporte = (id: number) => {
    const v = parseFloat(aporteValor.replace(',', '.'))
    if (isNaN(v) || v <= 0) return
    onSalvar(lista.map((o) => o.id === id ? { ...o, valorAtual: o.valorAtual + v } : o))
    setAporteId(null)
    setAporteValor('')
  }

  const mesesRestantes = (dataLimite?: string) => {
    if (!dataLimite) return null
    const [ano, mes] = dataLimite.split('-').map(Number)
    const agora = new Date()
    const diff = (ano - agora.getFullYear()) * 12 + (mes - (agora.getMonth() + 1))
    return Math.max(diff, 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Objetivos Pessoais</h3>
          <p className="text-sm text-slate-400">Viagem, carro, casa e outras metas</p>
        </div>
        <button onClick={abrirNovo} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium transition">
          + Objetivo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400 mb-1">Total das metas</p>
          <p className="text-xl font-bold text-white">R$ {totalMetas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400 mb-1">Já guardado</p>
          <p className="text-xl font-bold text-emerald-400">R$ {totalGuardado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-sm text-slate-400 mb-1">Ainda falta</p>
          <p className="text-xl font-bold text-amber-400">R$ {Math.max(totalMetas - totalGuardado, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-2">Nenhum objetivo cadastrado</p>
          <p className="text-sm text-slate-500">Ex: Viagem para o Nordeste, carro novo, entrada da casa...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lista.map((o) => {
            const pct = Math.min((o.valorAtual / o.valorMeta) * 100, 100)
            const falta = Math.max(o.valorMeta - o.valorAtual, 0)
            const meses = mesesRestantes(o.dataLimite)
            const porMes = meses ? falta / meses : null

            return (
              <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{o.nome}</h4>
                    {o.dataLimite && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Meta até {o.dataLimite.split('-').reverse().join('/')}
                        {meses ? ` · ${meses} mês(es)` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => abrirEditar(o)} className="text-xs text-slate-400 hover:text-sky-400">Editar</button>
                    <button onClick={() => excluir(o.id)} className="text-xs text-slate-400 hover:text-rose-400">Excluir</button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-emerald-400">R$ {o.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-slate-400">R$ {o.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${o.cor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{pct.toFixed(0)}% concluído · falta R$ {falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {porMes !== null && porMes > 0 && (
                    <p className="text-xs text-sky-400/80 mt-1">Guarde ~R$ {porMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês para bater a meta</p>
                  )}
                </div>

                {aporteId === o.id ? (
                  <div className="flex gap-2">
                    <input value={aporteValor} onChange={(e) => setAporteValor(e.target.value)} placeholder="Valor do aporte"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
                    <button onClick={() => fazerAporte(o.id)} className="px-3 py-2 rounded-lg bg-emerald-600 text-sm text-white">OK</button>
                    <button onClick={() => setAporteId(null)} className="px-3 py-2 rounded-lg bg-slate-800 text-sm text-slate-400">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setAporteId(o.id)} className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition">
                    + Fazer aporte
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold">{editando ? 'Editar Objetivo' : 'Novo Objetivo'}</h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Viagem, carro novo..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Valor da meta (R$)</label>
                  <input value={valorMeta} onChange={(e) => setValorMeta(e.target.value)} placeholder="5000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Já guardado (R$)</label>
                  <input value={valorAtual} onChange={(e) => setValorAtual(e.target.value)} placeholder="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Data limite (opcional)</label>
                <input type="month" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500" />
              </div>
              {erro && <p className="text-sm text-rose-400">{erro}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-2.5 rounded-lg bg-slate-800 text-sm text-slate-300">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
