const express = require('express');
const Joi = require('joi');
const { Milestone } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

const milestoneSchema = Joi.object({
  type: Joi.string().valid('education', 'certification').required(),
  title: Joi.string().required(),
  institution: Joi.string().allow(''),
  issuer: Joi.string().allow(''),
  period: Joi.string().allow(''),
  date: Joi.string().allow(''),
  status: Joi.string().allow(''),
  grade: Joi.string().allow(''),
  gpa: Joi.string().allow(''),
  recentGPA: Joi.string().allow(''),
  description: Joi.string().allow(''),
  achievements: Joi.array().items(Joi.string()),
  coursework: Joi.array().items(Joi.string()),
  certType: Joi.string().allow(''),
  order: Joi.number().default(0)
});

// Get all milestones (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const milestones = await Milestone.find(filter)
      .sort({ order: -1, createdAt: -1 })
      .lean();

    res.json({ milestones });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create milestone (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { error } = milestoneSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const milestone = new Milestone(req.body);
    await milestone.save();

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update milestone (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = milestoneSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete milestone (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;