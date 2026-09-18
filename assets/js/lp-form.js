/* Elisângela Selau Arquitetura — formulário de duas etapas da landing page.
   Só a landing page carrega este arquivo. */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Onde registrar cada pedido, com os dados de origem da campanha.
     Vazio = o pedido segue só para o WhatsApp e a origem vai só para o
     dataLayer. Para gravar em algum lugar, preencha UM dos dois:
       web3formsKey: chave do web3forms.com (chega por e-mail)
       url:          qualquer endereço que receba JSON por POST
                     (ex.: Apps Script publicado a partir de uma planilha)
     ------------------------------------------------------------------ */
  const REGISTRO = { url: '', web3formsKey: '' };

  // A página de agradecimento precisa ter "/obrigado" no endereço: é o que o
  // GTM usa para disparar as duas conversões do Google Ads.
  const OBRIGADO = 'obrigado-lp';
  const CHAVE_MSG = 'elis_lp_msg';
  const CHAVE_LEAD = 'elis_lp_lead';
  const CHAVE_ORIGEM = 'elis_origem';
  const VALIDADE_ORIGEM = 90 * 864e5; // mesma janela do clique do Google Ads

  const MOTIVOS = {
    arquitetura: { ok: true,  servico: 'Projeto arquitetônico' },
    interiores:  { ok: true,  servico: 'Projeto de interiores' },
    construcao:  { ok: true },
    reforma:     { ok: true,  servico: 'Projeto de Reforma' },
    fornecedor:  { ok: false, assunto: 'Proposta comercial' },
    emprego:     { ok: false, assunto: 'Currículo' }
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const dl = (obj) => { (window.dataLayer = window.dataLayer || []).push(obj); };

  const secao = $('#formulario');
  if (!secao) return;
  const form = $('#lf-form');
  const passos = {
    1: $('[data-passo="1"]', secao),
    bloqueio: $('[data-passo="bloqueio"]', secao),
    2: form
  };

  /* ============================ ORIGEM DA CAMPANHA ============================ */
  const CAMPOS_ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                         'gclid', 'gbraid', 'wbraid', 'fbclid'];
  const limpa = (v) => String(v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 200);

  const lerOrigem = () => {
    try {
      const o = JSON.parse(localStorage.getItem(CHAVE_ORIGEM) || 'null');
      if (o && Date.now() - o.ts < VALIDADE_ORIGEM) return o;
    } catch (_) {}
    return {};
  };

  // Guarda a origem de quem chega com parâmetros de campanha (o último clique
  // vence). Assim ela não se perde se a pessoa recarregar ou voltar depois.
  (() => {
    const q = new URLSearchParams(location.search);
    if (!CAMPOS_ORIGEM.some((k) => q.get(k))) return;
    const o = { ts: Date.now(), pagina_entrada: location.pathname, referencia: limpa(document.referrer) };
    CAMPOS_ORIGEM.forEach((k) => { if (q.get(k)) o[k] = limpa(q.get(k)); });
    try { localStorage.setItem(CHAVE_ORIGEM, JSON.stringify(o)); } catch (_) {}
  })();

  const origemAtual = () => {
    const o = lerOrigem();
    const r = {};
    CAMPOS_ORIGEM.forEach((k) => { r[k] = o[k] || ''; });
    // sem gclid na URL, tenta o cookie que o vinculador de conversões do GTM grava
    if (!r.gclid) {
      const m = document.cookie.match(/(?:^|;\s*)_gcl_aw=([^;]+)/);
      if (m) r.gclid = limpa(decodeURIComponent(m[1]).split('.').slice(2).join('.'));
    }
    r.pagina_entrada = o.pagina_entrada || location.pathname;
    r.referencia = o.referencia || limpa(document.referrer);
    return r;
  };

  /* ============================ NAVEGAÇÃO ENTRE ETAPAS ============================ */
  let motivo = '';
  let servicoAuto = false; // o serviço marcado veio da etapa 1, não da pessoa
  let origemClique = 'formulario'; // qual botão da página trouxe a pessoa até aqui

  $$('[data-cta]').forEach((a) => a.addEventListener('click', () => { origemClique = a.dataset.cta || origemClique; }));

  const mostrar = (qual) => {
    Object.entries(passos).forEach(([k, el]) => { el.hidden = k !== String(qual); });
    const alvo = passos[qual];
    // leva a pessoa para o topo da etapa nova quando ela ficou fora da tela
    if (alvo.getBoundingClientRect().top < 0) secao.scrollIntoView({ block: 'start' });
    (qual === 1 ? $('.lf__opcao', alvo) : alvo).focus({ preventScroll: true });
  };

  $$('.lf__opcao', secao).forEach((b) => b.addEventListener('click', () => {
    motivo = b.dataset.motivo;
    const m = MOTIVOS[motivo];
    dl({ event: 'lp_triagem', resposta: motivo, qualificado: m.ok });

    if (!m.ok) {
      // as duas opções bloqueadas levam ao e-mail de parcerias, com o assunto de cada uma
      $('.lf__email', secao).href =
        `mailto:parcerias@elisangelaselauarquitetura.com.br?subject=${encodeURIComponent(m.assunto)}`;
      mostrar('bloqueio');
      return;
    }
    $('#lf-escolha').textContent = $('.lf__txt', b).textContent;
    form.elements.motivo.value = $('.lf__txt', b).textContent;
    // A resposta da etapa 1 já indica o serviço: deixa marcado, a pessoa pode
    // trocar. Se ela voltar e mudar a resposta, a marcação acompanha, a menos
    // que a escolha tenha sido dela.
    const marcado = form.querySelector('input[name="servico"]:checked');
    if (!marcado || servicoAuto) {
      if (marcado) marcado.checked = false;
      const r = m.servico && form.querySelector(`input[name="servico"][value="${m.servico}"]`);
      if (r) r.checked = true;
      servicoAuto = !!r;
    }
    mostrar(2);
  }));

  $$('[data-voltar]', secao).forEach((b) => b.addEventListener('click', () => mostrar(1)));

  /* ============================ WHATSAPP COM MÁSCARA ============================ */
  const whats = form.elements.whatsapp;
  const digitos = (v) => {
    let d = v.replace(/\D/g, '');
    if (d.length > 11 && d.startsWith('55')) d = d.slice(2); // colou com +55
    return d.slice(0, 11);
  };
  whats.addEventListener('input', () => {
    const d = digitos(whats.value);
    let f = d;
    if (d.length > 2) f = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 6) f = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    whats.value = f;
  });

  /* ============================ VALIDAÇÃO ============================ */
  const escolhido = (nome) => (form.querySelector(`input[name="${nome}"]:checked`) || {}).value || '';
  const regras = [
    ['nome',    () => form.elements.nome.value.trim().length >= 2],
    ['whatsapp',() => { const n = digitos(whats.value).length; return n === 10 || n === 11; }],
    ['cidade',  () => form.elements.cidade.value.trim().length >= 2],
    ['servico', () => !!escolhido('servico')],
    ['imovel',  () => !!escolhido('imovel')],
    ['momento', () => !!escolhido('momento')]
  ];
  const campoDe = (nome) => {
    const el = form.elements[nome];
    const um = el instanceof RadioNodeList ? el[0] : el;
    return um.closest('.field');
  };
  const validar = () => {
    let primeiro = null;
    regras.forEach(([nome, ok]) => {
      const valido = ok();
      campoDe(nome).toggleAttribute('data-invalid', !valido);
      if (!valido && !primeiro) primeiro = nome;
    });
    return primeiro;
  };
  // corrige o aviso assim que a pessoa conserta o campo
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (!f || !f.hasAttribute('data-invalid')) return;
    const r = regras.find(([nome]) => campoDe(nome) === f);
    if (r && r[1]()) f.removeAttribute('data-invalid');
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'servico') servicoAuto = false;
    const f = e.target.closest('.lf__grupo');
    if (f) f.removeAttribute('data-invalid');
  });

  /* ============================ ENVIO ============================ */
  const registrar = async (dados) => {
    const url = REGISTRO.web3formsKey ? 'https://api.web3forms.com/submit' : REGISTRO.url;
    if (!url) return;
    const corpo = REGISTRO.web3formsKey
      ? { access_key: REGISTRO.web3formsKey, subject: `Novo pedido pelo site: ${dados.nome}`,
          from_name: 'Site Elisângela Selau Arquitetura', ...dados }
      : dados;
    const pare = new AbortController();
    const limite = setTimeout(() => pare.abort(), 2500); // o registro nunca segura o lead
    try {
      await fetch(url, {
        method: 'POST', keepalive: true, signal: pare.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(corpo)
      });
    } catch (_) { /* segue para o WhatsApp mesmo sem registrar */ }
    clearTimeout(limite);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.apelido.value) return; // robô

    const invalido = validar();
    if (invalido) {
      $('#lf-status').textContent = 'Confira os campos destacados.';
      const el = form.elements[invalido];
      (el instanceof RadioNodeList ? el[0] : el).focus();
      return;
    }

    const origem = origemAtual();
    Object.entries(origem).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });

    const d = {
      nome: form.elements.nome.value.trim(),
      whatsapp: whats.value.trim(),
      cidade: form.elements.cidade.value.trim(),
      servico: escolhido('servico'),
      imovel: escolhido('imovel'),
      momento: escolhido('momento'),
      sobre: form.elements.sobre.value.trim(),
      motivo: form.elements.motivo.value
    };

    const mensagem =
      'Olá, Elisângela. Preenchi o formulário no site e gostaria de conversar sobre o meu projeto.\n\n' +
      `Nome: ${d.nome}\n` +
      `Cidade: ${d.cidade}\n` +
      `Serviço: ${d.servico}\n` +
      `Tipo de imóvel: ${d.imovel}\n` +
      `Previsão de início: ${d.momento}`;

    // resumo sem dado pessoal: é o que pode ir para o GTM
    const lead = {
      origem_clique: origemClique, motivo: d.motivo, servico: d.servico, tipo_imovel: d.imovel,
      momento: d.momento, cidade: d.cidade, ...origem
    };

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    $('#lf-status').textContent = 'Enviando.';
    dl({ event: 'lp_formulario_enviado', ...lead });

    // a mensagem viaja para a página de agradecimento pela sessão, nunca pela URL:
    // dado pessoal na URL acaba no relatório de páginas do Analytics
    try {
      sessionStorage.setItem(CHAVE_MSG, mensagem);
      sessionStorage.setItem(CHAVE_LEAD, JSON.stringify(lead));
    } catch (_) {
      // sessão bloqueada: window.name sobrevive à navegação na mesma aba e a
      // página de agradecimento apaga logo depois de ler
      window.name = `elis_lp:${JSON.stringify({ msg: mensagem, lead })}`;
    }

    await registrar({ ...d, ...origem, origem_clique: origemClique, enviado_em: new Date().toISOString() });
    location.href = `${OBRIGADO}?c=${encodeURIComponent(origemClique)}`;
  });
})();
