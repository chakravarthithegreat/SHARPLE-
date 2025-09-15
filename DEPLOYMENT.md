# 🚀 SHARPLE Deployment Guide

## Netlify Deployment

### Prerequisites
- GitHub repository: https://github.com/chakravarthithegreat/SHARPLE-
- Netlify account (free tier available)

### Step 1: Deploy to Netlify

1. **Go to [Netlify](https://netlify.com)** and sign in
2. **Click "New site from Git"**
3. **Connect to GitHub** and select your `SHARPLE-` repository
4. **Configure build settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Base directory**: (leave empty)

### Step 2: Environment Variables

Add these environment variables in Netlify dashboard:

#### Frontend Environment Variables:
```
VITE_API_URL=/api
VITE_APP_NAME=SHARPLE
VITE_APP_VERSION=1.0.0
```

#### Backend Environment Variables (for Netlify Functions):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-site-name.netlify.app
```

### Step 3: MongoDB Setup

1. **Create a MongoDB Atlas account** (free tier available)
2. **Create a new cluster**
3. **Get your connection string**
4. **Add it to Netlify environment variables**

### Step 4: Deploy

1. **Click "Deploy site"**
2. **Wait for build to complete**
3. **Your app will be available at**: `https://your-site-name.netlify.app`

### Step 5: Custom Domain (Optional)

1. **Go to Site settings > Domain management**
2. **Add your custom domain**
3. **Configure DNS settings**

## Alternative Deployment Options

### Vercel
- Similar process to Netlify
- Great for React applications
- Automatic deployments from GitHub

### Heroku
- Good for full-stack applications
- Requires separate frontend and backend deployments
- More complex setup

### Railway
- Modern deployment platform
- Simple setup
- Good for Node.js applications

## Post-Deployment

### Testing
- ✅ Frontend loads correctly
- ✅ API endpoints respond
- ✅ Authentication works
- ✅ Database connection established

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance
- Set up analytics

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **API not working**: Verify environment variables
3. **Database connection**: Check MongoDB URI format
4. **CORS errors**: Verify frontend URL in backend config

### Support:
- Check Netlify build logs
- Verify environment variables
- Test API endpoints manually
