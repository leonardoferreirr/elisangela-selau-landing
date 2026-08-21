/* Elisângela Selau Arquitetura — interações e motion (sem dependências) */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Não há formulário: todo CTA vai para obrigado?c=<seção>, que dispara
     a conversão e redireciona para o WhatsApp do escritório. O número
     mora em obrigado.html, num lugar só.

     O link é sem o .html de propósito: com cleanUrls ligado no
     vercel.json, /obrigado.html redireciona para /obrigado e a query
     se perde no caminho, levando junto o contexto da conversão.
     ------------------------------------------------------------------ */

  /* ============================ NAV ============================ */
  const nav = $('#nav');
  // Ler scrollY dentro do handler força o layout a cada evento de rolagem:
  // 123ms de reflow acumulado na medição. Uma sentinela de 24px no topo da
  // página resolve o mesmo com zero trabalho na thread principal.
  const sentinela = document.createElement('div');
  sentinela.setAttribute('aria-hidden', 'true');
  sentinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  document.body.prepend(sentinela);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => nav.toggleAttribute('data-stuck', !e.isIntersecting),
      { threshold: 0 }
    ).observe(sentinela);
  } else {
    const stick = () => nav.toggleAttribute('data-stuck', scrollY > 24);
    stick();
    addEventListener('scroll', stick, { passive: true });
  }

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

  /* ============================ SLIDESHOW DO HERO ============================ */
  // Só no desktop. No celular o arco tem ~350px e as sete fotos extras custariam
  // meio mega de dados para caber num espaço onde mal se percebe a troca.
  // 900px é o mesmo corte em que o <picture> serve o hero-sm.
  const palco = matchMedia('(min-width:901px)').matches ? $('[data-slides]') : null;
  if (!palco) {
    // no celular as sete fotos extras nunca ganham src: ficavam sete <img>
    // vazias de 350x467 empilhadas em cima da foto do hero, invisíveis mas
    // ocupando nó e leitura de acessibilidade à toa.
    $$('.hero__slide[data-src]').forEach((s) => s.remove());
  }
  if (palco) {
    const slides = $$('.hero__slide', palco);
    // as fotos 2..8 só entram depois do load: não competem com o LCP da primeira
    const carregar = () => slides.forEach((s) => {
      const src = s.dataset.src;
      if (src) { s.src = src; delete s.dataset.src; }
    });
    if (document.readyState === 'complete') carregar();
    else addEventListener('load', carregar, { once: true });

    if (slides.length > 1 && !reduce) {
      let i = 0, timer = null;
      const passo = () => {
        slides[i].classList.remove('is-on');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-on');
      };
      const liga  = () => { timer ||= setInterval(passo, 4600); };
      const pausa = () => { clearInterval(timer); timer = null; };
      // para de girar fora da tela e em aba oculta, para não gastar bateria à toa
      new IntersectionObserver(
        ([e]) => (e.isIntersecting ? liga() : pausa()),
        { threshold: 0.25 }
      ).observe(palco);
      document.addEventListener('visibilitychange', () => (document.hidden ? pausa() : liga()));
    }
  }

  /* ============================ MIUDEZAS ============================ */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
