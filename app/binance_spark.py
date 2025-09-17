from pyspark.sql import SparkSession
import requests
from datetime import datetime

symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]

data = []
for symbol in symbols:
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    resp = requests.get(url).json()
    record = (resp["symbol"], float(resp["price"]), datetime.utcnow().isoformat())
    data.append(record)

spark = SparkSession.builder \
    .appName("BinanceToMongo") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongodb:27017/binance.prices") \
    .getOrCreate()

df = spark.createDataFrame(data, ["symbol", "price", "timestamp"])

df.show()

df.write.format("mongodb").mode("append").save()

spark.stop()
