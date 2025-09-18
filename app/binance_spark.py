from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lag, when, stddev
from pyspark.sql.window import Window
import requests
from datetime import datetime

mongo_uri = "mongodb://mongo:27017/binance"

solid = ["BTCUSDT", "ETHUSDT"]
symbols = ["BTCUSDT","SHIBUSDT","DOGEUSDT","TRUMPUSDT","ETHUSDT","PEPEUSDT","BONKUSDT", "PENGUUSDT"]

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

# sauvegarde du snapshot actuel
df.write.format("mongodb") \
    .mode("append") \
    .option("collection", "prices") \
    .save()

window = Window.partitionBy("symbol").orderBy("timestamp")
df_with_variation = df.withColumn("previous_price", lag("price").over(window)) \
                      .withColumn("variation", col("price") - col("previous_price"))

summary_df = df.withColumnRenamed("price", "avg_price") \
               .withColumn("min_price", col("avg_price")) \
               .withColumn("max_price", col("avg_price"))

ranking_df = df_with_variation.withColumn("price_range", col("variation"))

category_summary = df.groupBy("category").agg(
    col("price").alias("avg_price"),
    col("price").alias("min_price"),
    col("price").alias("max_price")
)

volatility_df = df_with_variation.groupBy("category").agg(
    stddev("variation").alias("volatility")
).filter(col("volatility").isNotNull())

summary_df.write.format("mongodb").mode("overwrite").option("collection", "summary").save()
ranking_df.write.format("mongodb").mode("overwrite").option("collection", "ranking").save()
category_summary.write.format("mongodb").mode("overwrite").option("collection", "category_summary").save()
volatility_df.write.format("mongodb").mode("overwrite").option("collection", "volatility").save()

spark.stop()
