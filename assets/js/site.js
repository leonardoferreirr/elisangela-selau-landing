/* Elisângela Selau Arquitetura — interações e motion (sem dependências) */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Entrega do formulário.
     Hoje a mensagem chega no WhatsApp do escritório já preenchida.
     Para receber por e-mail, basta preencher ENDPOINT com a URL de um
     serviço de formulário (Web3Forms, Formspree e similares).
     ------------------------------------------------------------------ */
  const WHATS    = '5554984026936';
  const ENDPOINT = '';

  /* ============================ NAV ============================ */
  const nav = $('#nav');
  const stick = () => nav.toggleAttribute('data-stuck', scrollY > 24);
  stick();
  addEventListener('scroll', stick, { passive: true });

  const burger = $('#burger');
  const drawer = $('#drawer');
  const setDrawer = (open) => {
    drawer.toggleAttribute('data-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(!drawer.hasAttribute('data-open')));
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  /* ============================ REVELAÇÃO ============================ */
  // escalona as linhas do título do hero
  $$('.hero__title .kin').forEach((l, i) => l.style.setProperty('--kd', `${0.12 + i * 0.12}s`));

  const alvos = $$('[data-rise],[data-mask],[data-draw],.kin');
  if (reduce || !('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    alvos.forEach((el) => io.observe(el));
  }

  /* ---- o arco desenhado ao lado do hero ---- */
  const traco = $('.hero__frame path');
  if (traco) {
    const len = Math.ceil(traco.getTotalLength());
    traco.style.setProperty('--len', len);
  }

  /* ============================ PARALLAX ============================ */
  if (!reduce) {
    const camadas = $$('[data-parallax]');
    let ticking = false;
    const mover = () => {
      camadas.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 .. 1
        el.style.transform = `translate3d(0, ${(p * 7).toFixed(2)}%, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(mover); }
    }, { passive: true });
    mover();
  }

  /* ============================ FITA DE SERVIÇOS ============================ */
  const fita = $('#ticker');
  if (fita) fita.innerHTML += fita.innerHTML;

  /* ============================ FEED DO INSTAGRAM ============================ */
  // montado só quando a seção se aproxima: as imagens não pesam no carregamento
  const feed = $('#feed');
  if (feed) {
    const montar = () => {
      const perfil = 'https://www.instagram.com/elisangelaselauarquitetura/';
      const itens = Array.from({ length: 14 }, (_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return `<a href="${perfil}" target="_blank" rel="noopener" aria-label="Ver o perfil no Instagram">
          <img src="assets/img/insta/i-${n}.webp" width="420" height="420" alt="" decoding="async"></a>`;
      }).join('');
      feed.innerHTML = itens + itens; // duplicado para o laço não ter emenda
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((e, o) => {
        if (e[0].isIntersecting) { montar(); o.disconnect(); }
      }, { rootMargin: '400px' });
      io2.observe(feed.parentElement);
    } else montar();
  }

  /* ============================ FORMULÁRIO ============================ */
  const form = $('#form');
  if (form) {
    const campo = (el) => el.closest('.field');
    const foneEl = $('#fone');

    // máscara leve de telefone
    foneEl.addEventListener('input', () => {
      const d = foneEl.value.replace(/\D/g, '').slice(0, 11);
      foneEl.value = d.length <= 2 ? d
        : d.length <= 6 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
        : d.length <= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
        : `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    });

    const valida = (el) => {
      const v = el.value.trim();
      let ok = true;
      if (el.hasAttribute('required') && !v) ok = false;
      if (ok && el.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (ok && el.id === 'fone' && v) ok = v.replace(/\D/g, '').length >= 10;
      campo(el)?.toggleAttribute('data-invalid', !ok);
      return ok;
    };

    $$('#nome,#fone,#email,#tipo', form).forEach((el) => {
      el.addEventListener('blur', () => valida(el));
      el.addEventListener('input', () => { if (campo(el)?.hasAttribute('data-invalid')) valida(el); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.apelido.value) return;                       // isca anti-robô

      const obrig = $$('#nome,#fone,#email,#tipo', form);
      const todosOk = obrig.map(valida).every(Boolean);
      if (!todosOk) {
        const primeiro = form.querySelector('[data-invalid] input,[data-invalid] select');
        primeiro?.focus({ preventScroll: true });
        primeiro?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        $('#status').textContent = 'Confira os campos destacados antes de enviar.';
        return;
      }

      const d = Object.fromEntries(new FormData(form).entries());
      const linhas = [
        'Olá, Elisângela! Vim pelo site e gostaria de um orçamento.', '',
        `Nome: ${d.nome}`,
        `WhatsApp: ${d.fone}`,
        `E-mail: ${d.email}`,
        d.cidade ? `Cidade: ${d.cidade}` : null,
        `Tipo de projeto: ${d.tipo}`,
        d.msg ? `\nSobre o projeto:\n${d.msg}` : null,
      ].filter(Boolean);
      const texto = linhas.join('\n');

      const botao = $('#enviar');
      botao.disabled = true;
      $('#status').textContent = 'Enviando…';

      if (ENDPOINT) {
        try {
          await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...d, mensagem: texto }),
          });
        } catch (_) { /* segue para a ponte mesmo assim */ }
      }

      try { sessionStorage.setItem('elis_msg', texto); } catch (_) {}
      location.href = 'obrigado.html?c=form';
    });
  }

  /* ============================ MIUDEZAS ============================ */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
