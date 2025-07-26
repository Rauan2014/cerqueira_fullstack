import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Chave secreta para verificação de tokens JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cerqueira-psicologia-secret-key-2025'
);

/**
 * Wraps an API route handler with JWT authentication.
 * @param {function} handler The original API route handler.
 * @returns {function} The wrapped handler with authentication.
 */
export function withAuth(handler) {
  return async (request, context) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token não fornecido.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const { payload: decoded } = await jwtVerify(token, JWT_SECRET);
      
      // Add user info to the context for the handler to use
      context.user = decoded;

      // Proceed to the original handler
      return handler(request, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Token inválido ou expirado.' },
        { status: 401 }
      );
    }
  };
}