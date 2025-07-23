'use client';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Chave secreta para verificação de tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'cerqueira-psicologia-secret-key-2025';

// Middleware para verificar autenticação
export function middleware(request) {
  // Obter o token do cabeçalho Authorization
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Acesso não autorizado. Token não fornecido.' },
      { status: 401 }
    );
  }
  
  // Extrair o token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar informações do usuário ao cabeçalho da requisição
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-email', decoded.email);
    
    // Continuar com a requisição
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
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
    '/api/instagram/admin/:path*',
    '/api/contato/admin/:path*'
  ],
};
