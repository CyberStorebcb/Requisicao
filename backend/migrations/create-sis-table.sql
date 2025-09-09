-- Criação da tabela sis_registros para armazenar os dados da planilha/imagem
CREATE TABLE IF NOT EXISTS sis_registros (
  id SERIAL PRIMARY KEY,
  cidade VARCHAR(100),
  si VARCHAR(50),
  cp VARCHAR(50),
  cliente VARCHAR(100),
  encarregado VARCHAR(100),
  avisado VARCHAR(50),
  razao VARCHAR(200),
  programado VARCHAR(100),
  levantado VARCHAR(100),
  data1 DATE,
  data2 DATE,
  status VARCHAR(50),
  responsavel VARCHAR(100),
  anexo_nome VARCHAR(255),
  anexo_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
