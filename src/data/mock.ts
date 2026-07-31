import type { CategoriaBudget, Pessoa, Lancamento, FaturaItem } from '../types'

export const RECEITAS = 5641
export const DESPESAS = 6082
export const SALDO = RECEITAS - DESPESAS

export const categorias50_30_20: CategoriaBudget[] = [
  {
    nome: 'Essenciais',
    percentual: 50,
    gasto: 2367,
    limite: 2820,
    cor: 'from-emerald-500 to-emerald-400',
    texto: 'text-emerald-400',
  },
  {
    nome: 'Não Essenciais',
    percentual: 30,
    gasto: 3274,
    limite: 1692,
    cor: 'from-rose-500 to-rose-400',
    texto: 'text-rose-400',
  },
  {
    nome: 'Investimentos',
    percentual: 20,
    gasto: 0,
    limite: 1128,
    cor: 'from-sky-500 to-indigo-500',
    texto: 'text-sky-400',
  },
]

export const pessoas: Pessoa[] = [
  {
    iniciais: 'RD',
    nome: 'Renner David',
    detalhe: 'Cartão principal + Itaú',
    total: 3914,
    fatura: 1393,
    fixos: 2521,
    cor: 'bg-indigo-600',
  },
  {
    iniciais: 'RK',
    nome: 'Renner Kamille',
    detalhe: 'Cartão + Itaú',
    total: 1723,
    fatura: 1123,
    fixos: 600,
    cor: 'bg-pink-600',
  },
]

