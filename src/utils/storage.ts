import type { FaturaItem, Receita, Recorrente, Objetivo, MetaMensal } from '../types'
import { faturaItens as mockDespesas } from '../data/mock'
import { CORES_CATEGORIA } from '../types'

const KEY_DESPESAS = 'meucontrole_despesas'
const KEY_RECEITAS = 'meucontrole_receitas'
const KEY_MES_ATUAL = 'meucontrole_mes_atual'
const KEY_RECORRENTES = 'meucontrole_recorrentes'
const KEY_OBJETIVOS = 'meucontrole_objetivos'
const KEY_METAS = 'meucontrole_metas'
const KEY_MESES_FECHADOS = 'meucontrole_meses_fechados'

const receitasIniciais: Receita[] = [
  { id: 1, nome: 'Salário David', valor: 2300, pessoa: 'David', data: '01/07' },
  { id: 2, nome: 'Salário Kamille', valor: 2900, pessoa: 'Kamille', data: '01/07' },
  { id: 3, nome: 'Lavagem Car', valor: 441, pessoa: 'Conjunto', data: '05/07' },
]

const metasIniciais: MetaMensal = {
  metaEconomia: 500,
  alertaEssenciais: 90,
  alertaAlimentacao: 90,
  alertaGeral: 95,
}

function mesKey(mes: string) {
  return mes
}

/** Extrai YYYY-MM de qualquer lixo de aspas/escapes. */
export function normalizarMes(valor: unknown): string | null {
  if (valor == null) return null
  const s = String(valor)
  const match = s.match(/(\d{4})-(\d{2})/)
  if (!match) return null
  const ano = parseInt(match[1], 10)
  const mes = parseInt(match[2], 10)
  if (ano < 2020 || ano > 2100 || mes < 1 || mes > 12) return null
  return `${match[1]}-${match[2]}`
}

/**
 * Remove do localStorage chaves de mês corrompidas
 * (ex: meucontrole_despesas_"2026-09" ou com barras).
 */
export function limparMesesCorrompidos(): void {
  try {
    const paraApagar: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (key === KEY_MES_ATUAL) {
        const n = normalizarMes(localStorage.getItem(key))
        if (!n) paraApagar.push(key)
        else if (localStorage.getItem(key) !== n) localStorage.setItem(key, n)
        continue
      }
      for (const prefix of [KEY_DESPESAS + '_', KEY_RECEITAS + '_']) {
        if (!key.startsWith(prefix)) continue
        const bruto = key.slice(prefix.length)
        // chave válida = exatamente YYYY-MM
        if (!/^\d{4}-\d{2}$/.test(bruto)) {
          paraApagar.push(key)
        }
      }
    }
    for (const k of paraApagar) localStorage.removeItem(k)
  } catch {}
}

export function getMesAtual(): string {
  limparMesesCorrompidos()
  try {
    const saved = localStorage.getItem(KEY_MES_ATUAL)
    const n = normalizarMes(saved)
    if (n) {
      if (saved !== n) localStorage.setItem(KEY_MES_ATUAL, n)
      return n
    }
  } catch {}
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
}

export function setMesAtual(mes: string): void {
  const n = normalizarMes(mes)
  if (n) localStorage.setItem(KEY_MES_ATUAL, n)
}

export function listarMesesDisponiveis(): string[] {
  limparMesesCorrompidos()
  const meses = new Set<string>()
  meses.add(getMesAtual())
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      for (const prefix of [KEY_DESPESAS + '_', KEY_RECEITAS + '_']) {
        if (!key.startsWith(prefix)) continue
        const bruto = key.slice(prefix.length)
        if (/^\d{4}-\d{2}$/.test(bruto)) meses.add(bruto)
      }
    }
  } catch {}
  const agora = new Date()
  meses.add(`${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`)
  return Array.from(meses).sort().reverse()
}


