import { NextResponse } from 'next/server';

// REMOVE THIS LINE - Edge runtime is causing issues on Cloudflare
// export const runtime = 'edge';

function debugLog(message, data = null) {
  console.log(`[Instagram API Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

async function validateAccessToken(accessToken) {
  try {
    const url = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Token validation failed: ${data.error?.message || 'Unknown error'}`);
    }
    
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function getInstagramProfile(accessToken) {
  try {
    const fieldsToFetch = [
      'account_type',
      'id',
      'media_count',
      'username'
    ].join(',');
    
    const url = `https://graph.instagram.com/me?fields=${fieldsToFetch}&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Profile fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Error connecting to Instagram: ${error.message}`);
  }
}

async function getInstagramMedia(accessToken, limit = 25, after = null) {
  try {
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
    
    if (!response.ok) {
      console.error('Instagram Media API error:', data);
      throw new Error(`Media fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return {
      data: data.data || [],
      paging: data.paging || {}
    };
  } catch (error) {
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
    console.log('Instagram API request started');
    
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug');
    const mediaId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit')) || 25;
    const after = searchParams.get('after');
    
    // Enhanced debug mode for Cloudflare testing
    if (debug === 'true') {
      const hasToken = !!process.env.INSTAGRAM_ACCESS_TOKEN;
      const tokenLength = process.env.INSTAGRAM_ACCESS_TOKEN?.length || 0;
      const allEnvVars = Object.keys(process.env);
      const instagramVars = allEnvVars.filter(key => key.includes('INSTAGRAM'));
      
      console.log('Debug mode - Token check:', { hasToken, tokenLength });
      
      // If token exists, test it
      if (hasToken) {
        try {
          const testUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;
          const testResponse = await fetch(testUrl);
          const testData = await testResponse.json();
          
          return NextResponse.json({
            debug: true,
            platform: 'cloudflare-node',
            environment: process.env.NODE_ENV,
            token: {
              found: true,
              length: tokenLength,
              valid: testResponse.ok
            },
            instagramTest: {
              status: testResponse.status,
              success: testResponse.ok,
              data: testResponse.ok ? testData : null,
              error: !testResponse.ok ? testData : null
            },
            environmentVariables: {
              instagram: instagramVars,
              total: allEnvVars.length
            }
          });
        } catch (testError) {
          return NextResponse.json({
            debug: true,
            platform: 'cloudflare-node',
            token: { found: true, length: tokenLength },
            error: 'Failed to test Instagram API',
            details: testError.message
          });
        }
      } else {
        return NextResponse.json({
          debug: true,
          platform: 'cloudflare-node',
          environment: process.env.NODE_ENV,
          token: { found: false },
          environmentVariables: {
            instagram: instagramVars,
            total: allEnvVars.length,
            available: allEnvVars.slice(0, 10) // Show first 10 for debugging
          },
          error: 'INSTAGRAM_ACCESS_TOKEN not found in environment'
        });
      }
    }
    
    // Regular API logic
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('Instagram Access Token not found');
      return NextResponse.json(
        { 
          error: 'Instagram Access Token not configured',
          debug: {
            hasToken: false,
            platform: 'cloudflare-node',
            suggestion: 'Check Cloudflare Pages environment variables'
          }
        },
        { status: 500 }
      );
    }
    
    // Validate token
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { 
          error: `Invalid access token: ${tokenValidation.error}`,
          debug: { tokenValid: false, platform: 'cloudflare-node' }
        },
        { status: 401 }
      );
    }
    
    // Get profile and media
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
        platform: 'cloudflare-node'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Instagram API error:', error);
    
    return NextResponse.json(
      { 
        error: `Error processing request: ${error.message}`,
        debug: {
          errorType: error.constructor.name,
          platform: 'cloudflare-node',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}