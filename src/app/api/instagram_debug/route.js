// Create: app/api/instagram-debug/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('🔍 Debug Route Started');
    
    // Check environment variables
    const hasToken = !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const tokenLength = process.env.INSTAGRAM_ACCESS_TOKEN?.length || 0;
    
    console.log('Environment check:', { hasToken, tokenLength });
    
    if (!hasToken) {
      return NextResponse.json({
        error: 'No Instagram token found',
        env: {
          hasToken: false,
          nodeEnv: process.env.NODE_ENV,
          availableEnvVars: Object.keys(process.env).filter(key => 
            key.includes('INSTAGRAM') || key.includes('NEXT')
          )
        }
      }, { status: 500 });
    }
    
    // Simple token test
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const testUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
    
    console.log('Testing token...');
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('Token test response:', { 
      status: response.status, 
      ok: response.ok,
      data: data 
    });
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data,
      env: {
        hasToken: true,
        tokenLength: tokenLength,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Debug route error:', error);
    
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      env: {
        hasToken: !!process.env.INSTAGRAM_ACCESS_TOKEN,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}