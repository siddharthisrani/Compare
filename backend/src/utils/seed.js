require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  // create admin user if not exists
  const adminEmail = 'admin@institute.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash('password123', 10);
    admin = await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Created admin:', adminEmail);
  } else {
    console.log('Admin exists');
  }

  // seed a couple courses if none
  const count = await Course.countDocuments();
  if (count === 0) {
    await Course.create([
      {
        name: 'Full-Stack MERN (6+2)',
        code: 'FS-MERN-6+2',
        displayDuration: '6+2',
        duration_main: 6,
        duration_addon: 2,
        category: 'Full Stack',
        track: 'MERN',
        level: 'Beginner → Advanced',
        prerequisites: ['Basic JS', 'HTML & CSS'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
        tools: ['VS Code', 'Git', 'Postman'],
        projects_count: 3,
        includes_internship: true,
        includes_placement: true
      },
      {
        name: 'Data Science & AI (12+4)',
        code: 'DS-AI-12+4',
        displayDuration: '12+4',
        duration_main: 12,
        duration_addon: 4,
        category: 'Data Science',
        track: 'DA/DS',
        level: 'Intermediate',
        prerequisites: ['Python basics'],
        skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow'],
        tools: ['Jupyter', 'Colab'],
        projects_count: 4,
        includes_internship: true,
        includes_placement: true
      }
    ]);
    console.log('Seeded sample courses');
  } else {
    console.log('Courses already present');
  }

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
