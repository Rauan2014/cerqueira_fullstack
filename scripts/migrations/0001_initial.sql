-- Inicialização do banco de dados para Cerqueira Psicologia
-- Criação das tabelas principais

-- Tabela para configurações do site
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  mapa_latitude REAL NOT NULL,
  mapa_longitude REAL NOT NULL,
  mapa_zoom INTEGER NOT NULL
);

-- Tabela para imagens do carrossel
CREATE TABLE IF NOT EXISTS carousel_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  alt_text TEXT,
  ordem INTEGER NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT 1
);

-- Tabela para posts do Instagram (título será gerado automaticamente)
CREATE TABLE IF NOT EXISTS instagram_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT, -- Será gerado automaticamente a partir da legenda
  data TEXT NOT NULL,
  legenda TEXT NOT NULL, -- Campo obrigatório agora
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para imagens dos posts do Instagram
CREATE TABLE IF NOT EXISTS post_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  FOREIGN KEY (post_id) REFERENCES instagram_posts(id) ON DELETE CASCADE
);

-- Tabela para mensagens de contato
CREATE TABLE IF NOT EXISTS mensagens_contato (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lida BOOLEAN NOT NULL DEFAULT 0
);

-- Tabela para usuários administrativos
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  ativo BOOLEAN NOT NULL DEFAULT 1
);

-- Inserir dados iniciais de configuração
INSERT INTO site_config (id, nome, endereco, telefone, email, instagram, whatsapp, mapa_latitude, mapa_longitude, mapa_zoom)
VALUES (1, 'Cerqueira Psicologia', 'Rua Exemplo, 123 - Poá, SP', '(00)99999-99999', 'www.exemplo@email.com', '@exemplo234', '5500999999999', -23.5284, -46.3437, 15);

-- Inserir imagens iniciais do carrossel
INSERT INTO carousel_images (url, alt_text, ordem, ativo)
VALUES 
  ('./images/consultorio1.jpg', 'Recepção da clínica Cerqueira Psicologia', 1, 1),
  ('./images/consultorio2.jpg', 'Sala de terapia', 2, 1),
  ('./images/consultorio3.jpg', 'Consultório de psicologia', 3, 1);

-- Inserir posts iniciais do Instagram (sem título manual - será gerado automaticamente)
INSERT INTO instagram_posts (data, legenda)
VALUES 
  ('18/04/2025', 'Dicas para lidar com ansiedade no dia a dia. A ansiedade pode ser desafiadora, mas existem estratégias eficazes que podem ajudar. Pratique técnicas de respiração, mantenha uma rotina de exercícios e não hesite em buscar ajuda profissional. Compartilhe com quem precisa! #psicologia #saúdemental #ansiedade'),
  ('15/04/2025', 'Saúde mental no trabalho é fundamental para o nosso bem-estar geral. Como manter a saúde mental no ambiente de trabalho? Estabeleça limites saudáveis, pratique pausas regulares e comunique suas necessidades. Confira nossas dicas completas! #trabalho #saúdemental #bemestar'),
  ('10/04/2025', 'Relacionamentos saudáveis são construídos com base na comunicação efetiva e respeito mútuo. Construindo relacionamentos saudáveis: comunicação é a chave para resolver conflitos e fortalecer vínculos. Invista no diálogo aberto e na escuta ativa. #relacionamentos #psicologia #comunicação');

-- Inserir imagens dos posts
INSERT INTO post_images (post_id, url, ordem)
VALUES 
  (1, '/images/post1.jpg', 1),
  (1, '/images/post2.jpg', 2),
  (1, '/images/post3.jpg', 3),
  (2, '/images/post2.jpg', 1),
  (2, '/images/post3.jpg', 2),
  (3, '/images/post3.jpg', 1);

-- Inserir usuário administrativo inicial (senha: admin123)
INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Administrador', 'admin@cerqueirapsicologia.com.br', '$2a$10$8KsRftGhkUFHIPYJ6gQbB.wuWpCm4T3BUdAJDxTSuKP8HMIYm5k8a');

-- Trigger para gerar título automaticamente quando um post é inserido ou atualizado
CREATE TRIGGER IF NOT EXISTS generate_post_title
AFTER INSERT ON instagram_posts
FOR EACH ROW
WHEN NEW.titulo IS NULL
BEGIN
  UPDATE instagram_posts 
  SET titulo = CASE
    -- Extrai a primeira frase ou até 50 caracteres da legenda
    WHEN LENGTH(NEW.legenda) <= 50 THEN NEW.legenda
    WHEN INSTR(NEW.legenda, '.') > 0 AND INSTR(NEW.legenda, '.') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '.') - 1)
    WHEN INSTR(NEW.legenda, '!') > 0 AND INSTR(NEW.legenda, '!') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '!') - 1)
    WHEN INSTR(NEW.legenda, '?') > 0 AND INSTR(NEW.legenda, '?') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '?') - 1)
    ELSE SUBSTR(NEW.legenda, 1, 47) || '...'
  END
  WHERE id = NEW.id;
END;

-- Trigger para atualizar título quando a legenda é modificada
CREATE TRIGGER IF NOT EXISTS update_post_title
AFTER UPDATE OF legenda ON instagram_posts
FOR EACH ROW
BEGIN
  UPDATE instagram_posts 
  SET titulo = CASE
    -- Extrai a primeira frase ou até 50 caracteres da legenda
    WHEN LENGTH(NEW.legenda) <= 50 THEN NEW.legenda
    WHEN INSTR(NEW.legenda, '.') > 0 AND INSTR(NEW.legenda, '.') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '.') - 1)
    WHEN INSTR(NEW.legenda, '!') > 0 AND INSTR(NEW.legenda, '!') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '!') - 1)
    WHEN INSTR(NEW.legenda, '?') > 0 AND INSTR(NEW.legenda, '?') <= 50 
      THEN SUBSTR(NEW.legenda, 1, INSTR(NEW.legenda, '?') - 1)
    ELSE SUBSTR(NEW.legenda, 1, 47) || '...'
  END
  WHERE id = NEW.id;
END;