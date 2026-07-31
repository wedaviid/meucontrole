/** Sugere categoria a partir do nome da despesa (regras locais, sem API) */
const REGRAS: { palavras: string[]; categoria: string }[] = [
  { palavras: ['ifood', 'rappi', 'uber eats', 'zé delivery', 'ze delivery', 'restaurante', 'lanchonete', 'padaria', 'padoca', 'pizza', 'hamburger', 'burger', 'mcdonald', 'bk ', 'burger king', 'subway', 'outback', 'madero', 'china', 'marmita', 'delivery', 'bar ', 'churras', 'sorvete', 'café', 'cafe ', 'starbucks', 'cafeteria'], categoria: 'Alimentação' },
  { palavras: ['netflix', 'spotify', 'disney', 'prime video', 'hbo', 'globoplay', 'youtube', 'apple music', 'deezer', 'paramount', 'crunchyroll', 'openai', 'chatgpt', 'grok', 'claude', 'cursor', 'github', 'icloud', 'google one', 'dropbox', 'adobe', 'canva', 'gympass', 'totalpass', 'academia', 'smart fit', 'plano de saúde', 'unimed', 'amil', 'claro', 'vivo', 'tim', 'oi ', 'internet', 'assinatura'], categoria: 'Assinatura' },
  { palavras: ['aluguel', 'condomínio', 'condominio', 'iptu', 'água', 'agua', 'luz', 'energia', 'gás', 'gas', 'sabesp', 'enel', 'cpfl', 'comgás', 'comgas', 'financiamento', 'prestação', 'prestacao', 'parcela casa', 'parcela apto'], categoria: 'Essenciais' },
  { palavras: ['farmácia', 'farmacia', 'drogaria', 'médico', 'medico', 'consulta', 'dentista', 'hospital', 'exame', 'remédio', 'remedio', 'raia', 'drogasil', 'pacheco'], categoria: 'Saúde' },
  { palavras: ['shopee', 'mercado livre', 'mercadolivre', 'amazon', 'magazine', 'americanas', 'casas bahia', 'shein', 'aliexpress', 'ml ', 'compra'], categoria: 'Compras' },
  { palavras: ['renner', 'c&a', 'cea', 'zara', 'hering', 'riachuelo', 'centauro', 'nike', 'adidas', 'roupa', 'calça', 'calca', 'camisa', 'tênis', 'tenis', 'sapato'], categoria: 'Vestuário' },
  { palavras: ['petz', 'cobasi', 'petshop', 'ração', 'racao', 'veterinár', 'veterinar', 'banho e tosa', 'pet '], categoria: 'Pet' },
  { palavras: ['escola', 'faculdade', 'curso', 'udemy', 'alura', 'mensalidade', 'material escolar', 'livro', 'apostila'], categoria: 'Estudos' },
  { palavras: ['tesouro', 'poupança', 'poupanca', 'cdb', 'ação', 'acoes', 'ações', 'fii', 'investimento', 'investir', 'xp ', 'nubank invest', 'rico', 'clear', 'binance', 'bitcoin', 'crypto', 'cripto'], categoria: 'Investimentos' },
  { palavras: ['uber', '99 ', 'taxi', 'táxi', 'combustível', 'combustivel', 'gasolina', 'etanol', 'posto', 'shell', 'ipiranga', 'petrobras', 'estacionamento'], categoria: 'Outros' },
]

export function sugerirCategoria(nome: string): string | null {
  const n = nome.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  if (!n.trim()) return null
  for (const regra of REGRAS) {
    for (const p of regra.palavras) {
      const termo = p.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
      if (n.includes(termo)) return regra.categoria
    }
  }
  return null
}
