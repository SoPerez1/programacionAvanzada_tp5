-- Se ejecuta automaticamente UNA SOLA VEZ, cuando Postgres crea el volumen por primera vez
-- (carpeta especial docker-entrypoint-initdb.d). Si ya existe el volumen, este script
-- no se vuelve a correr aunque reinicies los contenedores.

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    summary VARCHAR(255),
    description TEXT,
    priority VARCHAR(50),
    reporter VARCHAR(255),
    assignee VARCHAR(255),
    precondition TEXT,
    closed_at DATE,
    sprint VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Datos de ejemplo
INSERT INTO tasks (project_name, activity_type, status, summary, description, priority, reporter, assignee, precondition, closed_at, sprint) VALUES
    ('Sistema Académico', 'Feature', 'Finalizada', 'Crear módulo de alumnos', 'Se debe crear el ABM completo de alumnos.', 'Alta', 'Juan Perez', 'Maria Garcia', 'La BD debe estar inicializada', '2026-09-28', 'Sprint 1'),
    ('Gestor de Tareas', 'Bug', 'Pendiente', 'Falla en el login', 'Al ingresar credenciales inválidas tira error 500.', 'Media', 'Tester 1', 'Ernesto L', 'Tener credenciales inválidas', NULL, 'Sprint 2');
