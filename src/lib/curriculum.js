// Kenya CBC learning areas by level, plus the "short forms" teachers actually
// type in their mark sheets (MATHS, SST, C/A, SCIE&TECH, AGRIC&NUT ...).
//
// Source of the catalog: the KICD/Ministry of Education rationalisation of
// learning areas (2023/24) — Pre-Primary 5, Lower Primary 7, Upper Primary 8,
// Junior School 9. Senior School is pathway-based; the list there is a starting
// point and should be confirmed against the current KICD designs.
//
// `section` is how the subject is stored in the existing `subjects.section`
// column (null = shown for every section).

export const LEVELS = [
  { key: 'PP', label: 'Pre-Primary (PP1–PP2)', section: 'PRIMARY' },
  { key: 'LP', label: 'Lower Primary (Grade 1–3)', section: 'PRIMARY' },
  { key: 'UP', label: 'Upper Primary (Grade 4–6)', section: 'PRIMARY' },
  { key: 'JS', label: 'Junior School (Grade 7–9)', section: 'JUNIOR' },
  { key: 'SS', label: 'Senior School (Grade 10–12)', section: 'SENIOR' },
];

// key -> subject definition. `names` gives the official name per level.
// `section` is the value stored in subjects.section.
const S = (key, section, names) => ({ key, section, names });

export const CATALOG = [
  S('maths', null, { PP: 'Mathematical Activities', LP: 'Mathematics', UP: 'Mathematics', JS: 'Mathematics', SS: 'Mathematics' }),
  S('english', null, { LP: 'English', UP: 'English', JS: 'English', SS: 'English' }),
  S('kiswahili', null, { LP: 'Kiswahili', UP: 'Kiswahili', JS: 'Kiswahili', SS: 'Kiswahili' }),
  S('language', 'PRIMARY', { PP: 'Language Activities' }),
  S('indigenous', 'PRIMARY', { LP: 'Indigenous Language Activities' }),
  S('environmental', 'PRIMARY', { PP: 'Environmental Activities', LP: 'Environmental Activities' }),
  S('creative', null, { PP: 'Creative Activities', LP: 'Creative Activities', UP: 'Creative Arts', JS: 'Creative Arts and Sports' }),
  S('re', null, { PP: 'Religious Education', LP: 'Religious Education', UP: 'Religious Education', JS: 'Religious Education' }),
  S('cre', null, { PP: 'Christian Religious Education (CRE)', LP: 'Christian Religious Education (CRE)', UP: 'Christian Religious Education (CRE)', JS: 'Christian Religious Education (CRE)', SS: 'Christian Religious Education (CRE)' }),
  S('ire', null, { PP: 'Islamic Religious Education (IRE)', LP: 'Islamic Religious Education (IRE)', UP: 'Islamic Religious Education (IRE)', JS: 'Islamic Religious Education (IRE)', SS: 'Islamic Religious Education (IRE)' }),
  S('hre', null, { PP: 'Hindu Religious Education (HRE)', LP: 'Hindu Religious Education (HRE)', UP: 'Hindu Religious Education (HRE)', JS: 'Hindu Religious Education (HRE)', SS: 'Hindu Religious Education (HRE)' }),
  S('agri', null, { UP: 'Agriculture and Nutrition', JS: 'Agriculture and Nutrition' }),
  S('sst', null, { UP: 'Social Studies', JS: 'Social Studies' }),
  S('scitech', 'PRIMARY', { UP: 'Science and Technology' }),
  S('intsci', 'JUNIOR', { JS: 'Integrated Science' }),
  S('pretech', 'JUNIOR', { JS: 'Pre-Technical Studies' }),
  // Senior School
  S('csl', 'SENIOR', { SS: 'Community Service Learning' }),
  S('pe', 'SENIOR', { SS: 'Physical Education' }),
  S('biology', 'SENIOR', { SS: 'Biology' }),
  S('chemistry', 'SENIOR', { SS: 'Chemistry' }),
  S('physics', 'SENIOR', { SS: 'Physics' }),
  S('gensci', 'SENIOR', { SS: 'General Science' }),
  S('computer', 'SENIOR', { SS: 'Computer Studies' }),
  S('agriculture', 'SENIOR', { SS: 'Agriculture' }),
  S('homesci', 'SENIOR', { SS: 'Home Science' }),
  S('business', 'SENIOR', { SS: 'Business Studies' }),
  S('history', 'SENIOR', { SS: 'History and Citizenship' }),
  S('geography', 'SENIOR', { SS: 'Geography' }),
  S('literature', 'SENIOR', { SS: 'Literature in English' }),
  S('fasihi', 'SENIOR', { SS: 'Fasihi ya Kiswahili' }),
  S('music', 'SENIOR', { SS: 'Music and Dance' }),
  S('finearts', 'SENIOR', { SS: 'Fine Arts' }),
  S('theatre', 'SENIOR', { SS: 'Theatre and Film' }),
  S('sportsci', 'SENIOR', { SS: 'Sports Science' }),
];

