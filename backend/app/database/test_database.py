import mysql.connector

# 設定你的資料庫參數
db = mysql.connector.connect(
    host="database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",  # 把這裡換成你的 cluster endpoint
    user="admin",                  # 你剛剛設定的 master username
    password="happysing",             # 你剛剛設定的 master password
    database="mysql"                # 先連 mysql 系統資料庫，後面會建自己的
)

print("✅ 連線成功！")
