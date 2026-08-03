import { useEffect, useState } from 'react'
import type { FaturaItem } from '../types'
import { GRADIENTES_CATEGORIA } from '../types'

interface ChartsSectionProps {
  despesas: FaturaItem[]
  totalEssenciais?: number
  totalAlimentacao?: number
  totalInvestimentos?: number
}

function DonutChart({ essenciais, alimentacao, investimentos }: { essenciais: number; alimentacao: number; investimentos: number }) {
  const data = [
    { nome: 'Essenciais', valor: essenciais, cor: '#10b981' },
    { nome: 'Não Essenciais', valor: alimentacao, cor: '#f43f5e' },
    { nome: 'Investimentos', valor: investimentos, cor: '#0ea5e9' },
  ]
  const total = data.reduce((a, b) => a + b.valor, 0) || 1
  const radius = 70
  const stroke = 22
  const circumference = 2 * Math.PI * radius
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  let offset = 0

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-5">Distribuição dos Gastos</h3>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
            {data.map((item, index) => {
              if (item.valor === 0) return null
              const pct = item.valor / total
              const dash = pct * circumference
              const currentOffset = offset
              offset += dash
              return (
                <circle
                  key={item.nome}
                  cx="90" cy="90" r={radius} fill="none"
                  stroke={item.cor} strokeWidth={stroke}
                  strokeDasharray={animated ? `${dash} ${circumference - dash}` : `0 ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  style={{ transition: `stroke-dasharray 1s ease-out ${index * 0.2}s` }}
                />
              )
            })}
          </svg>
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${animated ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <span className="text-2xl font-bold text-white">R$ {(total / 1000).toFixed(1)}k</span>
            <span className="text-xs text-slate-400">total gasto</span>
          </div>
        </div>
        <div className="space-y-3 flex-1 w-full">
          {data.map((item, index) => (
            <div key={item.nome} className="flex items-center justify-between transition-all duration-500"
              style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateX(0)' : 'translateX(12px)', transitionDelay: `${0.3 + index * 0.15}s` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.cor }} />
                <span className="text-sm text-slate-300">{item.nome}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-white">R$ {item.valor.toLocaleString('pt-BR')}</span>
                <span className="text-xs text-slate-500 ml-2">{((item.valor / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PeopleBarChart({ despesas }: { despesas: FaturaItem[] }) {
  const cores = [
    { text: 'text-indigo-400', bar: 'from-indigo-600 to-indigo-400' },
    { text: 'text-pink-400', bar: 'from-pink-600 to-pink-400' },
    { text: 'text-emerald-400', bar: 'from-emerald-600 to-emerald-400' },
    { text: 'text-amber-400', bar: 'from-amber-600 to-amber-400' },
  ]
  const mapa: Record<string, number> = {}
  despesas.forEach((l) => {
    if (!l.pessoa) return
    mapa[l.pessoa] = (mapa[l.pessoa] || 0) + l.valor
  })
  const items = Object.entries(mapa).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor)
  const max = Math.max(...items.map((i) => i.valor), 1)
  const total = items.reduce((a, i) => a + i.valor, 0)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150)
    return () => clearTimeout(t)
  }, [despesas])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-5">Gastos por Pessoa</h3>
      <div className="space-y-6">
        {items.map((item, idx) => {
          const cor = cores[idx % cores.length]
          return (
            <div key={item.nome}>
              <div className="flex justify-between text-sm mb-2">
                <span className={`${cor.text} font-medium`}>{item.nome}</span>
                <span className="text-slate-300 transition-opacity duration-500" style={{ opacity: animated ? 1 : 0 }}>
                  R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${cor.bar} rounded-full`}
                  style={{ width: animated ? `${(item.valor / max) * 100}%` : '0%', transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.1}s` }} />
              </div>
            </div>
          )
        })}
        {items.length >= 1 && (
          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-500 transition-opacity duration-700"
            style={{ opacity: animated ? 1 : 0, transitionDelay: '0.5s' }}>
            <span>{items[0].nome} representa {total > 0 ? ((items[0].valor / total) * 100).toFixed(0) : 0}% dos gastos</span>
            {items.length >= 2 && (
              <span>Diferença: R$ {Math.abs(items[0].valor - items[1].valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            )}
          </div>
        )}
        {items.length === 0 && <p className="text-sm text-slate-500">Sem gastos no período</p>}
      </div>
    </div>
  )
}

function CategoryBars({ despesas }: { despesas: FaturaItem[] }) {
  const mapa: Record<string, number> = {}
  despesas.forEach((l) => { mapa[l.categoria] = (mapa[l.categoria] || 0) + l.valor })
  const categorias = Object.entries(mapa).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor).slice(0, 6)
  const max = categorias[0]?.valor || 1
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [despesas])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-5">Top Categorias</h3>
      <div className="space-y-4">
        {categorias.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Nenhuma despesa ainda</p>
        ) : (
          categorias.map((cat, index) => (
            <div key={cat.nome}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 transition-all duration-500"
                  style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateX(0)' : 'translateX(-8px)', transitionDelay: `${index * 0.08}s` }}>
                  {cat.nome}
                </span>
                <span className="text-slate-400 transition-opacity duration-500"
                  style={{ opacity: animated ? 1 : 0, transitionDelay: `${0.2 + index * 0.08}s` }}>
                  R$ {cat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${GRADIENTES_CATEGORIA[cat.nome] || 'from-slate-500 to-slate-400'} rounded-full`}
                  style={{ width: animated ? `${(cat.valor / max) * 100}%` : '0%', transition: `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function ChartsSection({ despesas, totalEssenciais = 0, totalAlimentacao = 0, totalInvestimentos = 0 }: ChartsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart essenciais={totalEssenciais} alimentacao={totalAlimentacao} investimentos={totalInvestimentos} />
        <PeopleBarChart despesas={despesas} />
      </div>
      <CategoryBars despesas={despesas} />
    </div>
  )
}
