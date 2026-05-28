# 🚀 CitizenConnect — Quick Start Guide

## Step 1: Install Node.js
Download from https://nodejs.org (version 18 or higher)

## Step 2: Install & Start MongoDB
Download from https://www.mongodb.com/try/download/community
- **Windows**: Run the installer, MongoDB starts automatically as a service
- **Mac**: `brew install mongodb-community && brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

## Step 3: Run the Project

### 🪟 Windows:
Double-click `start.bat`

### 🍎 Mac / 🐧 Linux:
```bash
chmod +x start.sh
./start.sh
```

### Manual start (any OS):
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run seed
npm run dev

# Terminal 2 — Frontend
cd frontend
npx serve public -p 3000
```

## Step 4: Open the App
Go to **http://localhost:3000** in your browser

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | jean@citizenconnect.rw | citizen123 |
| Citizen | alice@citizenconnect.rw | citizen123 |
| Leader  | leader@citizenconnect.rw | leader123 |

## 🤖 Enable AI Features (Optional)
1. Get a free API key at https://console.anthropic.com
2. Open `backend/.env`
3. Set: `ANTHROPIC_API_KEY=sk-ant-your-key-here`
4. Restart the backend

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to MongoDB" | Make sure MongoDB service is running |
| "Port 5000 already in use" | Change `PORT=5001` in `backend/.env` |
| "Port 3000 already in use" | Change port: `npx serve public -p 3001` |
| Login not working | Run `npm run seed` again in `backend/` folder |
