import mysql.connector

# 連線
db = mysql.connector.connect(
    host="database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",
    user="admin",
    password="happysing",
    port=3306,
    database="s3images"  # 指定 database
)

cursor = db.cursor()

# 查詢全部資料
cursor.execute("SELECT * FROM images;")
rows = cursor.fetchall()

for row in rows:
    print(row)

# 關閉
cursor.close()
db.close()
