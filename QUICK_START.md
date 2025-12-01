# 🚀 Quick Start Guide

Get AyurvedaGPT running in 5 minutes!

## Prerequisites

Before you begin, make sure you have:
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] An OpenAI API key (get one at https://platform.openai.com/)

## Step 1: Get Your OpenAI API Key

1. Go to **https://platform.openai.com/api-keys**
2. Sign up or log in (can use Google account)
3. Click **"Create new secret key"**
4. Give it a name (e.g., "AyurvedaGPT")
5. Copy the key immediately (starts with `sk-...`)

**New accounts often get $5-18 in free credits!**

**Pricing:** Using GPT-3.5-turbo costs about $0.002 per medicine search (very cheap!)

## Step 2: Start the Backend

Open a terminal and run:

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# For Windows:
venv\Scripts\activate
# For Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

Now edit the `.env` file and add your API key:
```
OPENAI_API_KEY=sk-your_actual_api_key_here
```

Start the server:
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend is ready! Keep this terminal open.

## Step 3: Start the Frontend

Open a **NEW terminal** and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the app
npm start
```

This will:
1. Start the Expo development server
2. Show a QR code
3. Open in your browser

## Step 4: Run the App

### Option A: Web Browser (Easiest)
Press `w` in the terminal to open in web browser

### Option B: Mobile Device
1. Install "Expo Go" app on your phone
2. Scan the QR code shown in terminal
3. App will open in Expo Go

### Option C: Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

## Step 5: Test the Application

1. **Enter Patient Info:**
   - Name: Test Patient
   - Age: 35
   - Gender: Select one
   - Add symptoms: "headache", "fatigue"
   - Select condition: "Diabetes"

2. **Click "Search for Ayurvedic Medicines"**
   - Wait for AI to suggest medicines
   - Select medicines you want to prescribe
   - Edit dosage if needed

3. **Generate Prescription:**
   - Review selected medicines
   - Enter your name as doctor
   - Click "Generate Prescription"
   - Preview and print!

## Common Issues

### Issue: Can't connect to backend on mobile

**Solution:** Update API URL in frontend code

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. Edit these files and replace `http://localhost:8000` with `http://YOUR_IP:8000`:
   - `frontend/src/screens/MedicineSearchScreen.js` (line 10)
   - `frontend/src/screens/PrescriptionScreen.js` (line 13)

Example: `http://192.168.1.100:8000`

### Issue: API Key Error

**Check:**
- API key is correctly copied to `.env` file
- No extra spaces or quotes around the key
- The `.env` file is in the `backend` folder

### Issue: Module not found errors

**Solution:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Kill the process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:8000 | xargs kill
```

## Next Steps

- Customize medicine database with your preferred medicines
- Add your clinic logo to prescriptions
- Adjust color scheme if needed
- Deploy to production (see README.md)

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Check backend logs in the terminal
3. Check browser console for frontend errors
4. Verify backend is accessible at http://localhost:8000/docs

## Development Tips

### Backend API Documentation
Visit `http://localhost:8000/docs` to see interactive API documentation (Swagger UI)

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Save Python files to reload
- Frontend: Save JS files to reload app

### Test API Directly
```bash
curl -X POST "http://localhost:8000/api/medicines/search" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["headache"],
    "health_conditions": ["Diabetes"]
  }'
```

Happy prescribing! 🌿
