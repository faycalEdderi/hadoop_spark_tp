from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp

# Création de la session Spark
spark = SparkSession.builder \
    .appName("HDFS to Mongo") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.1.1") \
    .getOrCreate()

# === 1. Lecture du CSV depuis HDFS ===
hdfs_path = "hdfs://namenode:9000/usr/binance/binance_prices.csv"

df = spark.read.option("header", "true").csv(hdfs_path)

# Convertir les colonnes utiles
df = df.withColumn("price", col("price").cast("double")) \
       .withColumn("timestamp", to_timestamp(col("timestamp")))

# === 2. Écriture dans MongoDB ===
df.write.format("mongodb") \
    .mode("overwrite") \
    .option("spark.mongodb.write.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .option("database", "binance") \
    .option("collection", "prices_from_hdfs") \
    .save()

# === 3. Lecture depuis MongoDB (pour test) ===
all_df = spark.read.format("mongodb") \
    .option("spark.mongodb.read.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .option("database", "binance") \
    .option("collection", "prices_from_hdfs") \
    .load()

all_df.show(truncate=False)

spark.stop()