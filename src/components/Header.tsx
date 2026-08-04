import { MonthSelector } from './MonthSelector'

interface HeaderProps {
  titulo?: string
  subtitulo?: string
  onNovaDespesa?: () => void
  onNovaReceita?: () => void
  onExportar?: () => void
  onAbrirMenu?: () => void
  mesAtual?: string
  mesesDisponiveis?: string[]
  onChangeMes?: (mes: string) => void
  onNovoMes?: () => void
}

export function Header({
  titulo = 'Julho 2026',
  subtitulo = 'Visão geral do orçamento familiar',
  onNovaDespesa,
  onNovaReceita,
  onExportar,
  onAbrirMenu,
  mesAtual,
  mesesDisponiveis = [],
  onChangeMes,
  onNovoMes,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 pb-3 sm:py-4"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
    >
      <div className="flex flex-col gap-3">
        {/* Linha 1: menu + título + ações (desktop) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onAbrirMenu}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 transition"
              aria-label="Abrir menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white truncate">{titulo}</h2>
              <p className="text-xs sm:text-sm text-slate-400 truncate hidden sm:block">{subtitulo}</p>
            </div>
          </div>

          {/* Ações só a partir de sm — no mobile o FAB resolve */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {onExportar && (
              <button
                type="button"
                onClick={onExportar}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition flex items-center gap-1.5"
                title="Exportar CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>CSV</span>
              </button>
            )}

            {onNovaReceita && (
              <button
                type="button"
                onClick={onNovaReceita}
                className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 text-sm font-medium transition"
              >
                + Receita
              </button>
            )}

            {onNovaDespesa && (
              <button
                type="button"
                onClick={onNovaDespesa}
                className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium transition flex items-center gap-1.5 text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Despesa</span>
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: só seletor de mês */}
        {mesAtual && onChangeMes && onNovoMes && (
          <div className="flex items-center gap-2">
            <MonthSelector
              mesAtual={mesAtual}
              mesesDisponiveis={mesesDisponiveis}
              onChangeMes={onChangeMes}
              onNovoMes={onNovoMes}
            />
          </div>
        )}
      </div>
    </header>
  )
}
