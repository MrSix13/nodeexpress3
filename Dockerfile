# Usa una imagen base oficial de Node.js
FROM node:18

# Instala pnpm globalmente
RUN npm install -g pnpm

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias usando pnpm
RUN pnpm install

# Copia solo la carpeta src
COPY src/ ./src

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 7001

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]