// Catalog laid out per level, for the "add from the KNEC list" screen.
export function catalogByLevel() {
  return LEVELS.map(l => ({
    key: l.key,
    label: l.label,
    section: l.section,
    subjects: CATALOG.filter(c => c.names[l.key]).map(c => ({ key: c.key, name: c.names[l.key], section: c.section })),
  }));
}

// ---------- normalising helpers ----------

export function norm(s) {
  return String(s ?? '').toUpperCase().replace(/&/g, ' AND ').replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

// Header (short form) -> catalog key. Order matters: first match wins.
const ALIASES = [
  ['maths', /^(MATHS?|MATHEMATICS|MATHEMATICAL( ACTIVITIES)?|MTH)$/],
  ['kiswahili', /^(KISWAHILI|KISW|KIS|KSL|KISWAHILI KSL|KENYAN SIGN LANGUAGE|KENYA SIGN LANGUAGE)$/],
  ['english', /^(ENGLISH|ENG)$/],
  ['indigenous', /^(INDIGENOUS( LANGUAGE)?( ACTIVITIES)?|IND LANG|MOTHER TONGUE)$/],
  ['language', /^(LANGUAGE|LANGUAGE ACTIVITIES|LANG|LITERACY|LITERACY ACTIVITIES)$/],
  ['environmental', /^(ENV|ENVIRONMENTAL|ENVIRONMENT|ENVIRONMENTAL ACTIVITIES|ENV ACTIVITIES|ENVIRONMENTAL ACT|ENV ACT)$/],
  ['creative', /^(C A|CA|CAS|C A S|CREATIVE|CREATIVE ACTIVITIES|CREATIVE ARTS|CREATIVE ARTS AND SPORTS|CREATIVE ARTS SPORTS|CREATIVE AND SPORTS|ARTS AND CRAFT|PSYCHOMOTOR AND CREATIVE( ACTIVITIES)?)$/],
  ['cre', /^(CRE|C R E|CHRISTIAN RELIGIOUS EDUCATION|CHRISTIAN RELIGIOUS EDUCATION CRE)$/],
  ['ire', /^(IRE|I R E|ISLAMIC RELIGIOUS EDUCATION|ISLAMIC RELIGIOUS EDUCATION IRE)$/],
  ['hre', /^(HRE|H R E|HINDU RELIGIOUS EDUCATION|HINDU RELIGIOUS EDUCATION HRE)$/],
  ['re', /^(RE|R E|RELIGION|RELIGIOUS|RELIGIOUS EDUCATION|RELIGIOUS ACTIVITIES|RELIGIOUS EDUCATION ACTIVITIES|REL)$/],
  ['agri', /^(AGRI|AGRIC|AGRI AND NUT|AGRIC AND NUT|AGRI NUT|AGRIC NUT|AGRICULTURE AND NUTRITION|AGRICULTURE NUTRITION|A AND N|AGR AND NUT|AGRICULTURE AND NUTRITION)$/],
  ['sst', /^(SST|S S T|SOC|SOCIAL|SOCIAL STUDIES|S STUDIES|SOCIAL STUD|SOC STUDIES|SST CRE)$/],
  ['scitech', /^(SCIE AND TECH|SCI AND TECH|SCIENCE AND TECH|SCIENCE AND TECHNOLOGY|SCIENCE TECH|SCI TECH|SCIE TECH|SCIENCE|SCI|S AND T)$/],
  ['intsci', /^(INTER SCIENCE|INT SCIENCE|INTEG SCIENCE|INTEGRATED SCIENCE|INTER SCI|INT SCI|INTERGRATED SCIENCE|INTEGRATED SCI|IS)$/],
  ['pretech', /^(PRE TECH|PRETECH|PRE TECHNICAL|PRE TECHNICAL STUDIES|PRE TECH STUDIES|PTS|PRETECHNICAL STUDIES|PRE TECHNICAL STUDIES)$/],
  ['csl', /^(CSL|COMMUNITY SERVICE LEARNING|COMMUNITY SERVICE)$/],
  ['pe', /^(PE|P E|PHYSICAL EDUCATION)$/],
  ['biology', /^(BIO|BIOLOGY)$/],
  ['chemistry', /^(CHEM|CHEMISTRY)$/],
  ['physics', /^(PHY|PHYS|PHYSICS)$/],
  ['gensci', /^(GENERAL SCIENCE|GEN SCIENCE|GEN SCI)$/],
  ['computer', /^(COMP STUDIES|COMPUTER|COMPUTER STUDIES|ICT|COMPUTER SCIENCE)$/],
  ['agriculture', /^(AGRICULTURE)$/],
  ['homesci', /^(HOME SCIENCE|HOMESCI|HSC)$/],
  ['business', /^(BUSINESS|BUSINESS STUDIES|BST)$/],
  ['history', /^(HISTORY|HIST|HISTORY AND CITIZENSHIP|HIST AND CITIZENSHIP)$/],
  ['geography', /^(GEO|GEOG|GEOGRAPHY)$/],
  ['literature', /^(LIT|LITERATURE|LITERATURE IN ENGLISH)$/],
  ['fasihi', /^(FASIHI|FASIHI YA KISWAHILI)$/],
  ['music', /^(MUSIC|MUSIC AND DANCE)$/],
  ['finearts', /^(FINE ARTS|FINE ART|ART AND DESIGN)$/],
  ['theatre', /^(THEATRE|THEATRE AND FILM)$/],
  ['sportsci', /^(SPORTS SCIENCE|SPORTS AND RECREATION)$/],
];

export function aliasKey(header) {
  const n = norm(header);
  if (!n) return null;
  for (const [key, re] of ALIASES) if (re.test(n)) return key;
  return null;
}

// Sub-papers that roll up into a parent subject. Teachers' sheets often have
// Grammar + Reading -> ENGLISH, or Lugha + Kusoma -> KISWAHILI, or
// ENG 1 + ENG 2 -> TOTALS. Components are never saved as subjects themselves.
const COMPONENTS = [
  ['english', /^(GRAMMAR|GRAM|COMP|COMPREHENSION|WRITING|COMPOSITION|ENG ?[12]|ENGLISH ?[12]|ENGLISH (GRAMMAR|COMPOSITION|COMPREHENSION|WRITING)|READING)$/],
  ['kiswahili', /^(LUGHA|KUSOMA|INSHA|SARUFI|KARATASI ?[12]|KISWAHILI ?[12]|KISW ?[12]|KUANDIKA|KUSIKILIZA)$/],
];
// A "total" column that closes a group of components.
const GROUP_TOTAL = /^(TOTALS?|JUMLA|TOTAL MARKS)$/;
// Columns that are never marks.
const IGNORED = /^(NO|NO S|S NO|SN|ADM|ADM NO|ADMISSION|ADMISSION NO|NAME|NAMES|STUDENT NAME|LEARNER|LEARNER NAME|TOTALS?|JUMLA|MEAN|AVG|AVERAGE|GRADE|POSITION|POS|RANK|REMARKS?|CLASS|STREAM|TR|TEACHER|%|PERCENT|POINTS|PTS|LEVEL)$/;

export function componentKey(header) {
  const n = norm(header);
  for (const [key, re] of COMPONENTS) if (re.test(n)) return key;
  return null;
}
export function isGroupTotal(header) { return GROUP_TOTAL.test(norm(header)); }
export function isIgnoredColumn(header) { return IGNORED.test(norm(header)); }

// ---------- classes ----------

export function levelOfGrade(gradeKey) {
  if (/^PP/.test(gradeKey)) return 'PP';
  const n = Number(gradeKey);
  if (n >= 1 && n <= 3) return 'LP';
  if (n >= 4 && n <= 6) return 'UP';
  if (n >= 7 && n <= 9) return 'JS';
  if (n >= 10) return 'SS';
  return null;
}
export function sectionOfLevel(level) {
  return LEVELS.find(l => l.key === level)?.section || null;
}

const WORD_NUMS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10, ELEVEN: 11, TWELVE: 12 };

