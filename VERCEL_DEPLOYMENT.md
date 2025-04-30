# Vercel Deployment Guide for Aloha Healing Center

This document provides comprehensive guidance for deploying the Aloha Healing Center application to Vercel.

## Prerequisites

1. A Vercel account linked to your GitHub repository
2. A PostgreSQL database (provided by Neon, Supabase, or your preferred provider)
3. Stripe account for payment processing
4. Calendly account for appointment scheduling (optional)

## Environment Variables

Set the following environment variables in your Vercel project settings:

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | Yes |
| `CALENDLY_API_KEY` | Calendly API key for integrations | No |
| `CALENDLY_USER_URI` | Calendly user URI | No |
| `CALENDLY_ORG_URI` | Calendly organization URI | No |
| `NODE_ENV` | Should be set to `production` for deployments | Yes |

## Deployment Steps

1. **Connect Your Repository**
   - Import your project from GitHub to Vercel
   - Select the repository `gorjessbbyx3/ALOHA-CENTER`

2. **Configure Project Settings**
   - Set the framework preset to "Other"
   - Leave Build Command blank (using `vercel.json` configuration)
   - Leave Output Directory blank (using `vercel.json` configuration)

3. **Add Environment Variables**
   - Configure all required environment variables from the table above
   - You can use Vercel's UI to add these in the project settings

4. **Deploy**
   - Click "Deploy" and Vercel will build and deploy your application
   - Monitor build logs for any issues

## Troubleshooting Common Issues

### 404 NOT_FOUND Errors

If you encounter 404 errors after deployment:

1. **Check API Routes**:
   - Verify that API routes are properly defined in `server/routes.ts`
   - Make sure the health check endpoint (`/api/health-check`) is working

2. **Routing Configuration**:
   - Verify your `vercel.json` file has proper routing configuration
   - The catch-all route should be at the end of the routes array

3. **Static Assets**:
   - If static assets are not loading, ensure they're properly included in the build
   - Check that the build script is copying all necessary files to the output directory

### Database Connection Issues

If your application cannot connect to the database:

1. **Connection String**:
   - Verify your `DATABASE_URL` environment variable is correctly set
   - Make sure your database server allows connections from Vercel's IP ranges

2. **Database Migration**:
   - If database schema is missing, run the migration script:
   - `npx drizzle-kit push:pg`

### Stripe Integration Issues

If payments aren't working:

1. **API Keys**:
   - Verify both `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` are set correctly
   - Make sure you're using live keys in production, not test keys

2. **Webhook Configuration**:
   - Set up Stripe webhooks to point to your Vercel deployment URL

## Monitoring and Logs

- Monitor application health with the `/api/health-check` endpoint
- Use Vercel's built-in logs viewer to troubleshoot deployment issues
- Check the Function logs in Vercel dashboard for server-side errors

## Rollback Process

If a deployment introduces critical issues:

1. Go to the Vercel dashboard for your project
2. Navigate to "Deployments" tab
3. Find the last working deployment
4. Click the three dots menu (⋮) and select "Promote to Production"

## Custom Domain Setup

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS settings

---

For any additional questions or issues, please contact your development team or reference the Vercel documentation at https://vercel.com/docs.