from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, min, max, lag, when, stddev, to_timestamp
from pyspark.sql.window import Window
import requests
from datetime import datetime

mongo_uri_base = "mongodb://mongo:27017/binance"

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
    .config("spark.mongodb.write.connection.uri", mongo_uri_base) \
    .getOrCreate()

df = spark.createDataFrame(data, ["symbol", "price", "timestamp"]) \
    .withColumn("timestamp", to_timestamp(col("timestamp"))) \
    .withColumn("price", col("price").cast("double")) \
    .withColumn("category", when(col("symbol").isin(solid), "solid").otherwise("meme"))

df.write.format("mongodb") \
    .mode("append") \
    .option("collection", "prices") \
    .save()

all_df = spark.read.format("mongodb") \
    .option("uri", mongo_uri_base) \
    .option("collection", "prices") \
    .load() \
    .withColumn("price", col("price").cast("double")) \
    .withColumn("timestamp", to_timestamp(col("timestamp")))

window = Window.partitionBy("symbol").orderBy("timestamp")
df_with_variation = all_df.withColumn("previous_price", lag("price").over(window)) \
                          .withColumn("variation", col("price") - col("previous_price"))

summary_df = all_df.groupBy("symbol").agg(
    avg("price").alias("avg_price"),
    min("price").alias("min_price"),
    max("price").alias("max_price")
)

ranking_df = df_with_variation.groupBy("symbol") \
    .agg((max("price") - min("price")).alias("price_range")) \
    .filter(col("price_range") > 0) \
    .orderBy(col("price_range").desc())

category_summary = all_df.groupBy("category").agg(
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

summary_df.write.format("mongodb").mode("overwrite").option("collection", "summary").save()
ranking_df.write.format("mongodb").mode("overwrite").option("collection", "ranking").save()
category_summary.write.format("mongodb").mode("overwrite").option("collection", "category_summary").save()
volatility_df.write.format("mongodb").mode("overwrite").option("collection", "volatility").save()

spark.stop()
