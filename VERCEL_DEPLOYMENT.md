# Deploying to Vercel

This guide provides step-by-step instructions for deploying the Aloha Healing Center clinic management system to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/signup) (optional but recommended)
3. The Aloha Healing Center codebase
4. A database solution (PostgreSQL or Neon Database recommended)

## Setup Steps

### 1. Prepare your database

For production deployment, you'll need a PostgreSQL database. We recommend:

- [Neon Database](https://neon.tech/) - Free tier available
- [Supabase](https://supabase.com/) - Free tier available
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Available on Vercel Pro plans

After setting up your database, keep your database credentials handy for the next steps.

### 2. Set up environment variables

Before deploying, ensure you have these environment variables ready:

- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` (if using payment processing)
- `SENDGRID_API_KEY` (if using email notifications)

If you're using AWS RDS Data API, you'll also need:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DB_INSTANCE_IDENTIFIER`
- `DB_NAME`
- `DB_SECRET_ARN`
- `DB_RESOURCE_ARN`

### 3. Deploy to Vercel

#### Option A: Deploy from the Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
3. Click "Add New..." and select "Project"
4. Import your Git repository
5. Configure the project:
   - Build Command: Leave blank (uses vercel.json)
   - Output Directory: Leave blank (uses vercel.json)
   - Install Command: `npm install`
6. Add environment variables:
   - Click "Environment Variables"
   - Add all the required variables listed above
7. Click "Deploy"

#### Option B: Deploy using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Navigate to your project directory and run:
   ```
   vercel
   ```

4. Follow the prompts to set up the project:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: [Your project name]
   - Directory: ./

5. Set environment variables:
   ```
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   # Add other variables as needed
   ```

6. Deploy the production version:
   ```
   vercel --prod
   ```

### 4. Initialize the database (first-time setup)

After deploying, you need to run the database migrations to set up your database schema. You can do this in two ways:

#### Option A: Using the Vercel CLI

```bash
# Connect to your Vercel project
vercel env pull .env.production
# Run migrations
npm run db:push
```

#### Option B: Using the Vercel Dashboard

1. Go to your Vercel project
2. Click on "Functions" tab
3. Find a function and click "View Runtime Logs"
4. Open the console 
5. Run: `npm run db:push`

## Post-Deployment Tasks

### Add your domain (optional)

1. Go to your project in the Vercel dashboard
2. Click on "Domains"
3. Add your custom domain and follow the verification steps

### Set up monitoring and analytics

1. Enable [Analytics](https://vercel.com/docs/analytics) in the Vercel dashboard
2. Consider adding [Sentry](https://vercel.com/integrations/sentry) for error tracking

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:
1. Verify your `DATABASE_URL` in environment variables
2. Ensure your database is accessible from Vercel's servers
3. Check that you've allowed external connections in your database settings

### Build Failures

If deployment fails:
1. Check build logs for specific errors
2. Verify all dependencies are properly installed
3. Make sure the vercel.json configuration is correct

### API Connection Issues

If frontend can't connect to the backend:
1. Ensure API routes are correctly set up in vercel.json
2. Check browser console for CORS or other connection errors

## Maintenance

### Updating your deployment

Any push to your connected Git repository will trigger a new deployment automatically.

To manually redeploy:
1. Go to your project in the Vercel dashboard
2. Click "Deployments"
3. Click "Redeploy" on the latest deployment

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/vercel-postgres)
- [Environment Variables on Vercel](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains on Vercel](https://vercel.com/docs/concepts/projects/domains)