from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, min, max, lag, when, stddev
from pyspark.sql.window import Window
import requests
from datetime import datetime

mongo_uri = "mongodb://mongo:27017/binance.prices"

solid = ["BTCUSDT", "ETHUSDT"]
symbols = ["BTCUSDT","SHIBUSDT", "DOGEUSDT","TRUMPUSDT","ETHUSDT","PEPEUSDT","BONKUSDT", "PENGUUSDT"]

data = []
for symbol in symbols:
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    resp = requests.get(url).json()
    record = (resp["symbol"], float(resp["price"]), datetime.utcnow().isoformat())
    data.append(record)

spark = SparkSession.builder \
    .appName("BinanceToMongo") \
    .config("spark.mongodb.write.connection.uri", mongo_uri) \
    .getOrCreate()

df = spark.createDataFrame(data, ["symbol", "price", "timestamp"])
df = df.withColumn("category", when(col("symbol").isin(solid), "solid").otherwise("meme"))

window = Window.partitionBy("symbol").orderBy("timestamp")
df_with_variation = df.withColumn("previous_price", lag("price").over(window)) \
                      .withColumn("variation", col("price") - col("previous_price"))

summary_df = df.groupBy("symbol").agg(
    avg("price").alias("avg_price"),
    min("price").alias("min_price"),
    max("price").alias("max_price")
)

ranking_df = df_with_variation.groupBy("symbol") \
    .agg((max("price") - min("price")).alias("price_range")) \
    .filter(col("price_range") > 0) \
    .orderBy(col("price_range").desc())

category_summary = df.groupBy("category").agg(
    avg("price").alias("avg_price"),
    min("price").alias("min_price"),
    max("price").alias("max_price")
)

volatility_df = df_with_variation.groupBy("category").agg(
    stddev("variation").alias("volatility")
).filter(col("volatility").isNotNull())

summary_df.show()
ranking_df.show()
category_summary.show()
volatility_df.show()

summary_df.write.format("mongodb").mode("append").save()
ranking_df.write.format("mongodb").mode("append").save()
category_summary.write.format("mongodb").mode("append").save()
volatility_df.write.format("mongodb").mode("append").save()

spark.stop()
