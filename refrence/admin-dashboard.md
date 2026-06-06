<!DOCTYPE html>
<!--
  Tappi Admin Dashboard
  Single-file HTML. Everything is inline so you can open it directly or drop it into your app.

  HOW TO ADJUST:
  - Brand business name + greeting: search for "Copper Spoon"
  - Colors / fonts / spacing: see the :root variables in the <style> block
  - Numbers and content: see the DATA object near the bottom of the <script> block
-->
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Tappi Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    /* Surfaces */
    --paper:      #f6f3ec;   /* page background, warm cream */
    --surface:    #fffdf8;   /* cards */
    --surface-2:  #f1ece2;   /* tinted chip backgrounds */

    /* Text */
    --ink:        #211c16;   /* primary text, warm near-black */
    --ink-soft:   #756b5e;   /* secondary text */
    --ink-faint:  #a39a8b;   /* tertiary / captions */

    /* Lines + elevation (one language: hairline border + soft hover lift) */
    --line:       #e6dfd2;
    --shadow:     0 1px 2px rgba(33,28,22,0.04);
    --shadow-lift:0 12px 30px -12px rgba(33,28,22,0.18);

    /* Brand + semantic */
    --accent:      #bd4b2b;  /* terracotta */
    --accent-soft: #f4e2d8;
    --positive:    #5d7a52;  /* sage */
    --positive-soft:#e7ede1;
    --negative:    #b1492f;
    --star:        #d4972c;  /* amber */

    /* Type */
    --display: "Fraunces", Georgia, serif;
    --sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;

    /* Spacing scale */
    --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px;
    --radius: 14px;
    --radius-sm: 10px;
  }

  * { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; }

  body {
    font-family: var(--sans);
    color: var(--ink);
    background-color: var(--paper);
    /* subtle atmosphere instead of a flat fill */
    background-image:
      radial-gradient(1100px 500px at 85% -10%, rgba(189,75,43,0.06), transparent 60%),
      radial-gradient(900px 500px at -5% 0%, rgba(93,122,82,0.05), transparent 55%);
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
    min-height: 100vh;
  }

  /* faint grain for a printed, designed feel */
  body::before {
    content: "";
    position: fixed; inset: 0;
    pointer-events: none;
    opacity: 0.035;
    z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  a { color: inherit; text-decoration: none; }

  /* ---------- Top navigation bar ---------- */
  .topbar {
    position: sticky; top: 0; z-index: 20;
    display: flex; align-items: center; gap: var(--s6);
    padding: 0 var(--s7);
    height: 64px;
    background: rgba(246,243,236,0.82);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .brand { display: flex; align-items: center; gap: var(--s3); }
  .brand-mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--accent);
    display: grid; place-items: center;
    color: #fff; font-family: var(--display); font-weight: 600; font-size: 17px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
  }
  .brand-name { font-family: var(--display); font-weight: 600; font-size: 19px; letter-spacing: -0.01em; }

  .nav { display: flex; align-items: center; gap: var(--s1); margin-left: var(--s4); }
  .nav a {
    padding: 8px 14px; border-radius: 999px;
    font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
    transition: color .15s ease, background .15s ease;
  }
  .nav a:hover { color: var(--ink); background: rgba(33,28,22,0.04); }
  .nav a.active { color: var(--ink); background: var(--surface); box-shadow: var(--shadow); border: 1px solid var(--line); }

  .account { margin-left: auto; display: flex; align-items: center; gap: var(--s4); }
  .acct-chip { display: flex; align-items: center; gap: var(--s3); }
  .avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--positive); color: #fff;
    display: grid; place-items: center; font-weight: 600; font-size: 13px;
  }
  .acct-name { font-size: 14px; font-weight: 600; line-height: 1.1; }
  .acct-role { font-size: 12px; color: var(--ink-faint); }
  .signout {
    font-size: 13.5px; font-weight: 500; color: var(--ink-soft);
    padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line);
    background: var(--surface); transition: all .15s ease;
  }
  .signout:hover { color: var(--ink); border-color: var(--ink-faint); }

  /* ---------- Layout ---------- */
  .wrap { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; padding: var(--s7) var(--s7) 80px; }

  .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--s4); margin-bottom: var(--s6); }
  .greeting { font-family: var(--display); font-weight: 600; font-size: 32px; letter-spacing: -0.02em; margin: 0; }
  .subhead { color: var(--ink-soft); font-size: 14.5px; margin: 6px 0 0; }
  .btn-primary {
    background: var(--accent); color: #fff; border: none;
    padding: 11px 18px; border-radius: var(--radius-sm);
    font-family: var(--sans); font-size: 14px; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform .12s ease, box-shadow .15s ease, filter .15s ease;
    box-shadow: 0 6px 16px -8px rgba(189,75,43,0.6);
  }
  .btn-primary:hover { filter: brightness(1.04); transform: translateY(-1px); }

  /* ---------- Stat strip ---------- */
  .stats { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: var(--s4); margin-bottom: var(--s5); }
  .stat {
    background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
    padding: var(--s5); box-shadow: var(--shadow);
  }
  .stat.hero { background: linear-gradient(160deg, #ffffff, #fff7f1); border-color: #f0d8cc; }
  .stat-label { font-size: 13px; color: var(--ink-soft); font-weight: 500; margin: 0 0 10px; display: flex; align-items: center; gap: 7px; }
  .stat-value { font-size: 38px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; font-feature-settings: "tnum" 1; }
  .stat.hero .stat-value { font-size: 46px; }
  .stat-sub { margin-top: 10px; font-size: 13px; color: var(--ink-faint); display: flex; align-items: center; gap: 6px; }
  .delta { font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
  .delta.up { color: var(--positive); }
  .delta.down { color: var(--negative); }
  .stat-icon { width: 16px; height: 16px; color: var(--ink-faint); }
  .stars-inline { display: inline-flex; gap: 1px; vertical-align: middle; }

  /* ---------- Two column main ---------- */
  .grid-main { display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--s4); margin-bottom: var(--s5); }
  .panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--s5); box-shadow: var(--shadow); }
  .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--s5); }
  .panel-title { font-family: var(--display); font-weight: 600; font-size: 18px; margin: 0; letter-spacing: -0.01em; }
  .panel-link { font-size: 13px; font-weight: 600; color: var(--accent); }
  .panel-link:hover { text-decoration: underline; }

  /* chart */
  .chart-wrap { position: relative; }
  .chart svg { width: 100%; height: 180px; display: block; }
  .chart-axis { display: flex; justify-content: space-between; margin-top: 10px; }
  .chart-axis span { font-size: 11.5px; color: var(--ink-faint); font-weight: 500; }

  /* reviews */
  .review { padding: var(--s4) 0; border-top: 1px solid var(--line); }
  .review:first-of-type { border-top: none; padding-top: 0; }
  .review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .review-name { font-weight: 600; font-size: 14px; }
  .review-time { font-size: 12px; color: var(--ink-faint); }
  .review-text { font-size: 13.5px; color: var(--ink-soft); margin: 0; }

  /* ---------- Manage cards ---------- */
  .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); margin: 0 0 var(--s4); }
  .manage { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s4); }
  .card {
    background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
    padding: var(--s5); box-shadow: var(--shadow);
    transition: transform .14s ease, box-shadow .18s ease, border-color .18s ease;
    cursor: pointer; display: block;
  }
  .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); border-color: #d8cdbb; }
  .card-icon {
    width: 42px; height: 42px; border-radius: 11px;
    background: var(--accent-soft); color: var(--accent);
    display: grid; place-items: center; margin-bottom: var(--s4);
  }
  .card-icon svg { width: 21px; height: 21px; }
  .card-title { font-family: var(--display); font-weight: 600; font-size: 17px; margin: 0 0 4px; }
  .card-count { font-size: 13.5px; color: var(--ink-soft); }
  .card-count strong { color: var(--ink); font-weight: 600; }

  /* entrance motion */
  .reveal { opacity: 0; transform: translateY(10px); animation: rise .55s cubic-bezier(.2,.7,.3,1) forwards; }
  @keyframes rise { to { opacity: 1; transform: none; } }

  /* ---------- Responsive ---------- */
  @media (max-width: 920px) {
    .wrap { padding: var(--s5) var(--s4) 60px; }
    .topbar { padding: 0 var(--s4); gap: var(--s4); }
    .nav { display: none; }
    .acct-name, .acct-role { display: none; }
    .stats { grid-template-columns: 1fr 1fr; }
    .stat.hero { grid-column: 1 / -1; }
    .grid-main { grid-template-columns: 1fr; }
    .manage { grid-template-columns: 1fr 1fr; }
    .greeting { font-size: 26px; }
  }
  @media (max-width: 520px) {
    .stats, .manage { grid-template-columns: 1fr; }
    .page-head { flex-direction: column; align-items: flex-start; }
  }
