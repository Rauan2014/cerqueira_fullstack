import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Função para buscar os posts do Instagram
async function getInstagramMedia(accessToken, limit, after) {
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{id,media_type,media_url,thumbnail_url}';
  let url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;
  if (after) {
    url += `&after=${after}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Instagram Media API Error:', errorData);
    throw new Error(`Erro ao buscar mídia do Instagram: ${errorData.error?.message || response.statusText}`);
  }
  return response.json();
}

// Função para formatar os dados recebidos
function formatInstagramMedia(mediaData) {
  return mediaData.map(item => {
    const images = [];
    if (item.media_type === 'CAROUSEL_ALBUM' && item.children?.data) {
      item.children.data.forEach(child => {
        if (child.media_type === 'IMAGE' && child.media_url) {
          images.push(child.media_url);
        } else if (child.media_type === 'VIDEO' && child.thumbnail_url) {
          images.push(child.thumbnail_url); // Usa thumbnail para vídeos no carrossel
        }
      });
    } else if (item.media_type === 'IMAGE' && item.media_url) {
      images.push(item.media_url);
    } else if (item.media_type === 'VIDEO' && item.thumbnail_url) {
      images.push(item.thumbnail_url);
    }

    return {
      id: item.id,
      titulo: item.caption?.substring(0, 50).split('\n')[0] || 'Post sem título',
      data: item.timestamp,
      legenda: item.caption || '',
      images: images,
      mediaType: item.media_type,
      mediaUrl: item.media_url,
      thumbnailUrl: item.thumbnail_url,
      permalink: item.permalink,
      username: item.username,
      isCarousel: item.media_type === 'CAROUSEL_ALBUM'
    };
  });
}

// Função principal da rota GET
export async function GET(request, context) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 25;
    const after = searchParams.get('after');

    // ✅ Acessa o token diretamente do contexto da Cloudflare.
    const accessToken = context.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('INSTAGRAM_ACCESS_TOKEN não encontrado no ambiente do servidor.');
      return NextResponse.json({ error: 'Configuração do servidor incompleta: Token do Instagram não encontrado.' }, { status: 500 });
    }
    
    // Busca os dados da API do Instagram
    const mediaResponse = await getInstagramMedia(accessToken, limit, after);
    const formattedPosts = formatInstagramMedia(mediaResponse.data || []);

    return NextResponse.json({
      posts: formattedPosts,
      paging: mediaResponse.paging || {}
    });

  } catch (error) {
    console.error('Erro na rota /api/instagram:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}