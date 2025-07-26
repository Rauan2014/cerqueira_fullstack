import { NextResponse } from 'next/server';

export const runtime = 'edge'

const API_BASE_URL = 'https://graph.instagram.com';
const CACHE_REVALIDATE_SECONDS = 900; // 15 minutes

// Helper to fetch from the Instagram API
async function instagramApiRequest(endpoint: string, params: Record<string, string>) {
  // In Cloudflare, environment variables are available on process.env
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Instagram Access Token is not configured.');
  }

  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}${endpoint}?${queryParams.toString()}&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error?.message || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
}

// The GET request handler for the /api/instagram route
export async function GET(request: Request) {
  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}';
    const media = await instagramApiRequest('/me/media', { fields, limit: '25' });

    // Format the response if needed, or return directly
    const formattedPosts = media.data.map((item: any) => ({
      id: item.id,
      legenda: item.caption || '',
      images: item.media_type === 'CAROUSEL_ALBUM' 
        ? item.children.data.map((child: any) => child.media_url) 
        : [item.media_url],
      mediaType: item.media_type,
      permalink: item.permalink,
    }));

    return NextResponse.json(
      { posts: formattedPosts },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_REVALIDATE_SECONDS}, s-maxage=${CACHE_REVALIDATE_SECONDS}`,
        },
      }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to fetch from Instagram: ${error.message}` },
      { status: 500 }
    );
  }
}