// Simulates exactly what mohi-webapp.html's JS does, call for call, against
// the real running backend — the closest thing to a browser test I can run
// in this sandbox (no chromium binary available).
const BASE = 'http://localhost:3001';
let pass = 0, fail = 0;

function check(cond, label, extra) {
  if (cond) { pass++; console.log(`PASS  ${label}`); }
  else { fail++; console.log(`FAIL  ${label}${extra ? '  -> ' + JSON.stringify(extra) : ''}`); }
}

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

async function main() {
  // ---- School admin login (exact shape loginAdmin() expects) ----
  let r = await api('/auth/admin/login', { method: 'POST', body: { email: 'admin@ndovoini.mohiafrica.org', password: 'Admin@2026' } });
  check(r.status === 200 && r.data.token && !r.data.centerSelectionRequired, 'school admin login returns a direct token', r.data);
  const adminToken = r.data.token;

  // ---- enterAdminShell()'s /centers call for a school_admin ----
  r = await api('/centers', { token: adminToken });
  check(r.status === 200 && r.data.length === 1 && r.data[0].name === 'Ndovoini Center', 'school admin /centers returns exactly their own center', r.data);

  // ---- renderOverview()'s Promise.all ----
  const [classesR, teachersR, studentsR, examsR] = await Promise.all([
    api('/classes', { token: adminToken }), api('/teachers', { token: adminToken }),
    api('/students', { token: adminToken }), api('/exams', { token: adminToken }),
  ]);
  check(classesR.data.length === 4, 'Overview: 4 classes', classesR.data.length);
  check(teachersR.data.length === 2, 'Overview: 2 teachers', teachersR.data.length);
  check(studentsR.data.length === 2, 'Overview: 2 students', studentsR.data.length);
  check(examsR.data.length === 1, 'Overview: 1 exam', examsR.data.length);

  const examId = examsR.data[0].id;
  const grade8 = classesR.data.find(c => c.name === 'Grade 8 Green');
  const englishSubj = (await api('/subjects', { token: adminToken })).data.find(s => s.name === 'English');
  const brian = studentsR.data.find(s => s.school_id_number === 'MOHI-0142');

  // ---- IT login + center picker (exact shape renderCenterPicker/selectCenter expect) ----
  r = await api('/auth/admin/login', { method: 'POST', body: { email: 'it@mohi.org', password: 'IT@2026' } });
  check(r.status === 200 && r.data.centerSelectionRequired === true && r.data.centers.length === 6, 'IT login requires center pick, sees 6 centers', r.data);
  const itToken = r.data.itToken;
  const babadogo = r.data.centers.find(c => c.name === 'Babadogo Center');
  const ndovoiniFromIt = r.data.centers.find(c => c.name === 'Ndovoini Center');

  r = await api('/auth/admin/select-center', { method: 'POST', body: { itToken, centerId: babadogo.id } });
  check(r.status === 200 && r.data.token, 'IT selects Babadogo, gets a token', r.data);
  const itBabadogoToken = r.data.token;

  r = await api('/classes', { token: itBabadogoToken });
  check(r.status === 200 && r.data.length === 0, 'IT as Babadogo sees 0 classes (empty center)', r.data);

  r = await api('/auth/admin/switch-center', { method: 'POST', body: { centerId: ndovoiniFromIt.id }, token: itBabadogoToken });
  check(r.status === 200 && r.data.token, 'IT switches to Ndovoini mid-session', r.data);
  const itNdovoiniToken = r.data.token;

  r = await api('/classes', { token: itNdovoiniToken });
  check(r.status === 200 && r.data.length === 4, 'IT as Ndovoini now sees 4 classes', r.data.length);

  // ---- Teacher two-step login (exact shape loginTeacher/promptTeacherName/confirmTeacher expect) ----
  r = await api('/auth/teacher/login', { method: 'POST', body: { email: 'ndov.jss@mohiafrica.org', password: 'Teacher@2026' } });
  check(r.status === 200 && r.data.sectionToken && r.data.teachers.length === 2, 'teacher step 1 returns section token + 2 teachers', r.data);
  const sectionToken = r.data.sectionToken;
  const teacherId = r.data.teachers.find(t => t.full_name.includes('Otieno')).id; // Peter Otieno teaches Grade 8 Green / English

  r = await api('/auth/teacher/select', { method: 'POST', body: { sectionToken, teacherId } });
  check(r.status === 200 && r.data.token && r.data.teacher.full_name, 'teacher step 2 returns real token', r.data);
  const teacherToken = r.data.token;

  // ---- renderTeacherMain()'s calls ----
  const [tTeachers, tClasses, tSubjects, tExams] = await Promise.all([
    api('/teachers', { token: teacherToken }), api('/classes', { token: teacherToken }),
    api('/subjects', { token: teacherToken }), api('/exams', { token: teacherToken }),
  ]);
  const me = tTeachers.data.find(t => t.id === teacherId);
  check(me && me.class_ids.includes(grade8.id) && me.subject_ids.includes(englishSubj.id), 'teacher record has correct class/subject assignment', me);

  r = await api(`/marks?examId=${examId}&classId=${grade8.id}&subjectId=${englishSubj.id}`, { token: teacherToken });
  check(r.status === 200 && r.data.some(g => g.student_id === brian.id), 'mark-entry grid includes Brian Otieno', r.data);

  // ---- handlePercentChange(): enter 72% ----
  r = await api('/marks', { method: 'PUT', body: { examId, studentId: brian.id, subjectId: englishSubj.id, sublevel: null, percent: 72 }, token: teacherToken });
  check(r.status === 200 && r.data.mark.sublevel === 'EE2' && r.data.mark.points === 7, '72% correctly converts to EE2/7pts', r.data);

  // ---- loadRemarks() + handleRemarkChange() ----
  r = await api('/remarks', { method: 'PUT', body: { examId, studentId: brian.id, text: 'Great progress this term.' }, token: teacherToken });
  check(r.status === 200 && r.data.text === 'Great progress this term.', 'remark saved', r.data);
  r = await api(`/remarks?examId=${examId}&classId=${grade8.id}`, { token: teacherToken });
  check(r.status === 200 && r.data.some(x => x.student_id === brian.id), 'loadRemarks() GET returns the saved remark', r.data);

  // ---- publish, then edit mark again -> should queue ----
  await api(`/exams/${examId}/publish`, { method: 'PATCH', body: { isPublished: true }, token: adminToken });
  r = await api('/marks', { method: 'PUT', body: { examId, studentId: brian.id, subjectId: englishSubj.id, sublevel: null, percent: 45 }, token: teacherToken });
  check(r.status === 202 && r.data.queued === true, 'editing a mark on a published exam queues for approval', r.data);

  // ---- clearing a mark on a published exam should ALSO queue (not silently apply) ----
  r = await api(`/marks?examId=${examId}&studentId=${brian.id}&subjectId=${englishSubj.id}`, { method: 'DELETE', token: teacherToken });
  check(r.status === 202 && r.data.queued === true, 'clearing a mark on a published exam also queues for approval', r.data);

  // ---- admin approves the percent-change request ----
  r = await api('/edit-requests?status=pending', { token: adminToken });
  const percentReq = r.data.find(x => x.new_value === 'AE1');
  check(!!percentReq, 'pending request for the 45% (AE1) change exists', r.data);
  r = await api(`/edit-requests/${percentReq.id}/approve`, { method: 'POST', token: adminToken });
  check(r.status === 200 && r.data.approved === true, 'admin approves the mark change', r.data);

  r = await api(`/marks?examId=${examId}&classId=${grade8.id}&subjectId=${englishSubj.id}`, { token: adminToken });
  const brianRow = r.data.find(g => g.student_id === brian.id);
  check(brianRow.sublevel === 'AE1', 'mark actually shows AE1 after approval', brianRow);

  // ---- reject the pending clear request, mark should still be there ----
  r = await api('/edit-requests?status=pending', { token: adminToken });
  const clearReq = r.data[0];
  r = await api(`/edit-requests/${clearReq.id}/reject`, { method: 'POST', token: adminToken });
  check(r.status === 200 && r.data.rejected === true, 'admin rejects the clear request', r.data);
  r = await api(`/marks?examId=${examId}&classId=${grade8.id}&subjectId=${englishSubj.id}`, { token: adminToken });
  check(r.data.find(g => g.student_id === brian.id).sublevel === 'AE1', 'mark unchanged after rejection', r.data);

  // ---- student login (exact shape loginStudent/setNewPassword expect) ----
  r = await api('/auth/student/login', { method: 'POST', body: { schoolIdNumber: 'MOHI-0142', password: 'Student@2026' } });
  check(r.status === 200 && r.data.needsPasswordChange && r.data.resetToken, 'student first login forces password reset', r.data);
  r = await api('/auth/student/set-password', { method: 'POST', body: { resetToken: r.data.resetToken, newPassword: 'BrianNewPass1' } });
  check(r.status === 200 && r.data.token, 'student sets new password, gets a real token', r.data);
  const studentToken = r.data.token;

  // ---- enterStudentShell()'s /students/me ----
  r = await api('/students/me', { token: studentToken });
  check(r.status === 200 && r.data.full_name === 'Brian Otieno' && r.data.class_name === 'Grade 8 Green', '/students/me returns Brian\'s own record', r.data);

  // ---- renderStudentMain()'s report card + trend ----
  r = await api(`/report-card/${brian.id}?examId=${examId}`, { token: studentToken });
  check(r.status === 200 && r.data.meanLevel === 'AE' && r.data.remark === 'Great progress this term.', 'report card shows correct mean level + remark', r.data);
  check(r.data.classTeacher && r.data.classTeacher.full_name.includes('Otieno'), 'report card includes class teacher contact', r.data.classTeacher);

  r = await api(`/report-card/${brian.id}/trend`, { token: studentToken });
  check(r.status === 200 && Array.isArray(r.data), 'trend endpoint returns an array', r.data);

  // ---- security: student CANNOT view another student's report card ----
  const faith = studentsR.data.find(s => s.school_id_number === 'MOHI-0101');
  r = await api(`/report-card/${faith.id}?examId=${examId}`, { token: studentToken });
  check(r.status === 403, "student is blocked from another student's report card", r);

  // ---- security: student token cannot list the full roster ----
  r = await api('/students', { token: studentToken });
  check(r.status === 403, 'student token is blocked from GET /students (full roster + parent contacts)', r);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
