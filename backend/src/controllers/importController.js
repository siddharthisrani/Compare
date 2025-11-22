// backend/src/controllers/importController.js
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const Course = require('../models/Course');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * Detect the header row index where "Technology" and "Topics" appear.
 */
function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const lower = rows[i].map(c => (c || '').toString().trim().toLowerCase());
    if (lower.includes('technology') && lower.some(v => v.startsWith('topics') || v === 'topic')) {
      return i;
    }
  }
  return -1;
}

/**
 * Given the header row, find pairs of columns (technologyIdx, topicIdx).
 */
function findTechTopicPairs(headerRow) {
  const pairs = [];

  for (let i = 0; i < headerRow.length; i++) {
    const val = (headerRow[i] || '').toString().trim().toLowerCase();
    if (val === 'technology') {
      let topicIdx = -1;
      for (let j = i + 1; j < headerRow.length; j++) {
        const v2 = (headerRow[j] || '').toString().trim().toLowerCase();
        if (v2 === 'topics' || v2.startsWith('topic')) {
          topicIdx = j;
          break;
        }
      }
      pairs.push({ techIdx: i, topicIdx });
    }
  }

  return pairs.filter(p => p.techIdx >= 0 && p.topicIdx >= 0);
}

/**
 * Parse your MERN Excel-exported CSV into clean rows: [{ technology, topic }]
 */
function extractTechnologyTopics(csvText) {
  const rows = parse(csvText, {
    columns: false,
    skip_empty_lines: false,
    relax_column_count: true,
    trim: true
  });

  if (!rows.length) return [];

  const headerRowIndex = findHeaderRow(rows);
  if (headerRowIndex === -1) {
    throw new Error('Could not find "Technology" and "Topics" header row in file.');
  }

  const headerRow = rows[headerRowIndex];
  const pairs = findTechTopicPairs(headerRow);
  if (!pairs.length) {
    throw new Error('Could not detect any Technology/Topics column pairs.');
  }

  const result = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    for (const { techIdx, topicIdx } of pairs) {
      const tech = (row[techIdx] || '').toString().trim();
      const topic = (row[topicIdx] || '').toString().trim();
      if (!tech && !topic) continue;

      result.push({
        technology: tech,
        topic,
        importance: 'Medium'
      });
    }
  }

  return result;
}

async function importCsvHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File required' });
    }

    const courseCode = (req.query.code || '').trim();
    if (!courseCode) {
      return res.status(400).json({ message: 'Course code is required in query (?code=...)' });
    }

    const text = req.file.buffer.toString('utf8');
    const entries = extractTechnologyTopics(text);
    if (!entries.length) {
      return res.status(400).json({ message: 'No Technology/Topic rows found in file.' });
    }

    let course = await Course.findOne({ code: courseCode });
    if (!course) {
      course = await Course.create({
        code: courseCode,
        name: courseCode,
        displayDuration: '',
        category: 'Full Stack',
        track: 'MERN',
        syllabus: [],
        isActive: true
      });
    }

    course.syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];

    // 🔴 NEW: allow ?replace=1 to wipe old syllabus
    const shouldReplace =
      req.query.replace === '1' ||
      req.query.replace === 'true' ||
      req.query.replace === 'yes';

    if (shouldReplace) {
      course.syllabus = [];
    }

    const norm = s => (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

    let addedTopics = 0;
    let createdModules = 0;

    for (const row of entries) {
      const techName = (row.technology || '').trim();
      const topicName = (row.topic || '').trim();
      const moduleTitle = techName || 'General';

      let module = course.syllabus.find(
        m => (m.moduleName || '').trim().toLowerCase() === moduleTitle.toLowerCase()
      );
      if (!module) {
        module = { moduleName: moduleTitle, topics: [] };
        course.syllabus.push(module);
        createdModules++;
      }

      if (topicName) {
        const keyNew = norm(topicName);
        const exists = (module.topics || []).some(t => norm(t.name) === keyNew);
        if (!exists) {
          module.topics.push({
            name: topicName,
            importance: row.importance || 'Medium'
          });
          addedTopics++;
        }
      }
    }

    course.lastUpdated = new Date();
    await course.save();

    res.json({
      message: 'Import complete',
      courseCode,
      modules: course.syllabus.length,
      createdModules,
      addedTopics,
      replaced: !!shouldReplace
    });
  } catch (err) {
    console.error('Import error:', err);
    next(err);
  }
}

module.exports = {
  upload,
  importCsvHandler
};
