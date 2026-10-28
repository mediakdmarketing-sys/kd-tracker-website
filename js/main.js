// ============================================================
//  Site settings: change these in one place.
// ============================================================
const SITE = {
  brand: 'WorkBuddy',                       // product name shown everywhere (elements with data-brand)
  appUrl: 'https://app.example.com/login',  // where "Sign in" goes: your deployed web app
  contactEmail: 'hello@example.com',        // where the demo form sends mail (opens the visitor's email app)
};

document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Brand name + app links
$$('[data-brand]').forEach((el) => (el.textContent = SITE.brand));
$$('[data-app-link]').forEach((a) => (a.href = SITE.appUrl));
document.title = document.title.replace('WorkBuddy', SITE.brand);
$('#year').textContent = new Date().getFullYear();

// ------------------------------------------------------------
//  Navigation: pill shadow, mobile menu, scroll-spy
// ------------------------------------------------------------
const nav = $('#nav');
const burger = $('#burger');
const links = $('#nav-links');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});
const spy = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) $$('[data-spy]').forEach((a) => a.classList.toggle('active', a.dataset.spy === e.target.id));
  }),
  { rootMargin: '-45% 0px -50% 0px' }
);
$$('[data-spy]').forEach((a) => { const t = document.getElementById(a.dataset.spy); if (t) spy.observe(t); });

// ------------------------------------------------------------
//  Marquee: duplicate the list so the loop is seamless
// ------------------------------------------------------------
const mList = $('#marquee-list');
if (mList) {
  const clone = mList.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  mList.parentElement.appendChild(clone);
}

// ------------------------------------------------------------
//  Masked word-by-word headlines
// ------------------------------------------------------------
let nowIndex = 0;
function splitWords(el) {
  let i = el.hasAttribute('data-now') ? nowIndex : 0;
  const walk = (node) => {
    [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.textContent = tok;
          wi.style.setProperty('--wd', `${i * 75}ms`);
          i += 1;
          w.appendChild(wi);
          frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) walk(ch);
    });
  };
  walk(el);
  if (el.hasAttribute('data-now')) nowIndex = i;
  else el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
}
if (!reduce) $$('[data-split]').forEach(splitWords);

// ------------------------------------------------------------
//  Reveal on scroll
// ------------------------------------------------------------
$$('.cards, .steps, .plans, .plats, .trust, .strip-grid').forEach((group) =>
  $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`))
);
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }),
  { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
);
$$('.reveal, [data-split]:not([data-now]), .timeline').forEach((el) => (reduce ? el.classList.add('in') : io.observe(el)));
// the hero headline plays as soon as the fonts are ready
const playHero = () => $$('[data-now]').forEach((el) => el.classList.add('in'));
if (reduce) playHero();
else Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(() => setTimeout(playHero, 150));

// ------------------------------------------------------------
//  Count-up numbers and live clocks
// ------------------------------------------------------------
function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (reduce) { el.textContent = target + suffix; return; }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / 1400);
    el.textContent = Math.round(target * easeOut(p)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const counters = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); counters.unobserve(e.target); } }),
  { threshold: 0.6 }
);
$$('[data-count]').forEach((el) => counters.observe(el));

const pad = (n) => String(n).padStart(2, '0');
const clocks = $$('[data-clock]').map((el) => {
  const [h, m, s] = el.dataset.clock.split(':').map(Number);
  return { el, secs: h * 3600 + m * 60 + s, paused: el.hasAttribute('data-paused') };
});
if (!reduce) {
  setInterval(() => clocks.forEach((c) => {
    if (c.paused) return;
    c.secs += 1;
    c.el.textContent = `${pad(Math.floor(c.secs / 3600))}:${pad(Math.floor((c.secs % 3600) / 60))}:${pad(c.secs % 60)}`;
  }), 1000);
}

// ------------------------------------------------------------
//  Role tabs (arrow keys supported)
// ------------------------------------------------------------
const tabs = $$('[role="tab"]');
function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  tab.focus({ preventScroll: true });
}
tabs.forEach((t, i) => {
  t.tabIndex = i === 0 ? 0 : -1;
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (dir) selectTab(tabs[(i + dir + tabs.length) % tabs.length]);
  });
});

// ------------------------------------------------------------
//  Demo form: opens the visitor's email app with the details filled in
// ------------------------------------------------------------
const form = $('#contact-form');
const note = $('#form-note');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const bad = [];
  $$('input', form).forEach((i) => i.classList.remove('bad'));
  if (!data.name.trim()) bad.push(form.elements.name);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) bad.push(form.elements.email);
  if (bad.length) {
    bad.forEach((i) => i.classList.add('bad'));
    note.className = 'form-note err';
    note.textContent = 'Please enter your name and a valid work email.';
    bad[0].focus();
    return;
  }
  const body = [`Name: ${data.name}`, `Email: ${data.email}`, `Team size: ${data.size}`, '', data.message || ''].join('\n');
  window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`${SITE.brand} demo request`)}&body=${encodeURIComponent(body)}`;
  note.className = 'form-note';
  note.textContent = 'Thanks! Your email app should open with the request ready to send.';
});

