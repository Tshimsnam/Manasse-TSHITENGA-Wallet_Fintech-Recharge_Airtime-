Wallet Fintech + Recharge Airtime

1. Description du projet:

Une application de portefeuille électronique permettant aux utilisateurs de :

- Recharger leur solde
- Transférer de l'argent à d'autres utilisateurs
- Acheter des forfaits (airtime/data)
- Suivre l’historique de leurs transactions

2. Technologies utilisées

  Backend:
- Laravel 11
- Laravel Sanctum – Authentification sécurisée via token
- MySQL – Base de données relationnelle
- Eloquent ORM – Modélisation des données
- Swagger – Documentation interactive de l'API

 Frontend:
- Next.js
- React
- Axios – Pour les appels API
- Tailwind CSS – Pour le style

3. Instructions pour installation et exécution:
    1. Cloner le projet
    bash:
    - git clone https://github.com/Tshimsnam/Manasse-TSHITENGA-Wallet_Fintech-Recharge_Airtime-.git

    2.  Structure du projet
        Manasse-TSHITENGA-Wallet_Fintech-Recharge_Airtime-
        /server
            └── app, routes, database...
        /client
            └── pages, components, styles...

    3. Installation Backend (Laravel)
        - cd Manasse-TSHITENGA-Wallet_Fintech-Recharge_Airtime-
        - cd server
        - composer install
        - cp .env.example .env
        - php artisan key:generate
    4. Configure le fichier .env (connexion DB)
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=wallet_db
        DB_USERNAME=root
        DB_PASSWORD=

    5. générer le seeder:
        php artisan migrate --seed

    6. lancer le server
        php artisan serve

    7. Installation Frontend (Next.js)
        - cd .. // pour sortir du repertoire server
        - cd client // acceder a la parti front
        - npm install
        - npm run dev

- Le frontend démarre sur http://localhost:3000
- Le backend démarre sur http://localhost:8000

4. Authentification avec Sanctum
    - Les utilisateurs s’authentifient avec leur phone/mot de passe.
    - Les routes protégées nécessitent un token Bearer (ex:Authorization: Bearer VOTRE_TOKEN_SANCTUM) 

5. Endpoints API

| Méthode | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/api/register`         | Inscription                          |
| POST   | `/api/login`            | Connexion                            |
| GET    | `/api/wallet/balance`   | Voir le solde                        |
| POST   | `/api/wallet/recharge`  | Recharger le compte                  |
| POST   | `/api/transfer`         | Transférer de l'argent               |
| GET    | `/api/transactions`     | Historique des transactions          |
| GET    | `/api/plans`            | Liste des forfaits disponibles       |
| POST   | `/api/purchase`         | Acheter un forfait                   |


- Tu peux utiliser Thunder Client ou Postman pour tester l'API.

6. Documentation APIs avec swagger:
    - en localhost: http://localhost:8000/api/documentation
    - en ligne : https://wallet.vivicorp.net/api/documentation

7. Tests
- Des tests unitaires sont inclus pour les principales fonctionnalités de l'API
Lancer les tests :
bash:
- php artisan test

8. Architecture fonctionnelle ainsi qu’un diagramme ER
    a la racine du project vous trouverez:
    - Diagramme ER.drawio.pdf
    - Architecture fonctionnelle.png

9. Deploiement du système
    1. frontend: https://pronextjs1.vercel.app sur Vercel
    2. backend: https://wallet.vivicorp.net/ sur Cpannel


Contact:
Développé par TSHITENGA TSHIMANGA Manassé
Email : manassetshims@gmail.com



