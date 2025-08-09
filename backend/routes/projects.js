const express = require('express');
const Joi = require('joi');
const { Project } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schema
const projectSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().required(),
  fullDescription: Joi.string().allow(''),
  category: Joi.string().required(),
  technologies: Joi.array().items(Joi.string()),
  features: Joi.array().items(Joi.string()),
  techDetails: Joi.string().allow(''),
  github: Joi.string().allow(''),
  demo: Joi.string().allow(''),
  image: Joi.string().allow(''),
  featured: Joi.boolean().default(false),
  date: Joi.string(),
  published: Joi.boolean().default(true)
});

// Get all projects (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      featured, 
      published = true 
    } = req.query;

    const filter = { published: published === 'true' };
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    // Special handling for the portfolio section (when limit is 6)
    // Ensure featured projects appear first
    let projects;
    if (limit == 6) {
      // Get featured projects first
      const featuredProjects = await Project.find({
        ...filter,
        featured: true
      })
        .sort({ updatedAt: -1 })
        .lean();

      // Get non-featured projects
      const nonFeaturedProjects = await Project.find({
        ...filter,
        featured: { $ne: true }
      })
        .sort({ updatedAt: -1 })
        .lean();

      // Combine them with featured first, then take only the limit
      const allProjects = [...featuredProjects, ...nonFeaturedProjects];
      projects = allProjects.slice(0, limit);
    } else {
      // Normal sorting for other cases
      projects = await Project.find(filter)
        .sort({ featured: -1, updatedAt: -1 }) // Featured first, then by modification date
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
    }

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      slug: req.params.slug, 
      published: true 
    }).lean();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects for admin (includes unpublished)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 200, category, featured } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    const projects = await Project.find(filter)
      .sort({ featured: -1, updatedAt: -1 }) // Featured first, then by modification date
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get admin projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if slug already exists
    const existingProject = await Project.findOne({ slug: req.body.slug });
    if (existingProject) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const project = new Project(req.body);
    await project.save();

    res.status(201).json(project);

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if slug already exists (excluding current project)
    const existingProject = await Project.findOne({ 
      slug: req.body.slug, 
      _id: { $ne: req.params.id } 
    });
    if (existingProject) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('category', { published: true });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;