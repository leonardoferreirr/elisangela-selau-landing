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
assets/js/site.js     motion, filtro da galeria e formulário
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

## Formulário

Todo CTA da página leva para o formulário em `#contato`. Ao enviar, os dados
viram uma mensagem estruturada, passam por `obrigado.html` (que dispara
`dataLayer.push({event:'conversao_orcamento'})`) e abrem o WhatsApp do escritório
já preenchido. A mensagem viaja por `sessionStorage`, nunca pela URL, para não
levar dado pessoal para o Analytics.

**Para receber por e-mail em vez de WhatsApp:** preencha a constante `ENDPOINT`
no topo de `assets/js/site.js` com a URL de um serviço de formulário
(Web3Forms, Formspree e similares). Com o endpoint preenchido, o envio vai para
lá e a ponte continua funcionando.

O número de destino fica em `WHATS`, no mesmo arquivo e em `obrigado.html`.

## Antes de publicar

- [ ] Confirmar o número do CAU da arquiteta para incluir no rodapé.
- [ ] Validar com a Elisângela as quatro etapas da seção "Como o projeto acontece".
- [ ] Confirmar se o site substitui o domínio atual (hoje em Wix).

## Qualidade

Lighthouse mobile com throttle real (`--throttling-method=devtools`):
performance 99, acessibilidade 100, boas práticas 100, SEO 100.
LCP 2,0s, CLS 0, TBT 0ms. Sem arrasto lateral em 390px.
