# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first so Docker cache layer is reused on code changes
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

LABEL maintainer="buztap" \
      version="1.0.0" \
      description="BuzTap Backend API"

# Create non-root user for security
RUN addgroup -S buztap && adduser -S buztap -G buztap

# Ensure proper signal handling in containers (especially under compose)
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY package.json ./
COPY server.js ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Create logs directory required by apiAudit middleware
RUN mkdir -p logs

# Ensure the app directory is owned by the non-root user
RUN chown -R buztap:buztap /app

USER buztap

# Expose the API port (default 5000, overrideable via PORT env)
EXPOSE 5000

# Healthcheck — uses node so Docker SIGTERM (exit 143) can't kill wget mid-check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const p=process.env.PORT||5000;const r=require('http').get({hostname:'localhost',port:p,path:'/api/health',timeout:8000},(res)=>process.exit(res.statusCode===200?0:1));r.on('error',()=>process.exit(1));r.on('timeout',()=>{r.destroy();process.exit(1)});"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
