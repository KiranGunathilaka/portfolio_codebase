const express = require('express');
const Joi = require('joi');
const { Skill, SoftSkill } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all technical skills (public)
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({})
      .sort({ order: 1 })
      .lean();

    res.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all soft skills (public)
router.get('/soft', async (req, res) => {
  try {
    const softSkills = await SoftSkill.find({})
      .sort({ order: 1 })
      .lean();

    res.json({ softSkills });
  } catch (error) {
    console.error('Get soft skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update skills (admin only)
router.put('/', auth, async (req, res) => {
  try {
    const { skills } = req.body;
    
    // Clear existing skills and insert new ones
    await Skill.deleteMany({});
    await Skill.insertMany(skills);

    res.json({ message: 'Skills updated successfully' });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update soft skills (admin only)
router.put('/soft', auth, async (req, res) => {
  try {
    const { softSkills } = req.body;
    
    // Clear existing soft skills and insert new ones
    await SoftSkill.deleteMany({});
    await SoftSkill.insertMany(softSkills);

    res.json({ message: 'Soft skills updated successfully' });
  } catch (error) {
    console.error('Update soft skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;