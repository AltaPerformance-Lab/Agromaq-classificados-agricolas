# 1. Usar uma imagem oficial do Node.js como base
FROM node:18-alpine

# Instala a versão correta do OpenSSL para o Alpine Linux atual
RUN apk add --no-cache openssl

# 2. Definir o diretório de trabalho dentro do contentor
WORKDIR /app

# 3. Copiar os ficheiros de dependências
COPY package*.json ./

# 4. Instalar as dependências do projeto
RUN npm install

# 5. Copiar o resto do código da sua aplicação
COPY . .

# --- CORREÇÃO: Gera o Prisma Client explicitamente ---
# Esta linha garante que o Prisma Client seja gerado com base no schema.prisma
# depois de todos os ficheiros terem sido copiados para o contentor.
RUN npx prisma generate

# 6. Expor a porta em que a aplicação Next.js corre
EXPOSE 3000

# 7. O comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "dev"]