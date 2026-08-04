import type { FaturaItem, Receita } from '../types'

function downloadBlob(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function formatValor(v: number) {
  return v.toFixed(2).replace('.', ',')
}

export function exportarDespesasCSV(despesas: FaturaItem[], mes: string) {
  const header = 'Data;Descrição;Categoria;Pessoa;Meio;Origem;Valor;Status;Parcelado;Parcela\n'
  const rows = despesas
    .map((d) => {
      const parcela = d.parcelado ? `${d.parcelaAtual || 1}/${d.totalParcelas || '?'}` : ''
      return `${d.data};"${d.nome}";${d.categoria};${d.pessoa};${d.meio || 'credito'};${d.cartao};${formatValor(d.valor)};${d.pago === false ? 'Pendente' : 'Paga'};${d.parcelado ? 'Sim' : 'Não'};${parcela}`
    })
    .join('\n')

  downloadBlob(header + rows, `despesas_${mes}.csv`)
}

export function exportarReceitasCSV(receitas: Receita[], mes: string) {
  const header = 'Data;Descrição;Pessoa;Valor\n'
  const rows = receitas
    .map((r) => `${r.data};"${r.nome}";${r.pessoa};${formatValor(r.valor)}`)
    .join('\n')

  downloadBlob(header + rows, `receitas_${mes}.csv`)
}

export function exportarTudoCSV(
  despesas: FaturaItem[],
  receitas: Receita[],
  mes: string
) {
  const totalReceitas = receitas.reduce((a, r) => a + r.valor, 0)
  const totalDespesas = despesas.filter((d) => d.pago !== false).reduce((a, d) => a + d.valor, 0)
  const saldo = totalReceitas - totalDespesas

  let content = `MeuControle - Relatório ${mes}\n\n`
  content += `RESUMO\n`
  content += `Receitas;${formatValor(totalReceitas)}\n`
  content += `Despesas;${formatValor(totalDespesas)}\n`
  content += `Saldo;${formatValor(saldo)}\n\n`

  content += `RECEITAS\n`
  content += `Data;Descrição;Pessoa;Valor\n`
  receitas.forEach((r) => {
    content += `${r.data};"${r.nome}";${r.pessoa};${formatValor(r.valor)}\n`
  })

  content += `\nDESPESAS\n`
  content += `Data;Descrição;Categoria;Pessoa;Meio;Origem;Valor;Status;Parcelado;Parcela\n`
  despesas.forEach((d) => {
    const parcela = d.parcelado ? `${d.parcelaAtual || 1}/${d.totalParcelas || '?'}` : ''
    content += `${d.data};"${d.nome}";${d.categoria};${d.pessoa};${d.meio || 'credito'};${d.cartao};${formatValor(d.valor)};${d.pago === false ? 'Pendente' : 'Paga'};${d.parcelado ? 'Sim' : 'Não'};${parcela}\n`
  })

  // Por categoria
  content += `\nPOR CATEGORIA\n`
  content += `Categoria;Total\n`
  const mapa: Record<string, number> = {}
  despesas.forEach((d) => {
    mapa[d.categoria] = (mapa[d.categoria] || 0) + d.valor
  })
  Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, val]) => {
      content += `${cat};${formatValor(val)}\n`
    })

  // Por pessoa
  content += `\nPOR PESSOA\n`
  content += `Pessoa;Total\n`
  const porPessoa: Record<string, number> = {}
  despesas.forEach((d) => {
    porPessoa[d.pessoa] = (porPessoa[d.pessoa] || 0) + d.valor
  })
  Object.entries(porPessoa).forEach(([nome, total]) => {
    content += `${nome};${formatValor(total)}\n`
  })

  downloadBlob(content, `meucontrole_${mes}.csv`)
}
