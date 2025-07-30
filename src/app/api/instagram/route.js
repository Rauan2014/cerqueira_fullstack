import { NextResponse } from 'next/server';

//export const runtime = 'edge';

export async function GET(request, context) {
  // Envolvemos todo o código em um bloco try...catch para capturar qualquer erro.
  try {
    console.log('[API INSTAGRAM] Rota iniciada.');

    // Acessa o token de acesso. Esta é a forma correta para o ambiente da Cloudflare.
    const accessToken = context.env.INSTAGRAM_ACCESS_TOKEN;

    // 1. Verifica se o token foi encontrado
    if (!accessToken) {
      console.error('[API INSTAGRAM] ERRO: A variável INSTAGRAM_ACCESS_TOKEN não foi encontrada no ambiente da Cloudflare.');
      // Retorna um erro claro em formato JSON em vez de travar o servidor
      return NextResponse.json(
        { error: 'Configuração do servidor incorreta. O token de acesso do Instagram não está definido.' },
        { status: 500 }
      );
    }
    
    console.log('[API INSTAGRAM] Token de acesso encontrado. Prosseguindo...');

    // 2. Define os parâmetros para a chamada da API
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url}';
    const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}`;
    
    console.log('[API INSTAGRAM] Fazendo a chamada para a API do Instagram...');

    // 3. Faz a chamada para a API do Instagram
    const response = await fetch(url);

    // 4. Verifica se a chamada foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API INSTAGRAM] ERRO da API do Instagram:', errorData);
      return NextResponse.json(
        { error: `Falha ao comunicar com a API do Instagram: ${errorData.error?.message || 'Erro desconhecido'}` },
        { status: response.status }
      );
    }
    
    console.log('[API INSTAGRAM] Chamada para a API bem-sucedida. Processando dados...');
    
    const { data: posts } = await response.json();

    // 5. Formata a resposta
    const formattedPosts = posts.map(post => {
      let images = [];
      if (post.media_type === 'CAROUSEL_ALBUM') {
        images = post.children.data.map(child => child.media_type === 'VIDEO' ? child.thumbnail_url : child.media_url);
      } else if (post.media_type === 'IMAGE') {
        images.push(post.media_url);
      } else if (post.media_type === 'VIDEO') {
        images.push(post.thumbnail_url);
      }

      return {
          id: post.id,
          legenda: post.caption,
          images: images,
          mediaType: post.media_type,
          permalink: post.permalink,
          data: post.timestamp,
      };
    });

    console.log(`[API INSTAGRAM] Processamento finalizado. Retornando ${formattedPosts.length} posts.`);

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    // Se qualquer erro inesperado acontecer, ele será capturado aqui.
    console.error('[API INSTAGRAM] ERRO INESPERADO NA ROTA:', error);
    
    // Retorna uma resposta JSON com o erro detalhado.
    return NextResponse.json(
      { 
        error: 'Ocorreu um erro crítico no servidor.',
        errorMessage: error.message,
        errorStack: error.stack // Opcional: pode ajudar na depuração
      },
      { status: 500 }
    );
  }
}