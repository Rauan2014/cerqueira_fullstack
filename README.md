# README - Cerqueira Psicologia

Este é o repositório do site da Cerqueira Psicologia, desenvolvido com Next.js e Cloudflare Workers.

## Visão Geral

O site da Cerqueira Psicologia é uma aplicação fullstack que inclui:

- Página inicial com carrossel de imagens e mapa interativo
- Página de blog com integração de posts do Instagram
- Página de especialidades
- Sistema de autenticação para área administrativa
- Banco de dados D1 do Cloudflare para armazenamento de dados
- Suporte para domínio personalizado

## Tecnologias Utilizadas

- **Frontend**: Next.js, React
- **Backend**: API Routes do Next.js
- **Banco de Dados**: Cloudflare D1
- **Autenticação**: JWT
- **Hospedagem**: Cloudflare Workers
- **Mapas**: OpenStreetMap via Leaflet

## Estrutura do Projeto

```
cerqueira-fullstack/
├── docs/                      # Documentação
│   ├── cloudflare-custom-domain.md
│   └── deployment-guide.md
├── migrations/                # Migrações do banco de dados
│   └── 0001_initial.sql
├── public/                    # Arquivos estáticos
│   └── images/
├── scripts/                   # Scripts de utilidade
│   ├── deploy.sh
│   ├── init-db.sh
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
└── wrangler.toml              # Configuração do Cloudflare Workers
```

## Instalação e Execução Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicialize o banco de dados:
   ```bash
   bash scripts/init-db.sh
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse http://localhost:3000

## Implantação

Para implantar o site, siga as instruções detalhadas no arquivo `docs/deployment-guide.md`.

## Testes

Para executar os testes automatizados:

```bash
bash scripts/test.sh
```

## Configuração de Domínio Personalizado

Para configurar um domínio personalizado, siga as instruções no arquivo `docs/cloudflare-custom-domain.md`.

## Licença

Todos os direitos reservados © 2025 Cerqueira Psicologia
