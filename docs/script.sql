CREATE DATABASE sys_lab;
USE sys_lab;

-- ----------------------------------------------------
-- 1. ENTIDADES INDEPENDENTES
-- ----------------------------------------------------
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(80) NOT NULL
);

CREATE TABLE sala (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    capacidade INT NOT NULL,
    tipo_sala VARCHAR(30) NOT NULL,
    localizacao VARCHAR(100) NOT NULL
);

CREATE TABLE recurso (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nome_recurso VARCHAR(50) NOT NULL
);

CREATE TABLE horario_disponivel (
    id_horario_disponivel INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL
);
-- ----------------------------------------------------
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    data_reserva DATE NOT NULL,
    fk_usuario_id INT NOT NULL,
    fk_sala_id INT NOT NULL,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id_usuario),
    FOREIGN KEY (fk_sala_id) REFERENCES sala(id_sala)
);

-- ----------------------------------------------------
-- 3. RELACIONAMENTOS
-- ----------------------------------------------------
CREATE TABLE sala_recurso (
    fk_sala_id INT,
    fk_recurso_id INT,
    PRIMARY KEY (fk_sala_id, fk_recurso_id),
    FOREIGN KEY (fk_sala_id) REFERENCES sala(id_sala),
    FOREIGN KEY (fk_recurso_id) REFERENCES recurso(id_recurso)
);

CREATE TABLE slot_reserva (
    id_slot_reserva INT AUTO_INCREMENT PRIMARY KEY,
    fk_reserva_id INT,
    fk_horario_disponivel_id INT,
    FOREIGN KEY (fk_reserva_id) REFERENCES reserva(id_reserva),
    FOREIGN KEY (fk_horario_disponivel_id) REFERENCES horario_disponivel(id_horario_disponivel)
);
