import type { Pagina } from '../types'

interface SidebarProps {
  pagina: Pagina
  onChangePagina: (pagina: Pagina) => void
  aberto?: boolean
  onFechar?: () => void
  nomeEspaco?: string
  pessoaPrincipal?: string
}

export function Sidebar({ pagina, onChangePagina, aberto = false, onFechar, nomeEspaco = 'Meu espaço', pessoaPrincipal = 'Você' }: SidebarProps) {
  const linkClass = (ativa: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
      ativa
        ? 'bg-sky-500/10 text-sky-400 font-medium'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`

  const navegar = (p: Pagina) => {
    onChangePagina(p)
    onFechar?.()
  }

  const conteudo = (
    <>
      <div
        className="p-5 border-b border-slate-800 flex items-center justify-between"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo-mark.png"
            alt="MeuControle"
            className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-sky-500/20"
          />
          <div>
            <h1 className="font-semibold text-white">MeuControle</h1>
            <p className="text-xs text-slate-400">{nomeEspaco}</p>
          </div>
        </div>
        {onFechar && (
          <button onClick={onFechar} className="md:hidden w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button onClick={() => navegar('dashboard')} className={linkClass(pagina === 'dashboard')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>

        <button onClick={() => navegar('faturas')} className={linkClass(pagina === 'faturas')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cartões
        </button>

        <button onClick={() => navegar('recorrentes')} className={linkClass(pagina === 'recorrentes')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recorrentes
        </button>

        <button onClick={() => navegar('objetivos')} className={linkClass(pagina === 'objetivos')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Objetivos
        </button>

        <button onClick={() => navegar('pessoas')} className={linkClass(pagina === 'pessoas')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Pessoas
        </button>

        <button onClick={() => navegar('historico')} className={linkClass(pagina === 'historico')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Histórico
        </button>

        <button onClick={() => navegar('sync')} className={linkClass(pagina === 'sync')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Nuvem
        </button>

        <button onClick={() => navegar('config')} className={linkClass(pagina === 'config')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurações
        </button>
      </nav>

      <div
        className="p-4 border-t border-slate-800"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold">
            {(pessoaPrincipal || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium text-white truncate">{pessoaPrincipal}</p>
            <p className="text-xs text-slate-400 truncate">{nomeEspaco}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex shrink-0">
        {conteudo}
      </aside>

      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${aberto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />
        <aside className={`absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${aberto ? 'translate-x-0' : '-translate-x-full'}`}>
          {conteudo}
        </aside>
      </div>
    </>
  )
}