// "GRD 4 RED", "Grade 8 Green", "G5 COMBINED", "GRD 6G", "PP1 RED", "GRADE FOUR BLUE TR. X"
// -> { gradeKey: '4' | 'PP1', stream: 'RED', combined: bool }
export function parseClassLabel(label) {
  const n = norm(label);
  if (!n) return null;
  const combined = /\b(COMBINED|COMBINE|COMB|ALL STREAMS|SUMMARY|ANALYSIS|MERGED)\b/.test(n);
  let m = n.match(/^(?:PP|PRE ?PRIMARY|PRE ?UNIT)\s*([12])\b\s*(.*)$/);
  if (m) return { gradeKey: `PP${m[1]}`, stream: cleanStream(m[2]), combined };
  m = n.match(/^(?:GRD|GRADE|GR|G|STD|STANDARD|CLASS|FORM)\s*(\d{1,2})\s*(.*)$/);
  if (m) return { gradeKey: String(Number(m[1])), stream: cleanStream(m[2]), combined };
  m = n.match(/^(?:GRD|GRADE|GR)\s+([A-Z]+)\s*(.*)$/);
  if (m && WORD_NUMS[m[1]]) return { gradeKey: String(WORD_NUMS[m[1]]), stream: cleanStream(m[2]), combined };
  m = n.match(/^(\d{1,2})\s*(.*)$/);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return { gradeKey: String(Number(m[1])), stream: cleanStream(m[2]), combined };
  return null;
}
function cleanStream(s) {
  // drop trailing "TR <teacher>" / "TEACHER ..." noise and filler words
  return (s || '').replace(/\b(TR|TCR|TEACHER|MR|MRS|MS)\b.*$/, '').replace(/\b(COMBINED|COMBINE|COMB)\b/g, '').trim();
}

