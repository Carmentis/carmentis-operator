# Étape 1 : Builder
FROM node:24-alpine AS builder

# On est dans le workspace operator
WORKDIR /app



COPY . .

RUN npm install --no-audit --no-fund --prefer-offline
RUN npm run build

CMD ["npm", "run", "start"]
