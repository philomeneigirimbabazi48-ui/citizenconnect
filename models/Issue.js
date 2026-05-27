const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  authorRole: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedByName: String,
  note: String,
  changedAt: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    default: () => 'CC-' + Date.now().toString(36).toUpperCase()
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Infrastructure', 'Roads', 'Sanitation', 'Water', 'Health', 'Education', 'Security', 'Agriculture', 'Environment', 'Other']
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },

  // Location
  location: {
    description: { type: String, required: true },
    sector: String,
    district: String,
    province: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // People
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: String,
  assignedLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedLeaderName: String,

  // Content
  photos: [{ type: String }],
  response: { type: String },
  responseDate: { type: Date },
  resolutionTime: { type: String },
  estimatedResolutionDate: { type: Date },

  // Tracking
  comments: [commentSchema],
  statusHistory: [statusHistorySchema],

  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },

  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

// Index for fast queries
issueSchema.index({ citizen: 1, status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ 'location.district': 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
