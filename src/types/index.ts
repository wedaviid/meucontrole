export interface CategoriaBudget {
  nome: string
  percentual: number
  gasto: number
  limite: number
  cor: string
  texto: string
}

export interface Pessoa {
  iniciais: string
  nome: string
  detalhe: string
  total: number
  fatura: number
  fixos: number
  cor: string
}

export interface Lancamento {
  id: number
  nome: string
  pessoa: string
  categoria: string
  valor: number
  sigla: string
  cor: string
}

export type MeioPagamento = 'credito' | 'debito' | 'pix' | 'dinheiro'

/** Conta ou cartão cadastrado (modelo A) */
export interface ContaItem {
  id: string
  /** Nome exibido (ex: Itaú David, Renner) */
  nome: string
  /** credito = cartão; conta = corrente/pix/débito */
  tipo: 'credito' | 'conta'
  /** Pessoa dona (opcional) */
  pessoa?: string
  /** Se entra no saldo geral */
  incluirSaldo: boolean
}

export interface FaturaItem extends Lancamento {
  data: string
  /** Origem: cartão ou conta */
  cartao: string
  meio?: MeioPagamento
  parcelado?: boolean
  parcelaAtual?: number
  totalParcelas?: number
  recorrenteId?: number
  pago?: boolean
  observacao?: string
}

export const MEIOS_PAGAMENTO: { id: MeioPagamento; label: string }[] = [
  { id: 'credito', label: 'Cartão de crédito' },
  { id: 'debito', label: 'Cartão de débito' },
  { id: 'pix', label: 'Pix' },
  { id: 'dinheiro', label: 'Dinheiro' },
]

export const ORIGENS_POR_MEIO: Record<MeioPagamento, string[]> = {
  credito: ['Renner', 'Itaú'],
  debito: ['Conta Itaú'],
  pix: ['Conta Itaú'],
  dinheiro: [],
}

export const LABEL_MEIO: Record<MeioPagamento, string> = {
  credito: 'Crédito',
  debito: 'Débito',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
}

export const CATEGORIAS_RECEITA = [
  'Salário',
  'Freelance',
  'Extra',
  'Rendimento',
  'Empréstimo',
  'Outros',
] as const

export type CategoriaReceita = (typeof CATEGORIAS_RECEITA)[number]

export interface Receita {
  id: number
  nome: string
  valor: number
  pessoa: string
  data: string
  categoria?: string
  /** Conta de destino */
  conta?: string
  observacao?: string
  /** Se true, repete nos próximos meses */
  recorrente?: boolean
}

export interface Recorrente {
  id: number
  nome: string
  valor: number
  pessoa: string
  categoria: string
  cartao: string
  meio?: MeioPagamento
  diaVencimento: number
  ativa: boolean
  /** despesa (padrão) ou receita */
  tipo?: 'despesa' | 'receita'
  conta?: string
  observacao?: string
}

export interface Objetivo {
  id: number
  nome: string
  valorMeta: number
  valorAtual: number
  dataLimite?: string
  cor: string
}

export interface MetaMensal {
  metaEconomia: number
  alertaEssenciais: number
  alertaAlimentacao: number
  alertaGeral: number
}

export interface AppConfig {
  nomeEspaco: string
  pessoas: string[]
  /** Legado — ainda usado; preferir contas */
  origens: {
    credito: string[]
    debito: string[]
    pix: string[]
  }
  /** Cadastro unificado de contas e cartões */
  contas: ContaItem[]
}

export const CONTAS_PADRAO: ContaItem[] = [
  { id: 'c1', nome: 'Renner', tipo: 'credito', incluirSaldo: false },
  { id: 'c2', nome: 'Itaú', tipo: 'credito', incluirSaldo: false },
  { id: 'c3', nome: 'Conta Itaú', tipo: 'conta', incluirSaldo: true },
]

export const CONFIG_PADRAO: AppConfig = {
  nomeEspaco: 'Finanças da família',
  pessoas: ['David', 'Kamille'],
  origens: {
    credito: ['Renner', 'Itaú'],
    debito: ['Conta Itaú'],
    pix: ['Conta Itaú'],
  },
  contas: CONTAS_PADRAO,
}

