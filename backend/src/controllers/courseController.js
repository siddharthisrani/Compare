const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');

const createValidators = [
  body('name').notEmpty().withMessage('Name required'),
  body('code').notEmpty().withMessage('Code required'),
];

async function listCourses(req, res, next) {
  try {
    const q = req.query.q || '';
    const filter = { isActive: true };
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { track: new RegExp(q, 'i') }, { category: new RegExp(q, 'i') }];
    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    res.json(courses);
  } catch (err) { next(err); }
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
  deactivateCourse
};