export function pickClass(parsed, classes) {
  // classes: [{id, name, ...}] -> { cls } | { error }
  if (!parsed) return { error: 'Could not tell which class this sheet is for' };
  const sameGrade = classes
    .map(c => ({ c, p: parseClassLabel(c.name) }))
    .filter(x => x.p && x.p.gradeKey === parsed.gradeKey);
  if (!sameGrade.length) return { error: `No class for ${displayGrade(parsed.gradeKey)} exists yet — add it under Classes first` };
  if (!parsed.stream) {
    if (sameGrade.length === 1) return { cls: sameGrade[0].c };
    const plain = sameGrade.filter(x => !x.p.stream);
    if (plain.length === 1) return { cls: plain[0].c };
    return { error: `${displayGrade(parsed.gradeKey)} has several streams — the sheet name doesn't say which one` };
  }
  const want = parsed.stream.replace(/\s+/g, '');
  const exact = sameGrade.filter(x => x.p.stream.replace(/\s+/g, '') === want);
  if (exact.length === 1) return { cls: exact[0].c };
  // short forms: "6G" -> Green, "RD" -> Red
  const loose = sameGrade.filter(x => {
    const s = x.p.stream.replace(/\s+/g, '');
    return s && (s.startsWith(want) || want.startsWith(s));
  });
  if (loose.length === 1) return { cls: loose[0].c };
  if (sameGrade.length === 1 && !sameGrade[0].p.stream) return { cls: sameGrade[0].c };
  return { error: `No "${parsed.stream}" stream found for ${displayGrade(parsed.gradeKey)}` };
}
export function displayGrade(k) { return k.startsWith('PP') ? k : `Grade ${k}`; }

// ---------- subjects ----------

// Resolve a header / short form to a subject for a class of the given level.
// -> { subject, name, key, action: 'matched' | 'will-add' } or null
export function resolveSubject(header, dbSubjects, level) {
  const n = norm(header);
  if (!n) return null;
  // 1. the school's own subject names always win (also handles custom ones)
  const direct = dbSubjects.find(s => norm(s.name) === n);
  if (direct) return { subject: direct, name: direct.name, key: aliasKey(header), action: 'matched' };

  const key = aliasKey(header);
  if (!key) return null;
  const def = CATALOG.find(c => c.key === key);
  const official = def?.names[level] || Object.values(def?.names || {})[0];
  // 2. the official name for this level
  let hit = official && dbSubjects.find(s => norm(s.name) === norm(official));
  // 3. any name this subject goes by at another level
  if (!hit && def) {
    const all = new Set(Object.values(def.names).map(norm));
    hit = dbSubjects.find(s => all.has(norm(s.name)));
  }
  if (hit) return { subject: hit, name: hit.name, key, action: 'matched' };
  // 4. not set up yet -> will be added from the catalog
  if (!def?.names[level]) return null;
  return { subject: null, name: official, key, section: def.section, action: 'will-add' };
}

// ---------- student names ----------

export function nameTokens(s) { return norm(s).split(' ').filter(Boolean); }
export function nameKey(s) { return nameTokens(s).join(' '); }
export function sortedNameKey(s) { return nameTokens(s).sort().join(' '); }

