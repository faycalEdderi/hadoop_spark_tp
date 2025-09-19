🚀 Projet Big Data — Analyse des cryptomonnaies via Spark, HDFS & MongoDB

> Pipeline complet :
> Binance → Python → HDFS → Spark → MongoDB → Express → React
>
> Visualisation des prix, volatilité, et comparaison entre cryptos "solid" (BTC, ETH) et "meme" (DOGE, SHIB, PEPE, etc.)

🎯 Objectif du projet

Ce projet met en œuvre un pipeline de données complet dans un environnement Big Data Dockerisé :

1. Récupération des prix en temps réel depuis l’API Binance.
2. Stockage dans HDFS via un script Python.
3. Traitement avec Spark (agrégations, calculs de volatilité, classement).
4. Écriture des résultats dans MongoDB.
5. Exposition via une API Express.
6. Visualisation interactive avec React + Recharts.

🧩 Architecture

┌────────────┐     ┌────────┐     ┌────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│   Binance  │────>│ Python │────>│  HDFS  │────>│  Spark  │────>│ MongoDB  │<───>│ Express │
└────────────┘     └────────┘     └────────┘     └─────────┘     └──────────┘     └─────────┘
                                                                                       │
                                                                                       ▼
                                                                                 ┌────────────┐
                                                                                 │   React    │
                                                                                 │ Dashboard  │
                                                                                 └────────────┘

🛠️ Technologies utilisées

- Python : Scripts de récupération et d’ingestion
- Hadoop HDFS : Stockage distribué des données brutes
- Apache Spark : Traitement distribué, calculs statistiques
- MongoDB : Stockage des résultats agrégés
- Express.js : API REST pour exposer les données
- React + Recharts : Dashboard de visualisation
- Docker & Docker Compose : Environnement conteneurisé complet

📂 Structure du projet

├── docker-compose.yml          # Orchestration des services
├── app/                        # Scripts Spark
│   ├── binance_spark.py        # Collecte + traitement Spark → MongoDB
│   └── hdfs_to_mongo.py        # Lecture HDFS → écriture MongoDB
├── myhadoop/                   # Scripts Hadoop/Python
│   ├── binance_to_hdfs.py      # Récupère Binance → écrit CSV → envoie dans HDFS
│   └── ...
├── backend/                    # API Express
│   ├── server.js               # Routes vers MongoDB
│   └── .env                    # Config MongoDB
├── frontend/                   # Dashboard React
│   └── src/App.js              # Visualisations (tableaux, graphiques)
└── README.txt                  # Ce fichier

⚙️ Prérequis

- Docker + Docker Compose
- Accès Internet (API Binance)
- Navigateur moderne (pour le frontend)

🚀 Lancer le projet

1. Démarrer l’environnement

docker-compose up -d

Services démarrés :
- namenode, datanode, resourcemanager, nodemanager → Hadoop
- spark-master, spark-worker-1 → Spark
- mongo → MongoDB
- (Backend et frontend à lancer manuellement — voir plus bas)

2. Ingestion des données → HDFS

# Copier le script dans le conteneur
docker cp ./myhadoop/binance_to_hdfs.py namenode:/myhadoop/

# Lancer le script (installe Python 3.5 si nécessaire)
docker exec namenode python3 /myhadoop/binance_to_hdfs.py

# Copier-coller la commande HDFS affichée, ex:
docker exec namenode hdfs dfs -mkdir -p /usr/binance && hdfs dfs -put -f /tmp/binance_prices.csv /usr/binance/

3. Traitement Spark → MongoDB

# Script 1 : Données directes Binance → MongoDB
docker cp ./app/binance_spark.py spark-master:/app/
docker exec -it spark-master /spark/bin/spark-submit \
  --packages org.mongodb.spark:mongo-spark-connector_2.12:10.1.1 \
  /app/binance_spark.py

# Script 2 : Données HDFS → MongoDB (preuve du pipeline)
docker cp ./app/hdfs_to_mongo.py spark-master:/app/
docker exec -it spark-master /spark/bin/spark-submit \
  --packages org.mongodb.spark:mongo-spark-connector_2.12:10.1.1 \
  /app/hdfs_to_mongo.py

4. Lancer le backend (Express)

cd backend
npm install
npm start
# → Écoute sur http://localhost:5000

5. Lancer le frontend (React)

cd frontend
npm install
npm start
# → Ouvre automatiquement http://localhost:3000

📊 Fonctionnalités du Dashboard

- ✅ Tableau des prix moyens, min, max par crypto
- ✅ Comparaison catégorielle (solid vs meme)
- ✅ Classement par amplitude de prix
- ✅ Graphique de volatilité par catégorie
- ✅ Scatter plots avancés (prix moyen vs amplitude)
- ✅ NOUVEAU : Tableau des données provenant de HDFS → preuve du pipeline complet

🧪 Collections MongoDB générées

| Collection            | Description                                  |
|-----------------------|----------------------------------------------|
| prices                | Données brutes depuis Binance                |
| summary               | Statistiques par symbole (avg/min/max)       |
| ranking               | Classement par amplitude de prix             |
| category_summary      | Statistiques par catégorie (solid/meme)      |
| volatility            | Écart-type des variations par catégorie      |
| prices_from_hdfs      | Données chargées depuis HDFS → preuve du pipeline |

💡 Idées d’amélioration

- Ajouter un scheduler (cron) pour la collecte automatique
- Intégrer Kafka + Spark Streaming pour du temps réel
- Ajouter des alertes (prix seuil, volatilité anormale)
- Export CSV/PDF des rapports
- Dark mode / thèmes personnalisables


Projet réalisé dans le cadre du cours Hadoop/Spark — IPSSI

📄 Licence

Projet éducatif — Libre d’utilisation pour l’apprentissage.