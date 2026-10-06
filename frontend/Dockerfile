FROM node:20-alpine
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Correr el servidor de desarrollo exponiendo el host para Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
