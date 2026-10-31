// Reads a school's own Excel mark sheets (one sheet per class, a NAME column,
// one column per subject) without needing a fixed template. Pure logic: the
// Excel file is first turned into `sheets = [{ name, rows: [[cell,...],...] }]`
// by lib/excel.js, which keeps this file easy to test.

import {
  norm, parseClassLabel, pickClass, displayGrade, levelOfGrade, resolveSubject,
  componentKey, isGroupTotal, isIgnoredColumn, makeStudentMatcher, CATALOG,
} from './curriculum.js';
import { isValidSublevel, percentToSublevel } from './grading.js';

const NAME_HEADERS = new Set(['NAME', 'NAMES', 'STUDENT NAME', 'STUDENTS NAME', 'LEARNER', 'LEARNER NAME', 'LEARNERS NAME', 'PUPIL', 'PUPIL NAME', 'FULL NAME']);
const SUMMARY_ROW = /^(TOTAL|TOTALS|MEAN|AVERAGE|AVG|POSITION|HIGHEST|LOWEST|STD DEV|S D|GRAND TOTAL|MEAN SCORE|CLASS MEAN)\b/;
const GROUP_HEADER = { english: 'ENGLISH', kiswahili: 'KISWAHILI' };

const text = v => (v == null ? '' : String(v).trim());

function parseScore(v) {
  // -> { skip } | { percent } | { sublevel } | { bad, capped }
  if (v == null || v === '') return { skip: true };
  if (typeof v === 'number') {
    if (v < 0) return { bad: v };
    return v > 100 ? { percent: 100, capped: v } : { percent: Math.round(v * 100) / 100 };
  }
  const s = String(v).trim();
  if (!s || /^(-+|—|–|ABS|ABSENT|A|X|N\/?A|NIL|\.)$/i.test(s)) return { skip: true };
  const up = s.toUpperCase();
  if (isValidSublevel(up)) return { sublevel: up };
  const n = Number(s.replace('%', ''));
  if (!Number.isNaN(n)) return parseScore(n);
  return { bad: s };
}

function findHeader(rows) {
  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) if (NAME_HEADERS.has(norm(row[c]))) return { r, nameCol: c };
  }
  return null;
}

function classLabelFor(sheet, headerRow) {
  const fromName = parseClassLabel(sheet.name);
  if (fromName) return { parsed: fromName, via: 'sheet name' };
  for (let r = 0; r < headerRow; r++) {
    for (const cell of sheet.rows[r] || []) {
      const p = typeof cell === 'string' ? parseClassLabel(cell) : null;
      if (p) return { parsed: p, via: 'sheet title' };
    }
  }
  return { parsed: null };
}

