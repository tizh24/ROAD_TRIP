# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /workspace

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
RUN --mount=type=cache,id=roadtrip-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm build

FROM build AS deploy-api-gateway
RUN pnpm --filter=api-gateway --prod deploy /opt/service

FROM build AS deploy-core-trip-service
RUN pnpm --filter=core-trip-service --prod deploy /opt/service

FROM build AS deploy-geo-location-service
RUN pnpm --filter=geo-location-service --prod deploy /opt/service

FROM build AS deploy-notification-worker
RUN pnpm --filter=notification-worker --prod deploy /opt/service

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
WORKDIR /app
USER node
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]

FROM runtime AS api-gateway
ENV PORT=4100
COPY --from=deploy-api-gateway --chown=node:node /opt/service ./
EXPOSE 4100

FROM runtime AS core-trip-service
ENV PORT=4101
COPY --from=deploy-core-trip-service --chown=node:node /opt/service ./
EXPOSE 4101

FROM runtime AS geo-location-service
ENV PORT=4102
COPY --from=deploy-geo-location-service --chown=node:node /opt/service ./
EXPOSE 4102

FROM runtime AS notification-worker
ENV PORT=4105
COPY --from=deploy-notification-worker --chown=node:node /opt/service ./
EXPOSE 4105
