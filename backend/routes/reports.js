const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/reports/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'citizen' ? { citizen: req.user._id } : {};

    const [total, byStatus, byCategory, byDistrict, avgRating] = await Promise.all([
      Issue.countDocuments(filter),
      Issue.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $match: filter }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Issue.aggregate([{ $match: filter }, { $group: { _id: '$location.district', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Issue.aggregate([
        { $match: { ...filter, 'feedback.rating': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$feedback.rating' }, count: { $sum: 1 } } }
      ])
    ]);

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    const resolutionRate = total > 0
      ? Math.round(((statusMap.resolved || 0) + (statusMap.closed || 0)) / total * 100)
      : 0;

    res.json({
      success: true,
      data: {
        total,
        pending: statusMap.pending || 0,
        in_progress: statusMap.in_progress || 0,
        resolved: statusMap.resolved || 0,
        closed: statusMap.closed || 0,
        rejected: statusMap.rejected || 0,
        resolutionRate,
        byCategory,
        byDistrict,
        avgRating: avgRating[0] ? { avg: Math.round(avgRating[0].avg * 10) / 10, count: avgRating[0].count } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/trends — monthly trend (leader/admin only)
router.get('/trends', protect, restrictTo('leader', 'admin'), async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