</style>
</head>
<body>

  <!-- Top navigation -->
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">T</div>
      <span class="brand-name">Tappi</span>
    </div>
    <nav class="nav">
      <a href="#" class="active">Overview</a>
      <a href="#">Menu</a>
      <a href="#">Tags</a>
      <a href="#">Analytics</a>
      <a href="#">Reviews</a>
    </nav>
    <div class="account">
      <div class="acct-chip">
        <div class="avatar">CS</div>
        <div>
          <div class="acct-name">The Copper Spoon</div>
          <div class="acct-role">Owner</div>
        </div>
      </div>
      <a href="#" class="signout">Sign out</a>
    </div>
  </header>

  <main class="wrap">

    <!-- Header -->
    <div class="page-head reveal" style="animation-delay:.02s">
      <div>
        <h1 class="greeting" id="greeting">Good afternoon, Copper Spoon</h1>
        <p class="subhead" id="dateline">Here is how your menu is performing.</p>
      </div>
      <button class="btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        View live menu
      </button>
    </div>

    <!-- Stat strip -->
    <section class="stats">
      <div class="stat hero reveal" style="animation-delay:.06s">
        <p class="stat-label">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          Menu opens this week
        </p>
        <div class="stat-value" id="s-opens">0</div>
        <div class="stat-sub">
          <span class="delta up" id="s-opens-delta">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>
            18%
          </span>
          vs last week
        </div>
      </div>

      <div class="stat reveal" style="animation-delay:.10s">
        <p class="stat-label">New reviews</p>
        <div class="stat-value" id="s-reviews">0</div>
        <div class="stat-sub">since you last logged in</div>
      </div>

      <div class="stat reveal" style="animation-delay:.14s">
        <p class="stat-label">Average rating</p>
        <div class="stat-value" id="s-rating">0.0</div>
        <div class="stat-sub">
          <span class="stars-inline" id="s-rating-stars"></span>
          across 312 reviews
        </div>
      </div>

      <div class="stat reveal" style="animation-delay:.18s">
        <p class="stat-label">Active tags</p>
        <div class="stat-value" id="s-tags">0</div>
        <div class="stat-sub">2 unassigned</div>
      </div>
    </section>

    <!-- Main two column -->
    <section class="grid-main">
      <div class="panel reveal" style="animation-delay:.22s">
        <div class="panel-head">
          <h2 class="panel-title">Engagement</h2>
          <a href="#" class="panel-link">Full analytics</a>
        </div>
        <div class="chart-wrap chart">
          <svg id="chart" viewBox="0 0 640 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18" />
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path id="chart-area" fill="url(#area)" />
            <path id="chart-line" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="chart-axis" id="chart-axis"></div>
        </div>
      </div>

      <div class="panel reveal" style="animation-delay:.26s">
        <div class="panel-head">
          <h2 class="panel-title">Recent reviews</h2>
          <a href="#" class="panel-link">See all</a>
        </div>
        <div id="reviews-list"></div>
      </div>
    </section>

    <!-- Manage / sections -->
    <p class="section-label reveal" style="animation-delay:.30s">Manage</p>
    <section class="manage">
      <a class="card reveal" href="#" style="animation-delay:.32s">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M5 2v20"/><path d="M19 2v9a3 3 0 0 1-3 3v8"/></svg>
        </div>
        <h3 class="card-title">Menu</h3>
        <div class="card-count"><strong>48</strong> items in 6 categories</div>
      </a>

      <a class="card reveal" href="#" style="animation-delay:.36s">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
        </div>
        <h3 class="card-title">Tags</h3>
        <div class="card-count"><strong>12</strong> active, 2 unassigned</div>
      </a>

      <a class="card reveal" href="#" style="animation-delay:.40s">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-6 4 3 5-7"/></svg>
        </div>
        <h3 class="card-title">Analytics</h3>
        <div class="card-count">Opens, taps and trends</div>
      </a>

      <a class="card reveal" href="#" style="animation-delay:.44s">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 3.5 14 8.6l5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z"/></svg>
        </div>
        <h3 class="card-title">Reviews</h3>
        <div class="card-count"><strong>4.8</strong> avg, 3 new</div>
      </a>
    </section>
  </main>

