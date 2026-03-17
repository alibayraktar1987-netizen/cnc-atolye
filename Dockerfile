FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY *.html ./
COPY css ./css
COPY js ./js
COPY cost-estimator/frontend/dist ./cost-estimator/frontend/dist
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
