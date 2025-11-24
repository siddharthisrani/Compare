const { body, validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const Course = require('../models/Course');

const createValidators = [
  body('name').notEmpty().withMessage('Name required'),
  body('code').notEmpty().withMessage('Code required'),
];

async function exportCourseXlsx(req, res, next) {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // create workbook + sheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(course.name || 'Syllabus');

    // header row
    ws.addRow(['Day', 'Technology', 'Topic', 'Module']);

    // flatten syllabus -> rows
    let dayCounter = 1;
    (course.syllabus || []).forEach(mod => {
      const moduleName = mod.moduleName || '';
      (mod.topics || []).forEach(t => {
        ws.addRow([
          dayCounter++,
          t.technology || '',      // if you stored it; else leave ''
          t.name || '',
          moduleName
          
        ]);
      });
    });

    // some basic styling (optional)
    ws.getRow(1).font = { bold: true };
    ws.columns.forEach(col => { col.width = 25; });

    // send as download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${(course.code || 'course').replace(/[^a-z0-9\-]/gi,'_')}.xlsx"`
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

async function listCourses(req, res, next) {
  try {
    const q = req.query.q || '';
    const includeInactive = req.query.includeInactive === '1'; // 👈 NEW

    const filter = {};
    if (!includeInactive) {
      // for public pages: only active courses
      filter.isActive = true;
      // if you want to treat "missing isActive" as active, use:
      // filter.isActive = { $ne: false };
    }

    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { track: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') }
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getCourse(req, res, next) {
  try {
    const c = await Course.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) { next(err); }
}

async function createCourse(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const payload = {
      ...req.body,
      createdBy: req.user?.id,          // ⬅️ trainer/admin who is logged in
      lastUpdated: new Date()
    };

    if (payload.code) {
      const existing = await Course.findOne({ code: payload.code });
      if (existing) return res.status(409).json({ message: 'Course code already exists' });
    }

    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (err) { next(err); }
}

async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });

    Object.assign(course, req.body, { lastUpdated: new Date() });
    await course.save();
    res.json(course);
  } catch (err) { next(err); }
}

async function deactivateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    course.isActive = false;
    await course.save();
    res.json({ message: 'Course deactivated' });
  } catch (err) { next(err); }
}

module.exports = {
  createValidators,
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deactivateCourse,
  exportCourseXlsx
};
