from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp

spark = SparkSession.builder \
    .appName("HDFS to Mongo") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.1.1") \
    .getOrCreate()

hdfs_path = "hdfs://namenode:9000/usr/binance/binance_prices.csv"

df = spark.read.option("header", "true").csv(hdfs_path)

df = df.withColumn("price", col("price").cast("double")) \
       .withColumn("timestamp", to_timestamp(col("timestamp")))

df.write.format("mongodb") \
    .mode("overwrite") \
    .option("spark.mongodb.write.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .option("database", "binance") \
    .option("collection", "prices_from_hdfs") \
    .save()

all_df = spark.read.format("mongodb") \
    .option("spark.mongodb.read.connection.uri", "mongodb://mongo:27017/binance.prices_from_hdfs") \
    .option("database", "binance") \
    .option("collection", "prices_from_hdfs") \
    .load()

all_df.show(truncate=False)

spark.stop()