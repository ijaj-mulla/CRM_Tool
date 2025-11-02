const xlsx = require('xlsx');

/**
 * Generic Excel importer that performs upsert operations with partial field updates.
 * - Parses the first sheet.
 * - Maps rows using provided mapper and allowed fields.
 * - Filters out empty values so existing DB values are not erased.
 * - Uses bulkWrite with updateOne + upsert: true.
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options
 * @param {import('mongoose').Model} options.model - Mongoose model to operate on
 * @param {string} options.uniqueKey - Key used to detect duplicates (e.g., 'accountId')
 * @param {string[]} options.allowedFields - Whitelisted flat field names (for simple mappers)
 * @param {(row: any) => Object} [options.mapRow] - Optional custom mapper for complex structures
 * @returns {Promise<{ created: number, updated: number, processed: number }>} summary
 */
async function importFromExcel(buffer, { model, uniqueKey, allowedFields = [], mapRow, setOnInsert }) {
  if (!buffer) throw new Error('No file provided');

  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

  if (!Array.isArray(rows) || rows.length === 0) {
    return { created: 0, updated: 0, processed: 0 };
  }

  // Default mapping: copy allowed fields when value is non-empty
  const defaultMapRow = (row) => {
    const doc = {};
    for (const key of allowedFields) {
      const candidate = row[key] ?? row[key?.toLowerCase?.()] ?? row[String(key).replace(/\s+/g, '')];
      if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
        doc[key] = candidate;
      }
    }
    return doc;
  };

  const documents = rows
    .map((row) => (mapRow ? mapRow(row) : defaultMapRow(row)))
    .map(pruneEmpty)
    .filter((doc) => doc && doc[uniqueKey]);

  if (!documents.length) {
    return { created: 0, updated: 0, processed: 0 };
  }

  const operations = documents.map((doc) => {
    // Build $set and $setOnInsert separately and avoid path overlaps (Mongo conflict)
    const setDoc = { ...doc };
    let setOnInsertDoc = {};
    if (typeof setOnInsert === 'function') {
      setOnInsertDoc = pruneEmpty(setOnInsert(doc) || {});
      // Remove overlapping keys from $set to prevent conflicts
      for (const k of Object.keys(setOnInsertDoc)) {
        if (k in setDoc) delete setDoc[k];
      }
    }

    const update = { $set: pruneEmpty(setDoc) };
    if (setOnInsertDoc && Object.keys(setOnInsertDoc).length > 0) {
      update.$setOnInsert = setOnInsertDoc;
    }

    return {
      updateOne: {
        filter: { [uniqueKey]: doc[uniqueKey] },
        update,
        upsert: true,
      },
    };
  });

  const result = await model.bulkWrite(operations, { ordered: false });

  // Mongoose may provide either upsertedCount/modifiedCount or nUpserted/nModified depending on version
  const created = result.upsertedCount ?? result.nUpserted ?? 0;
  const updated = result.modifiedCount ?? result.nModified ?? 0;
  return { created, updated, processed: documents.length };
}

function pruneEmpty(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue; // do not overwrite with empty strings
    if (typeof v === 'object') {
      const nested = pruneEmpty(v);
      if (nested && ((typeof nested === 'object' && Object.keys(nested).length > 0) || (Array.isArray(nested) && nested.length > 0))) {
        out[k] = nested;
      }
      continue;
    }
    out[k] = v;
  }
  return out;
}

module.exports = { importFromExcel };
