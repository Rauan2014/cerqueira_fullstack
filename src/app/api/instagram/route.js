// app/api/instagram-debug/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('🔍 Debug Route Started');
    
    // Check all environment variables
    const allEnvVars = Object.keys(process.env);
    const instagramEnvVars = allEnvVars.filter(key => key.includes('INSTAGRAM'));
    const nextEnvVars = allEnvVars.filter(key => key.includes('NEXT'));
    
    // Check specific Instagram token
    const hasToken = !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const tokenLength = process.env.INSTAGRAM_ACCESS_TOKEN?.length || 0;
    const tokenPreview = process.env.INSTAGRAM_ACCESS_TOKEN?.substring(0, 20) || 'none';
    
    console.log('Environment check:', { 
      hasToken, 
      tokenLength, 
      tokenPreview,
      instagramEnvVars,
      totalEnvVars: allEnvVars.length
    });
    
    // Test different ways to access env vars in edge runtime
    const envTests = {
      processEnv: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      globalProcessEnv: !!(globalThis.process?.env?.INSTAGRAM_ACCESS_TOKEN),
      directAccess: !!INSTAGRAM_ACCESS_TOKEN,
    };
    
    // If no token found, return early with diagnostic info
    if (!hasToken) {
      return NextResponse.json({
        error: 'No Instagram token found',
        platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
        environment: process.env.NODE_ENV,
        diagnostics: {
          hasToken: false,
          envTests,
          instagramEnvVars,
          nextEnvVars,
          totalEnvVars: allEnvVars.length,
          sampleEnvVars: allEnvVars.slice(0, 10), // First 10 env vars for reference
        },
        suggestions: [
          'Check Cloudflare Pages environment variables',
          'Verify variable name is exactly: INSTAGRAM_ACCESS_TOKEN',
          'Ensure variables are set for Production environment',
          'Redeploy after setting environment variables'
        ]
      }, { status: 500 });
    }
    
    // If token exists, test it with Instagram API
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const testUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
    
    console.log('Testing Instagram API with token...');
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('Instagram API test result:', { 
      status: response.status, 
      ok: response.ok,
      hasError: !!data.error
    });
    
    // Return comprehensive test results
    return NextResponse.json({
      success: response.ok,
      platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
      environment: process.env.NODE_ENV,
      token: {
        found: true,
        length: tokenLength,
        preview: tokenPreview + '...',
        valid: response.ok
      },
      instagramApi: {
        status: response.status,
        ok: response.ok,
        data: response.ok ? data : null,
        error: !response.ok ? data : null
      },
      diagnostics: {
        envTests,
        instagramEnvVars,
        nextEnvVars,
        totalEnvVars: allEnvVars.length
      }
    });
    
  } catch (error) {
    console.error('Debug route error:', error);
    
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      platform: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}