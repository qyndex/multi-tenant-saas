FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate

# Build-time env vars (defaults for Docker build — override at runtime)
ARG NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
