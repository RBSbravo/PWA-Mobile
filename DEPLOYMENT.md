# MITO PWA Deployment Guide

This guide covers deploying the MITO Task Manager Progressive Web App to connect with your Railway backend.

## Prerequisites

- Railway backend deployed and running
- Railway backend URL (e.g., `https://ticketing-and-task-management-system-production.up.railway.app`)
- Node.js 16+ installed locally
- Git repository set up

## Step 1: Update Backend URL

### Option A: Using Environment Variables (Recommended)

1. **Create local environment file**:

   ```bash
   cp env.example .env.local
   ```

2. **Update `.env.local`** with your Railway backend URL:
   ```env
   VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
   VITE_SOCKET_URL=https://your-railway-backend-url.up.railway.app
   ```

### Option B: Direct Configuration Update

Update `src/config/index.js` with your actual Railway URL:

```javascript
BACKEND_API_URL: 'https://your-railway-backend-url.up.railway.app/api',
SOCKET_URL: 'https://your-railway-backend-url.up.railway.app',
```

## Step 2: Test Local Build

1. **Install dependencies**:

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Build the app**:

   ```bash
   npm run build:prod
   ```

3. **Preview locally**:

   ```bash
   npm run serve
   ```

4. **Test PWA features**:
   ```bash
   npm run test:pwa
   ```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set environment variables** in Vercel dashboard:
   - `VITE_API_URL`: `https://your-railway-backend-url.up.railway.app/api`
   - `VITE_SOCKET_URL`: `https://your-railway-backend-url.up.railway.app`

### Method 2: GitHub Integration

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Deploy PWA to production"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build:prod`
     - Output Directory: `dist`
   - Set environment variables

## Step 4: Configure CORS on Railway Backend

Update your Railway backend's CORS configuration to allow your Vercel domain:

1. **In Railway dashboard**, add environment variable:

   ```
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

2. **Or update backend code** to include your Vercel domain in CORS origins.

## Step 5: Test Deployment

1. **Visit your Vercel URL**
2. **Test PWA installation**:

   - Look for install button in browser
   - Test offline functionality
   - Verify real-time updates work

3. **Test API connectivity**:
   - Try logging in
   - Create a task
   - Check notifications

## Step 6: Update PWA Manifest

If needed, update `public/manifest.json` with your production URLs:

```json
{
  "start_url": "https://your-vercel-app.vercel.app/",
  "scope": "https://your-vercel-app.vercel.app/"
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Ensure Railway backend allows your Vercel domain
   - Check CORS configuration in backend

2. **API Connection Failed**:

   - Verify Railway backend is running
   - Check backend URL in PWA configuration
   - Test backend endpoints directly

3. **PWA Not Installing**:

   - Ensure HTTPS is enabled (Vercel provides this)
   - Check manifest.json is accessible
   - Verify service worker is registered

4. **Real-time Updates Not Working**:
   - Check WebSocket connection
   - Verify Socket.IO configuration
   - Check browser console for errors

### Debug Steps

1. **Check browser console** for errors
2. **Test API endpoints** directly:
   ```bash
   curl https://your-railway-backend-url.up.railway.app/api/health
   ```
3. **Verify environment variables** in Vercel dashboard
4. **Check Railway backend logs** for connection issues

## Production Checklist

- [ ] Railway backend deployed and accessible
- [ ] PWA built successfully
- [ ] Environment variables configured
- [ ] CORS configured on backend
- [ ] PWA installable on mobile/desktop
- [ ] Offline functionality working
- [ ] Real-time updates working
- [ ] Push notifications working (if enabled)

## Next Steps

After successful deployment:

1. **Monitor performance** using Vercel Analytics
2. **Set up custom domain** (optional)
3. **Configure monitoring** and error tracking
4. **Set up automated deployments** from GitHub

## Support

For issues:

- Check Railway backend logs
- Check Vercel deployment logs
- Review browser console errors
- Test API endpoints independently

---

**Note**: Replace `your-railway-backend-url` and `your-vercel-app` with your actual URLs throughout this guide.
