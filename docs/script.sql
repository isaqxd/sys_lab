-- 1. CRIAÇÃO DO BANCO DE DADOS
CREATE DATABASE IF NOT EXISTS sys_lab;
USE sys_lab;

-- 2. TABELA USUARIO (Professor / Admin)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('PROFESSOR', 'ADMIN') NOT NULL DEFAULT 'PROFESSOR',
    status_usuario BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. TABELA SALA
CREATE TABLE sala (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    capacidade INT NOT NULL,
    status ENUM('DISPONIVEL', 'MANUTENCAO', 'OCUPADA', 'DESATIVADA') NOT NULL DEFAULT 'DISPONIVEL'
);

-- 4. TABELA RECURSO (projetor, TV, AC...)
CREATE TABLE recurso (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL
);

-- 5. TABELA SALA_RECURSO (N:N entre sala e recurso)
CREATE TABLE sala_recurso (
    fk_sala INT NOT NULL,
    fk_recurso INT NOT NULL,
    PRIMARY KEY (fk_sala, fk_recurso),
    FOREIGN KEY (fk_sala) REFERENCES sala(id_sala) ON DELETE CASCADE,
    FOREIGN KEY (fk_recurso) REFERENCES recurso(id_recurso) ON DELETE CASCADE
);

-- 6. TABELA HORARIO (Turnos fixos)
CREATE TABLE horario (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    turno ENUM('MANHA', 'TARDE', 'NOITE') UNIQUE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL
);

-- 7. TABELA RESERVA
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT NOT NULL,
    fk_sala INT NOT NULL,
    fk_horario INT NOT NULL,
    data_reserva DATE NOT NULL,
    motivo VARCHAR(255),

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('CONFIRMADA', 'CANCELADA', 'EXPIRADA') DEFAULT 'CONFIRMADA',

    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (fk_sala) REFERENCES sala(id_sala),
    FOREIGN KEY (fk_horario) REFERENCES horario(id_horario),

    -- impede conflito de sala no turno
    UNIQUE KEY unq_reserva (fk_sala, fk_horario, data_reserva),
    -- impede um professor reservar 2 salas no mesmo horário (RN3)
    UNIQUE KEY unq_professor_turno (fk_usuario, fk_horario, data_reserva)
);

-- 8. TABELA AUDITORIA
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,
    acao VARCHAR(50),
    descricao TEXT,
    data_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

-- 9. CARGA INICIAL DOS TURNOS FIXOS
INSERT INTO horario (turno, hora_inicio, hora_fim) VALUES
('MANHA', '09:00:00', '12:00:00'),
('TARDE', '13:00:00', '18:00:00'),
('NOITE', '19:00:00', '22:00:00');