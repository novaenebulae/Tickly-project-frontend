# Étape 1: Build de l'application Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2: Création du serveur Nginx statique final
FROM nginx:1.27-alpine
# Copier l'application Angular compilée
COPY --from=build /app/dist/tickly-frontend/browser /usr/share/nginx/html/angular
# Copier la configuration Nginx qui sait servir Angular ET les fichiers statiques
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# Exposer le port interne du conteneur
EXPOSE 80

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
