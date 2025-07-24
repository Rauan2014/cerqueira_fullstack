// _worker.js - Adapted for Cloudflare Pages

// Import the Next.js app handler. 
// Note the path is now './' instead of '../'
import { default as handler } from './.next/server/app-render.js';

export default {
  async fetch(request, env, ctx) {
    // Pass the request directly to the Next.js handler.
    // Static assets are already handled by the Pages platform automatically.
    return handler(request, env, ctx);
  }
};