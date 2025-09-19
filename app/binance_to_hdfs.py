import requests
from datetime import datetime
import csv

# Liste des symboles à récupérer
symbols = ["BTCUSDT","SHIBUSDT", "DOGEUSDT","TRUMPUSDT","ETHUSDT","PEPEUSDT","BONKUSDT", "PENGUUSDT"]
data = []
for symbol in symbols:
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    resp = requests.get(url).json()
    record = (resp["symbol"], float(resp["price"]), datetime.utcnow().isoformat())
    data.append(record)

# Écriture dans un fichier CSV local
csv_path = "/tmp/binance_prices.csv"  # Chemin standard pour un cluster Hadoop
with open(csv_path, "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["symbol", "price", "timestamp"])
    writer.writerows(data)

print(f"Fichier {csv_path} créé avec succès.")

# Commande à exécuter sur le cluster Hadoop pour copier dans HDFS :
print(f"hdfs dfs -mkdir -p /user/binance && hdfs dfs -put -f {csv_path} /user/binance/")
