# Étape 1, basée sur Node.js pour construire et compiler l'application Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2, basée sur Nginx pour avoir uniquement le contenu compilé pour servir avec Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist/tickly-frontend/browser /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
#EXPOSE 80
#
## Commande pour démarrer Nginx en premier plan (non en daemon)
#CMD ["nginx", "-g", "daemon off;"]
