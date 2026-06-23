# syntax=docker/dockerfile:1
# ---- build stage: install deps and build the Next.js app ----
# Debian/glibc base (NOT alpine): the committed package-lock.json was resolved on
# glibc, so it omits the musl-only wasm fallback deps (@emnapi/*) that `npm ci`
# would demand under alpine — an alpine build fails the lockfile-sync check.
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so the
# API base must be supplied here (not just at runtime).
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Produces .next/standalone (minimal server + traced deps) and .next/static.
RUN npm run build

# ---- runtime stage ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Standalone server bundle, static assets, and public/ are all `next start` needs.
# (`node` is the image's built-in unprivileged user, uid 1000.)
COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
