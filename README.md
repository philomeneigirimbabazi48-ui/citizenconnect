# 🏛️ CitizenConnect
### Citizen – Leader Communication & Issue Management System
*Umuturage – Umuyobozi Platform*

---

## 📋 Project Overview

CitizenConnect is a full-stack web application that allows citizens (Umuturage) to report local issues to their leaders (Umuyobozi), track the status in real-time, and receive responses — matching the flowchart design exactly.

---

## 🗂️ Project Structure

```
citizenconnect/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── seed.js             # Sample data seeder
│   ├── middleware/
│   │   └── auth.js             # JWT auth middleware
│   ├── models/
│   │   ├── User.js             # User model (citizen/leader)
│   │   ├── Issue.js            # Issue model with full tracking
│   │   └── Notification.js     # Notification model
│   ├── routes/
│   │   ├── auth.js             # Register, Login, Profile
│   │   ├── issues.js           # Full issue CRUD
│   │   ├── notifications.js    # Notification management
│   │   ├── reports.js          # Statistics & reports
│   │   └── ai.js               # AI response suggestions
│   ├── server.js               # Main Express server
│   ├── package.json
│   └── .env.example            # Environment variables template
│
└── frontend/                   # Plain HTML/CSS/JS (no framework)
    └── public/
        ├── index.html          # Login / Register page
        ├── css/
        │   └── main.css        # Global stylesheet
        ├── js/
        │   └── app.js          # API client + shared utilities
        ├── citizen/
        │   ├── dashboard.html  # Citizen home + stats
        │   ├── submit.html     # Submit issue (with AI categorization)
        │   ├── my-issues.html  # List + filter my issues
        │   ├── issue-detail.html # Issue detail + feedback + comments
        │   ├── notifications.html
        │   └── profile.html
        └── leader/
            ├── dashboard.html  # Leader home + pending issues
            ├── all-issues.html # All issues with filters
            ├── issue-respond.html # Respond + AI suggestions
            ├── reports.html    # Charts & statistics
            └── notifications.html
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| npm | v8+ | Comes with Node.js |

---

## 🚀 Setup & Installation

### Step 1 — Clone / Download the project
```bash
cd citizenconnect
```

### Step 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citizenconnect
JWT_SECRET=change_this_to_a_long_random_string_abc123xyz

# Optional: Add your Anthropic API key for AI features
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 3 — Start MongoDB

**On Windows:**
```bash
net start MongoDB
# or open MongoDB Compass
```

**On Mac:**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

### Step 4 — Seed sample data (recommended)
```bash
# From the backend folder
npm run seed
```
This creates 3 test accounts and 5 sample issues.

**Test accounts created:**
| Role | Email | Password |
|------|-------|----------|
| Citizen | jean@citizenconnect.rw | citizen123 |
| Citizen | alice@citizenconnect.rw | citizen123 |
| Leader  | leader@citizenconnect.rw | leader123 |

### Step 5 — Start the Backend server
```bash
npm run dev        # Development (auto-restart)
# or
npm start          # Production
```
✅ API running at: **http://localhost:5000**

### Step 6 — Start the Frontend

Open a **new terminal**:

```bash
cd frontend

# Option A — Using npx serve (recommended)
npx serve public -p 3000

# Option B — Using VS Code Live Server
# Right-click public/index.html → Open with Live Server

# Option C — Open directly in browser
# Just open frontend/public/index.html in your browser
# (Note: some browsers need a server for fetch() to work)
```
✅ App running at: **http://localhost:3000**

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| PATCH| `/api/auth/profile` | Update profile |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/issues` | List issues (filtered by role) |
| POST | `/api/issues` | Submit new issue (citizen) |
| GET  | `/api/issues/:id` | Get single issue |
| PATCH| `/api/issues/:id/status` | Update status (leader) |
| PATCH| `/api/issues/:id/respond` | Send response (leader) |
| POST | `/api/issues/:id/comments` | Add comment |
| POST | `/api/issues/:id/feedback` | Submit feedback (citizen) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/notifications` | Get my notifications |
| PATCH| `/api/notifications/:id/read` | Mark as read |
| PATCH| `/api/notifications/read-all` | Mark all as read |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Full statistics |
| GET | `/api/reports/trends` | Monthly trends (leader) |

### AI (requires Anthropic API key)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggest-response` | AI leader response suggestion |
| POST | `/api/ai/categorize` | Auto-categorize an issue |

---

## ✨ Features Implemented

### Citizen (Umuturage)
- ✅ Register & Login
- ✅ Dashboard with personal stats
- ✅ Submit issues with: category, description, location, photos
- ✅ AI auto-categorization & priority suggestion
- ✅ Tracking number generated on submission
- ✅ View & filter all my issues
- ✅ Real-time status tracking with timeline
- ✅ Read leader responses & comments
- ✅ Add comments on issues
- ✅ Give star feedback when issue resolved
- ✅ Notifications (new response, status change)
- ✅ Edit profile

### Leader / Admin (Umuyobozi)
- ✅ Login
- ✅ Dashboard with total/pending/in-progress/resolved stats
- ✅ View all citizen issues with filters (status, category, district)
- ✅ Analyze issue details (description, photos, location)
- ✅ 🤖 AI-powered response suggestions (Anthropic Claude)
- ✅ Send responses to citizens
- ✅ Update status (pending → in progress → resolved → closed)
- ✅ Reject issues
- ✅ Add comments
- ✅ Reports & statistics (by category, district, resolution rate)
- ✅ Notifications (new issue submitted, citizen comment)

### System
- ✅ JWT authentication (7-day tokens)
- ✅ Role-based access control (citizen / leader / admin)
- ✅ Automatic notifications on every status change
- ✅ Photo uploads (up to 5 per issue)
- ✅ Rate limiting (100 req/15min)
- ✅ Full status history/audit trail
- ✅ MongoDB with proper indexes
- ✅ Fully responsive design

---

## 🔮 Next Steps / Enhancements

- [ ] SMS notifications via Africa's Talking API
- [ ] Map view using Google Maps / Leaflet
- [ ] Admin super-panel to manage leaders
- [ ] Email notifications via Nodemailer
- [ ] PWA (installable on mobile)
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support (Kinyarwanda / English / French)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer |
| AI | Anthropic Claude API |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Styling | Custom CSS (no framework) |

---

## 📞 Support

If you have any issues running the project, check:
1. MongoDB is running (`mongod` service)
2. `.env` file exists in the `backend/` folder
3. Both servers are running (backend :5000, frontend :3000)
4. Browser console for any errors (F12)
