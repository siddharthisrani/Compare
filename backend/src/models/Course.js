const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  importance: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  moduleName: { type: String }
}, { _id: false });

const syllabusModuleSchema = new mongoose.Schema({
  moduleName: String,
  topics: [topicSchema]
}, { _id: false });

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, index: true, unique: true, required: true }, // e.g. JAVA-6+2
  displayDuration: { type: String }, // '6+2'
  duration_main: { type: Number },
  duration_addon: { type: Number },
  category: { type: String },
  track: { type: String }, // "JAVA", "MERN" etc
  level: { type: String },
  prerequisites: [String],
  skills: [String],
  tools: [String],
  projects_count: { type: Number, default: 0 },
  includes_internship: { type: Boolean, default: false },
  includes_placement: { type: Boolean, default: false },
  syllabus: [syllabusModuleSchema],
  outcomes: [String],

  // 🔴 who created / owns this course (trainer or admin)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

  // 🔴 last time topics/content changed
  lastUpdated: { type: Date, default: Date.now },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
