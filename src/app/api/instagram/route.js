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

// POST function for creating Instagram media (publishing posts)
export async function POST(request) {
  try {
    debugLog('=== Instagram API POST Request Started ===');
    
    const body = await request.json();
    const { media_type, media_url, caption, access_token } = body;
    
    debugLog('POST request parameters:', { 
      media_type, 
      hasMediaUrl: !!media_url,
      hasCaption: !!caption,
      hasAccessToken: !!access_token
    });
    
    // Use provided access token or fallback to environment variable
    const accessToken = access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      debugLog('ERROR: No access token provided');
      return NextResponse.json(
        { 
          error: 'Access token required for posting',
          debug: {
            hasToken: false,
            providedInRequest: !!access_token,
            envVarPresent: !!process.env.INSTAGRAM_ACCESS_TOKEN
          }
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!media_type || !media_url) {
      debugLog('ERROR: Missing required fields');
      return NextResponse.json(
        { 
          error: 'media_type and media_url are required',
          debug: {
            receivedFields: Object.keys(body),
            missingFields: [
              !media_type && 'media_type',
              !media_url && 'media_url'
            ].filter(Boolean)
          }
        },
        { status: 400 }
      );
    }
    
    // Validate access token
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      debugLog('Token validation failed for POST');
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
    
    debugLog('Token validation successful for POST');
    
    // Step 1: Create media container
    debugLog('Creating media container...');
    const containerUrl = `https://graph.instagram.com/me/media`;
    const containerParams = new URLSearchParams({
      access_token: accessToken,
      media_type: media_type,
      media_url: media_url
    });
    
    if (caption) {
      containerParams.append('caption', caption);
    }
    
    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: containerParams
    });
    
    const containerData = await containerResponse.json();
    
    debugLog('Container creation response:', {
      status: containerResponse.status,
      data: containerData
    });
    
    if (!containerResponse.ok) {
      throw new Error(`Container creation failed: ${containerData.error?.message || 'Unknown error'}`);
    }
    
    const containerId = containerData.id;
    debugLog('Media container created successfully:', { containerId });
    
    // Step 2: Publish the media
    debugLog('Publishing media...');
    const publishUrl = `https://graph.instagram.com/me/media_publish`;
    const publishParams = new URLSearchParams({
      access_token: accessToken,
      creation_id: containerId
    });
    
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: publishParams
    });
    
    const publishData = await publishResponse.json();
    
    debugLog('Publish response:', {
      status: publishResponse.status,
      data: publishData
    });
    
    if (!publishResponse.ok) {
      throw new Error(`Publishing failed: ${publishData.error?.message || 'Unknown error'}`);
    }
    
    const mediaId = publishData.id;
    debugLog('Media published successfully:', { mediaId });
    
    // Step 3: Fetch the published media details
    debugLog('Fetching published media details...');
    const publishedMedia = await getSpecificInstagramMedia(mediaId, accessToken);
    const formattedMedia = formatInstagramMedia([publishedMedia])[0];
    
    const response = {
      success: true,
      media: formattedMedia,
      containerId,
      mediaId,
      debug: {
        tokenValid: true,
        containerCreated: true,
        mediaPublished: true,
        originalData: publishedMedia
      }
    };
    
    debugLog('=== Instagram API POST Request Completed Successfully ===');
    return NextResponse.json(response);
    
  } catch (error) {
    debugLog('=== Instagram API POST Request Failed ===');
    debugLog('POST error:', error.message);
    console.error('Complete POST error stack:', error);
    
    return NextResponse.json(
      { 
        error: `Error creating Instagram post: ${error.message}`,
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

// PUT function for updating Instagram media (mainly for updating captions)
export async function PUT(request) {
  try {
    debugLog('=== Instagram API PUT Request Started ===');
    
    const body = await request.json();
    const { media_id, caption, access_token } = body;
    
    debugLog('PUT request parameters:', { 
      media_id,
      hasCaption: !!caption,
      hasAccessToken: !!access_token
    });
    
    // Use provided access token or fallback to environment variable
    const accessToken = access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      debugLog('ERROR: No access token provided for PUT');
      return NextResponse.json(
        { 
          error: 'Access token required for updating posts',
          debug: {
            hasToken: false,
            providedInRequest: !!access_token,
            envVarPresent: !!process.env.INSTAGRAM_ACCESS_TOKEN
          }
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!media_id) {
      debugLog('ERROR: Missing media_id');
      return NextResponse.json(
        { 
          error: 'media_id is required for updating posts',
          debug: {
            receivedFields: Object.keys(body),
            missingFields: ['media_id']
          }
        },
        { status: 400 }
      );
    }
    
    if (!caption) {
      debugLog('ERROR: Missing caption');
      return NextResponse.json(
        { 
          error: 'caption is required for updating posts',
          debug: {
            receivedFields: Object.keys(body),
            missingFields: ['caption']
          }
        },
        { status: 400 }
      );
    }
    
    // Validate access token
    const tokenValidation = await validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      debugLog('Token validation failed for PUT');
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
    
    debugLog('Token validation successful for PUT');
    
    // Check if media exists and get current details
    debugLog('Fetching current media details...');
    let currentMedia;
    try {
      currentMedia = await getSpecificInstagramMedia(media_id, accessToken);
      debugLog('Current media found:', {
        id: currentMedia.id,
        currentCaption: currentMedia.caption,
        mediaType: currentMedia.media_type
      });
    } catch (error) {
      debugLog('Media not found:', error.message);
      return NextResponse.json(
        { 
          error: `Media not found: ${error.message}`,
          debug: {
            mediaId: media_id,
            tokenValid: true
          }
        },
        { status: 404 }
      );
    }
    
    // Update media caption
    debugLog('Updating media caption...');
    const updateUrl = `https://graph.instagram.com/${media_id}`;
    const updateParams = new URLSearchParams({
      access_token: accessToken,
      caption: caption
    });
    
    const updateResponse = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: updateParams
    });
    
    const updateData = await updateResponse.json();
    
    debugLog('Update response:', {
      status: updateResponse.status,
      data: updateData
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateData.error?.message || 'Unknown error'}`);
    }
    
    // Fetch updated media details
    debugLog('Fetching updated media details...');
    const updatedMedia = await getSpecificInstagramMedia(media_id, accessToken);
    const formattedMedia = formatInstagramMedia([updatedMedia])[0];
    
    const response = {
      success: true,
      media: formattedMedia,
      changes: {
        caption: {
          old: currentMedia.caption,
          new: caption
        }
      },
      debug: {
        tokenValid: true,
        mediaFound: true,
        updateSuccessful: updateData.success || true,
        originalData: updatedMedia
      }
    };
    
    debugLog('=== Instagram API PUT Request Completed Successfully ===');
    return NextResponse.json(response);
    
  } catch (error) {
    debugLog('=== Instagram API PUT Request Failed ===');
    debugLog('PUT error:', error.message);
    console.error('Complete PUT error stack:', error);
    
    return NextResponse.json(
      { 
        error: `Error updating Instagram post: ${error.message}`,
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