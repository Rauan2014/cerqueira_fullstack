# Guia de Implantação e Manutenção

Este documento fornece instruções para implantar, testar e manter o site da Cerqueira Psicologia.

## Estrutura do Projeto

O site foi desenvolvido com Next.js e utiliza Cloudflare Workers para hospedagem, com banco de dados D1 para armazenamento de dados.

### Principais Componentes:
- **Frontend**: Next.js com componentes React
- **Backend**: API Routes do Next.js
- **Banco de Dados**: Cloudflare D1
- **Autenticação**: JWT para área administrativa

## Instruções de Implantação

### Pré-requisitos
- Node.js instalado
- Conta no Cloudflare
- Domínio registrado (opcional para domínio personalizado)

### Passos para Implantação

1. **Preparar o ambiente**:
   ```bash
   # Instalar dependências
   npm install
   ```

2. **Inicializar o banco de dados**:
   ```bash
   # Executar script de inicialização
   bash scripts/init-db.sh
   ```

3. **Testar a aplicação localmente**:
   ```bash
   # Executar script de testes
   bash scripts/test.sh
   
   # Iniciar servidor de desenvolvimento
   npm run dev
   ```

4. **Implantar para produção**:
   ```bash
   # Executar script de implantação
   bash scripts/deploy.sh
   ```

5. **Configurar domínio personalizado**:
   Siga as instruções detalhadas no arquivo `docs/cloudflare-custom-domain.md`

## Manutenção

### Atualização de Conteúdo

Para atualizar o conteúdo do site, você pode:

1. **Posts do Instagram**:
   - Acesse a área administrativa em `/admin` (use as credenciais fornecidas)
   - Adicione, edite ou remova posts conforme necessário

2. **Informações de Contato**:
   - Edite o arquivo de configuração ou use a interface administrativa

### Backup do Banco de Dados

Recomendamos fazer backups regulares do banco de dados:

```bash
# Exportar dados do banco
npx wrangler d1 export cerqueira-db --local > backup_$(date +%Y%m%d).sql
```

### Monitoramento

Utilize o painel do Cloudflare para monitorar:
- Tráfego do site
- Desempenho
- Erros e exceções

## Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com banco de dados**:
   - Verifique as configurações no arquivo `wrangler.toml`
   - Confirme se o banco de dados está ativo no painel do Cloudflare

2. **Problemas com domínio personalizado**:
   - Verifique as configurações DNS no Cloudflare
   - Confirme se os certificados SSL estão ativos

3. **Erros de autenticação**:
   - Verifique se o JWT_SECRET está configurado corretamente
   - Confirme se os tokens não estão expirados

## Contato para Suporte

Para suporte técnico, entre em contato com:
- Email: suporte@cerqueirapsicologia.com.br
- Telefone: (00) 99999-9999
