/** Formata dígitos como R$ 1.234,56 enquanto digita (centavos). */
export function formatarMoedaDigitacao(entrada: string): string {
  const digits = entrada.replace(/\D/g, '')
  if (!digits) return ''
  const cents = parseInt(digits, 10)
  if (isNaN(cents)) return ''
  const valor = cents / 100
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Converte "1.234,56" ou "1234.56" ou "R$ 1.234,56" em number. */
export function parseMoeda(texto: string): number {
  const limpo = texto.replace(/[R$\s]/gi, '').trim()
  if (!limpo) return NaN
  // pt-BR: 1.234,56
  if (limpo.includes(',')) {
    const n = limpo.replace(/\./g, '').replace(',', '.')
    return parseFloat(n)
  }
  return parseFloat(limpo)
}

/** Exibe número já conhecido (ex.: edição) como 1.234,56 */
export function formatarMoedaNumero(valor: number): string {
  if (valor == null || isNaN(valor)) return ''
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
