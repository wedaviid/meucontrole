interface SummaryCardsProps {
  receitas: number
  despesas: number
  saldo: number
  investido?: number
  pctInvestimentos?: number
  onClickReceitas?: () => void
  onClickDespesas?: () => void
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function SummaryCards({
  receitas,
  despesas,
  saldo,
  investido = 0,
  pctInvestimentos = 20,
  onClickReceitas,
  onClickDespesas,
}: SummaryCardsProps) {
  const metaInvest = Math.round(receitas * (pctInvestimentos / 100))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        type="button"
        onClick={onClickReceitas}
        className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left transition ${
          onClickReceitas ? 'hover:border-emerald-500/40 hover:bg-slate-900/80 cursor-pointer active:scale-[0.99]' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-slate-300">Receitas</p>
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-400 tabular-nums">R$ {brl(receitas)}</p>
        <p className="text-xs text-slate-400 mt-1">Todas as pessoas + extras</p>
      </button>

      <button
        type="button"
        onClick={onClickDespesas}
        className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left transition ${
          onClickDespesas ? 'hover:border-rose-500/40 hover:bg-slate-900/80 cursor-pointer active:scale-[0.99]' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-slate-300">Despesas</p>
          <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-rose-400 tabular-nums">R$ {brl(despesas)}</p>
        <p className="text-xs text-slate-400 mt-1">Todos os cartões + fixos</p>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-slate-300">Saldo do mês</p>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              saldo >= 0 ? 'bg-emerald-500/15' : 'bg-rose-500/15'
            }`}
          >
            <svg
              className={`w-4 h-4 ${saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {saldo >= 0 ? '' : '- '}R$ {brl(Math.abs(saldo))}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {saldo >= 0 ? 'Dentro do planejado' : 'Atenção necessária'}
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-slate-300">Investido</p>
          <div className="w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-sky-400 tabular-nums">R$ {brl(investido)}</p>
        <p className="text-xs text-slate-400 mt-1">
          Meta {pctInvestimentos}%: R$ {brl(metaInvest)}
        </p>
      </div>
    </div>
  )
}
