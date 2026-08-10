import type { Receita } from '../types'

interface ReceitasSectionProps {
  receitas: Receita[]
  onExcluir: (id: number) => void
  onEditar: (receita: Receita) => void
}

function isRecebido(r: Receita) {
  return r.recebido !== false
}

export function ReceitasSection({ receitas, onExcluir, onEditar }: ReceitasSectionProps) {
  const totalRecebido = receitas.filter(isRecebido).reduce((a, r) => a + r.valor, 0)
  const totalAReceber = receitas.filter((r) => !isRecebido(r)).reduce((a, r) => a + r.valor, 0)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Receitas do mês</h3>
          <p className="text-xs text-slate-500">{receitas.length} lançamento(s)</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-400 tabular-nums">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {totalAReceber > 0 && (
            <p className="text-[11px] text-amber-400/90 tabular-nums mt-0.5">
              A receber R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {receitas.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          Nenhuma receita neste mês. Use o botão + Receita.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {receitas.map((r) => {
            const ok = isRecebido(r)
            return (
              <div
                key={r.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition cursor-pointer"
                onClick={() => onEditar(r)}
              >
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{r.nome}</p>
                  <p className="text-xs text-slate-500">
                    {r.pessoa} · {r.data}
                    {r.categoria ? ` · ${r.categoria}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium tabular-nums block ${
                        ok ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      + R$ {r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-[10px] ${
                        ok ? 'text-emerald-500/80' : 'text-amber-400/90'
                      }`}
                    >
                      {ok ? 'recebido' : 'a receber'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditar(r)}
                    className="text-xs text-slate-500 hover:text-sky-400 transition hidden sm:inline"
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
            )
          })}
        </div>
      )}
    </div>
  )
}
