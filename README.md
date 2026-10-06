# Practica 02 - TODO App Fullstack (React + Node + Postgres) con Docker

## Objetivo

Extender la practica 01 (API en memoria) para crear una aplicación *Fullstack* completa:
- **Backend**: API REST en Node/Express.
- **Frontend**: SPA en React creada con Vite, con un diseño premium moderno (glassmorphism, modo oscuro).
- **Base de Datos**: Postgres para persistencia real.

Todo el ecosistema corre sobre Docker Compose: un contenedor para la API, uno para la Base de Datos, y uno para el Frontend.

Al terminar esta practica vas a poder:

- Levantar un entorno multi-contenedor con `docker compose up`
- Explicar por qué los contenedores se pueden comunicar entre sí por sus nombres de servicio (ej. `db` o `api`).
- Conectar una aplicación React a un Backend Dockerizado.
- Usar el driver `pg` con queries parametrizadas.

## Estructura

```text
02-todo-api-postgres/
├── db/
│   └── init.sql         # Se ejecuta una sola vez al crear el volumen de Postgres
├── frontend/            # Aplicación React (Vite)
│   ├── src/             # Código fuente de React
│   ├── Dockerfile       # Imagen del Frontend
│   └── package.json     
├── db.js                # Pool de conexion a Postgres (Backend)
├── server.js            # API Express
├── Dockerfile           # Imagen de la API
├── docker-compose.yml   # Orquesta API + Postgres + Frontend
├── .env.example         # Copiar a .env y ajustar si hace falta
├── .dockerignore
└── package.json
```

## Como correr

1. Copiar las variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Levantar todo (construye las imágenes de API y Frontend, y descarga Postgres):

   ```bash
   docker compose up --build
   ```

3. **Acceder a las aplicaciones**:
   - 🎨 **Frontend (UI)**: [http://localhost:5173](http://localhost:5173)
   - ⚙️ **Backend (API)**: [http://localhost:3001/tasks](http://localhost:3001/tasks)
   - 🗄️ **Base de datos**: Postgres queda expuesto en `localhost:5433` (u otro puerto configurado en `docker-compose.yml`) por si quieres conectarte con `psql`, DBeaver, etc.

4. Para parar todo:

   ```bash
   docker compose down
   ```

   Los datos quedan guardados en el volumen `todo_pgdata` (sobreviven a esto).
   Para borrar también los datos de Postgres:

   ```bash
   docker compose down -v
   ```

## Probar los endpoints directamente

Aunque ahora tenemos interfaz gráfica, la API sigue respondiendo a HTTP puro:

```bash
curl http://localhost:3001/tasks
curl http://localhost:3001/tasks/1

# Crear una tarea
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"project_name":"Test CLI","summary":"probando"}'
```

## Troubleshooting

- **Puerto ya en uso**: si tienes Postgres o algo corriendo localmente en el puerto 5432 o 3001 o 5173, cambia el mapeo de puertos en `docker-compose.yml`.
- **La API intenta conectarse antes de que la base este lista**: el `healthcheck` de `db` + `depends_on: condition: service_healthy` en `api` están pensados justo para evitar esto. Si igual falla, vuelve a correr `docker compose up`.
- **Cambios en `server.js` o `App.jsx` no se reflejan**: la imagen se construye una sola vez; después de editar el código hay que correr `docker compose up --build` de nuevo. 
- **`init.sql` no crea la tabla**: ese script solo corre la primera vez que se crea el volumen. Si ya habías levantado el proyecto antes, borra el volumen (`docker compose down -v`) y vuelve a levantar.
