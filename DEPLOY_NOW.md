# Deploy VidyaGPT in 15 Minutes - Step by Step

Follow these exact steps to get your app live and accessible from your phone!

## Step 1: Deploy Backend (5 minutes)

1. Go to [render.com](https://render.com) and sign up with GitHub (it's FREE)

2. Click **"New +"** (top right) → **"Web Service"**

3. Click **"Connect GitHub"** → Select your repository: **VidhyaAI**

4. Configure the backend:
   - **Name:** `vidhya-backend` (or any name you like)
   - **Region:** Select closest to you
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

5. Click **"Advanced"** → **"Add Environment Variable"**:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** (paste your OpenAI API key here)

6. Click **"Create Web Service"**

7. **WAIT** for deployment to complete (2-3 minutes). You'll see a green "Live" badge.

8. **COPY YOUR BACKEND URL** - it looks like: `https://vidhya-backend-xxxx.onrender.com`

---

## Step 2: Update Frontend API URL (2 minutes)

Now you need to tell your frontend where the backend is:

1. Open this file: `frontend/src/screens/MedicineSearchScreen.js`
2. Find line 15 and change it to your backend URL:
   ```javascript
   const API_URL = 'https://vidhya-backend-xxxx.onrender.com'; // YOUR URL HERE
   ```

3. Open this file: `frontend/src/screens/PrescriptionScreen.js`
4. Find line 17 and change it to the same backend URL:
   ```javascript
   const API_URL = 'https://vidhya-backend-xxxx.onrender.com'; // YOUR URL HERE
   ```

5. Save both files and push to GitHub:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

---

## Step 3: Deploy Frontend (5 minutes)

1. Go back to Render dashboard → Click **"New +"** → **"Static Site"**

2. Connect the same GitHub repository: **VidhyaAI**

3. Configure the frontend:
   - **Name:** `vidhya-frontend`
   - **Region:** Same as backend
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Click **"Create Static Site"**

5. **WAIT** for build to complete (3-5 minutes)

---

## Step 4: Access Your App! 🎉

Your frontend URL will be: `https://vidhya-frontend-xxxx.onrender.com`

1. Open this URL on your phone's browser
2. You'll see the VidyaGPT app!
3. Click the 📱 button (top right) to install it as a PWA

---

## Testing Your Deployment

1. **Test backend first:**
   - Open: `https://vidhya-backend-xxxx.onrender.com/`
   - Should show: `{"message":"AyurvedaGPT API is running"}`

2. **Test frontend:**
   - Open: `https://vidhya-frontend-xxxx.onrender.com`
   - Enter symptoms like "headache, nausea"
   - Click "Search Medicines"
   - Should get AI diagnosis and medicine recommendations!

---

## Important Notes

**Free Tier Behavior:**
- First load may be slow (30-60 seconds) because free tier "sleeps" after inactivity
- After first load, it's fast!
- This is normal for Render's free tier

**If Something Goes Wrong:**

1. **Backend not responding:**
   - Check Render logs (click on service → "Logs" tab)
   - Verify OPENAI_API_KEY is set correctly
   - Wait 60 seconds and try again (it might be waking up)

2. **Frontend shows errors:**
   - Open browser console (F12)
   - Check if API_URL is correct in both screen files
   - Make sure backend URL ends with `.onrender.com` (no trailing slash)

3. **Medicines not loading:**
   - Verify backend is accessible: open `https://your-backend.onrender.com/`
   - Check if OpenAI API key has credits
   - Look at browser Network tab (F12 → Network) to see API errors

---

## Your URLs

After deployment, save these:

- **Backend API:** `https://vidhya-backend-xxxx.onrender.com`
- **Frontend App:** `https://vidhya-frontend-xxxx.onrender.com`

Share the frontend URL with anyone! They can access VidyaGPT from their phone.

---

**That's it! Your AI-powered Ayurvedic prescription app is now live! 🌿💊**
