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

export interface FaturaItem extends Lancamento {
  data: string
  /** Origem: cartão ou conta (ex: Renner David, Conta Itaú) */
  cartao: string
  /** Meio: credito | debito | pix | dinheiro */
  meio?: MeioPagamento
  parcelado?: boolean
  parcelaAtual?: number
  totalParcelas?: number
  recorrenteId?: number
  /** false = pendente (ainda não paga); default true */
  pago?: boolean
}

export const MEIOS_PAGAMENTO: { id: MeioPagamento; label: string }[] = [
  { id: 'credito', label: 'Cartão de crédito' },
  { id: 'debito', label: 'Cartão de débito' },
  { id: 'pix', label: 'Pix' },
  { id: 'dinheiro', label: 'Dinheiro' },
]

/** Origens disponíveis por meio de pagamento */
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


export interface Receita {
  id: number
  nome: string
  valor: number
  pessoa: string
  data: string
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
  /** Nome do espaço (ex: Família Silva) */
  nomeEspaco: string
  /** Pessoas do orçamento */
  pessoas: string[]
  /** Origens por meio de pagamento */
  origens: {
    credito: string[]
    debito: string[]
    pix: string[]
  }
}

export const CONFIG_PADRAO: AppConfig = {
  nomeEspaco: 'Finanças da família',
  pessoas: ['David', 'Kamille'],
  origens: {
    credito: ['Renner', 'Itaú'],
    debito: ['Conta Itaú'],
    pix: ['Conta Itaú'],
  },
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
