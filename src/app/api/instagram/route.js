import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  // This is a minimal test to see if a basic route works.
  return NextResponse.json({ 
    message: "Minimal API route is working correctly." 
  });
}