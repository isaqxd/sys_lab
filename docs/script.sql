CREATE DATABASE sys_lab;
USE sys_lab;

-- ----------------------------------------------------
-- 1. ENTIDADES INDEPENDENTES
-- ----------------------------------------------------
CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(80) NOT NULL 
);

CREATE TABLE LABORATORIO (
    id_lab INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    localizacao VARCHAR(200),
    capacidade INTEGER NOT NULL,
    descricao VARCHAR(500)
);

CREATE TABLE EQUIPAMENTO (
    id_equipamento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500)
);

-- ----------------------------------------------------
-- 2. TABELA DE DOMÍNIO/STATUS (Não referencia a RESERVA)
-- ----------------------------------------------------
CREATE TABLE STATUS_RESERVA (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) UNIQUE NOT NULL
);
 
-- ----------------------------------------------------
-- 3. HORA_FUNCIONAMENTO (Depende de LABORATORIO)
-- ----------------------------------------------------
CREATE TABLE HORA_FUNCIONAMENTO (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FK_LABORATORIO_id_lab INT NOT NULL
);

ALTER TABLE HORA_FUNCIONAMENTO ADD CONSTRAINT FK_HORA_FUNCIONAMENTO_LAB
    FOREIGN KEY (FK_LABORATORIO_id_lab)
    REFERENCES LABORATORIO (id_lab)
    ON DELETE CASCADE; -- Mudei para CASCADE, se o LAB for deletado, seus horários também.

-- ----------------------------------------------------
-- 4. RESERVA (Depende de USUARIO, LABORATORIO e STATUS_RESERVA)
-- Agora pode ser criada antes de STATUS_RESERVA ser alterada.
-- ----------------------------------------------------
CREATE TABLE RESERVA (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    motivo VARCHAR(200),
    FK_USUARIO_id_usuario INT NOT NULL,
    FK_LABORATORIO_id_lab INT NOT NULL,
    FK_STATUS_RESERVA_id_status INT NOT NULL
);

ALTER TABLE RESERVA ADD CONSTRAINT FK_RESERVA_USUARIO
    FOREIGN KEY (FK_USUARIO_id_usuario)
    REFERENCES USUARIO (id_usuario)
    ON DELETE CASCADE;

ALTER TABLE RESERVA ADD CONSTRAINT FK_RESERVA_LABORATORIO
    FOREIGN KEY (FK_LABORATORIO_id_lab)
    REFERENCES LABORATORIO (id_lab)
    ON DELETE CASCADE;
    
ALTER TABLE RESERVA ADD CONSTRAINT FK_RESERVA_STATUS
    FOREIGN KEY (FK_STATUS_RESERVA_id_status)
    REFERENCES STATUS_RESERVA (id_status)
    ON DELETE RESTRICT;

-- ----------------------------------------------------
-- 5. LAB_EQUIPAMENTO (Tabela Associativa)
-- ----------------------------------------------------
CREATE TABLE LAB_EQUIPAMENTO (
    FK_EQUIPAMENTO_id_equipamento INT,
    FK_LABORATORIO_id_lab INT,
    PRIMARY KEY (FK_EQUIPAMENTO_id_equipamento, FK_LABORATORIO_id_lab)
);

ALTER TABLE LAB_EQUIPAMENTO ADD CONSTRAINT FK_LAB_EQUIPAMENTO_EQUIP
    FOREIGN KEY (FK_EQUIPAMENTO_id_equipamento)
    REFERENCES EQUIPAMENTO (id_equipamento)
    ON DELETE CASCADE;

ALTER TABLE LAB_EQUIPAMENTO ADD CONSTRAINT FK_LAB_EQUIPAMENTO_LAB
    FOREIGN KEY (FK_LABORATORIO_id_lab)
    REFERENCES LABORATORIO (id_lab)
    ON DELETE CASCADE;