# Étape 1 : Builder
FROM node:20-alpine AS builder

# On est dans le workspace operator
WORKDIR /app


COPY . .

RUN npm install --production


RUN npm run build


# Étape 2 : Runner minimal
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app /app


CMD ["npm", "run", "start"]
