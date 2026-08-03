import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { Pagina, FaturaItem, Receita, Recorrente, Objetivo, MetaMensal, AppConfig, MeioPagamento } from './types'
import { CORES_CATEGORIA } from './types'
import {
  carregarDespesas,
  salvarDespesas,
  carregarReceitas,
  salvarReceitas,
  getMesAtual,
  setMesAtual,
  listarMesesDisponiveis,
  carregarRecorrentes,
  salvarRecorrentes,
  aplicarRecorrentesNoMes,
  gerarParcelasFuturas,
  carregarObjetivos,
  salvarObjetivos,
  carregarMetas,
  carregarConfig,
  salvarConfig,
} from './utils/storage'
import { exportarTudoCSV } from './utils/exportCsv'
import { syncPush, syncAutoPull } from './utils/sync'
import { carregarSyncConfig } from './utils/supabaseClient'

import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { SummaryCards } from './components/SummaryCards'
import { BudgetProgress } from './components/BudgetProgress'
import { PeopleSection } from './components/PeopleSection'
import { TransactionsList } from './components/TransactionsList'
import { AlertBanner } from './components/AlertBanner'
import { FaturasPage } from './components/FaturasPage'
import { ChartsSection } from './components/ChartsSection'
import { NovaDespesaModal, type NovaDespesa } from './components/NovaDespesaModal'
import { NovaReceitaModal } from './components/NovaReceitaModal'
import { RecorrentesPage } from './components/RecorrentesPage'
import { ObjetivosPage } from './components/ObjetivosPage'
import { HistoricoPage } from './components/HistoricoPage'
import { ResumoMes } from './components/ResumoMes'
import { ReceitasSection } from './components/ReceitasSection'
import { SyncPage } from './components/SyncPage'
import { ConfigPage } from './components/ConfigPage'
import { SugestaoRecorrente, detectarCandidatosRecorrentes } from './components/SugestaoRecorrente'

