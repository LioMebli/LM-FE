FROM node:24-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

# Declared after the dependency layers so that changing an address does not reinstall them.
ARG LM_API_BASE_URL
ARG LM_SITE_ORIGIN
ENV LM_API_BASE_URL=${LM_API_BASE_URL}
ENV LM_SITE_ORIGIN=${LM_SITE_ORIGIN}

COPY . .
RUN node tools/site-environment.mjs
RUN npx ng build
RUN node tools/site-artifacts.mjs

FROM nginx:1.29-alpine AS runtime

COPY --from=build /build/dist/LM-FE/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200/ || exit 1
