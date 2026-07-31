import type { Receita } from '../types'

interface ReceitasSectionProps {
  receitas: Receita[]
  onExcluir: (id: number) => void
  onEditar: (receita: Receita) => void
}

export function ReceitasSection({ receitas, onExcluir, onEditar }: ReceitasSectionProps) {
  const total = receitas.reduce((a, r) => a + r.valor, 0)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Receitas do mês</h3>
          <p className="text-xs text-slate-500">{receitas.length} lançamento(s)</p>
        </div>
        <p className="text-sm font-semibold text-emerald-400 tabular-nums">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {receitas.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          Nenhuma receita neste mês. Use o botão + Receita.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {receitas.map((r) => (
            <div
              key={r.id}
              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition cursor-pointer"
              onClick={() => onEditar(r)}
            >
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{r.nome}</p>
                <p className="text-xs text-slate-500">
                  {r.pessoa} · {r.data}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm font-medium text-emerald-400 tabular-nums">
                  + R$ {r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  onClick={() => onEditar(r)}
                  className="text-xs text-slate-500 hover:text-sky-400 transition"
                  title="Editar receita"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onExcluir(r.id)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition"
                  title="Excluir receita"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
