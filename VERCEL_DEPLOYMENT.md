# Vercel Deployment Guide

This guide provides instructions for deploying the Aloha Healing Center application on Vercel, including common issues and their solutions.

## Quick Start

1. **Fork or clone this repository to your GitHub account**
2. **Connect your GitHub repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your repository
   - Follow the prompts to configure your project

3. **Configure Environment Variables**:
   - In your Vercel project settings, add the following environment variables:

   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key
   CALENDLY_API_KEY=your_calendly_api_key
   CALENDLY_USER_URI=https://api.calendly.com/users/your_user_id
   CALENDLY_ORG_URI=https://api.calendly.com/organizations/your_org_id
   ```

4. **Deploy Your Project**:
   - Click "Deploy" in the Vercel dashboard

## Database Setup

For production deployments, we recommend using one of these database providers:

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)

After configuring your database, update the `DATABASE_URL` environment variable in your Vercel project settings.

### Database Migration

After deploying for the first time, you need to run database migrations:

1. Clone your Vercel project locally using the Vercel CLI
2. Run `npm run db:push` to push the database schema

Alternatively, you can use the `vercel-db-migrate.js` script included in this project.

## Common Deployment Errors and Solutions

### Function Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `FUNCTION_INVOCATION_FAILED` | Server function execution failed | Check server logs for errors. Common causes include missing environment variables, database connection issues, or API failures. |
| `FUNCTION_INVOCATION_TIMEOUT` | Function exceeded time limit | Optimize database queries, reduce external API calls, or use Edge Functions for performance-critical operations. Split complex operations into multiple smaller functions. |
| `FUNCTION_PAYLOAD_TOO_LARGE` | Request/response payload too large | Reduce the size of request/response data. Consider pagination for large datasets or client-side filtering. Compress responses if needed. |
| `NO_RESPONSE_FROM_FUNCTION` | Function did not respond | Check for infinite loops or hanging promises in your serverless functions. Add proper error handling to ensure functions always return a response. |

### Deployment Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `DEPLOYMENT_NOT_FOUND` | Deployment not found | Verify deployment status in Vercel dashboard and ensure the deployment URL is correct. Check for typos in URLs. |
| `DEPLOYMENT_NOT_READY_REDIRECTING` | Deployment still building/preparing | Wait for the deployment to complete. Check build logs in Vercel dashboard for any issues that may be slowing down deployment. |
| `DEPLOYMENT_BLOCKED` | Deployment blocked | This usually happens due to billing or account issues. Check your Vercel account status and billing information. |
| `DEPLOYMENT_PAUSED` | Deployment paused | Visit your Vercel dashboard to resume the deployment. This may happen if auto-deployments are paused. |

### DNS and Routing Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `DNS_HOSTNAME_NOT_FOUND` | Hostname not found | Verify DNS configuration for your domain. Check nameservers and DNS propagation status. |
| `DNS_HOSTNAME_RESOLVED_PRIVATE` | DNS resolved to private IP | Your DNS is pointing to a private IP address that Vercel cannot access. Update your DNS records. |
| `ROUTER_CANNOT_MATCH` | Router cannot match path | Check your routing configuration. Ensure all routes are properly defined and don't conflict. |
| `NOT_FOUND` | Resource not found | Check file paths and API routes. Ensure static files are in the correct directory and API endpoints are properly defined. |

### Request and Response Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `REQUEST_HEADER_TOO_LARGE` | Request header too large | Reduce the size of request headers. Split cookies or authorization tokens if needed. |
| `RANGE_GROUP_NOT_VALID` | Invalid range request | Fix range requests in your client code or consider disabling range requests if not needed. |
| `URL_TOO_LONG` | URL exceeds length limit | Shorten URLs or move long parameters to the request body using POST instead of GET. |

### Internal Platform Errors

If you encounter any of these errors, they're typically related to Vercel's internal platform infrastructure and may require Vercel support assistance.

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INTERNAL_FUNCTION_INVOCATION_FAILED` | Internal function execution failed | Check your deployment logs for specific error messages. Try redeploying, and if issues persist, contact Vercel support. |
| `INTERNAL_FUNCTION_NOT_READY` | Function not ready to serve requests | This is usually temporary during cold starts or initial deployment. Wait a few minutes and try again. If persistent, contact Vercel support. |
| `INTERNAL_CACHE_ERROR` | Vercel caching system issue | Try invalidating the build cache by redeploying. If issues persist, contact Vercel support. |
| `INTERNAL_DEPLOYMENT_FETCH_FAILED` | Failure to fetch deployment | This is usually temporary. Wait a few minutes and try again. If persistent, contact Vercel support. |
| `INTERNAL_UNEXPECTED_ERROR` | Unexpected platform error | Contact Vercel support with details about your deployment configuration. |

## Troubleshooting Steps

If you encounter deployment issues:

1. **Check Environment Variables**:
   - Verify all required environment variables are set correctly
   - Ensure sensitive values have not been accidentally truncated

2. **Review Build Logs**:
   - Check the build logs in your Vercel dashboard for errors
   - Look for failed dependencies or build steps

3. **Database Connectivity**:
   - Confirm your database is accessible from Vercel's servers
   - Check IP allow-lists and firewall settings

4. **Runtime Errors**:
   - Check function logs in your Vercel dashboard
   - Test your API endpoints individually

5. **Use the In-App Diagnostic Tool**:
   - The application includes a Vercel compatibility checker tool
   - Click on the "Vercel Compatible" button in the bottom-right corner of the app

## Advanced Configuration

### Custom Domain Setup

1. Go to your Vercel project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow the DNS configuration instructions

### Deployment Branches

Configure which branches to deploy:

1. Go to your Vercel project settings
2. Navigate to the "Git" section
3. Configure production and preview branch settings

### Environment Separation

For different environments (development, staging, production):

1. Create different Vercel projects for each environment
2. Configure environment-specific variables
3. Connect each project to appropriate branches in your repository

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Error Codes Reference](https://vercel.com/docs/errors/error-list)

## Support

If you continue to experience issues with deployment, please:

1. Visit the Vercel help center: https://vercel.com/help
2. Contact Vercel support directly from your dashboard
3. Check GitHub issues for this repository for similar problems and solutions