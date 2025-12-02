# ⚡ QUICKEST Way to Deploy (5 Minutes!)

## Option A: Render.com (100% FREE) ⭐ RECOMMENDED

### Step 1: Push to GitHub (if not already done)
```bash
git init
git add .
git commit -m "VidyaGPT ready for deployment"
git branch -M main
# Create a repo on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy Backend on Render
1. Go to **[render.com](https://render.com)** → Sign up (FREE)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repo
4. Settings:
   - **Name:** `vidhya-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable:
   - `OPENAI_API_KEY` = `your-api-key`
6. Click **"Create Web Service"**
7. **COPY YOUR BACKEND URL** (e.g., `https://vidhya-backend.onrender.com`)

### Step 3: Update Frontend API URL
Edit these files with your backend URL:
- `frontend/src/screens/MedicineSearchScreen.js` line 15
- `frontend/src/screens/PrescriptionScreen.js` line 17

Change to:
```javascript
const API_URL = 'https://vidhya-backend.onrender.com';  // Your Render URL
```

### Step 4: Deploy Frontend on Render
1. Push updated code: `git add . && git commit -m "Update API URL" && git push`
2. On Render: **"New +"** → **"Static Site"**
3. Settings:
   - **Name:** `vidhya-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Click **"Create Static Site"**

### Step 5: Access Your App! 🎉
- Your app URL: `https://vidhya-frontend.onrender.com`
- Open on phone, share with anyone!

---

## Option B: Railway.app (Even Easier!)

1. Go to **[railway.app](https://railway.app)**
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your VidyaGPT repo
5. Railway auto-deploys both frontend and backend!
6. Add environment variable: `OPENAI_API_KEY`
7. Get your URLs from settings

---

## Testing Your Deployment

Test backend:
```bash
curl https://your-backend-url.onrender.com/
```
Should return: `{"message":"AyurvedaGPT API is running"}`

Then open frontend URL on your phone! ✨

---

## Free Tier Limits

**Render.com FREE:**
- ✅ 750 hours/month
- ✅ Unlimited sites
- ⚠️ Spins down after 15 min inactivity (first load may be slow)

**Railway.app FREE:**
- ✅ $5 credit/month
- ✅ Should last the whole month for your usage

---

## Common Issues

**Backend not responding:**
- Wait 30-60 seconds on first load (free tier wakes up)
- Check environment variables are set

**Frontend errors:**
- Make sure API_URL matches your backend URL exactly
- Check browser console for errors

---

**That's it! Your VidyaGPT app is live! 🌿💊**

Share the frontend URL with your phone and start prescribing!
