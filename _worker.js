// _worker.js - Adapted for Cloudflare Pages with Instagram API

// Import the Next.js app handler
import { default as handler } from './.next/server/app-render.js';

// --- Instagram API Configuration ---
const API_BASE_URL = 'https://graph.instagram.com';
const CACHE_REVALIDATE_SECONDS = 900;

// --- Helper Functions ---
function debugLog(message, data = null) {
  console.log(`[Instagram API Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

function generateTitleFromCaption(caption) {
  if (!caption || typeof caption !== 'string') return 'Post without title';
  const cleanCaption = caption.replace(/#\w+/g, '').replace(/@\w+/g, '').trim();
  if (cleanCaption.length <= 50) return cleanCaption;
  const firstSentence = cleanCaption.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 50) return firstSentence;
  return cleanCaption.substring(0, 47).trim() + '...';
}

// --- Central API Client ---
async function instagramApiRequest(endpoint, params = {}, env) {
  const accessToken = env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Instagram Access Token is not configured.');
  }

  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}${endpoint}?${queryParams.toString()}&access_token=${accessToken}`;
  
  debugLog(`Fetching from Instagram API: ${endpoint}`, params);

  const response = await fetch(url, {
    headers: {
      'Cache-Control': `public, max-age=${CACHE_REVALIDATE_SECONDS}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error?.message || `HTTP error ${response.status}`;
    debugLog(`API Error for ${endpoint}:`, { status: response.status, error: errorMessage });
    throw new Error(errorMessage);
  }

  return data;
}

// --- Instagram Service Functions ---
async function getInstagramProfile(env) {
  const fields = 'id,username,account_type,media_count';
  return instagramApiRequest('/me', { fields }, env);
}

async function getInstagramMedia({ limit = 25, after = null } = {}, env) {
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}';
  const params = { fields, limit };
  if (after) params.after = after;
  return instagramApiRequest('/me/media', params, env);
}

async function getSpecificInstagramMedia(mediaId, env) {
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}';
  return instagramApiRequest(`/${mediaId}`, { fields }, env);
}

// --- Data Formatting Function ---
function formatInstagramMedia(mediaItems) {
  debugLog('Formatting media data:', { mediaCount: mediaItems.length });
  return mediaItems.map(item => {
    const images = [];
    if (item.media_type === 'CAROUSEL_ALBUM' && item.children?.data) {
      item.children.data.forEach(child => {
        if (child.media_type === 'IMAGE') images.push(child.media_url);
        else if (child.media_type === 'VIDEO') images.push(child.thumbnail_url);
      });
    } else if (item.media_type === 'IMAGE') {
      images.push(item.media_url);
    } else if (item.media_type === 'VIDEO') {
      images.push(item.thumbnail_url);
    }

    return {
      id: item.id,
      titulo: generateTitleFromCaption(item.caption),
      data: item.timestamp,
      legenda: item.caption || '',
      images: images,
      mediaType: item.media_type,
      permalink: item.permalink,
      username: item.username,
    };
  });
}

// --- Instagram API Handler ---
async function handleInstagramAPI(request, env) {
  try {
    console.log('🚀 Instagram API called!');
    console.log('📝 Request URL:', request.url);
    
    // Debug: Check if environment variable is available
    console.log('Access token exists:', !!env.INSTAGRAM_ACCESS_TOKEN);
    console.log('Access token first 10 chars:', env.INSTAGRAM_ACCESS_TOKEN?.substring(0, 10));
    
    debugLog('=== Instagram API GET Request Started ===');
    const url = new URL(request.url);
    const mediaId = url.searchParams.get('id');
    
    // If a specific media ID is requested, fetch and return only that
    if (mediaId) {
      debugLog(`Fetching specific media: ${mediaId}`);
      const mediaItem = await getSpecificInstagramMedia(mediaId, env);
      const formattedMedia = formatInstagramMedia([mediaItem])[0];
      
      return new Response(JSON.stringify(formattedMedia), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_REVALIDATE_SECONDS}`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Otherwise, fetch the profile and media feed
    const limit = parseInt(url.searchParams.get('limit')) || 25;
    const after = url.searchParams.get('after');

    const profile = await getInstagramProfile(env);
    const media = await getInstagramMedia({ limit, after }, env);
    const formattedPosts = formatInstagramMedia(media.data || []);
    
    debugLog('=== Instagram API GET Request Completed Successfully ===');
    
    return new Response(JSON.stringify({
      profile,
      posts: formattedPosts,
      paging: media.paging || {},
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_REVALIDATE_SECONDS}`,
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    debugLog('=== Instagram API GET Request Failed ===', { error: error.message });
    const status = error.message.includes('token') ? 401 : 500;
    
    return new Response(JSON.stringify({ 
      error: `Failed to fetch from Instagram: ${error.message}` 
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    console.log('🔄 Worker called for:', url.pathname);
    
    // Intercept Instagram API calls before they reach Next.js
    if (url.pathname === '/api/instagram' && request.method === 'GET') {
      console.log('📸 Handling Instagram API request');
      return handleInstagramAPI(request, env);
    }
    
    // For all other requests, pass them to Next.js handler
    console.log('⚡ Passing to Next.js handler');
    return handler(request, env, ctx);
  }
};