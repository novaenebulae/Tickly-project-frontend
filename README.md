# Tickly - Application de Billetterie

## Présentation

Tickly est une plateforme moderne de gestion de billetterie développée avec Angular 19. Cette application permet la gestion complète des événements, la vente de billets, et le suivi des performances de vos événements via un tableau de bord intuitif.

## Fonctionnalités

- **Gestion des événements** : Créez, modifiez et supprimez des événements avec toutes les informations nécessaires.
- **Vente de billets** : Configurez différents types de billets.
- **QR Codes** : Génération et validation de billets via QR codes avec le module angularx-qrcode.
- **Tableau de bord analytique** : Visualisez les performances de vos événements avec Chart.js et ng2-charts.
- **Calendrier d'événements** : Planification visuelle avec angular-calendar.
- **Gestion des utilisateurs** : Différents niveaux d'accès (administrateurs, vendeurs, etc.).
- **Interface responsive** : Compatible avec tous les appareils grâce à Bootstrap 5.

## Prérequis

- Node.js (version LTS recommandée)
- npm (inclus avec Node.js)
- Angular CLI 19.2.5 ou supérieur

## Installation

1. Clonez le dépôt :
   ```bash
   git clone [URL_DU_REPO]
   cd tickly-frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez l'application en mode développement :
   ```bash
   npm start
   ```
   L'application sera accessible à l'adresse http://localhost:4200/

## Structure du projet

- `src/app/core` : Services, modèles, gardes et autres éléments fondamentaux
- `src/app/pages` : Composants de pages organisés par domaine (public, privé, auth)
- `src/app/shared` : Composants, directives et pipes réutilisables

## Scripts disponibles

- `npm start` : Lance le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm test` : Exécute les tests unitaires
- `npm run test-headless` : Exécute les tests unitaires sans ouvrir de navigateur
- `npm run watch` : Compile l'application en mode watch

## Déploiement

L'application peut être déployée avec Docker en utilisant le Dockerfile fourni :

```bash
# Construction de l'image
docker build -t tickly-frontend .

# Exécution du conteneur
docker run -p 80:80 tickly-frontend
```

Vous pouvez également utiliser le script de déploiement automatisé :

```bash
./deploy.sh
```

## Technologies principales

- **Framework** : Angular 19.2.0
- **État** : NgRx Store & Signals 19.1.0
- **UI/UX** : Angular Material 19.2.7, Bootstrap 5.3.3
- **Graphiques** : Chart.js 4.3.0, ng2-charts 8.0.0
- **Calendrier** : angular-calendar 0.31.1
- **QR Code** : angularx-qrcode 19.0.0
- **Authentification** : JWT (jwt-decode 4.0.0)
- **Utilitaires** : date-fns 4.1.0, uuid 11.1.0, rxjs 7.8.0
