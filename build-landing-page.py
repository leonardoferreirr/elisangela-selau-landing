#!/usr/bin/env python3
"""Gera landing-page.html a partir do index.html.

A landing page (/landing-page) é o teste B das campanhas: o mesmo site, com o
mesmo layout, mas com o formulário de duas etapas no lugar do WhatsApp direto.
O index.html (site principal, com campanha rodando) não é tocado.

O que muda na cópia:
  - todo botão "Quero conversar sobre meu projeto" vira âncora para #formulario;
  - sai o ícone do WhatsApp dos botões;
  - saem o telefone do menu e o telefone e o e-mail do rodapé;
  - entra a seção do formulário (src/lp-formulario.html) antes do rodapé;
  - a página não é indexada (é cópia do site, só recebe tráfego pago) e perde o
    JSON-LD, que tem o telefone e já existe no site principal.

Rodar de novo sempre que o index.html mudar:
    python3 build-landing-page.py
Cada troca confere quantas vezes aconteceu; se o index.html mudar de estrutura,
o script para com erro em vez de gerar uma cópia quebrada.
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
URL_LP = 'https://www.elisangelaselauarquitetura.com.br/landing-page'

s = (RAIZ / 'index.html').read_text(encoding='utf-8')
formulario = (RAIZ / 'src' / 'lp-formulario.html').read_text(encoding='utf-8')


def troca(antigo, novo, vezes=1):
    global s
    n = s.count(antigo)
    assert n == vezes, f'esperava {vezes}x, achei {n}x: {antigo[:70]!r}'
    s = s.replace(antigo, novo)


def troca_re(padrao, novo, vezes, flags=0):
    global s
    s, n = re.subn(padrao, novo, s, flags=flags)
    assert n == vezes, f'esperava {vezes}x, achei {n}x: {padrao!r}'


troca('<!doctype html>\n',
      '<!doctype html>\n<!-- GERADO por build-landing-page.py a partir do index.html. '
      'Não editar à mão: editar o index.html ou src/lp-formulario.html e rodar o script. -->\n')

# ---- head: fora do índice do Google, sem JSON-LD, CSS do formulário
troca('<link rel="canonical" href="https://www.elisangelaselauarquitetura.com.br/">',
      '<meta name="robots" content="noindex,follow">')
troca('<meta property="og:url" content="https://www.elisangelaselauarquitetura.com.br/">',
      f'<meta property="og:url" content="{URL_LP}">')
troca_re(r'\n<script type="application/ld\+json">.*?</script>', '', 1, re.S)
troca('<link rel="stylesheet" href="assets/css/site.css">',
      '<link rel="stylesheet" href="assets/css/site.css">\n<link rel="stylesheet" href="assets/css/lp-form.css">')

# ---- rodapé: sai WhatsApp e e-mail, o contato passa a ser o formulário
ICONE_FORM = ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
              '<rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>')
troca_re(r'(<ul class="foot__contato">\s*)<li><a href="obrigado\?c=rodape">.*?</a></li>\s*'
         r'<li><a href="mailto:[^"]+">.*?</a></li>',
         r'\1<li><a href="#formulario">\n            ' + ICONE_FORM.replace('\\', '\\\\') +
         '\n            Solicitar atendimento</a></li>',
         1, re.S)

# ---- botões: mesmo texto, destino = formulário, sem ícone do WhatsApp
troca_re(r'<svg class="zap-ico".*?</svg>\s*', '', 10, re.S)
troca_re(r'href="obrigado\?c=[a-z]+"', 'href="#formulario"', 10)
troca('<a href="#contato">Contato</a>', '<a href="#formulario">Contato</a>')
troca('<a href="#contato" style="--i:5">Contato</a>', '<a href="#formulario" style="--i:5">Contato</a>')

# ---- menu do celular: sem o telefone
troca_re(r'\n\s*<span>\+55 54 98402-6936</span>', '', 1)

# ---- seção do formulário antes do rodapé, e o script dela
troca('\n</main>', '\n' + formulario + '\n</main>')
troca('<script src="assets/js/site.js" defer></script>',
      '<script src="assets/js/site.js" defer></script>\n<script src="assets/js/lp-form.js" defer></script>')

# nada que leve direto ao WhatsApp pode sobrar na landing
for proibido in ('obrigado?c=', 'wa.me', '98402', 'zap-ico', 'elisangelaselauarquitetura@gmail.com'):
    assert proibido not in s, f'sobrou {proibido!r} na landing page'

(RAIZ / 'landing-page.html').write_text(s, encoding='utf-8')
print('landing-page.html gerada')
