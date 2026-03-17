FROM node:20-alpine AS estimator-build

WORKDIR /build/cost-estimator/frontend

COPY cost-estimator/frontend/package.json ./package.json
COPY cost-estimator/frontend/package-lock.json ./package-lock.json
RUN npm ci

COPY cost-estimator/frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

ENV PORT=10000
ENV API_UPSTREAM_HOSTPORT=api:8000

COPY *.html ./
COPY css ./css
COPY js ./js
COPY --from=estimator-build /build/cost-estimator/frontend/dist ./cost-estimator/frontend/dist
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
