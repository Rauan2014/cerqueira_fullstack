#!/bin/bash

# Script para implantar a aplicação no Cloudflare Workers

echo "Iniciando implantação da aplicação Cerqueira Psicologia..."

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build

# Verificar se a construção foi bem-sucedida
if [ $? -ne 0 ]; then
  echo "Erro durante a construção da aplicação. Abortando implantação."
  exit 1
fi

# Implantar para ambiente de produção
echo "Implantando para o Cloudflare Workers..."
npx wrangler deploy --env production

echo "Implantação concluída!"
echo "Acesse seu domínio personalizado para verificar a aplicação."
