import { useEffect, useState } from 'react'
import type { AppConfig, ContaItem, MetodoOrcamento, PercentuaisOrcamento, CategoriaItem, TipoOrcamentoCategoria } from '../types'
import { origensDeContas, METODOS_ORCAMENTO, CATEGORIAS_DESPESA_PADRAO, CATEGORIAS_RECEITA_PADRAO } from '../types'

interface ConfigPageProps {
  config: AppConfig
  onSalvar: (config: AppConfig) => void
}

type Secao = 'menu' | 'pessoas' | 'contas' | 'categorias' | 'metodo' | 'preferencias'

function ListaPessoas({
  lista,
  setLista,
}: {
  lista: string[]
  setLista: (v: string[]) => void
}) {
  const [novo, setNovo] = useState('')
  const [erro, setErro] = useState('')

  const add = () => {
    const v = novo.trim()
    if (!v) return
    if (lista.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setErro('Já existe')
      return
    }
    setLista([...lista, v])
    setNovo('')
    setErro('')
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {lista.map((item, idx) => (
          <li key={`p-${idx}`} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...lista]
                next[idx] = e.target.value
                setLista(next)
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              disabled={lista.length <= 1}
              onClick={() => setLista(lista.filter((_, i) => i !== idx))}
              className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Adicionar pessoa..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-sky-600 text-sm text-white">
          +
        </button>
      </div>
      {erro && <p className="text-xs text-amber-400">{erro}</p>}
    </div>
  )
}

function MenuItem({
  titulo,
  descricao,
  onClick,
}: {
  titulo: string
  descricao: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 text-left transition"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{titulo}</p>
        <p className="text-xs text-slate-500 mt-0.5">{descricao}</p>
      </div>
      <span className="text-slate-500">→</span>
    </button>
  )
}

export function ConfigPage({ config, onSalvar }: ConfigPageProps) {
  const [secao, setSecao] = useState<Secao>('menu')
  const [nomeEspaco, setNomeEspaco] = useState(config.nomeEspaco)
  const [pessoas, setPessoas] = useState<string[]>([...config.pessoas])
  const [contas, setContas] = useState<ContaItem[]>(
    config.contas?.length ? config.contas.map((c) => ({ ...c })) : [],
  )
  const [msg, setMsg] = useState('')
  const [novaNome, setNovaNome] = useState('')
  const [novaTipo, setNovaTipo] = useState<'credito' | 'conta'>('conta')
  const [metodo, setMetodo] = useState<MetodoOrcamento>(config.metodoOrcamento || '50-30-20')
  const [perc, setPerc] = useState<PercentuaisOrcamento>(
    config.percentuais || { essenciais: 50, naoEssenciais: 30, investimentos: 20 },
  )
  const [catDespesa, setCatDespesa] = useState<CategoriaItem[]>(
    config.categoriasDespesa?.length ? config.categoriasDespesa.map((c) => ({ ...c })) : CATEGORIAS_DESPESA_PADRAO.map((c) => ({ ...c })),
  )
  const [catReceita, setCatReceita] = useState<CategoriaItem[]>(
    config.categoriasReceita?.length ? config.categoriasReceita.map((c) => ({ ...c })) : CATEGORIAS_RECEITA_PADRAO.map((c) => ({ ...c })),
  )
  const [abaCat, setAbaCat] = useState<'despesa' | 'receita'>('despesa')
  const [novaCatNome, setNovaCatNome] = useState('')
  const [novaCatTipo, setNovaCatTipo] = useState<TipoOrcamentoCategoria>('nao_essencial')

  useEffect(() => {
    setNomeEspaco(config.nomeEspaco)
    setPessoas([...config.pessoas])
    setContas(config.contas?.length ? config.contas.map((c) => ({ ...c })) : [])
    setMetodo(config.metodoOrcamento || '50-30-20')
    setPerc(config.percentuais || { essenciais: 50, naoEssenciais: 30, investimentos: 20 })
    setCatDespesa(
      config.categoriasDespesa?.length
        ? config.categoriasDespesa.map((c) => ({ ...c }))
        : CATEGORIAS_DESPESA_PADRAO.map((c) => ({ ...c })),
    )
    setCatReceita(
      config.categoriasReceita?.length
        ? config.categoriasReceita.map((c) => ({ ...c }))
        : CATEGORIAS_RECEITA_PADRAO.map((c) => ({ ...c })),
    )
  }, [config])

  const addConta = () => {
    const v = novaNome.trim()
    if (!v) return
    if (contas.some((c) => c.nome.toLowerCase() === v.toLowerCase())) return
    setContas([
      ...contas,
      {
        id: `c-${Date.now()}`,
        nome: v,
        tipo: novaTipo,
        incluirSaldo: novaTipo === 'conta',
      },
    ])
    setNovaNome('')
  }

  const salvar = () => {
    const pessoasLimpas = pessoas.map((p) => p.trim()).filter(Boolean)
    if (!pessoasLimpas.length) {
      setMsg('Informe ao menos uma pessoa')
      return
    }
    if (metodo === 'personalizado') {
      const soma = perc.essenciais + perc.naoEssenciais + perc.investimentos
      if (soma !== 100) {
        setMsg('Percentuais personalizados precisam somar 100%')
        return
      }
    }
    const contasFinais = contas.filter((c) => c.nome.trim())
    onSalvar({
      ...config,
      nomeEspaco: nomeEspaco.trim() || 'Meu espaço',
      pessoas: pessoasLimpas,
      contas: contasFinais,
      origens: origensDeContas(contasFinais),
      metodoOrcamento: metodo,
      percentuais: metodo === 'personalizado' ? perc : config.percentuais,
      categoriasDespesa: catDespesa,
      categoriasReceita: catReceita,
    })
    setMsg('Configurações salvas')
    setTimeout(() => setMsg(''), 2500)
  }

  const titulos: Record<Secao, string> = {
    menu: 'Configurações',
    pessoas: 'Pessoas',
    contas: 'Contas e cartões',
    categorias: 'Categorias',
    metodo: 'Método de orçamento',
    preferencias: 'Preferências',
  }


  return (
    <div className="space-y-4 max-w-xl">
      {secao !== 'menu' && (
        <button
          type="button"
          onClick={() => setSecao('menu')}
          className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
        >
          ← Configurações
        </button>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white">{titulos[secao]}</h2>
        {secao === 'menu' && (
          <p className="text-xs text-slate-500 mt-1">Ajuste o app à sua casa</p>
        )}
      </div>

      {secao === 'menu' && (
        <div className="space-y-2">
          <MenuItem
            titulo="Pessoas"
            descricao="Quem participa do orçamento"
            onClick={() => setSecao('pessoas')}
          />
          <MenuItem
            titulo="Contas e cartões"
            descricao="Origens: crédito, débito, Pix, boleto"
            onClick={() => setSecao('contas')}
          />
          <MenuItem
            titulo="Categorias"
            descricao="Como cada gasto entra no método"
            onClick={() => setSecao('categorias')}
          />
          <MenuItem
            titulo="Método de orçamento"
            descricao="50/30/20, 80/20, personalizado…"
            onClick={() => setSecao('metodo')}
          />
          <MenuItem
            titulo="Preferências"
            descricao="Nome do espaço e gerais"
            onClick={() => setSecao('preferencias')}
          />
        </div>
      )}

      {secao === 'pessoas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <ListaPessoas lista={pessoas} setLista={setPessoas} />
        </div>
      )}

      {secao === 'contas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Cartões aparecem em crédito. Contas em Pix, débito e boleto (conta que paga).
          </p>
          <ul className="space-y-2">
            {contas.map((c, idx) => (
              <li key={c.id} className="flex gap-2 items-center">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    c.tipo === 'credito' ? 'bg-violet-500/20 text-violet-300' : 'bg-sky-500/20 text-sky-300'
                  }`}
                >
                  {c.tipo === 'credito' ? 'Cartão' : 'Conta'}
                </span>
                <input
                  value={c.nome}
                  onChange={(e) => {
                    const next = [...contas]
                    next[idx] = { ...c, nome: e.target.value }
                    setContas(next)
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setContas(contas.filter((_, i) => i !== idx))}
                  className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={novaTipo}
              onChange={(e) => setNovaTipo(e.target.value as 'credito' | 'conta')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="conta">Conta (Pix / boleto / débito)</option>
              <option value="credito">Cartão de crédito</option>
            </select>
            <input
              value={novaNome}
              onChange={(e) => setNovaNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConta())}
              placeholder="Ex: Itaú, Renner..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button type="button" onClick={addConta} className="px-3 py-2 rounded-lg bg-sky-600 text-sm text-white">
              +
            </button>
          </div>
        </div>
      )}

      {secao === 'categorias' && (
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setAbaCat('despesa')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                abaCat === 'despesa' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Despesas
            </button>
            <button
              type="button"
              onClick={() => setAbaCat('receita')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                abaCat === 'receita' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Receitas
            </button>
          </div>

          {abaCat === 'despesa' && (
            <div className="space-y-3">
              {(
                [
                  ['essencial', 'Essenciais', 'text-emerald-400'],
                  ['nao_essencial', 'Não essenciais', 'text-amber-400'],
                  ['investimento', 'Investimentos', 'text-sky-400'],
                ] as const
              ).map(([tipo, titulo, cor]) => {
                const itens = catDespesa.filter((c) => (c.tipoOrcamento || 'nao_essencial') === tipo && c.ativa !== false)
                return (
                  <div key={tipo} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${cor}`}>{titulo}</h3>
                      <span className="text-[11px] text-slate-500">{itens.length}</span>
                    </div>
                    <ul className="divide-y divide-slate-800/80">
                      {itens.map((c) => (
                        <li key={c.id} className="px-4 py-2.5 flex items-center gap-2">
                          <input
                            value={c.nome}
                            onChange={(e) =>
                              setCatDespesa(catDespesa.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))
                            }
                            className="flex-1 bg-transparent text-sm text-white focus:outline-none focus:bg-slate-800 rounded px-1 py-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => setCatDespesa(catDespesa.filter((x) => x.id !== c.id))}
                            className="text-slate-500 hover:text-rose-400 text-sm px-1"
                            title="Remover"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                      {itens.length === 0 && (
                        <li className="px-4 py-3 text-xs text-slate-500">Nenhuma neste grupo</li>
                      )}
                    </ul>
                  </div>
                )
              })}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-medium text-slate-300">Nova categoria de despesa</p>
                <input
                  value={novaCatNome}
                  onChange={(e) => setNovaCatNome(e.target.value)}
                  placeholder="Ex: Academia, Igreja..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['essencial', 'Essencial'],
                      ['nao_essencial', 'Não essencial'],
                      ['investimento', 'Investimento'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setNovaCatTipo(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        novaCatTipo === id
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const n = novaCatNome.trim()
                    if (!n) return
                    if (catDespesa.some((c) => c.nome.toLowerCase() === n.toLowerCase())) return
                    setCatDespesa([
                      ...catDespesa,
                      {
                        id: `d-${Date.now()}`,
                        nome: n,
                        tipoOrcamento: novaCatTipo,
                        ativa: true,
                      },
                    ])
                    setNovaCatNome('')
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
                >
                  + Adicionar categoria
                </button>
              </div>
            </div>
          )}

          {abaCat === 'receita' && (
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Receitas</h3>
                </div>
                <ul className="divide-y divide-slate-800/80">
                  {catReceita
                    .filter((c) => c.ativa !== false)
                    .map((c) => (
                      <li key={c.id} className="px-4 py-2.5 flex items-center gap-2">
                        <input
                          value={c.nome}
                          onChange={(e) =>
                            setCatReceita(catReceita.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x)))
                          }
                          className="flex-1 bg-transparent text-sm text-white focus:outline-none focus:bg-slate-800 rounded px-1 py-0.5"
                        />
                        <button
                          type="button"
                          onClick={() => setCatReceita(catReceita.filter((x) => x.id !== c.id))}
                          className="text-slate-500 hover:text-rose-400 text-sm px-1"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-medium text-slate-300">Nova categoria de receita</p>
                <div className="flex gap-2">
                  <input
                    value={novaCatNome}
                    onChange={(e) => setNovaCatNome(e.target.value)}
                    placeholder="Ex: Comissão, Aluguel..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const n = novaCatNome.trim()
                      if (!n) return
                      if (catReceita.some((c) => c.nome.toLowerCase() === n.toLowerCase())) return
                      setCatReceita([
                        ...catReceita,
                        { id: `r-${Date.now()}`, nome: n, ativa: true },
                      ])
                      setNovaCatNome('')
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {secao === 'metodo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="space-y-2">
            {METODOS_ORCAMENTO.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodo(m.id)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition ${
                  metodo === m.id
                    ? 'border-sky-500/50 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      metodo === m.id ? 'border-sky-400' : 'border-slate-500'
                    }`}
                  >
                    {metodo === m.id && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                  </span>
                  <span className="text-sm font-medium text-white">{m.label}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-6">{m.descricao}</p>
              </button>
            ))}
          </div>
          {metodo === 'personalizado' && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              {(
                [
                  ['essenciais', 'Necessidades'],
                  ['naoEssenciais', 'Desejos'],
                  ['investimentos', 'Investimentos'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="text-[11px] text-slate-400 block mb-1">{label} %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={perc[key]}
                    onChange={(e) =>
                      setPerc({
                        ...perc,
                        [key]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              ))}
              <p className="col-span-3 text-xs text-slate-500">
                Soma: {perc.essenciais + perc.naoEssenciais + perc.investimentos}%
                {perc.essenciais + perc.naoEssenciais + perc.investimentos !== 100 && (
                  <span className="text-amber-400"> — precisa ser 100%</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {secao === 'preferencias' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Nome do espaço</label>
            <input
              value={nomeEspaco}
              onChange={(e) => setNomeEspaco(e.target.value)}
              placeholder="Ex: Finanças da família"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <p className="text-xs text-slate-500">Aparece no menu lateral e na nuvem deste espaço.</p>
        </div>
      )}

      {secao !== 'menu' && (
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <button
            type="button"
            onClick={salvar}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
          >
            Salvar
          </button>
          {msg && (
            <p className={`text-sm py-2 ${msg.includes('salvas') ? 'text-emerald-400' : 'text-amber-400'}`}>
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
