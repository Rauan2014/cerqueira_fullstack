import { NextResponse } from 'next/server';
import jwt from '@tsndr/cloudflare-worker-jwt';

/**
 * @typedef {import('next/server').NextRequest} NextRequest
 * @typedef {import('next/server').NextResponse} NextResponse
 * @typedef {{ env: { DB: any, JWT_SECRET: string }, params?: Record<string, string | string[]> }} RouteContext
 */

// The JWT_SECRET must be available in the Cloudflare environment.
// Note: This library expects the secret to be a string, not a TextEncoder object.

/**
 * Wraps an API route handler with JWT authentication.
 * @param {(request: NextRequest, context: RouteContext) => Promise<NextResponse>} handler The original API route handler.
 * @returns {(request: NextRequest, context: RouteContext) => Promise<NextResponse>} The wrapped handler with authentication.
 */
export function withAuth(handler) {
  return async (request, context) => {
    // Get the secret from the Cloudflare environment context
    const JWT_SECRET = context.env.JWT_SECRET || 'cerqueira-psicologia-secret-key-2025';

    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token não fornecido.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Use the new library to verify the token
      const isValid = await jwt.verify(token, JWT_SECRET);

      if (!isValid) {
        throw new Error('Token inválido');
      }

      // Decode the token to get the payload
      const decoded = jwt.decode(token);
      
      // Add user info to the context for the handler to use
      context.user = decoded.payload;

      // Proceed to the original handler
      return handler(request, context);
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token inválido ou expirado.' },
        { status: 401 }
      );
    }
  };
}