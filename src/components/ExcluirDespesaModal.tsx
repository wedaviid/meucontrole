import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { FaturaItem } from '../types'
import type { ModoExclusaoParcela } from '../utils/storage'
import { nomeBaseParcela } from '../utils/storage'

interface Props {
  aberto: boolean
  item: FaturaItem | null
  onFechar: () => void
  onConfirmar: (modo: ModoExclusaoParcela) => void
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export function ExcluirDespesaModal({ aberto, item, onFechar, onConfirmar }: Props) {
  const [modo, setModo] = useState<ModoExclusaoParcela>('somente')

  if (!aberto || !item) return null

  const isParcelado = !!(item.parcelado && item.totalParcelas && item.totalParcelas > 1)
  const base = nomeBaseParcela(item.nome)
  const rotuloParcela =
    isParcelado && item.parcelaAtual && item.totalParcelas
      ? `${item.parcelaAtual}/${item.totalParcelas}`
      : null

  const opcoes: { id: ModoExclusaoParcela; titulo: string; desc: string }[] = [
    {
      id: 'somente',
      titulo: 'Só esta parcela',
      desc: 'Remove apenas este lançamento neste mês',
    },
    {
      id: 'futuras',
      titulo: 'Esta e as próximas',
      desc: 'Remove esta e as parcelas dos meses seguintes',
    },
    {
      id: 'todas',
      titulo: 'Todas as parcelas',
      desc: 'Inclui as que já passaram em outros meses',
    },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[320] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Excluir despesa</h3>
            <p className="text-sm text-slate-300 mt-2">
              {base}
              {rotuloParcela && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {rotuloParcela}
                </span>
              )}
            </p>
            <p className="text-sm text-rose-400 tabular-nums mt-0.5">R$ {brl(item.valor)}</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ×
          </button>
        </div>

        {isParcelado ? (
          <>
            <p className="text-sm text-slate-400">
              Esta despesa faz parte de um parcelamento. O que deseja excluir?
            </p>
            <div className="space-y-2">
              {opcoes.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setModo(o.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition ${
                    modo === o.id
                      ? 'border-rose-500/50 bg-rose-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        modo === o.id ? 'border-rose-400' : 'border-slate-500'
                      }`}
                    >
                      {modo === o.id && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                    </span>
                    <span className="text-sm font-medium text-white">{o.titulo}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-6">{o.desc}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Tem certeza que deseja excluir este lançamento?</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-sm text-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(isParcelado ? modo : 'somente')}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-medium text-white"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
