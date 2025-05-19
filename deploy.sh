#!/bin/bash
set -e  # Arrête le script si une commande échoue

echo "Mise à jour du code source..."
git pull

echo "Construction de l'image Docker..."
docker build --no-cache -t image-application .

echo "Vérification de l'existence du conteneur..."
if docker ps -a | grep -q conteneur-application; then
  echo "Arrêt du conteneur existant..."
  docker stop conteneur-application || true

  echo "Suppression du conteneur existant..."
  docker rm conteneur-application || true
fi

echo "Lancement du nouveau conteneur..."
docker run -d --name=conteneur-application -p 4200:80 --restart=unless-stopped image-application

echo "Déploiement terminé avec succès!"
echo "L'application est accessible à l'adresse: http://localhost:4200"
