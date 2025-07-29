import { NextResponse } from 'next/server';

// Keep edge runtime for Cloudflare compatibility
export const runtime = 'edge';

function debugLog(message, data = null) {
  console.log(`[Instagram API Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Function to get environment variables in Cloudflare Workers context
function getCloudflareEnv() {
  // Try different ways to access environment in Cloudflare Workers
  if (typeof globalThis !== 'undefined' && globalThis.process?.env) {
    return globalThis.process.env;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  
  // For Cloudflare Workers, env might be passed differently
  return {};
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

export async function GET(request, context) {
  try {
    debugLog('=== Instagram API GET Request Started ===');
    
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug');
    const mediaId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit')) || 25;
    const after = searchParams.get('after');
    
    // Get environment variables (Cloudflare Workers style)
    const env = getCloudflareEnv();
    
    // Try multiple ways to get the access token in Cloudflare environment
    let accessToken = env.INSTAGRAM_ACCESS_TOKEN || 
                      process.env?.INSTAGRAM_ACCESS_TOKEN ||
                      context?.env?.INSTAGRAM_ACCESS_TOKEN;
    
    // Enhanced debug mode for Cloudflare
    if (debug === 'true') {
      const allEnvKeys = Object.keys(env);
      const instagramKeys = allEnvKeys.filter(key => key.includes('INSTAGRAM'));
      
      debugLog('Debug mode activated', {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        platform: 'cloudflare-edge',
        envKeys: allEnvKeys.length,
        instagramKeys: instagramKeys,
        contextKeys: context ? Object.keys(context) : [],
        hasProcessEnv: !!process.env,
        hasGlobalThis: !!globalThis.process?.env
      });
      
      if (accessToken) {
        try {
          const testUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
          const testResponse = await fetch(testUrl);
          const testData = await testResponse.json();
          
          return NextResponse.json({
            debug: true,
            platform: 'cloudflare-pages',
            runtime: 'edge',
            token: {
              found: true,
              length: accessToken.length,
              valid: testResponse.ok,
              preview: accessToken.substring(0, 15) + '...'
            },
            instagramTest: {
              status: testResponse.status,
              success: testResponse.ok,
              data: testResponse.ok ? testData : null,
              error: !testResponse.ok ? testData : null
            },
            environment: {
              totalEnvVars: allEnvKeys.length,
              instagramVars: instagramKeys,
              hasContext: !!context,
              hasProcessEnv: !!process.env
            }
          });
        } catch (testError) {
          return NextResponse.json({
            debug: true,
            platform: 'cloudflare-pages',
            error: 'Failed to test Instagram API',
            details: testError.message,
            token: { found: true, length: accessToken.length }
          });
        }
      } else {
        return NextResponse.json({
          debug: true,
          platform: 'cloudflare-pages',
          runtime: 'edge',
          token: { found: false },
          environment: {
            totalEnvVars: allEnvKeys.length,
            instagramVars: instagramKeys,
            availableKeys: allEnvKeys.slice(0, 10),
            hasContext: !!context,
            hasProcessEnv: !!process.env,
            contextKeys: context ? Object.keys(context) : []
          },
          error: 'INSTAGRAM_ACCESS_TOKEN not found in any environment source',
          suggestions: [
            'Check Cloudflare Pages environment variables',
            'Ensure variable is set for Production environment',
            'Redeploy after setting environment variables',
            'Check if using Cloudflare Workers binding syntax'
          ]
        });
      }
    }
    
    // Check if access token is available
    if (!accessToken) {
      debugLog('ERROR: Instagram Access Token not found');
      return NextResponse.json(
        { 
          error: 'Instagram Access Token not configured in Cloudflare environment',
          debug: {
            hasToken: false,
            platform: 'cloudflare-pages',
            runtime: 'edge',
            suggestion: 'Check Cloudflare Pages environment variables and redeploy'
          }
        },
        { status: 500 }
      );
    }
    
    debugLog('Access token found:', { length: accessToken.length });
    
    // Validate access token
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      debugLog('Token validation failed');
      return NextResponse.json(
        { 
          error: `Invalid access token: ${tokenValidation.error}`,
          debug: {
            tokenValid: false,
            platform: 'cloudflare-pages',
            tokenError: tokenValidation.error
          }
        },
        { status: 401 }
      );
    }
    
    debugLog('Token validation successful');
    
    // If specific media ID is requested
    if (mediaId) {
      debugLog(`Fetching specific media: ${mediaId}`);
      try {
        const mediaData = await getSpecificInstagramMedia(mediaId, accessToken);
        const formattedMedia = formatInstagramMedia([mediaData])[0];
        debugLog('Specific media fetch successful');
        return NextResponse.json(formattedMedia);
      } catch (error) {
        debugLog('Specific media fetch failed:', error.message);
        return NextResponse.json(
          { error: error.message, debug: { mediaId, platform: 'cloudflare-pages' } },
          { status: 404 }
        );
      }
    }
    
    // Fetch user profile
    debugLog('Fetching user profile...');
    const profile = await getInstagramProfile(accessToken);
    
    // Fetch all media
    debugLog('Fetching media posts...');
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
        platform: 'cloudflare-pages',
        runtime: 'edge'
      }
    };
    
    debugLog('=== Instagram API GET Request Completed Successfully ===');
    return NextResponse.json(response);
    
  } catch (error) {
    debugLog('=== Instagram API GET Request Failed ===');
    debugLog('Final error:', error.message);
    console.error('Complete error stack:', error);
    
    return NextResponse.json(
      { 
        error: `Error processing request: ${error.message}`,
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          platform: 'cloudflare-pages',
          runtime: 'edge',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Helper function for specific media
async function getSpecificInstagramMedia(mediaId, accessToken) {
  try {
    debugLog(`Fetching specific media: ${mediaId}`);
    
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
    
    const url = `https://graph.instagram.com/${mediaId}?fields=${fieldsToFetch}&access_token=${accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Specific media response:', { status: response.status });
    
    if (!response.ok) {
      throw new Error(`Error fetching media: ${data.error?.message || 'Media not found'}`);
    }
    
    return data;
  } catch (error) {
    debugLog('Specific media fetch error:', error.message);
    throw new Error(`Error fetching specific media: ${error.message}`);
  }
}