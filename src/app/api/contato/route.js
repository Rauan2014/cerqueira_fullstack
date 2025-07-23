import { NextResponse } from 'next/server';

export const runtime = 'edge';
export async function POST(request) {
  try {
    const body = await request.json();

    // Sua validação está perfeita.
    if (!body.nome || !body.email || !body.mensagem) {
      return NextResponse.json(
        { error: 'Dados incompletos. Nome, email e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    // ✅ Este é o jeito correto de acessar o binding do banco de dados.
    // O 'DB' vem do nome do binding no seu arquivo wrangler.toml.
    const db = process.env.DB;

    // Sua lógica de inserção no banco de dados está correta.
    await db.prepare(
      `INSERT INTO mensagens_contato (nome, email, mensagem) VALUES (?, ?, ?)`
    ).bind(body.nome, body.email, body.mensagem).run();

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!'
    });

  } catch (error) {
    // É uma boa prática logar o erro para depuração.
    console.error('Erro ao processar mensagem de contato:', error);

    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}