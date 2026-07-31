import type { CategoriaBudget } from '../types'

interface BudgetProgressProps {
  categorias: CategoriaBudget[]
  baseReceitas: number
}

export function BudgetProgress({ categorias, baseReceitas }: BudgetProgressProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Regra 50/30/20</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
          Base: R$ {baseReceitas.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="space-y-5">
        {categorias.map((cat) => {
          const pct = Math.min((cat.gasto / cat.limite) * 100, 100)
          const estourou = cat.gasto > cat.limite

          return (
            <div key={cat.nome}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-300">
                  {cat.nome} <span className="text-slate-500">({cat.percentual}%)</span>
                </span>
                <span className={estourou ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                  R$ {cat.gasto.toLocaleString('pt-BR')}{' '}
                  <span className="text-slate-600">/ R$ {cat.limite.toLocaleString('pt-BR')}</span>
                </span>
              </div>

              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cat.cor} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className={`text-xs mt-1.5 ${estourou ? 'text-rose-400/80' : cat.texto + '/80'}`}>
                {estourou
                  ? `Estourou em R$ ${(cat.gasto - cat.limite).toLocaleString('pt-BR')} — revisar gastos`
                  : cat.gasto === 0
                  ? 'Nada investido este mês ainda'
                  : `Ainda pode gastar R$ ${(cat.limite - cat.gasto).toLocaleString('pt-BR')} nesta categoria`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
