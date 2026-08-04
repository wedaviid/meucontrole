import type { CategoriaBudget } from '../types'

interface BudgetProgressProps {
  categorias: CategoriaBudget[]
  baseReceitas: number
  /** Ex.: 50/30/20, 80/20, personalizado */
  titulo?: string
}

export function BudgetProgress({
  categorias,
  baseReceitas,
  titulo = 'Orçamento do mês',
}: BudgetProgressProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
          Base: R$ {baseReceitas.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="space-y-5">
        {categorias.map((cat) => {
          const limite = cat.limite > 0 ? cat.limite : 0
          const pct =
            baseReceitas <= 0 || limite <= 0
              ? 0
              : Math.min((cat.gasto / limite) * 100, 100)
          const estourou = limite > 0 && cat.gasto > limite
          const isInvest = cat.nome.toLowerCase().includes('invest')

          return (
            <div key={cat.nome}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-300">
                  {cat.nome} <span className="text-slate-500">({cat.percentual}%)</span>
                </span>
                <span className={estourou ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                  R$ {cat.gasto.toLocaleString('pt-BR')}{' '}
                  <span className="text-slate-600">
                    / R$ {limite > 0 ? limite.toLocaleString('pt-BR') : '—'}
                  </span>
                </span>
              </div>

              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cat.cor} rounded-full transition-all duration-500`}
                  style={{ width: `${Number.isFinite(pct) ? pct : 0}%` }}
                />
              </div>

              <p className={`text-xs mt-1.5 ${estourou ? 'text-rose-400/80' : cat.texto + '/80'}`}>
                {baseReceitas <= 0
                  ? 'Lance uma receita para calcular os limites'
                  : estourou
                    ? `Estourou em R$ ${(cat.gasto - limite).toLocaleString('pt-BR')} — revisar gastos`
                    : cat.gasto === 0
                      ? isInvest
                        ? 'Nada investido este mês ainda'
                        : 'Nenhum gasto nesta faixa ainda'
                      : `Ainda pode usar R$ ${(limite - cat.gasto).toLocaleString('pt-BR')} nesta faixa`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
