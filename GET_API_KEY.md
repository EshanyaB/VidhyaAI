# 🔑 How to Get Your OpenAI API Key

Follow these simple steps to get your free OpenAI API key:

## Step 1: Visit OpenAI Platform

Go to: **https://platform.openai.com/api-keys**

## Step 2: Sign Up or Log In

- If you don't have an account, click **"Sign up"**
- You can sign up with:
  - Email address
  - Google account
  - Microsoft account

## Step 3: Verify Your Account

- You may need to verify your email
- You might need to add a phone number

## Step 4: Create API Key

1. Once logged in, you'll see the API Keys page
2. Click **"Create new secret key"** button (green button on the right)
3. Give it a name (e.g., "AyurvedaGPT" or "Medical App")
4. Click **"Create secret key"**

## Step 5: Copy Your API Key

⚠️ **IMPORTANT:** The API key will only be shown ONCE!

1. Copy the entire key (it starts with `sk-proj-...` or `sk-...`)
2. Keep it safe - you'll need to paste it in the `.env` file

Example API key format:
```
sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH
```

## Step 6: Add to Your Project

1. Open the `backend\.env` file in a text editor
2. Replace `your_openai_api_key_here` with your actual key:

```
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH
```

3. Save the file

## ✅ You're Done!

Now you can run the backend server and it will use your OpenAI API key.

## 💰 Pricing & Free Credits

**Good News:**
- New OpenAI accounts often get **$5-18 in free credits**
- GPT-3.5-turbo is very cheap: about **$0.002 per medicine search**
- With $5 credit, you can do **~2,500 medicine searches**

**How to check your credits:**
1. Go to https://platform.openai.com/usage
2. You'll see your free credit balance and usage

## 🔒 Security Tips

- ✅ Never share your API key with anyone
- ✅ Never commit the `.env` file to GitHub
- ✅ The `.gitignore` file is already configured to ignore `.env`
- ✅ If you accidentally expose your key, delete it and create a new one

## ❓ Troubleshooting

### "Invalid API Key" Error

**Check:**
- No extra spaces before or after the key in `.env` file
- No quotes around the key
- The key starts with `sk-`
- You copied the entire key

### "Insufficient Credits" Error

**Solution:**
- Check your balance at https://platform.openai.com/usage
- Add a payment method at https://platform.openai.com/billing
- First $5 usually covers hundreds of searches

### Can't Find API Keys Page

**Direct link:** https://platform.openai.com/api-keys

Make sure you're logged in first.

## 🆘 Need Help?

- OpenAI Help: https://help.openai.com/
- OpenAI Documentation: https://platform.openai.com/docs

---

**Ready to continue?** Go back to [QUICK_START.md](QUICK_START.md) and continue with Step 2!
