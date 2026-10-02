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