function normalizarDespesa(d: FaturaItem): FaturaItem {
  const cartao = d.cartao === 'Principal' ? 'Renner' : d.cartao
  let meio = d.meio
  if (!meio) {
    if (cartao === 'Dinheiro') meio = 'dinheiro'
    else if (String(cartao).startsWith('Conta')) meio = 'pix'
    else meio = 'credito'
  }
  return { ...d, cartao, meio }
}

export function carregarDespesas(mes?: string): FaturaItem[] {
  const m = mes || getMesAtual()
  try {
    const raw = localStorage.getItem(`${KEY_DESPESAS}_${mesKey(m)}`)
    if (!raw) {
      if (m === '2026-07') return mockDespesas.map(normalizarDespesa)
      return []
    }
    const parsed = JSON.parse(raw) as FaturaItem[]
    return Array.isArray(parsed) ? parsed.map(normalizarDespesa) : []
  } catch {
    return m === '2026-07' ? mockDespesas.map(normalizarDespesa) : []
  }
}

export function salvarDespesas(despesas: FaturaItem[], mes?: string): void {
  const m = mes || getMesAtual()
  try {
    localStorage.setItem(`${KEY_DESPESAS}_${mesKey(m)}`, JSON.stringify(despesas))
  } catch (err) {
    console.error('Erro ao salvar despesas:', err)
  }
}

