import { NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth'; // Import the wrapper

export const runtime = 'edge';

// Original GET handler
async function getConfig(request, context) {
  try {
    const db = context.env.DB;
    const config = await db.prepare('SELECT * FROM site_config WHERE id = 1').first();
    
    if (!config) {
      return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 404 });
    }
    
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro ao processar a solicitação' }, { status: 500 });
  }
}

// Original PUT handler
async function updateConfig(request, context) {
  try {
    const data = await request.json();
    const db = context.env.DB;
    
    // ... (rest of your PUT logic is fine)
    const requiredFields = ['nome', 'endereco', 'telefone', 'email', 'instagram', 'whatsapp'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    const result = await db.prepare(`
      UPDATE site_config 
      SET nome = ?, endereco = ?, telefone = ?, email = ?, 
          instagram = ?, whatsapp = ?, mapa_latitude = ?, 
          mapa_longitude = ?, mapa_zoom = ?
      WHERE id = 1
    `).bind(
      data.nome, data.endereco, data.telefone, data.email,
      data.instagram, data.whatsapp, data.mapa_latitude || -23.5284,
      data.mapa_longitude || -46.3437, data.mapa_zoom || 15
    ).run();
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Configurações não encontradas para atualizar' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Configurações atualizadas com sucesso' });
    
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao processar a solicitação' }, { status: 500 });
  }
}

// Wrap the handlers with authentication and export them
export const GET = withAuth(getConfig);
export const PUT = withAuth(updateConfig);