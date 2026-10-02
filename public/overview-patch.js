/* MOHI overview dashboards (School Admin + IT Support).
   Loaded AFTER the main script in public/index.html; replaces renderOverview().
   Uses only endpoints your backend already has. */
(function () {
  const css = `
  .ov-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:6px}
  .ov-head h2{font-size:2rem;margin:0}
  .ov-crumb{font-size:.78rem;color:var(--text-soft);margin:0 0 6px}
  .ov-pill{font-size:.72rem;font-weight:600;padding:3px 10px;border-radius:20px;border:1px solid var(--brand-blue);color:var(--brand-blue)}
  .ov-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:18px 0 22px}
  .ov-card{background:var(--paper-raised);border:1px solid var(--line);border-radius:12px;padding:18px}
  .ov-card .lbl{font-size:.82rem;color:var(--text-soft)}
  .ov-card .num{display:block;font-family:'Fraunces',serif;font-size:2.4rem;line-height:1.1;margin:6px 0 4px}
  .ov-card .sub{font-size:.76rem;color:var(--text-soft)}
  .ov-card:nth-child(1){border-top:3px solid var(--accent-blue)}
  .ov-card:nth-child(2){border-top:3px solid var(--accent-purple)}
  .ov-card:nth-child(3){border-top:3px solid var(--accent-orange)}
  .ov-card:nth-child(4){border-top:3px solid var(--accent-green)}
  .ov-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:18px;align-items:start}
  @media(max-width:900px){.ov-grid{grid-template-columns:1fr}}
  .ov-bar{display:grid;grid-template-columns:110px 1fr 46px;gap:10px;align-items:center;margin:10px 0;font-size:.85rem}
  .ov-bar .track{height:10px;background:var(--line);border-radius:6px;overflow:hidden}
  .ov-bar .fill{height:100%;background:var(--brand-blue);border-radius:6px}
  .ov-bar .v{text-align:right;font-family:'IBM Plex Mono',monospace;font-size:.78rem}
  .ov-actions button{display:block;width:100%;margin-bottom:10px;text-align:left}
  .ov-actions button:first-child{background:var(--brand-blue-deep);color:#fff;border:none}
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const fmt = v => (v == null ? '—' : v.toFixed(0) + '%');
  const go = view => { const b = document.querySelector(`.nav-item[data-view="${view}"]`); if (b) b.click(); };
  window.ovGo = go;

  window.renderOverview = async function (main) {
    const [classes, teachers, students, exams] = await Promise.all([
      api('/classes'), api('/teachers'), api('/students'), api('/exams')
    ]);
    // Marks come from the most recent published exam (or the latest one if none are published)
    const exam = exams.filter(e => e.is_published).pop() || exams[exams.length - 1] || null;
    const pct = m => (m.percent != null ? m.percent : (m.points / 8) * 100);

    const bySubject = {};
    const everyMark = [];
    const classRows = await Promise.all(classes.map(async c => {
      let res = [];
      if (exam) { try { res = await api(`/results?examId=${exam.id}&classId=${c.id}`); } catch (e) {} }
      const vals = [];
      res.forEach(r => r.subjects.forEach(x => {
        if (!x.mark) return;
        const p = pct(x.mark);
        vals.push(p);
        everyMark.push({ p, pts: x.mark.points });
        (bySubject[x.subject.name] = bySubject[x.subject.name] || []).push(p);
      }));
      const t = teachers.find(t => t.id === c.class_teacher_id);
      return { name: c.name, n: students.filter(s => s.class_id === c.id).length, teacher: t ? t.full_name : '—', avg: avg(vals) };
    }));

    const overall = avg(everyMark.map(m => m.p));
    const passRate = everyMark.length ? (everyMark.filter(m => m.pts >= 5).length / everyMark.length) * 100 : null;
    const center = escapeHtml(currentCenterName || 'your center');

    let cards, extra = '';
    if (isItSupport) {
      let org = null;
      try { org = await api('/centers/org-stats'); } catch (e) {}
      cards = [
        ['Total students', org ? org.students : students.length, 'All centers'],
        ['Total centers', org ? org.centers : '—', 'In the system'],
        ['Average score', fmt(overall), center + ' only'],
        ['Pass rate', fmt(passRate), center + ' only']
      ];
      if (org) extra = `<div class="panel"><h3>Centers</h3><table><thead><tr><th>Center</th><th>Students</th><th>Teachers</th></tr></thead><tbody>${
        org.perCenter.map(c => `<tr><td>${escapeHtml(c.name)}</td><td class="pts">${c.student_count}</td><td class="pts">${c.teacher_count}</td></tr>`).join('')
      }</tbody></table></div>`;
    } else {
      cards = [
        ['Total students', students.length, ''],
        ['My teachers', teachers.length, ''],
        ['Classes', classes.length, ''],
        ['Average', fmt(overall), exam ? escapeHtml(exam.name) : 'No exam yet']
      ];
    }

    const subjBars = Object.entries(bySubject).map(([n, v]) => [n, avg(v)]).sort((a, b) => b[1] - a[1]);
    const bars = subjBars.length
      ? subjBars.map(([n, v]) => `<div class="ov-bar"><span>${escapeHtml(n)}</span><div class="track"><div class="fill" style="width:${v.toFixed(0)}%"></div></div><span class="v">${v.toFixed(0)}%</span></div>`).join('')
      : '<div class="empty">Subject averages appear once marks are entered.</div>';

    const classTable = classRows.length
      ? `<table><thead><tr><th>Class</th><th>Students</th><th>Class teacher</th><th>Avg score</th><th>Status</th></tr></thead><tbody>${
        classRows.map(r => `<tr><td>${escapeHtml(r.name)}</td><td>${r.n}</td><td>${escapeHtml(r.teacher)}</td><td class="pts">${fmt(r.avg)}</td>
          <td><span class="status-pill ${r.avg != null ? 'published' : 'draft'}">${r.avg != null ? '● Marked' : '○ No marks'}</span></td></tr>`).join('')
      }</tbody></table>`
      : '<div class="empty">No classes yet. Add one under Classes.</div>';

    const examRows = exams.slice(-5).reverse().map(e => `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.term || '—')}, ${escapeHtml(e.academic_year || '—')}</td>
      <td><span class="status-pill ${e.is_published ? 'published' : 'draft'}">${e.is_published ? '● Published' : '○ Draft'}</span></td></tr>`).join('');

    main.innerHTML = `
      <p class="ov-crumb">Dashboard / ${center} / Overview</p>
      <div class="ov-head"><h2>${isItSupport ? 'Overview' : center + ' overview'}</h2>
        <span class="ov-pill">${isItSupport ? 'IT Support' : 'Center Admin'}</span></div>
      <p class="lede">${isItSupport ? 'Performance across MOHI. Use the center switcher above to change center.' : 'Live stats for your center.'}</p>
      <div class="ov-cards">${cards.map(c => `<div class="ov-card"><span class="lbl">${c[0]}</span><span class="num">${c[1]}</span><span class="sub">${c[2] || '&nbsp;'}</span></div>`).join('')}</div>
      <div class="ov-grid">
        <div>
          <div class="panel"><h3>Classes</h3>${classTable}</div>
          <div class="panel"><h3>Performance by subject</h3>${bars}</div>
          ${extra}
        </div>
        <div>
          <div class="panel ov-actions"><h3>Quick actions</h3>
            <button class="btn" onclick="ovGo('students')">Add student</button>
            <button class="btn ghost" onclick="ovGo('exams')">Schedule exam</button>
            <button class="btn ghost" onclick="ovGo('results')">View results</button></div>
          <div class="panel"><h3>Recent exams</h3>
            ${examRows ? `<table><tbody>${examRows}</tbody></table>` : '<div class="empty">No exams yet.</div>'}</div>
        </div>
      </div>`;
  };
})();
