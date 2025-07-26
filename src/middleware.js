import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Chave secreta para verificação de tokens JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cerqueira-psicologia-secret-key-2025'
);

// Middleware para verificar autenticação
export async function middleware(request) {
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

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(decoded.id));
    requestHeaders.set('x-user-email', String(decoded.email));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('JWT Verification Error:', error.code, error.message);
    return NextResponse.json(
      { error: 'Acesso não autorizado. Token inválido ou expirado.' },
      { status: 401 }
    );
  }
}

// Configurar quais rotas devem ser protegidas pelo middleware
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/contato/admin/:path*'
  ],
};