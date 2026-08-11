import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { Pagina, FaturaItem, Receita, Recorrente, Objetivo, MetaMensal, AppConfig, MeioPagamento } from './types'
import { percentuaisDoMetodo, nomesEssenciais, nomesInvestimentos, categoriasDespesaAtivas, categoriasReceitaAtivas } from './types'
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
  excluirParcelamento,
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
import { ExcluirDespesaModal } from './components/ExcluirDespesaModal'
import { SugestaoRecorrente, detectarCandidatosRecorrentes } from './components/SugestaoRecorrente'


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

  const modalAbertoRef = useRef(false)
  const [excluindoDespesa, setExcluindoDespesa] = useState<FaturaItem | null>(null)
  const [modalDespesa, setModalDespesa] = useState(false)
  const [modalReceita, setModalReceita] = useState(false)

  // Atualiza a cada render (ref não causa re-render)
  modalAbertoRef.current = modalDespesa || modalReceita || !!excluindoDespesa
  const [menuFab, setMenuFab] = useState(false)
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
      // Não puxar nuvem se há modal aberto — evita zerar formulário no Alt+Tab
      if (document.visibilityState === 'visible' && carregarSyncConfig() && !modalAbertoRef.current) {
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
    let receitas = carregarReceitas(novoMes)
    // Aplica receitas recorrentes ativas se o mês ainda não tiver
    const recReceitas = carregarRecorrentes().filter((r) => r.ativa && r.tipo === 'receita')
    for (const rr of recReceitas) {
      const jaTem = receitas.some(
        (r) => r.nome.toLowerCase() === rr.nome.toLowerCase() && r.pessoa === rr.pessoa,
      )
      if (!jaTem) {
        receitas = [
          {
            id: Date.now() + rr.id,
            nome: rr.nome,
            valor: rr.valor,
            pessoa: rr.pessoa,
            data: `${String(Math.min(rr.diaVencimento, 28)).padStart(2, '0')}/${novoMes.split('-')[1]}`,
            categoria: rr.categoria,
            conta: rr.conta || rr.cartao,
            recorrente: true,
          },
          ...receitas,
        ]
      }
    }
    setReceitasLista(receitas)
    salvarReceitas(receitas, novoMes)
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
  const totalReceitas = useMemo(
    () => receitasLista.filter((r) => r.recebido !== false).reduce((a, r) => a + r.valor, 0),
    [receitasLista],
  )
  const totalDespesas = useMemo(() => despesasLista.filter((d) => d.pago !== false).reduce((a, d) => a + d.valor, 0), [despesasLista])
  const saldo = totalReceitas - totalDespesas

  const totalEssenciais = useMemo(() => {
    const ess = nomesEssenciais(config)
    return despesasLista.filter((d) => d.pago !== false && ess.includes(d.categoria)).reduce((a, d) => a + d.valor, 0)
  }, [despesasLista, config])
  const totalInvestimentos = useMemo(() => {
    const inv = nomesInvestimentos(config)
    return despesasLista.filter((d) => d.pago !== false && inv.includes(d.categoria)).reduce((a, d) => a + d.valor, 0)
  }, [despesasLista, config])
  // 30% = tudo que não é essencial nem investimento
  const totalNaoEssenciais = useMemo(
    () => Math.max(0, totalDespesas - totalEssenciais - totalInvestimentos),
    [totalDespesas, totalEssenciais, totalInvestimentos]
  )

  const pctOrc = useMemo(() => percentuaisDoMetodo(config), [config])

  const tituloOrcamento = useMemo(() => {
    const m = config.metodoOrcamento || '50-30-20'
    if (m === '80-20') return 'Regra 80/20'
    if (m === '60-20-20') return 'Regra 60/20/20'
    if (m === 'personalizado') {
      return `Personalizado ${pctOrc.essenciais}/${pctOrc.naoEssenciais}/${pctOrc.investimentos}`
    }
    return 'Regra 50/30/20'
  }, [config.metodoOrcamento, pctOrc])

  const categoriasBudget = useMemo(() => {
    const base = totalReceitas || 1
    const metodo = config.metodoOrcamento || '50-30-20'
    // 80/20: junta essenciais+não essenciais como "Gastos"
    if (metodo === '80-20') {
      return [
        {
          nome: 'Gastos',
          percentual: 80,
          gasto: totalEssenciais + totalNaoEssenciais,
          limite: Math.round(base * 0.8),
          cor: 'from-rose-500 to-amber-400',
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
    }
    return [
      {
        nome: 'Essenciais',
        percentual: pctOrc.essenciais,
        gasto: totalEssenciais,
        limite: Math.round(base * (pctOrc.essenciais / 100)),
        cor: 'from-emerald-500 to-emerald-400',
        texto: 'text-emerald-400',
      },
      {
        nome: 'Não Essenciais',
        percentual: pctOrc.naoEssenciais,
        gasto: totalNaoEssenciais,
        limite: Math.round(base * (pctOrc.naoEssenciais / 100)),
        cor: 'from-rose-500 to-rose-400',
        texto: 'text-rose-400',
      },
      {
        nome: 'Investimentos',
        percentual: pctOrc.investimentos,
        gasto: totalInvestimentos,
        limite: Math.round(base * (pctOrc.investimentos / 100)),
        cor: 'from-sky-500 to-indigo-500',
        texto: 'text-sky-400',
      },
    ]
  }, [totalReceitas, totalEssenciais, totalNaoEssenciais, totalInvestimentos, pctOrc, config.metodoOrcamento])

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

  const origensPorMeio = useMemo((): Record<MeioPagamento, string[]> => {
    const contas = config.contas || []
    if (contas.length) {
      const credito = contas.filter((c) => c.tipo === 'credito').map((c) => c.nome)
      const nomesConta = contas.filter((c) => c.tipo === 'conta').map((c) => c.nome)
      return {
        credito: credito.length ? credito : config.origens.credito,
        debito: nomesConta.length ? nomesConta : config.origens.debito,
        pix: nomesConta.length ? nomesConta : config.origens.pix,
        boleto: nomesConta.length ? nomesConta : config.origens.pix,
        dinheiro: [],
      }
    }
    return {
      credito: config.origens.credito,
      debito: config.origens.debito,
      pix: config.origens.pix,
      boleto: config.origens.pix,
      dinheiro: [],
    }
  }, [config.contas, config.origens])

  const atalhoSalario = useMemo(() => {
    const s = receitasLista.find(
      (r) =>
        (r.categoria || '').toLowerCase().includes('sal') ||
        r.nome.toLowerCase().includes('salário') ||
        r.nome.toLowerCase().includes('salario')
    )
    return s?.valor || 0
  }, [receitasLista])

  // Alertas inteligentes (respeitam o método escolhido)
  const alertas = useMemo(() => {
    const lista: { titulo: string; mensagem: string }[] = []
    const base = totalReceitas || 1
    const limNao = base * (pctOrc.naoEssenciais / 100)
    const limEss = base * (pctOrc.essenciais / 100)
    const metodo = config.metodoOrcamento || '50-30-20'

    if (metodo !== '80-20' && pctOrc.naoEssenciais > 0 && totalNaoEssenciais > limNao * (metas.alertaAlimentacao / 100)) {
      lista.push({
        titulo: 'Não Essenciais acima do limite',
        mensagem: `Você já gastou R$ ${totalNaoEssenciais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (limite ${pctOrc.naoEssenciais}%: R$ ${limNao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
      })
    }
    if (metodo === '80-20') {
      const gastos = totalEssenciais + totalNaoEssenciais
      if (gastos > base * 0.8 * (metas.alertaGeral / 100)) {
        lista.push({
          titulo: 'Gastos acima de 80%',
          mensagem: `No método 80/20, os gastos gerais já estão em ${((gastos / base) * 100).toFixed(0)}% da receita.`,
        })
      }
    } else if (totalEssenciais > limEss * (metas.alertaEssenciais / 100)) {
      lista.push({
        titulo: 'Essenciais próximos do limite',
        mensagem: `Gastos essenciais altos em relação aos ${pctOrc.essenciais}% da regra.`,
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
  }, [totalNaoEssenciais, totalEssenciais, totalDespesas, totalReceitas, saldo, metas, pctOrc, config.metodoOrcamento])

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
      let recorrenteId: number | undefined
      if (despesa.despesaFixa) {
        const dia = despesa.diaVencimento || parseInt(despesa.data.split('/')[0], 10) || 10
        const existe = recorrentes.find(
          (r) =>
            (r.tipo === 'despesa' || !r.tipo) &&
            r.nome.toLowerCase() === despesa.nome.toLowerCase() &&
            r.pessoa === despesa.pessoa,
        )
        recorrenteId = existe?.id ?? Date.now() + 1
        setRecorrentes((prev) => {
          const ja = prev.find((r) => r.id === recorrenteId)
          if (ja) {
            return prev.map((r) =>
              r.id === recorrenteId
                ? {
                    ...r,
                    valor: despesa.valor,
                    categoria: despesa.categoria,
                    cartao: despesa.cartao,
                    meio: despesa.meio,
                    diaVencimento: dia,
                    ativa: true,
                    tipo: 'despesa' as const,
                  }
                : r,
            )
          }
          return [
            {
              id: recorrenteId!,
              nome: despesa.nome,
              valor: despesa.valor,
              pessoa: despesa.pessoa,
              categoria: despesa.categoria,
              cartao: despesa.cartao,
              meio: despesa.meio,
              diaVencimento: dia,
              ativa: true,
              tipo: 'despesa' as const,
            },
            ...prev,
          ]
        })
      }

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
        recorrenteId,
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

  const handlePedirExcluirDespesa = (item: FaturaItem) => setExcluindoDespesa(item)
  const handleConfirmarExcluirDespesa = (modo: 'somente' | 'futuras' | 'todas') => {
    if (!excluindoDespesa) return
    setDespesasLista((prev) => excluirParcelamento(mesAtual, excluindoDespesa, modo, prev))
    setExcluindoDespesa(null)
  }

  const handleEditarDespesa = (item: FaturaItem) => { setEditando(item); setModalDespesa(true) }
  const handleSalvarReceita = (receita: Omit<Receita, 'id'> & { id?: number }) => {
    const full: Receita = {
      id: receita.id || Date.now(),
      nome: receita.nome,
      valor: receita.valor,
      pessoa: receita.pessoa,
      data: receita.data,
      categoria: receita.categoria,
      conta: receita.conta,
      observacao: receita.observacao,
      recorrente: receita.recorrente,
      recebido: receita.recebido !== false,
    }
    if (receita.id) {
      setReceitasLista((prev) => prev.map((r) => (r.id === receita.id ? full : r)))
      setEditandoReceita(null)
    } else {
      setReceitasLista((prev) => [full, ...prev])
    }
    // Receita marcada como recorrente vira template mensal
    if (full.recorrente) {
      setRecorrentes((prev) => {
        const existe = prev.find(
          (r) => r.tipo === 'receita' && r.nome.toLowerCase() === full.nome.toLowerCase()
        )
        if (existe) {
          return prev.map((r) =>
            r.id === existe.id
              ? {
                  ...r,
                  valor: full.valor,
                  pessoa: full.pessoa,
                  categoria: full.categoria || 'Salário',
                  cartao: full.conta || r.cartao,
                  conta: full.conta,
                  ativa: true,
                  tipo: 'receita',
                }
              : r
          )
        }
        return [
          ...prev,
          {
            id: Date.now() + 1,
            nome: full.nome,
            valor: full.valor,
            pessoa: full.pessoa,
            categoria: full.categoria || 'Salário',
            cartao: full.conta || '',
            conta: full.conta,
            diaVencimento: 1,
            ativa: true,
            tipo: 'receita' as const,
          },
        ]
      })
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
    config: 'Pessoas, contas e cartões',
    dashboard: 'Visão geral do orçamento familiar',
    faturas: 'Todas as despesas do mês',
    receitas: 'Todas as receitas do mês',
    pessoas: 'Controle individual de gastos',
    recorrentes: 'Despesas e receitas que se repetem todo mês',
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

        <div className={`p-4 sm:p-6 space-y-6 pb-24 md:pb-6 ${pageClass}`}>
          {paginaVisivel === 'dashboard' && (
            <>
              {/* Alerta único, discreto no topo */}
              {alertas[0] && (
                <AlertBanner titulo={alertas[0].titulo} mensagem={alertas[0].mensagem} />
              )}
              {candidatosRecorrentes[0] && (
                <SugestaoRecorrente
                  candidatos={candidatosRecorrentes.slice(0, 1)}
                  onAceitar={aceitarRecorrente}
                  onDispensar={dispensarRecorrente}
                />
              )}

              {/* Linha 1: resumo */}
              <SummaryCards
                receitas={totalReceitas}
                despesas={totalDespesas}
                saldo={saldo}
                investido={totalInvestimentos}
                pctInvestimentos={pctOrc.investimentos}
                onClickReceitas={() => mudarPagina('receitas')}
                onClickDespesas={() => mudarPagina('faturas')}
              />

              {/* Linha 2: inteligência + 50/30/20 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <ResumoMes
                  receitas={totalReceitas}
                  despesas={totalDespesas}
                  saldo={saldo}
                  essenciais={totalEssenciais}
                  naoEssenciais={totalNaoEssenciais}
                  investimentos={totalInvestimentos}
                  limiteEssenciais={Math.round((totalReceitas || 1) * (pctOrc.essenciais / 100))}
                  limiteNaoEssenciais={Math.round((totalReceitas || 1) * (pctOrc.naoEssenciais / 100))}
                  limiteInvestimentos={Math.round((totalReceitas || 1) * (pctOrc.investimentos / 100))}
                  pctEssenciais={pctOrc.essenciais}
                  pctNaoEssenciais={pctOrc.naoEssenciais}
                  pctInvestimentos={pctOrc.investimentos}
                  metodoOrcamento={config.metodoOrcamento || '50-30-20'}
                />
                <BudgetProgress categorias={categoriasBudget} baseReceitas={totalReceitas} titulo={tituloOrcamento} />
              </div>

              {/* Linha 3: pessoas + últimos lançamentos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <PeopleSection pessoas={pessoasDinamicas} />
                <TransactionsList
                  lancamentos={despesasLista.slice(0, 5)}
                  onVerTodas={() => mudarPagina('faturas')}
                  onEditar={handleEditarDespesa}
                />
              </div>

              {/* Linha 4: receitas (compacto) + gráfico */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                <ReceitasSection receitas={receitasLista} onExcluir={handleExcluirReceita} onEditar={handleEditarReceita} />
                <ChartsSection
                  variant="donut"
                  despesas={despesasLista}
                  totalEssenciais={totalEssenciais}
                  totalAlimentacao={totalNaoEssenciais}
                  totalInvestimentos={totalInvestimentos}
                />
              </div>
            </>
          )}

          {paginaVisivel === 'faturas' && (
            <FaturasPage
              pessoas={config.pessoas}
              origensLista={[...config.origens.credito, ...config.origens.debito, ...config.origens.pix]} lancamentos={despesasLista} onExcluir={handlePedirExcluirDespesa} onEditar={handleEditarDespesa} />
          )}

          {paginaVisivel === 'receitas' && (
            <ReceitasSection
              receitas={receitasLista}
              onExcluir={handleExcluirReceita}
              onEditar={handleEditarReceita}
            />
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

      <ExcluirDespesaModal
        aberto={!!excluindoDespesa}
        item={excluindoDespesa}
        onFechar={() => setExcluindoDespesa(null)}
        onConfirmar={handleConfirmarExcluirDespesa}
      />

      <NovaDespesaModal
        pessoas={config.pessoas}
        origensPorMeio={origensPorMeio}
        categorias={categoriasDespesaAtivas(config).map((c) => c.nome)}
        aberto={modalDespesa}
        onFechar={() => { setModalDespesa(false); setEditando(null) }}
        onSalvar={handleSalvarDespesa}
        despesaInicial={editando}
      />

      {/* FAB mobile: despesa ou receita */}
      {menuFab && (
        <div className="md:hidden fixed inset-0 z-[160]" onClick={() => setMenuFab(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-5 flex flex-col gap-2 items-end"
            style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              onClick={() => {
                setMenuFab(false)
                setEditandoReceita(null)
                setModalReceita(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium shadow-lg"
            >
              + Receita
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuFab(false)
                setEditando(null)
                setModalDespesa(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium shadow-lg"
            >
              + Despesa
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMenuFab((v) => !v)}
        className="md:hidden fixed right-5 z-[150] w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center active:scale-95 transition"
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Novo lançamento"
      >
        <svg className={`w-7 h-7 transition ${menuFab ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <NovaReceitaModal
        pessoas={config.pessoas}
        categorias={categoriasReceitaAtivas(config).map((c) => c.nome)}
        contas={config.contas || []}
        atalhoSalario={atalhoSalario}
        aberto={modalReceita}
        onFechar={() => { setModalReceita(false); setEditandoReceita(null) }}
        onSalvar={handleSalvarReceita}
        receitaInicial={editandoReceita}
      />
    </div>
  )
}

export default App
