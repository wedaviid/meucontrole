import type { FaturaItem } from '../types'

interface TransactionsListProps {
  lancamentos: FaturaItem[]
  onVerTodas?: () => void
  onEditar?: (item: FaturaItem) => void
}

export function TransactionsList({ lancamentos, onVerTodas, onEditar }: TransactionsListProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">Últimos lançamentos</h3>
        {onVerTodas && (
          <button
            type="button"
            onClick={onVerTodas}
            className="text-sm text-sky-400 hover:text-sky-300 transition"
          >
            Ver todas →
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {lancamentos.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhuma despesa neste mês</p>
        ) : (
          lancamentos.map((l, idx) => (
            <div
              key={l.id}
              role={onEditar ? 'button' : undefined}
              onClick={() => onEditar?.(l)}
              className={`flex items-center justify-between py-2.5 ${
                idx < lancamentos.length - 1 ? 'border-b border-slate-800/80' : ''
              } ${onEditar ? 'cursor-pointer hover:bg-slate-800/30 -mx-2 px-2 rounded-lg' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg ${l.cor} flex items-center justify-center text-xs font-medium shrink-0`}
                >
                  {l.sigla}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {l.nome}
                    {l.pago === false && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                        Pendente
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {l.pessoa} · {l.categoria}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-rose-400 tabular-nums shrink-0">
                - R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
