// Thin wrapper around exceljs: read an uploaded .xlsx into plain rows, and
// build the downloadable template workbooks.
import ExcelJS from 'exceljs';

// Excel cells can hold formulas, rich text, dates, hyperlinks... flatten to a
// plain number / string / null. Formulas give their last calculated value, so
// the school's own totals (e.g. ENGLISH = Grammar + Reading as a %) come through.
function plain(v) {
  if (v == null) return null;
  if (typeof v !== 'object') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if ('result' in v) return plain(v.result);
  if ('richText' in v) return v.richText.map(t => t.text).join('');
  if ('text' in v) return v.text;
  if ('error' in v) return null;
  return null;
}

export async function readSheets(buffer) {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buffer);
  } catch {
    throw new Error('That file could not be read. Please upload an Excel .xlsx file (open the file in Excel and use Save As > Excel Workbook if it is an older .xls).');
  }
  return wb.worksheets.map(ws => {
    const rows = [];
    ws.eachRow({ includeEmpty: true }, (row, n) => {
      const cells = [];
      for (let c = 1; c <= ws.columnCount; c++) cells.push(plain(row.getCell(c).value));
      rows[n - 1] = cells;
    });
    for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
    return { name: ws.name, rows };
  });
}

// First sheet -> CSV text, so the existing students/teachers CSV importers can
// be reused unchanged for Excel files.
export async function firstSheetToCsv(buffer) {
  const [sheet] = await readSheets(buffer);
  if (!sheet) throw new Error('That workbook has no sheets.');
  const lines = sheet.rows
    .filter(r => r.some(v => v != null && String(v).trim() !== ''))
    .map(r => r.map(v => (v == null ? '' : String(v).replace(/[,\r\n]+/g, ' ').trim())).join(','));
  return lines.join('\n');
}

const HEAD_STYLE = { font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } } };

export async function simpleTemplate(sheetName, headers, exampleRows, widths) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.addRow(headers).eachCell(c => Object.assign(c, HEAD_STYLE));
  exampleRows.forEach(r => ws.addRow(r));
  headers.forEach((_, i) => { ws.getColumn(i + 1).width = widths?.[i] || 22; });
  return wb.xlsx.writeBuffer();
}

// One sheet per class: title, then NO. / NAME / one column per subject, learners pre-filled.
// sheets: [{ name, title, subjects: [..], learners: [..] }]
export async function marksWorkbook(sheets) {
  const wb = new ExcelJS.Workbook();
  for (const sh of sheets) {
    const ws = wb.addWorksheet(sh.name.slice(0, 31));
    ws.getCell('A1').value = sh.title; ws.getCell('A1').font = { bold: true, size: 13 };
    ws.getCell('A2').value = 'Enter each score as a mark out of 100 (or a sub-level like EE1). Leave blank or use - if absent.';
    ws.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };
    ws.addRow([]); ws.addRow([]);
    ws.addRow(['NO.', 'NAME', ...sh.subjects]).eachCell(c => Object.assign(c, HEAD_STYLE));
    sh.learners.forEach((n, i) => ws.addRow([i + 1, n]));
    ws.getColumn(1).width = 6; ws.getColumn(2).width = 34;
    sh.subjects.forEach((_, i) => { ws.getColumn(i + 3).width = 16; });
    ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 5 }];
  }
  if (!wb.worksheets.length) wb.addWorksheet('Marks');
  return wb.xlsx.writeBuffer();
}
