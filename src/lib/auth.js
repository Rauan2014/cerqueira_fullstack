import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * @typedef {import('next/server').NextRequest} NextRequest
 * @typedef {import('next/server').NextResponse} NextResponse
 * @typedef {{ env: { DB: any, JWT_SECRET: string }, params?: Record<string, string | string[]> }} RouteContext
 */

// The JWT_SECRET must be available as an environment variable.
/**
 * Wraps an API route handler with JWT authentication.
 * @param {(request: NextRequest, context: RouteContext) => Promise<NextResponse>} handler The original API route handler.
 * @returns {(request: NextRequest, context: RouteContext) => Promise<NextResponse>} The wrapped handler with authentication.
 */
export function withAuth(handler) {
  return async (request, context) => {
    // Get the secret from the environment variables
    const JWT_SECRET = process.env.JWT_SECRET || 'cerqueira-psicologia-secret-key-2025';

    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token não fornecido.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the token using jsonwebtoken
      const decoded = jwt.verify(token, JWT_SECRET);

      // Add user info to the context for the handler to use
      context.user = decoded;

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