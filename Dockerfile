FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV NITRO_PORT=80
ENV NITRO_HOST=0.0.0.0
COPY --from=build /app/.output ./.output
USER node
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s CMD wget -qO- http://localhost:80/ || exit 1
CMD ["node", ".output/server/index.mjs"]
