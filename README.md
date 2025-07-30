# README - Cerqueira Psicologia

Este é o repositório do site da Cerqueira Psicologia, desenvolvido com Next.js e Vercel.

## Visão Geral

O site da Cerqueira Psicologia é uma aplicação fullstack que inclui:

- Página inicial com carrossel de imagens e mapa interativo
- Página de blog com integração de posts do Instagram
- Página de especialidades
- Sistema de autenticação para área administrativa
- Suporte para domínio personalizado

## Tecnologias Utilizadas

- **Frontend**: Next.js, React
- **Backend**: API Routes do Next.js
- **Autenticação**: JWT
- **Hospedagem**: Vercel
- **Mapas**: OpenStreetMap via Leaflet

## Estrutura do Projeto

```
cerqueira-fullstack/
├── docs/                      # Documentação
├── public/                    # Arquivos estáticos
│   └── images/
├── scripts/                   # Scripts de utilidade
│   └── test.sh
├── src/
│   ├── app/                   # Páginas e API Routes
│   │   ├── api/
│   │   ├── blog/
│   │   └── especialidades/
│   ├── components/            # Componentes React
│   │   ├── BlogPage/
│   │   ├── EspecialidadesPage/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── HomePage/
│   │   ├── ImageCarousel/
│   │   ├── InstagramPost/
│   │   ├── Map/
│   │   ├── Navigation/
│   │   └── SocialLinks/
│   └── middleware.js          # Middleware de autenticação
```

## Instalação e Execução Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse http://localhost:3000

## Implantação

A implantação é feita automaticamente pela Vercel a cada push para a branch `main`.

## Testes

Para executar os testes automatizados:

```bash
bash scripts/test.sh
```

## Licença

Todos os direitos reservados © 2025 Cerqueira Psicologia