/** Deriva listas de origem a partir das contas cadastradas */
export function origensDeContas(contas: ContaItem[]): AppConfig['origens'] {
  const credito = contas.filter((c) => c.tipo === 'credito').map((c) => c.nome)
  const contasNomes = contas.filter((c) => c.tipo === 'conta').map((c) => c.nome)
  return {
    credito: credito.length ? credito : [...CONFIG_PADRAO.origens.credito],
    debito: contasNomes.length ? contasNomes : [...CONFIG_PADRAO.origens.debito],
    pix: contasNomes.length ? contasNomes : [...CONFIG_PADRAO.origens.pix],
  }
}

export function contasDeOrigens(origens: AppConfig['origens']): ContaItem[] {
  const lista: ContaItem[] = []
  let i = 0
  for (const n of origens.credito || []) {
    lista.push({ id: `cred-${i++}`, nome: n, tipo: 'credito', incluirSaldo: false })
  }
  const vistas = new Set<string>()
  for (const n of [...(origens.debito || []), ...(origens.pix || [])]) {
    if (vistas.has(n)) continue
    vistas.add(n)
    lista.push({ id: `conta-${i++}`, nome: n, tipo: 'conta', incluirSaldo: true })
  }
  return lista.length ? lista : [...CONTAS_PADRAO]
}

export type Pagina = 'dashboard' | 'pessoas' | 'faturas' | 'recorrentes' | 'objetivos' | 'historico' | 'sync' | 'config'

export const CATEGORIAS = [
  'Alimentação',
  'Assinatura',
  'Parcelamento',
  'Compras',
  'Cuidados Pessoais',
  'Estudos',
  'Pet',
  'Vestuário',
  'Essenciais',
  'Saúde',
  'Investimentos',
  'Outros',
] as const

export const CORES_CATEGORIA: Record<string, string> = {
  Alimentação: 'bg-rose-500/10 text-rose-400',
  Assinatura: 'bg-violet-500/10 text-violet-400',
  Parcelamento: 'bg-amber-500/10 text-amber-400',
  Compras: 'bg-emerald-500/10 text-emerald-400',
  'Cuidados Pessoais': 'bg-sky-500/10 text-sky-400',
  Estudos: 'bg-indigo-500/10 text-indigo-400',
  Pet: 'bg-lime-500/10 text-lime-400',
  Vestuário: 'bg-orange-500/10 text-orange-400',
  Essenciais: 'bg-emerald-500/10 text-emerald-400',
  Saúde: 'bg-sky-500/10 text-sky-400',
  Investimentos: 'bg-sky-500/10 text-sky-400',
  Outros: 'bg-slate-500/10 text-slate-400',
  Salário: 'bg-emerald-500/10 text-emerald-400',
  Freelance: 'bg-sky-500/10 text-sky-400',
  Extra: 'bg-amber-500/10 text-amber-400',
  Rendimento: 'bg-indigo-500/10 text-indigo-400',
  Empréstimo: 'bg-orange-500/10 text-orange-400',
}

export const GRADIENTES_CATEGORIA: Record<string, string> = {
  Alimentação: 'from-rose-500 to-rose-400',
  Assinatura: 'from-violet-500 to-violet-400',
  Parcelamento: 'from-amber-500 to-amber-400',
  Compras: 'from-emerald-500 to-emerald-400',
  'Cuidados Pessoais': 'from-sky-500 to-sky-400',
  Estudos: 'from-indigo-500 to-indigo-400',
  Pet: 'from-lime-500 to-lime-400',
  Vestuário: 'from-orange-500 to-orange-400',
  Essenciais: 'from-emerald-500 to-emerald-400',
  Saúde: 'from-sky-500 to-sky-400',
  Investimentos: 'from-sky-500 to-indigo-500',
  Outros: 'from-slate-500 to-slate-400',
}

export const CORES_OBJETIVO = [
  'from-sky-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
]
