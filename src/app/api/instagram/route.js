import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Enhanced logging function for debugging
function debugLog(message, data = null) {
  console.log(`[Instagram API Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Function to validate access token
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

// Enhanced function to get Instagram profile with more debugging
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
    debugLog('Profile API URL:', url.replace(accessToken, '[HIDDEN_TOKEN]'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Profile API Response Status:', response.status);
    debugLog('Profile API Response Data:', data);
    
    if (!response.ok) {
      throw new Error(`Profile fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    debugLog('Profile fetch error:', error.message);
    throw new Error(`Error connecting to Instagram: ${error.message}`);
  }
}

// Enhanced function to get Instagram media with comprehensive debugging
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
    
    debugLog('Media API URL:', url.replace(accessToken, '[HIDDEN_TOKEN]'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Media API Response Status:', response.status);
    debugLog('Media API Response Headers:', Object.fromEntries(response.headers.entries()));
    debugLog('Media API Raw Response:', data);
    
    if (!response.ok) {
      debugLog('Media API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      throw new Error(`Media fetch error: ${data.error?.message || 'Unknown error'}`);
    }
    
    debugLog('Media fetch successful:', {
      dataCount: data.data ? data.data.length : 0,
      hasPaging: !!data.paging,
      pagingInfo: data.paging
    });
    
    return {
      data: data.data || [],
      paging: data.paging || {}
    };
  } catch (error) {
    debugLog('Media fetch error:', error.message);
    throw new Error(`Error fetching Instagram posts: ${error.message}`);
  }
}

// Function to generate title from caption
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

// Enhanced function to format Instagram media with better error handling
function formatInstagramMedia(media) {
  debugLog('Formatting media data:', { mediaCount: media.length });
  
  const mediaArray = Array.isArray(media) ? media : [media];
  
  return mediaArray.map((item, index) => {
    debugLog(`Processing media item ${index + 1}:`, {
      id: item.id,
      media_type: item.media_type,
      hasCaption: !!item.caption,
      hasMediaUrl: !!item.media_url,
      hasChildren: !!(item.children && item.children.data)
    });
    
    const images = [];
    
    try {
      // Handle carousel posts
      if (item.media_type === 'CAROUSEL_ALBUM' && item.children && item.children.data) {
        debugLog(`Processing carousel with ${item.children.data.length} items`);
        item.children.data.forEach((child, childIndex) => {
          debugLog(`Carousel child ${childIndex + 1}:`, {
            id: child.id,
            media_type: child.media_type,
            hasMediaUrl: !!child.media_url,
            hasThumbnailUrl: !!child.thumbnail_url
          });
          
          if (child.media_type === 'IMAGE') {
            images.push(child.media_url);
          } else if (child.media_type === 'VIDEO' && child.thumbnail_url) {
            images.push(child.thumbnail_url);
          }
        });
      } else if (item.media_type === 'IMAGE') {
        debugLog('Processing single image');
        images.push(item.media_url);
      } else if (item.media_type === 'VIDEO' && item.thumbnail_url) {
        debugLog('Processing video with thumbnail');
        images.push(item.thumbnail_url);
      }
      
      const formattedItem = {
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
      
      debugLog(`Formatted item ${index + 1}:`, {
        id: formattedItem.id,
        imageCount: formattedItem.images.length,
        hasTitle: !!formattedItem.titulo,
        mediaType: formattedItem.mediaType
      });
      
      return formattedItem;
      
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

// Main GET function with comprehensive debugging
export async function GET(request) {
  try {
    debugLog('=== Instagram API GET Request Started ===');
    
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit')) || 25;
    const after = searchParams.get('after');
    
    debugLog('Request parameters:', { mediaId, limit, after });
    
    // Check if access token is configured
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      debugLog('ERROR: Instagram Access Token not configured');
      return NextResponse.json(
        { 
          error: 'Instagram Access Token not configured. Use token obtained via Instagram Login.',
          debug: {
            hasToken: false,
            envVarsPresent: {
              INSTAGRAM_CLIENT_ID: !!process.env.INSTAGRAM_CLIENT_ID,
              INSTAGRAM_CLIENT_SECRET: !!process.env.INSTAGRAM_CLIENT_SECRET,
              INSTAGRAM_REDIRECT_URI: !!process.env.INSTAGRAM_REDIRECT_URI
            }
          }
        },
        { status: 500 }
      );
    }
    
    debugLog('Access token present:', accessToken.substring(0, 10) + '...');
    
    // Validate access token first
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      debugLog('Token validation failed');
      return NextResponse.json(
        { 
          error: `Invalid access token: ${tokenValidation.error}`,
          debug: {
            tokenValid: false,
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
          { error: error.message, debug: { mediaId, tokenValid: true } },
          { status: 404 }
        );
      }
    }
    
    // Fetch user profile
    debugLog('Fetching user profile...');
    const profile = await getInstagramProfile(accessToken);
    debugLog('Profile fetch successful:', {
      username: profile.username,
      mediaCount: profile.media_count,
      accountType: profile.account_type
    });
    
    // Fetch all media
    debugLog('Fetching media posts...');
    const mediaResponse = await getInstagramMedia(accessToken, limit, after);
    debugLog('Media fetch completed:', {
      postsReturned: mediaResponse.data.length,
      hasPaging: !!mediaResponse.paging,
      nextPage: mediaResponse.paging?.next
    });
    
    const formattedMedia = formatInstagramMedia(mediaResponse.data);
    debugLog('Media formatting completed:', {
      formattedCount: formattedMedia.length,
      postsWithImages: formattedMedia.filter(p => p.images.length > 0).length,
      postsWithErrors: formattedMedia.filter(p => p.error).length
    });
    
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
        profileFetched: true,
        mediaFetched: true,
        originalMediaCount: mediaResponse.data.length,
        formattedMediaCount: formattedMedia.length,
        accountMediaCount: profile.media_count,
        requestParams: { limit, after }
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
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Function to get specific Instagram media with debugging
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
    debugLog('Specific media URL:', url.replace(accessToken, '[HIDDEN_TOKEN]'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    debugLog('Specific media response:', { status: response.status, data });
    
    if (!response.ok) {
      throw new Error(`Error fetching media: ${data.error?.message || 'Media not found'}`);
    }
    
    return data;
  } catch (error) {
    debugLog('Specific media fetch error:', error.message);
    throw new Error(`Error fetching specific media: ${error.message}`);
  }
}

// Keep existing POST and PUT functions unchanged
export async function POST(request) {
  // ... (same as original)
}

export async function PUT(request) {
  // ... (same as original)
}