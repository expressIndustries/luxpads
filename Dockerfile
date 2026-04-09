# Production build (Node 22) — Next.js standalone + Prisma migrate on boot
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
# postinstall runs prisma generate — schema not copied yet, so skip scripts here
RUN npm ci --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Optional: pass at image build so next.config can add S3/CDN hostnames to `images.remotePatterns`.
# Runtime env alone does not change an already-built Next.js image.
ARG AWS_BUCKET=
ARG AWS_DEFAULT_REGION=
ARG AWS_REGION=
ARG AWS_S3_PUBLIC_BASE_URL=
ARG NEXT_IMAGE_S3_HOSTS=
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV AWS_BUCKET=$AWS_BUCKET
ENV AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION
ENV AWS_REGION=$AWS_REGION
ENV AWS_S3_PUBLIC_BASE_URL=$AWS_S3_PUBLIC_BASE_URL
ENV NEXT_IMAGE_S3_HOSTS=$NEXT_IMAGE_S3_HOSTS
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
# Generate client; build does not need a live database
RUN npx prisma generate
RUN npm run build && sh scripts/sync-standalone-assets.sh

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl su-exec
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Prisma CLI + tsx for `prisma db seed` in the container
RUN npm install -g prisma@5.22.0 tsx

# Standalone bundle after sync-standalone-assets.sh includes public/ and .next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Entrypoint starts as root, chowns /app/public/uploads for volume mounts, then su-exec to nextjs.
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
