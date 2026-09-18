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

Não existe formulário nem seção de contato. A cliente pediu contato direto,
sem nada para preencher, então os CTAs da página apontam para
`obrigado?c=<seção>`, que dispara
`dataLayer.push({event:'conversao_orcamento', contexto})` e redireciona para o
WhatsApp do escritório em 1,8s, com a mensagem de abertura já pronta.

O `c=` identifica de onde saiu o clique (`topo`, `hero`, `servicos`, `projetos`,
`processo`, `arquiteta`, `faixa`, `menu`, `instagram`, `rodape`), o que permite
ver no Analytics qual seção converte.

Os dados de contato vivem só no rodapé, com ícone ao lado de cada um. O rodapé
carrega `id="contato"`, então o item "Contato" do menu continua funcionando
depois que a seção saiu.

**O link é sem o `.html` de propósito.** Com `cleanUrls: true` no `vercel.json`,
`/obrigado.html` redireciona para `/obrigado` e a query se perde no caminho,
levando junto o contexto. `obrigado?c=x` vai direto e preserva.

O número de destino fica em `WHATS`, dentro de `obrigado.html`, num lugar só.

## Landing page de teste (`/landing-page`)

Teste B das campanhas: **o mesmo site, com o mesmo layout**, mas com um
formulário de duas etapas no lugar do WhatsApp direto. O site principal (`/`)
continua como está, com campanha rodando.

| arquivo | papel |
|---|---|
| `landing-page.html` | **gerado**, não editar à mão |
| `build-landing-page.py` | gera a landing a partir do `index.html` |
| `src/lp-formulario.html` | a seção do formulário, injetada antes do rodapé |
| `assets/css/lp-form.css`, `assets/js/lp-form.js` | só a landing carrega |
| `obrigado-lp.html` | agradecimento da landing, abre o WhatsApp |

**Mudou o `index.html`? Rode `python3 build-landing-page.py`** e a landing
acompanha. Cada troca do script confere quantas vezes aconteceu: se a estrutura
do `index.html` mudar, ele para com erro em vez de gerar cópia quebrada.

O que a cópia tem de diferente: os botões "Quero conversar sobre meu projeto"
descem para `#formulario`; sai o ícone do WhatsApp; saem o telefone do menu e o
telefone e o e-mail do rodapé (fica "Solicitar atendimento" e o Instagram); a
página é `noindex` e não tem JSON-LD, porque é cópia do site e só recebe
tráfego pago.

**Etapa 1** pergunta "Como podemos ajudar você?". As opções 5 (fornecedor ou
parceria) e 6 (emprego ou estágio) param ali, com a mensagem de que o canal é
exclusivo para clientes. A 5 mostra `parcerias@elisangelaselauarquitetura.com.br`.
Nenhuma das duas chega no formulário nem no WhatsApp.

**Etapa 2** é o pedido. O envio monta a mensagem do WhatsApp, guarda na sessão
(nunca na URL) e vai para `obrigado-lp`, que abre o WhatsApp.

**Conversão.** O GTM dispara as duas conversões do Google Ads em qualquer página
cujo endereço contenha `/obrigado`, e `/obrigado-lp` contém. Só que ali o GTM só
é carregado quando existe um pedido de verdade na sessão: quem abre o endereço
direto não conta conversão e é mandado de volta ao formulário. O redirecionamento
espera o GTM terminar (0,9s mínimo, 2,6s no máximo se um bloqueador segurar).

**Origem da campanha.** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content`, `gclid`, `gbraid`, `wbraid` e `fbclid` são guardados ao chegar
(90 dias, o último clique vence) e vão em campos ocultos do formulário e no
evento `conversao_orcamento` do dataLayer, sem nome nem telefone. **Para gravar
cada pedido com a origem num lugar**, preencher `REGISTRO` no topo do
`lp-form.js` (chave do Web3Forms ou URL que receba JSON). Vazio, o pedido existe
só como a mensagem de WhatsApp.

Eventos no dataLayer: `lp_triagem` (resposta da etapa 1, `qualificado`),
`lp_formulario_enviado` e, no agradecimento, `conversao_orcamento` com
`pagina: 'landing-page'`.

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
