interface ResumoMesProps {
  receitas: number
  despesas: number
  saldo: number
  essenciais: number
  naoEssenciais: number
  investimentos: number
  limiteEssenciais: number
  limiteNaoEssenciais: number
  limiteInvestimentos: number
  pctEssenciais?: number
  pctNaoEssenciais?: number
  pctInvestimentos?: number
  metodoOrcamento?: string
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ResumoMes({
  receitas,
  despesas,
  saldo,
  essenciais,
  naoEssenciais,
  investimentos,
  limiteEssenciais,
  limiteNaoEssenciais,
  limiteInvestimentos,
  pctEssenciais = 50,
  pctNaoEssenciais = 30,
  pctInvestimentos = 20,
  metodoOrcamento = '50-30-20',
}: ResumoMesProps) {
  if (receitas === 0 && despesas === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <p className="text-sm font-medium text-sky-400 mb-1">Resumo do mês</p>
        <p className="text-sm text-slate-400">
          Ainda não há lançamentos neste mês. Adicione receitas e despesas para ver o panorama.
        </p>
      </div>
    )
  }

  const frases: string[] = []
  const labelMetodo =
    metodoOrcamento === '80-20'
      ? '80/20'
      : metodoOrcamento === '60-20-20'
        ? '60/20/20'
        : metodoOrcamento === 'personalizado'
          ? 'personalizado'
          : '50/30/20'

  if (saldo >= 0) {
    frases.push(`Você recebeu ${brl(receitas)}, gastou ${brl(despesas)} e sobrou ${brl(saldo)}.`)
  } else {
    frases.push(
      `Você recebeu ${brl(receitas)}, gastou ${brl(despesas)} e ficou negativo em ${brl(Math.abs(saldo))}.`
    )
  }

  if (metodoOrcamento === '80-20') {
    const gastos = essenciais + naoEssenciais
    if (limiteEssenciais > 0) {
      const pct = (gastos / limiteEssenciais) * 100
      if (pct > 100) {
        frases.push(`Gastos gerais passaram de 80%: ${brl(gastos)} de ${brl(limiteEssenciais)}.`)
      } else {
        frases.push(`Gastos gerais em ${pct.toFixed(0)}% do limite 80% (${brl(gastos)}).`)
      }
    }
  } else if (limiteNaoEssenciais > 0) {
    const pct = (naoEssenciais / limiteNaoEssenciais) * 100
    if (pct > 100) {
      frases.push(
        `Não Essenciais estourou o limite de ${pctNaoEssenciais}%: ${brl(naoEssenciais)} de ${brl(limiteNaoEssenciais)}.`
      )
    } else if (pct > 80) {
      frases.push(
        `Não Essenciais está em ${pct.toFixed(0)}% do limite (${brl(naoEssenciais)}). Vale frear um pouco.`
      )
    } else {
      frases.push(
        `Não Essenciais sob controle: ${brl(naoEssenciais)} de ${brl(limiteNaoEssenciais)} (${pct.toFixed(0)}%).`
      )
    }
  }

  if (limiteInvestimentos > 0) {
    const falta = Math.max(0, limiteInvestimentos - investimentos)
    if (investimentos >= limiteInvestimentos) {
      frases.push(`Meta de investimentos (${pctInvestimentos}%) batida: ${brl(investimentos)}.`)
    } else if (investimentos > 0) {
      frases.push(
        `Investiu ${brl(investimentos)}. Faltam ${brl(falta)} para os ${pctInvestimentos}% do mês.`
      )
    } else {
      frases.push(
        `Ainda não houve investimento. A meta de ${pctInvestimentos}% seria ${brl(limiteInvestimentos)}.`
      )
    }
  }

  if (metodoOrcamento !== '80-20' && limiteEssenciais > 0 && essenciais > limiteEssenciais) {
    frases.push(
      `Atenção: Essenciais passou dos ${pctEssenciais}% (${brl(essenciais)} de ${brl(limiteEssenciais)}).`
    )
  }

  return (
    <div className="bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Resumo inteligente</p>
          <p className="text-xs text-slate-500">Método {labelMetodo}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {frases.slice(0, 4).map((f, i) => (
          <li key={i} className="text-sm text-slate-300 leading-relaxed flex gap-2">
            <span className="text-sky-400/60 shrink-0">•</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
