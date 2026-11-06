import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { firstSheetToQuotedCsv, rowsToWorkbook } from '../lib/excel.js';

export const excelRouter = Router();
excelRouter.use(requireAuth);

// Excel (.xlsx, base64) -> CSV text, so the browser-side importers can read Excel files.
excelRouter.post('/to-csv', requireRole('admin'), asyncHandler(async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'An Excel file is required' });
  try {
    res.json({ csv: await firstSheetToQuotedCsv(Buffer.from(file, 'base64')) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}));

// rows -> downloadable .xlsx (used for the templates the browser builds itself).
excelRouter.post('/build', requireRole('admin'), asyncHandler(async (req, res) => {
  const { sheetName, rows } = req.body;
  if (!Array.isArray(rows) || !rows.length || rows.length > 20000 || !rows.every(Array.isArray)) {
    return res.status(400).json({ error: 'rows must be a non-empty list of rows' });
  }
  const buf = await rowsToWorkbook(sheetName, rows);
  res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  res.send(Buffer.from(buf));
}));
