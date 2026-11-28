'use strict';
/* ================================================================
   HubPad — js/app.js
   Редактор в стиле GitHub. Полностью автономен, без сети.
   Подключается как классический скрипт: <script defer src="js/app.js">
   ================================================================ */
(function(){

/* ---------- утилиты ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA = s => esc(s).replace(/"/g,'&quot;');
const enc = new TextEncoder();
const bytesOf = s => enc.encode(s).length;
const uid = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
const debounce = (fn,ms) => { let t; const d=(...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),ms);}; d.cancel=()=>clearTimeout(t); return d; };
const plural = (n,f) => { n=Math.abs(n)%100; const d=n%10; if(n>10&&n<20)return f[2]; if(d>1&&d<5)return f[1]; if(d===1)return f[0]; return f[2]; };
const fmtSize = n => n<1024 ? n+' Б' : n<1048576 ? (n/1024).toFixed(1).replace('.',',')+' КБ' : (n/1048576).toFixed(2).replace('.',',')+' МБ';
const relTime = ts => { const d=Date.now()-ts; if(d<15000)return'только что'; if(d<60000)return Math.floor(d/1000)+' с назад';
  if(d<3600000)return Math.floor(d/60000)+' мин назад'; if(d<86400000)return Math.floor(d/3600000)+' ч назад';
  if(d<604800000)return Math.floor(d/86400000)+' дн назад'; return new Date(ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}); };
const extOf = n => { const i=n.lastIndexOf('.'); return i>0 ? n.slice(i+1).toLowerCase() : ''; };
const baseOf = n => { const i=n.lastIndexOf('.'); return i>0 ? n.slice(0,i) : n; };
const langOf = n => { const e=extOf(n);
  if(e==='html'||e==='htm')return'html'; if(e==='css')return'css'; if(e==='js'||e==='mjs'||e==='json')return'js';
  if(e==='svg'||e==='xml')return'html'; if(e==='md'||e==='markdown')return'md'; return'plain'; };
const LANG_LABEL = {html:'HTML', css:'CSS', js:'JavaScript', md:'Markdown', plain:'Text'};
const langLabel = n => extOf(n)==='svg' ? 'SVG' : extOf(n)==='json' ? 'JSON' : LANG_LABEL[langOf(n)];
const DOT = {html:'#e34c26', css:'#663399', js:'#f1e05a', md:'#083fa1', plain:'#8b949e'};
const dotColor = n => extOf(n)==='svg' ? '#ff9900' : DOT[langOf(n)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- иконки ---------- */
const P = (d,extra='') => '<path d="'+d+'" '+extra+'/>';
const IC = {
  search:'<circle cx="7" cy="7" r="4.5"/>'+P('m10.6 10.6 3.4 3.4'),
  sun:'<circle cx="8" cy="8" r="3"/>'+P('M8 1.2v1.8M8 13v1.8M1.2 8H3M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3'),
  moon:P('M13.5 9.5A6 6 0 1 1 6.5 2.5a5 5 0 0 0 7 7Z'),
  download:P('M8 2v8m0 0 3-3M8 10 5 7')+P('M2.5 11v2.5h11V11'),
  upload:P('M8 10V2m0 0L5 5m3-3 3 3')+P('M2.5 11v2.5h11V11'),
  external:P('M9.5 2.5h4v4')+P('M13.5 2.5 7.5 8.5')+P('M6 3.5H3.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10'),
  plus:P('M8 3v10M3 8h10'), x:P('m4 4 8 8m0-8-8 8'),
  chevD:P('m4 6 4 4 4-4'),
  file:P('M4 1.5h5.5L13 5v9.5H4Z')+P('M9.5 1.5V5H13'),
  folder:P('M1.5 3.5h4l1.5 2h7.5v8h-13Z'),
  code:P('m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5l3.5 3.5-3.5 3.5'),
  split:'<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>'+P('M9 2.5v11'),
  eye:P('M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z')+'<circle cx="8" cy="8" r="2"/>',
  phone:'<rect x="5" y="1.5" width="6" height="13" rx="1.5"/>'+P('M7.3 12.5h1.4'),
  tablet:'<rect x="2.5" y="2" width="11" height="12" rx="1.5"/>'+P('M7 12h2'),
  monitor:'<rect x="1.5" y="2.5" width="13" height="9" rx="1.5"/>'+P('M6 14h4M8 11.5V14'),
  refresh:P('M13.5 3v3.5H10')+P('M13.2 6.5A5.5 5.5 0 1 0 13.5 8'),
  undo:P('M3 6.5h6a4 4 0 0 1 0 8H6')+P('M6 3.5 3 6.5l3 3'),
  redo:P('M13 6.5H7a4 4 0 0 0 0 8h3')+P('m10 3.5 3 3-3 3'),
  wrap:P('M2.5 4h11M2.5 8h8.5a2.75 2.75 0 0 1 0 5.5H7')+P('M8.5 11.5 6.5 13.5l2 2'),
  pilcrow:P('M11 3.5H6.75a2.75 2.75 0 0 0 0 5.5H8.5')+P('M8.5 3.5v9.5M11 3.5v9.5'),
  copy:'<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/>'+P('M10.5 3.5v-1h-8v8h1'),
  paste:'<rect x="3.5" y="3.5" width="9" height="11" rx="1.5"/>'+P('M6 3.5V2h4v1.5')+P('M6 8h4M6 11h3'),
  check:P('m3 8.5 3.5 3.5L13 5'),
  trash:P('M2.5 4.5h11M6.5 2.5h3M4 4.5l.7 9h6.6l.7-9')+P('M6.5 7v4M9.5 7v4'),
  pencil:P('m11.5 2.5 2 2-8 8-2.5.5.5-2.5Z'),
  dots:'<circle cx="3.5" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
  grip:'<circle cx="5.5" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="5.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="12" r="1" fill="currentColor" stroke="none"/>',
  info:'<circle cx="8" cy="8" r="6.5"/>'+P('M8 7.5v3.5')+'<circle cx="8" cy="5" r=".9" fill="currentColor" stroke="none"/>',
  star:P('M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z'),
  alert:P('M8 2 14.5 13.5h-13Z')+P('M8 6.5v3')+'<circle cx="8" cy="11.6" r=".8" fill="currentColor" stroke="none"/>',
  checkCircle:'<circle cx="8" cy="8" r="6.5"/>'+P('m5 8.2 2.2 2.2L11.2 6'),
  xCircle:'<circle cx="8" cy="8" r="6.5"/>'+P('m5.8 5.8 4.4 4.4m0-4.4-4.4 4.4'),
  keyboard:'<rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>'+P('M4 6.5h1M7.5 6.5h1M11 6.5h1M4 9.5h1M7.5 9.5h1M11 9.5h1M5.5 12h5'),
  archive:'<rect x="1.5" y="2.5" width="13" height="3.5" rx="1"/>'+P('M3 6v7.5h10V6')+P('M6.5 8.5h3'),
  sidebar:'<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>'+P('M6 2.5v11'),
  link:P('M6.5 9.5 9.5 6.5')+P('M7 4.5 8.5 3a2.5 2.5 0 0 1 3.5 3.5L10.5 8')+P('M9 11.5 7.5 13A2.5 2.5 0 0 1 4 9.5L5.5 8'),
  branch:'<circle cx="4.5" cy="3.5" r="1.8"/><circle cx="4.5" cy="12.5" r="1.8"/><circle cx="11.5" cy="3.5" r="1.8"/>'+P('M4.5 5.3v5.4M11.5 5.5c0 3.5-7 2.5-7 5.2'),
  clock:'<circle cx="8" cy="8" r="6.5"/>'+P('M8 4.5V8l2.5 1.5')
};
const ic = (n,s=16) => '<svg width="'+s+'" height="'+s+'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
const LOGO = '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="hlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58a6ff"/><stop offset=".55" stop-color="#a371f7"/><stop offset="1" stop-color="#db61a2"/></linearGradient></defs><rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="url(#hlg)"/><path d="M9.5 8.5 6 12l3.5 3.5M14.5 8.5 18 12l-3.5 3.5" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- демо-проект ---------- */
function seedFiles(){
  const now = Date.now();
  const mk = (id,name,content,age) => ({id,name,content,bytes:bytesOf(content),createdAt:now-age-86400000,updatedAt:now-age});
  const index = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulse — трекер привычек</title>
  <link rel="icon" href="logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  \x3c!-- Фоновые световые пятна --\x3e
  <div class="glow glow-a"></div>
  <div class="glow glow-b"></div>

  <header class="nav">
    <a class="brand" href="index.html"><img src="logo.svg" alt="" width="28" height="28">Pulse</a>
    <nav>
      <a href="index.html" class="active">Главная</a>
      <a href="about.html">О проекте</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <span class="chip">✦ Версия 2.0 — уже здесь</span>
      <h1>Привычки, которые<br><span class="grad">держатся дольше</span></h1>
      <p class="lead">Pulse превращает маленькие ежедневные действия в устойчивый ритм.
      Отмечайте дни, следите за сериями и не разрывайте цепочку.</p>
      <div class="actions">
        <a class="btn primary" href="about.html">Начать бесплатно</a>
        <button class="btn ghost" id="demoBtn" type="button">＋ Отметить день</button>
      </div>
      <div class="stats">
        <div class="stat"><b id="streak">12</b><span>дней подряд</span></div>
        <div class="stat"><b>94%</b><span>удержание</span></div>
        <div class="stat"><b>4,9★</b><span>оценка</span></div>
      </div>
    </section>

    <section class="grid">
      <article class="card"><span class="ico">🔥</span><h3>Серии</h3>
        <p>Огонёк горит, пока вы не пропускаете день. Простая мотивация, которая работает.</p></article>
      <article class="card"><span class="ico">📊</span><h3>Статистика</h3>
        <p>Тепловая карта года, лучшие серии и мягкие напоминания без давления.</p></article>
      <article class="card"><span class="ico">🌙</span><h3>Фокус-режим</h3>
        <p>Вечерний ритуал: одна привычка, один тап, ноль лишнего шума.</p></article>
    </section>
  </main>

  <footer>© <span id="year">2026</span> Pulse. Сделано с любовью к ритму.</footer>
  <script src="script.js"><\/script>
</body>
</html>`;
  const about = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>О проекте — Pulse</title>
  <link rel="icon" href="logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="glow glow-a"></div>
  <div class="glow glow-b"></div>

  <header class="nav">
    <a class="brand" href="index.html"><img src="logo.svg" alt="" width="28" height="28">Pulse</a>
    <nav>
      <a href="index.html">Главная</a>
      <a href="about.html" class="active">О проекте</a>
    </nav>
  </header>

  <main>
    <section class="hero small">
      <span class="chip">О проекте</span>
      <h1>Ритм важнее <span class="grad">интенсивности</span></h1>
      <p class="lead">Мы верим, что двадцать минут каждый день сильнее, чем три часа раз в месяц.
      Поэтому Pulse построен вокруг одной идеи — не разрывать цепочку.</p>
      <blockquote class="quote">«Мы — то, что мы делаем изо дня в день. Совершенство — не действие, а привычка.»</blockquote>
      <ul class="principles">
        <li>Один тап — одна отметка. Никаких форм и настроек.</li>
        <li>Пропустили день? Серия замораживается, а не сгорает.</li>
        <li>Данные остаются на устройстве. Всегда.</li>
      </ul>
      <div class="actions">
        <a class="btn primary" href="index.html">← На главную</a>
      </div>
    </section>
  </main>

  <footer>© <span id="year">2026</span> Pulse. Сделано с любовью к ритму.</footer>
  <script src="script.js"><\/script>
</body>
</html>`;
  const css = `/* Pulse — общие стили */
:root {
  --bg: #070b16;
  --fg: #e8ecf8;
  --muted: #93a0bd;
  --violet: #7c3aed;
  --cyan: #06b6d4;
  --line: rgba(255, 255, 255, 0.08);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.6 -apple-system, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}
.glow {
  position: fixed;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.45;
  pointer-events: none;
  animation: drift 14s ease-in-out infinite alternate;
}
.glow-a { background: var(--violet); top: -160px; left: -120px; }
.glow-b { background: var(--cyan); bottom: -180px; right: -140px; animation-delay: -7s; }
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(60px, 40px) scale(1.15); }
}
.nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(8px);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 19px;
  color: var(--fg);
  text-decoration: none;
  letter-spacing: -0.02em;
}
.nav nav { display: flex; gap: 18px; }
.nav nav a { color: var(--muted); text-decoration: none; font-size: 14px; }
.nav nav a:hover, .nav nav a.active { color: var(--fg); }
main { position: relative; max-width: 960px; margin: 0 auto; padding: 0 24px; }
.hero { text-align: center; padding: 84px 0 40px; }
.hero.small { padding-top: 64px; }
.chip {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.16);
  border: 1px solid rgba(124, 58, 237, 0.4);
}
h1 {
  margin: 22px 0 14px;
  font-size: clamp(2.3rem, 6vw, 3.9rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.grad {
  background: linear-gradient(90deg, #a78bfa, #22d3ee, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lead { max-width: 560px; margin: 0 auto; color: var(--muted); font-size: 17px; }
.actions { display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
.btn {
  position: relative;
  padding: 12px 26px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 0;
  font-family: inherit;
}
.btn:hover { transform: translateY(-2px); }
.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, var(--violet), #2563eb);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.45);
}
.btn.ghost { color: var(--fg); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--line); }
.stats { display: flex; gap: 42px; justify-content: center; margin-top: 46px; flex-wrap: wrap; }
.stat b { display: block; font-size: 30px; letter-spacing: -0.02em; }
.stat span { color: var(--muted); font-size: 13px; }
#streak.pop { animation: pop 0.35s ease; display: inline-block; }
@keyframes pop { 40% { transform: scale(1.45); color: #34d399; } }
.spark {
  position: absolute;
  top: -4px;
  color: #34d399;
  pointer-events: none;
  animation: rise 0.7s ease-out forwards;
}
@keyframes rise {
  from { opacity: 1; transform: translate(0, 0); }
  to { opacity: 0; transform: translate(var(--dx), -46px); }
}
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 30px 0 70px; }
.card {
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  backdrop-filter: blur(6px);
  transition: transform 0.2s, border-color 0.2s;
}
.card:hover { transform: translateY(-4px); border-color: rgba(167, 139, 250, 0.5); }
.card .ico { font-size: 26px; }
.card h3 { margin: 12px 0 6px; font-size: 17px; }
.card p { margin: 0; color: var(--muted); font-size: 14px; }
.quote {
  margin: 30px auto;
  max-width: 520px;
  padding: 14px 22px;
  border-left: 3px solid var(--violet);
  background: rgba(124, 58, 237, 0.08);
  border-radius: 0 12px 12px 0;
  color: var(--muted);
  font-style: italic;
  text-align: left;
}
.principles { max-width: 460px; margin: 26px auto 0; padding: 0; list-style: none; text-align: left; }
.principles li { padding: 8px 0 8px 30px; position: relative; color: var(--muted); }
.principles li::before { content: "✓"; position: absolute; left: 0; color: #34d399; font-weight: 700; }
footer {
  position: relative;
  padding: 26px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  border-top: 1px solid var(--line);
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
  .hero { padding-top: 56px; }
  .stats { gap: 26px; }
}
@media (prefers-reduced-motion: reduce) {
  .glow, .spark, #streak.pop { animation: none; }
}`;
  const js = `// Pulse — немного интерактива для демо
(function () {
  var streak = 12;
  var btn = document.getElementById('demoBtn');
  var out = document.getElementById('streak');
  var year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();
  if (!btn || !out) return;

  btn.addEventListener('click', function () {
    streak += 1;
    out.textContent = streak;
    out.classList.remove('pop');
    void out.offsetWidth; // перезапуск анимации
    out.classList.add('pop');
    for (var i = 0; i < 6; i++) spark(btn);
  });

  function spark(host) {
    var s = document.createElement('span');
    s.className = 'spark';
    s.textContent = '✦';
    s.style.left = 20 + Math.random() * 60 + '%';
    s.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    host.appendChild(s);
    setTimeout(function () { s.remove(); }, 700);
  }
})();`;
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#g)"/>
  <path d="M12 34h10l5-14 8 26 6-18 3 6h8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  const readme = `# Pulse — демо-проект HubPad

Небольшой многостраничный сайт, который живёт прямо в редакторе.
Отредактируйте \`styles.css\` — предпросмотр обновится сам.

## Файлы

- \`index.html\` — главная страница
- \`about.html\` — страница «О проекте»
- \`styles.css\` — общие стили
- \`script.js\` — счётчик серии и искры
- \`logo.svg\` — логотип

## Как попробовать

1. Нажмите **Открыть ↗** — сайт откроется в новой вкладке.
2. Перейдите по ссылке «О проекте» — работает даже там.
3. Скачайте файл под своим именем или весь проект как \`.zip\`.

> Совет: \`Ctrl+K\` открывает палитру команд.

## Каркас

\`\`\`html
<section class="hero">
  <h1>Привычки, которые держатся</h1>
</section>
\`\`\`

Сделано в **HubPad** — редакторе в стиле GitHub.`;
  return [
    mk('seed-index','index.html',index, 2*60000),
    mk('seed-about','about.html',about, 9*60000),
    mk('seed-css','styles.css',css, 5*60000),
    mk('seed-js','script.js',js, 26*3600000),
    mk('seed-logo','logo.svg',logo, 3*86400000),
    mk('seed-readme','README.md',readme, 4*86400000)
  ];
}

/* ---------- состояние ---------- */
const KEY = 'hubpad.v1';
const DEFAULT_PREFS = {theme:'dark', font:13, wrap:false, ws:false, tab:2, layout:'split', sbWidth:264, pvWidth:46,
  sort:'manual', auto:true, device:'auto', starred:false, sidebar:true};
const S = {
  files:[], order:[], tabs:[], active:null, prefs:{...DEFAULT_PREFS},
  pv:{target:null, stale:false},
  bulk:new Set(), filter:'', problems:[],
  view:new Map(), hist:new Map(), composing:false, storageOK:true, firstRun:false
};
const fileById = id => S.files.find(f=>f.id===id) || null;
const activeFile = () => fileById(S.active);
const findByName = n => S.files.find(f=>f.name.toLowerCase()===String(n).toLowerCase()) || null;

function loadState(){
  let raw = null;
  try{ raw = localStorage.getItem(KEY); }catch(e){ S.storageOK=false; }
  if(raw){
    try{
      const d = JSON.parse(raw);
      if(d && Array.isArray(d.files)){
        S.files = d.files.filter(f=>f && f.id && typeof f.name==='string' && typeof f.content==='string')
          .map(f=>({id:f.id,name:f.name,content:f.content.replace(/\r\n?/g,'\n'),bytes:bytesOf(f.content),createdAt:f.createdAt||Date.now(),updatedAt:f.updatedAt||Date.now()}));
        const ids = new Set(S.files.map(f=>f.id));
        S.order = (d.order||[]).filter(id=>ids.has(id));
        S.files.forEach(f=>{ if(!S.order.includes(f.id)) S.order.push(f.id); });
        S.tabs = (d.tabs||[]).filter(id=>ids.has(id));
        S.active = ids.has(d.active) ? d.active : (S.tabs[0]||null);
        S.prefs = {...DEFAULT_PREFS, ...(d.prefs||{})};
        S.pv.target = ids.has(d.pvTarget) ? d.pvTarget : null;
        return;
      }
    }catch(e){}
  }
  S.firstRun = true;
  S.files = seedFiles();
  S.order = S.files.map(f=>f.id);
  S.tabs = ['seed-index','seed-css','seed-js'];
  S.active = 'seed-index';
  S.pv.target = 'seed-index';
}
function persistNow(){
  if(!S.storageOK) return;
  try{
    localStorage.setItem(KEY, JSON.stringify({
      v:1, files:S.files.map(f=>({id:f.id,name:f.name,content:f.content,createdAt:f.createdAt,updatedAt:f.updatedAt})),
      order:S.order, tabs:S.tabs, active:S.active, prefs:S.prefs, pvTarget:S.pv.target
    }));
    setSaved('ok');
  }catch(e){
    S.storageOK=false; setSaved('off');
    toast('warn','Автосохранение недоступно — изменения живут только в этой вкладке');
  }
}
const scheduleSave = debounce(()=>{ persistNow(); updateSidebarMeta(); }, 500);
function markDirty(){ setSaved('saving'); scheduleSave(); }
function setSaved(state){
  const dot=$('#stDot'), txt=$('#stSavedTxt');
  if(!dot||!txt) return;
  dot.className='st-dot'+(state==='saving'?' saving':state==='off'?' off':'');
  txt.textContent = state==='saving'?'Сохранение…':state==='off'?'Только в памяти':'Сохранено';
}

/* ---------- подсветка синтаксиса ---------- */
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const JS_KW = new Set(('const let var function return if else for while do break continue new class extends super this typeof instanceof in of try catch finally throw switch case default delete void yield async await static get set import export from').split(' '));
const JS_CONST = new Set(['true','false','null','undefined','NaN','Infinity']);

function tagTokens(tag){
  const out=[]; const m = tag.match(/^(\x3c\/?)([\w:-]+)([\s\S]*?)(\/?>)?$/);
  if(!m) return [{t:tag,c:'pun'}];
  out.push({t:m[1],c:'pun'},{t:m[2],c:'tag'});
  const attrs=m[3]||''; const re=/(\s+)|("[^"]*"?|'[^']*'?)|(=)|(\/)|([^\s"'=<>\/]+)/g;
  let lastEq=false, mm;
  while((mm=re.exec(attrs))){
    if(mm[1]) out.push({t:mm[1],c:''});
    else if(mm[2]){ out.push({t:mm[2],c:'str'}); lastEq=false; }
    else if(mm[3]){ out.push({t:'=',c:'pun'}); lastEq=true; }
    else if(mm[4]) out.push({t:'/',c:'pun'});
    else { out.push({t:mm[5],c:lastEq?'str':'attr'}); lastEq=false; }
  }
  if(m[4]) out.push({t:m[4],c:'pun'});
  return out;
}
function tokHTML(src){
  const out=[];
  const re=/\x3c!--[\s\S]*?(?:--\x3e|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|\x3c(script|style)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?(?:\x3c\/\1\s*>|$)|\x3c\/?[a-zA-Z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>?|&[a-zA-Z#\d]+;|[^<&]+|[<&]/g;
  let m;
  while((m=re.exec(src))){
    const t=m[0];
    if(t.startsWith('\x3c!--')||t.startsWith('<![CDATA[')) out.push({t,c:'com'});
    else if(t.startsWith('<!')) out.push({t,c:'meta'});
    else if(m[1]){
      const lang=m[1].toLowerCase();
      const open=t.match(/^\x3c(?:script|style)\b(?:[^>"']|"[^"]*"|'[^']*')*>/i)[0];
      const closeM=t.match(/\x3c\/(?:script|style)\s*>$/i);
      const close=closeM?closeM[0]:'';
      const inner=t.slice(open.length, t.length-close.length);
      out.push(...tagTokens(open));
      out.push(...(lang==='script'?tokJS(inner):tokCSS(inner)));
      if(close) out.push(...tagTokens(close));
    }
    else if(t[0]==='<') out.push(...tagTokens(t));
    else if(t[0]==='&') out.push({t,c:'const'});
    else out.push({t,c:''});
  }
  return out;
}
function tokCSS(src){
  const out=[]; let depth=0, paren=0, colon=false;
  const re=/\/\*[\s\S]*?(?:\*\/|$)|"[^"\n]*"?|'[^'\n]*'?|@[\w-]+|#[0-9a-fA-F]{3,8}\b|!important|-?(?:\d*\.)?\d+[a-z%]*|\w[\w-]*(?=\s*\()|[{}();:,]|[\w-]+|\s+|[\s\S]/g;
  let m;
  while((m=re.exec(src))){
    const t=m[0];
    if(t.startsWith('/*')) out.push({t,c:'com'});
    else if(t[0]==='"'||t[0]==="'") out.push({t,c:'str'});
    else if(t[0]==='@') out.push({t,c:'kw'});
    else if(t[0]==='#'&&/^#[0-9a-fA-F]{3,8}$/.test(t)) out.push({t,c:'const'});
    else if(t==='!important') out.push({t,c:'kw'});
    else if(/^-?[\d.]/.test(t)) out.push({t,c:'const'});
    else if(/^[\w-]+$/.test(t)&&/^\s*\(/.test(src.slice(re.lastIndex))) out.push({t,c:'fun'});
    else if(t==='{'){ depth++; colon=false; out.push({t,c:'pun'}); }
    else if(t==='}'){ depth=Math.max(0,depth-1); colon=false; out.push({t,c:'pun'}); }
    else if(t==='('){ paren++; out.push({t,c:'pun'}); }
    else if(t===')'){ paren=Math.max(0,paren-1); out.push({t,c:'pun'}); }
    else if(t===':'){ colon=true; out.push({t,c:'pun'}); }
    else if(t===';'||t===','){ colon=false; out.push({t,c:'pun'}); }
    else if(/^[\w-]+$/.test(t)){
      if(depth>0||paren>0){ out.push({t,c:colon?'const':'attr'}); }
      else out.push({t,c:'tag'});
    }
    else if(/^\s+$/.test(t)) out.push({t,c:''});
    else out.push({t,c:'pun'});
  }
  return out;
}
function tokJS(src){
  const out=[];
  const re=/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|`(?:\\[\s\S]|[^\\`])*`?|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|\b(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?)\b|[A-Za-z_$][\w$]*|=>|[{}()\[\];,.]|[+\-*\/%<>=!&|?:]+|\s+|[\s\S]/g;
  let m;
  while((m=re.exec(src))){
    const t=m[0];
    if(t.startsWith('//')||t.startsWith('/*')) out.push({t,c:'com'});
    else if(t[0]==='"'||t[0]==="'"||t[0]==='`') out.push({t,c:'str'});
    else if(/^[\d]/.test(t)) out.push({t,c:'const'});
    else if(/^[A-Za-z_$]/.test(t)){
      if(JS_KW.has(t)) out.push({t,c:'kw'});
      else if(JS_CONST.has(t)) out.push({t,c:'const'});
      else if(/^\s*\(/.test(src.slice(re.lastIndex))) out.push({t,c:'fun'});
      else out.push({t,c:''});
    }
    else if(/^[{}()\[\];,.]$/.test(t)) out.push({t,c:'pun'});
    else if(/^[+\-*\/%<>=!&|?:]+$/.test(t)) out.push({t,c:'kw'});
    else if(/^\s+$/.test(t)) out.push({t,c:''});
    else out.push({t,c:''});
  }
  return out;
}
function tokensToLines(toks){
  const lines=[''];
  for(const {t,c} of toks){
    const parts=t.split('\n');
    for(let i=0;i<parts.length;i++){
      if(i>0) lines.push('');
      const p=parts[i]; if(!p) continue;
      const h=esc(p);
      lines[lines.length-1]+= c ? '<span class="tk-'+c+'">'+h+'</span>' : h;
    }
  }
  return lines;
}
function mdLines(src){
  let fence=false;
  return src.split('\n').map(line=>{
    if(/^\s*```/.test(line)){ fence=!fence; return '<span class="tk-str">'+esc(line)+'</span>'; }
    if(fence) return '<span class="tk-str">'+esc(line)+'</span>';
    if(/^#{1,6}\s/.test(line)) return '<span class="tk-h">'+esc(line)+'</span>';
    if(/^\s*>/.test(line)) return '<span class="tk-com">'+esc(line)+'</span>';
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(line)) return '<span class="tk-pun">'+esc(line)+'</span>';
    let h=esc(line);
    h=h.replace(/`[^`]+`/g, m=>'<span class="tk-str">'+m+'</span>');
    h=h.replace(/\*\*[^*]+\*\*/g, m=>'<span class="tk-b">'+m+'</span>');
    h=h.replace(/(^|[\s(])\*[^*\s][^*]*\*/g, m=>'<span class="tk-i">'+m+'</span>');
    h=h.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<span class="tk-attr">[$1]</span><span class="tk-str">($2)</span>');
    h=h.replace(/^(\s*)([-*+]|\d+\.)(\s)/, '$1<span class="tk-kw">$2</span>$3');
    return h;
  });
}
function wsMark(html){
  if(!S.prefs.ws||!html) return html;
  return html.split(/(<[^>]*>)/g).map(seg=>{
    if(seg[0]==='<') return seg;
    return seg.replace(/(\t+)|( +)/g,(m,t,s)=>t
      ? '<span class="ws-t">'+t+'</span>'
      : '<span class="ws-s">'+s+'</span>');
  }).join('');
}
function highlight(content, lang){
  if(lang==='md') return mdLines(content);
  if(lang==='plain') return content.split('\n').map(esc);
  const toks = lang==='css' ? tokCSS(content) : lang==='js' ? tokJS(content) : tokHTML(content);
  return tokensToLines(toks);
}

/* ---------- быстрая проверка ---------- */
function lineStartsOf(s){ const a=[0]; for(let i=0;i<s.length;i++) if(s[i]==='\n') a.push(i+1); return a; }
function idxToLine(starts, idx){ let lo=0, hi=starts.length-1; while(lo<hi){ const mid=(lo+hi+1)>>1; if(starts[mid]<=idx) lo=mid; else hi=mid-1; } return lo; }
function checkHTML(src){
  const issues=[]; const starts=lineStartsOf(src); const stack=[];
  const re=/\x3c!--[\s\S]*?(?:--\x3e|$)|<![^>]*>|\x3c(script|style)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?(?:\x3c\/\1\s*>|$)|\x3c(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  while((m=re.exec(src)) && issues.length<30){
    if(m[2]===undefined) continue;
    const closing=m[2]==='/'; const name=m[3].toLowerCase(); const self=/\/\s*$/.test(m[4]||'');
    const line=idxToLine(starts,m.index)+1;
    if(closing){
      const at=stack.map(s=>s.name).lastIndexOf(name);
      if(at===-1){ issues.push({line,msg:'Лишний закрывающий тег </'+name+'>'}); }
      else{
        for(let i=stack.length-1;i>at;i--) issues.push({line:stack[i].line,msg:'Не закрыт тег <'+stack[i].name+'>'});
        stack.length=at;
      }
    } else if(!self && !VOID.has(name)) stack.push({name,line});
  }
  stack.slice(0,Math.max(0,30-issues.length)).forEach(s=>issues.push({line:s.line,msg:'Не закрыт тег <'+s.name+'>'}));
  return issues;
}
function checkBrackets(src, lang){
  const issues=[]; const starts=lineStartsOf(src); const stack=[];
  const pairs={')':'(',']':'[','}':'{'};
  const re = lang==='css'
    ? /\/\*[\s\S]*?(?:\*\/|$)|"[^"\n]*"?|'[^'\n]*'?|[{}]|[\s\S]/g
    : /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|`(?:\\[\s\S]|[^\\`])*`?|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|[{}()\[\]]|[\s\S]/g;
  let m;
  while((m=re.exec(src)) && issues.length<30){
    const t=m[0]; if(t.length!==1||!'{}()[]'.includes(t)) continue;
    const line=idxToLine(starts,m.index)+1;
    if(t==='('||t==='['||t==='{') stack.push({t,line});
    else{
      const top=stack[stack.length-1];
      if(top && top.t===pairs[t]) stack.pop();
      else issues.push({line,msg:'Непарная скобка «'+t+'»'});
    }
  }
  stack.slice(0,Math.max(0,30-issues.length)).forEach(s=>issues.push({line:s.line,msg:'Не закрыта скобка «'+s.t+'»'}));
  return issues;
}
function runCheck(){
  const f=activeFile();
  if(!f){ S.problems=[]; renderProblemsChip(); return; }
  const lang=langOf(f.name);
  try{
    S.problems = lang==='html' ? checkHTML(f.content) : (lang==='css'||lang==='js') ? checkBrackets(f.content,lang) : [];
  }catch(e){ S.problems=[]; }
  renderProblemsChip();
  if(popKind==='prob') fillProblems();
}
const scheduleCheck = debounce(runCheck, 600);

/* ---------- сборка предпросмотра / деплой ---------- */
function getAttr(tag, name){
  const re=new RegExp('\\b'+name+'\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s"\'>]+))','i');
  const m=tag.match(re);
  return m ? (m[2]!==undefined?m[2]:m[3]!==undefined?m[3]:m[4]) : null;
}
const normRef = h => String(h||'').trim().replace(/^\.\//,'').split(/[?#]/)[0];
const svgUri = f => 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(f.content);

function inlineAssets(html){
  html = html.replace(/\x3clink\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, m=>{
    const href=getAttr(m,'href'); if(!href) return m;
    const f=findByName(normRef(href)); if(!f) return m;
    const rel=getAttr(m,'rel')||'';
    if(/stylesheet/i.test(rel) && extOf(f.name)==='css')
      return '<style data-hubpad="'+escA(f.name)+'">\n'+f.content.replace(/\x3c\/style/gi,'<\\/style')+'\n</style>';
    if(/icon/i.test(rel) && extOf(f.name)==='svg')
      return '<link rel="icon" type="image/svg+xml" href="'+escA(svgUri(f))+'">';
    return m;
  });
  html = html.replace(/\x3cscript\b(?:[^>"']|"[^"]*"|'[^']*')*>\s*\x3c\/script\s*>/gi, m=>{
    const src=getAttr(m,'src'); if(!src) return m;
    const f=findByName(normRef(src)); if(!f || !['js','mjs'].includes(extOf(f.name))) return m;
    const mod=/type\s*=\s*["']?module/i.test(m)?' type="module"':'';
    return '<script'+mod+' data-hubpad="'+escA(f.name)+'">\n'+f.content.replace(/\x3c\/script/gi,'<\\/script')+'\n<\/script>';
  });
  html = html.replace(/\x3cimg\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, m=>{
    const src=getAttr(m,'src'); if(!src) return m;
    const f=findByName(normRef(src)); if(!f || extOf(f.name)!=='svg') return m;
    return m.replace(src, svgUri(f));
  });
  return html;
}
/* Роутер развёрнутого сайта. ВАЖНО: функция сериализуется через toString()
   и внедряется в другой документ — она не должна ссылаться на внешние
   переменные, импорты или хелперы этого модуля. */
function deployBootstrap(){
  var MAP=null;
  try{
    if(location.hash.length>1){ MAP=JSON.parse(decodeURIComponent(location.hash.slice(1))); try{window.name=JSON.stringify(MAP);}catch(e){}
      try{history.replaceState(null,'',location.href.split('#')[0]);}catch(e){} }
    else if(window.name && window.name.charAt(0)==='{') MAP=JSON.parse(window.name);
  }catch(e){}
  if(!MAP) return;
  document.addEventListener('click',function(e){
    var a=e.target && e.target.closest ? e.target.closest('a[href]') : null; if(!a) return;
    var h=a.getAttribute('href')||'';
    if(/^[a-z][a-z0-9+.-]*:/i.test(h) || h.charAt(0)==='#') return;
    var n=h.replace(/^\.\//,'').split(/[?#]/)[0];
    if(MAP[n]){ e.preventDefault();
      try{window.name=JSON.stringify(MAP);}catch(_){}
      document.open(); document.write(MAP[n]); document.close();
    }
  },true);
}
/* Навигация внутри iframe предпросмотра. Тоже сериализуется — держать автономной. */
function previewBootstrap(pages){
  document.addEventListener('click',function(e){
    var a=e.target && e.target.closest ? e.target.closest('a[href]') : null; if(!a) return;
    var h=a.getAttribute('href')||'';
    if(/^[a-z][a-z0-9+.-]*:/i.test(h) || h.charAt(0)==='#') return;
    var n=h.replace(/^\.\//,'').split(/[?#]/)[0];
    if(pages.indexOf(n)>-1){ e.preventDefault(); parent.postMessage({__hubpad:'nav',file:n},'*'); }
  },true);
}
function injectScript(html, code){
  const tag='\x3cscript>'+code+'\x3c/script>';
  const i=html.search(/\x3c\/body\s*>/i);
  return i>-1 ? html.slice(0,i)+tag+html.slice(i) : html+tag;
}
function mdRender(src){
  const fences=[];
  let s=src.replace(/```(\w*)\n([\s\S]*?)```/g,(m,lang,code)=>{
    fences.push('<pre><code>'+esc(code)+'</code></pre>'); return '\u0000F'+(fences.length-1)+'\u0000';
  });
  s=esc(s);
  const inline=t=>t
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>')
    .replace(/\[([^\]]*)\]\(([^)\s]*)\)/g,(m,txt,url)=>/^(javascript|data|vbscript):/i.test(url)?txt:'<a href="'+url+'" target="_blank" rel="noopener">'+txt+'</a>');
  const out=[]; let list=null, para=[], listItems=[];
  const flushP=()=>{ if(para.length){ out.push('<p>'+inline(para.join(' '))+'</p>'); para=[]; } };
  const flushList=()=>{ if(list){ out.push('<'+list+'>'+listItems.join('')+'</'+list+'>'); list=null; listItems=[]; } };
  for(const line of s.split('\n')){
    const fm=line.match(/^\u0000F(\d+)\u0000$/);
    if(fm){ flushP(); flushList(); out.push(fences[+fm[1]]); continue; }
    const h=line.match(/^(#{1,6})\s+(.*)$/);
    if(h){ flushP(); flushList(); const l=h[1].length; out.push('<h'+l+'>'+inline(h[2])+'</h'+l+'>'); continue; }
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(line)){ flushP(); flushList(); out.push('<hr>'); continue; }
    const q=line.match(/^\s*&gt;\s?(.*)$/);
    if(q){ flushP(); flushList(); out.push('<blockquote>'+inline(q[1])+'</blockquote>'); continue; }
    const ul=line.match(/^\s*[-*+]\s+(.*)$/), ol=line.match(/^\s*\d+\.\s+(.*)$/);
    if(ul||ol){ flushP(); const want=ul?'ul':'ol';
      if(list!==want){ flushList(); list=want; }
      listItems.push('<li>'+inline((ul||ol)[1])+'</li>'); continue; }
    if(!line.trim()){ flushP(); flushList(); continue; }
    flushList(); para.push(line.trim());
  }
  flushP(); flushList();
  return out.join('\n');
}
function mdDoc(f){
  const dark=S.prefs.theme==='dark';
  const c=dark?{bg:'#0d1117',fg:'#e6edf3',mut:'#8b949e',line:'#30363d',code:'rgba(110,118,129,.25)',pre:'#161b22',a:'#58a6ff'}
             :{bg:'#ffffff',fg:'#1f2328',mut:'#59636e',line:'#d0d7de',code:'rgba(175,184,193,.2)',pre:'#f6f8fa',a:'#0969da'};
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'
    +'body{margin:0;background:'+c.bg+';color:'+c.fg+';font:16px/1.6 -apple-system,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif}'
    +'.md{max-width:780px;margin:0 auto;padding:36px 30px}'
    +'h1,h2{border-bottom:1px solid '+c.line+';padding-bottom:.3em}h1{font-size:2em}h2{font-size:1.5em}h1,h2,h3{margin:24px 0 16px;line-height:1.25}'
    +'a{color:'+c.a+';text-decoration:none}a:hover{text-decoration:underline}'
    +'code{background:'+c.code+';padding:.2em .4em;border-radius:6px;font-size:85%;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    +'pre{background:'+c.pre+';border:1px solid '+c.line+';padding:16px;border-radius:8px;overflow:auto}pre code{background:none;padding:0;font-size:85%}'
    +'blockquote{margin:0 0 16px;padding:0 1em;border-left:4px solid '+c.line+';color:'+c.mut+'}'
    +'li{margin:.25em 0}hr{border:0;border-top:2px solid '+c.line+';margin:24px 0}p{margin:0 0 16px}'
    +'</style></head><body><article class="md">'+mdRender(f.content)+'</article></body></html>';
}
function svgDoc(f){
  const dark=S.prefs.theme==='dark';
  const bg=dark?'#0d1117':'#f6f8fa', sq=dark?'#161b22':'#eaeef2', fg=dark?'#8b949e':'#59636e', chip=dark?'#161b22':'#fff', line=dark?'#30363d':'#d0d7de';
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'
    +'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
    +'background:repeating-conic-gradient('+sq+' 0 25%, '+bg+' 0 50%) 0 0/26px 26px;font:13px -apple-system,"Segoe UI",sans-serif}'
    +'svg{max-width:72vmin;max-height:72vmin;filter:drop-shadow(0 10px 30px rgba(0,0,0,.3))}'
    +'.cap{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:'+chip+';border:1px solid '+line+';color:'+fg+';padding:4px 12px;border-radius:20px}'
    +'</style></head><body>'+f.content+'<span class="cap">'+esc(f.name)+' · '+fmtSize(f.bytes)+'</span></body></html>';
}
function previewTargetFile(){
  let t=fileById(S.pv.target);
  const ok=f=>f&&(['html','md'].includes(langOf(f.name))||extOf(f.name)==='svg');
  if(!ok(t)) t=S.files.find(ok)||null;
  return t;
}
function retargetPreview(){
  const f=activeFile();
  if(f){ const l=langOf(f.name); if(l==='html'||l==='md'||extOf(f.name)==='svg') S.pv.target=f.id; }
  const t=previewTargetFile(); S.pv.target=t?t.id:null;
}
function buildPreviewDoc(f){
  const lang=langOf(f.name);
  if(extOf(f.name)==='svg') return svgDoc(f);
  if(lang==='md') return mdDoc(f);
  let html=inlineAssets(f.content);
  const pages=S.files.filter(x=>langOf(x.name)==='html').map(x=>x.name);
  html=injectScript(html,'('+previewBootstrap.toString()+')('+JSON.stringify(pages)+');');
  return html;
}
function rebuildPreview(){
  const t=previewTargetFile();
  S.pv.target=t?t.id:null;
  const frame=$('#pvFrame'), empty=$('#pvEmpty'), stage=$('#pvStage');
  updateHeaderButtons();
  if(!t){ stage.hidden=true; empty.hidden=false; $('#pvTargetChip').hidden=true; S.pv.stale=false; $('#pvStale').hidden=true; return; }
  empty.hidden=true; stage.hidden=false;
  $('#pvTargetChip').hidden=false;
  $('#pvChipName').textContent=t.name;
  $('#pvChipDot').style.color=dotColor(t.name);
  $('#pvChipDot').style.background=dotColor(t.name);
  const a=activeFile();
  $('#pvTargetChip').title = a && a.id!==t.id && ['css','js'].includes(langOf(a.name))
    ? 'Предпросмотр: '+t.name+' (использует '+a.name+')' : 'Открыть '+t.name+' в редакторе';
  try{ $('#pvIframe').srcdoc=buildPreviewDoc(t); }catch(e){}
  S.pv.stale=false; $('#pvStale').hidden=true;
  frame.classList.remove('pv-pulse'); void frame.offsetWidth; frame.classList.add('pv-pulse');
  applyDevice();
}
const schedulePreview = debounce(()=>{ if(S.prefs.auto && S.prefs.layout!=='code') rebuildPreview(); }, 450);
function markPreviewStale(){
  S.pv.stale=true;
  if(S.prefs.auto && S.prefs.layout!=='code'){ schedulePreview(); }
  else $('#pvStale').hidden=false;
}
function applyDevice(){
  const d=S.prefs.device, stage=$('#pvStage'), frame=$('#pvFrame');
  $$('#pvDeviceSeg .seg-btn').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.device===d)));
  if(d==='auto'){ stage.classList.remove('framed'); frame.style.width='100%'; }
  else{ stage.classList.add('framed'); frame.style.width=d+'px'; }
}
window.addEventListener('message', e=>{
  const ifr=$('#pvIframe');
  if(!ifr||e.source!==ifr.contentWindow) return;
  if(e.data && e.data.__hubpad==='nav'){
    const f=findByName(e.data.file);
    if(f){ switchFile(f.id,{focus:false}); toast('info','Переход: '+f.name,{timeout:2200}); }
  }
});

/* ---------- ZIP (метод store) ---------- */
const CRC_TABLE=(()=>{ const t=new Uint32Array(256);
  for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0; } return t; })();
function crc32(b){ let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=CRC_TABLE[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function zipFiles(files, zipName){
  const chunks=[]; const central=[]; let offset=0;
  const d=new Date();
  const dosTime=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  const dosDate=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  for(const f of files){
    const nameB=enc.encode(f.name), data=enc.encode(f.content), crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true); lh.setUint16(4,20,true); lh.setUint16(6,0x0800,true);
    lh.setUint16(8,0,true); lh.setUint16(10,dosTime,true); lh.setUint16(12,dosDate,true);
    lh.setUint32(14,crc,true); lh.setUint32(18,data.length,true); lh.setUint32(22,data.length,true);
    lh.setUint16(26,nameB.length,true); lh.setUint16(28,0,true);
    chunks.push(new Uint8Array(lh.buffer),nameB,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true); ch.setUint16(4,20,true); ch.setUint16(6,20,true); ch.setUint16(8,0x0800,true);
    ch.setUint16(10,0,true); ch.setUint16(12,dosTime,true); ch.setUint16(14,dosDate,true);
    ch.setUint32(16,crc,true); ch.setUint32(20,data.length,true); ch.setUint32(24,data.length,true);
    ch.setUint16(28,nameB.length,true); ch.setUint32(42,offset,true);
    central.push(new Uint8Array(ch.buffer),nameB);
    offset+=30+nameB.length+data.length;
  }
  let cdSize=0; central.forEach(c=>cdSize+=c.length);
  const eo=new DataView(new ArrayBuffer(22));
  eo.setUint32(0,0x06054b50,true); eo.setUint16(8,files.length,true); eo.setUint16(10,files.length,true);
  eo.setUint32(12,cdSize,true); eo.setUint32(16,offset,true);
  const blob=new Blob([...chunks,...central,new Uint8Array(eo.buffer)],{type:'application/zip'});
  downloadBlob(zipName,blob);
}
function downloadBlob(name, blob){
  const u=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=u; a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),5000);
}

/* ---------- деплой в новую вкладку ---------- */
function deploy(){
  const t=previewTargetFile();
  if(!t){ toast('warn','Нет страницы для открытия — создайте HTML-файл'); return; }
  try{
    let url, note;
    if(langOf(t.name)==='html'){
      const pages=S.files.filter(f=>langOf(f.name)==='html');
      const boot='\x3cscript>('+deployBootstrap.toString()+')();\x3c/script>';
      const map={}; pages.forEach(f=>{ map[f.name]=injectScript(inlineAssets(f.content),boot); });
      const json=JSON.stringify(map);
      const blob=new Blob([map[t.name]],{type:'text/html'});
      url=URL.createObjectURL(blob);
      if(bytesOf(json)<1500000) url+='#'+encodeURIComponent(json);
      note = pages.length>1
        ? 'Сайт открыт в новой вкладке · '+pages.length+' '+plural(pages.length,['страница','страницы','страниц'])+', ссылки работают'
        : 'Страница «'+t.name+'» открыта в новой вкладке';
    }else{
      const blob=new Blob([buildPreviewDoc(t)],{type:'text/html'});
      url=URL.createObjectURL(blob);
      note='Предпросмотр «'+t.name+'» открыт в новой вкладке';
    }
    const w=window.open(url,'_blank');
    setTimeout(()=>URL.revokeObjectURL(url.split('#')[0]),600000);
    if(!w){ toast('warn','Браузер заблокировал новую вкладку',{timeout:8000,action:{label:'Повторить',fn:deploy}}); return; }
    toast('success',note,{timeout:5000});
  }catch(e){ toast('danger','Не удалось открыть: '+e.message); }
}

/* ---------- редактор: ядро ---------- */
const code=$('#code'), hl=$('#hl'), gutter=$('#gutter'), edScroll=$('#edScroll'),
      activeLine=$('#activeLine'), metrics=$('#metrics');
let charW=7.8, curGlowLine=-1;
const lh=()=>Math.round(S.prefs.font*1.55);
function applyEditorPrefs(){
  edScroll.style.setProperty('--code-size',S.prefs.font+'px');
  edScroll.style.setProperty('--code-lh',lh()+'px');
  edScroll.style.setProperty('--tab-size',S.prefs.tab);
  edScroll.classList.toggle('wrap',S.prefs.wrap);
  code.setAttribute('wrap',S.prefs.wrap?'soft':'off');
  $('#wrapBtn').setAttribute('aria-pressed',String(S.prefs.wrap));
  $('#wsBtn').setAttribute('aria-pressed',String(S.prefs.ws));
  $('#fontVal').textContent=S.prefs.font+'px';
  $('#tabSizeSel').value=String(S.prefs.tab);
  $('#stIndent').textContent='Пробелы: '+S.prefs.tab;
  metrics.style.fontSize=S.prefs.font+'px'; metrics.style.lineHeight=lh()+'px';
  charW=metrics.getBoundingClientRect().width/10||7.8;
}
function renderCode(){
  const f=activeFile();
  const content=code.value;
  const lines=highlight(content, f?langOf(f.name):'plain');
  hl.innerHTML=lines.map(h=>'<div class="code-line">'+(wsMark(h)||'\u200b')+'</div>').join('');
  gutter.innerHTML=lines.map((_,i)=>'<div class="gl">'+(i+1)+'</div>').join('');
  edScroll.style.setProperty('--gw',Math.max(2,String(lines.length).length));
  if(S.prefs.wrap){
    const hs=Array.from(hl.children).map(d=>d.offsetHeight);
    Array.from(gutter.children).forEach((g,i)=>{ g.style.height=hs[i]+'px'; });
  }
  curGlowLine=-1;
  updateActive();
  updatePlaceholder();
}
function updatePlaceholder(){
  const ph=$('#edPlaceholder'); if(!ph) return;
  const f=activeFile();
  const show=!!f && code.value.length===0 && !S.composing;
  ph.hidden=!show;
  if(show) $('#epTitle').textContent='Начните вводить '+langLabel(f.name)+'…';
}
function caretLineCol(){
  const v=code.value, p=code.selectionEnd;
  let ln=0, ls=0;
  for(let i=0;i<p;i++) if(v[i]==='\n'){ ln++; ls=i+1; }
  return {ln, col:p-ls, p};
}
function updateActive(){
  const {ln,col}=caretLineCol();
  const g=gutter.children[ln];
  if(g){
    activeLine.style.top=g.offsetTop+'px';
    const cl=hl.children[ln];
    activeLine.style.height=(S.prefs.wrap&&cl?cl.offsetHeight:lh())+'px';
    if(curGlowLine!==ln){
      if(curGlowLine>-1&&gutter.children[curGlowLine]) gutter.children[curGlowLine].classList.remove('active');
      g.classList.add('active'); curGlowLine=ln;
    }
  }
  $('#stLnCol').textContent='Стр '+(ln+1)+', кол '+(col+1);
  const selN=Math.abs(code.selectionEnd-code.selectionStart);
  const stSel=$('#stSel');
  stSel.hidden=selN===0;
  if(selN) stSel.textContent='Выделено: '+selN;
}
function revealCaret(){
  const {ln,col}=caretLineCol();
  const g=gutter.children[ln]; if(!g) return;
  const y=g.offsetTop, h=S.prefs.wrap?(hl.children[ln]?hl.children[ln].offsetHeight:lh()):lh();
  const st=edScroll.scrollTop, ch=edScroll.clientHeight;
  if(y<st+4) edScroll.scrollTop=Math.max(0,y-4);
  else if(y+h>st+ch-4) edScroll.scrollTop=y+h-ch+4;
  if(!S.prefs.wrap){
    const x=16+col*charW, sl=edScroll.scrollLeft, cw=edScroll.clientWidth-gutter.offsetWidth;
    if(x<sl+30) edScroll.scrollLeft=Math.max(0,x-30);
    else if(x>sl+cw-40) edScroll.scrollLeft=x-cw+40;
  }
}
/* история */
function histFor(id){
  if(!S.hist.has(id)) S.hist.set(id,{stack:[{v:fileById(id)?fileById(id).content:'',s:0,e:0}],ptr:0,lastType:'',lastTime:0});
  return S.hist.get(id);
}
function pushHist(type){
  const f=activeFile(); if(!f) return;
  const h=histFor(f.id);
  const st={v:code.value,s:code.selectionStart,e:code.selectionEnd};
  const now=Date.now();
  const coalesce=(type==='type'||type==='delete')&&h.lastType===type&&now-h.lastTime<900&&h.ptr>0;
  if(coalesce){ h.stack[h.ptr]=st; }
  else{
    h.stack=h.stack.slice(0,h.ptr+1);
    h.stack.push(st);
    if(h.stack.length>300) h.stack.shift();
    h.ptr=h.stack.length-1;
  }
  h.lastType=type; h.lastTime=now;
  updateUndoRedo();
}
function undoRedo(dir){
  const f=activeFile(); if(!f) return;
  const h=histFor(f.id);
  const np=h.ptr+dir;
  if(np<0||np>=h.stack.length) return;
  h.ptr=np; h.lastType=dir<0?'undo':'redo'; h.lastTime=0;
  const st=h.stack[np];
  code.value=st.v; code.setSelectionRange(st.s,st.e);
  afterEdit();
  revealCaret(); updateUndoRedo();
}
function updateUndoRedo(){
  const f=activeFile(); const h=f?histFor(f.id):null;
  $('#undoBtn').disabled=!h||h.ptr<=0;
  $('#redoBtn').disabled=!h||h.ptr>=h.stack.length-1;
}
function applyEdit(v,s,e,type){
  pushHistPre(type,v,s,e===undefined?s:e);
  code.value=v; code.setSelectionRange(s,e===undefined?s:e);
  afterEdit();
  revealCaret();
}
function pushHistPre(type,v,s,e){
  const f=activeFile(); if(!f) return;
  const h=histFor(f.id);
  h.stack=h.stack.slice(0,h.ptr+1);
  h.stack.push({v,s,e});
  if(h.stack.length>300) h.stack.shift();
  h.ptr=h.stack.length-1;
  h.lastType=type; h.lastTime=Date.now();
  updateUndoRedo();
}
function afterEdit(){
  const f=activeFile();
  if(f){ f.content=code.value; f.bytes=bytesOf(f.content); f.updatedAt=Date.now(); }
  renderCode(); updateStatus(); markDirty(); markPreviewStale(); scheduleCheck();
}
function onInput(e){
  updatePlaceholder();
  if(S.composing) return;
  const f=activeFile(); if(!f) return;
  const it=e.inputType||'insertText';
  const type=it.startsWith('delete')?'delete':(it==='insertFromPaste'||it==='insertFromDrop')?'paste':'type';
  pushHist(type);
  afterEdit();
  revealCaret();
}
code.addEventListener('input',onInput);
code.addEventListener('compositionstart',()=>{S.composing=true;});
code.addEventListener('compositionend',()=>{S.composing=false; pushHist('type'); afterEdit();});
code.addEventListener('beforeinput',e=>{
  if(e.inputType==='historyUndo'){ e.preventDefault(); undoRedo(-1); }
  else if(e.inputType==='historyRedo'){ e.preventDefault(); undoRedo(1); }
});
/* клавиши редактора */
const PAIRS={'(':')','[':']','{':'}','"':'"',"'":"'",'`':'`'};
const CLOSERS=new Set([')',']','}','"',"'",'`']);
code.addEventListener('keydown',e=>{
  if(e.isComposing) return;
  const mod=e.ctrlKey||e.metaKey;
  const v=code.value, s=code.selectionStart, en=code.selectionEnd;
  if(mod&&!e.altKey){
    const k=e.key.toLowerCase();
    if(k==='z'){ e.preventDefault(); undoRedo(e.shiftKey?1:-1); return; }
    if(k==='y'){ e.preventDefault(); undoRedo(1); return; }
    if(e.key==='/'){ e.preventDefault(); toggleComment(); return; }
    if(k==='d'){ e.preventDefault(); duplicateLine(); return; }
    return;
  }
  if(e.key==='Tab'){ e.preventDefault(); indentSelection(e.shiftKey); return; }
  if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); smartEnter(); return; }
  if(e.key==='Backspace'&&s===en&&s>0&&PAIRS[v[s-1]]&&v[s]===PAIRS[v[s-1]]){
    e.preventDefault(); applyEdit(v.slice(0,s-1)+v.slice(s+1),s-1,s-1,'pair'); return;
  }
  if(!mod&&!e.altKey&&e.key.length===1){
    if(PAIRS[e.key]){
      const next=v[s]||'', prev=v[s-1]||'';
      if(s!==en){
        e.preventDefault();
        applyEdit(v.slice(0,s)+e.key+v.slice(s,en)+PAIRS[e.key]+v.slice(en),s+1,en+1,'pair'); return;
      }
      const isQuote=['"',"'",'`'].includes(e.key);
      if(!isQuote||(!/[\w"'`]/.test(prev)&&!/[\w]/.test(next))){
        if(!isQuote||next===PAIRS[e.key]||!/\w/.test(next)){
          e.preventDefault();
          applyEdit(v.slice(0,s)+e.key+PAIRS[e.key]+v.slice(s),s+1,s+1,'pair'); return;
        }
      }
    }
    if(CLOSERS.has(e.key)&&s===en&&v[s]===e.key){
      e.preventDefault(); code.setSelectionRange(s+1,s+1); updateActive(); return;
    }
  }
});
code.addEventListener('keyup',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(e.key)) revealCaret();
});
code.addEventListener('click',()=>{updateActive();});
document.addEventListener('selectionchange',()=>{
  if(document.activeElement===code) requestAnimationFrame(updateActive);
});
function indentSelection(out){
  const v=code.value, s=code.selectionStart, en=code.selectionEnd;
  const unit=' '.repeat(S.prefs.tab);
  const ls=v.lastIndexOf('\n',s-1)+1;
  let le=v.indexOf('\n',en); if(le===-1) le=v.length;
  if(s===en&&!out){ applyEdit(v.slice(0,s)+unit+v.slice(s),s+unit.length,s+unit.length,'indent'); return; }
  const block=v.slice(ls,le), lines=block.split('\n');
  let firstDelta=0,total=0;
  const nl=lines.map((l,i)=>{
    if(out){
      const m=l.match(new RegExp('^( {1,'+S.prefs.tab+'}|\\t)')); const r=m?m[0].length:0;
      if(i===0) firstDelta=-r; total-=r; return l.slice(r);
    }
    if(i===0) firstDelta=unit.length; total+=unit.length; return unit+l;
  });
  const nb=nl.join('\n');
  applyEdit(v.slice(0,ls)+nb+v.slice(le), Math.max(ls,s+firstDelta), Math.max(ls,en+total), 'indent');
}
function smartEnter(){
  const v=code.value, s=code.selectionStart, en=code.selectionEnd;
  const ls=v.lastIndexOf('\n',s-1)+1;
  const prev=v.slice(ls,s);
  const indent=(prev.match(/^\s*/)||[''])[0];
  const unit=' '.repeat(S.prefs.tab);
  const trimmed=prev.trimEnd();
  const f=activeFile(); const lang=f?langOf(f.name):'plain';
  let extra='';
  if(lang==='html'){
    const m=trimmed.match(/\x3c([a-zA-Z][\w-]*)(?:\s[^>]*)?>$/);
    if(m&&!VOID.has(m[1].toLowerCase())&&!/\/>$/.test(trimmed)&&!trimmed.includes('\x3c/')) extra=unit;
  }else if(lang==='css'||lang==='js'){
    if(/[{\[(]$/.test(trimmed)) extra=unit;
  }
  const next=v[en]||'';
  const between=(extra&&((lang==='html'&&v.slice(en).startsWith('\x3c/'))||(lang!=='html'&&/[}\])]/.test(next))));
  if(between){
    const ins='\n'+indent+extra+'\n'+indent;
    applyEdit(v.slice(0,s)+ins+v.slice(en), s+1+indent.length+extra.length, s+1+indent.length+extra.length,'indent');
  }else{
    const ins='\n'+indent+extra;
    applyEdit(v.slice(0,s)+ins+v.slice(en), s+ins.length, s+ins.length,'indent');
  }
}
function toggleComment(){
  const f=activeFile(); if(!f) return;
  const lang=langOf(f.name);
  let open,close;
  if(lang==='html'){ open='\x3c!-- '; close=' --\x3e'; }
  else if(lang==='css'){ open='/* '; close=' */'; }
  else if(lang==='js'){ open='// '; close=''; }
  else{ toast('info','Комментарии не поддерживаются для этого типа файла',{timeout:2500}); return; }
  const v=code.value, s=code.selectionStart, en=code.selectionEnd;
  const ls=v.lastIndexOf('\n',s-1)+1;
  let le=v.indexOf('\n',en); if(le===-1) le=v.length;
  const lines=v.slice(ls,le).split('\n');
  const nonEmpty=lines.filter(l=>l.trim());
  const allOn=nonEmpty.length>0&&nonEmpty.every(l=>{
    const t=l.trim();
    return t.startsWith(open.trim())&&(close?t.endsWith(close.trim()):true);
  });
  const nl=lines.map(l=>{
    if(!l.trim()) return l;
    const ind=(l.match(/^\s*/)||[''])[0], body=l.slice(ind.length);
    if(allOn){
      let b=body.slice(open.trim().length);
      if(b.startsWith(' ')) b=b.slice(1);
      if(close){ if(b.endsWith(close.trim())) b=b.slice(0,-close.trim().length); if(b.endsWith(' ')) b=b.slice(0,-1); }
      return ind+b;
    }
    return ind+open+body+(close?close:'');
  });
  const nb=nl.join('\n');
  applyEdit(v.slice(0,ls)+nb+v.slice(le), ls, ls+nb.length,'comment');
}
function duplicateLine(){
  const v=code.value, s=code.selectionStart, en=code.selectionEnd;
  const ls=v.lastIndexOf('\n',s-1)+1;
  let le=v.indexOf('\n',en); if(le===-1) le=v.length;
  const block=v.slice(ls,le);
  applyEdit(v.slice(0,le)+'\n'+block+v.slice(le), s+block.length+1, en+block.length+1,'dup');
}
function updateStatus(){
  const f=activeFile();
  $('#stLang').textContent=f?langLabel(f.name):'—';
  $('#stSize').textContent=f?fmtSize(bytesOf(code.value)):'0 Б';
  updateActive();
}
/* переключение файлов */
function saveView(){
  if(!S.active) return;
  S.view.set(S.active,{top:edScroll.scrollTop,left:edScroll.scrollLeft,s:code.selectionStart,e:code.selectionEnd});
}
function switchFile(id,opts={}){
  const f=fileById(id); if(!f) return;
  saveView();
  S.active=id;
  if(!S.tabs.includes(id)) S.tabs.push(id);
  histFor(id);
  code.value=f.content;
  renderCode();
  const vw=S.view.get(id);
  if(vw){ code.setSelectionRange(vw.s,vw.e); edScroll.scrollTop=vw.top; edScroll.scrollLeft=vw.left; }
  else{ code.setSelectionRange(0,0); edScroll.scrollTop=0; edScroll.scrollLeft=0; }
  $('#edEmpty').hidden=true; edScroll.style.visibility='';
  renderTabs(); renderSidebar(); updateStatus(); updateUndoRedo();
  retargetPreview(); rebuildPreview(); updateHeaderButtons();
  markDirty(); scheduleCheck();
  if(opts.focus!==false) code.focus({preventScroll:true});
  if(window.innerWidth<=900) closeMobileSidebar();
}
function emptyEditor(){
  S.active=null; code.value='';
  renderCode();
  edScroll.style.visibility='hidden';
  $('#edEmpty').hidden=false;
  const chips=$('#emptyChips'); chips.innerHTML='';
  S.order.slice(0,4).forEach(id=>{
    const f=fileById(id); if(!f) return;
    const b=document.createElement('button'); b.className='empty-chip'; b.textContent=f.name;
    b.addEventListener('click',()=>switchFile(f.id)); chips.appendChild(b);
  });
  renderTabs(); renderSidebar(); updateStatus(); updateUndoRedo(); updateHeaderButtons();
  retargetPreview(); rebuildPreview(); markDirty();
}

/* ---------- рендер сайдбара и вкладок ---------- */
function displayFiles(){
  let list=S.order.map(fileById).filter(Boolean);
  if(S.filter){ const q=S.filter.toLowerCase(); list=list.filter(f=>f.name.toLowerCase().includes(q)); }
  const s=S.prefs.sort;
  if(s==='name') list=[...list].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  else if(s==='updated') list=[...list].sort((a,b)=>b.updatedAt-a.updatedAt);
  else if(s==='size') list=[...list].sort((a,b)=>b.bytes-a.bytes);
  return list;
}
function renderSidebar(){
  const list=$('#fileList');
  const files=displayFiles();
  $('#sbCount').textContent=S.files.length;
  list.classList.toggle('bulk-mode',S.bulk.size>0);
  $('#sbClear').hidden=!S.filter;
  if(!files.length){
    list.innerHTML='<div class="sb-empty">'+(S.files.length
      ? 'Ничего не найдено по фильтру «'+esc(S.filter)+'»'
      : 'В проекте пока нет файлов.<br>Создайте новый или импортируйте свои.')+'</div>';
  }else{
    list.innerHTML=files.map(f=>{
      const c=dotColor(f.name);
      return '<div class="f-item'+(f.id===S.active?' active':'')+(S.bulk.has(f.id)?' selected':'')+'" data-id="'+f.id+'" draggable="'+(S.prefs.sort==='manual'&&!S.filter)+'">'
        +'<span class="f-grip" title="Перетащите, чтобы изменить порядок">'+(S.prefs.sort==='manual'?ic('grip',12):'')+'</span>'
        +'<input type="checkbox" class="f-check" '+(S.bulk.has(f.id)?'checked':'')+' aria-label="Выбрать '+escA(f.name)+'">'
        +'<span class="f-dot" style="color:'+c+';background:'+c+'"></span>'
        +'<div class="f-text"><div class="f-name">'+esc(f.name)+'</div>'
        +'<div class="f-meta">'+fmtSize(f.bytes)+' · '+relTime(f.updatedAt)+'</div></div>'
        +'<button class="icon-btn f-menu" title="Действия с файлом">'+ic('dots')+'</button>'
        +'</div>';
    }).join('');
  }
  updateBulkBar(); updateUsage();
}
function updateSidebarMeta(){
  $$('#fileList .f-item').forEach(el=>{
    const f=fileById(el.dataset.id); if(!f) return;
    const m=el.querySelector('.f-meta'); if(m) m.textContent=fmtSize(f.bytes)+' · '+relTime(f.updatedAt);
  });
  updateUsage();
}
function updateUsage(){
  const total=S.files.reduce((a,f)=>a+f.bytes,0);
  $('#sbUsageText').textContent=S.files.length+' '+plural(S.files.length,['файл','файла','файлов'])+' · '+fmtSize(total)+' · локально';
  $('#sbUsageBar').style.width=clamp(total/(5*1048576)*100,1.5,100)+'%';
}
function updateBulkBar(){
  const n=S.bulk.size;
  $('#bulkBar').hidden=n===0;
  if(n){ $('#bulkCount').textContent=n+' '+plural(n,['файл','файла','файлов']); }
}
function renderTabs(){
  const t=$('#tabs');
  t.innerHTML=S.tabs.map(id=>{
    const f=fileById(id); if(!f) return '';
    const c=dotColor(f.name);
    return '<div class="tab'+(id===S.active?' active':'')+'" role="tab" aria-selected="'+(id===S.active)+'" data-id="'+id+'" draggable="true" title="'+escA(f.name)+'">'
      +'<span class="f-dot" style="color:'+c+';background:'+c+'"></span>'+esc(f.name)
      +'<button class="tab-close" title="Закрыть вкладку" aria-label="Закрыть '+escA(f.name)+'">'+ic('x',12)+'</button></div>';
  }).join('');
  const act=t.querySelector('.tab.active');
  if(act) act.scrollIntoView({block:'nearest',inline:'nearest'});
}
function closeTab(id){
  const i=S.tabs.indexOf(id); if(i===-1) return;
  S.tabs.splice(i,1);
  if(S.active===id){
    const next=S.tabs[i]||S.tabs[i-1]||null;
    if(next) switchFile(next); else emptyEditor();
  }else{ renderTabs(); markDirty(); }
}
function updateHeaderButtons(){
  const f=activeFile(), t=previewTargetFile();
  $('#dlBtn').disabled=!f;
  $('#deployBtn').disabled=!t;
  $('#deployBtn').title=t?'Открыть «'+t.name+'» в новой вкладке (Ctrl+Enter)':'Нет страницы для открытия';
  $('#copyBtn').disabled=!f;
  $('#pasteBtn').disabled=!f;
  $('#clearBtn').disabled=!f;
  $('#crumbFile').disabled=!f;
  $('#crumbName').textContent=f?f.name:'—';
  const c=f?dotColor(f.name):'transparent';
  $('#crumbDot').style.color=c; $('#crumbDot').style.background=c;
  $('#wrapBtn').disabled=!f;
  $('#wsBtn').disabled=!f;
  $('#pvOpen').disabled=!t; $('#pvRefresh').disabled=!t;
}
function renderProblemsChip(){
  const el=$('#stProblems'); const n=S.problems.length;
  if(!activeFile()){ el.hidden=true; return; }
  el.hidden=false;
  el.className='st-item '+(n?'warn':'ok');
  el.innerHTML=(n?ic('alert',13):ic('checkCircle',13))+'<span>'+(n?n+' '+plural(n,['проблема','проблемы','проблем']):'Без проблем')+'</span>';
}

/* ---------- файловые операции ---------- */
const BAD_CHARS=/[\\/:*?"<>|#%&]/;
function validateName(name, excludeId){
  const n=name.trim();
  if(!n) return 'Введите имя файла';
  if(n.length>64) return 'Слишком длинное имя (макс. 64 символа)';
  if(BAD_CHARS.test(n)) return 'Недопустимые символы: \\ / : * ? " < > | # % &';
  const ex=findByName(n);
  if(ex&&ex.id!==excludeId) return 'Файл «'+n+'» уже существует';
  return null;
}
function uniqueName(name){
  let n=name.trim(), i=2;
  while(findByName(n)){ n=baseOf(name)+'-'+i+(extOf(name)?'.'+extOf(name):''); i++; }
  return n;
}
function createFile(name,content,quiet){
  const f={id:uid(),name,content,bytes:bytesOf(content),createdAt:Date.now(),updatedAt:Date.now()};
  S.files.push(f); S.order.unshift(f.id);
  switchFile(f.id);
  if(!quiet) toast('success','Создан файл «'+f.name+'»',{timeout:3000});
  return f;
}
function duplicateFile(f){
  const copy=createFile(uniqueName(baseOf(f.name)+'-copy'+(extOf(f.name)?'.'+extOf(f.name):'')),f.content,true);
  const oi=S.order.indexOf(f.id);
  S.order=S.order.filter(id=>id!==copy.id);
  S.order.splice(oi+1,0,copy.id);
  renderSidebar(); markDirty();
  toast('success','Создана копия: «'+copy.name+'»',{timeout:3000});
}
function deleteFiles(ids){
  const removed=[];
  ids.forEach(id=>{
    const f=fileById(id); if(!f) return;
    removed.push({f, oi:S.order.indexOf(id), ti:S.tabs.indexOf(id)});
  });
  if(!removed.length) return;
  const wasActive=ids.includes(S.active);
  const actIdx=S.tabs.indexOf(S.active);
  S.files=S.files.filter(f=>!ids.includes(f.id));
  S.order=S.order.filter(id=>!ids.includes(id));
  S.tabs=S.tabs.filter(id=>!ids.includes(id));
  ids.forEach(id=>{ S.bulk.delete(id); S.hist.delete(id); S.view.delete(id); });
  if(wasActive){
    const next=S.tabs[Math.min(actIdx,S.tabs.length-1)]||S.tabs[0]||null;
    if(next) switchFile(next); else emptyEditor();
  }else{ renderTabs(); renderSidebar(); updateHeaderButtons(); }
  retargetPreview(); rebuildPreview(); markDirty(); scheduleCheck();
  const n=removed.length;
  toast('warn', n===1?'Удалён файл «'+removed[0].f.name+'»':'Удалено '+n+' '+plural(n,['файл','файла','файлов']),{
    timeout:8000,
    action:{label:'Отменить',fn:()=>{
      removed.sort((a,b)=>a.oi-b.oi).forEach(({f,oi,ti})=>{
        S.files.push(f);
        S.order.splice(clamp(oi,0,S.order.length),0,f.id);
        if(ti>-1) S.tabs.splice(clamp(ti,0,S.tabs.length),0,f.id);
      });
      renderTabs(); renderSidebar();
      switchFile(removed[0].f.id);
      toast('success','Восстановлено',{timeout:2200});
    }}
  });
}
function importFiles(list){
  const okExt=['html','htm','css','js','mjs','json','md','markdown','svg','txt','xml','webmanifest'];
  const arr=Array.from(list);
  let done=0, first=null, skipped=0;
  const tasks=arr.map(file=>{
    if(file.size>1572864){ skipped++; return Promise.resolve(); }
    const ext=extOf(file.name);
    if(ext&&!okExt.includes(ext)){ skipped++; return Promise.resolve(); }
    return file.text().then(txt=>{
      const f={id:uid(),name:uniqueName(file.name),content:txt.replace(/\r\n?/g,'\n').replace(/\t/g,'  '),
        bytes:bytesOf(txt),createdAt:Date.now(),updatedAt:Date.now()};
      S.files.push(f); S.order.unshift(f.id);
      if(!first) first=f; done++;
    }).catch(()=>{skipped++;});
  });
  Promise.all(tasks).then(()=>{
    if(done){
      if(first) switchFile(first.id); else{renderSidebar();markDirty();}
      toast('success','Импортировано: '+done+' '+plural(done,['файл','файла','файлов'])+(skipped?' · пропущено: '+skipped:''),{timeout:4000});
    }else if(skipped){
      toast('warn','Файлы не подошли: текстовые форматы до 1,5 МБ',{timeout:4000});
    }
  });
}

/* ---------- слои / оверлеи ---------- */
const layers=[];
let prevFocus=null;
function openLayer(type, el){
  closePop();
  if(layers.length) closeTop(true);
  prevFocus=document.activeElement;
  layers.push({type,el});
  $('#scrim').hidden=false;
  el.hidden=false;
  const inp=el.querySelector('[data-autofocus]')||el.querySelector('input,button');
  if(inp){
    inp.focus({preventScroll:true});
    if(inp.select&&inp.dataset.select==='base'){ const i=inp.value.lastIndexOf('.'); inp.setSelectionRange(0,i>0?i:inp.value.length); }
  }
}
function closeTop(silent){
  const l=layers.pop(); if(!l) return;
  l.el.hidden=true;
  if(!layers.length) $('#scrim').hidden=true;
  if(!silent&&prevFocus&&prevFocus.focus) prevFocus.focus({preventScroll:true});
}
$('#scrim').addEventListener('click',()=>closeTop());
function trapTab(e,root){
  const f=Array.from(root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(x=>!x.disabled&&x.offsetParent!==null);
  if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
}
function showModal(html){
  const m=$('#modal'); m.innerHTML=html;
  openLayer('modal',m);
  m.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeTop()));
  return m;
}
function confirmModal({title,text,label,onConfirm}){
  const m=showModal(
    '<div class="modal-head"><span class="confirm-ico">'+ic('alert',20)+'</span><h2>'+esc(title)+'</h2>'
    +'<button class="icon-btn" data-close aria-label="Закрыть">'+ic('x')+'</button></div>'
    +'<div class="modal-body"><p style="margin:0;font-size:13px;color:var(--muted)">'+esc(text)+'</p></div>'
    +'<div class="modal-foot"><button class="btn" data-close>Отмена</button>'
    +'<button class="btn btn-danger" id="cfGo" data-autofocus>'+esc(label)+'</button></div>');
  m.querySelector('#cfGo').addEventListener('click',()=>{ closeTop(); onConfirm(); });
}
const TPLS={
  empty:{label:'Пустой',desc:'чистый лист',ext:'',content:''},
  html:{label:'HTML',desc:'каркас страницы',ext:'html',content:
`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Новая страница</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #0d1117; color: #e6edf3; font-family: -apple-system, "Segoe UI", sans-serif; }
    h1 { font-size: 2.4rem; letter-spacing: -0.02em; }
    h1 span { background: linear-gradient(90deg, #58a6ff, #a371f7);
      -webkit-background-clip: text; background-clip: text; color: transparent; }
  </style>
</head>
<body>
  <h1>Привет, <span>мир</span> 👋</h1>
</body>
</html>`},
  css:{label:'CSS',desc:'базовые стили',ext:'css',content:
`:root {
  --bg: #0d1117;
  --fg: #e6edf3;
  --accent: #58a6ff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.6 -apple-system, "Segoe UI", sans-serif;
}`},
  js:{label:'JS',desc:'скрипт-модуль',ext:'js',content:
`'use strict';
(function () {
  const app = document.querySelector('#app');
  if (!app) return;
  app.addEventListener('click', function () {
    console.log('Клик!');
  });
})();`},
  svg:{label:'SVG',desc:'векторная иконка',ext:'svg',content:
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#58a6ff"/>
      <stop offset="1" stop-color="#a371f7"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#g)"/>
  <path d="M22 33l7 7 13-15" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`},
  md:{label:'Markdown',desc:'документ',ext:'md',content:
`# Заголовок

Короткое описание документа.

## Раздел

- Первый пункт
- Второй пункт

> Цитата или заметка.

Код: \`console.log('привет')\``}
};
function openFileModal(mode, file){
  const isRename=mode==='rename';
  let tpl='html';
  const m=showModal(
    '<div class="modal-head">'+ic(isRename?'pencil':'plus')+'<h2>'+(isRename?'Переименовать файл':'Новый файл')+'</h2>'
    +'<button class="icon-btn" data-close aria-label="Закрыть">'+ic('x')+'</button></div>'
    +'<form id="fmForm"><div class="modal-body">'
    +'<label class="field-label" for="fmName">Имя файла</label>'
    +'<input class="field" id="fmName" data-autofocus data-select="base" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="например, page.html" value="'+(isRename?escA(file.name):'')+'">'
    +'<div class="field-hint" id="fmHint">'+(isRename?'Расширение определяет подсветку и предпросмотр':'Без расширения файл будет обычным текстом')+'</div>'
    +(isRename?'':'<div class="tpl-grid" id="fmTpls">'+Object.entries(TPLS).map(([k,t])=>
      '<button type="button" class="tpl-opt'+(k===tpl?' on':'')+'" data-tpl="'+k+'"><span>'+ic(k==='empty'?'file':k==='md'?'pencil':k==='svg'?'star':k==='css'?'wrap':'code')+'</span><span><b>'+t.label+'</b><small>'+t.desc+'</small></span></button>').join('')+'</div>')
    +'</div><div class="modal-foot"><button type="button" class="btn" data-close>Отмена</button>'
    +'<button type="submit" class="btn btn-primary" id="fmGo">'+(isRename?'Переименовать':'Создать файл')+'</button></div></form>');
  const nameI=m.querySelector('#fmName'), hint=m.querySelector('#fmHint'), go=m.querySelector('#fmGo');
  const finalName=()=>{
    let n=nameI.value.trim();
    if(!isRename&&n&&!n.includes('.')&&TPLS[tpl].ext) n+='.'+TPLS[tpl].ext;
    return n;
  };
  const check=()=>{
    const n=finalName();
    const err=n?validateName(n,isRename?file.id:null):null;
    nameI.classList.toggle('err',!!err&&!!nameI.value.trim());
    go.disabled=!!err||!n;
    hint.className='field-hint'+(err&&nameI.value.trim()?' err':'');
    hint.textContent=err&&nameI.value.trim()?err:(n?'Будет создан: '+n:'Без расширения файл будет обычным текстом');
    if(isRename&&n) hint.textContent=n===file.name?'Текущее имя':'Новое имя: '+n;
  };
  nameI.addEventListener('input',check);
  if(!isRename){
    m.querySelector('#fmTpls').addEventListener('click',e=>{
      const b=e.target.closest('.tpl-opt'); if(!b) return;
      tpl=b.dataset.tpl;
      m.querySelectorAll('.tpl-opt').forEach(x=>x.classList.toggle('on',x===b));
      nameI.placeholder='например, '+(tpl==='empty'?'notes.txt':tpl==='md'?'README.md':'page.'+TPLS[tpl].ext);
      check();
    });
  }
  m.querySelector('#fmForm').addEventListener('submit',e=>{
    e.preventDefault();
    const n=finalName();
    if(!n||validateName(n,isRename?file.id:null)) return;
    closeTop();
    if(isRename){
      file.name=n; file.updatedAt=Date.now();
      renderTabs(); renderSidebar(); updateStatus(); updateHeaderButtons();
      retargetPreview(); rebuildPreview(); markDirty(); scheduleCheck();
      toast('success','Переименовано в «'+n+'»',{timeout:2600});
    }else{
      createFile(n,TPLS[tpl].content);
    }
    code.focus({preventScroll:true});
  });
  check();
}
function shortcutsModal(){
  const row=(keys,desc)=>'<div class="keys">'+keys.map(k=>'<kbd>'+k+'</kbd>').join('')+'</div><div>'+desc+'</div>';
  showModal(
    '<div class="modal-head">'+ic('keyboard')+'<h2>Горячие клавиши</h2><button class="icon-btn" data-close aria-label="Закрыть">'+ic('x')+'</button></div>'
    +'<div class="modal-body"><div class="sc-grid">'
    +'<div class="sc-sec">Приложение</div>'
    +row(['Ctrl','K'],'Палитра: файлы, поиск в коде, команды')
    +row(['Ctrl','S'],'Скачать текущий файл')
    +row(['Ctrl','Enter'],'Открыть страницу в новой вкладке')
    +row(['Ctrl','B'],'Показать / скрыть панель файлов')
    +row(['Alt','Z'],'Перенос длинных строк')
    +row(['?'],'Это окно')
    +'<div class="sc-sec">Редактор</div>'
    +row(['Ctrl','Z'],'Отменить')
    +row(['Ctrl','Shift','Z'],'Повторить')
    +row(['Ctrl','/'],'Закомментировать строки')
    +row(['Ctrl','D'],'Дублировать строку')
    +row(['Tab'],'Отступ · Shift+Tab — назад')
    +row(['Enter'],'Умный перенос с отступом')
    +'</div><p style="font-size:11px;color:var(--faint);margin:14px 0 0">На macOS вместо Ctrl используйте ⌘. Скобки и кавычки закрываются автоматически. HubPad не аффилирован с GitHub, Inc.</p></div>'
    +'<div class="modal-foot"><button class="btn btn-primary" data-close data-autofocus>Понятно</button></div>');
}
function legalModal(){
  showModal(
    '<div class="modal-head">'+ic('info')+'<h2>О проекте и дисклеймер</h2>'
    +'<button class="icon-btn" data-close aria-label="Закрыть">'+ic('x')+'</button></div>'
    +'<div class="modal-body"><div class="legal-body">'
    +'<p><b>HubPad</b> — независимый редактор кода с интерфейсом, вдохновлённым оформлением GitHub.</p>'
    +'<p>Проект <b>не аффилирован с GitHub, Inc.</b>, не спонсируется и не одобряется ею. '
    +'GitHub и логотип GitHub (Invertocat) — товарные знаки GitHub, Inc. '
    +'В HubPad не используются логотипы, фирменные знаки и исходный код GitHub.</p>'
    +'<p>Цветовая палитра близка к открытой дизайн-системе Primer (MIT); сам код Primer в проект не включён. '
    +'Иконки и логотип HubPad нарисованы отдельно для этого проекта. Демо-проект Pulse — оригинальный пример.</p>'
    +'<p>Редактор предоставляется «как есть», без каких-либо гарантий. '
    +'Все файлы хранятся локально в браузере и никуда не отправляются.</p>'
    +'</div></div>'
    +'<div class="modal-foot"><button class="btn btn-primary" data-close data-autofocus>Понятно</button></div>');
}
/* ---------- поповеры (устойчивы к экранной клавиатуре) ---------- */
let popKind=null, popAnchor=null, popAlign='right', popRaf=0;
function visualBox(){
  const vv=window.visualViewport;
  if(vv) return {top:vv.offsetTop||0, left:vv.offsetLeft||0, w:vv.width, h:vv.height};
  return {top:0, left:0, w:window.innerWidth, h:window.innerHeight};
}
function placePop(el,anchor,align){
  if(!anchor||!anchor.isConnected){ closePop(); return; }
  el.hidden=false; el.style.visibility='hidden';
  const vb=visualBox();
  const sheet = el.id==='dlPop' && window.innerWidth<=700;
  if(sheet){ el.style.width=Math.min(vb.w-20,420)+'px'; }
  else if(el.id==='dlPop'){ el.style.width=''; }
  el.style.maxHeight=Math.max(150,vb.h-16)+'px';
  el.style.overflowY='auto';
  const r=anchor.getBoundingClientRect(), w=el.offsetWidth, h=el.offsetHeight;
  let left = sheet ? vb.left+(vb.w-w)/2 : (align==='right'? r.right-w : r.left);
  left=clamp(left, vb.left+8, Math.max(vb.left+8, vb.left+vb.w-w-8));
  let top=r.bottom+6;
  if(top+h>vb.top+vb.h-8) top=Math.max(vb.top+8, r.top-h-6);
  top=clamp(top, vb.top+8, Math.max(vb.top+8, vb.top+vb.h-h-8));
  el.style.left=left+'px'; el.style.top=top+'px'; el.style.visibility='';
}
function openPopEl(kind,el,anchor,align){
  closePop();
  popKind=kind; popAnchor=anchor; popAlign=align||'right';
  placePop(el,anchor,popAlign);
}
function closePop(){
  if(!popKind) return;
  $('#dlPop').hidden=true; $('#pop').hidden=true;
  popKind=null; popAnchor=null;
}
/* Клавиатура на Android вызывает resize/scroll — поповер НЕ закрываем,
   а перепозиционируем внутри видимой области, чтобы фокус не терялся. */
function scheduleReposition(){
  if(!popKind||popRaf) return;
  popRaf=requestAnimationFrame(()=>{
    popRaf=0;
    if(!popKind) return;
    if(popAnchor&&!popAnchor.isConnected){ closePop(); return; }
    placePop(popKind==='dl'?$('#dlPop'):$('#pop'), popAnchor, popAlign);
  });
}
document.addEventListener('pointerdown',e=>{
  if(!popKind) return;
  const el=popKind==='dl'?$('#dlPop'):$('#pop');
  if(el.contains(e.target)||(popAnchor&&popAnchor.contains(e.target))) return;
  closePop();
});
window.addEventListener('resize',scheduleReposition);
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',scheduleReposition);
  window.visualViewport.addEventListener('scroll',scheduleReposition);
}
document.addEventListener('scroll',e=>{
  if(!popKind) return;
  if(e.target instanceof Element && e.target.closest('.pop')) return;
  scheduleReposition();
},true);
/* скачивание */
function openDownload(){
  const f=activeFile(); if(!f) return;
  if(popKind==='dl'){ closePop(); return; }
  const inp=$('#dlName');
  inp.value=f.name;
  $('#dlStandalone').checked=false;
  $('#dlStandaloneWrap').style.display=langOf(f.name)==='html'?'':'none';
  updateDlHint();
  $('#dlZipNote').textContent='Все файлы проекта: '+S.files.length+' '+plural(S.files.length,['файл','файла','файлов'])+' · '+fmtSize(S.files.reduce((a,x)=>a+x.bytes,0));
  openPopEl('dl',$('#dlPop'),$('#dlBtn'),'right');
  /* фокус синхронно внутри жеста пользователя — клавиатура открывается и остаётся открытой */
  inp.focus({preventScroll:true});
  const i=inp.value.lastIndexOf('.');
  inp.setSelectionRange(0,i>0?i:inp.value.length);
}
function dlFinalName(){
  const f=activeFile(); if(!f) return null;
  let n=$('#dlName').value.trim();
  if(!n) return null;
  if(!n.includes('.')&&extOf(f.name)) n+='.'+extOf(f.name);
  return n;
}
function updateDlHint(){
  const f=activeFile(); if(!f) return;
  const hint=$('#dlHint'), go=$('#dlGo');
  const n=dlFinalName();
  if(!n){ hint.className='field-hint err'; hint.textContent='Введите имя файла'; go.disabled=true; return; }
  if(BAD_CHARS.test(n)){ hint.className='field-hint err'; hint.textContent='Недопустимые символы в имени'; go.disabled=true; return; }
  const standalone=$('#dlStandalone').checked&&langOf(f.name)==='html';
  const content=standalone?inlineAssets(f.content):f.content;
  hint.className='field-hint';
  hint.textContent='Будет сохранён как '+n+' · '+fmtSize(bytesOf(content))+(standalone?' · автономный':'');
  go.disabled=false;
}
function downloadCurrent(){
  const f=activeFile();
  if(!f){ toast('warn','Нет открытого файла'); return; }
  const viaPop=popKind==='dl';
  const n=(viaPop?dlFinalName():null)||f.name;
  if(BAD_CHARS.test(n)){ toast('warn','Недопустимые символы в имени файла'); return; }
  const standalone=viaPop&&$('#dlStandalone').checked&&langOf(f.name)==='html';
  const content=standalone?inlineAssets(f.content):f.content;
  downloadBlob(n,new Blob([content],{type:'text/plain;charset=utf-8'}));
  closePop();
  toast('success','Скачан «'+n+'» · '+fmtSize(bytesOf(content)),{timeout:3500});
}
$('#dlName').addEventListener('input',updateDlHint);
$('#dlStandalone').addEventListener('change',updateDlHint);
$('#dlName').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); downloadCurrent(); } });
$('#dlGo').addEventListener('click',downloadCurrent);
$('#dlZip').addEventListener('click',()=>{
  if(!S.files.length){ toast('warn','Проект пуст'); return; }
  zipFiles(S.order.map(fileById).filter(Boolean),'playground.zip');
  closePop();
  toast('success','Проект скачан как playground.zip',{timeout:3500});
});
/* меню файла */
function openFileMenu(f,anchor){
  const el=$('#pop');
  el.className='pop pop-menu';
  el.innerHTML=
    '<button class="menu-item" data-act="open">'+ic('code')+'Открыть</button>'
    +'<button class="menu-item" data-act="rename">'+ic('pencil')+'Переименовать</button>'
    +'<button class="menu-item" data-act="dup">'+ic('copy')+'Дублировать</button>'
    +'<button class="menu-item" data-act="dl">'+ic('download')+'Скачать</button>'
    +'<button class="menu-item" data-act="info">'+ic('info')+'Сведения</button>'
    +'<div class="menu-div"></div>'
    +'<button class="menu-item danger" data-act="del">'+ic('trash')+'Удалить</button>';
  el.querySelectorAll('.menu-item').forEach(b=>b.addEventListener('click',()=>{
    closePop();
    const act=b.dataset.act;
    if(act==='open') switchFile(f.id);
    else if(act==='rename') openFileModal('rename',f);
    else if(act==='dup') duplicateFile(f);
    else if(act==='dl'){ switchFile(f.id,{focus:false}); setTimeout(openDownload,60); }
    else if(act==='info') openDrawer(f);
    else if(act==='del') deleteFiles([f.id]);
  }));
  openPopEl('menu',el,anchor,'right');
}
/* проблемы */
function fillProblems(){
  const el=$('#pop');
  el.className='pop pop-prob';
  const n=S.problems.length;
  el.innerHTML='<div class="prob-head">'+ic('alert')+'Быстрая проверка <small>теги и скобки · эвристика</small></div>'
    +(n?'<div class="prob-list">'+S.problems.map((p,i)=>
      '<button class="prob-item" data-i="'+i+'"><span style="color:var(--warn)">'+ic('alert',14)+'</span>'
      +'<span class="pi-main">'+esc(p.msg)+'</span><span class="pi-line">стр. '+p.line+'</span></button>').join('')+'</div>'
    :'<div class="prob-ok">'+ic('checkCircle',26)+'Явных проблем не найдено</div>');
  el.querySelectorAll('.prob-item').forEach(b=>b.addEventListener('click',()=>{
    const p=S.problems[+b.dataset.i]; closePop();
    if(p) jumpToLine(p.line-1,0);
  }));
}
function openProblems(){
  if(popKind==='prob'){ closePop(); return; }
  runCheck(); fillProblems();
  openPopEl('prob',$('#pop'),$('#stProblems'),'left');
}
function jumpToLine(ln,col){
  const v=code.value; const starts=lineStartsOf(v);
  ln=clamp(ln,0,starts.length-1);
  const idx=starts[ln]+(col||0);
  code.focus({preventScroll:true});
  code.setSelectionRange(idx,idx);
  updateActive(); revealCaret();
  activeLine.classList.remove('flash'); void activeLine.offsetWidth; activeLine.classList.add('flash');
}
/* выдвижная панель сведений */
function openDrawer(f){
  const d=$('#drawer');
  const lines=f.content.split('\n').length;
  const c=dotColor(f.name);
  d.innerHTML=
    '<div class="drawer-head">'+ic('info')+'<h2>Сведения о файле</h2><button class="icon-btn" id="drClose" aria-label="Закрыть">'+ic('x')+'</button></div>'
    +'<div class="drawer-body">'
    +'<div class="dr-file"><div class="dr-ico"><span class="f-dot" style="width:16px;height:16px;color:'+c+';background:'+c+'"></span></div>'
    +'<div><div class="dr-name">'+esc(f.name)+'</div><div class="dr-type">'+langLabel(f.name)+' · playground/'+esc(f.name)+'</div></div></div>'
    +'<dl class="dr-grid">'
    +'<dt>Размер</dt><dd>'+fmtSize(f.bytes)+'</dd>'
    +'<dt>Строк</dt><dd>'+lines+'</dd>'
    +'<dt>Символов</dt><dd>'+f.content.length+'</dd>'
    +'<dt>Создан</dt><dd>'+new Date(f.createdAt).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</dd>'
    +'<dt>Изменён</dt><dd>'+relTime(f.updatedAt)+'</dd>'
    +'<dt>Кодировка</dt><dd>UTF-8</dd>'
    +'</dl>'
    +'<div class="dr-actions">'
    +'<button class="btn" data-act="open">'+ic('code')+'Открыть в редакторе</button>'
    +'<button class="btn" data-act="rename">'+ic('pencil')+'Переименовать</button>'
    +'<button class="btn" data-act="dup">'+ic('copy')+'Дублировать</button>'
    +'<button class="btn" data-act="dl">'+ic('download')+'Скачать…</button>'
    +'<button class="btn btn-danger" data-act="del" style="margin-top:8px">'+ic('trash')+'Удалить файл</button>'
    +'</div></div>';
  openLayer('drawer',d);
  d.querySelector('#drClose').addEventListener('click',()=>closeTop());
  d.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{
    closeTop();
    const act=b.dataset.act;
    if(act==='open') switchFile(f.id);
    else if(act==='rename') openFileModal('rename',f);
    else if(act==='dup') duplicateFile(f);
    else if(act==='dl'){ switchFile(f.id,{focus:false}); setTimeout(openDownload,60); }
    else if(act==='del') deleteFiles([f.id]);
  }));
}
/* ---------- палитра команд ---------- */
const pal={items:[],idx:0};
const COMMANDS=[
  {id:'new',label:'Создать новый файл',icon:'plus',run:()=>openFileModal('new')},
  {id:'dl',label:'Скачать текущий файл…',icon:'download',kbd:'Ctrl S',run:openDownload},
  {id:'paste',label:'Вставить из буфера обмена',icon:'paste',run:()=>$('#pasteBtn').click()},
  {id:'clear',label:'Очистить текущий файл',icon:'trash',run:()=>$('#clearBtn').click()},
  {id:'zip',label:'Скачать проект как .zip',icon:'archive',run:()=>$('#dlZip').click()},
  {id:'deploy',label:'Открыть страницу в новой вкладке',icon:'external',kbd:'Ctrl ↵',run:deploy},
  {id:'import',label:'Импортировать файлы…',icon:'upload',run:()=>$('#fileInput').click()},
  {id:'theme',label:'Переключить тему (светлая / тёмная)',icon:'sun',run:toggleTheme},
  {id:'sidebar',label:'Показать / скрыть панель файлов',icon:'sidebar',kbd:'Ctrl B',run:toggleSidebar},
  {id:'split',label:'Режим: код и предпросмотр',icon:'split',run:()=>setLayout('split')},
  {id:'code',label:'Режим: только код',icon:'code',run:()=>setLayout('code')},
  {id:'preview',label:'Режим: только предпросмотр',icon:'eye',run:()=>setLayout('preview')},
  {id:'ws',label:'Показывать пробелы и табы',icon:'pilcrow',run:()=>$('#wsBtn').click()},
  {id:'keys',label:'Горячие клавиши',icon:'keyboard',kbd:'?',run:shortcutsModal},
  {id:'legal',label:'О проекте и дисклеймер',icon:'info',run:()=>legalModal()},
  {id:'reset',label:'Сбросить демо-проект',icon:'refresh',danger:true,run:()=>confirmModal({
    title:'Сбросить проект?',text:'Все файлы будут заменены исходным демо-проектом Pulse. Ваши изменения потеряются.',
    label:'Сбросить',onConfirm:()=>{ try{localStorage.removeItem(KEY);sessionStorage.setItem('hubpad-reset','1');}catch(e){} location.reload(); }})}
];
function openPalette(){
  const p=$('#palette');
  openLayer('palette',p);
  $('#palInput').value='';
  renderPal('');
  $('#palInput').focus({preventScroll:true});
}
function palSections(q){
  const secs=[];
  const cmdOnly=q.startsWith('>');
  const query=(cmdOnly?q.slice(1):q).trim().toLowerCase();
  const cmds=COMMANDS.filter(c=>!query||c.label.toLowerCase().includes(query));
  if(cmdOnly){ if(cmds.length) secs.push({title:'Команды',items:cmds.map(c=>({kind:'cmd',c}))}); return secs; }
  if(!query){
    const recent=[...S.files].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,5);
    if(recent.length) secs.push({title:'Недавние файлы',items:recent.map(f=>({kind:'file',f}))});
    secs.push({title:'Команды',items:COMMANDS.slice(0,7).map(c=>({kind:'cmd',c}))});
    return secs;
  }
  const fm=S.files.filter(f=>f.name.toLowerCase().includes(query)).slice(0,6);
  if(fm.length) secs.push({title:'Файлы',items:fm.map(f=>({kind:'file',f}))});
  const matches=[];
  for(const f of S.files){
    if(matches.length>=10) break;
    const lines=f.content.split('\n'); let per=0;
    for(let i=0;i<lines.length&&per<3&&matches.length<10;i++){
      const col=lines[i].toLowerCase().indexOf(query);
      if(col>-1){ matches.push({kind:'match',f,line:i,col,text:lines[i]}); per++; }
    }
  }
  if(matches.length) secs.push({title:'Совпадения в коде',items:matches});
  if(cmds.length) secs.push({title:'Команды',items:cmds.slice(0,4).map(c=>({kind:'cmd',c}))});
  return secs;
}
function renderPal(q){
  const secs=palSections(q);
  pal.items=[]; pal.idx=0;
  const list=$('#palList');
  const query=(q.startsWith('>')?q.slice(1):q).trim().toLowerCase();
  if(!secs.length){ list.innerHTML='<div class="pal-empty">Ничего не найдено. Попробуйте «>» для списка команд.</div>'; return; }
  let html='';
  secs.forEach(sec=>{
    html+='<div class="pal-sec">'+sec.title+'</div>';
    sec.items.forEach(item=>{
      const i=pal.items.length; pal.items.push(item);
      if(item.kind==='file'){
        const c=dotColor(item.f.name);
        html+='<button class="pal-item" data-i="'+i+'"><span class="pi-ico"><span class="f-dot" style="color:'+c+';background:'+c+'"></span></span>'
          +'<span class="pi-main"><span class="pi-name">'+esc(item.f.name)+'</span><div class="pi-sub">playground · '+fmtSize(item.f.bytes)+' · '+relTime(item.f.updatedAt)+'</div></span>'
          +'<kbd>↵</kbd></button>';
      }else if(item.kind==='match'){
        const t=item.text; const col=item.col;
        const a=Math.max(0,col-24), b=Math.min(t.length,col+query.length+40);
        const snip=(a>0?'…':'')+esc(t.slice(a,col))+'<mark>'+esc(t.slice(col,col+query.length))+'</mark>'+esc(t.slice(col+query.length,b))+(b<t.length?'…':'');
        html+='<button class="pal-item" data-i="'+i+'"><span class="pi-ico">'+ic('search',14)+'</span>'
          +'<span class="pi-main"><span class="pi-name" style="font-size:12px">'+esc(item.f.name)+'</span><div class="snip">'+snip+'</div></span>'
          +'<span class="pi-line">стр. '+(item.line+1)+'</span></button>';
      }else{
        html+='<button class="pal-item" data-i="'+i+'"><span class="pi-ico"'+(item.c.danger?' style="color:var(--danger)"':'')+'>'+ic(item.c.icon,15)+'</span>'
          +'<span class="pi-main"><span class="pi-name"'+(item.c.danger?' style="color:var(--danger)"':'')+'>'+esc(item.c.label)+'</span></span>'
          +(item.c.kbd?'<kbd>'+item.c.kbd+'</kbd>':'')+'</button>';
      }
    });
  });
  list.innerHTML=html;
  list.querySelectorAll('.pal-item').forEach(b=>{
    b.addEventListener('click',()=>runPalItem(+b.dataset.i));
    b.addEventListener('mousemove',()=>setPalIdx(+b.dataset.i,true));
  });
  setPalIdx(0,true);
}
function setPalIdx(i,soft){
  pal.idx=clamp(i,0,pal.items.length-1);
  $$('#palList .pal-item').forEach(b=>b.classList.toggle('active',+b.dataset.i===pal.idx));
  if(!soft){
    const act=$('#palList .pal-item.active');
    if(act) act.scrollIntoView({block:'nearest'});
  }
}
function runPalItem(i){
  const item=pal.items[i]; if(!item) return;
  closeTop();
  if(item.kind==='file') switchFile(item.f.id);
  else if(item.kind==='match'){ switchFile(item.f.id,{focus:false}); setTimeout(()=>jumpToLine(item.line,item.col),60); }
  else item.c.run();
}
const palSearch=debounce(()=>renderPal($('#palInput').value),110);
$('#palInput').addEventListener('input',palSearch);
$('#palInput').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){ e.preventDefault(); setPalIdx(pal.idx+1); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); setPalIdx(pal.idx-1); }
  else if(e.key==='Enter'){ e.preventDefault(); runPalItem(pal.idx); }
});
/* ---------- тосты ---------- */
function toast(type,msg,opts={}){
  const box=$('#toasts');
  while(box.children.length>=3) box.firstChild.remove();
  const t=document.createElement('div');
  t.className='toast '+type;
  const icons={success:'checkCircle',info:'info',warn:'alert',danger:'xCircle'};
  const timeout=opts.timeout||5000;
  t.innerHTML='<span class="t-ico">'+ic(icons[type]||'info',16)+'</span>'
    +'<div class="t-body"><div class="t-msg">'+esc(msg)+'</div>'
    +(opts.action?'<button class="t-action">'+esc(opts.action.label)+'</button>':'')+'</div>'
    +'<button class="t-close" aria-label="Закрыть">'+ic('x',12)+'</button>'
    +'<span class="t-bar" style="animation-duration:'+timeout+'ms"></span>';
  box.appendChild(t);
  let timer=setTimeout(dismiss,timeout), remain=timeout, start=Date.now();
  function dismiss(){ clearTimeout(timer); t.classList.add('leaving'); setTimeout(()=>t.remove(),200); }
  t.addEventListener('mouseenter',()=>{ clearTimeout(timer); remain-=Date.now()-start; t.querySelector('.t-bar').style.animationPlayState='paused'; });
  t.addEventListener('mouseleave',()=>{ start=Date.now(); timer=setTimeout(dismiss,Math.max(600,remain)); t.querySelector('.t-bar').style.animationPlayState='running'; });
  t.querySelector('.t-close').addEventListener('click',dismiss);
  if(opts.action) t.querySelector('.t-action').addEventListener('click',()=>{ dismiss(); opts.action.fn(); });
}
/* ---------- тема / раскладка / сайдбар ---------- */
function applyTheme(){
  document.documentElement.dataset.theme=S.prefs.theme;
  $('#themeBtn').innerHTML=ic(S.prefs.theme==='dark'?'sun':'moon');
  $('#themeBtn').title=S.prefs.theme==='dark'?'Светлая тема':'Тёмная тема';
}
function toggleTheme(){
  S.prefs.theme=S.prefs.theme==='dark'?'light':'dark';
  applyTheme(); markDirty();
  const t=previewTargetFile();
  if(t&&(langOf(t.name)==='md'||extOf(t.name)==='svg')) rebuildPreview();
}
function setLayout(l){
  S.prefs.layout=l;
  $('#main').dataset.layout=l;
  $$('#layoutSeg .seg-btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===l)));
  if(l!=='code'&&(S.pv.stale||!$('#pvIframe').srcdoc)) rebuildPreview();
  markDirty();
}
function closeMobileSidebar(){ $('#sidebar').classList.remove('open'); $('#sbScrim').hidden=true; }
function toggleSidebar(){
  if(window.innerWidth<=900){
    const open=$('#sidebar').classList.toggle('open');
    $('#sbScrim').hidden=!open;
  }else{
    S.prefs.sidebar=!S.prefs.sidebar;
    $('#sidebar').style.display=S.prefs.sidebar?'':'none';
    $('#sbDivider').style.display=S.prefs.sidebar?'':'none';
    $('#sidebarBtn').setAttribute('aria-pressed',String(S.prefs.sidebar));
    markDirty();
  }
}
$('#sbScrim').addEventListener('click',closeMobileSidebar);
/* ---------- drag & drop: порядок и импорт ---------- */
let dragId=null;
function bindReorder(container, itemSel, onDrop, horizontal){
  container.addEventListener('dragstart',e=>{
    const it=e.target.closest(itemSel); if(!it||it.draggable===false){ e.preventDefault(); return; }
    dragId=it.dataset.id; it.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
    try{ e.dataTransfer.setData('text/plain',dragId); }catch(_){}
  });
  container.addEventListener('dragover',e=>{
    if(!dragId) return;
    const it=e.target.closest(itemSel); if(!it||it.dataset.id===dragId) return;
    e.preventDefault(); e.dataTransfer.dropEffect='move';
    const r=it.getBoundingClientRect();
    const before=horizontal?(e.clientX<r.left+r.width/2):(e.clientY<r.top+r.height/2);
    container.querySelectorAll(itemSel).forEach(x=>x.classList.remove('drop-before','drop-after'));
    it.classList.add(before?'drop-before':'drop-after');
  });
  container.addEventListener('drop',e=>{
    if(!dragId) return;
    const it=e.target.closest(itemSel); if(!it) return;
    e.preventDefault();
    const r=it.getBoundingClientRect();
    const before=horizontal?(e.clientX<r.left+r.width/2):(e.clientY<r.top+r.height/2);
    onDrop(dragId,it.dataset.id,before);
    cleanup();
  });
  container.addEventListener('dragend',cleanup);
  function cleanup(){
    dragId=null;
    container.querySelectorAll(itemSel).forEach(x=>x.classList.remove('dragging','drop-before','drop-after'));
  }
}
bindReorder($('#fileList'),'.f-item',(src,target,before)=>{
  if(S.prefs.sort!=='manual') return;
  S.order=S.order.filter(id=>id!==src);
  let i=S.order.indexOf(target); if(!before) i++;
  S.order.splice(i,0,src);
  renderSidebar(); markDirty();
},false);
bindReorder($('#tabs'),'.tab',(src,target,before)=>{
  S.tabs=S.tabs.filter(id=>id!==src);
  let i=S.tabs.indexOf(target); if(!before) i++;
  S.tabs.splice(i,0,src);
  renderTabs(); markDirty();
},true);
/* импорт перетаскиванием из ОС */
let dragDepth=0;
window.addEventListener('dragenter',e=>{
  if(e.dataTransfer&&Array.from(e.dataTransfer.types).includes('Files')){
    dragDepth++; $('#dropOverlay').hidden=false;
  }
});
window.addEventListener('dragleave',e=>{
  if(e.dataTransfer&&Array.from(e.dataTransfer.types).includes('Files')){
    dragDepth=Math.max(0,dragDepth-1);
    if(!dragDepth) $('#dropOverlay').hidden=true;
  }
});
window.addEventListener('dragover',e=>{
  if(e.dataTransfer&&Array.from(e.dataTransfer.types).includes('Files')) e.preventDefault();
});
window.addEventListener('drop',e=>{
  if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length){
    e.preventDefault();
    dragDepth=0; $('#dropOverlay').hidden=true;
    importFiles(e.dataTransfer.files);
  }
});
$('#fileInput').addEventListener('change',e=>{ importFiles(e.target.files); e.target.value=''; });
/* ---------- делители ---------- */
function bindDivider(el,onMove,onEnd){
  el.addEventListener('pointerdown',e=>{
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    document.body.classList.add('drag-x');
    const move=ev=>onMove(ev);
    const up=()=>{
      el.removeEventListener('pointermove',move);
      el.removeEventListener('pointerup',up);
      document.body.classList.remove('drag-x');
      onEnd&&onEnd();
    };
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerup',up);
  });
}
bindDivider($('#sbDivider'),e=>{
  const w=clamp(e.clientX,200,420);
  S.prefs.sbWidth=w; $('#sidebar').style.width=w+'px';
},()=>markDirty());
bindDivider($('#pvDivider'),e=>{
  const r=$('#main').getBoundingClientRect();
  const pct=clamp((r.right-e.clientX)/r.width*100,24,72);
  S.prefs.pvWidth=pct; $('#previewPane').style.flexBasis=pct+'%';
},()=>markDirty());
$('#pvDivider').addEventListener('dblclick',()=>{ S.prefs.pvWidth=46; $('#previewPane').style.flexBasis='46%'; markDirty(); });
$('#sbDivider').addEventListener('dblclick',()=>{ S.prefs.sbWidth=264; $('#sidebar').style.width='264px'; markDirty(); });
/* ---------- события UI ---------- */
function bindEvents(){
  $('#fileList').addEventListener('click',e=>{
    const item=e.target.closest('.f-item'); if(!item) return;
    const f=fileById(item.dataset.id); if(!f) return;
    if(e.target.closest('.f-menu')){ openFileMenu(f,e.target.closest('.f-menu')); return; }
    if(e.target.closest('.f-check')){
      const cb=e.target.closest('.f-check');
      if(cb.checked) S.bulk.add(f.id); else S.bulk.delete(f.id);
      item.classList.toggle('selected',cb.checked);
      $('#fileList').classList.toggle('bulk-mode',S.bulk.size>0);
      updateBulkBar(); return;
    }
    if(e.target.closest('.f-grip')) return;
    switchFile(f.id);
  });
  $('#sbFilter').addEventListener('input',e=>{ S.filter=e.target.value; renderSidebar(); });
  $('#sbClear').addEventListener('click',()=>{ S.filter=''; $('#sbFilter').value=''; renderSidebar(); $('#sbFilter').focus(); });
  $('#sbSort').addEventListener('change',e=>{ S.prefs.sort=e.target.value; renderSidebar(); markDirty(); });
  $('#newFileBtn').addEventListener('click',()=>openFileModal('new'));
  $('#tabAdd').addEventListener('click',()=>openFileModal('new'));
  $('#importBtn').addEventListener('click',()=>$('#fileInput').click());
  $('#emptyNewBtn').addEventListener('click',()=>openFileModal('new'));
  $('#emptyImportBtn').addEventListener('click',()=>$('#fileInput').click());
  $('#pvEmptyBtn').addEventListener('click',()=>openFileModal('new'));
  $('#bulkClear').addEventListener('click',()=>{ S.bulk.clear(); renderSidebar(); });
  $('#bulkDel').addEventListener('click',()=>{ deleteFiles(Array.from(S.bulk)); });
  $('#bulkZip').addEventListener('click',()=>{
    const files=Array.from(S.bulk).map(fileById).filter(Boolean);
    if(!files.length) return;
    zipFiles(files,'hubpad-selection.zip');
    toast('success','Выбранные файлы скачаны как hubpad-selection.zip',{timeout:3500});
  });
  $('#tabs').addEventListener('click',e=>{
    const tab=e.target.closest('.tab'); if(!tab) return;
    if(e.target.closest('.tab-close')){ closeTab(tab.dataset.id); return; }
    if(tab.dataset.id!==S.active) switchFile(tab.dataset.id);
  });
  $('#tabs').addEventListener('auxclick',e=>{
    if(e.button!==1) return;
    const tab=e.target.closest('.tab'); if(!tab) return;
    e.preventDefault(); closeTab(tab.dataset.id);
  });
  ['undoBtn','redoBtn','wrapBtn','fontMinus','fontPlus','copyBtn','pasteBtn','clearBtn','wsBtn'].forEach(id=>{
    $('#'+id).addEventListener('mousedown',e=>e.preventDefault());
  });
  $('#undoBtn').addEventListener('click',()=>{ undoRedo(-1); code.focus({preventScroll:true}); });
  $('#redoBtn').addEventListener('click',()=>{ undoRedo(1); code.focus({preventScroll:true}); });
  $('#wrapBtn').addEventListener('click',()=>{
    S.prefs.wrap=!S.prefs.wrap; applyEditorPrefs(); renderCode();
    if(S.prefs.wrap) edScroll.scrollLeft=0;
    markDirty(); code.focus({preventScroll:true});
  });
  $('#wsBtn').addEventListener('click',()=>{
    S.prefs.ws=!S.prefs.ws;
    $('#wsBtn').setAttribute('aria-pressed',String(S.prefs.ws));
    renderCode(); markDirty();
    code.focus({preventScroll:true});
  });
  $('#fontMinus').addEventListener('click',()=>setFont(S.prefs.font-1));
  $('#fontPlus').addEventListener('click',()=>setFont(S.prefs.font+1));
  $('#tabSizeSel').addEventListener('change',e=>{ S.prefs.tab=+e.target.value; applyEditorPrefs(); markDirty(); });
  $('#sidebarBtn').addEventListener('click',toggleSidebar);
  $('#crumbFile').addEventListener('click',()=>{ const f=activeFile(); if(f) openFileModal('rename',f); });
  $('#copyBtn').addEventListener('click',async()=>{
    const f=activeFile(); if(!f) return;
    const txt=code.value;
    let ok=false;
    try{ await navigator.clipboard.writeText(txt); ok=true; }
    catch(e){
      try{
        const ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select(); ok=document.execCommand('copy'); ta.remove();
      }catch(_){}
    }
    if(ok){
      $('#copyBtn').innerHTML=ic('check');
      setTimeout(()=>{ $('#copyBtn').innerHTML=ic('copy'); },1200);
      toast('success','Скопировано '+txt.length+' '+plural(txt.length,['символ','символа','символов']),{timeout:2400});
    }else toast('warn','Не удалось скопировать — выделите текст и нажмите Ctrl+C');
    code.focus({preventScroll:true});
  $('#pasteBtn').addEventListener('click',async()=>{
    const f=activeFile(); if(!f) return;
    const s=code.selectionStart, en=code.selectionEnd;
    let txt=null;
    try{ txt=await navigator.clipboard.readText(); }catch(e){}
    if(txt===null){
      code.focus({preventScroll:true});
      toast('warn','Буфер недоступен — нажмите Ctrl+V или «Вставить» долгим нажатием',{timeout:4500});
      return;
    }
    if(!txt){ toast('info','Буфер обмена пуст',{timeout:2200}); return; }
    const v=code.value;
    applyEdit(v.slice(0,s)+txt+v.slice(en), s+txt.length, s+txt.length, 'paste');
    code.focus({preventScroll:true});
    toast('success','Вставлено '+txt.length+' '+plural(txt.length,['символ','символа','символов']),{timeout:2400});
  });
  $('#clearBtn').addEventListener('click',()=>{
    const f=activeFile(); if(!f) return;
    if(!code.value){ toast('info','Файл уже пуст',{timeout:2000}); return; }
    const n=code.value.length;
    applyEdit('',0,0,'clear');
    code.focus({preventScroll:true});
    toast('warn','Очищено '+n+' '+plural(n,['символ','символа','символов']),{timeout:7000,action:{label:'Отменить',fn:()=>undoRedo(-1)}});
  });
  });
  $$('#layoutSeg .seg-btn').forEach(b=>b.addEventListener('click',()=>setLayout(b.dataset.layout)));
  $('#themeBtn').addEventListener('click',toggleTheme);
  $('#dlBtn').addEventListener('click',openDownload);
  $('#deployBtn').addEventListener('click',deploy);
  $('#searchTrigger').addEventListener('click',openPalette);
  $('#helpBtn').addEventListener('click',shortcutsModal);
  $('#legalBtn').addEventListener('click',legalModal);
  $('#starBtn').addEventListener('click',()=>{
    S.prefs.starred=!S.prefs.starred;
    renderStar();
    if(S.prefs.starred&&!reduceMotion){
      const host=$('#starBtn');
      for(let i=0;i<7;i++){
        const p=document.createElement('span'); p.className='burst-p';
        const a=Math.PI*2*i/7;
        p.style.setProperty('--dx',Math.cos(a)*26+'px');
        p.style.setProperty('--dy',Math.sin(a)*22+'px');
        p.style.background=['var(--gold)','var(--accent)','var(--pink)'][i%3];
        host.appendChild(p);
        p.addEventListener('animationend',()=>p.remove());
      }
    }
    markDirty();
  });
  $$('#pvDeviceSeg .seg-btn').forEach(b=>b.addEventListener('click',()=>{
    S.prefs.device=b.dataset.device; applyDevice(); markDirty();
  }));
  $('#pvAuto').addEventListener('click',()=>{
    S.prefs.auto=!S.prefs.auto;
    $('#pvAuto').setAttribute('aria-checked',String(S.prefs.auto));
    if(S.prefs.auto&&S.pv.stale) rebuildPreview();
    markDirty();
  });
  $('#pvRefresh').addEventListener('click',rebuildPreview);
  $('#pvOpen').addEventListener('click',deploy);
  $('#pvClose').addEventListener('click',()=>setLayout('code'));
  $('#pvTargetChip').addEventListener('click',()=>{ const t=previewTargetFile(); if(t) switchFile(t.id); });
  $('#stProblems').addEventListener('click',openProblems);
  edScroll.addEventListener('scroll',()=>{ edScroll.classList.toggle('hscroll',edScroll.scrollLeft>0); },{passive:true});
  document.addEventListener('keydown',e=>{
    const mod=e.ctrlKey||e.metaKey;
    if(e.key==='Escape'){
      if(popKind){ closePop(); return; }
      if(layers.length){ e.preventDefault(); closeTop(); return; }
      if($('#sidebar').classList.contains('open')){ closeMobileSidebar(); return; }
      return;
    }
    if(layers.length){
      if(e.key==='Tab') trapTab(e,layers[layers.length-1].el);
      if(mod&&e.key.toLowerCase()==='k'){ e.preventDefault(); if(layers[layers.length-1].type==='palette') closeTop(); else openPalette(); }
      return;
    }
    if(mod&&e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); return; }
    if(mod&&e.key.toLowerCase()==='s'){ e.preventDefault(); downloadCurrent(); return; }
    if(mod&&e.key==='Enter'){ e.preventDefault(); deploy(); return; }
    if(mod&&e.key.toLowerCase()==='b'){ e.preventDefault(); toggleSidebar(); return; }
    if(e.altKey&&!mod&&e.key.toLowerCase()==='w'){ e.preventDefault(); $('#wsBtn').click(); return; }
    if(e.altKey&&!mod&&e.key.toLowerCase()==='z'){ e.preventDefault(); $('#wrapBtn').click(); return; }
    const tag=(e.target.tagName||'').toLowerCase();
    const typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
    if(!typing&&!mod){
      if(e.key==='?'){ e.preventDefault(); shortcutsModal(); }
      else if(e.key==='/'){ e.preventDefault(); openPalette(); }
    }
  });
  window.addEventListener('beforeunload',()=>{ scheduleSave.cancel(); persistNow(); });
  setInterval(()=>{ updateSidebarMeta(); },30000);
}
function setFont(px){
  S.prefs.font=clamp(px,11,22);
  applyEditorPrefs(); renderCode(); markDirty();
  code.focus({preventScroll:true});
}
function renderStar(){
  $('#starBtn').classList.toggle('starred',S.prefs.starred);
  $('#starIco').innerHTML=ic('star',14)+'<span>'+(S.prefs.starred?'Звезда есть':'Звезда')+'</span>';
  $('#starCount').textContent=128+(S.prefs.starred?1:0);
}
/* ---------- статичные иконки ---------- */
function paintIcons(){
  $('#brand').innerHTML=LOGO+'<span>HubPad</span>';
  $('#favicon').href='data:image/svg+xml,'+encodeURIComponent(LOGO.replace('hlg','flg'));
  $('#searchIco').innerHTML=ic('search',14);
  $('#dlIco').innerHTML=ic('download',14);
  $('#dlCaret').innerHTML=ic('chevD',10);
  $('#deployIco').innerHTML=ic('external',14);
  $('#sbFolderIco').innerHTML=ic('folder',15);
  $('#newFileBtn').innerHTML=ic('plus');
  $('#importBtn').innerHTML=ic('upload');
  $('#sbClear').innerHTML=ic('x',12);
  $('#bulkZip').innerHTML=ic('archive',13)+'<span>.zip</span>';
  $('#bulkDel').innerHTML=ic('trash',13);
  $('#bulkClear').innerHTML=ic('x',12);
  $('#tabAdd').innerHTML=ic('plus');
  $('#sidebarBtn').innerHTML=ic('sidebar');
  $('#crumbFolderIco').innerHTML=ic('folder',13);
  $('#undoBtn').innerHTML=ic('undo');
  $('#redoBtn').innerHTML=ic('redo');
  $('#copyBtn').innerHTML=ic('copy');
  $('#pasteBtn').innerHTML=ic('paste');
  $('#epIco').innerHTML=ic('code',14);
  $('#clearBtn').innerHTML=ic('trash');
  $('#wrapBtn').innerHTML=ic('wrap');
  $('#wsBtn').innerHTML=ic('pilcrow');
  const segIco={code:'code',split:'split',preview:'eye'}, segLbl={code:'Код',split:'Сплит',preview:'Превью'};
  $$('#layoutSeg .seg-btn').forEach(b=>{ b.innerHTML=ic(segIco[b.dataset.layout],14)+'<span class="seg-label">'+segLbl[b.dataset.layout]+'</span>'; });
  $('#edEmptyIco').innerHTML=ic('code',28);
  $('#emptyNewBtn').innerHTML=ic('plus',14)+'Новый файл';
  $('#emptyImportBtn').innerHTML=ic('upload',14)+'Импорт';
  $('#stBranch').innerHTML=ic('branch',13)+'main';
  $('#helpBtn').innerHTML=ic('keyboard',14);
  $('#pvEye').innerHTML=ic('eye',15);
  const devIco={'375':'phone','768':'tablet','auto':'monitor'};
  $$('#pvDeviceSeg .seg-btn').forEach(b=>{ b.innerHTML=ic(devIco[b.dataset.device],14); });
  $('#pvRefresh').innerHTML=ic('refresh');
  $('#pvOpen').innerHTML=ic('external');
  $('#pvClose').innerHTML=ic('x');
  $('#pvEmptyIco').innerHTML=ic('eye',28);
  $('#pvEmptyBtn').innerHTML=ic('plus',14)+'Создать HTML-страницу';
  $('#palSearchIco').innerHTML=ic('search',16);
  $('#dlPopIco').innerHTML=ic('download',15);
  $('#dlGo').innerHTML=ic('download',14)+'Скачать файл';
  $('#dlZip').innerHTML=ic('archive',14)+'Скачать проект (.zip)';
  $('#dropIco').innerHTML=ic('upload',30);
  renderStar();
}
/* ---------- инициализация ---------- */
function init(){
  loadState();
  applyTheme();
  paintIcons();
  applyEditorPrefs();
  $('#sidebar').style.width=S.prefs.sbWidth+'px';
  if(!S.prefs.sidebar&&window.innerWidth>900){ $('#sidebar').style.display='none'; $('#sbDivider').style.display='none'; }
  $('#sidebarBtn').setAttribute('aria-pressed',String(S.prefs.sidebar));
  $('#previewPane').style.flexBasis=S.prefs.pvWidth+'%';
  $('#sbSort').value=S.prefs.sort;
  $('#pvAuto').setAttribute('aria-checked',String(S.prefs.auto));
  setLayout(S.prefs.layout);
  bindEvents();
  renderSidebar(); renderTabs();
  retargetPreview();
  if(S.active&&fileById(S.active)) switchFile(S.active,{focus:true});
  else if(S.tabs.length) switchFile(S.tabs[0]);
  else emptyEditor();
  rebuildPreview();
  runCheck();
  setSaved(S.storageOK?'ok':'off');
  if(!S.storageOK) toast('warn','Локальное хранилище недоступно — проект не сохранится после закрытия',{timeout:6000});
  let resetFlag=false;
  try{ resetFlag=!!sessionStorage.getItem('hubpad-reset'); sessionStorage.removeItem('hubpad-reset'); }catch(e){}
  if(resetFlag) setTimeout(()=>toast('success','Демо-проект восстановлен',{timeout:3500}),400);
  else if(S.firstRun) setTimeout(()=>toast('info','Демо-проект Pulse загружен. Ctrl+K — палитра команд.',{timeout:7000,action:{label:'Горячие клавиши',fn:shortcutsModal}}),700);
}
try{ init(); }
catch(err){
  document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;left:12px;bottom:12px;z-index:999;background:#da3633;color:#fff;padding:10px 14px;border-radius:8px;font-size:13px">Ошибка запуска: '+esc(err.message)+'</div>');
  throw err;
}
})();
