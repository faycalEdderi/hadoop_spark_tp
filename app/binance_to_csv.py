import requests
from datetime import datetime
import csv

symbols = ["BTCUSDT","SHIBUSDT", "DOGEUSDT","TRUMPUSDT","ETHUSDT","PEPEUSDT","BONKUSDT", "PENGUUSDT"]
data = []
for symbol in symbols:
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    resp = requests.get(url).json()
    record = (resp["symbol"], float(resp["price"]), datetime.utcnow().isoformat())
    data.append(record)

# Écriture dans un fichier CSV local
with open("binance_prices.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["symbol", "price", "timestamp"])
    writer.writerows(data)

print("Fichier binance_prices.csv créé avec succès.")
