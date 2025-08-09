const mongoose = require('mongoose');

// Admin User Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

// Blog Post Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Kiran Gunathilaka' },
  category: {
    type: [String],
    required: true,
    set: v => Array.isArray(v) ? v : [v]
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  image: String,
  readTime: String,
  published: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  fullDescription: String,
  category: {
    type: [String],
    required: true,
    set: v => Array.isArray(v) ? v : [v]
  },
  technologies: [String],
  features: [String],
  techDetails: String,
  github: String,
  demo: String,
  image: String,
  featured: { type: Boolean, default: false },
  date: String,
  published: { type: Boolean, default: true }
}, { timestamps: true });

// Milestone Schema (Education & Certifications)
const milestoneSchema = new mongoose.Schema({
  type: { type: String, enum: ['education', 'certification'], required: true },
  title: { type: String, required: true },
  institution: String,
  issuer: String,
  period: String,
  date: String,
  status: String,
  grade: String,
  gpa: String,
  recentGPA: String,
  description: String,
  achievements: [String],
  coursework: [String],
  certType: String, // For certifications
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Individual skill subdocument schema
const individualSkillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  level: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false }); // Disable _id for subdocuments to avoid conflicts

// Skills Schema - FIXED to allow any category
const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
    // REMOVED the enum constraint to allow any category name
  },
  categoryTitle: {
    type: String,
    required: true,
    trim: true
  },
  categoryIcon: {
    type: String,
    required: true,
    enum: ['Code', 'Globe', 'Cpu', 'Wrench'], // Icons are still constrained
    default: 'Code'
  },
  skills: [individualSkillSchema], // Use the subdocument schema
  order: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Soft Skills Schema
const softSkillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  order: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Create indexes for better performance
blogSchema.index({ slug: 1, published: 1 });
projectSchema.index({ slug: 1, published: 1 });
blogSchema.index({ category: 1, featured: 1 });
projectSchema.index({ category: 1, featured: 1 });

// Skills indexes
skillSchema.index({ category: 1 }); // Index on category for faster queries
skillSchema.index({ order: 1 }); // Index on order for sorting
softSkillSchema.index({ order: 1 }); // Index on order for sorting

// Add compound index to ensure category uniqueness
skillSchema.index({ category: 1 }, { unique: true });

module.exports = {
  Admin: mongoose.model('Admin', adminSchema),
  Blog: mongoose.model('Blog', blogSchema),
  Project: mongoose.model('Project', projectSchema),
  Milestone: mongoose.model('Milestone', milestoneSchema),
  Skill: mongoose.model('Skill', skillSchema),
  SoftSkill: mongoose.model('SoftSkill', softSkillSchema)
};