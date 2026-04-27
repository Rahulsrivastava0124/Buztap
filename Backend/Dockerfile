# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first so Docker cache layer is reused on code changes
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -S buztap && adduser -S buztap -G buztap

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY package.json ./
COPY server.js ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Ensure the app directory is owned by the non-root user
RUN chown -R buztap:buztap /app

USER buztap

# Expose the API port (default 5000, overrideable via PORT env)
EXPOSE 5000

# Healthcheck — hits the info route every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
