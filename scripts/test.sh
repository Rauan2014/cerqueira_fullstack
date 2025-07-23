#!/bin/bash

# Script para testar a aplicação antes da implantação

echo "Iniciando testes da aplicação Cerqueira Psicologia..."

# Verificar responsividade com Lighthouse
echo "Executando testes de responsividade com Lighthouse..."
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html --quiet --chrome-flags="--headless --no-sandbox"

# Verificar funcionalidades principais
echo "Verificando funcionalidades principais..."

# Iniciar o servidor de desenvolvimento
echo "Iniciando servidor de desenvolvimento para testes..."
npm run dev &
SERVER_PID=$!

# Aguardar o servidor iniciar
echo "Aguardando o servidor iniciar..."
sleep 10

# Testar páginas principais
echo "Testando acesso às páginas principais..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep 200 && echo "✅ Página inicial OK" || echo "❌ Erro na página inicial"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog | grep 200 && echo "✅ Página de blog OK" || echo "❌ Erro na página de blog"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/especialidades | grep 200 && echo "✅ Página de especialidades OK" || echo "❌ Erro na página de especialidades"

# Testar API endpoints
echo "Testando endpoints da API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/instagram | grep 200 && echo "✅ API Instagram OK" || echo "❌ Erro na API Instagram"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/config | grep 200 && echo "✅ API Config OK" || echo "❌ Erro na API Config"

# Encerrar o servidor
echo "Encerrando servidor de desenvolvimento..."
kill $SERVER_PID

echo "Testes concluídos!"
echo "Verifique o relatório do Lighthouse em ./lighthouse-report.html"