// Look at one sheet: which class, which column is which subject, which rows are learners.
export function analyzeSheet(sheet, { classes, subjects }) {
  const out = { sheet: sheet.name, status: 'ok', reason: null, class: null, level: null, columns: [], learners: [], warnings: [] };
  const hdr = findHeader(sheet.rows);
  if (!hdr) {
    const empty = !sheet.rows.some(r => (r || []).some(v => v != null && String(v).trim() !== ''));
    out.status = 'skipped'; out.reason = empty ? 'Empty sheet (no marks entered yet)' : 'No NAME column found'; return out;
  }

  const { parsed } = classLabelFor(sheet, hdr.r);
  if (parsed?.combined || /COMBINED|COMB\b/i.test(sheet.name)) { out.status = 'skipped'; out.reason = 'Combined / summary sheet (the per-class sheets are used instead)'; return out; }
  const picked = pickClass(parsed, classes);
  if (!picked.cls) { out.status = 'skipped'; out.reason = picked.error; return out; }
  out.class = { id: picked.cls.id, name: picked.cls.name };
  out.level = levelOfGrade(parsed.gradeKey);

  // ----- columns -----
  const headRow = sheet.rows[hdr.r] || [];
  const taken = new Map(); // subject key -> column index
  let lastGroup = null; const groupDone = new Set();
  const cols = [];
  for (let c = hdr.nameCol + 1; c < headRow.length; c++) {
    const h = text(headRow[c]);
    if (!h) continue;
    const label = h.replace(/\s+/g, ' ');
    const n = norm(h);
    const isPPReading = out.level === 'PP' && n === 'READING';
    const comp = !isPPReading ? componentKey(h) : null;
    if (comp) { lastGroup = comp; cols.push({ col: c, header: label, action: 'part', note: `part of ${GROUP_HEADER[comp]} — not saved on its own` }); continue; }

    let lookup = null, viaGroup = false;
    if (isGroupTotal(h) && lastGroup && !groupDone.has(lastGroup)) { lookup = GROUP_HEADER[lastGroup]; viaGroup = true; }
    else if (isIgnoredColumn(h)) { lastGroup = null; cols.push({ col: c, header: label, action: 'ignored' }); continue; }
    else lookup = h;
    const closedGroup = viaGroup ? lastGroup : null;
    lastGroup = null;

    const r = resolveSubject(lookup, subjects, out.level);
    if (!r) { cols.push({ col: c, header: label, action: 'unrecognised' }); continue; }
    const dupKey = r.subject ? r.subject.id : `new:${norm(r.name)}`;
    if (taken.has(dupKey)) { cols.push({ col: c, header: label, action: 'ignored', note: `duplicate of column ${taken.get(dupKey)}` }); continue; }
    taken.set(dupKey, label);
    if (closedGroup) groupDone.add(closedGroup);
    if (r.key === 'english' || r.key === 'kiswahili') groupDone.add(r.key);
    cols.push({ col: c, header: label, action: r.action, subject: r.name, subjectId: r.subject?.id || null, section: r.section ?? r.subject?.section ?? null, via: viaGroup ? 'sum of its papers' : null });
  }
  out.columns = cols;
  const markCols = cols.filter(c => c.subject);
  if (!markCols.length) { out.status = 'skipped'; out.reason = 'No subject columns recognised'; return out; }

  // ----- learners -----
  for (let r = hdr.r + 1; r < sheet.rows.length; r++) {
    const row = sheet.rows[r] || [];
    const name = text(row[hdr.nameCol]);
    if (!name || !/[A-Za-z]{2}/.test(name) || SUMMARY_ROW.test(norm(name))) continue;
    const scores = [];
    for (const mc of markCols) {
      const s = parseScore(row[mc.col]);
      if (s.skip) continue;
      if (s.bad !== undefined) { out.warnings.push(`${name} — ${mc.header}: "${s.bad}" isn't a valid score, skipped`); continue; }
      if (s.capped) out.warnings.push(`${name} — ${mc.header}: ${s.capped} is over 100, saved as 100`);
      scores.push({ col: mc.col, subject: mc.subject, subjectId: mc.subjectId, ...s });
    }
    out.learners.push({ row: r + 1, name, scores });
  }
  if (!out.learners.length) { out.status = 'skipped'; out.reason = 'No learners found under the NAME column'; }
  return out;
}

// Full plan for a workbook: matches learners to students, lists subjects to add.
// ctx: { classes, subjects, studentsByClass: Map(classId -> [{id, full_name}]) }
export function buildPlan(sheets, ctx) {
  const report = [], marks = [], newSubjects = new Map();
  let matchedTotal = 0, unmatchedTotal = 0;
  for (const sh of sheets) {
    const a = analyzeSheet(sh, ctx);
    const entry = {
      sheet: a.sheet, status: a.status, reason: a.reason, class: a.class,
      columns: a.columns.filter(c => c.action !== 'ignored' || c.note).map(c => ({ header: c.header, action: c.action, subject: c.subject || null, note: c.note || c.via || null })),
      learners: a.learners.length, matched: 0, unmatched: [], marks: 0, warnings: a.warnings.slice(0, 15),
    };
    report.push(entry);
    if (a.status !== 'ok') continue;

    const match = makeStudentMatcher(ctx.studentsByClass.get(a.class.id) || []);
    for (const l of a.learners) {
      const m = match(l.name);
      if (!m.student) { entry.unmatched.push(`${l.name} (${m.error})`); continue; }
      entry.matched++;
      for (const s of l.scores) {
        const col = a.columns.find(c => c.col === s.col);
        if (!col.subjectId) newSubjects.set(norm(col.subject), { name: col.subject, section: col.section });
        marks.push({
          studentId: m.student.id, subjectId: col.subjectId, subjectName: col.subject,
          percent: s.percent ?? null, sublevel: s.sublevel || percentToSublevel(s.percent),
        });
        entry.marks++;
      }
    }
    matchedTotal += entry.matched; unmatchedTotal += entry.unmatched.length;
  }
  return {
    report, marks, newSubjects: [...newSubjects.values()],
    totals: {
      sheets: report.length, imported: report.filter(r => r.status === 'ok').length,
      learnersMatched: matchedTotal, learnersUnmatched: unmatchedTotal, marks: marks.length,
    },
  };
}

// Subject columns for the downloadable marks sheet of a class at this level.
export function subjectHeadersForLevel(level) {
  const skip = ['cre', 'ire', 'hre'];
  const senior = ['maths', 'english', 'kiswahili', 'csl', 'pe'];
  return CATALOG
    .filter(c => c.names[level] && !skip.includes(c.key) && (level !== 'SS' || senior.includes(c.key)))
    .map(c => c.names[level]);
}
export { displayGrade };
