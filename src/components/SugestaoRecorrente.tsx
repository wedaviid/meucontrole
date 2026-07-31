import type { FaturaItem } from '../types'

export interface CandidatoRecorrente {
  nome: string
  valor: number
  pessoa: 'David' | 'Kamille'
  categoria: string
  cartao: string
  vezes: number
}

interface SugestaoRecorrenteProps {
  candidatos: CandidatoRecorrente[]
  onAceitar: (c: CandidatoRecorrente) => void
  onDispensar: (nome: string) => void
}

export function SugestaoRecorrente({ candidatos, onAceitar, onDispensar }: SugestaoRecorrenteProps) {
  if (candidatos.length === 0) return null

  return (
    <div className="space-y-3">
      {candidatos.map((c) => (
        <div
          key={c.nome + c.pessoa}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-medium text-amber-200">Possível recorrente</p>
            <p className="text-white font-semibold mt-0.5">
              {c.nome}{' '}
              <span className="text-slate-400 font-normal text-sm">
                · R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {c.pessoa}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Apareceu {c.vezes}x · {c.categoria}. Quer lançar todo mês automaticamente?
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onDispensar(c.nome)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition"
            >
              Agora não
            </button>
            <button
              onClick={() => onAceitar(c)}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-sm font-medium text-slate-900 transition"
            >
              Tornar recorrente
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Detecta despesas repetidas que ainda não são de recorrenteId */
export function detectarCandidatosRecorrentes(
  despesas: FaturaItem[],
  nomesRecorrentes: Set<string>,
  dispensados: Set<string>
): CandidatoRecorrente[] {
  const mapa = new Map<string, FaturaItem[]>()

  for (const d of despesas) {
    if (d.recorrenteId) continue
    // ignora nomes já no formato "X 2/6"
    if (/\s\d+\/\d+$/.test(d.nome)) continue
    const chave = `${d.nome.toLowerCase().trim()}|${d.pessoa}`
    if (dispensados.has(chave) || dispensados.has(d.nome.toLowerCase())) continue
    if (nomesRecorrentes.has(d.nome.toLowerCase().trim())) continue
    if (!mapa.has(chave)) mapa.set(chave, [])
    mapa.get(chave)!.push(d)
  }

  const candidatos: CandidatoRecorrente[] = []
  for (const [, itens] of mapa) {
    // 1 ocorrência em categoria típica de recorrência, ou 2+ qualquer
    const cats = ['Assinatura', 'Essenciais', 'Saúde', 'Pet', 'Estudos']
    const tipica = cats.includes(itens[0].categoria)
    if (itens.length >= 2 || (itens.length >= 1 && tipica && itens[0].valor >= 20)) {
      const base = itens[0]
      candidatos.push({
        nome: base.nome,
        valor: base.valor,
        pessoa: (base.pessoa === 'Kamille' ? 'Kamille' : 'David'),
        categoria: base.categoria,
        cartao: base.cartao,
        vezes: itens.length,
      })
    }
  }

  return candidatos.slice(0, 5)
}