const CAT_ESSENCIAIS = ['Essenciais', 'Saúde']
const CAT_INVESTIMENTOS = ['Investimentos']
// Tudo que não é essencial nem investimento vai para os 30% (Não Essenciais)

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatarMesTitulo(mes: string) {
  const limpo = String(mes).replace(/"/g, '').replace(/\\/g, '')
  const [ano, m] = limpo.split('-')
  const idx = parseInt(m, 10) - 1
  if (!ano || idx < 0 || idx > 11) return 'Mês'
  return `${MESES_PT[idx]} ${ano}`
}

function App() {
  const [pagina, setPagina] = useState<Pagina>('dashboard')
  const [paginaVisivel, setPaginaVisivel] = useState<Pagina>('dashboard')
  const [animando, setAnimando] = useState(false)
  const [direcao, setDirecao] = useState<'in' | 'out'>('in')

  const [mesAtual, setMesAtualState] = useState(() => getMesAtual())
  const [mesesDisponiveis, setMesesDisponiveis] = useState(() => listarMesesDisponiveis())

  const [modalDespesa, setModalDespesa] = useState(false)
  const [modalReceita, setModalReceita] = useState(false)
  const [editando, setEditando] = useState<FaturaItem | null>(null)
  const [editandoReceita, setEditandoReceita] = useState<Receita | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [dispensadosRecorrente, setDispensadosRecorrente] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('meucontrole_dispensados_rec') || '[]')
    } catch { return [] }
  })

  const [despesasLista, setDespesasLista] = useState<FaturaItem[]>(() => {
    const mes = getMesAtual()
    return aplicarRecorrentesNoMes(mes, carregarDespesas(mes))
  })
  const [receitasLista, setReceitasLista] = useState<Receita[]>(() => carregarReceitas(mesAtual))
  const [recorrentes, setRecorrentes] = useState<Recorrente[]>(() => carregarRecorrentes())
  const [objetivos, setObjetivos] = useState<Objetivo[]>(() => carregarObjetivos())
  const [metas] = useState<MetaMensal>(() => carregarMetas())
  const [config, setConfig] = useState<AppConfig>(() => carregarConfig())

  /** Só envia para nuvem depois do pull inicial (evita sobrescrever a nuvem com dados vazios) */
  const syncReady = useRef(false)

  const recarregarDoLocal = useCallback(() => {
    const mes = getMesAtual()
    setMesAtualState(mes)
    setDespesasLista(aplicarRecorrentesNoMes(mes, carregarDespesas(mes)))
    setReceitasLista(carregarReceitas(mes))
    setRecorrentes(carregarRecorrentes())
    setObjetivos(carregarObjetivos())
    setConfig(carregarConfig())
    setMesesDisponiveis(listarMesesDisponiveis())
  }, [])

  // Ao abrir (e ao voltar para a aba): baixa da nuvem automaticamente
  useEffect(() => {
    let cancel = false
    const puxar = async () => {
      if (!carregarSyncConfig()) {
        syncReady.current = true
        return
      }
      const r = await syncAutoPull()
      if (cancel) return
      if (r.ok) {
        recarregarDoLocal()
      }
      syncReady.current = true
    }
    void puxar()

    const onVis = () => {
      if (document.visibilityState === 'visible' && carregarSyncConfig()) {
        void syncAutoPull().then((r) => {
          if (r.ok) recarregarDoLocal()
        })
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancel = true
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [recarregarDoLocal])


  useEffect(() => {
    salvarDespesas(despesasLista, mesAtual)
    if (syncReady.current && carregarSyncConfig()) {
      void syncPush(`meucontrole_despesas_${mesAtual}`, despesasLista)
      void syncPush('meucontrole_mes_atual', mesAtual)
    }
  }, [despesasLista, mesAtual])
  useEffect(() => {
    salvarReceitas(receitasLista, mesAtual)
    if (syncReady.current && carregarSyncConfig()) {
      void syncPush(`meucontrole_receitas_${mesAtual}`, receitasLista)
    }
  }, [receitasLista, mesAtual])
  useEffect(() => {
    salvarRecorrentes(recorrentes)
    if (syncReady.current && carregarSyncConfig()) void syncPush('meucontrole_recorrentes', recorrentes)
  }, [recorrentes])
  useEffect(() => {
    salvarObjetivos(objetivos)
    if (syncReady.current && carregarSyncConfig()) void syncPush('meucontrole_objetivos', objetivos)
  }, [objetivos])

  useEffect(() => {
    salvarConfig(config)
    if (syncReady.current && carregarSyncConfig()) void syncPush('meucontrole_config', config)
  }, [config])

  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAberto])

  const trocarMes = useCallback((novoMes: string) => {
    setMesAtual(novoMes)
    setMesAtualState(novoMes)
    const despesas = aplicarRecorrentesNoMes(novoMes, carregarDespesas(novoMes))
    setDespesasLista(despesas)
    salvarDespesas(despesas, novoMes)
    setReceitasLista(carregarReceitas(novoMes))
    setMesesDisponiveis(listarMesesDisponiveis())
  }, [])

  const criarNovoMes = () => {
    const [ano, mes] = mesAtual.split('-').map(Number)
    let novoAno = ano
    let novoMes = mes + 1
    if (novoMes > 12) { novoMes = 1; novoAno++ }
    const chave = `${novoAno}-${String(novoMes).padStart(2, '0')}`
    if (!mesesDisponiveis.includes(chave)) {
      salvarDespesas([], chave)
      salvarReceitas([], chave)
    }
    trocarMes(chave)
  }

  // ===== Cálculos =====
  const totalReceitas = useMemo(() => receitasLista.reduce((a, r) => a + r.valor, 0), [receitasLista])
  const totalDespesas = useMemo(() => despesasLista.filter((d) => d.pago !== false).reduce((a, d) => a + d.valor, 0), [despesasLista])
  const saldo = totalReceitas - totalDespesas

  const totalEssenciais = useMemo(
    () => despesasLista.filter((d) => d.pago !== false && CAT_ESSENCIAIS.includes(d.categoria)).reduce((a, d) => a + d.valor, 0),
    [despesasLista]
  )
  const totalInvestimentos = useMemo(
    () => despesasLista.filter((d) => d.pago !== false && CAT_INVESTIMENTOS.includes(d.categoria)).reduce((a, d) => a + d.valor, 0),
    [despesasLista]
  )
  // 30% = tudo que não é essencial nem investimento
  const totalNaoEssenciais = useMemo(
    () => Math.max(0, totalDespesas - totalEssenciais - totalInvestimentos),
    [totalDespesas, totalEssenciais, totalInvestimentos]
  )

  const categoriasBudget = useMemo(() => {
    const base = totalReceitas || 1
    return [
      {
        nome: 'Essenciais',
        percentual: 50,
        gasto: totalEssenciais,
        limite: Math.round(base * 0.5),
        cor: 'from-emerald-500 to-emerald-400',
        texto: 'text-emerald-400',
      },
      {
        nome: 'Não Essenciais',
        percentual: 30,
        gasto: totalNaoEssenciais,
        limite: Math.round(base * 0.3),
        cor: 'from-rose-500 to-rose-400',
        texto: 'text-rose-400',
      },
      {
        nome: 'Investimentos',
        percentual: 20,
        gasto: totalInvestimentos,
        limite: Math.round(base * 0.2),
        cor: 'from-sky-500 to-indigo-500',
        texto: 'text-sky-400',
      },
    ]
  }, [totalReceitas, totalEssenciais, totalNaoEssenciais, totalInvestimentos])

  const pessoasDinamicas = useMemo(() => {
    const cores = ['bg-indigo-600', 'bg-pink-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600']
    return config.pessoas.map((nome, idx) => {
      const total = despesasLista.filter((d) => d.pessoa === nome && d.pago !== false).reduce((a, d) => a + d.valor, 0)
      return {
        iniciais: nome.slice(0, 2).toUpperCase(),
        nome,
        detalhe: 'Gastos no mês',
        total,
        fatura: total,
        fixos: 0,
        cor: cores[idx % cores.length],
      }
    })
  }, [despesasLista, config.pessoas])

  const origensPorMeio = useMemo((): Record<MeioPagamento, string[]> => ({
    credito: config.origens.credito,
    debito: config.origens.debito,
    pix: config.origens.pix,
    dinheiro: [],
  }), [config.origens])

  // Alertas inteligentes
  const alertas = useMemo(() => {
    const lista: { titulo: string; mensagem: string }[] = []
    const base = totalReceitas || 1

    if (totalNaoEssenciais > base * 0.3 * (metas.alertaAlimentacao / 100)) {
      lista.push({
        titulo: 'Não Essenciais acima do limite',
        mensagem: `Você já gastou R$ ${totalNaoEssenciais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em gastos não essenciais (limite 30%: R$ ${(base * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
      })
    }
    if (totalEssenciais > base * 0.5 * (metas.alertaEssenciais / 100)) {
      lista.push({
        titulo: 'Essenciais próximos do limite',
        mensagem: `Gastos essenciais estão altos em relação aos 50% da regra.`,
      })
    }
    if (totalDespesas > base * (metas.alertaGeral / 100) && totalReceitas > 0) {
      lista.push({
        titulo: 'Atenção ao orçamento geral',
        mensagem: `Você já usou ${((totalDespesas / base) * 100).toFixed(0)}% da receita do mês.`,
      })
    }
    if (metas.metaEconomia > 0 && saldo < metas.metaEconomia && totalReceitas > 0) {
      lista.push({
        titulo: 'Meta de economia em risco',
        mensagem: `Sua meta é guardar R$ ${metas.metaEconomia.toLocaleString('pt-BR')} este mês. Saldo atual: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      })
    }
    return lista
  }, [totalNaoEssenciais, totalEssenciais, totalDespesas, totalReceitas, saldo, metas])

  // ===== Navegação =====
  const mudarPagina = (nova: Pagina) => {
    if (nova === pagina || animando) return
    setDirecao('out')
    setAnimando(true)
    setTimeout(() => {
      setPagina(nova)
      setPaginaVisivel(nova)
      setDirecao('in')
      requestAnimationFrame(() => setTimeout(() => setAnimando(false), 30))
    }, 220)
  }

  // ===== CRUD =====
  const handleSalvarDespesa = (despesa: NovaDespesa) => {
    const cor = CORES_CATEGORIA[despesa.categoria] || 'bg-slate-500/10 text-slate-400'
    const sigla = despesa.nome.slice(0, 3).toUpperCase()
    const total = despesa.parcelado ? (despesa.totalParcelas || 1) : 1
    const parcelaAtual = despesa.parcelado ? 1 : undefined
    const nomeFinal =
      despesa.parcelado && total > 1
        ? `${despesa.nome} 1/${total}`
        : despesa.nome

    if (editando) {
      setDespesasLista((prev) =>
        prev.map((item) =>
          item.id === editando.id
            ? {
                ...item,
                nome: despesa.nome,
                valor: despesa.valor,
                pessoa: despesa.pessoa,
                categoria: despesa.categoria,
                cartao: despesa.cartao,
                meio: despesa.meio,
                data: despesa.data,
                parcelado: despesa.parcelado,
                totalParcelas: despesa.totalParcelas,
                pago: despesa.pago,
                parcelaAtual: despesa.parcelado ? item.parcelaAtual || 1 : undefined,
                sigla,
                cor,
              }
            : item
        )
      )
      setEditando(null)
    } else {
      const novo: FaturaItem = {
        id: Date.now(),
        nome: nomeFinal,
        pessoa: despesa.pessoa,
        categoria: despesa.categoria,
        valor: despesa.valor,
        sigla,
        cor,
        data: despesa.data,
        cartao: despesa.cartao,
        meio: despesa.meio,
        parcelado: despesa.parcelado,
        parcelaAtual,
        totalParcelas: despesa.parcelado ? total : undefined,
        pago: despesa.pago,
      }
      setDespesasLista((prev) => [novo, ...prev])

      // Gera automaticamente as parcelas nos meses seguintes
      if (despesa.parcelado && total > 1) {
        gerarParcelasFuturas(
          mesAtual,
          {
            nome: despesa.nome,
            valor: despesa.valor,
            pessoa: despesa.pessoa,
            categoria: despesa.categoria,
            cartao: despesa.cartao,
            meio: despesa.meio,
            dataDiaMes: despesa.data,
            cor,
            sigla,
          },
          total,
          1
        )
        setMesesDisponiveis(listarMesesDisponiveis())
      }
    }
  }

  const handleExcluirDespesa = (id: number) => setDespesasLista((prev) => prev.filter((d) => d.id !== id))
  const handleEditarDespesa = (item: FaturaItem) => { setEditando(item); setModalDespesa(true) }
  const handleSalvarReceita = (receita: Omit<Receita, 'id'> & { id?: number }) => {
    if (receita.id) {
      setReceitasLista((prev) =>
        prev.map((r) =>
          r.id === receita.id
            ? { id: r.id, nome: receita.nome, valor: receita.valor, pessoa: receita.pessoa, data: receita.data }
            : r
        )
      )
      setEditandoReceita(null)
    } else {
      setReceitasLista((prev) => [{ ...receita, id: Date.now() }, ...prev])
    }
  }

  const handleEditarReceita = (r: Receita) => {
    setEditandoReceita(r)
    setModalReceita(true)
  }

  const handleExcluirReceita = (id: number) => {
    setReceitasLista((prev) => prev.filter((r) => r.id !== id))
  }

  const nomesRecorrentes = useMemo(
    () => new Set(recorrentes.map((r) => r.nome.toLowerCase().trim())),
    [recorrentes]
  )
  const dispensadosSet = useMemo(() => new Set(dispensadosRecorrente), [dispensadosRecorrente])
  const candidatosRecorrentes = useMemo(
    () => detectarCandidatosRecorrentes(despesasLista, nomesRecorrentes, dispensadosSet),
    [despesasLista, nomesRecorrentes, dispensadosSet]
  )

  const aceitarRecorrente = (c: { nome: string; valor: number; pessoa: string; categoria: string; cartao: string }) => {
    setRecorrentes((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: c.nome,
        valor: c.valor,
        pessoa: c.pessoa,
        categoria: c.categoria,
        cartao: c.cartao,
        diaVencimento: 10,
        ativa: true,
      },
    ])
  }

  const dispensarRecorrente = (nome: string) => {
    const chave = nome.toLowerCase()
    setDispensadosRecorrente((prev) => {
      const next = prev.includes(chave) ? prev : [...prev, chave]
      localStorage.setItem('meucontrole_dispensados_rec', JSON.stringify(next))
      return next
    })
  }

  const handleExportar = () => exportarTudoCSV(despesasLista, receitasLista, mesAtual)

  const pageClass = direcao === 'out' ? 'page-exit' : animando ? 'page-enter' : 'page-enter-active'

  const subtituloMap: Record<Pagina, string> = {
    config: 'Pessoas, cartões e contas',
    dashboard: 'Visão geral do orçamento familiar',
    faturas: 'Extrato detalhado dos cartões por pessoa',
    pessoas: 'Controle individual de gastos',
    recorrentes: 'Assinaturas e lançamentos automáticos',
    objetivos: 'Metas de longo prazo da família',
    historico: 'Comparativo e fechamento de meses',
    sync: 'Sincronizar PC e celular',
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar pagina={pagina} onChangePagina={mudarPagina} aberto={menuAberto} onFechar={() => setMenuAberto(false)} nomeEspaco={config.nomeEspaco} pessoaPrincipal={config.pessoas[0]} />

      <main className="flex-1 overflow-auto">
        <Header
          titulo={formatarMesTitulo(mesAtual)}
          subtitulo={subtituloMap[paginaVisivel]}
          onNovaDespesa={() => { setEditando(null); setModalDespesa(true) }}
          onNovaReceita={() => { setEditandoReceita(null); setModalReceita(true) }}
          onExportar={handleExportar}
          onAbrirMenu={() => setMenuAberto(true)}
          mesAtual={mesAtual}
          mesesDisponiveis={mesesDisponiveis}
          onChangeMes={trocarMes}
          onNovoMes={criarNovoMes}
        />

        <div className={`p-4 sm:p-6 space-y-6 ${pageClass}`}>
          {paginaVisivel === 'dashboard' && (
            <>
              <SummaryCards receitas={totalReceitas} despesas={totalDespesas} saldo={saldo} investido={totalInvestimentos} />
              <ResumoMes
                receitas={totalReceitas}
                despesas={totalDespesas}
                saldo={saldo}
                essenciais={totalEssenciais}
                naoEssenciais={totalNaoEssenciais}
                investimentos={totalInvestimentos}
                limiteEssenciais={Math.round((totalReceitas || 1) * 0.5)}
                limiteNaoEssenciais={Math.round((totalReceitas || 1) * 0.3)}
                limiteInvestimentos={Math.round((totalReceitas || 1) * 0.2)}
              />
              <SugestaoRecorrente
                candidatos={candidatosRecorrentes}
                onAceitar={aceitarRecorrente}
                onDispensar={dispensarRecorrente}
              />
              <ReceitasSection receitas={receitasLista} onExcluir={handleExcluirReceita} onEditar={handleEditarReceita} />
              <BudgetProgress categorias={categoriasBudget} baseReceitas={totalReceitas} />
              <ChartsSection
                despesas={despesasLista}
                totalEssenciais={totalEssenciais}
                totalAlimentacao={totalNaoEssenciais}
                totalInvestimentos={totalInvestimentos}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PeopleSection pessoas={pessoasDinamicas} />
                <TransactionsList lancamentos={despesasLista.slice(0, 6)} />
              </div>
              {alertas.map((a, i) => (
                <AlertBanner key={i} titulo={a.titulo} mensagem={a.mensagem} />
              ))}
            </>
          )}

          {paginaVisivel === 'faturas' && (
            <FaturasPage
              pessoas={config.pessoas}
              origensLista={[...config.origens.credito, ...config.origens.debito, ...config.origens.pix]} lancamentos={despesasLista} onExcluir={handleExcluirDespesa} onEditar={handleEditarDespesa} />
          )}

          {paginaVisivel === 'recorrentes' && (
            <RecorrentesPage
              lista={recorrentes}
              pessoas={config.pessoas}
              origensPorMeio={origensPorMeio}
              onSalvar={(lista) => {
                setRecorrentes(lista)
                // reaplica no mês atual
                const base = carregarDespesas(mesAtual).filter((d) => !d.recorrenteId)
                const atualizadas = aplicarRecorrentesNoMes(mesAtual, base)
                // merge: mantém despesas manuais + novas recorrentes
                const manuais = despesasLista.filter((d) => !d.recorrenteId)
                const idsRec = new Set(lista.filter((r) => r.ativa).map((r) => r.id))
                const recExistentes = despesasLista.filter((d) => d.recorrenteId && idsRec.has(d.recorrenteId))
                const novosRec = atualizadas.filter((d) => d.recorrenteId && !recExistentes.some((e) => e.recorrenteId === d.recorrenteId))
                setDespesasLista([...novosRec, ...recExistentes, ...manuais])
              }}
            />
          )}

          {paginaVisivel === 'objetivos' && (
            <ObjetivosPage lista={objetivos} onSalvar={setObjetivos} saldoDisponivel={saldo} />
          )}

          {paginaVisivel === 'pessoas' && (
            <div className="space-y-6">
              <PeopleSection pessoas={pessoasDinamicas} />
              <ChartsSection
                despesas={despesasLista}
                totalEssenciais={totalEssenciais}
                totalAlimentacao={totalNaoEssenciais}
                totalInvestimentos={totalInvestimentos}
              />
            </div>
          )}

          {paginaVisivel === 'historico' && (
            <HistoricoPage mesAtual={mesAtual} onIrParaMes={trocarMes} />
          )}

          {paginaVisivel === 'config' && (
            <ConfigPage
              config={config}
              onSalvar={(c) => {
                setConfig(c)
                salvarConfig(c)
                if (carregarSyncConfig()) void syncPush('meucontrole_config', c)
              }}
            />
          )}

          {paginaVisivel === 'sync' && (
            <SyncPage onSincronizado={recarregarDoLocal} />
          )}
        </div>
      </main>

      <NovaDespesaModal
        pessoas={config.pessoas}
        origensPorMeio={origensPorMeio}
        aberto={modalDespesa}
        onFechar={() => { setModalDespesa(false); setEditando(null) }}
        onSalvar={handleSalvarDespesa}
        despesaInicial={editando}
      />

      {/* FAB mobile - lançamento rápido */}
      <button
        type="button"
        onClick={() => { setEditando(null); setModalDespesa(true) }}
        className="md:hidden fixed bottom-5 right-5 z-[150] w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center active:scale-95 transition"
        aria-label="Nova despesa"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <NovaReceitaModal
        pessoas={config.pessoas}
        aberto={modalReceita}
        onFechar={() => { setModalReceita(false); setEditandoReceita(null) }}
        onSalvar={handleSalvarReceita}
        receitaInicial={editandoReceita}
      />
    </div>
  )
}

export default App
