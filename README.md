# Elisângela Selau Arquitetura

Landing institucional do escritório de arquitetura de Caxias do Sul, RS.
HTML, CSS e JavaScript puros, sem framework e sem dependência externa.

## Rodar local

```bash
npx serve -l 8811 .
```

## Estrutura

```
index.html            página única
obrigado.html         ponte de conversão (dispara o evento e abre o WhatsApp)
assets/css/site.css   design system e todas as seções
assets/js/site.js     motion e slideshow do hero
assets/img/           logo em SVG, hero, projetos e feed
assets/fonts/         Newsreader e Mulish (variáveis, subsetadas, 108KB no total)
```

## Identidade

O arco do monograma da logo é o motivo do site: aparece nas imagens de hero,
do estúdio e da arquiteta, e no traço que acompanha a foto principal.

| token | valor | uso |
|---|---|---|
| `--paper` | `#F4F0E9` | fundo |
| `--ink` | `#171410` | texto e seções escuras |
| `--bronze` | `#B29570` | acento, amostrado da logo |
| `--bronze-deep` | `#87683F` | acento sobre fundo claro (contraste AA) |

Tipografia: **Newsreader** (títulos, com itálico) e **Mulish** (texto e rótulos).

## Conversão

Não existe formulário. A cliente pediu contato direto, sem nada para preencher,
então os onze CTAs da página apontam para `obrigado?c=<seção>`, que dispara
`dataLayer.push({event:'conversao_orcamento', contexto})` e redireciona para o
WhatsApp do escritório em 1,8s, com a mensagem de abertura já pronta.

O `c=` identifica de onde saiu o clique (`topo`, `hero`, `servicos`, `projetos`,
`processo`, `arquiteta`, `faixa`, `contato`, `menu`, `instagram`), o que permite
ver no Analytics qual seção converte.

**O link é sem o `.html` de propósito.** Com `cleanUrls: true` no `vercel.json`,
`/obrigado.html` redireciona para `/obrigado` e a query se perde no caminho,
levando junto o contexto. `obrigado?c=x` vai direto e preserva.

O número de destino fica em `WHATS`, dentro de `obrigado.html`, num lugar só.

## Slideshow do hero

Oito fotos em `assets/img/hero/`, com crossfade a cada 4,6s. A primeira é a do
`<picture>` e tem `fetchpriority=high`; as outras sete entram por JS depois do
evento `load`, para não competir com o LCP.

Roda **só acima de 900px**, o mesmo corte em que o `<picture>` serve o
`hero-sm.webp`. No celular o arco tem cerca de 350px e as sete fotos extras
custariam meio mega para uma troca que quase não se percebe. Também para de
girar fora da tela e em aba oculta.

A altura do arco é limitada por `calc((100vh - 14.5rem) * .75)`: sendo 3:4, a
altura é a largura vezes 4/3, e travado só pela largura ele passava da dobra em
notebook (1366x768 e 1512x860).

## Antes de publicar

- [ ] Confirmar o número do CAU da arquiteta para incluir no rodapé.
- [ ] Validar com a Elisângela as quatro etapas da seção "Como o projeto acontece".
- [ ] Confirmar se o site substitui o domínio atual (hoje em Wix).

## Qualidade

Lighthouse mobile com throttle real (`--throttling-method=devtools`):
performance 99, acessibilidade 100, boas práticas 100, SEO 100.
LCP 2,0s, CLS 0, TBT 0ms. Sem arrasto lateral em 390px.