// ============================================================
//  Scroll and pointer motion (skipped for reduced motion)
//   - layers drift at different speeds (data-speed) and shift with the
//     pointer in the hero (data-depth)
//   - ghost words slide sideways (data-dx)
//   - the product preview rises and flattens as you scroll through it
//   - the clock hands turn with the "how it works" section
//   - the honeycomb in the privacy section lights up around the pointer
// ============================================================
const bar = $('#progress');
const hero = $('.hero');
const layers = $$('[data-speed], [data-depth]').map((el) => ({
  el, speed: Number(el.dataset.speed || 0), depth: Number(el.dataset.depth || 0), root: el.closest('section') || el,
}));
const ghosts = $$('[data-dx]').map((el) => ({ el, dx: Number(el.dataset.dx), root: el.closest('section') }));
const showcase = $('#showcase');
const scene = $('#stage-scene');
const how = $('#how');
const handH = $('#hand-h');
const handM = $('#hand-m');
const privacy = $('#privacy');

let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
let spotX = null, spotY = null, lastSpotMove = 0, privacyVisible = false;
let queued = false;

function paint(now) {
  queued = false;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const damp = vw < 820 ? 0.5 : 1;
  smoothX += (pointerX - smoothX) * 0.08;
  smoothY += (pointerY - smoothY) * 0.08;

  nav.classList.toggle('scrolled', window.scrollY > 10);
  const max = document.documentElement.scrollHeight - vh;
  bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);

  for (const l of layers) {
    const r = l.root.getBoundingClientRect();
    if (r.bottom < -240 || r.top > vh + 240) continue;
    const inHero = l.root === hero;
    const y = (r.top + r.height / 2 - vh / 2) * l.speed * damp * -1 + (inHero ? smoothY * l.depth * 0.6 : 0);
    const x = inHero ? smoothX * l.depth : 0;
    l.el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
  }
  for (const g of ghosts) {
    const r = g.root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    g.el.style.translate = `${((r.top + r.height / 2 - vh / 2) * g.dx * damp).toFixed(1)}px 0`;
  }

  if (showcase && scene) {
    const r = showcase.getBoundingClientRect();
    const p = clamp01(-r.top / Math.max(1, r.height - vh));
    scene.style.setProperty('--e', easeOut(clamp01(p / 0.55)).toFixed(3));
  }
  if (how && handM) {
    const r = how.getBoundingClientRect();
    const p = clamp01((vh - r.top) / (vh + r.height));
    handM.style.transform = `rotate(${(p * 1080).toFixed(1)}deg)`;
    handH.style.transform = `rotate(${(p * 90).toFixed(1)}deg)`;
  }

  // honeycomb spotlight: follows the pointer, or wanders on its own when there is none
  if (privacy && privacyVisible) {
    const r = privacy.getBoundingClientRect();
    if (spotX === null || now - lastSpotMove > 2500) {
      const t = now / 1900;
      spotX = r.width * (0.5 + 0.34 * Math.sin(t));
      spotY = r.height * (0.5 + 0.3 * Math.sin(t * 1.3 + 1));
    }
    privacy.style.setProperty('--mx', `${spotX.toFixed(0)}px`);
    privacy.style.setProperty('--my', `${spotY.toFixed(0)}px`);
  }

  const settling = Math.abs(pointerX - smoothX) > 0.002 || Math.abs(pointerY - smoothY) > 0.002;
  if (settling || privacyVisible) request();
}
function request() {
  if (!queued) { queued = true; requestAnimationFrame(paint); }
}

if (reduce) {
  nav.classList.add('scrolled');
} else {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = hero.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    request();
  });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; request(); });

  if (privacy) {
    privacy.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = privacy.getBoundingClientRect();
      spotX = e.clientX - r.left;
      spotY = e.clientY - r.top;
      lastSpotMove = performance.now();
      request();
    });
    new IntersectionObserver((entries) => {
      privacyVisible = entries[0].isIntersecting;
      if (privacyVisible) request();
    }).observe(privacy);
  }
  request();
}
