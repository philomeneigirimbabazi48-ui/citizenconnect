const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['issue_submitted', 'issue_updated', 'issue_resolved', 'new_response', 'status_change', 'new_issue_assigned'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
