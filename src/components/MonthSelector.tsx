interface MonthSelectorProps {
  mesAtual: string
  mesesDisponiveis: string[]
  onChangeMes: (mes: string) => void
  onNovoMes: () => void
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function ehMesValido(mes: string) {
  return /^\d{4}-\d{2}$/.test(mes)
}

function formatarMes(mes: string) {
  if (!ehMesValido(mes)) return null
  const [ano, m] = mes.split('-')
  const idx = parseInt(m, 10) - 1
  return `${MESES_PT[idx]} ${ano}`
}

export function MonthSelector({ mesAtual, mesesDisponiveis, onChangeMes, onNovoMes }: MonthSelectorProps) {
  const lista = Array.from(
    new Set([mesAtual, ...mesesDisponiveis].filter(ehMesValido))
  ).sort().reverse()

  return (
    <div className="flex items-center gap-2 min-w-0">
      <select
        value={ehMesValido(mesAtual) ? mesAtual : lista[0] || ''}
        onChange={(e) => onChangeMes(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500 max-w-[200px]"
      >
        {lista.map((m) => {
          const label = formatarMes(m)
          if (!label) return null
          return (
            <option key={m} value={m}>
              {label}
            </option>
          )
        })}
      </select>
      <button
        type="button"
        onClick={onNovoMes}
        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition shrink-0"
        title="Criar novo mês"
      >
        + Mês
      </button>
    </div>
  )
}