// Build a matcher over a class's students. Handles different name order,
// extra spaces, and a missing/extra middle name (needs a unique match).
export function makeStudentMatcher(students) {
  const exact = new Map(), sorted = new Map();
  for (const st of students) {
    const k = nameKey(st.full_name), sk = sortedNameKey(st.full_name);
    exact.set(k, [...(exact.get(k) || []), st]);
    sorted.set(sk, [...(sorted.get(sk) || []), st]);
  }
  return function match(name) {
    const k = nameKey(name), sk = sortedNameKey(name);
    if (!k) return { error: 'blank name' };
    for (const m of [exact.get(k), sorted.get(sk)]) {
      if (m && m.length === 1) return { student: m[0] };
      if (m && m.length > 1) return { error: 'two students in the class share this name' };
    }
    const mine = new Set(nameTokens(name));
    if (mine.size >= 2) {
      const cands = students.filter(st => {
        const theirs = new Set(nameTokens(st.full_name));
        const [small, big] = mine.size <= theirs.size ? [mine, theirs] : [theirs, mine];
        return small.size >= 2 && [...small].every(t => big.has(t));
      });
      if (cands.length === 1) return { student: cands[0] };
      if (cands.length > 1) return { error: 'matches more than one student' };
    }
    return { error: 'not found in this class' };
  };
}

// ---------- which subjects belong on a report card ----------
// Each level only reports its own learning areas (a Grade 7 card never shows
// Primary-only subjects). A missing mark shows as "W". Senior School shows
// only subjects that were entered, plus the main ones, padded to at least 7.

export const SENIOR_MAIN = ['english', 'kiswahili', 'maths'];
export const SENIOR_MIN_SUBJECTS = 7;
const RELIGION = ['re', 'cre', 'ire', 'hre'];
const groupOf = key => (RELIGION.includes(key) ? 'religion' : key);
const offeredAt = (key, level) => !!CATALOG.find(c => c.key === key)?.names[level];

export function levelOfClassName(name) {
  const p = parseClassLabel(name);
  return p ? levelOfGrade(p.gradeKey) : null;
}

// Subjects (rows from the subjects table) that can apply to this level.
export function eligibleSubjects(subjects, level, section) {
  return subjects.filter(s => {
    const k = aliasKey(s.name);
    if (level && k) return offeredAt(k, level);
    return !s.section || s.section === section;   // custom subjects / unknown level: section rule
  });
}

function pickSubjects(subjects, level, section, markedIds) {
  const groups = new Map();
  for (const s of eligibleSubjects(subjects, level, section)) {
    const k = aliasKey(s.name);
    const g = k ? groupOf(k) : `custom:${s.id}`;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(s);
  }
  const out = [];
  for (const [g, list] of groups) {
    const custom = g.startsWith('custom:');
    const marked = list.filter(s => markedIds.has(s.id));
    if (marked.length) { marked.forEach(s => out.push({ subject: s, key: aliasKey(s.name), marked: true })); continue; }
    if (custom) continue;                         // custom subjects only appear when graded
    const priority = ['cre', 're', 'ire', 'hre'];
    const official = list.find(s => level && norm(s.name) === norm(CATALOG.find(c => c.key === aliasKey(s.name))?.names[level]));
    const rep = official || [...list].sort((a, b) => priority.indexOf(aliasKey(a.name)) - priority.indexOf(aliasKey(b.name)))[0];
    out.push({ subject: rep, key: aliasKey(rep.name), marked: false });
  }
  const order = k => { const i = CATALOG.findIndex(c => c.key === k); return i < 0 ? 999 : i; };
  return out.sort((a, b) => order(a.key) - order(b.key) || a.subject.name.localeCompare(b.subject.name));
}

// One learner's report-card rows. marksById: Map(subject_id -> mark).
export function reportRows({ subjects, level, section, marksById }) {
  const picked = pickSubjects(subjects, level, section, new Set(marksById.keys()));
  const senior = level === 'SS';
  const rows = picked
    .filter(p => !senior || p.marked || SENIOR_MAIN.includes(p.key))
    .map(p => { const mark = marksById.get(p.subject.id) || null; return { subject: p.subject, mark, missing: !mark }; });
  if (senior) {
    while (rows.length < SENIOR_MIN_SUBJECTS) rows.push({ subject: { id: null, name: '—' }, mark: null, missing: true, placeholder: true });
  }
  return rows;
}

// Columns for a whole class's results grid.
export function classColumns({ subjects, level, section, markedIds }) {
  const senior = level === 'SS';
  return pickSubjects(subjects, level, section, markedIds)
    .filter(p => !senior || p.marked || SENIOR_MAIN.includes(p.key))
    .map(p => p.subject);
}
