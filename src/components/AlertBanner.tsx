interface AlertBannerProps {
  titulo: string
  mensagem: string
}

export function AlertBanner({ titulo, mensagem }: AlertBannerProps) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-rose-300">{titulo}</h4>
        <p className="text-xs text-rose-200/70 mt-0.5 leading-relaxed">{mensagem}</p>
      </div>
    </div>
  )
}
