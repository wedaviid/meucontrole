import { resumoMes, fecharMes, reabrirMes, listarMesesDisponiveis } from '../utils/storage'

interface HistoricoPageProps {
  mesAtual: string
  onIrParaMes: (mes: string) => void
}

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatarMes(mes: string) {
  const [ano, m] = mes.split('-')
  return `${MESES_PT[parseInt(m, 10) - 1]} ${ano}`
}

export function HistoricoPage({ mesAtual, onIrParaMes }: HistoricoPageProps) {
  const meses = listarMesesDisponiveis()
  const resumos = meses.map((m) => resumoMes(m))

  const handleFechar = (mes: string) => {
    fecharMes(mes)
    // força re-render via reload simples da lista
    window.location.reload()
  }

  const handleReabrir = (mes: string) => {
    reabrirMes(mes)
    window.location.reload()
  }

  // Comparativo: mês atual vs anterior
  const atual = resumos.find((r) => r.mes === mesAtual)
  const idxAtual = resumos.findIndex((r) => r.mes === mesAtual)
  const anterior = idxAtual >= 0 && idxAtual < resumos.length - 1 ? resumos[idxAtual + 1] : null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Histórico de Meses</h3>
        <p className="text-sm text-slate-400">Compare períodos e feche meses concluídos</p>
      </div>

      {/* Comparativo rápido */}
      {atual && anterior && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-medium text-slate-300 mb-4">
            {formatarMes(atual.mes)} vs {formatarMes(anterior.mes)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Receitas</p>
              <p className="text-lg font-semibold text-emerald-400">
                R$ {atual.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-0.5 ${atual.totalReceitas >= anterior.totalReceitas ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                {atual.totalReceitas >= anterior.totalReceitas ? '↑' : '↓'}{' '}
                R$ {Math.abs(atual.totalReceitas - anterior.totalReceitas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Despesas</p>
              <p className="text-lg font-semibold text-rose-400">
                R$ {atual.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-0.5 ${atual.totalDespesas <= anterior.totalDespesas ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                {atual.totalDespesas <= anterior.totalDespesas ? '↓' : '↑'}{' '}
                R$ {Math.abs(atual.totalDespesas - anterior.totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Saldo</p>
              <p className={`text-lg font-semibold ${atual.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {atual.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-xs mt-0.5 ${atual.saldo >= anterior.saldo ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                {atual.saldo >= anterior.saldo ? '↑' : '↓'}{' '}
                R$ {Math.abs(atual.saldo - anterior.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de meses */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h4 className="font-semibold">Todos os meses</h4>
        </div>
        <div className="divide-y divide-slate-800/60">
          {resumos.map((r) => (
            <div key={r.mes} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {formatarMes(r.mes)}
                    {r.mes === mesAtual && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">Atual</span>
                    )}
                    {r.fechado && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Fechado</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{r.qtdDespesas} lançamentos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-emerald-400">+ R$ {r.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-rose-400">- R$ {r.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <p className={`font-semibold w-28 text-right ${r.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  R$ {r.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-2">
                  {r.mes !== mesAtual && (
                    <button onClick={() => onIrParaMes(r.mes)} className="text-xs text-sky-400 hover:text-sky-300">
                      Abrir
                    </button>
                  )}
                  {r.fechado ? (
                    <button onClick={() => handleReabrir(r.mes)} className="text-xs text-slate-400 hover:text-white">
                      Reabrir
                    </button>
                  ) : r.mes !== mesAtual ? (
                    <button onClick={() => handleFechar(r.mes)} className="text-xs text-amber-400 hover:text-amber-300">
                      Fechar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