<script>
  /* =========================================================
     DATA  -  swap these values for your real backend numbers
     ========================================================= */
  const DATA = {
    business: "Copper Spoon",
    opensThisWeek: 1284,
    opensDeltaPct: 18,        // positive = up, negative = down
    newReviews: 3,
    avgRating: 4.8,
    activeTags: 12,
    // 7 day engagement (oldest to newest)
    engagement: [820, 905, 1010, 880, 1180, 1395, 1284],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    reviews: [
      { name: "Maria L.",  stars: 5, time: "2h ago",  text: "The truffle pasta was unreal. Found it instantly by tapping the table tag." },
      { name: "James W.",  stars: 5, time: "Yesterday", text: "Loved being able to see photos of every dish before ordering." },
      { name: "Priya S.",  stars: 4, time: "2 days ago", text: "Great menu, very easy to browse. Wish the specials updated a little faster." },
    ],
  };

  /* ---------- helpers ---------- */
  const fmt = n => n.toLocaleString("en-US");
  const $ = id => document.getElementById(id);

  function starSvg(filled) {
    const c = filled ? "var(--star)" : "var(--line)";
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="${c}" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"><path d="M11.5 3.5 14 8.6l5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z"/></svg>`;
  }
  function starsRow(n) {
    let out = "";
    for (let i = 1; i <= 5; i++) out += starSvg(i <= n);
    return out;
  }

  /* ---------- greeting + date ---------- */
  (function () {
    const h = new Date().getHours();
    const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    $("greeting").textContent = `Good ${part}, ${DATA.business}`;
    $("dateline").textContent = new Date().toLocaleDateString("en-US",
      { weekday: "long", month: "long", day: "numeric" }) + " . Here is how your menu is performing.";
  })();

  /* ---------- stat values ---------- */
  $("s-opens").textContent  = fmt(DATA.opensThisWeek);
  $("s-reviews").textContent = DATA.newReviews;
  $("s-rating").textContent = DATA.avgRating.toFixed(1);
  $("s-tags").textContent   = DATA.activeTags;
  $("s-rating-stars").innerHTML = starsRow(Math.round(DATA.avgRating));

  const dEl = $("s-opens-delta");
  const up = DATA.opensDeltaPct >= 0;
  dEl.className = "delta " + (up ? "up" : "down");
  dEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}"/></svg> ${Math.abs(DATA.opensDeltaPct)}%`;

  /* ---------- chart ---------- */
  (function () {
    const W = 640, H = 180, pad = 8;
    const vals = DATA.engagement;
    const max = Math.max(...vals) * 1.1, min = Math.min(...vals) * 0.85;
    const x = i => pad + (i * (W - pad * 2)) / (vals.length - 1);
    const y = v => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    const pts = vals.map((v, i) => [x(i), y(v)]);

    // smooth-ish line using simple curves
    let line = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1], [cx, cy] = pts[i];
      const mx = (px + cx) / 2;
      line += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
    }
    $("chart-line").setAttribute("d", line);
    $("chart-area").setAttribute("d", `${line} L ${pts[pts.length-1][0]} ${H} L ${pts[0][0]} ${H} Z`);

    $("chart-axis").innerHTML = DATA.days.map(d => `<span>${d}</span>`).join("");
  })();

  /* ---------- reviews ---------- */
  $("reviews-list").innerHTML = DATA.reviews.map(r => `
    <div class="review">
      <div class="review-top">
        <span class="review-name">${r.name}</span>
        <span class="review-time">${r.time}</span>
      </div>
      <div class="stars-inline" style="margin-bottom:6px">${starsRow(r.stars)}</div>
      <p class="review-text">${r.text}</p>
    </div>
  `).join("");
</script>
</body>
</html>