# Étape 1 : Builder
FROM node:20-alpine AS builder

# On est dans le workspace operator
WORKDIR /app



COPY . .

# update to npm 11
RUN npm i -g npm@11
RUN npm install --no-audit --no-fund
RUN npm run build

CMD ["npm", "run", "start"]
