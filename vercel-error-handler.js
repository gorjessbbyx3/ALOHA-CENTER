/**
 * Vercel Error Handler
 * 
 * This script contains specialized error handling for Vercel deployments.
 * It's designed to catch common Vercel-specific errors and provide helpful
 * diagnostic information for troubleshooting.
 */

const fs = require('fs');
const path = require('path');

/**
 * Adds Vercel-specific error handling to an Express app
 * 
 * @param {Express} app - The Express application instance
 */
function setupVercelErrorHandler(app) {
  // Add Vercel-specific request logging middleware
  app.use((req, res, next) => {
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
      console.log(`[Vercel] ${req.method} ${req.url}`);
      // Log Vercel-specific headers that can help with debugging
      const vercelHeaders = Object.keys(req.headers)
        .filter(h => h.startsWith('x-vercel') || h.startsWith('x-forwarded'))
        .reduce((obj, key) => {
          obj[key] = req.headers[key];
          return obj;
        }, {});
      
      if (Object.keys(vercelHeaders).length > 0) {
        console.log('[Vercel Headers]', JSON.stringify(vercelHeaders));
      }
    }
    next();
  });

  // Handle 404 errors specially for Vercel
  app.use((req, res, next) => {
    // Only handle HTML requests that haven't found a route
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const errorID = req.headers['x-vercel-id'] || 'unknown';
      
      // Check if 404.html exists
      const custom404Path = path.join(__dirname, '404.html');
      if (fs.existsSync(custom404Path)) {
        const content = fs.readFileSync(custom404Path, 'utf8')
          .replace('Unknown', errorID)
          .replace('NOT_FOUND', 'NOT_FOUND');
        
        return res.status(404).send(content);
      }
      
      // Fallback to a simple 404 message
      return res.status(404).send(`
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - Page Not Found</h1>
            <p>The requested URL ${req.url} was not found on this server.</p>
            <p>Error ID: ${errorID}</p>
            <p><a href="/">Return to homepage</a></p>
          </body>
        </html>
      `);
    }
    next();
  });

  // Add specialized error handler for common Vercel deployment issues
  app.use((err, req, res, next) => {
    console.error('[Vercel Error]', err);
    
    // Check for specific Vercel errors
    if (err.code === 'FUNCTION_INVOCATION_FAILED') {
      return res.status(500).json({
        error: 'FUNCTION_INVOCATION_FAILED',
        message: 'The serverless function failed to execute. This could be due to missing environment variables or incorrect configuration.',
        resolutionSteps: [
          'Check your environment variables in Vercel dashboard',
          'Verify that any required API keys are set',
          'Check if the database connection string is correct',
          'Review server logs in Vercel dashboard'
        ]
      });
    }
    
    if (err.code === 'EDGE_FUNCTION_INVOCATION_TIMEOUT') {
      return res.status(504).json({
        error: 'EDGE_FUNCTION_INVOCATION_TIMEOUT',
        message: 'The function execution time exceeded the limit. This is often caused by slow database queries or external API calls.',
        resolutionSteps: [
          'Optimize your database queries',
          'Consider using caching for expensive operations',
          'Check if external API calls are timing out'
        ]
      });
    }
    
    next(err);
  });
}

module.exports = { setupVercelErrorHandler };