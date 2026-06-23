# syntax=docker/dockerfile:1
# ---- build stage: install all deps, generate Prisma client, compile Nest ----
FROM node:24-alpine AS build
WORKDIR /app
# Prisma needs OpenSSL on Alpine to pick the right query engine.
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
# Bring over installed deps (incl. the generated Prisma client + CLI), the
# compiled output, and the schema/migrations needed by `migrate deploy`.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
# Drop dev-only deps (Nest CLI, ts toolchain, jest) to slim the runtime image.
# Keeps prisma + @prisma/client (both prod deps) and the generated engine.
RUN npm prune --omit=dev
# Run as the image's built-in unprivileged user.
USER node
EXPOSE 3001
# Apply any pending migrations, then start. `migrate deploy` is a no-op when the
# DB is already up to date.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
