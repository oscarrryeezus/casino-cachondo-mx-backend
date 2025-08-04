# backend/Dockerfile
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto (ajusta si usas otro)
EXPOSE 3002

# Comando para iniciar el backend
CMD ["node", "src/server.js"]
