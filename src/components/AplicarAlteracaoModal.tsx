import { createPortal } from 'react-dom'

interface Props {
  aberto: boolean
  titulo?: string
  onSomenteEste: () => void
  onProximos: () => void
  onFechar: () => void
}

export function AplicarAlteracaoModal({
  aberto,
  titulo = 'Alteração salva',
  onSomenteEste,
  onProximos,
  onFechar,
}: Props) {
  if (!aberto) return null

  return createPortal(
    <div className="fixed inset-0 z-[330] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative w-full sm:max-w-sm bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 text-center space-y-4">
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-3 top-3 w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          ×
        </button>
        <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/15 flex items-center justify-center">
          <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{titulo}</h3>
          <p className="text-sm text-slate-400 mt-2">
            Este lançamento se repete. Deseja aplicar a mesma alteração nos próximos?
          </p>
        </div>
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onSomenteEste}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
          >
            Não, apenas este
          </button>
          <button
            type="button"
            onClick={onProximos}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
          >
            Sim, atualizar próximos
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