export const faturaItens: FaturaItem[] = [
  // David
  { id: 1, nome: 'iFood', pessoa: 'David', categoria: 'Alimentação', valor: 38.4, sigla: 'IFO', cor: 'bg-rose-500/10 text-rose-400', data: '22/07', cartao: 'Principal' },
  { id: 2, nome: 'Shopee', pessoa: 'David', categoria: 'Parcelamento', valor: 26.48, sigla: 'SHO', cor: 'bg-amber-500/10 text-amber-400', data: '20/07', cartao: 'Principal', parcelado: true, parcelaAtual: 2, totalParcelas: 2 },
  { id: 3, nome: 'Mercado Livre', pessoa: 'David', categoria: 'Compras', valor: 58.9, sigla: 'MER', cor: 'bg-emerald-500/10 text-emerald-400', data: '18/07', cartao: 'Principal' },
  { id: 4, nome: 'YouTube', pessoa: 'David', categoria: 'Assinatura', valor: 26.9, sigla: 'YOU', cor: 'bg-red-500/10 text-red-400', data: '15/07', cartao: 'Itaú' },
  { id: 5, nome: 'Gowee', pessoa: 'David', categoria: 'Assinatura', valor: 19.0, sigla: 'GOW', cor: 'bg-violet-500/10 text-violet-400', data: '12/07', cartao: 'Itaú' },
  { id: 6, nome: 'Google', pessoa: 'David', categoria: 'Assinatura', valor: 9.99, sigla: 'GOO', cor: 'bg-blue-500/10 text-blue-400', data: '10/07', cartao: 'Itaú' },
  { id: 7, nome: 'LouvreApp', pessoa: 'David', categoria: 'Assinatura', valor: 14.9, sigla: 'LOU', cor: 'bg-purple-500/10 text-purple-400', data: '08/07', cartao: 'Itaú' },
  { id: 8, nome: 'iFood', pessoa: 'David', categoria: 'Assinatura', valor: 7.95, sigla: 'IFO', cor: 'bg-rose-500/10 text-rose-400', data: '05/07', cartao: 'Itaú' },
  { id: 9, nome: 'Manuela 4/6', pessoa: 'David', categoria: 'Parcelamento', valor: 77.4, sigla: 'MAN', cor: 'bg-amber-500/10 text-amber-400', data: '03/07', cartao: 'Principal', parcelado: true, parcelaAtual: 4, totalParcelas: 6 },
  { id: 10, nome: 'Shopee 2/2', pessoa: 'David', categoria: 'Parcelamento', valor: 26.48, sigla: 'SHO', cor: 'bg-amber-500/10 text-amber-400', data: '01/07', cartao: 'Principal', parcelado: true, parcelaAtual: 2, totalParcelas: 2 },
  { id: 11, nome: 'Merc Livre 2/2', pessoa: 'David', categoria: 'Parcelamento', valor: 33.85, sigla: 'MER', cor: 'bg-emerald-500/10 text-emerald-400', data: '01/07', cartao: 'Principal', parcelado: true, parcelaAtual: 2, totalParcelas: 2 },
  { id: 12, nome: 'Altas Horas', pessoa: 'David', categoria: 'Alimentação', valor: 40.0, sigla: 'ALT', cor: 'bg-rose-500/10 text-rose-400', data: '28/06', cartao: 'Principal' },
  { id: 13, nome: 'Matte e Terer', pessoa: 'David', categoria: 'Alimentação', valor: 23.0, sigla: 'MAT', cor: 'bg-rose-500/10 text-rose-400', data: '25/06', cartao: 'Principal' },
  { id: 14, nome: 'Bigolin', pessoa: 'David', categoria: 'Compras', valor: 109.7, sigla: 'BIG', cor: 'bg-emerald-500/10 text-emerald-400', data: '22/06', cartao: 'Principal' },
  { id: 15, nome: 'Farmácia Estr', pessoa: 'David', categoria: 'Cuidados Pessoais', valor: 64.89, sigla: 'FAR', cor: 'bg-sky-500/10 text-sky-400', data: '20/06', cartao: 'Principal' },
  { id: 16, nome: 'Beal', pessoa: 'David', categoria: 'Alimentação', valor: 14.76, sigla: 'BEA', cor: 'bg-rose-500/10 text-rose-400', data: '18/06', cartao: 'Principal' },
  { id: 17, nome: 'Manu Boleto', pessoa: 'David', categoria: 'Estudos', valor: 111.6, sigla: 'EST', cor: 'bg-indigo-500/10 text-indigo-400', data: '15/06', cartao: 'Itaú' },
  { id: 18, nome: 'Pastelaria', pessoa: 'David', categoria: 'Alimentação', valor: 10.0, sigla: 'PAS', cor: 'bg-rose-500/10 text-rose-400', data: '12/06', cartao: 'Principal' },
  { id: 19, nome: 'Touca', pessoa: 'David', categoria: 'Vestuário', valor: 20.0, sigla: 'TOU', cor: 'bg-orange-500/10 text-orange-400', data: '10/06', cartao: 'Principal' },
  { id: 20, nome: 'Dourado Gás', pessoa: 'David', categoria: 'Compras', valor: 5.0, sigla: 'GAS', cor: 'bg-emerald-500/10 text-emerald-400', data: '08/06', cartao: 'Principal' },
  { id: 21, nome: 'Shein', pessoa: 'David', categoria: 'Compras', valor: 8.0, sigla: 'SHE', cor: 'bg-emerald-500/10 text-emerald-400', data: '05/06', cartao: 'Principal' },
  { id: 22, nome: 'Apple', pessoa: 'David', categoria: 'Compras', valor: 3.5, sigla: 'APP', cor: 'bg-emerald-500/10 text-emerald-400', data: '03/06', cartao: 'Principal' },
  { id: 23, nome: 'Mercado Livre', pessoa: 'David', categoria: 'Compras', valor: 58.9, sigla: 'MER', cor: 'bg-emerald-500/10 text-emerald-400', data: '01/06', cartao: 'Principal' },
  { id: 24, nome: 'Grok', pessoa: 'David', categoria: 'Assinatura', valor: 166.37, sigla: 'GRO', cor: 'bg-violet-500/10 text-violet-400', data: '28/05', cartao: 'Itaú' },
  { id: 25, nome: 'Beal', pessoa: 'David', categoria: 'Alimentação', valor: 25.67, sigla: 'BEA', cor: 'bg-rose-500/10 text-rose-400', data: '25/05', cartao: 'Principal' },
  { id: 26, nome: 'iFood', pessoa: 'David', categoria: 'Alimentação', valor: 38.4, sigla: 'IFO', cor: 'bg-rose-500/10 text-rose-400', data: '22/05', cartao: 'Principal' },
  { id: 27, nome: 'Sorv Guri', pessoa: 'David', categoria: 'Alimentação', valor: 17.44, sigla: 'SOR', cor: 'bg-rose-500/10 text-rose-400', data: '20/05', cartao: 'Principal' },
  { id: 28, nome: 'Bella Italia', pessoa: 'David', categoria: 'Alimentação', valor: 55.0, sigla: 'BEL', cor: 'bg-rose-500/10 text-rose-400', data: '18/05', cartao: 'Principal' },

  // Kamille
  { id: 29, nome: 'Netflix', pessoa: 'Kamille', categoria: 'Assinatura', valor: 55.9, sigla: 'NET', cor: 'bg-violet-500/10 text-violet-400', data: '22/07', cartao: 'Principal' },
  { id: 30, nome: 'Plano TIM', pessoa: 'Kamille', categoria: 'Assinatura', valor: 22.5, sigla: 'TIM', cor: 'bg-blue-500/10 text-blue-400', data: '20/07', cartao: 'Itaú' },
  { id: 31, nome: 'Google', pessoa: 'Kamille', categoria: 'Assinatura', valor: 9.99, sigla: 'GOO', cor: 'bg-blue-500/10 text-blue-400', data: '18/07', cartao: 'Itaú' },
  { id: 32, nome: 'Marmita', pessoa: 'Kamille', categoria: 'Alimentação', valor: 13.48, sigla: 'MAR', cor: 'bg-rose-500/10 text-rose-400', data: '15/07', cartao: 'Principal' },
  { id: 33, nome: 'Farmácia', pessoa: 'Kamille', categoria: 'Cuidados Pessoais', valor: 4.49, sigla: 'FAR', cor: 'bg-sky-500/10 text-sky-400', data: '12/07', cartao: 'Principal' },
  { id: 34, nome: 'Padoca', pessoa: 'Kamille', categoria: 'Alimentação', valor: 9.84, sigla: 'PAD', cor: 'bg-pink-500/10 text-pink-400', data: '10/07', cartao: 'Principal' },
  { id: 35, nome: 'Divino Fogão', pessoa: 'Kamille', categoria: 'Alimentação', valor: 88.88, sigla: 'DIV', cor: 'bg-rose-500/10 text-rose-400', data: '08/07', cartao: 'Principal' },
  { id: 36, nome: 'Léo Cosmet', pessoa: 'Kamille', categoria: 'Cuidados Pessoais', valor: 33.48, sigla: 'LEO', cor: 'bg-sky-500/10 text-sky-400', data: '05/07', cartao: 'Principal' },
  { id: 37, nome: 'Celular 1/2', pessoa: 'Kamille', categoria: 'Parcelamento', valor: 300.0, sigla: 'CEL', cor: 'bg-amber-500/10 text-amber-400', data: '03/07', cartao: 'Itaú', parcelado: true, parcelaAtual: 1, totalParcelas: 2 },
  { id: 38, nome: 'Magnólia', pessoa: 'Kamille', categoria: 'Alimentação', valor: 15.8, sigla: 'MAG', cor: 'bg-rose-500/10 text-rose-400', data: '01/07', cartao: 'Principal' },
  { id: 39, nome: 'Stock', pessoa: 'Kamille', categoria: 'Alimentação', valor: 43.04, sigla: 'STO', cor: 'bg-rose-500/10 text-rose-400', data: '28/06', cartao: 'Principal' },
  { id: 40, nome: 'Renata', pessoa: 'Kamille', categoria: 'Alimentação', valor: 38.0, sigla: 'REN', cor: 'bg-rose-500/10 text-rose-400', data: '25/06', cartao: 'Principal' },
  { id: 41, nome: 'Cobasi', pessoa: 'Kamille', categoria: 'Pet', valor: 28.5, sigla: 'COB', cor: 'bg-lime-500/10 text-lime-400', data: '22/06', cartao: 'Principal' },
  { id: 42, nome: 'Calixto Com', pessoa: 'Kamille', categoria: 'Compras', valor: 20.97, sigla: 'CAL', cor: 'bg-emerald-500/10 text-emerald-400', data: '20/06', cartao: 'Principal' },
  { id: 43, nome: 'Pura Vida', pessoa: 'Kamille', categoria: 'Alimentação', valor: 18.71, sigla: 'PUR', cor: 'bg-rose-500/10 text-rose-400', data: '18/06', cartao: 'Principal' },
  { id: 44, nome: 'Super Muffato', pessoa: 'Kamille', categoria: 'Alimentação', valor: 123.9, sigla: 'SUP', cor: 'bg-rose-500/10 text-rose-400', data: '15/06', cartao: 'Principal' },
  { id: 45, nome: 'Puppo', pessoa: 'Kamille', categoria: 'Alimentação', valor: 26.01, sigla: 'PUP', cor: 'bg-rose-500/10 text-rose-400', data: '12/06', cartao: 'Principal' },
  { id: 46, nome: 'Pão de Queijo', pessoa: 'Kamille', categoria: 'Alimentação', valor: 3.0, sigla: 'PAO', cor: 'bg-rose-500/10 text-rose-400', data: '10/06', cartao: 'Principal' },
]

export const lancamentos: Lancamento[] = faturaItens.slice(0, 6)
