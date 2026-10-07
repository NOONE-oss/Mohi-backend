/* MOHI overview dashboards v2 (School Admin + IT Support). Loaded after the main script. */
(function () {
  const S = (d, x) => `<svg viewBox="0 0 24 24" width="${x || 18}" height="${x || 18}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    overview: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    centers: '<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    classes: '<path d="M4 5h7v14H4zM13 5h7v14h-7z"/>',
    subjects: '<path d="M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1zM22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z"/>',
    teachers: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    students: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 1.5 5 5"/>',
    exams: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h7"/>',
    results: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    notifications: '<path d="M6 17V11a6 6 0 1112 0v6l2 2H4z"/><path d="M10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
  };
  const css = `
  body:has(#adminShell.visible) .letterhead{display:none}
  body:has(#adminShell.visible) .stage{max-width:none;padding:0}
  #adminShell.visible{min-height:100vh}
  body.role-school{--ov:#14a8a0;--ov-bg:rgba(20,168,160,.16);--ov-fg:#5eead4}
  body.role-it{--ov:#2f64d6;--ov-bg:#2f64d6;--ov-fg:#fff}
  body.role-school .sidebar button.nav-item.active,body.role-it .sidebar button.nav-item.active{background:var(--ov-bg);color:var(--ov-fg)}
  .sidebar{width:236px}
  .sidebar button.nav-item{padding:11px 12px;font-size:.93rem}
  .sidebar button.nav-item svg{flex-shrink:0;opacity:.85}
  .sb-user{display:flex;align-items:center;gap:10px;margin-top:auto;padding:12px 6px;border-top:1px solid rgba(255,255,255,.1);font-size:.78rem;color:#fff}
  .sb-user small{display:block;color:#9AA6BF}
  .sb-user+.logout{margin-top:0!important}
  .ov-av{width:36px;height:36px;border-radius:50%;background:var(--ov);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0}
  .main{padding:26px 34px}
  .ov-top{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:6px}
  .ov-title{font-family:'Inter',sans-serif;font-weight:800;font-size:2.1rem;margin:0;letter-spacing:-.01em}
  .ov-pill{font-size:.74rem;font-weight:600;padding:3px 11px;border-radius:20px;border:1px solid var(--ov);color:var(--ov);margin-left:12px;vertical-align:middle;white-space:nowrap}
  .ov-tools{display:flex;align-items:center;gap:12px}
  .ov-search{display:flex;align-items:center;gap:8px;background:var(--paper-raised);border:1px solid var(--line);border-radius:10px;padding:0 12px;color:var(--text-soft)}
  .ov-search input{border:none;background:none;margin:0;padding:10px 0;width:170px;outline:none;color:var(--text);font-size:.88rem}
  .ov-bell{position:relative;color:var(--text);display:inline-flex}
  .ov-bell i{position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:var(--ov)}
  .ov-crumb{font-size:.78rem;color:var(--text-soft);margin:0 0 4px}
  .ov-lede{color:var(--text-soft);font-size:.92rem;margin:4px 0 0}
  .ov-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin:22px 0}
  .ov-card{background:var(--paper-raised);border:1px solid var(--line);border-radius:14px;padding:18px 20px;text-align:center}
  .ov-card:first-child{border-color:var(--ov)}
  .ov-card .ic{display:block;margin:0 auto 6px;width:fit-content}
  .ov-card .lbl{font-size:.88rem;color:var(--text-soft)}
  .ov-card .num{display:block;font-family:'Inter',sans-serif;font-weight:800;font-size:2.7rem;line-height:1.15;margin:4px 0}
  .ov-card .sub{font-size:.76rem;color:var(--text-soft)}
  .ov-card:nth-child(1) .ic{color:#2dd4bf}.ov-card:nth-child(2) .ic{color:#a78bfa}.ov-card:nth-child(3) .ic{color:#fb923c}.ov-card:nth-child(4) .ic{color:#34d399}
  .ov-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:18px;align-items:start}
  .ov-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  @media(max-width:960px){.ov-grid,.ov-grid2{grid-template-columns:1fr}.main{padding:20px 16px}}
  .ov-panel{background:var(--paper-raised);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin-bottom:18px}
  .ov-panel h3{font-family:'Inter',sans-serif;font-weight:700;font-size:1.15rem;margin:0 0 4px}
  .ov-panel .cap{font-size:.8rem;color:var(--text-soft);margin:0 0 14px}
  .ov-panel table{white-space:nowrap}
  .ov-panel td,.ov-panel th{padding:11px 10px}
  .ov-panel td.n{color:var(--text-soft);width:26px}
  .ov-tw{overflow-x:auto}
  .ov-grid .xc,.ov-grid .xt{display:none}
  .ov-grid .ov-act~.ov-panel table{white-space:normal}
  .ov-pillst{white-space:nowrap}
  .ov-pillst{display:inline-flex;align-items:center;gap:6px;font-size:.74rem;font-weight:600;padding:3px 11px;border-radius:20px;background:rgba(74,201,122,.16);color:#4ac97a}
  .ov-pillst.off{background:rgba(255,255,255,.07);color:var(--text-soft)}
  .ov-pillst.bad{background:rgba(226,100,100,.18);color:#f08a8a}
  .ov-pillst:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
  .g{color:#4ac97a;font-weight:600}.w{color:#e2984a;font-weight:600}
  .ov-bar{display:grid;grid-template-columns:110px 1fr 46px;gap:12px;align-items:center;margin:14px 0;font-size:.88rem}
  .ov-bar .track{height:10px;background:var(--line);border-radius:6px;overflow:hidden}
  .ov-bar .fill{height:100%;background:#3b74e8;border-radius:6px}
  .ov-bar .v{text-align:right;font-weight:600}
  .ov-act button{display:flex;align-items:center;gap:8px;width:100%;margin-bottom:10px;padding:12px 14px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--text);font-weight:600;font-size:.9rem;cursor:pointer;font-family:inherit}
  .ov-act button:first-of-type{background:var(--ov);border-color:var(--ov);color:#fff}
  .ov-list{margin:0;padding-left:18px;font-size:.88rem;line-height:1.9;color:var(--text)}
  .ov-list li::marker{color:var(--ov)}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const fmt = v => (v == null ? '—' : v.toFixed(0) + '%');
  const cls = v => (v == null ? '' : v >= 70 ? 'g' : v < 50 ? 'w' : '');
  window.ovGo = v => { const b = document.querySelector(`.nav-item[data-view="${v}"]`); if (b) b.click(); };
  window.ovFilter = q => document.querySelectorAll('#adminMain tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none'; });

  function decorate(centerName) {
    document.querySelectorAll('.sidebar .nav-item[data-view]').forEach(b => {
      if (b.dataset.ic) return; b.dataset.ic = 1;
      b.insertAdjacentHTML('afterbegin', S(IC[b.dataset.view] || IC.overview));
    });
    const sb = document.querySelector('.sidebar'); if (!sb) return;
    let u = document.getElementById('sbUser');
    if (!u) { u = document.createElement('div'); u.id = 'sbUser'; u.className = 'sb-user'; sb.insertBefore(u, sb.querySelector('.logout')); }
    const ini = (isItSupport ? 'IT' : 'SA');
    u.innerHTML = `<span class="ov-av">${ini}</span><span>${isItSupport ? 'IT Support' : 'Center Admin'}<small>${escapeHtml(centerName)}</small></span>`;
  }

  function trendSvg(pts) {
    if (pts.length < 2) return '<div class="empty">The trend appears once two exams have marks.</div>';
    const w = 520, h = 200, p = 38, vs = pts.map(x => x.v);
    const lo = Math.max(0, Math.floor(Math.min(...vs) / 10) * 10 - 10), hi = Math.min(100, Math.ceil(Math.max(...vs) / 10) * 10 + 10);
    const X = i => p + i * (w - p - 16) / (pts.length - 1), Y = v => h - 34 - (v - lo) / ((hi - lo) || 1) * (h - 56);
    const grid = [0, 1, 2, 3].map(i => { const v = lo + (hi - lo) * i / 3; return `<line x1="${p}" x2="${w - 10}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${p - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--text-soft)">${v.toFixed(0)}</text>`; }).join('');
    const path = pts.map((q, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(q.v).toFixed(1)}`).join(' ');
    const dots = pts.map((q, i) => `<circle cx="${X(i)}" cy="${Y(q.v)}" r="4" fill="#3b74e8"/><text x="${X(i)}" y="${h - 12}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}" font-size="11" fill="var(--text-soft)">${escapeHtml(q.l.length > 16 ? q.l.slice(0, 15) + '…' : q.l)}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block">${grid}<path d="${path}" fill="none" stroke="#3b74e8" stroke-width="2.5"/>${dots}</svg>`;
  }

  window.renderOverview = async function (main) {
    document.body.classList.toggle('role-it', !!isItSupport);
    document.body.classList.toggle('role-school', !isItSupport);
    const [classes, teachers, students, exams] = await Promise.all([api('/classes'), api('/teachers'), api('/students'), api('/exams')]);
    const pct = m => (m.percent != null ? m.percent : (m.points / 8) * 100);
    const used = exams.slice(-6);
    const data = {}; // examId -> classId -> results[]
    await Promise.all(used.flatMap(e => classes.map(async c => {
      let r = []; try { r = await api(`/results?examId=${e.id}&classId=${c.id}`); } catch (x) {}
      (data[e.id] = data[e.id] || {})[c.id] = r;
    })));
    const marksOf = (e, c) => { const o = []; ((data[e.id] || {})[c.id] || []).forEach(r => r.subjects.forEach(s => { if (s.mark) o.push({ p: pct(s.mark), pts: s.mark.points, sub: s.subject.name }); })); return o; };
    const examAvg = e => avg(classes.flatMap(c => marksOf(e, c)).map(m => m.p));
    const latest = [...used].reverse().find(e => examAvg(e) != null) || null;

    const all = latest ? classes.flatMap(c => marksOf(latest, c)) : [];
    const overall = avg(all.map(m => m.p));
    const passRate = all.length ? all.filter(m => m.pts >= 5).length / all.length * 100 : null;
    const bySub = {}; all.forEach(m => (bySub[m.sub] = bySub[m.sub] || []).push(m.p));
    const rows = classes.map(c => {
      const v = latest ? avg(marksOf(latest, c).map(m => m.p)) : null;
      const t = teachers.find(t => t.id === c.class_teacher_id);
      return { name: c.name, n: students.filter(s => s.class_id === c.id).length, t: t ? t.full_name : '—', v };
    });
    const center = escapeHtml(currentCenterName || 'your center');
    decorate(currentCenterName || 'MOHI');

    let org = null;
    if (isItSupport) { try { org = await api('/centers/org-stats'); } catch (e) {} }
    const card = (ic, l, n, s) => `<div class="ov-card"><span class="ic">${S(ic, 26)}</span><span class="lbl">${l}</span><span class="num">${n}</span><span class="sub">${s || '&nbsp;'}</span></div>`;
    const cards = isItSupport
      ? card(IC.students, 'Total Students', org ? org.students : students.length, 'All centers') + card(IC.centers, 'Total Centers', org ? org.centers : '—', 'In the system') +
        card(IC.results, 'Average Score', fmt(overall), center + ' only') + card(IC.exams, 'Pass Rate', fmt(passRate), center + ' only')
      : card(IC.students, 'Total Students', students.length, '') + card(IC.teachers, 'My Teachers', teachers.length, '') +
        card(IC.classes, 'Classes', classes.length, '') + card(IC.results, 'Average', fmt(overall), latest ? escapeHtml(latest.name) : 'No marks yet');

    const bars = Object.entries(bySub).map(([n, v]) => [n, avg(v)]).sort((a, b) => b[1] - a[1])
      .map(([n, v]) => `<div class="ov-bar"><span>${escapeHtml(n)}</span><div class="track"><div class="fill" style="width:${v.toFixed(0)}%"></div></div><span class="v">${v.toFixed(0)}%</span></div>`).join('') || '<div class="empty">Subject averages appear once marks are entered.</div>';

    const classTable = rows.length ? `<div class="ov-tw"><table><thead><tr><th></th><th>Class</th><th>Students</th><th>Class teacher</th><th>Avg score</th><th>Status</th></tr></thead><tbody>${
      rows.map((r, i) => `<tr><td class="n">${i + 1}.</td><td><strong>${escapeHtml(r.name)}</strong></td><td>${r.n} students</td><td>${escapeHtml(r.t)}</td><td class="${cls(r.v)}">${fmt(r.v)}</td>
        <td><span class="ov-pillst ${r.v == null ? 'off' : ''}">${r.v == null ? 'No marks' : 'Active'}</span></td></tr>`).join('')}</tbody></table></div>`
      : '<div class="empty">No classes yet. Add one under Classes.</div>';

    const examTable = exams.length ? `<div class="ov-tw"><table><thead><tr><th>Exam</th><th class="xt">Term</th><th class="xc">Center</th><th>Average</th><th>Status</th></tr></thead><tbody>${
      exams.slice(-5).reverse().map(e => { const v = used.includes(e) ? examAvg(e) : null;
        return `<tr><td><strong>${escapeHtml(e.name)}</strong></td><td class="xt">${escapeHtml(e.term || '—')}, ${escapeHtml(e.academic_year || '—')}</td><td class="xc">${center}</td><td class="${cls(v)}">${fmt(v)}</td>
        <td><span class="ov-pillst ${e.is_published ? '' : 'off'}">${e.is_published ? 'Published' : 'Draft'}</span></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">No exams yet.</div>';

    const trend = trendSvg(used.map(e => ({ l: e.name, v: examAvg(e) })).filter(x => x.v != null));
    const activity = exams.slice(-4).reverse().map(e => `<li>${escapeHtml(e.name)} ${e.is_published ? 'results published' : 'created (draft)'}</li>`).join('') || '<li>No activity yet</li>';
    const centersTbl = org ? `<div class="ov-panel"><h3>Centers</h3><p class="cap">Students and teachers in every center</p><div class="ov-tw"><table><thead><tr><th>Center</th><th>Students</th><th>Teachers</th></tr></thead><tbody>${
      org.perCenter.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${c.student_count}</td><td>${c.teacher_count}</td></tr>`).join('')}</tbody></table></div></div>` : '';

    const initials = isItSupport ? 'IT' : 'SA';
    const head = `<p class="ov-crumb">${isItSupport ? 'MOHI / Analytics' : 'Dashboard / ' + center} / Overview</p>
      <div class="ov-top"><div><h1 class="ov-title">${isItSupport ? 'Overview' : center + ' - School Admin'}${isItSupport ? '' : '<span class="ov-pill">Center Admin</span>'}</h1>
        <p class="ov-lede">${isItSupport ? 'Performance analytics across MOHI. Use the center switcher above to change center.' : 'Real-time stats for ' + center}</p></div>
        <div class="ov-tools"><label class="ov-search">${S(IC.search, 16)}<input placeholder="Search..." oninput="ovFilter(this.value)"></label>
        <span class="ov-bell">${S(IC.notifications, 22)}<i></i></span><button class="ov-av pf-av" data-profile aria-label="Profile">${initials}</button></div></div>
      <div class="ov-cards">${cards}</div>`;

    main.innerHTML = isItSupport
      ? head + `<div class="ov-grid2"><div class="ov-panel"><h3>Results Trend</h3><p class="cap">Average score per exam, ${center}</p>${trend}</div>
          <div class="ov-panel"><h3>Performance by Subject</h3><p class="cap">${latest ? escapeHtml(latest.name) : 'No exam with marks yet'}</p>${bars}</div></div>
        <div class="ov-panel"><h3>Recent Exams</h3>${examTable}</div>${centersTbl}`
      : head + `<div class="ov-grid"><div>
          <div class="ov-panel"><h3>Classes at ${center}</h3><p class="cap">Class list for this center only</p>${classTable}</div>
          <div class="ov-panel"><h3>Performance by Subject</h3><p class="cap">${latest ? escapeHtml(latest.name) : 'No exam with marks yet'}</p>${bars}</div></div>
        <div><div class="ov-panel ov-act"><h3>Quick Actions</h3><p class="cap"></p>
            <button onclick="ovGo('students')">${S(IC.students, 16)} Add Student</button><button onclick="ovGo('exams')">${S(IC.exams, 16)} Schedule Exam</button><button onclick="ovGo('results')">${S(IC.results, 16)} View Results</button></div>
          <div class="ov-panel"><h3>Recent Activity</h3><p class="cap"></p><ul class="ov-list">${activity}</ul></div>
          <div class="ov-panel"><h3>Recent Exams</h3>${examTable}</div></div></div>`;
  };
})();

/* ===== Profile menu (admin, IT support, teacher): My Profile / Password / Sign Out ===== */
(function () {
  const ic = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = { user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>'), lock: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'), out: ic('<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>') };
  const st = document.createElement('style');
  st.textContent = `
  .pf-av{width:38px;height:38px;border-radius:50%;border:none;background:var(--ov,#2f64d6);color:#fff;font-weight:700;font-size:.8rem;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  #pfFixed{position:fixed;top:12px;right:16px;z-index:70;display:none}
  body:has(#adminShell.visible):not(.ov-view) #pfFixed{display:inline-flex}
  body:has(#adminShell.visible) .it-strip{padding-right:64px}
  .pf-menu{position:fixed;width:232px;background:var(--paper-raised);border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 40px -12px rgba(0,0,0,.7);z-index:80;padding:6px 0}
  .pf-menu .pf-h{padding:14px 18px;border-bottom:1px solid var(--line)}
  .pf-menu small{display:block;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-soft);font-weight:700;margin-bottom:3px}
  .pf-menu b{font-size:.95rem;word-break:break-all}
  .pf-menu button{display:flex;align-items:center;gap:12px;width:100%;padding:12px 18px;background:none;border:none;color:var(--text);font-size:.92rem;cursor:pointer;font-family:inherit;text-align:left}
  .pf-menu button:hover{background:rgba(255,255,255,.05)}
  .pf-menu .pf-sep{border-top:1px solid var(--line);margin:4px 0}
  .pf-menu button.out{color:#ef5b5b}
  .pf-row{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid var(--line);font-size:.9rem}
  .pf-row span{color:var(--text-soft)}.pf-row b{text-align:right;word-break:break-all}
  `;
  document.head.appendChild(st);
  let menu = null, me = null;
  const esc = v => escapeHtml(v);
  const nm = () => (me && me.name) || (typeof currentTeacher !== 'undefined' && currentTeacher && currentTeacher.full_name) || (isItSupport ? 'IT Support' : 'Center Admin');
  const ini = () => nm().split(/\s+|\./).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  async function loadMe() { if (!me) { try { me = await api('/auth/me'); } catch (e) { me = null; } } return me; }
  function hide() { if (menu) { menu.remove(); menu = null; } }
  function paintAvatars() { document.querySelectorAll('.pf-av').forEach(b => { b.textContent = ini(); }); }
  function open(btn) {
    hide();
    menu = document.createElement('div'); menu.className = 'pf-menu';
    menu.innerHTML = `<div class="pf-h"><small>Signed in as</small><b>${esc(nm())}</b></div>
      <button data-a="profile">${I.user} My Profile</button><button data-a="pw">${I.lock} Password</button><div class="pf-sep"></div>
      <button class="out" data-a="out">${I.out} Sign Out</button>`;
    document.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px'; menu.style.right = Math.max(8, innerWidth - r.right) + 'px';
    menu.onclick = e => { const a = e.target.closest('button'); if (!a) return; const k = a.dataset.a; hide(); if (k === 'out') logout(); if (k === 'profile') showProfile(); if (k === 'pw') showPw(); };
    loadMe().then(() => { if (menu && me && me.name) menu.querySelector('.pf-h b').textContent = me.name; paintAvatars(); });
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-profile]');
    if (t) { e.stopPropagation(); menu ? hide() : open(t); return; }
    if (menu && !e.target.closest('.pf-menu')) hide();
  });
  async function showProfile() {
    await loadMe();
    const rows = me ? [['Name', me.name], ['Email', me.email || '—'], ['Role', me.roleLabel], ['Center', me.center || '—'], me.section ? ['Section', sectionLabel(me.section)] : null, me.phone ? ['Phone', me.phone] : null].filter(Boolean)
      : [['Name', nm()], ['Role', isItSupport ? 'IT Support' : 'Account']];
    openModal(`<h3>My profile</h3><div style="margin:8px 0 18px;">${rows.map(r => `<div class="pf-row"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}</div>
      <button class="btn ghost" style="width:auto;padding:9px 18px;" onclick="closeModal()">Close</button>`);
  }
  function showPw() {
    openModal(`<h3>Change password</h3><p>Enter your current password, then choose a new one.</p><div id="pfErr"></div>
      <label for="pfCur">Current password</label><input type="password" id="pfCur" autocomplete="current-password">
      <label for="pfNew">New password</label><input type="password" id="pfNew" autocomplete="new-password">
      <label for="pfNew2">Confirm new password</label><input type="password" id="pfNew2" autocomplete="new-password">
      <div style="display:flex;gap:10px;"><button class="btn gold" style="width:auto;padding:9px 18px;" onclick="pfSavePw()">Save password</button>
      <button class="btn ghost" style="width:auto;padding:9px 18px;" onclick="closeModal()">Cancel</button></div>`);
  }
  window.pfSavePw = async function () {
    const g = id => document.getElementById(id).value, cur = g('pfCur'), n1 = g('pfNew'), n2 = g('pfNew2');
    if (!cur || !n1) return showError('pfErr', 'Fill in all the fields.');
    if (n1.length < 6) return showError('pfErr', 'New password must be at least 6 characters.');
    if (n1 !== n2) return showError('pfErr', "New passwords don't match.");
    try {
      await api('/auth/change-password', { method: 'POST', body: { currentPassword: cur, newPassword: n1 } });
      document.getElementById('pfErr').innerHTML = '<div class="status-pill published" style="margin-bottom:14px;">Password changed</div>';
      setTimeout(closeModal, 1200);
    } catch (err) { showError('pfErr', err.message); }
  };
  function fixedAvatar() {
    if (!document.getElementById('pfFixed')) { const b = document.createElement('button'); b.id = 'pfFixed'; b.className = 'pf-av'; b.setAttribute('data-profile', ''); document.body.appendChild(b); }
    paintAvatars();
  }
  if (typeof renderAdminView === 'function') {
    const o = window.renderAdminView;
    window.renderAdminView = function (v) { document.body.classList.toggle('ov-view', v === 'overview'); fixedAvatar(); loadMe().then(paintAvatars); return o.apply(this, arguments); };
  }
  if (typeof enterTeacherShell === 'function') {
    const o = window.enterTeacherShell;
    window.enterTeacherShell = function () {
      const p = o.apply(this, arguments);
      const b = document.querySelector('#teacherShell .top-welcome > button');
      if (b) b.outerHTML = `<button class="pf-av" data-profile aria-label="Profile">${ini()}</button>`;
      loadMe().then(paintAvatars);
      return p;
    };
  }
  if (typeof logout === 'function') { const o = window.logout; window.logout = function () { me = null; hide(); document.body.classList.remove('ov-view'); return o.apply(this, arguments); }; }
})();

/* ===== Bulk uploads v2: results in "one row per student" layout + teachers with email and many classes/subjects ===== */
(function () {
  const norm = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const delimOf = t => { const l = t.split(/\r?\n/)[0] || ''; const c = { ',': (l.match(/,/g) || []).length, ';': (l.match(/;/g) || []).length, '\t': (l.match(/\t/g) || []).length }; return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
  function parseCSV(t) {
    t = t.replace(/^\uFEFF/, ''); const d = delimOf(t), rows = []; let r = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === d) { r.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); f = ''; rows.push(r); r = []; }
      else f += c;
    }
    if (f !== '' || r.length) { r.push(f); rows.push(r); }
    return rows.filter(x => x.some(y => String(y).trim() !== ''));
  }
  const ABBR = { eng: 'english', kis: 'kiswahili', kisw: 'kiswahili', mat: 'mathematics', math: 'mathematics', maths: 'mathematics', bio: 'biology', phy: 'physics', chem: 'chemistry', hag: 'history', his: 'history', geo: 'geography', cre: 'christianreligiouseducation', agr: 'agriculture', comp: 'computer', bus: 'business', sci: 'science', ss: 'socialstudies' };
  const IGNORE = ['entry', 'no', 'studentname', 'name', 'fullname', 'class', 'stream', 'strms', 'streams', 'section', 'position', 'pos', 'total', 'mean', 'average', 'grade', 'rank'];
  const ID_HEADS = ['schoolid', 'idcin', 'cin', 'id', 'admno', 'admission', 'admissionno', 'schoolidnumber', 'studentid'];
  function matchSubject(h, subjects) {
    const n = norm(h); if (!n) return null;
    let s = subjects.find(x => norm(x.name) === n); if (s) return s;
    const e = ABBR[n];
    if (e) { s = subjects.find(x => norm(x.name).includes(e) || (e.startsWith('christian') && norm(x.name).startsWith('cre'))); if (s) return s; }
    if (n.length >= 3) s = subjects.find(x => norm(x.name).startsWith(n));
    return s || null;
  }
  function wideToLong(text, subjects, ctx) {
    const rows = parseCSV(text); if (rows.length < 2) throw new Error('That file has no data rows.');
    const head = rows[0], idCol = head.findIndex(h => ID_HEADS.includes(norm(h)));
    const nameCol = head.findIndex(h => ['studentname', 'name', 'fullname'].includes(norm(h))), clsCol = head.findIndex(h => ['class', 'stream', 'strms', 'streams'].includes(norm(h)));
    if (idCol < 0 && (nameCol < 0 || !ctx)) throw new Error('Could not find the School ID column. Name it "School ID" or "ID/CIN", or use a "Student Name" column.');
    const cols = [], skipped = [];
    head.forEach((h, i) => {
      if (i === idCol || !norm(h) || IGNORE.includes(norm(h))) return;
      const s = matchSubject(h, subjects);
      if (s) cols.push({ i, name: s.name }); else skipped.push('Column "' + String(h).trim() + '" does not match any subject, so it was ignored.');
    });
    if (!cols.length) throw new Error('No subject columns matched. Your subjects are: ' + subjects.map(s => s.name).join(', ') + '.');
    const out = [];
    rows.slice(1).forEach(r => {
      let id = idCol >= 0 ? String(r[idCol] == null ? '' : r[idCol]).trim().replace(/\.0+$/, '') : '';
      if (!id && nameCol >= 0 && ctx) {
        const raw = String(r[nameCol] == null ? '' : r[nameCol]).trim(); if (!raw) return;
        let m = ctx.byName.get(norm(raw)) || [];
        if (m.length > 1 && clsCol >= 0) { const f = m.filter(x => ctx.cn[x.class_id] === norm(r[clsCol])); if (f.length) m = f; }
        if (m.length === 1) id = String(m[0].school_id_number);
        else { skipped.push('"' + raw + '": ' + (m.length ? 'more than one student has this name, so use the School ID.' : 'no student with this name was found.')); return; }
      }
      if (!id) return;
      if (ctx && ctx.fix) id = ctx.fix(id);
      cols.forEach(c => { const v = String(r[c.i] == null ? '' : r[c.i]).trim(); if (/^\d+(\.\d+)?$/.test(v) && +v <= 100) out.push([id, c.name, v]); });
    });
    return { rows: out, skipped };
  }
  window.mohiWideToLong = wideToLong; window.mohiParseCSV = parseCSV;
  const cap = a => (a.length > 30 ? a.slice(0, 30).concat(['... and ' + (a.length - 30) + ' more']) : a);

  window.importBulkMarksCsv = async function (examId) {
    const fi = document.getElementById('bulkMarksCsvFile'), box = document.getElementById('bulkMarksResult');
    try {
      const text = await readFileAsText(fi), subjects = await api('/subjects');
      const [stu, cls] = await Promise.all([api('/students'), api('/classes')]), byName = new Map(), cn = Object.fromEntries(cls.map(x => [x.id, norm(x.name)]));
      stu.forEach(x => { const k = norm(x.full_name); byName.set(k, (byName.get(k) || []).concat([x])); });
      const idMap = new Map(stu.map(x => [String(x.school_id_number).toUpperCase(), String(x.school_id_number)]));
      const fix = v => { const u = String(v).toUpperCase(); if (idMap.has(u)) return idMap.get(u); if (/^\d+$/.test(u)) { for (const c of ['MOHI-' + u, 'MOHI-' + u.padStart(4, '0')]) if (idMap.has(c)) return idMap.get(c); } return v; };
      const { rows, skipped } = wideToLong(text, subjects, { byName, cn, fix });
      if (!rows.length) throw new Error('No marks found in that file. Check the subject columns have numbers.');
      let added = 0; const sk = skipped.slice();
      for (let i = 0; i < rows.length; i += 600) {
        box.innerHTML = '<div class="hint">Uploading ' + Math.min(i + 600, rows.length) + ' of ' + rows.length + ' marks...</div>';
        const csv = ['School ID,Subject,Score'].concat(rows.slice(i, i + 600).map(r => r.map(csvEscape).join(','))).join('\n');
        const r = await api('/marks/bulk', { method: 'POST', body: { examId, csv } });
        added += r.added || 0; (r.skipped || []).forEach(x => sk.push(x));
      }
      box.innerHTML = csvResultBox(added, cap(sk), 'mark'); fi.value = '';
    } catch (err) { box.innerHTML = '<div class="error-msg" style="margin-top:12px;">' + escapeHtml(err.message) + '</div>'; }
  };

  async function marksTemplate() {
    const [st, cl, sb] = await Promise.all([api('/students'), api('/classes'), api('/subjects')]);
    const cname = Object.fromEntries(cl.map(c => [c.id, c.name])), subs = sb.length ? sb.map(s => s.name) : ['Mathematics', 'English', 'Kiswahili'];
    const rows = [['School ID', 'Student Name', 'Class'].concat(subs)];
    st.slice().sort((a, b) => (cname[a.class_id] || '').localeCompare(cname[b.class_id] || '') || a.full_name.localeCompare(b.full_name))
      .forEach(s => rows.push([s.school_id_number, s.full_name, cname[s.class_id] || ''].concat(subs.map(() => ''))));
    if (!st.length) rows.push(['MOHI-0210', 'Peter Kamau', cl[0] ? cl[0].name : 'Grade 7 Joy'].concat(subs.map(() => '')));
    downloadCSV('mohi-marks-template.csv', rows);
  }

  const SECTIONS = ['PRIMARY', 'JUNIOR', 'SENIOR'], DEFAULT_PW = 'Teacher@2026';
  const splitList = v => String(v || '').split(/[;|\/]/).map(x => x.trim()).filter(Boolean);
  window.importTeachersCsv = async function () {
    const fi = document.getElementById('teacherCsvFile'), main = document.getElementById('adminMain');
    try {
      const text = await readFileAsText(fi), rows = parseCSV(text);
      const h = rows[0].map(norm), at = names => h.findIndex(x => names.includes(x));
      const c = { name: at(['fullname', 'name', 'teacher', 'teachername']), email: at(['email', 'emailaddress', 'login']), pw: at(['password', 'defaultpassword']), sec: at(['section']), cls: at(['class', 'classes', 'stream', 'streams']), sub: at(['subject', 'subjects']), ph: at(['phone', 'phonenumber', 'mobile']) };
      if (c.name < 0 || c.email < 0) throw new Error('The file needs "Full Name" and "Email" columns. Download the template to see the layout.');
      const [classes, subjects] = await Promise.all([api('/classes'), api('/subjects')]);
      const people = new Map(), skipped = [];
      rows.slice(1).forEach((r, k) => {
        const g = i => (i < 0 ? '' : String(r[i] == null ? '' : r[i]).trim()), email = g(c.email).toLowerCase(), name = g(c.name);
        if (!name && !email) return;
        if (!name || !email) { skipped.push('Row ' + (k + 2) + ': needs both a name and an email.'); return; }
        const p = people.get(email) || { name, email, pw: '', sec: '', ph: '', cls: new Set(), sub: new Set() };
        p.pw = p.pw || g(c.pw); p.sec = p.sec || g(c.sec); p.ph = p.ph || g(c.ph);
        splitList(g(c.cls)).forEach(x => p.cls.add(x)); splitList(g(c.sub)).forEach(x => p.sub.add(x));
        people.set(email, p);
      });
      let added = 0;
      for (const p of people.values()) {
        const cl = [...p.cls].map(n => ({ n, o: classes.find(x => norm(x.name) === norm(n)) })), sb = [...p.sub].map(n => ({ n, o: matchSubject(n, subjects) }));
        cl.filter(x => !x.o).forEach(x => skipped.push(p.name + ': class "' + x.n + '" not found.'));
        sb.filter(x => !x.o).forEach(x => skipped.push(p.name + ': subject "' + x.n + '" not found.'));
        const assignments = []; cl.filter(x => x.o).forEach(a => sb.filter(x => x.o).forEach(b => assignments.push({ classId: a.o.id, subjectId: b.o.id })));
        let section = SECTIONS.find(s => norm(p.sec).startsWith(norm(s).slice(0, 3))) || (cl.find(x => x.o) || { o: {} }).o.section || 'JUNIOR';
        try { await api('/teachers', { method: 'POST', body: { fullName: p.name, email: p.email, password: p.pw || DEFAULT_PW, phone: p.ph, section, assignments } }); added++; }
        catch (err) { skipped.push(p.name + ' (' + p.email + '): ' + err.message); }
      }
      fi.value = '';
      renderTeachers(main, csvResultBox(added, cap(skipped), 'teacher') + '<p class="hint" style="margin-top:8px;">Teachers with no password in the file got ' + DEFAULT_PW + '.</p>');
    } catch (err) { renderTeachers(main, '<div class="error-msg" style="margin-top:12px;">' + escapeHtml(err.message) + '</div>'); }
  };
  async function teacherTemplate() {
    const [c, s] = await Promise.all([api('/classes'), api('/subjects')]);
    const c1 = c[0] ? c[0].name : 'Grade 7 Joy', c2 = c[1] ? c[1].name : 'Grade 7 Love', s1 = s[0] ? s[0].name : 'Mathematics', s2 = s[1] ? s[1].name : 'English';
    downloadCSV('mohi-teachers-template.csv', [['Full Name', 'Email', 'Password', 'Section', 'Class', 'Subject', 'Phone'],
      ['Mrs. Grace Wambui', 'grace@mohiafrica.org', '', 'JUNIOR', c1 + '; ' + c2, s1 + '; ' + s2, '0712 345 678'],
      ['Mr. Peter Otieno', 'peter@mohiafrica.org', '', 'JUNIOR', c1, s2, '0722 111 222']]);
  }

  function relabel(inputId, html, fn) {
    const inp = document.getElementById(inputId); if (!inp) return;
    const panel = inp.closest('.panel'), a = panel && [...panel.querySelectorAll('a')].find(x => /template/i.test(x.textContent));
    if (!a) return; const p = a.parentElement;
    a.onclick = () => { fn(); return false; }; p.innerHTML = html + ' '; p.appendChild(a);
  }
  if (typeof renderResults === 'function') {
    const o = window.renderResults;
    window.renderResults = async function () {
      const r = await o.apply(this, arguments);
      const inp = document.getElementById('bulkMarksCsvFile'), st = inp && inp.closest('.panel') && inp.closest('.panel').querySelectorAll('p.sub strong');
      const exam = st && st.length ? st[st.length - 1].textContent : 'the selected exam';
      relabel('bulkMarksCsvFile', 'One row per student, one column per subject, like your Excel sheet. Columns: <strong>School ID</strong> (or ID/CIN). If you have no ID, use <strong>Student Name</strong> and Class instead (names must match exactly, and clashes are skipped). Then a column for each subject. Leave a cell empty, or put - or x, if the student did not sit it. Scores are 0 to 100. Applies to <strong>' + exam + '</strong>.', marksTemplate);
      return r;
    };
  }
  if (typeof renderTeachers === 'function') {
    const o = window.renderTeachers;
    window.renderTeachers = async function () {
      const r = await o.apply(this, arguments);
      relabel('teacherCsvFile', 'Columns: <strong>Full Name, Email, Password (optional), Section, Class, Subject, Phone</strong>. A teacher can have many classes and subjects: put several in one cell separated by <strong>;</strong> or repeat the teacher on more rows. Class and subject names must match the ones in the system.', teacherTemplate);
      return r;
    };
  }
})();

/* ===== Admin: print report cards per class (stream), one per page ===== */
(function () {
  const css = `
  #rcBatch{display:none}
  @page{size:A4;margin:10mm}
  @media print{
    body.rc-batch{background:#fff!important}
    body.rc-batch .stage,body.rc-batch .letterhead,body.rc-batch .theme-toggle,body.rc-batch .api-banner,body.rc-batch .modal-back,body.rc-batch #pfFixed,body.rc-batch .pf-menu{display:none!important}
    body.rc-batch #rcBatch{display:block!important;visibility:visible}
    body.rc-batch #rcBatch *{visibility:visible}
  }
  .rcb{font-family:Arial,Helvetica,sans-serif;color:#1a2233;font-size:11.5px;line-height:1.4;background:#fff;page-break-after:always;break-after:page;padding:2px}
  .rcb:last-child{page-break-after:auto}
  .rcb .hd{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid #1a2233;padding-bottom:10px;margin-bottom:10px}
  .rcb .lg{display:flex;gap:10px;align-items:center}.rcb .lg img{width:46px;height:46px;object-fit:contain}
  .rcb .org{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#3e6bb8;font-weight:700}
  .rcb h1{font-size:17px;margin:2px 0}.rcb .sm{color:#5b6478;font-size:10.5px}
  .rcb .who{text-align:right;line-height:1.6}
  .rcb .st{display:flex;gap:22px;margin:8px 0 10px}.rcb .st div{border:1px solid #ccd3dd;border-radius:6px;padding:6px 14px;min-width:90px}
  .rcb .st b{display:block;font-size:19px}.rcb .st span{font-size:9.5px;text-transform:uppercase;color:#5b6478}
  .rcb table{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:inherit}
  .rcb th{text-align:left;font-size:9.5px;text-transform:uppercase;color:#5b6478;border-bottom:2px solid #ccd3dd;padding:4px 6px}
  .rcb td{padding:4px 6px;border-bottom:1px solid #e3e7ee}
  .rcb h3{font-size:12px;margin:10px 0 2px}
  .rcb .lv{font-weight:700}
  .rcb .cm{border-left:3px solid #3e6bb8;background:#f4f6fa;padding:7px 10px;margin:8px 0}
  .rcb .ct{display:flex;gap:12px;margin-top:10px}.rcb .ct div{flex:1;border:1px solid #ccd3dd;border-radius:6px;padding:7px 10px}
  .rcb .ct small{font-size:9px;text-transform:uppercase;color:#5b6478;font-weight:700;display:block}
  .rcb .fn{font-size:9.5px;color:#5b6478;margin-top:10px}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const LC = { EE: '#2f7d57', ME: '#33507c', AE: '#8a6a22', BE: '#b24444' }, e = v => escapeHtml(v);
  const lv = s => (s ? s.slice(0, 2) : '');

  async function build(examId, classId, only) {
    const [exams, classes, teachers, students, res, rem] = await Promise.all([api('/exams'), api('/classes'), api('/teachers'), api('/students'),
      api(`/results?examId=${examId}&classId=${classId}`), api(`/remarks?examId=${examId}&classId=${classId}`).catch(() => [])]);
    const exam = exams.find(x => x.id === examId) || {}, cls = classes.find(c => c.id === classId) || {};
    const hist = await Promise.all(exams.slice(-6).map(x => api(`/results?examId=${x.id}&classId=${classId}`).then(r => ({ x, r })).catch(() => ({ x, r: [] }))));
    const graded = res.filter(r => r.subjectsGraded > 0), n = graded.length;
    const list = (only && only !== 'all' ? graded.filter(r => String(r.student.id) === String(only)) : graded).slice().sort((a, b) => a.student.full_name.localeCompare(b.student.full_name));
    const tch = teachers.find(t => t.id === cls.class_teacher_id), remBy = Object.fromEntries((rem || []).map(x => [x.student_id, x.text]));
    const dates = [exam.opens_on ? 'Opens ' + exam.opens_on : '', exam.closes_on ? 'Closes ' + exam.closes_on : ''].filter(Boolean).join(' · ');
    const html = list.map(r => {
      const sid = r.student.id, s = students.find(x => String(x.id) === String(sid)) || students.find(x => x.full_name === r.student.full_name) || {};
      const rows = r.subjects.filter(x => x.mark).map(({ subject, mark }) => `<tr><td>${e(subject.name)}</td><td>${mark.percent != null ? mark.percent + '%' : '—'}</td><td>${e(mark.sublevel)}</td><td>${mark.points}</td><td class="lv" style="color:${LC[lv(mark.sublevel)] || '#000'}">${lv(mark.sublevel)}</td></tr>`).join('');
      const tr = hist.map(h => { const m = h.r.find(q => String(q.student.id) === String(sid)); return m && m.subjectsGraded > 0 ? `<tr><td>${e(h.x.name)}</td><td>${m.meanPoints.toFixed(1)}</td><td>${e(m.meanLevel || '—')}</td><td>${m.position ? '#' + m.position + ' of ' + h.r.filter(q => q.subjectsGraded > 0).length : '—'}</td></tr>` : ''; }).join('');
      const remark = remBy[sid];
      return `<div class="rcb"><div class="hd"><div class="lg"><img src="/logo.png" alt=""><div><div class="org">${e(currentCenterName || 'Center')} · Missions of Hope International</div><h1>Report Card — ${e(exam.name)}</h1><div class="sm">${e([exam.term, exam.academic_year].filter(Boolean).join(', '))}${dates ? ' · ' + e(dates) : ''}</div></div></div>
        <div class="who"><b>${e(r.student.full_name)}</b><br>School ID ${e(s.school_id_number || '—')}<br>${e(cls.name || '')}${cls.section ? ' · ' + e(sectionLabel(cls.section)) : ''}</div></div>
        <div class="st"><div><b>${r.meanPoints != null ? r.meanPoints.toFixed(1) : '—'}</b><span>Mean points</span></div><div><b>${e(r.meanLevel || '—')}</b><span>Mean grade</span></div><div><b>${r.position ? '#' + r.position : '—'}</b><span>Class position (of ${n})</span></div></div>
        <table><thead><tr><th>Subject</th><th>%</th><th>Sub-level</th><th>Points</th><th>Level</th></tr></thead><tbody>${rows}</tbody></table>
        ${remark ? `<div class="cm"><small style="font-weight:700;color:#5b6478;text-transform:uppercase;font-size:9px">Class teacher's comment</small><br>${e(remark)}</div>` : ''}
        ${tr ? `<h3>Term-over-term</h3><table><thead><tr><th>Exam</th><th>Mean points</th><th>Mean grade</th><th>Position</th></tr></thead><tbody>${tr}</tbody></table>` : ''}
        <div class="ct"><div><small>Class teacher</small><b>${e(tch ? tch.full_name : 'Not assigned')}</b><br>${e(tch && tch.phone ? tch.phone : '')}</div>
          <div><small>Parent / guardian</small><b>${e(s.parent_name || '—')}</b><br>${e([s.parent_phone, s.parent_email].filter(Boolean).join(' · '))}</div></div>
        ${exam.newsletter ? `<div class="cm" style="margin-top:10px">${e(exam.newsletter)}</div>` : ''}
        <div class="fn">Mean grade and class position are internal MOHI tracking figures. Official CBC/KNEC reporting has no aggregate score or ranking.</div></div>`;
    }).join('');
    return { html, count: list.length, none: res.length - n };
  }
  window.mohiPrintCards = async function (examId, classId, only) {
    const { html, count, none } = await build(examId, classId, only);
    if (!count) throw new Error('No marks have been entered for this class in this exam yet.');
    let box = document.getElementById('rcBatch');
    if (!box) { box = document.createElement('div'); box.id = 'rcBatch'; document.body.appendChild(box); }
    box.innerHTML = html; document.body.classList.add('rc-batch');
    const done = () => { document.body.classList.remove('rc-batch'); box.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 400);
    return { count, none };
  };

  async function addPanel() {
    const sel = document.getElementById('resultsClassSel'), ex = document.getElementById('resultsExamSel');
    if (!sel || !ex || document.getElementById('rcPanel')) return;
    const students = (await api('/students')).filter(s => String(s.class_id) === String(sel.value)).sort((a, b) => a.full_name.localeCompare(b.full_name));
    const p = document.createElement('div'); p.className = 'panel'; p.id = 'rcPanel';
    p.innerHTML = `<h3>Print report cards</h3><p class="sub">Prints one report card per page for the class and exam chosen above. In the print window, choose <strong>Save as PDF</strong> to keep a copy.</p>
      <div class="row-form"><div class="field"><label for="rcWho">Student</label><select id="rcWho"><option value="all">All students in this class</option>${students.map(s => `<option value="${s.id}">${e(s.full_name)}</option>`).join('')}</select></div>
      <button class="btn" id="rcGo">Print report cards</button></div><div id="rcMsg"></div>`;
    sel.closest('.select-row').insertAdjacentElement('afterend', p);
    document.getElementById('rcGo').onclick = async () => {
      const m = document.getElementById('rcMsg'); m.innerHTML = '<div class="hint">Preparing report cards...</div>';
      try {
        const r = await window.mohiPrintCards(ex.value, sel.value, document.getElementById('rcWho').value);
        m.innerHTML = `<div class="status-pill published">${r.count} report card${r.count === 1 ? '' : 's'} ready</div>` + (r.none ? `<p class="hint" style="margin-top:8px">${r.none} student${r.none === 1 ? ' has' : 's have'} no marks and ${r.none === 1 ? 'was' : 'were'} left out.</p>` : '');
      } catch (err) { m.innerHTML = `<div class="error-msg" style="margin-top:12px">${e(err.message)}</div>`; }
    };
  }
  if (typeof renderResults === 'function') {
    const o = window.renderResults;
    window.renderResults = async function () { const r = await o.apply(this, arguments); try { await addPanel(); } catch (x) {} return r; };
  }
})();

/* ===== Student report card: keep the Mean points / Mean grade / Position boxes compact, not stretched ===== */
(function () {
  const st = document.createElement('style');
  st.textContent = `
  .rc-stats{display:flex;flex-wrap:wrap;gap:14px;justify-content:flex-start;margin:14px 0 20px}
  .rc-stats .stat{flex:0 0 auto;width:170px;min-width:0;padding:12px 16px}
  .rc-stats .stat .num{font-size:1.7rem}
  @media(max-width:560px){.rc-stats .stat{width:calc(50% - 7px)}}
  `;
  document.head.appendChild(st);
})();

/* ===== Forgot password (teachers, students, admins): sign-in link, notifications, set temporary password ===== */
(function () {
  const e = v => escapeHtml(v);
  const KIND = { teacher: 'Teacher', student: 'Student', admin: 'Admin' };
  let list = [];
  function addLink() {
    const step = document.getElementById('signinStep'); if (!step || document.getElementById('fpLink')) return;
    const rem = step.querySelector('.auth-remember'); if (!rem) return;
    const a = document.createElement('button'); a.type = 'button'; a.id = 'fpLink'; a.className = 'auth-link'; a.textContent = 'Forgot password?';
    a.style.cssText = 'margin:-6px 0 14px auto;'; a.onclick = openForgot; rem.parentNode.insertBefore(a, rem);
  }
  function openForgot() {
    const v = (document.getElementById('loginId').value || '').trim();
    openModal(`<h3>Forgot password?</h3><p>Please contact your school admin. Enter your email or CIN number and we will notify them, so they can give you a temporary password. Admins are helped by IT support.</p><div id="fpMsg"></div>
      <label for="fpId">Email / CIN</label><input type="text" id="fpId" value="${e(v)}" autocomplete="username">
      <div style="display:flex;gap:10px;"><button class="btn gold" style="width:auto;padding:9px 18px;" onclick="fpSend()">Notify them</button>
      <button class="btn ghost" style="width:auto;padding:9px 18px;" onclick="closeModal()">Close</button></div>`);
  }
  window.fpSend = async function () {
    const identifier = document.getElementById('fpId').value.trim();
    if (!identifier) return showError('fpMsg', 'Enter your email or CIN number.');
    try {
      const r = await api('/password-requests/forgot', { method: 'POST', body: { identifier }, auth: false });
      document.getElementById('fpMsg').innerHTML = `<div class="status-pill published" style="margin-bottom:14px;white-space:normal;">${e(r.message)}</div>`;
    } catch (err) { showError('fpMsg', err.message); }
  };
  window.fpOpen = function (i) {
    const q = list[i]; if (!q) return;
    const pw = 'Mohi@' + Math.floor(1000 + Math.random() * 9000);
    const note = q.kind === 'student' ? 'The email goes to the parent or guardian email on file, if there is one.' : q.kind === 'admin' ? 'They can set their own password afterwards from the profile menu.' : 'They will be made to choose a new password at their next sign-in.';
    openModal(`<h3>Set a temporary password</h3><p>${e(q.full_name)} (${KIND[q.kind]}, ${e(q.identifier)}) asked for help signing in. ${note}</p><div id="fpRes"></div>
      <label for="fpPw">Temporary password</label><input type="text" id="fpPw" value="${pw}">
      <div style="display:flex;gap:10px;"><button class="btn gold" style="width:auto;padding:9px 18px;" onclick="fpSet('${q.id}')">Set and email it</button>
      <button class="btn ghost" style="width:auto;padding:9px 18px;" onclick="closeModal()">Cancel</button></div>`);
  };
  window.fpSet = async function (id) {
    const pw = document.getElementById('fpPw').value.trim();
    try {
      const r = await api(`/password-requests/${id}/resolve`, { method: 'POST', body: { password: pw } });
      document.getElementById('fpRes').innerHTML = `<div class="status-pill published" style="margin-bottom:10px;white-space:normal;">Password set</div>
        <p style="margin:0 0 6px;">${r.emailed ? 'Emailed to ' + e(r.emailedTo) + '.' : 'No email was sent (email is not set up, or no email is on file), so give this password to them yourself.'}</p>
        <p style="font-family:'IBM Plex Mono',monospace;font-size:1rem;color:var(--text);margin:0 0 14px;">${e(r.tempPassword)}</p>
        <button class="btn gold" style="width:auto;padding:9px 18px;" onclick="closeModal();renderNotifications(document.getElementById('adminMain'));refreshPendingBadge();">Done</button>`;
    } catch (err) { document.getElementById('fpRes').innerHTML = `<div class="error-msg">${e(err.message)}</div>`; }
  };
  if (typeof renderNotifications === 'function') {
    const o = window.renderNotifications;
    window.renderNotifications = async function (main) {
      const r = await o.apply(this, arguments);
      try {
        list = await api('/password-requests');
        const it = typeof isItSupport !== 'undefined' && isItSupport;
        const p = document.createElement('div'); p.className = 'panel';
        p.innerHTML = `<h3>Password requests (${list.length})</h3>` + (list.length
          ? `<div class="mark-grid-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Email / CIN</th>${it ? '<th>Center</th>' : ''}<th>Requested</th><th></th></tr></thead><tbody>${list.map((q, i) => `<tr><td>${e(q.full_name)}</td><td><span class="tag">${KIND[q.kind] || q.kind}</span></td><td>${e(q.identifier)}</td>${it ? `<td>${e(q.center_name || '—')}</td>` : ''}<td>${new Date(q.requested_at).toLocaleString()}</td>
            <td><button class="btn small gold" onclick="fpOpen(${i})">Set temporary password</button></td></tr>`).join('')}</tbody></table></div>`
          : '<div class="empty">No password requests right now.</div>');
        const first = main.querySelector('.panel'); first ? main.insertBefore(p, first) : main.appendChild(p);
      } catch (x) {}
      return r;
    };
  }
  if (typeof refreshPendingBadge === 'function') {
    window.refreshPendingBadge = async function () {
      const el = document.getElementById('pendingBadge'); if (!el) return; let n = 0;
      try { n += (await api('/edit-requests?status=pending')).length; } catch (x) {}
      try { n += (await api('/password-requests')).length; } catch (x) {}
      el.textContent = n ? ` (${n})` : '';
    };
  }
  addLink();
})();

/* ===== App offer: register the service worker, then suggest installing / downloading the Android app ===== */
(function () {
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true || (document.referrer || '').startsWith('android-app://');
  if (standalone) return; // already running as the app
  const ua = navigator.userAgent, android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  if (!android && !ios) return; // phones only
  const st = document.createElement('style');
  st.textContent = `
  .ap-btn{display:inline-block;background:linear-gradient(135deg,#0a5c96,#00a3e0);color:#fff!important;border:none;border-radius:10px;padding:10px 16px;font-weight:700;font-size:.88rem;text-decoration:none;cursor:pointer;font-family:inherit}
  .ap-offer{margin:18px 0 0;padding:14px;border:1px dashed var(--line);border-radius:14px;font-size:.85rem;color:var(--text-soft)}
  .ap-offer b{display:block;color:var(--text);margin-bottom:8px;font-size:.92rem}
  .ap-offer small{display:block;margin-top:8px;font-size:.72rem}
  #appBanner{position:fixed;left:12px;right:12px;bottom:64px;max-width:460px;margin:0 auto;z-index:90;display:flex;align-items:center;gap:12px;background:var(--paper-raised);border:1px solid var(--line);border-radius:14px;padding:12px 14px;box-shadow:0 14px 34px -10px rgba(0,0,0,.7);font-size:.85rem}
  #appBanner span{flex:1;color:var(--text)}
  #appBanner .ap-x{background:none;border:none;color:var(--text-soft);font-size:1.3rem;cursor:pointer;line-height:1}`;
  document.head.appendChild(st);
  let deferred = null, apk = false;
  const dismissed = () => { try { return Date.now() - Number(localStorage.getItem('mohi-app-dismiss') || 0) < 7 * 864e5; } catch (x) { return false; } };
  const action = () => deferred ? '<button class="ap-btn" onclick="mohiInstall()">Install app</button>'
    : (apk && android) ? '<a class="ap-btn" href="/downloads/mohi-results.apk" download>Download the Android app</a>'
    : ios ? '<span>On iPhone: tap Share, then <b>Add to Home Screen</b>.</span>' : '';
  window.mohiInstall = async function () { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (x) {} deferred = null; render(); };
  window.mohiDismissApp = function () { try { localStorage.setItem('mohi-app-dismiss', Date.now()); } catch (x) {} render(); };
  function render() {
    const a = action(), w = document.getElementById('welcomeStep'); let o = document.getElementById('appOffer');
    if (w && a) {
      if (!o) { o = document.createElement('div'); o.id = 'appOffer'; o.className = 'ap-offer'; const d = w.querySelector('.auth-dots'); w.insertBefore(o, d); }
      o.innerHTML = '<b>Get the MOHI app</b>' + a + (!deferred && apk && android ? '<small>Your phone may ask you to allow installs from this site.</small>' : '');
    } else if (o) o.remove();
    const inApp = document.querySelector('.app-shell.visible'); let b = document.getElementById('appBanner');
    if (inApp && a && !dismissed()) {
      if (!b) { b = document.createElement('div'); b.id = 'appBanner'; document.body.appendChild(b); }
      b.innerHTML = '<span>Use MOHI as an app on your phone</span>' + a + '<button class="ap-x" onclick="mohiDismissApp()" aria-label="Close">&times;</button>';
    } else if (b) b.remove();
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; render(); });
  window.addEventListener('appinstalled', () => { deferred = null; render(); });
  if (android) fetch('/downloads/mohi-results.apk', { method: 'HEAD' }).then(r => { apk = r.ok; render(); }).catch(() => {});
  render(); setInterval(render, 1500);
})();


/* ===== Student management (by class / stream, transfers) and teachers by section ===== */
(function () {
  const e = v => escapeHtml(v), S = { classId: null, q: '', sel: new Set(), moving: [] }, PER = 60;
  let CL = [], ST = [];
  const st = document.createElement('style');
  st.textContent = `.sec-tabs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0 14px}.sec-tab{border:1px solid var(--line);background:transparent;color:var(--text);border-radius:20px;padding:6px 14px;font-size:.82rem;cursor:pointer;font-family:inherit}.sec-tab.on{background:var(--brand-blue-deep);color:#fff;border-color:transparent}.sec-tabs input{margin:0 0 0 auto;width:200px;padding:7px 10px}`;
  document.head.appendChild(st);

  window.renderStudents = async function (main, summaryHtml) {
    const [students, classes] = await Promise.all([api('/students'), api('/classes')]);
    ST = students; CL = classes;
    const cnt = {}; students.forEach(s => { const k = s.class_id || 'none'; cnt[k] = (cnt[k] || 0) + 1; });
    if (!S.classId || (S.classId !== 'none' && !classes.find(c => c.id === S.classId))) S.classId = (classes.find(c => cnt[c.id]) || classes[0] || {}).id || 'none';
    const addOpts = classes.map(c => `<option value="${c.id}">${e(c.name)} — ${sectionLabel(c.section)}</option>`).join('');
    const selOpts = classes.map(c => `<option value="${c.id}" ${c.id === S.classId ? 'selected' : ''}>${e(c.name)} (${cnt[c.id] || 0})</option>`).join('') + (cnt.none ? `<option value="none" ${S.classId === 'none' ? 'selected' : ''}>No class (${cnt.none})</option>` : '');
    main.innerHTML = `<h2>Students</h2><p class="lede">${students.length} students. New students go into their class; find and manage them by class or stream below. Default password is Student@2026 until changed.</p>
      <div class="panel"><h3>Add a student</h3><div class="row-form">
        <div class="field"><label for="newStudentName">Full name</label><input type="text" id="newStudentName" placeholder="e.g. Peter Kamau"></div>
        <div class="field"><label for="newStudentId">School ID (CIN)</label><input type="text" id="newStudentId" placeholder="e.g. MOHI-0210 or just 0210"></div>
        <div class="field"><label for="newStudentClass">Class</label><select id="newStudentClass">${addOpts || '<option value="">No classes yet</option>'}</select></div>
        <button class="btn" onclick="addStudent()">Add student</button></div></div>
      <div class="panel"><h3>Manage students</h3><div class="row-form">
        <div class="field"><label for="stuClassSel">Class / stream</label><select id="stuClassSel">${selOpts || '<option>No classes yet</option>'}</select></div>
        <div class="field"><label for="stuSearch">Search all students</label><input type="text" id="stuSearch" placeholder="Name or School ID" value="${e(S.q)}"></div></div>
        <div id="stuList"></div></div>
      <div class="panel" id="dupPanel"><h3>Duplicate IDs</h3><p class="sub">Every ID must be unique across all centers. Find students whose ID is used more than once (for example MOHI-025100 and 025100) and delete the extras.</p>
        <div class="row-form"><button class="btn small" onclick="dupScan()">Find duplicates</button><button class="btn small ghost" onclick="idFix()">Add MOHI- to IDs that are only numbers</button></div><div id="dupOut"></div></div>
      <div class="panel"><h3>Bulk upload students (CSV)</h3>
        <p class="sub">Columns: <strong>Full Name, School ID, Class</strong>. Class must match an existing class name exactly.
        <a href="#" onclick="downloadCSV('mohi-students-template.csv', [['Full Name','School ID','Class'],['Peter Kamau','MOHI-0210','${classes[0] ? e(classes[0].name) : 'Grade 7 Blue'}']]); return false;">Download CSV template</a></p>
        <div class="row-form"><div class="field"><label for="studentCsvFile">CSV file</label><input type="file" id="studentCsvFile" accept=".csv,text/csv"></div>
        <button class="btn small" onclick="importStudentsCsv()">Upload &amp; add students</button></div>${summaryHtml || ''}</div>`;
    document.getElementById('stuClassSel').onchange = ev => { S.classId = ev.target.value; S.q = ''; document.getElementById('stuSearch').value = ''; S.sel.clear(); draw(); };
    document.getElementById('stuSearch').oninput = ev => { S.q = ev.target.value; draw(); };
    draw();
  };
  function draw() {
    const box = document.getElementById('stuList'); if (!box) return;
    const q = S.q.trim().toLowerCase(), cname = Object.fromEntries(CL.map(c => [c.id, c.name]));
    let rows = q.length >= 2 ? ST.filter(s => s.full_name.toLowerCase().includes(q) || String(s.school_id_number).toLowerCase().includes(q)) : ST.filter(s => (s.class_id || 'none') === S.classId);
    rows = rows.slice().sort((a, b) => a.full_name.localeCompare(b.full_name));
    const total = rows.length; S.all = rows.map(s => s.id); rows = rows.slice(0, PER);
    box.innerHTML = !total ? '<div class="empty">No students here yet.</div>' : `<div class="row-form" style="margin-bottom:8px;"><span id="stuCnt" style="font-size:.85rem;color:var(--text-soft);">${S.sel.size} selected</span>
      <button class="btn small ghost" onclick="stuMove()">Transfer selected</button> <button class="btn small ghost" style="color:var(--error)" onclick="stuDelete()">Delete selected</button></div>
      <div class="mark-grid-wrap"><table><thead><tr><th><input type="checkbox" style="margin:0;width:auto;" title="Select all" ${S.all.length && S.all.every(i => S.sel.has(i)) ? 'checked' : ''} onchange="stuAll(this.checked)"></th><th>Name</th><th>School ID</th>${q.length >= 2 ? '<th>Class</th>' : ''}<th>Login</th><th></th></tr></thead><tbody>${rows.map(s => `<tr>
        <td><input type="checkbox" style="margin:0;width:auto;" ${S.sel.has(s.id) ? 'checked' : ''} onchange="stuTick('${s.id}',this.checked)"></td><td>${e(s.full_name)}</td><td><span class="tag">${e(s.school_id_number)}</span></td>
        ${q.length >= 2 ? `<td>${e(cname[s.class_id] || '—')}</td>` : ''}<td>${s.password_changed ? 'Password set' : 'Default password'}</td>
        <td style="white-space:nowrap"><button class="btn small ghost" onclick="openEditStudentModal('${s.id}')">Edit</button> <button class="btn small ghost" onclick="stuMove(['${s.id}'])">Transfer</button> <button class="del" onclick="deleteStudent('${s.id}')">Remove</button></td></tr>`).join('')}</tbody></table></div>
      <p class="hint" style="margin-top:10px;">${total > PER ? `Showing the first ${PER} of ${total}. The top tick box selects all ${total}.` : `${total} student${total === 1 ? '' : 's'}.`}</p>`;
  }
  window.stuAll = function (on) { S.all.forEach(id => on ? S.sel.add(id) : S.sel.delete(id)); draw(); };
  async function delStudents(ids) {
    const r = await api('/student-transfer/delete-students', { method: 'POST', body: { ids } });
    S.sel.clear(); await renderStudents(document.getElementById('adminMain')); return r;
  }
  window.stuDelete = async function () {
    const ids = [...S.sel]; if (!ids.length) { alert('Tick at least one student first.'); return; }
    if (!confirm('Delete ' + ids.length + ' student' + (ids.length === 1 ? '' : 's') + '? Their marks are deleted too and this cannot be undone.')) return;
    if (ids.length >= 10 && (prompt('Type DELETE to confirm removing ' + ids.length + ' students.') || '').trim() !== 'DELETE') return;
    try { const r = await delStudents(ids); alert(r.deleted + ' deleted.'); } catch (err) { alert(err.message); }
  };
  window.deleteStudent = async function (id) {
    if (!confirm('Remove this student? Their marks are removed too.')) return;
    try { await delStudents([id]); } catch (err) { alert(err.message); }
  };
  window.dupScan = async function () {
    const out = document.getElementById('dupOut'); out.innerHTML = '<div class="hint">Searching...</div>';
    let rows; try { rows = await api('/student-transfer/duplicates'); } catch (err) { out.innerHTML = `<div class="error-msg">${e(err.message)}</div>`; return; }
    if (!rows.length) { out.innerHTML = '<div class="status-pill published">No duplicate IDs found.</div>'; return; }
    const groups = {}; rows.forEach(r => (groups[r.key] = groups[r.key] || []).push(r));
    const pre = r => (/^MOHI-/i.test(r.school_id_number) ? 1 : 0);
    const html = Object.entries(groups).map(([k, g]) => {
      g.sort((a, b) => (b.marks || 0) - (a.marks || 0) || pre(b) - pre(a));
      return `<tr><td colspan="6" style="background:rgba(255,255,255,.04);font-weight:600;">ID ${e(k)} is used ${g.length} times</td></tr>` + g.map((r, i) => {
        const del = i > 0 && r.mine;
        return `<tr><td><input type="checkbox" class="dupk" data-id="${r.id}" ${del ? 'checked' : ''} ${r.mine ? '' : 'disabled'} style="margin:0;width:auto;"></td><td>${e(r.full_name)}</td><td><span class="tag">${e(r.school_id_number)}</span></td><td>${e(r.class_name || '—')}</td><td>${isItSupport ? e(r.center_name || '—') : ''}</td><td>${r.marks || 0} marks</td></tr>`;
      }).join('');
    }).join('');
    out.innerHTML = `<p class="hint" style="margin:6px 0 10px;">${Object.keys(groups).length} ID(s) are used more than once. In each group the record with the most marks is kept and the others are ticked for deletion. Check the ticks, then delete.${isItSupport ? '' : ' Records in other centers can only be removed by IT support.'}</p>
      <div class="mark-grid-wrap"><table><thead><tr><th></th><th>Name</th><th>ID</th><th>Class</th><th>${isItSupport ? 'Center' : ''}</th><th>Marks</th></tr></thead><tbody>${html}</tbody></table></div>
      <div class="row-form" style="margin-top:12px;"><button class="btn small ghost" style="color:var(--error)" onclick="dupDelete()">Delete ticked</button></div>`;
  };
  window.dupDelete = async function () {
    const ids = [...document.querySelectorAll('.dupk:checked')].map(c => c.dataset.id);
    if (!ids.length) { alert('Nothing is ticked.'); return; }
    if (!confirm('Delete ' + ids.length + ' duplicate record' + (ids.length === 1 ? '' : 's') + '? This cannot be undone.')) return;
    try { await delStudents(ids); } catch (err) { alert(err.message); return; }
    window.dupScan();
  };
  window.idFix = async function () {
    if (!confirm('Add MOHI- in front of IDs that are only numbers? Any that would clash with an existing ID are left alone.')) return;
    try { const r = await api('/student-transfer/normalize-ids', { method: 'POST' }); await renderStudents(document.getElementById('adminMain')); alert(r.fixed + ' ID(s) updated.'); }
    catch (err) { alert(err.message); }
  };
  window.stuTick = (id, on) => { on ? S.sel.add(id) : S.sel.delete(id); const c = document.getElementById('stuCnt'); if (c) c.textContent = S.sel.size + ' selected'; };
  window.stuMove = async function (ids) {
    ids = ids || [...S.sel]; if (!ids.length) { alert('Tick at least one student first.'); return; }
    S.moving = ids; let centers = [];
    if (isItSupport) { try { centers = await api('/centers'); } catch (x) {} }
    const who = ids.length === 1 ? ((ST.find(s => s.id === ids[0]) || {}).full_name || 'student') : ids.length + ' students';
    openModal(`<h3>Transfer ${e(who)}</h3><p>Choose where to move ${ids.length === 1 ? 'them' : 'these students'}.${isItSupport ? '' : ' IT support has to approve the move.'}</p><div id="mvErr"></div>
      ${isItSupport ? `<label for="mvCenter">Center</label><select id="mvCenter" onchange="stuLoadClasses(this.value)">${centers.map(c => `<option value="${c.id}" ${c.id === authCenterId ? 'selected' : ''}>${e(c.name)}</option>`).join('')}</select>` : ''}
      <label for="mvClass">Class / stream</label><select id="mvClass"></select><p id="mvWarn" class="hint" style="display:none;margin:0 0 14px;"></p>
      <div style="display:flex;gap:10px;"><button class="btn gold" style="width:auto;padding:9px 18px;" onclick="stuDoMove()">Move</button><button class="btn ghost" style="width:auto;padding:9px 18px;" onclick="closeModal()">Cancel</button></div>`);
    await window.stuLoadClasses(isItSupport ? authCenterId : null);
  };
  window.stuLoadClasses = async function (centerId) {
    const sel = document.getElementById('mvClass'), other = centerId && centerId !== authCenterId; let list = CL;
    if (other) { try { list = await api('/student-transfer/classes?centerId=' + centerId); } catch (x) { list = []; } }
    sel.innerHTML = list.map(c => `<option value="${c.id}">${e(c.name)}</option>`).join('') || '<option value="">No classes in that center</option>';
    const w = document.getElementById('mvWarn'); if (w) { w.style.display = other ? 'block' : 'none'; w.textContent = "Marks already entered stay with the old center's exams. The student starts fresh in the new center."; }
  };
  window.stuDoMove = async function () {
    const classId = document.getElementById('mvClass').value; if (!classId) return showError('mvErr', 'Choose a class.');
    try {
      const r = await api('/student-transfer', { method: 'POST', body: { studentIds: S.moving, classId } }); S.sel.clear();
      if (r.requested !== undefined) {
        document.getElementById('genericModalContent').innerHTML = `<h3>${r.requested ? 'Request sent' : 'Nothing sent'}</h3><p>${r.requested ? r.requested + ' transfer request' + (r.requested === 1 ? '' : 's') + ' sent to IT support. The move happens once it is approved.' : 'These students already have a request waiting for approval.'}${r.requested && r.already ? ' ' + r.already + ' already had one waiting.' : ''}</p>
          <button class="btn gold" style="width:auto;padding:9px 18px;" onclick="closeModal();renderStudents(document.getElementById('adminMain'))">Done</button>`; return;
      }
      closeModal(); renderStudents(document.getElementById('adminMain'));
    }
    catch (err) { showError('mvErr', err.message); }
  };

  if (typeof renderTeachers === 'function') {
    const o = window.renderTeachers;
    window.renderTeachers = async function () { const r = await o.apply(this, arguments); try { secTabs(document.getElementById('adminMain')); } catch (x) {} return r; };
  }
  function secTabs(main) {
    const t = main && main.querySelector('.mark-grid-wrap table'); if (!t || !t.tBodies[0] || main.querySelector('.sec-tabs')) return;
    const hr = t.tHead && t.tHead.rows[0]; if (hr) { const th = document.createElement('th'); th.innerHTML = '<input type="checkbox" id="tchAll" style="margin:0;width:auto;" title="Select all shown">'; hr.insertBefore(th, hr.firstChild); }
    [...t.tBodies[0].rows].forEach(r => { const m = (r.innerHTML.match(/deleteTeacher\('([^']+)'\)/) || [])[1]; r.insertCell(0).innerHTML = m ? `<input type="checkbox" class="tchk" data-id="${m}" style="margin:0;width:auto;">` : ''; });
    const rows = [...t.tBodies[0].rows], sec = r => { const x = (r.cells[4] || {}).textContent || ''; return /Primary/i.test(x) ? 'PRIMARY' : /Junior/i.test(x) ? 'JUNIOR' : /Senior/i.test(x) ? 'SENIOR' : 'OTHER'; };
    const tabs = [['ALL', 'All'], ['PRIMARY', 'Primary'], ['JUNIOR', 'Junior'], ['SENIOR', 'Senior']], n = k => k === 'ALL' ? rows.length : rows.filter(r => sec(r) === k).length;
    const bar = document.createElement('div'); bar.className = 'sec-tabs';
    bar.innerHTML = tabs.map(([k, l], i) => `<button class="sec-tab ${i ? '' : 'on'}" data-k="${k}">${l} (${n(k)})</button>`).join('') + '<input type="text" placeholder="Search teachers">';
    let key = 'ALL', q = '';
    const apply = () => { let i = 0; rows.forEach(r => { const show = (key === 'ALL' || sec(r) === key) && r.textContent.toLowerCase().includes(q); r.style.display = show ? '' : 'none'; if (show) { const c = r.querySelector('.idx'); if (c) c.textContent = String(++i).padStart(2, '0'); } }); };
    bar.onclick = ev => { const b = ev.target.closest('.sec-tab'); if (!b) return; key = b.dataset.k; bar.querySelectorAll('.sec-tab').forEach(x => x.classList.toggle('on', x === b)); apply(); };
    bar.querySelector('input').oninput = ev => { q = ev.target.value.toLowerCase(); apply(); };
    t.closest('.mark-grid-wrap').insertAdjacentElement('beforebegin', bar);
    const tb = document.createElement('div'); tb.className = 'sec-tabs';
    tb.innerHTML = '<span id="tchCnt" style="font-size:.85rem;color:var(--text-soft);">0 selected</span><button class="btn small ghost" id="tchDel" style="color:var(--error)">Delete selected</button>';
    bar.insertAdjacentElement('afterend', tb);
    const upd = () => { document.getElementById('tchCnt').textContent = t.querySelectorAll('.tchk:checked').length + ' selected'; };
    t.addEventListener('change', ev => {
      if (ev.target.id === 'tchAll') rows.forEach(r => { const c = r.querySelector('.tchk'); if (c && r.style.display !== 'none') c.checked = ev.target.checked; });
      if (ev.target.id === 'tchAll' || ev.target.classList.contains('tchk')) upd();
    });
    document.getElementById('tchDel').onclick = async () => {
      const ids = [...t.querySelectorAll('.tchk:checked')].map(c => c.dataset.id);
      if (!ids.length) return alert('Tick at least one teacher first.');
      if (!confirm('Delete ' + ids.length + ' teacher' + (ids.length === 1 ? '' : 's') + '? This cannot be undone.')) return;
      let fail = 0; for (const id of ids) { try { await api('/teachers/' + id, { method: 'DELETE' }); } catch (x) { fail++; } }
      if (fail) alert(fail + ' could not be deleted.'); renderTeachers(main);
    };
  }
})();


/* ===== Transfer approvals (Notifications) + class teacher sees the whole class's results ===== */
(function () {
  const e = v => escapeHtml(v);
  let trList = [];
  window.trAct = async function (id, act) {
    try { await api(`/student-transfer/requests/${id}/${act}`, { method: 'POST' }); renderNotifications(document.getElementById('adminMain')); refreshPendingBadge(); }
    catch (err) { alert(err.message); }
  };
  if (typeof renderNotifications === 'function') {
    const o = window.renderNotifications;
    window.renderNotifications = async function (main) {
      const r = await o.apply(this, arguments);
      try {
        trList = await api('/student-transfer/requests');
        const it = isItSupport;
        const p = document.createElement('div'); p.className = 'panel';
        p.innerHTML = `<h3>Student transfer requests (${trList.length})</h3>` + (trList.length
          ? `<div class="mark-grid-wrap"><table><thead><tr><th>Student</th><th>From</th><th>To</th><th>Requested</th><th></th></tr></thead><tbody>${trList.map(q => `<tr><td>${e(q.full_name)} <span class="tag">${e(q.school_id_number)}</span></td>
              <td>${e(q.from_center || '')} ${e(q.from_class || '—')}</td><td>${e(q.to_center || '')} ${e(q.to_class || '—')}</td><td>${new Date(q.requested_at).toLocaleString()}</td>
              <td>${it ? `<button class="btn small gold" onclick="trAct('${q.id}','approve')">Approve</button> <button class="btn small ghost" onclick="trAct('${q.id}','reject')">Reject</button>` : '<span class="tag">Waiting for IT support</span>'}</td></tr>`).join('')}</tbody></table></div>`
          : '<div class="empty">No transfer requests right now.</div>');
        const first = main.querySelector('.panel'); first ? main.insertBefore(p, first) : main.appendChild(p);
      } catch (x) {}
      return r;
    };
  }
  if (typeof refreshPendingBadge === 'function') {
    const o = window.refreshPendingBadge;
    window.refreshPendingBadge = async function () {
      await o.apply(this, arguments);
      if (!isItSupport) return;
      try {
        const n = (await api('/student-transfer/requests')).length, el = document.getElementById('pendingBadge'); if (!el || !n) return;
        const cur = Number((el.textContent.match(/\d+/) || [0])[0]); el.textContent = ` (${cur + n})`;
      } catch (x) {}
    };
  }

  // Class teacher: whole-class results under the mark entry
  let ctSel = null;
  async function ctPanel() {
    const sel = document.getElementById('teacherExamSel'), main = document.getElementById('teacherMain'); if (!sel || !main) return;
    const old = document.getElementById('ctPanel'); if (old) old.remove();
    let mine = []; try { mine = await api('/student-transfer/class-results/mine'); } catch (x) { return; }
    if (!mine.length) return;
    const cid = mine.find(c => c.id === ctSel) ? ctSel : mine[0].id;
    const p = document.createElement('div'); p.className = 'panel'; p.id = 'ctPanel'; p.innerHTML = '<div class="spinner-row">Loading class results...</div>'; main.appendChild(p);
    let d; try { d = await api(`/student-transfer/class-results?examId=${sel.value}&classId=${cid}`); } catch (err) { p.innerHTML = `<h3>Class results</h3><div class="error-msg">${e(err.message)}</div>`; return; }
    const cols = d.subjects.map(s => `<th>${e(s.name)}</th>`).join('');
    const rows = d.results.map(r => `<tr><td class="rank">${r.position ? '#' + r.position : '—'}</td><td>${e(r.student.full_name)}</td>${d.subjects.map(s => { const m = r.marks[s.id]; return `<td class="pts">${m ? (m.percent != null ? m.percent + '% · ' : '') + e(m.sublevel || '') : '—'}</td>`; }).join('')}
      <td class="pts">${r.meanPoints != null ? r.meanPoints.toFixed(1) : '—'}</td><td>${r.meanLevel ? `<span class="level-chip ${r.meanLevel}">${r.meanLevel}</span>` : '—'}</td></tr>`).join('');
    p.innerHTML = `<h3>Class results — ${e(d.class.name)}</h3><p class="sub">You are the class teacher, so you can see every subject for this class. Shown for the exam selected above.</p>
      ${mine.length > 1 ? `<div class="row-form"><div class="field"><label for="ctClassSel">Class</label><select id="ctClassSel">${mine.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${e(c.name)}</option>`).join('')}</select></div></div>` : ''}
      ${d.results.length ? `<div class="mark-grid-wrap"><table class="mark-grid"><thead><tr><th>Pos</th><th>Student</th>${cols}<th>Mean pts</th><th>Mean grade</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">No students in this class yet.</div>'}
      <p class="hint" style="margin-top:12px;">Mean grade and position are internal MOHI tracking figures.</p>`;
    const cs = document.getElementById('ctClassSel'); if (cs) cs.onchange = ev => { ctSel = ev.target.value; ctPanel(); };
  }
  if (typeof renderTeacherMain === 'function') {
    const o = window.renderTeacherMain;
    window.renderTeacherMain = async function () { const r = await o.apply(this, arguments); try { await ctPanel(); } catch (x) {} return r; };
  }
})();


/* ===== Student IDs: type the full ID (MOHI-0210) or just the number (0210) ===== */
(function () {
  const fixId = v => { v = String(v == null ? '' : v).trim().replace(/\.0+$/, ''); return /^\d+$/.test(v) ? 'MOHI-' + v.padStart(4, '0') : v; };
  window.mohiFixId = fixId;
  window.addStudent = async function () {
    const g = id => document.getElementById(id);
    const fullName = g('newStudentName').value.trim(), schoolIdNumber = fixId(g('newStudentId').value), classId = g('newStudentClass').value;
    if (!fullName || !schoolIdNumber) return;
    try { const t = await api('/student-transfer/id-taken?id=' + encodeURIComponent(schoolIdNumber)); if (t && t.taken) { alert('The ID ' + schoolIdNumber + ' is already used' + (t.mine ? ' by a student in this center.' : ' by a student in another center.') + ' Every ID must be unique across all centers.'); return; } } catch (x) {}
    try { await api('/students', { method: 'POST', body: { fullName, schoolIdNumber, classId } }); renderStudents(document.getElementById('adminMain')); }
    catch (err) { alert(err.message); }
  };
  window.importStudentsCsv = async function () {
    const fi = document.getElementById('studentCsvFile'), main = document.getElementById('adminMain');
    try {
      const text = await readFileAsText(fi), rows = window.mohiParseCSV(text);
      const h = rows[0].map(x => String(x).toLowerCase().replace(/[^a-z0-9]/g, '')), ic = h.findIndex(x => ['schoolid', 'idcin', 'cin', 'id', 'schoolidnumber', 'admissionno', 'admno'].includes(x));
      const skip = []; let keep = rows;
      if (ic >= 0) {
        rows.slice(1).forEach(r => { r[ic] = fixId(r[ic]); });
        const key = v => String(v).trim().toUpperCase().replace(/^MOHI-/, '');
        let taken = []; try { taken = (await api('/student-transfer/check-ids', { method: 'POST', body: { ids: rows.slice(1).map(r => r[ic]) } })).taken; } catch (x) {}
        const seen = new Set(); keep = [rows[0]];
        rows.slice(1).forEach((r, i) => {
          const k = key(r[ic]);
          if (!k) { keep.push(r); return; }
          if (taken.includes(k)) { skip.push('Row ' + (i + 2) + ': ID ' + r[ic] + ' is already used. IDs must be unique across all centers.'); return; }
          if (seen.has(k)) { skip.push('Row ' + (i + 2) + ': ID ' + r[ic] + ' appears twice in this file.'); return; }
          seen.add(k); keep.push(r);
        });
      }
      if (keep.length < 2) throw new Error('Nothing to add. ' + (skip[0] || ''));
      const result = await api('/students/bulk', { method: 'POST', body: { csv: keep.map(r => r.map(csvEscape).join(',')).join('\n') } });
      fi.value = ''; renderStudents(main, csvResultBox(result.added, skip.concat(result.skipped || []).slice(0, 30), 'student'));
    } catch (err) { renderStudents(main, `<div class="error-msg" style="margin-top:12px;">${escapeHtml(err.message)}</div>`); }
  };
})();



/* ===== Phones and small screens only (width up to 720px). Desktop and tablet layouts are not changed. ===== */
(function () {
  const st = document.createElement('style');
  st.textContent = `@media (max-width:720px){
    html,body{overflow-x:hidden}
    .sidebar{width:100%;max-width:100%;flex-direction:row;align-items:center;overflow-x:auto;padding:10px;gap:4px;border-right:none;border-bottom:1px solid var(--line)}
    .sidebar button.nav-item{padding:9px 12px;font-size:.88rem;margin-bottom:0}
    .sb-user{display:none}
    .shell-row{width:100%;min-width:0}
    .main{padding:16px 14px;width:100%}
    .ov-title{font-size:1.45rem}
    .ov-pill{margin-left:0;display:inline-block;margin-top:6px}
    .ov-top{align-items:flex-start}
    .ov-tools{width:100%}
    .ov-search{flex:1;min-width:0}.ov-search input{width:100%;min-width:0}
    .ov-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}
    .ov-card{padding:14px 10px}.ov-card .num{font-size:2rem}
    .ov-panel{padding:16px 14px}
    .ov-bar{grid-template-columns:84px 1fr 40px;gap:8px}
    #pfFixed{top:8px;right:10px;width:34px;height:34px}
    body:has(#adminShell.visible) .it-strip{padding-right:52px;flex-wrap:wrap}
    .it-strip select{max-width:150px}
    #appBanner{bottom:60px}
    body:has(#studentShell.visible) .stage,body:has(#teacherShell.visible) .stage{padding:14px 10px 70px}
    .top-welcome{flex-direction:column;align-items:flex-start;gap:10px}
    .report-card{padding:16px 12px}
    .rc-head{flex-direction:column}.rc-meta{text-align:left}
    .rc-watermark{font-size:5rem}
    .rc-stats{gap:8px;flex-wrap:nowrap}
    .rc-stats .stat{width:auto;flex:1 1 0;min-width:0;padding:10px 8px}
    .rc-stats .stat .num{font-size:1.3rem}.rc-stats .stat .lbl{font-size:.6rem}
    .report-card table{font-size:.78rem}.report-card th,.report-card td{padding:7px 5px}
    .rc-contacts{flex-direction:column}.rc-contact-card{min-width:0}
    .select-row .field,.row-form .field{min-width:0;flex:1 1 100%}
    .mark-grid-wrap{max-width:100%}
    .sec-tabs input{width:100%;margin-left:0}
    .ov-grid,.ov-grid2{grid-template-columns:minmax(0,1fr)}
    .ov-grid>div,.ov-grid2>div,.ov-panel{min-width:0;max-width:100%}
  }`;
  document.head.appendChild(st);
})();
