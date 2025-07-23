# Configuração de Domínio Personalizado com Cloudflare

Este documento explica como configurar um domínio personalizado para o site da Cerqueira Psicologia usando o Cloudflare.

## Pré-requisitos

1. Um domínio registrado (ex: cerqueirapsicologia.com.br)
2. Uma conta no Cloudflare
3. Aplicação implantada no Cloudflare Workers

## Passos para Configuração

### 1. Adicionar domínio ao Cloudflare

1. Faça login na sua conta do Cloudflare
2. Clique em "Adicionar um Site"
3. Digite seu domínio e clique em "Adicionar Site"
4. Selecione o plano gratuito (ou outro plano conforme necessidade)
5. Siga as instruções para configurar os servidores DNS do seu domínio para apontar para o Cloudflare

### 2. Configurar Workers Routes

1. No painel do Cloudflare, vá para "Workers & Pages"
2. Selecione sua aplicação implantada
3. Vá para a aba "Configurações" e depois "Domínios personalizados"
4. Clique em "Adicionar domínio personalizado"
5. Digite seu domínio (ex: cerqueirapsicologia.com.br) ou um subdomínio (ex: www.cerqueirapsicologia.com.br)
6. Siga as instruções para verificar a propriedade do domínio

### 3. Configurar DNS Records

1. No painel do Cloudflare, vá para a seção "DNS"
2. Adicione um registro CNAME:
   - Nome: www (ou @ para o domínio raiz)
   - Conteúdo: [seu-worker].workers.dev
   - Proxy status: Proxied (ativado)
   - TTL: Auto

### 4. Configurar SSL/TLS

1. No painel do Cloudflare, vá para a seção "SSL/TLS"
2. Defina o modo SSL como "Full" ou "Full (Strict)"
3. Certifique-se de que o certificado SSL está ativo para seu domínio

### 5. Atualizar wrangler.toml

Adicione a configuração de domínio personalizado ao arquivo wrangler.toml:

```toml
[env.production]
routes = [
  { pattern = "cerqueirapsicologia.com.br/*", zone_id = "seu-zone-id" },
  { pattern = "www.cerqueirapsicologia.com.br/*", zone_id = "seu-zone-id" }
]
```

### 6. Implantar com o Domínio Personalizado

Execute o comando de implantação para produção:

```bash
npx wrangler deploy --env production
```

## Verificação

Após a configuração, acesse seu domínio personalizado  para verificar se o site está funcionando corretamente.

## Solução de Problemas

- Se o site não estiver acessível, verifique os registros DNS e certifique-se de que estão configurados corretamente
- Verifique se o SSL está ativo e funcionando
- Consulte os logs do Workers para identificar possíveis erros
