# VidyaGPT Deployment Guide 🚀

## Quick Deployment Options (Easiest to Hardest)

### Option 1: Render.com (RECOMMENDED - FREE & EASY) ⭐

**Perfect for beginners! Get a live URL in 10 minutes.**

#### Deploy Backend:

1. **Go to [Render.com](https://render.com)** and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (push your code to GitHub first)
4. Configure:
   - **Name:** `vidhya-backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`
   - **Instance Type:** Free
5. Add **Environment Variable:**
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
6. Click **"Create Web Service"**
7. **Copy the URL** (e.g., `https://vidhya-backend.onrender.com`)

#### Deploy Frontend:

1. Update `frontend/src/screens/MedicineSearchScreen.js`:
   ```javascript
   const API_URL = 'https://vidhya-backend.onrender.com'; // Your backend URL
   ```
2. Update `frontend/src/screens/PrescriptionScreen.js`:
   ```javascript
   const API_URL = 'https://vidhya-backend.onrender.com'; // Your backend URL
   ```
3. On Render, click **"New +"** → **"Static Site"**
4. Configure:
   - **Name:** `vidhya-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
5. **Your app is live!** 🎉 Access it from your phone at the Render URL

---

### Option 2: Railway.app (VERY EASY - FREE TIER)

1. **Go to [Railway.app](https://railway.app)** and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repo
4. Railway auto-detects the Dockerfile and deploys
5. Add environment variable: `OPENAI_API_KEY`
6. **Get your URL** from the deployment settings

---

### Option 3: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel (Free & Fast):**

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Set **Root Directory:** `frontend`
5. Deploy!
6. Update API URLs to point to your backend

**Backend on Render** (follow Option 1 backend steps)

---

### Option 4: Docker on Your Local Machine (Access from Phone)

**If you want to test locally and access from phone on same WiFi:**

1. Make sure Docker is installed
2. Create `.env` file in backend folder:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access from your phone at: `http://YOUR_COMPUTER_IP:19006`

---

### Option 5: Heroku (Paid but Reliable)

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login:
   ```bash
   heroku login
   ```
3. Create apps:
   ```bash
   heroku create vidhya-backend
   heroku create vidhya-frontend
   ```
4. Deploy backend:
   ```bash
   cd backend
   heroku container:push web -a vidhya-backend
   heroku container:release web -a vidhya-backend
   ```
5. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key -a vidhya-backend
   ```

---

## Recommended: Render.com (Free)

**Why Render?**
- ✅ Completely FREE
- ✅ Easy to use
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ Works perfectly for your use case

**Expected URLs:**
- Backend: `https://vidhya-backend.onrender.com`
- Frontend: `https://vidhya-frontend.onrender.com`

---

## Important Notes

### Before Deployment:

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Update API URLs** in frontend to use your deployed backend URL

3. **Add `.gitignore`** to avoid committing sensitive data:
   ```
   node_modules/
   .env
   venv/
   __pycache__/
   .expo/
   ```

### After Deployment:

- Access your app from **any device** using the deployment URL
- Share the URL with others
- The app will be available 24/7

---

## Testing Deployment

1. Open the frontend URL in your phone browser
2. Test creating a prescription
3. Verify medicines are loading from backend

---

## Troubleshooting

**Issue:** Backend not connecting
- Check environment variables are set
- Verify CORS settings in `main.py`

**Issue:** Frontend shows errors
- Update API_URL to deployed backend URL
- Check browser console for errors

**Issue:** Slow loading on Render free tier
- Free tier spins down after inactivity
- First request may take 30-60 seconds
- Subsequent requests are fast

---

## Need Help?

1. Check deployment logs on Render/Railway
2. Test API directly: `https://your-backend.onrender.com/`
3. Should return: `{"message": "AyurvedaGPT API is running"}`

---

**Congratulations! Your VidyaGPT app is now live! 🌿💊**
