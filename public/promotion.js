/* MOHI Promotion: move learners up a class (by class, by stream, or one by one) and set off leavers.
   Loaded after the main script. Adds renderPromotion(); the sidebar button is data-view="promotion". */
(function () {
  const e = v => escapeHtml(v);
  const ORDER = ['PP1', 'PP2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const STAY = '', SETOFF = 'setoff';
  const P = { mode: 'class', classId: '', streamKey: '*', picked: new Set(), plan: [], students: [], classes: [], choice: {}, studentDest: '' };

  const gIdx = c => { const i = ORDER.indexOf(c.gradeKey); return i < 0 ? 99 : i; };
  const sortPlan = a => a.slice().sort((x, y) => gIdx(x) - gIdx(y) || x.name.localeCompare(y.name));
  const thisYear = new Date().getFullYear();

  function destOptions(selected, allowStay) {
    const cls = sortPlan(P.plan);
    return (allowStay ? `<option value="${STAY}" ${selected === STAY ? 'selected' : ''}>Stay in this class (no change)</option>` : '<option value="" disabled ' + (!selected ? 'selected' : '') + '>Choose where they go…</option>') +
      `<option value="${SETOFF}" ${selected === SETOFF ? 'selected' : ''}>Set off — leaving the school</option>` +
      '<optgroup label="Promote to">' + cls.map(c => `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${e(c.name)}</option>`).join('') + '</optgroup>';
  }
  const initialChoice = c => (c.suggest === 'promote' ? c.targetId : c.suggest === 'setoff' ? SETOFF : STAY);
  const learnersOf = id => P.students.filter(s => s.class_id === id);

  async function load() {
    const [plan, students] = await Promise.all([api('/promotion/plan'), api('/students')]);
    P.plan = plan; P.students = students;
    P.classes = sortPlan(plan);
    plan.forEach(c => { if (!(c.id in P.choice)) P.choice[c.id] = initialChoice(c); });
    if (!plan.find(c => c.id === P.classId)) P.classId = P.classes.length ? P.classes[0].id : '';
  }

  window.renderPromotion = async function (main) {
    if (!main) main = document.getElementById('adminMain');
    await load();
    let hist = [], left = [];
    try { [hist, left] = await Promise.all([api('/promotion/history'), api('/promotion/left')]); } catch (x) {}
    const tab = (m, label) => `<button class="btn small ${P.mode === m ? '' : 'ghost'}" onclick="promSetMode('${m}')">${label}</button>`;
    main.innerHTML = `<h2>Promotion</h2>
      <p class="lede">Move learners up to the next class at the end of the year, and set off the ones who are leaving the school. Pick whole classes, a whole stream, or individual learners. Nothing changes until you press the button, and a finished run can be undone. Transfers to another class or center are still under <strong>Students</strong>.</p>
      <div class="panel"><h3>Promote or set off</h3>
        <div class="row-form" style="margin-bottom:10px;">
          <div class="field"><label for="promYear">Academic year (for the record)</label><input type="text" id="promYear" value="${thisYear} to ${thisYear + 1}" style="max-width:200px;"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">${tab('class', 'By class')}${tab('stream', 'By stream')}${tab('students', 'Selected learners')}</div>
        <div id="promBody"></div>
        <div id="promResult"></div></div>
      <div class="panel"><h3>Past promotion runs</h3>${histHtml(hist)}</div>
      <div class="panel"><h3>Set-off learners (${left.length})</h3>${leftHtml(left)}</div>`;
    drawBody();
  };

  function histHtml(h) {
    if (!h.length) return '<div class="empty">No promotions have been run yet.</div>';
    return `<div style="overflow-x:auto;"><table><thead><tr><th>When</th><th>Year</th><th>Promoted</th><th>Set off</th><th></th></tr></thead><tbody>${h.map(r => `<tr>
      <td>${e(new Date(r.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }))}</td><td>${e(r.academic_year || '—')}</td><td>${r.promoted}</td><td>${r.set_off}</td>
      <td>${r.restored ? 'Restore' : r.undone ? '<span class="tag">Undone</span>' : `<button class="btn small ghost" style="white-space:nowrap" onclick="promUndo('${r.batch_id}')">Undo this run</button>`}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function leftHtml(l) {
    if (!l.length) return '<div class="empty">Nobody has been set off.</div>';
    return `<div style="overflow-x:auto;"><table><thead><tr><th></th><th>Name</th><th>School ID</th><th>Last class</th><th>Year</th></tr></thead><tbody>${l.map(s => `<tr>
      <td><input type="checkbox" class="promLeft" value="${s.id}" style="margin:0;width:auto;"></td><td>${e(s.full_name)}</td><td><span class="tag">${e(s.school_id_number)}</span></td><td>${e(s.last_class || '—')}</td><td>${e(s.academic_year || '—')}</td></tr>`).join('')}</tbody></table></div>
      <div class="row-form" style="margin-top:10px;"><div class="field"><label for="promRestoreTo">Bring the ticked learners back into</label>
        <select id="promRestoreTo">${sortPlan(P.plan).map(c => `<option value="${c.id}">${e(c.name)}</option>`).join('')}</select></div>
        <button class="btn small ghost" onclick="promRestore()">Restore ticked learners</button></div>`;
  }

  window.promSetMode = m => { P.mode = m; P.picked.clear(); document.getElementById('promResult').innerHTML = ''; window.renderPromotion(); };

  function classRows(list) {
    if (!list.length) return '<div class="empty">No classes here yet.</div>';
    return `<div style="overflow-x:auto;"><table><thead><tr><th>Class</th><th>Learners</th><th>Where they go</th></tr></thead><tbody>${sortPlan(list).map(c => `<tr>
      <td><strong>${e(c.name)}</strong></td><td>${c.learners}</td>
      <td><select data-cls="${c.id}" onchange="promChoose('${c.id}', this.value)" style="min-width:230px;${P.choice[c.id] === SETOFF ? 'border-color:#d9a441;' : ''}">${destOptions(P.choice[c.id], true)}</select>
      ${c.suggest === 'choose' ? '<div style="font-size:.72rem;color:var(--text-soft)">Could not tell the next class automatically — please choose.</div>' : ''}</td></tr>`).join('')}</tbody></table></div>`;
  }
  window.promChoose = (id, v) => { P.choice[id] = v; const el = document.querySelector(`select[data-cls="${id}"]`); if (el) el.style.borderColor = v === SETOFF ? '#d9a441' : ''; updateCount(); };
  window.promStream = v => { P.streamKey = v; drawBody(); };
  window.promClass = v => { P.classId = v; P.picked.clear(); drawBody(); };

  function visibleClasses() {
    if (P.mode === 'class') return P.plan.filter(c => c.id === P.classId);
    if (P.mode === 'stream') return P.plan.filter(c => P.streamKey === '*' || c.streamKey === P.streamKey);
    return [];
  }

  function drawBody() {
    const body = document.getElementById('promBody'); if (!body) return;
    const streams = [...new Map(P.plan.filter(c => c.streamKey).map(c => [c.streamKey, c.stream])).entries()];
    if (P.mode === 'class') {
      body.innerHTML = `<div class="row-form"><div class="field"><label for="promClassSel">Class</label><select id="promClassSel" onchange="promClass(this.value)">${sortPlan(P.plan).map(c => `<option value="${c.id}" ${c.id === P.classId ? 'selected' : ''}>${e(c.name)} (${c.learners})</option>`).join('')}</select></div></div>${classRows(visibleClasses())}${actionBar()}`;
    } else if (P.mode === 'stream') {
      body.innerHTML = `<div class="row-form"><div class="field"><label for="promStreamSel">Stream</label><select id="promStreamSel" onchange="promStream(this.value)"><option value="*" ${P.streamKey === '*' ? 'selected' : ''}>All streams (whole school)</option>${streams.map(([k, n]) => `<option value="${k}" ${P.streamKey === k ? 'selected' : ''}>${e(n)}</option>`).join('')}</select></div></div>
        <p class="sub">A stream is the same colour or name across the grades, for example every “Green” class. Each class moves up to the next grade’s class in the same stream. The last grade in the school is suggested for set-off. Change any row before you press the button.</p>${classRows(visibleClasses())}${actionBar()}`;
    } else {
      const ls = learnersOf(P.classId);
      body.innerHTML = `<div class="row-form"><div class="field"><label for="promClassSel">Class</label><select id="promClassSel" onchange="promClass(this.value)">${sortPlan(P.plan).map(c => `<option value="${c.id}" ${c.id === P.classId ? 'selected' : ''}>${e(c.name)} (${c.learners})</option>`).join('')}</select></div>
        <div class="field"><label for="promStuDest">Where the ticked learners go</label><select id="promStuDest" onchange="P_dest(this.value)">${destOptions(P.studentDest, false)}</select></div></div>
        ${ls.length ? `<div style="overflow-x:auto;"><table><thead><tr><th><input type="checkbox" id="promAll" onchange="promAll(this.checked)" style="margin:0;width:auto;"></th><th>Name</th><th>School ID</th></tr></thead><tbody>${ls.map(s => `<tr><td><input type="checkbox" class="promStu" value="${s.id}" ${P.picked.has(s.id) ? 'checked' : ''} onchange="promPick('${s.id}', this.checked)" style="margin:0;width:auto;"></td><td>${e(s.full_name)}</td><td><span class="tag">${e(s.school_id_number)}</span></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No learners in this class.</div>'}${actionBar()}`;
    }
    updateCount();
  }
  window.P_dest = v => { P.studentDest = v; updateCount(); };
  window.promPick = (id, on) => { on ? P.picked.add(id) : P.picked.delete(id); updateCount(); };
  window.promAll = on => { learnersOf(P.classId).forEach(s => (on ? P.picked.add(s.id) : P.picked.delete(s.id))); document.querySelectorAll('.promStu').forEach(c => (c.checked = on)); updateCount(); };

  function actionBar() { return '<div style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;"><button class="btn" style="width:auto;padding:9px 18px;" id="promGo" onclick="promApply()">Apply</button><span id="promCount" class="hint"></span></div>'; }

  // The moves implied by what is on screen right now.
  function buildMoves() {
    if (P.mode === 'students') {
      const ids = [...P.picked]; if (!ids.length || !P.studentDest) return [];
      return [{ studentIds: ids, action: P.studentDest === SETOFF ? 'setoff' : 'promote', classId: P.studentDest === SETOFF ? null : P.studentDest }];
    }
    return visibleClasses().filter(c => P.choice[c.id] && c.learners).map(c => ({
      studentIds: learnersOf(c.id).map(s => s.id), action: P.choice[c.id] === SETOFF ? 'setoff' : 'promote', classId: P.choice[c.id] === SETOFF ? null : P.choice[c.id], from: c.name,
    }));
  }
  function updateCount() {
    const m = buildMoves(), up = m.filter(x => x.action === 'promote').reduce((n, x) => n + x.studentIds.length, 0), off = m.filter(x => x.action === 'setoff').reduce((n, x) => n + x.studentIds.length, 0);
    const el = document.getElementById('promCount'), go = document.getElementById('promGo');
    if (el) el.textContent = up + off ? `${up} to be promoted, ${off} to be set off` : (P.mode === 'students' ? 'Tick learners and choose where they go.' : 'Nothing will change with the current choices.');
    if (go) { go.disabled = !(up + off); go.style.opacity = up + off ? 1 : .5; }
  }

  window.promApply = async function () {
    const moves = buildMoves(); if (!moves.length) return;
    const up = moves.filter(x => x.action === 'promote').reduce((n, x) => n + x.studentIds.length, 0), off = moves.filter(x => x.action === 'setoff').reduce((n, x) => n + x.studentIds.length, 0);
    const lines = P.mode === 'students' ? '' : '\n\n' + moves.map(x => `${x.from}: ${x.studentIds.length} → ${x.action === 'setoff' ? 'SET OFF (leaving)' : (P.plan.find(c => c.id === x.classId) || {}).name}`).join('\n');
    if (!confirm(`Promote ${up} learner(s) and set off ${off} learner(s)?${lines}\n\nYou can undo this run afterwards.`)) return;
    try {
      const r = await api('/promotion/apply', { method: 'POST', body: { moves: moves.map(({ studentIds, action, classId }) => ({ studentIds, action, classId })), academicYear: document.getElementById('promYear').value } });
      P.picked.clear(); P.choice = {};
      await window.renderPromotion();
      document.getElementById('promResult').innerHTML = `<div class="status-pill published" style="margin-top:12px;">${r.promoted} promoted, ${r.setOff} set off${r.skipped ? `, ${r.skipped} skipped` : ''}</div>`;
    } catch (err) { document.getElementById('promResult').innerHTML = `<div class="error-msg" style="margin-top:12px;">${e(err.message)}</div>`; }
  };
  window.promUndo = async function (id) {
    if (!confirm('Undo this whole run? Learners go back to where they were, and set-off learners return to their old class.')) return;
    try { const r = await api('/promotion/undo', { method: 'POST', body: { batchId: id } }); P.choice = {}; await window.renderPromotion(); document.getElementById('promResult').innerHTML = `<div class="status-pill published" style="margin-top:12px;">${r.restored} learner(s) put back${r.skipped ? `, ${r.skipped} had moved since and were left alone` : ''}</div>`; }
    catch (err) { alert(err.message); }
  };
  window.promRestore = async function () {
    const ids = [...document.querySelectorAll('.promLeft:checked')].map(c => c.value), classId = document.getElementById('promRestoreTo').value;
    if (!ids.length) return alert('Tick the learners to bring back.');
    try { await api('/promotion/restore', { method: 'POST', body: { studentIds: ids, classId } }); P.choice = {}; await window.renderPromotion(); } catch (err) { alert(err.message); }
  };
})();
