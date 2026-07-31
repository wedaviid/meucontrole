interface PessoaDinamica {
  iniciais: string
  nome: string
  detalhe: string
  total: number
  cor: string
}

interface PeopleSectionProps {
  pessoas: PessoaDinamica[]
}

export function PeopleSection({ pessoas }: PeopleSectionProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-5">Controle por Pessoa</h3>
      <div className="space-y-4">
        {pessoas.map((p) => (
          <div key={p.nome} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${p.cor} flex items-center justify-center text-sm font-semibold`}>
                  {p.iniciais}
                </div>
                <div>
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-xs text-slate-400">{p.detalhe}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-rose-400">
                R$ {p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
