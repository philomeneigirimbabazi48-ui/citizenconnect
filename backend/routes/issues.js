const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/issues';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

async function notify(recipientId, type, title, message, issueId) {
  try {
    await Notification.create({ recipient: recipientId, type, title, message, issue: issueId });
  } catch (e) { console.error('Notification error:', e.message); }
}

router.get('/', protect, async (req, res) => {
  try {
    const { status, category, district, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'citizen') filter.citizen = req.user._id;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (district) filter['location.district'] = district;
    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('citizen', 'name email')
      .populate('assignedLeader', 'name email');
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, restrictTo('citizen'), upload.array('photos', 5), async (req, res) => {
  try {
    const { title, description, category, priority, locationDescription, sector, district, province, lat, lng } = req.body;
    const photos = req.files ? req.files.map(f => '/uploads/issues/' + f.filename) : [];
    const issue = await Issue.create({
      title, description, category,
      priority: priority || 'medium',
      location: {
        description: locationDescription, sector, district, province,
        coordinates: {
          lat: lat ? Number(lat) : undefined,
          lng: lng ? Number(lng) : undefined
        }
      },
      citizen: req.user._id,
      citizenName: req.user.name,
      photos,
      statusHistory: [{ status: 'pending', changedByName: req.user.name, note: 'Issue submitted' }]
    });
    await notify(req.user._id, 'issue_submitted', 'Issue submitted', `Your issue "${title}" (${issue.trackingNumber}) has been submitted successfully.`, issue._id);
    res.status(201).json({ success: true, message: 'Issue submitted successfully.', issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('assignedLeader', 'name email');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    if (req.user.role === 'citizen' && issue.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', protect, restrictTo('leader', 'admin'), async (req, res) => {
  try {
    const { status, note, estimatedResolutionDate } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    issue.status = status;
    issue.assignedLeader = issue.assignedLeader || req.user._id;
    issue.assignedLeaderName = issue.assignedLeaderName || req.user.name;
    if (estimatedResolutionDate) issue.estimatedResolutionDate = estimatedResolutionDate;
    issue.statusHistory.push({ status, changedBy: req.user._id, changedByName: req.user.name, note });
    await issue.save();
    await notify(issue.citizen, 'status_change', 'Issue status updated',
      `Your issue "${issue.title}" (${issue.trackingNumber}) is now: ${status.replace('_', ' ')}.`, issue._id);
    res.json({ success: true, message: 'Status updated.', issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/respond', protect, restrictTo('leader', 'admin'), async (req, res) => {
  try {
    const { response, resolutionTime, status } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    issue.response = response;
    issue.responseDate = new Date();
    issue.resolutionTime = resolutionTime;
    issue.assignedLeader = req.user._id;
    issue.assignedLeaderName = req.user.name;
    if (status) {
      issue.status = status;
      issue.statusHistory.push({ status, changedBy: req.user._id, changedByName: req.user.name, note: 'Response provided' });
    }
    await issue.save();
    await notify(issue.citizen, 'new_response', 'Leader responded to your issue',
      `${req.user.name} responded to "${issue.title}": ${response.slice(0, 100)}...`, issue._id);
    res.json({ success: true, message: 'Response sent.', issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    issue.comments.push({ author: req.user._id, authorName: req.user.name, authorRole: req.user.role, text });
    await issue.save();
    const recipientId = req.user.role === 'citizen' ? issue.assignedLeader : issue.citizen;
    if (recipientId) {
      await notify(recipientId, 'new_response', 'New comment on issue', `${req.user.name} commented on "${issue.title}".`, issue._id);
    }
    res.json({ success: true, message: 'Comment added.', issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/feedback', protect, restrictTo('citizen'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    if (issue.citizen.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied.' });
    if (issue.status !== 'resolved') return res.status(400).json({ success: false, message: 'Can only give feedback on resolved issues.' });
    issue.feedback = { rating, comment, submittedAt: new Date() };
    issue.status = 'closed';
    await issue.save();
    res.json({ success: true, message: 'Feedback submitted. Issue closed.', issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;