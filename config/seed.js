require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizenconnect';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Drop all collections cleanly to avoid index conflicts
  try { await mongoose.connection.db.dropCollection('users'); } catch(e) {}
  try { await mongoose.connection.db.dropCollection('issues'); } catch(e) {}
  try { await mongoose.connection.db.dropCollection('notifications'); } catch(e) {}
  console.log('Cleared existing data');

  // Create users
  const leader = await User.create({
    name: 'Marie Claire Uwimana', email: 'leader@citizenconnect.rw', password: 'leader123',
    role: 'leader', phone: '+250788000001', sector: 'Kicukiro', district: 'Kicukiro', province: 'Kigali'
  });
  const citizen1 = await User.create({
    name: 'Jean Pierre Habimana', email: 'jean@citizenconnect.rw', password: 'citizen123',
    role: 'citizen', phone: '+250788000002', sector: 'Remera', district: 'Gasabo', province: 'Kigali'
  });
  const citizen2 = await User.create({
    name: 'Alice Mutoni', email: 'alice@citizenconnect.rw', password: 'citizen123',
    role: 'citizen', phone: '+250788000003', sector: 'Kicukiro', district: 'Kicukiro', province: 'Kigali'
  });
  console.log('Created users');

  // Create issues one by one with a small delay to guarantee unique tracking numbers
  const issue0 = await Issue.create({
    trackingNumber: 'CC-001',
    title: 'Broken street light on KN 5 Avenue',
    description: 'The street light near the market has been off for 2 weeks causing safety concerns at night. Many residents are afraid to walk.',
    category: 'Infrastructure', priority: 'high', status: 'resolved',
    location: { description: 'KN 5 Avenue near Kicukiro Market', sector: 'Kicukiro', district: 'Kicukiro', province: 'Kigali' },
    citizen: citizen2._id, citizenName: citizen2.name,
    assignedLeader: leader._id, assignedLeaderName: leader.name,
    response: 'The utilities team has been dispatched. The bulb was replaced and the light is now working.',
    responseDate: new Date('2025-05-15'),
    resolutionTime: '5 days',
    feedback: { rating: 5, comment: 'Very quick response, thank you!', submittedAt: new Date('2025-05-16') },
    statusHistory: [
      { status: 'pending', changedByName: citizen2.name, note: 'Issue submitted' },
      { status: 'in_progress', changedByName: leader.name, note: 'Team dispatched' },
      { status: 'resolved', changedByName: leader.name, note: 'Light repaired' }
    ]
  });
  const issue1 = await Issue.create({
    trackingNumber: 'CC-002',
    title: 'Garbage not collected for 10 days',
    description: 'The garbage truck has not visited our sector for 10 days. The smell is unbearable and it is a health hazard.',
    category: 'Sanitation', priority: 'urgent', status: 'in_progress',
    location: { description: 'Sector Remera, near primary school', sector: 'Remera', district: 'Gasabo', province: 'Kigali' },
    citizen: citizen1._id, citizenName: citizen1.name,
    assignedLeader: leader._id, assignedLeaderName: leader.name,
    response: 'We have scheduled a garbage collection for tomorrow. We apologize for the inconvenience.',
    responseDate: new Date('2025-05-19'),
    resolutionTime: '2 days',
    statusHistory: [
      { status: 'pending', changedByName: citizen1.name, note: 'Issue submitted' },
      { status: 'in_progress', changedByName: leader.name, note: 'Response provided, collection scheduled' }
    ]
  });
  const issue2 = await Issue.create({
    trackingNumber: 'CC-003',
    title: 'Pothole on KK 15 Road near school zone',
    description: 'There is a large pothole that has been there for 3 months. It is dangerous for children walking to school and has already caused a motorcycle accident.',
    category: 'Roads', priority: 'high', status: 'pending',
    location: { description: 'KK 15 Road, Gasabo District', sector: 'Kinyinya', district: 'Gasabo', province: 'Kigali' },
    citizen: citizen1._id, citizenName: citizen1.name,
    statusHistory: [{ status: 'pending', changedByName: citizen1.name, note: 'Issue submitted' }]
  });
  const issue3 = await Issue.create({
    trackingNumber: 'CC-004',
    title: 'Water pipe burst near Kicukiro market',
    description: 'A water pipe has burst and water is flooding the road. This is both wasteful and dangerous for pedestrians.',
    category: 'Water', priority: 'urgent', status: 'pending',
    location: { description: 'Kicukiro Market entrance road', sector: 'Kicukiro', district: 'Kicukiro', province: 'Kigali' },
    citizen: citizen2._id, citizenName: citizen2.name,
    statusHistory: [{ status: 'pending', changedByName: citizen2.name, note: 'Issue submitted' }]
  });
  const issue4 = await Issue.create({
    trackingNumber: 'CC-005',
    title: 'Health center understaffed on weekends',
    description: 'Nyamirambo health center has only one nurse on weekends. Patients wait for over 4 hours.',
    category: 'Health', priority: 'medium', status: 'pending',
    location: { description: 'Nyamirambo Health Center', sector: 'Nyamirambo', district: 'Nyarugenge', province: 'Kigali' },
    citizen: citizen1._id, citizenName: citizen1.name,
    statusHistory: [{ status: 'pending', changedByName: citizen1.name, note: 'Issue submitted' }]
  });
  const issues = [issue0, issue1, issue2, issue3, issue4];
  console.log('Created issues');

  // Create notifications
  await Notification.create([
    { recipient: citizen1._id, type: 'issue_submitted', title: 'Issue submitted', message: 'Your issue "Garbage not collected" has been submitted. Tracking: ' + issues[1].trackingNumber, issue: issues[1]._id, isRead: false },
    { recipient: citizen1._id, type: 'new_response', title: 'Leader responded', message: 'Marie Claire responded to your garbage issue.', issue: issues[1]._id, isRead: false },
    { recipient: citizen2._id, type: 'issue_resolved', title: 'Issue resolved', message: 'Your issue "Broken street light" has been resolved!', issue: issues[0]._id, isRead: true }
  ]);
  console.log('Created notifications');

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  console.log('  Citizen:  jean@citizenconnect.rw / citizen123');
  console.log('  Citizen:  alice@citizenconnect.rw / citizen123');
  console.log('  Leader:   leader@citizenconnect.rw / leader123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
