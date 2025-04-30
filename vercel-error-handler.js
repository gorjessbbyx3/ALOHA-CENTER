/**
 * Vercel Error Handler
 * 
 * This script is used for error handling in Vercel deployments.
 * It transforms various errors into proper responses with appropriate status codes.
 */

const fs = require('fs');
const path = require('path');

/**
 * Custom error handler middleware for Vercel deployments
 */
function vercelErrorHandler(err, req, res, next) {
  console.error('Vercel Error:', err);

  // Error mapping based on common Vercel error patterns
  if (err.code === 'ENOENT' && err.syscall === 'open') {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.path
    });
  }

  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'FUNCTION_INVOCATION_TIMEOUT',
      message: 'The request timed out',
      path: req.path
    });
  }

  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      error: 'FUNCTION_PAYLOAD_TOO_LARGE',
      message: 'The request payload is too large',
      path: req.path
    });
  }

  if (err.message && err.message.includes('database')) {
    return res.status(500).json({
      error: 'FUNCTION_INVOCATION_FAILED',
      message: 'Database connection error',
      path: req.path,
      details: 'Check your DATABASE_URL environment variable'
    });
  }

  // Generic error response
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    path: req.path
  });
}

/**
 * Redirect to our custom error page instead of Vercel's default error page
 */
function handleVercelErrors(app) {
  // Register the custom error handler
  app.use(vercelErrorHandler);

  // Define a catch-all route for 404 errors
  app.use('*', (req, res) => {
    // First check if it's an API request
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        error: 'API_ROUTE_NOT_FOUND',
        message: `The API route ${req.path} does not exist`,
      });
    }

    // For non-API routes in production, serve the index.html
    if (process.env.NODE_ENV === 'production') {
      try {
        const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      } catch (err) {
        console.error('Error serving index.html:', err);
      }
    }

    // If we couldn't find or serve index.html, serve a basic 404
    res.status(404).send('Not Found');
  });
}

module.exports = { vercelErrorHandler, handleVercelErrors };