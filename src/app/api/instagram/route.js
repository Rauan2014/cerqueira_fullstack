import { NextResponse } from 'next/server';

// Remove edge runtime for Cloudflare compatibility
// export const runtime = 'edge';

function debugLog(message, data = null) {
  console.log(`[Instagram API Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

async function validateAccessToken(accessToken) {
  try {
    const url = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Token validation response:', data);
    
    if (!response.ok) {
      throw new Error(`Token validation failed: ${data.error?.message || 'Unknown error'}`);
    }
    
    return { valid: true, data };
  } catch (error) {
    debugLog('Token validation error:', error.message);
    return { valid: false, error: error.message };
  }
}

async function getInstagramProfile(accessToken) {
  try {
    debugLog('Fetching Instagram profile...');
    
    const fieldsToFetch = [
      'account_type',
      'id',
      'media_count',
      'username'
    ].join(',');
    
    const url = `https://graph.instagram.com/me?fields=${fieldsToFetch}&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Profile API Response Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Profile fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    debugLog('Profile fetch error:', error.message);
    throw new Error(`Error connecting to Instagram: ${error.message}`);
  }
}

async function getInstagramMedia(accessToken, limit = 25, after = null) {
  try {
    debugLog(`Fetching Instagram media - Limit: ${limit}, After: ${after}`);
    
    const fieldsToFetch = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'permalink',
      'thumbnail_url',
      'timestamp',
      'username',
      'children{id,media_type,media_url,thumbnail_url}'
    ].join(',');
    
    let url = `https://graph.instagram.com/me/media?fields=${fieldsToFetch}&limit=${limit}&access_token=${accessToken}`;
    
    if (after) {
      url += `&after=${after}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Media API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('Instagram Media API full error response:', data);
      throw new Error(`Media fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return {
      data: data.data || [],
      paging: data.paging || {}
    };
  } catch (error) {
    debugLog('Media fetch error:', error.message);
    throw new Error(`Error fetching Instagram posts: ${error.message}`);
  }
}

function generateTitleFromCaption(caption) {
  if (!caption || typeof caption !== 'string') {
    return 'Post without title';
  }
  
  const cleanCaption = caption.replace(/#\w+/g, '').replace(/@\w+/g, '').trim();
  
  if (cleanCaption.length <= 50) {
    return cleanCaption;
  }
  
  const sentences = cleanCaption.split(/[.!?]/);
  const firstSentence = sentences[0].trim();
  
  if (firstSentence.length > 0 && firstSentence.length <= 50) {
    return firstSentence;
  }
  
  return cleanCaption.substring(0, 47).trim() + '...';
}

function formatInstagramMedia(media) {
  const mediaArray = Array.isArray(media) ? media : [media];
  
  return mediaArray.map((item, index) => {
    const images = [];
    
    try {
      if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data) {
        item.children.data.forEach((child) => {
          if (child.media_type === 'IMAGE') {
            images.push(child.media_url);
          } else if (child.media_type === 'VIDEO' && child.thumbnail_url) {
            images.push(child.thumbnail_url);
          }
        });
      } else if (item.media_type === 'IMAGE') {
        images.push(item.media_url);
      } else if (item.media_type === 'VIDEO' && item.thumbnail_url) {
        images.push(item.thumbnail_url);
      }
      
      return {
        id: item.id,
        titulo: generateTitleFromCaption(item.caption),
        data: item.timestamp,
        legenda: item.caption || '',
        images: images,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        permalink: item.permalink,
        username: item.username,
        isCarousel: item.media_type === 'CAROUSEL_ALBUM'
      };
      
    } catch (error) {
      debugLog(`Error processing media item ${index + 1}:`, error.message);
      return {
        id: item.id || 'unknown',
        titulo: 'Error processing post',
        data: item.timestamp || new Date().toISOString(),
        legenda: item.caption || '',
        images: [],
        mediaType: item.media_type || 'unknown',
        mediaUrl: item.media_url || '',
        thumbnailUrl: item.thumbnail_url || '',
        permalink: item.permalink || '',
        username: item.username || '',
        isCarousel: false,
        error: error.message
      };
    }
  });
}

export async function GET(request) {
  try {
    debugLog('=== Instagram API GET Request Started ===');
    
    // Enhanced environment variable debugging for Cloudflare
    debugLog('Environment debug:', {
      nodeEnv: process.env.NODE_ENV,
      platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
      hasInstagramToken: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      tokenLength: process.env.INSTAGRAM_ACCESS_TOKEN?.length || 0,
      // Log first few chars of token for debugging (be careful in production)
      tokenPrefix: process.env.INSTAGRAM_ACCESS_TOKEN?.substring(0, 10) || 'none',
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('INSTAGRAM') || key.includes('NEXT')
      )
    });
    
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit')) || 25;
    const after = searchParams.get('after');
    
    // Try different ways to access the token (Cloudflare edge runtime issue)
    let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    // Fallback for edge runtime
    if (!accessToken && typeof EdgeRuntime !== 'undefined') {
      // Sometimes env vars are available differently in edge runtime
      accessToken = globalThis.process?.env?.INSTAGRAM_ACCESS_TOKEN;
    }
    
    debugLog('Token access attempt:', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      source: accessToken ? 'found' : 'missing'
    });
    
    if (!accessToken) {
      console.error('CRITICAL: Instagram Access Token not found in environment');
      return NextResponse.json(
        { 
          error: 'Instagram Access Token not configured in Cloudflare environment',
          debug: {
            hasToken: false,
            platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
            nodeEnv: process.env.NODE_ENV,
            availableEnvVars: Object.keys(process.env).filter(key => 
              key.includes('INSTAGRAM') || key.includes('NEXT')
            ),
            suggestion: 'Check Cloudflare Pages environment variables settings'
          }
        },
        { status: 500 }
      );
    }
    
    // Continue with existing logic...
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      debugLog('Token validation failed');
      return NextResponse.json(
        { 
          error: `Invalid access token: ${tokenValidation.error}`,
          debug: {
            tokenValid: false,
            tokenError: tokenValidation.error,
            platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node'
          }
        },
        { status: 401 }
      );
    }
    
    const profile = await getInstagramProfile(accessToken);
    const mediaResponse = await getInstagramMedia(accessToken, limit, after);
    const formattedMedia = formatInstagramMedia(mediaResponse.data);
    
    const response = {
      profile: {
        id: profile.id,
        username: profile.username,
        accountType: profile.account_type,
        mediaCount: profile.media_count
      },
      posts: formattedMedia,
      total: formattedMedia.length,
      paging: mediaResponse.paging,
      hasMore: !!mediaResponse.paging.next,
      debug: {
        tokenValid: true,
        platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
        cloudflareDeployment: true
      }
    };
    
    debugLog('=== Instagram API GET Request Completed Successfully ===');
    return NextResponse.json(response);
    
  } catch (error) {
    debugLog('=== Instagram API GET Request Failed ===');
    console.error('Complete error details:', {
      message: error.message,
      stack: error.stack,
      platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node'
    });
    
    return NextResponse.json(
      { 
        error: `Error processing request: ${error.message}`,
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
          timestamp: new Date().toISOString(),
          suggestion: 'Check Cloudflare Pages function logs for more details'
        }
      },
      { status: 500 }
    );
  }
}