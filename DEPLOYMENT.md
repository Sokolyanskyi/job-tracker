# Deployment Guide - Vercel (Frontend) + Render (Backend)

## 1. Deploy Backend to Render

### Step 1: Prepare Repository
- Push your code to GitHub
- Make sure `server/` folder is in the root

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: job-tracker-api (or any name)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node 20

### Step 3: Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Choose a name (e.g., `job-tracker-db`)
3. Select plan (Free tier available)
4. Click "Create Database"
5. Wait for database to be ready
6. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 4: Set Environment Variables
Add these in Render Environment Variables:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=postgresql://your-db-url-here
```

### Step 5: Deploy
- Click "Create Web Service"
- Wait for deployment
- Copy your Render URL (e.g., `https://job-tracker-api.onrender.com`)

---

## 2. Deploy Frontend to Vercel

### Step 1: Prepare Repository
- Make sure `client/` folder is in the root
- Update `NEXT_PUBLIC_API_URL` in Vercel settings

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables
Add in Vercel Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/auth
```

### Step 4: Deploy
- Click "Deploy"
- Wait for deployment
- Copy your Vercel URL

---

## 3. Update CORS on Render

After deploying frontend:
1. Go to your Render service
2. Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
3. Trigger redeploy (or push a small change)

---

## 4. Important Notes

### Database (PostgreSQL)
- PostgreSQL is now configured and will persist data between deployments
- Free tier available on Render (max 1GB storage, 90 days inactive data retention)

### Security
- Change `JWT_SECRET` to a strong random string
- Don't commit `.env` files
- Use HTTPS in production

### Troubleshooting

**CORS errors:**
- Verify `CORS_ORIGIN` matches your Vercel URL exactly
- Check browser console for specific error messages

**API not reachable:**
- Verify Render service is running
- Check Render logs for errors
- Ensure `NEXT_PUBLIC_API_URL` is correct in Vercel

**Build fails:**
- Check `package.json` has `start` script in server
- Verify Node version compatibility
- Check Render/Vercel build logs

---

## 5. Quick Checklist

- [ ] PostgreSQL database created on Render
- [ ] `DATABASE_URL` set in Render Environment Variables
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] `CORS_ORIGIN` set in Render
- [ ] `JWT_SECRET` changed from default
- [ ] Test login/registration on deployed app
- [ ] Test job creation and drag-and-drop
