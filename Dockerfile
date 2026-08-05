FROM node:24-alpine AS build
WORKDIR /build

ARG NG_CONFIGURATION=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration=${NG_CONFIGURATION}

FROM nginx:1.29-alpine AS runtime

COPY --from=build /build/dist/LM-FE/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200/ || exit 1
