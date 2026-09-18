# Elisângela Selau Arquitetura

Landing institucional do escritório de arquitetura de Caxias do Sul, RS.
HTML, CSS e JavaScript puros, sem framework e sem dependência externa.

## Rodar local

```bash
npx serve -l 8811 .
```

## Estrutura

```
index.html            página única, com o formulário
obrigado.html         ponte de conversão (dispara o evento e abre o WhatsApp)
assets/css/site.css   design system e todas as seções
assets/css/formulario.css
assets/js/site.js     motion e slideshow do hero
assets/js/formulario.js
src/versao-whatsapp/  versão anterior, fora do ar
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

## Contato e conversão

**O único canal de contato do site é o formulário de duas etapas** (seção
`#formulario`, antes do rodapé). Todo botão "Quero conversar sobre meu projeto"
desce até ele. Não há telefone, e-mail nem ícone de WhatsApp na página; o rodapé
tem "Solicitar atendimento" e o Instagram. Desde 18/09/2026, quando o cliente
aprovou o resultado do teste, é esta a página principal.

| arquivo | papel |
|---|---|
| `index.html` | a página, com a seção do formulário |
| `assets/css/formulario.css`, `assets/js/formulario.js` | o formulário |
| `obrigado.html` | agradecimento: dispara a conversão e abre o WhatsApp |
| `src/versao-whatsapp/` | a versão anterior (CTA direto no WhatsApp), fora do ar |

**Etapa 1** pergunta "Como podemos ajudar você?". As opções 5 (fornecedor ou
parceria) e 6 (emprego ou estágio) param ali, com a mensagem de que o canal é
exclusivo para clientes e o `parcerias@elisangelaselauarquitetura.com.br` (assunto
"Proposta comercial" na 5 e "Currículo" na 6). Não há botão de voltar: nenhuma das
duas chega no formulário nem no WhatsApp, e quem clicou errado recarrega a página.

**Etapa 2** é o pedido. O envio monta a mensagem do WhatsApp, guarda na sessão
(nunca na URL) e vai para `/obrigado?c=<botão de origem>`, que abre o WhatsApp.

**Conversão.** O GTM (`GTM-5HN8STRT`) dispara as duas conversões do Google Ads em
qualquer página cujo endereço contenha `/obrigado`. Ali o GTM só é carregado
quando existe um pedido de verdade na sessão: quem abre o endereço direto não
conta conversão, não vê o WhatsApp e é mandado de volta ao formulário. O
redirecionamento espera o GTM terminar (0,9s mínimo, 2,6s no máximo se um
bloqueador segurar).

**Origem da campanha.** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content`, `gclid`, `gbraid`, `wbraid` e `fbclid` são guardados ao chegar
(90 dias, o último clique vence) e vão em campos ocultos do formulário e no
evento `conversao_orcamento` do dataLayer, sem nome nem telefone. **Para gravar
cada pedido com a origem num lugar**, preencher `REGISTRO` no topo do
`formulario.js` (chave do Web3Forms ou URL que receba JSON). Vazio, o pedido
existe só como a mensagem de WhatsApp.

Eventos no dataLayer: `lp_triagem` (resposta da etapa 1, `qualificado`),
`lp_formulario_enviado` e, no agradecimento, `conversao_orcamento`.

**Endereços antigos.** `/landing-page` (o teste) redireciona para `/` e
`/obrigado-lp` para `/obrigado`, os dois temporários (307) e com a query junto,
para anúncio antigo e gclid não se perderem.

**Voltar para a versão do WhatsApp**, se um dia precisar: os dois arquivos de
`src/versao-whatsapp/` voltam para a raiz no lugar de `index.html` e
`obrigado.html`. A pasta `src/` não sobe para a Vercel (`.vercelignore`), por
isso ela não está acessível no ar.

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
