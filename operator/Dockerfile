# Étape 1 : Builder
FROM node:20-alpine AS builder

# On est dans le workspace operator
WORKDIR /app

# update to npm 11
RUN npm i -g npm@11


COPY . .

RUN npm install --no-audit --no-fund --prefer-offline
RUN npm run build

CMD ["npm", "run", "start"]
