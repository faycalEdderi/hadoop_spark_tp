import requests
from datetime import datetime
import csv

# Liste des symboles à récupérer
symbols = ["BTCUSDT","SHIBUSDT", "DOGEUSDT","TRUMPUSDT","ETHUSDT","PEPEUSDT","BONKUSDT", "PENGUUSDT"]
data = []
for symbol in symbols:
    url = "https://api.binance.com/api/v3/ticker/price?symbol={}".format(symbol)
    resp = requests.get(url).json()
    record = (resp["symbol"], float(resp["price"]), datetime.utcnow().isoformat())
    data.append(record)

# Écriture dans un fichier CSV local
csv_path = "/tmp/binance_prices.csv"  # Chemin standard pour un cluster Hadoop
with open(csv_path, "w") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["symbol", "price", "timestamp"])
    for row in data:
        writer.writerow(row)

print("Fichier {} cree avec succes.".format(csv_path))
# Commande à exécuter sur le cluster Hadoop pour copier dans HDFS :
print("hdfs dfs -mkdir -p /usr/binance && hdfs dfs -put -f {} /usr/binance/".format(csv_path))