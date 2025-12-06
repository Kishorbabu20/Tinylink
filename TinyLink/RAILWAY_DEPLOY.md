# Deploying TinyLink to Railway

This guide will walk you through deploying your TinyLink application to Railway.

## Prerequisites

- A GitHub account (for connecting your repository)
- A Railway account (sign up at [railway.app](https://railway.app))

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/tinylink.git
   git push -u origin main
   ```

## Step 2: Create a New Project on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your TinyLink repository
5. Railway will automatically detect it's a Next.js project

## Step 3: Set Up MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway will create a MySQL database for you
4. Note the connection details (you'll need them later)

## Step 4: Configure Environment Variables

1. In your Railway project, click on your **Next.js service**
2. Go to the **"Variables"** tab
3. Add the following environment variables:

### Option 1: Using DATABASE_URL (Recommended)
```
DATABASE_URL=mysql://user:password@host:port/database
```
Railway provides this automatically. Click on your MySQL service → **"Variables"** tab → Copy the `MYSQL_URL` or `DATABASE_URL` value.

### Option 2: Using Individual Variables
If Railway doesn't provide DATABASE_URL automatically, use:
```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
```

**Note:** Railway automatically provides these variables for MySQL services. Check your MySQL service's **"Variables"** tab to see the exact values.

## Step 5: Run Database Migrations

After your app is deployed, you need to create the database tables:

### Option A: Using Railway's MySQL Console

1. Go to your MySQL service in Railway
2. Click **"Connect"** or **"MySQL Console"**
3. Run the SQL from `schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS links (
     id INT AUTO_INCREMENT PRIMARY KEY,
     code VARCHAR(255) UNIQUE NOT NULL,
     url TEXT NOT NULL,
     title VARCHAR(500) NULL,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     clickCount INT DEFAULT 0,
     lastClicked TIMESTAMP NULL
   );
   ```

### Option B: Using a Migration Script

1. In Railway, go to your Next.js service
2. Click **"Settings"** → **"Deploy"**
3. Add a **"Build Command"** (optional, Railway auto-detects):
   ```
   npm run build
   ```
4. Add a **"Start Command"**:
   ```
   npm start
   ```

## Step 6: Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or manually trigger a deployment by clicking **"Deploy"** in the Railway dashboard
3. Wait for the build to complete
4. Your app will be live at a Railway-provided URL (e.g., `https://tinylink-production.up.railway.app`)

## Step 7: Set Up Custom Domain (Optional)

1. In your Railway project, go to your Next.js service
2. Click **"Settings"** → **"Networking"**
3. Click **"Generate Domain"** or add your custom domain
4. Configure DNS records as instructed

## Step 8: Verify Deployment

1. Visit your Railway URL
2. Test creating a short link
3. Check that the database is working correctly

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` or database environment variables are correct
- Check that your MySQL service is running in Railway
- Ensure the database tables are created (run `schema.sql`)

### Build Failures

- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Railway uses Node 18+ by default)

### Environment Variables Not Working

- Make sure variables are set in the correct service (Next.js service, not MySQL service)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Railway Configuration File

Railway will auto-detect Next.js, but you can create a `railway.json` file for custom configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Useful Railway Commands

- View logs: Click on your service → **"Deployments"** → Click on a deployment → **"View Logs"**
- Open MySQL console: Click on MySQL service → **"Connect"** or **"MySQL Console"**
- Monitor usage: Dashboard shows resource usage and metrics

## Cost Considerations

- Railway offers a free tier with $5 credit per month
- MySQL database usage counts toward your usage
- Monitor your usage in the Railway dashboard

## Next Steps

- Set up automatic deployments from GitHub
- Configure custom domain
- Set up monitoring and alerts
- Consider adding a CDN for static assets

For more help, visit [Railway's documentation](https://docs.railway.app).

