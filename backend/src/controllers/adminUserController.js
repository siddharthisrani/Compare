const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// validators for create/update
const createUserValidators = [
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['admin','trainer','student']).withMessage('Invalid role')
];

const updateUserValidators = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin','trainer','student']).withMessage('Invalid role'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password min 6 chars')
];

// GET /api/admin/users
async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/users
async function createUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'trainer', // 🔵 default new user created by admin = trainer
      isActive: true
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { id } = req.params;
    const { name, email, role, password, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id  → soft delete (isActive=false)
async function deactivateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUserValidators,
  updateUserValidators,
  listUsers,
  createUser,
  updateUser,
  deactivateUser
};
