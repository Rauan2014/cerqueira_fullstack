#!/bin/bash

# Script para inicializar o banco de dados D1 do Cloudflare Workers

echo "Inicializando banco de dados para Cerqueira Psicologia..."

# Resetar o banco de dados local (se existir)
echo "Removendo estado anterior do banco de dados..."
rm -rf .wrangler/state/v3

# Executar o arquivo SQL inicial
echo "Aplicando migrações iniciais..."
npx wrangler d1 execute cerqueira-db --local --file=migrations/0001_initial.sql

echo "Banco de dados inicializado com sucesso!"
echo "Para iniciar o servidor de desenvolvimento, execute: npm run dev"
