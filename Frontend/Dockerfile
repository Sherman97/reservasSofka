# ── Stage 1: Build ───────────────────────────────────────────
FROM docker.io/library/node:22-alpine3.21 AS builder

WORKDIR /app

# Copiar solo archivos de dependencias para cache de capas
COPY package.json package-lock.json* ./

RUN npm ci --ignore-scripts

# Copiar codigo fuente
COPY . .

# Variables de entorno de build (Vite las embebe en el bundle)
ARG VITE_API_URL=http://localhost
ARG VITE_BOOKINGS_URL=http://localhost
ARG VITE_BOOKINGS_WS_URL=ws://localhost/bookings/ws

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BOOKINGS_URL=${VITE_BOOKINGS_URL}
ENV VITE_BOOKINGS_WS_URL=${VITE_BOOKINGS_WS_URL}

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────
FROM docker.io/library/nginx:1.27-alpine3.21

# Eliminar config default
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracion personalizada
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Usuario no-root (nginx alpine ya trae el usuario nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=5s \
    CMD wget --spider -q http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]
