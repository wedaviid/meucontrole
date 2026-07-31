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

  // Frase 1: panorama geral
  if (saldo >= 0) {
    frases.push(
      `Você recebeu ${brl(receitas)}, gastou ${brl(despesas)} e sobrou ${brl(saldo)}.`
    )
  } else {
    frases.push(
      `Você recebeu ${brl(receitas)}, gastou ${brl(despesas)} e ficou negativo em ${brl(Math.abs(saldo))}.`
    )
  }

  // Frase 2: não essenciais / essenciais
  if (limiteNaoEssenciais > 0) {
    const pct = (naoEssenciais / limiteNaoEssenciais) * 100
    if (pct > 100) {
      frases.push(
        `Não Essenciais estourou o limite de 30%: ${brl(naoEssenciais)} de ${brl(limiteNaoEssenciais)}.`
      )
    } else if (pct > 80) {
      frases.push(
        `Não Essenciais está em ${pct.toFixed(0)}% do limite (${brl(naoEssenciais)}). Vale frear um pouco.`
      )
    } else {
      frases.push(
        `Não Essenciais está sob controle: ${brl(naoEssenciais)} de ${brl(limiteNaoEssenciais)} (${pct.toFixed(0)}%).`
      )
    }
  }

  // Frase 3: investimentos
  if (limiteInvestimentos > 0) {
    const falta = Math.max(0, limiteInvestimentos - investimentos)
    if (investimentos >= limiteInvestimentos) {
      frases.push(`Meta de investimentos (20%) batida: ${brl(investimentos)}.`)
    } else if (investimentos > 0) {
      frases.push(
        `Investiu ${brl(investimentos)}. Faltam ${brl(falta)} para completar os 20% do mês.`
      )
    } else {
      frases.push(
        `Ainda não houve investimento este mês. A meta de 20% seria ${brl(limiteInvestimentos)}.`
      )
    }
  }

  // Extra: essenciais se estourado
  if (limiteEssenciais > 0 && essenciais > limiteEssenciais) {
    frases.push(
      `Atenção: Essenciais passou dos 50% (${brl(essenciais)} de ${brl(limiteEssenciais)}).`
    )
  }

  return (
    <div className="bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Resumo inteligente</p>
          <p className="text-xs text-slate-500">Panorama automático do mês</p>
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
