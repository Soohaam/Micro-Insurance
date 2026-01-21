# Micro-Insurance Platform Deployment Guide

This guide will walk you through deploying the Micro-Insurance platform with the frontend on **Vercel** and the backend on **Render**.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Render account (sign up at [render.com](https://render.com))
- Cloudinary account for image uploads
- ThirdWeb account for blockchain integration

## Part 1: Backend Deployment on Render

### Step 1: Create PostgreSQL Database

1. Log in to your Render dashboard
2. Click **New +** → **PostgreSQL**
3. Configure your database:
   - **Name**: `micro-insurance-db`
   - **Database**: `micro_insurance`
   - **User**: `micro_insurance_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **Create Database**
5. **Important**: Copy the **Internal Database URL** (you'll need this for the backend)

### Step 2: Deploy Backend Service

1. In Render dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `micro-insurance-backend` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

   **Required Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<paste your PostgreSQL Internal Database URL>
   JWT_SECRET=<generate a random string - see below>
   CLOUDINARY_CLOUD_NAME=<your cloudinary cloud name>
   CLOUDINARY_API_KEY=<your cloudinary api key>
   CLOUDINARY_API_SECRET=<your cloudinary api secret>
   OCR_API_KEY=<your OCR API key>
   FRONTEND_URL=<will add after Vercel deployment>
   ```

   **Generate JWT_SECRET:**
   Run this command locally to generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **Create Web Service**
6. Wait for deployment to complete (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://micro-insurance-backend.onrender.com`)

### Step 3: Update CORS Configuration (Optional but Recommended)

After you have your Vercel frontend URL, you can update the backend's `FRONTEND_URL` environment variable in Render to restrict CORS to only your frontend.

## Part 2: Frontend Deployment on Vercel

### Step 1: Deploy to Vercel

1. Log in to your Vercel dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api
   NEXT_PUBLIC_TEMPLATE_CLIENT_ID=<your ThirdWeb client ID>
   ```
   
   Replace `your-backend-name` with your actual Render backend URL from Part 1, Step 2.

6. Click **Deploy**
7. Wait for deployment to complete (3-5 minutes)
8. **Copy your frontend URL** (e.g., `https://micro-insurance.vercel.app`)

### Step 2: Update Backend CORS

1. Go back to your Render dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Update the `FRONTEND_URL` variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

## Part 3: Database Initialization

### Option 1: Seed Admin User (Recommended)

After backend deployment, you may need to create an admin user. You can do this by:

1. In Render, go to your backend service
2. Click on **Shell** tab
3. Run the seed command:
   ```bash
   npm run seed:admin
   ```

### Option 2: Manual Database Setup

If you need to run migrations or manual setup, use the Render Shell or connect to your PostgreSQL database directly.

## Part 4: Verification

### Test Your Deployment

1. **Visit your frontend URL** (Vercel URL)
2. **Check the homepage** loads correctly
3. **Test registration**:
   - Try registering a new user
   - Check browser console for any errors
   - Verify the API calls are going to your Render backend
4. **Test login**:
   - Log in with your credentials
   - Verify you're redirected to the appropriate dashboard
5. **Check API connectivity**:
   - Open browser DevTools → Network tab
   - Verify API calls are hitting `https://your-backend.onrender.com/api/*`
   - Check for any CORS errors in the console

### Common Issues

**CORS Errors:**
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly (including https://)
- Check that there are no trailing slashes

**API Connection Failed:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel includes `/api` at the end
- Check that your Render backend is running (not sleeping on free tier)

**Database Connection Issues:**
- Verify `DATABASE_URL` is correctly set in Render
- Check Render logs for database connection errors

**Environment Variables Not Working:**
- Remember: Vercel environment variables require redeployment to take effect
- Render environment variables trigger automatic redeployment

## Part 5: Post-Deployment Configuration

### Update .gitignore Files

**Important**: After deployment, uncomment all entries in your `.gitignore` files to protect sensitive information:

**Frontend `.gitignore`:**
```bash
# Uncomment all lines in frontend/.gitignore
```

**Backend `.gitignore`:**
```bash
# Uncomment all lines in backend/.gitignore
```

This ensures `.env` files and other sensitive data are not committed to your repository.

### Monitoring

- **Vercel**: Monitor deployments and analytics in Vercel dashboard
- **Render**: Check logs and metrics in Render dashboard
- Set up error tracking (e.g., Sentry) for production monitoring

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.onrender.com/api` |
| `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` | ThirdWeb Client ID | Your ThirdWeb client ID |

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `OCR_API_KEY` | ✅ | OCR API key for document verification |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ✅ | Set to `5000` |
| `FRONTEND_URL` | ⚠️ | Your Vercel frontend URL (for CORS) |

## Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys on every push to your main branch
- **Render**: Automatically deploys on every push to your main branch

To disable auto-deploy, check the settings in each platform's dashboard.

## Support

If you encounter issues:
1. Check the deployment logs in Vercel/Render dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Check browser console for client-side errors

---

**Congratulations!** 🎉 Your Micro-Insurance platform is now deployed and ready for use!
