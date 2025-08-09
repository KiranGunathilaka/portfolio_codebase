const express = require('express');
const Joi = require('joi');
const { Blog } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schema
const blogSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().required(),
  excerpt: Joi.string().required(),
  content: Joi.string().required(),
  author: Joi.string().default('Kiran Gunathilaka'),
  category: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).required(),
  tags: Joi.array().items(Joi.string()),
  featured: Joi.boolean().default(false),
  image: Joi.string().allow(''),
  readTime: Joi.string(),
  published: Joi.boolean().default(true)
});

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 200, 
      category, 
      featured, 
      published = true 
    } = req.query;

    const filter = { published: published === 'true' };
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }
    if (featured !== undefined) filter.featured = featured === 'true';

    let blogs = await Blog.find(filter)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    blogs = blogs.map(b => ({
      ...b,
      category: Array.isArray(b.category) ? b.category : [b.category]
    }));

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    let blog = await Blog.findOne({
      slug: req.params.slug,
      published: true
    }).lean();

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog = {
      ...blog,
      category: Array.isArray(blog.category) ? blog.category : [blog.category]
    };

    res.json(blog);

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all blogs for admin (includes unpublished)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 200, category, featured } = req.query;

    const filter = {};
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { $in: categories };
    }
    if (featured !== undefined) filter.featured = featured === 'true';

    let blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    blogs = blogs.map(b => ({
      ...b,
      category: Array.isArray(b.category) ? b.category : [b.category]
    }));

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: req.body.slug });
    if (existingBlog) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const blogData = {
      ...req.body,
      category: Array.isArray(req.body.category) ? req.body.category : [req.body.category]
    };

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json(blog);

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = blogSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if slug already exists (excluding current blog)
    const existingBlog = await Blog.findOne({ 
      slug: req.body.slug, 
      _id: { $ne: req.params.id } 
    });
    if (existingBlog) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const updateData = {
      ...req.body,
      category: Array.isArray(req.body.category) ? req.body.category : [req.body.category]
    };

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get blog categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { published: true });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;