export function carregarReceitas(mes?: string): Receita[] {
  const m = mes || getMesAtual()
  try {
    const raw = localStorage.getItem(`${KEY_RECEITAS}_${mesKey(m)}`)
    if (!raw) {
      if (m === '2026-07') return receitasIniciais
      return []
    }
    const parsed = JSON.parse(raw) as Receita[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return m === '2026-07' ? receitasIniciais : []
  }
}

export function salvarReceitas(receitas: Receita[], mes?: string): void {
  const m = mes || getMesAtual()
  try {
    localStorage.setItem(`${KEY_RECEITAS}_${mesKey(m)}`, JSON.stringify(receitas))
  } catch (err) {
    console.error('Erro ao salvar receitas:', err)
  }
}

// ===== Recorrentes =====
export function carregarRecorrentes(): Recorrente[] {
  try {
    const raw = localStorage.getItem(KEY_RECORRENTES)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Recorrente[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function salvarRecorrentes(lista: Recorrente[]): void {
  try {
    localStorage.setItem(KEY_RECORRENTES, JSON.stringify(lista))
  } catch (err) {
    console.error('Erro ao salvar recorrentes:', err)
  }
}

/** Gera despesas do mês a partir dos recorrentes ativos (se ainda não existirem) */
export function aplicarRecorrentesNoMes(mes: string, despesasAtuais: FaturaItem[]): FaturaItem[] {
  const recorrentes = carregarRecorrentes().filter((r) => r.ativa)
  if (recorrentes.length === 0) return despesasAtuais

  const [, mesNum] = mes.split('-')
  const jaGerados = new Set(
    despesasAtuais.filter((d) => d.recorrenteId).map((d) => d.recorrenteId)
  )

  const novos: FaturaItem[] = []
  for (const r of recorrentes) {
    if (jaGerados.has(r.id)) continue
    const dia = String(Math.min(r.diaVencimento, 28)).padStart(2, '0')
    novos.push({
      id: Date.now() + r.id,
      nome: r.nome,
      pessoa: r.pessoa,
      categoria: r.categoria,
      valor: r.valor,
      sigla: r.nome.slice(0, 3).toUpperCase(),
      cor: CORES_CATEGORIA[r.categoria] || 'bg-slate-500/10 text-slate-400',
      data: `${dia}/${mesNum}`,
      cartao: r.cartao === 'Principal' ? 'Renner' : r.cartao,
      meio: r.meio || (r.cartao === 'Dinheiro' ? 'dinheiro' : String(r.cartao).startsWith('Conta') ? 'pix' : 'credito'),
      pago: true,
      recorrenteId: r.id,
    })
  }
  return novos.length > 0 ? [...novos, ...despesasAtuais] : despesasAtuais
}

// ===== Objetivos =====
export function carregarObjetivos(): Objetivo[] {
  try {
    const raw = localStorage.getItem(KEY_OBJETIVOS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Objetivo[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function salvarObjetivos(lista: Objetivo[]): void {
  try {
    localStorage.setItem(KEY_OBJETIVOS, JSON.stringify(lista))
  } catch (err) {
    console.error('Erro ao salvar objetivos:', err)
  }
}

// ===== Metas / Alertas =====
export function carregarMetas(): MetaMensal {
  try {
    const raw = localStorage.getItem(KEY_METAS)
    if (!raw) return metasIniciais
    return { ...metasIniciais, ...JSON.parse(raw) }
  } catch {
    return metasIniciais
  }
}

export function salvarMetas(metas: MetaMensal): void {
  try {
    localStorage.setItem(KEY_METAS, JSON.stringify(metas))
  } catch (err) {
    console.error('Erro ao salvar metas:', err)
  }
}

// ===== Meses fechados =====
export function carregarMesesFechados(): string[] {
  try {
    const raw = localStorage.getItem(KEY_MESES_FECHADOS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function fecharMes(mes: string): void {
  const lista = carregarMesesFechados()
  if (!lista.includes(mes)) {
    lista.push(mes)
    localStorage.setItem(KEY_MESES_FECHADOS, JSON.stringify(lista))
  }
}

export function reabrirMes(mes: string): void {
  const lista = carregarMesesFechados().filter((m) => m !== mes)
  localStorage.setItem(KEY_MESES_FECHADOS, JSON.stringify(lista))
}

export function isMesFechado(mes: string): boolean {
  return carregarMesesFechados().includes(mes)
}

/** Resumo de um mês para histórico */

/** Soma N meses a uma chave YYYY-MM */
export function somarMeses(mes: string, n: number): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Gera as parcelas futuras (2/N ... N/N) nos meses seguintes.
 * A parcela atual (1/N ou a informada) já deve ter sido salva no mês atual pelo caller.
 */
export function gerarParcelasFuturas(
  mesInicio: string,
  base: {
    nome: string
    valor: number
    pessoa: string
    categoria: string
    cartao: string
    meio?: 'credito' | 'debito' | 'pix' | 'dinheiro'
    dataDiaMes: string
    cor: string
    sigla: string
  },
  totalParcelas: number,
  parcelaInicial = 1
): void {
  if (!totalParcelas || totalParcelas <= 1) return
  const baseId = Date.now()

  for (let i = 1; parcelaInicial + i <= totalParcelas; i++) {
    const parcelaNum = parcelaInicial + i
    const mesAlvo = somarMeses(mesInicio, i)
    const despesas = carregarDespesas(mesAlvo)
    const nomeParcela = `${base.nome} ${parcelaNum}/${totalParcelas}`

    if (despesas.some((d) => d.nome === nomeParcela && d.parcelado)) continue

    const nova: FaturaItem = {
      id: baseId + parcelaNum,
      nome: nomeParcela,
      pessoa: base.pessoa,
      categoria: base.categoria,
      valor: base.valor,
      sigla: base.sigla,
      cor: base.cor,
      data: base.dataDiaMes,
      cartao: base.cartao,
      meio: base.meio || 'credito',
      pago: true,
      parcelado: true,
      parcelaAtual: parcelaNum,
      totalParcelas,
    }
    salvarDespesas([nova, ...despesas], mesAlvo)
  }
}

export function resumoMes(mes: string) {
  const despesas = carregarDespesas(mes)
  const receitas = carregarReceitas(mes)
  const totalReceitas = receitas.reduce((a, r) => a + r.valor, 0)
  const totalDespesas = despesas.filter((d) => d.pago !== false).reduce((a, d) => a + d.valor, 0)
  return {
    mes,
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    qtdDespesas: despesas.length,
    fechado: isMesFechado(mes),
  }
}
