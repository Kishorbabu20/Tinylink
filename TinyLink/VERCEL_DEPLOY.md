# Deploying TinyLink to Vercel

This guide will walk you through deploying your TinyLink application to Vercel.

## Prerequisites

- A GitHub account (for connecting your repository)
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A MySQL database (you can use Vercel Postgres, PlanetScale, or any MySQL provider)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Set Up MySQL Database

You'll need a MySQL database. Here are some options:

### Option A: PlanetScale (Recommended for MySQL)
1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Get your connection string

### Option B: Railway MySQL
1. Create a Railway account
2. Add a MySQL database service
3. Get the connection string

### Option C: Any MySQL Provider
- Use any MySQL hosting service (AWS RDS, DigitalOcean, etc.)
- Get your connection string

## Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"**
3. **Import your GitHub repository**:
   - Select your TinyLink repository
   - Click **"Import"**
4. **Configure the project**:
   - **Framework Preset**: Vercel will auto-detect Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

## Step 4: Configure Environment Variables

1. In your Vercel project settings, go to **"Environment Variables"**
2. Add your database connection:

### Option 1: Using DATABASE_URL (Recommended)
```
DATABASE_URL=mysql://username:password@host:port/database
```

### Option 2: Using Individual Variables
```
DB_HOST=your-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
```

3. **Add for all environments** (Production, Preview, Development)
4. Click **"Save"**

## Step 5: Set Up Database Tables

After deployment, you need to create the database tables. You can:

### Option A: Using MySQL Client
Connect to your database and run:
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

### Option B: Using PlanetScale Console
1. Go to your PlanetScale dashboard
2. Open the database
3. Run the SQL from `schema.sql`

### Option C: Using Railway MySQL Console
1. Go to your Railway MySQL service
2. Click **"Connect"** or **"MySQL Console"**
3. Run the SQL from `schema.sql`

## Step 6: Deploy

1. Click **"Deploy"** in Vercel
2. Vercel will automatically:
   - Install dependencies
   - Build your Next.js app
   - Deploy to production
3. Your app will be live at `https://your-project.vercel.app`

## Step 7: Set Up Custom Domain (Optional)

1. Go to your project → **"Settings"** → **"Domains"**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

## Step 8: Verify Deployment

1. Visit your Vercel URL
2. Test creating a short link
3. Check that the database is working correctly

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` or database environment variables are correct
- Ensure your database allows connections from Vercel's IP addresses
- For PlanetScale, enable **"Allow connections from Vercel"** in settings
- Check that database tables are created (run `schema.sql`)

### Build Failures

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

## Vercel Configuration

The project includes a `vercel.json` file for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Database Recommendations

### For Production:
- **PlanetScale**: Serverless MySQL, great for Vercel
- **Vercel Postgres**: If you're open to switching to PostgreSQL
- **Railway MySQL**: Simple and reliable
- **AWS RDS**: Enterprise-grade

### For Development:
- Use the same database provider or a local MySQL instance

## Useful Vercel Features

- **Automatic Deployments**: Every push to main branch deploys automatically
- **Preview Deployments**: Every PR gets a preview URL
- **Analytics**: Built-in performance monitoring
- **Edge Functions**: Deploy serverless functions globally
- **Environment Variables**: Separate vars for dev/preview/production

## Cost Considerations

- Vercel offers a generous free tier
- Hobby plan: Free for personal projects
- Pro plan: $20/month for teams
- Database costs depend on your provider

## Next Steps

- Set up automatic deployments from GitHub
- Configure custom domain
- Set up monitoring and analytics
- Consider adding Vercel Analytics
- Set up preview deployments for PRs

For more help, visit [Vercel's documentation](https://vercel.com/docs).


