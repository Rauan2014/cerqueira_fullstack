// Worker script for Next.js app with large files
export default {
  async fetch(request, env, ctx) {
    try {
      // Import the Next.js app handler
      const { default: handler } = await import('../.next/server/app-render.js');
      
      // Handle the request with Next.js
      return await handler(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      
      // Fallback: try to serve static assets
      const url = new URL(request.url);
      const assetResponse = await env.ASSETS.fetch(request);
      
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      
      // Return error response
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};